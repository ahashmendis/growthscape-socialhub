import { prisma } from "@/lib/db/client";
import { generateChat, getProviderConfig, type AIConfig, type ChatMessage, type AIProvider } from "@/packages/ai";
import { AppError } from "@/lib/api/errors";

export const aiService = {
  async chat(
    sessionId: string | null,
    messages: ChatMessage[],
    provider: AIProvider,
    model?: string,
    systemPrompt?: string
  ) {
    const config = getProviderConfig(provider);
    if (!config) throw new AppError("AI_PROVIDER_ERROR", `${provider} API key not configured`);
    if (model) config.model = model;

    const response = await generateChat(config, messages, systemPrompt);

    // Log usage
    await prisma.aIUsage.create({
      data: {
        provider: response.provider,
        model: response.model,
        feature: "chat",
        inputTokens: response.inputTokens,
        outputTokens: response.outputTokens,
        latencyMs: response.latencyMs,
        estimatedCost: estimateCost(response.provider, response.inputTokens, response.outputTokens),
      },
    });

    return response;
  },

  async generateContent(
    prompt: string,
    brandId: string | null,
    contentType: string,
    provider: AIProvider
  ) {
    const config = getProviderConfig(provider);
    if (!config) throw new AppError("AI_PROVIDER_ERROR", `${provider} API key not configured`);

    // Get brand persona for context
    let systemPrompt = "You are an expert social media content creator.";
    if (brandId) {
      const persona = await prisma.brandPersona.findUnique({ where: { brandId } });
      if (persona) {
        systemPrompt = `Create content for a brand with this persona:\n`;
        systemPrompt += `Tone: ${persona.tone.join(", ")}\n`;
        systemPrompt += `Audience: ${persona.audience || "general"}\n`;
        systemPrompt += `Style: ${persona.writingStyle || "engaging"}\n`;
        if (persona.brandGuidelines) systemPrompt += `Guidelines: ${persona.brandGuidelines}\n`;
      }
    }

    const messages: ChatMessage[] = [{ role: "user", content: `${contentType}: ${prompt}` }];
    return generateChat(config, messages, systemPrompt);
  },

  async getRecommendations(workspaceId: string) {
    return prisma.aIRecommendation.findMany({
      where: {
        workspaceId,
        status: "NEW",
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } },
        ],
      },
      orderBy: [{ priority: "desc" }, { generatedAt: "desc" }],
      take: 20,
    });
  },

  async generateRecommendations(workspaceId: string) {
    // This would be handled by an Inngest job in production
    return { message: "Recommendations queued for generation" };
  },

  async getUsage(workspaceId: string, days = 30) {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const usage = await prisma.aIUsage.groupBy({
      by: ["provider", "feature"],
      where: { workspaceId, createdAt: { gte: since } },
      _sum: { inputTokens: true, outputTokens: true, estimatedCost: true },
      _count: true,
    });

    const total = await prisma.aIUsage.aggregate({
      where: { workspaceId, createdAt: { gte: since } },
      _sum: { estimatedCost: true },
    });

    return { breakdown: usage, total: total._sum.estimatedCost || 0 };
  },
};

function estimateCost(provider: string, inputTokens: number, outputTokens: number): number {
  const rates: Record<string, { input: number; output: number }> = {
    openai: { input: 2.50, output: 10.00 }, // per 1M tokens, USD
    anthropic: { input: 3.00, output: 15.00 },
    google: { input: 0.35, output: 1.05 },
    openrouter: { input: 0.50, output: 1.00 },
  };
  const rate = rates[provider] || { input: 1, output: 2 };
  return ((inputTokens / 1_000_000) * rate.input + (outputTokens / 1_000_000) * rate.output);
}
