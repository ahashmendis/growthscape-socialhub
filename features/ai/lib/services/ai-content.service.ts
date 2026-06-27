import { prisma } from "@/lib/db/client";
import { generateChat, getProviderConfig, type ChatMessage } from "@/packages/ai";
import { AppError } from "@/lib/api/errors";

const CONTENT_PROMPTS: Record<string, string> = {
  caption: "Write a social media caption. Keep it engaging and include relevant hashtags.",
  hook: "Write a hook (opening line) that grabs attention in the first 3 seconds.",
  hashtags: "Generate relevant hashtags for social media. Return only hashtags, one per line.",
  title: "Write a compelling title for a social media post or video.",
  thread: "Write a Twitter/X thread (5-7 tweets) on the given topic.",
  cta: "Write a call-to-action that encourages engagement.",
  script: "Write a video script with clear sections: hook, body, CTA.",
  seo: "Write SEO-optimized description and tags for a YouTube video.",
};

export const aiContentService = {
  async generateContent(
    userId: string,
    workspaceId: string | null,
    params: {
      prompt: string;
      contentType: string;
      brandId?: string | null;
      provider?: string;
      context?: string;
    }
  ) {
    const provider = params.provider || "google";
    const config = getProviderConfig(provider as any);
    if (!config) throw new AppError("AI_PROVIDER_ERROR", `${provider} not configured`);

    // Build system prompt with brand context
    let systemPrompt = CONTENT_PROMPTS[params.contentType] || CONTENT_PROMPTS.caption;

    if (params.brandId) {
      const persona = await prisma.brandPersona.findUnique({ where: { brandId: params.brandId } });
      if (persona) {
        systemPrompt += `\n\nBrand voice: ${persona.tone.join(", ")}`;
        if (persona.audience) systemPrompt += `\nAudience: ${persona.audience}`;
        if (persona.writingStyle) systemPrompt += `\nStyle: ${persona.writingStyle}`;
        if (persona.brandGuidelines) systemPrompt += `\nGuidelines: ${persona.brandGuidelines}`;
        if (persona.prohibitedTopics?.length) systemPrompt += `\nAvoid topics: ${persona.prohibitedTopics.join(", ")}`;
      }
    }

    if (params.context) systemPrompt += `\n\nContext: ${params.context}`;

    const messages: ChatMessage[] = [
      { role: "user", content: params.prompt },
    ];

    const response = await generateChat(config, messages, systemPrompt);

    // Log usage
    await prisma.aIUsage.create({
      data: {
        userId,
        workspaceId: workspaceId || undefined,
        provider: response.provider,
        model: response.model,
        feature: "content-generation",
        inputTokens: response.inputTokens,
        outputTokens: response.outputTokens,
        latencyMs: response.latencyMs,
        estimatedCost: estimateCost(response.provider, response.inputTokens, response.outputTokens),
      },
    });

    return {
      content: response.content,
      model: response.model,
      provider: response.provider,
      inputTokens: response.inputTokens,
      outputTokens: response.outputTokens,
    };
  },

  async generateIdeas(
    userId: string,
    workspaceId: string | null,
    params: {
      brandId?: string | null;
      topic?: string;
      platform?: string;
      count?: number;
      provider?: string;
    }
  ) {
    const provider = params.provider || "google";
    const config = getProviderConfig(provider as any);
    if (!config) throw new AppError("AI_PROVIDER_ERROR", `${provider} not configured`);

    let systemPrompt = `Generate ${params.count || 5} content ideas`;
    if (params.platform) systemPrompt += ` for ${params.platform}`;
    if (params.topic) systemPrompt += ` about ${params.topic}`;
    systemPrompt += ". Return each idea as a brief title with a one-sentence description.";

    if (params.brandId) {
      const persona = await prisma.brandPersona.findUnique({ where: { brandId: params.brandId } });
      if (persona?.tone.length) systemPrompt += `\n\nBrand voice: ${persona.tone.join(", ")}`;
    }

    const messages: ChatMessage[] = [{ role: "user", content: "Generate ideas" }];
    const response = await generateChat(config, messages, systemPrompt);

    // Create content ideas in database
    const ideas = response.content
      .split("\n")
      .filter((line) => line.trim())
      .slice(0, params.count || 5)
      .map((idea) => ({
        workspaceId: workspaceId || undefined,
        brandId: params.brandId || undefined,
        title: idea.trim().replace(/^[\d.\-\*]+\s*/, "").slice(0, 200),
      }));

    const created = await Promise.all(
      ideas.map((idea) =>
        prisma.contentIdea.create({
          data: {
            workspaceId: idea.workspaceId || null,
            brandId: idea.brandId || null,
            title: idea.title,
            generatedBy: "AI_GENERATED",
            source: "AI_GENERATED",
            confidence: 0.7,
          },
        })
      )
    );

    // Log usage
    await prisma.aIUsage.create({
      data: {
        userId,
        workspaceId: workspaceId || undefined,
        provider: response.provider,
        model: response.model,
        feature: "idea-generation",
        inputTokens: response.inputTokens,
        outputTokens: response.outputTokens,
        latencyMs: response.latencyMs,
        estimatedCost: estimateCost(response.provider, response.inputTokens, response.outputTokens),
      },
    });

    return created;
  },
};

function estimateCost(provider: string, inputTokens: number, outputTokens: number): number {
  const rates: Record<string, { input: number; output: number }> = {
    openai: { input: 2.50, output: 10.00 },
    anthropic: { input: 3.00, output: 15.00 },
    google: { input: 0.35, output: 1.05 },
    openrouter: { input: 0.50, output: 1.00 },
  };
  const rate = rates[provider] || { input: 1, output: 2 };
  return ((inputTokens / 1_000_000) * rate.input + (outputTokens / 1_000_000) * rate.output);
}
