import { prisma } from "@/lib/db/client";
import { generateChat, getProviderConfig, type ChatMessage } from "@/packages/ai";
import { AppError } from "@/lib/api/errors";

export const aiChatService = {
  async createSession(userId: string, workspaceId: string | null, title?: string) {
    return prisma.chatSession.create({
      data: {
        userId,
        workspaceId: workspaceId || null,
        title: title || "New conversation",
      },
    });
  },

  async sendMessage(
    sessionId: string,
    content: string,
    provider: string,
    brandId?: string | null
  ) {
    // Get session and messages
    const session = await prisma.chatSession.findUnique({
      where: { id: sessionId },
      include: { messages: { orderBy: { createdAt: "asc" } } },
    });
    if (!session) throw new AppError("NOT_FOUND", "Session not found");

    // Save user message
    await prisma.chatMessage.create({
      data: {
        sessionId,
        role: "USER",
        content,
      },
    });

    // Build message history
    const messages: ChatMessage[] = session.messages.map((m) => ({
      role: m.role.toLowerCase() as "system" | "user" | "assistant",
      content: m.content,
    }));

    // Add brand context as system prompt if brand is selected
    let systemPrompt: string | undefined;
    if (brandId) {
      const persona = await prisma.brandPersona.findUnique({ where: { brandId } });
      if (persona) {
        systemPrompt = `You are an AI assistant for the brand "${persona.tone.join(", ")}".\n`;
        systemPrompt += `Audience: ${persona.audience || "general"}\n`;
        systemPrompt += `Style: ${persona.writingStyle || "engaging"}\n`;
        if (persona.brandGuidelines) systemPrompt += `Guidelines: ${persona.brandGuidelines}\n`;
        if (persona.prohibitedTopics?.length) systemPrompt += `Avoid: ${persona.prohibitedTopics.join(", ")}\n`;
      }
    }

    // Call AI provider
    const config = getProviderConfig(provider as any);
    if (!config) throw new AppError("AI_PROVIDER_ERROR", `${provider} not configured`);

    messages.push({ role: "user", content });
    const response = await generateChat(config, messages, systemPrompt);

    // Save assistant message
    await prisma.chatMessage.create({
      data: {
        sessionId,
        role: "ASSISTANT",
        content: response.content,
        modelUsed: response.model,
        provider: response.provider,
        inputTokens: response.inputTokens,
        outputTokens: response.outputTokens,
      },
    });

    // Log usage
    await prisma.aIUsage.create({
      data: {
        userId: session.userId,
        workspaceId: session.workspaceId || undefined,
        provider: response.provider,
        model: response.model,
        feature: "chat",
        inputTokens: response.inputTokens,
        outputTokens: response.outputTokens,
        latencyMs: response.latencyMs,
        estimatedCost: estimateCost(response.provider, response.inputTokens, response.outputTokens),
      },
    });

    return { content: response.content, model: response.model, provider: response.provider };
  },

  async listSessions(userId: string, workspaceId?: string) {
    return prisma.chatSession.findMany({
      where: {
        userId,
        ...(workspaceId ? { workspaceId } : {}),
      },
      orderBy: { updatedAt: "desc" },
      take: 20,
      include: { messages: { orderBy: { createdAt: "desc" }, take: 1 } },
    });
  },

  async getSession(sessionId: string) {
    return prisma.chatSession.findUnique({
      where: { id: sessionId },
      include: { messages: { orderBy: { createdAt: "asc" } } },
    });
  },

  async deleteSession(sessionId: string) {
    return prisma.chatSession.delete({ where: { id: sessionId } });
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
