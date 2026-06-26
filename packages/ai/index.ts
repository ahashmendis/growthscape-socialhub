// Provider-agnostic AI abstraction layer

export type AIProvider = "openai" | "anthropic" | "google" | "openrouter";

export interface AIConfig {
  provider: AIProvider;
  model: string;
  apiKey: string;
  baseUrl?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface AIResponse {
  content: string;
  provider: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  latencyMs: number;
}

const DEFAULT_CONFIGS: Record<AIProvider, Omit<AIConfig, "apiKey">> = {
  openai: { provider: "openai", model: "gpt-4o", maxTokens: 4096, temperature: 0.7 },
  anthropic: { provider: "anthropic", model: "claude-sonnet-4-6", maxTokens: 4096, temperature: 0.7 },
  google: { provider: "google", model: "gemini-2.0-flash", maxTokens: 4096, temperature: 0.7 },
  openrouter: { provider: "openrouter", model: "meta-llama/llama-3.3-70b-instruct", maxTokens: 4096, temperature: 0.7 },
};

export async function generateChat(
  config: AIConfig,
  messages: ChatMessage[],
  systemPrompt?: string
): Promise<AIResponse> {
  const startTime = Date.now();
  const fullMessages: ChatMessage[] = systemPrompt
    ? [{ role: "system", content: systemPrompt }, ...messages]
    : messages;

  switch (config.provider) {
    case "openai":
      return callOpenAI(config, fullMessages, startTime);
    case "anthropic":
      return callAnthropic(config, fullMessages, startTime);
    case "google":
      return callGemini(config, fullMessages, startTime);
    case "openrouter":
      return callOpenRouter(config, fullMessages, startTime);
    default:
      throw new Error(`Unknown provider: ${config.provider}`);
  }
}

async function callOpenAI(config: AIConfig, messages: ChatMessage[], startTime: number): Promise<AIResponse> {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
      max_tokens: config.maxTokens,
      temperature: config.temperature,
    }),
  });

  if (!response.ok) throw new Error(`OpenAI error: ${response.statusText}`);
  const data = await response.json();

  return {
    content: data.choices[0]?.message?.content || "",
    provider: "openai",
    model: config.model,
    inputTokens: data.usage?.prompt_tokens || 0,
    outputTokens: data.usage?.completion_tokens || 0,
    latencyMs: Date.now() - startTime,
  };
}

async function callAnthropic(config: AIConfig, messages: ChatMessage[], startTime: number): Promise<AIResponse> {
  const systemMessage = messages.find((m) => m.role === "system");
  const chatMessages = messages.filter((m) => m.role !== "system");

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": config.apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: config.model,
      system: systemMessage?.content,
      messages: chatMessages.map((m) => ({ role: m.role, content: m.content })),
      max_tokens: config.maxTokens,
      temperature: config.temperature,
    }),
  });

  if (!response.ok) throw new Error(`Anthropic error: ${response.statusText}`);
  const data = await response.json();

  return {
    content: data.content?.[0]?.text || "",
    provider: "anthropic",
    model: config.model,
    inputTokens: data.usage?.input_tokens || 0,
    outputTokens: data.usage?.output_tokens || 0,
    latencyMs: Date.now() - startTime,
  };
}

async function callGemini(config: AIConfig, messages: ChatMessage[], startTime: number): Promise<AIResponse> {
  const contents = messages
    .filter((m) => m.role !== "system")
    .map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

  const systemMessage = messages.find((m) => m.role === "system");
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${config.model}:generateContent?key=${config.apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents,
        systemInstruction: systemMessage ? { parts: [{ text: systemMessage.content }] } : undefined,
        generationConfig: {
          maxOutputTokens: config.maxTokens,
          temperature: config.temperature,
        },
      }),
    }
  );

  if (!response.ok) throw new Error(`Gemini error: ${response.statusText}`);
  const data = await response.json();

  return {
    content: data.candidates?.[0]?.content?.parts?.[0]?.text || "",
    provider: "google",
    model: config.model,
    inputTokens: data.usageMetadata?.promptTokenCount || 0,
    outputTokens: data.usageMetadata?.candidatesTokenCount || 0,
    latencyMs: Date.now() - startTime,
  };
}

async function callOpenRouter(config: AIConfig, messages: ChatMessage[], startTime: number): Promise<AIResponse> {
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
      max_tokens: config.maxTokens,
      temperature: config.temperature,
    }),
  });

  if (!response.ok) throw new Error(`OpenRouter error: ${response.statusText}`);
  const data = await response.json();

  return {
    content: data.choices[0]?.message?.content || "",
    provider: "openrouter",
    model: config.model,
    inputTokens: data.usage?.prompt_tokens || 0,
    outputTokens: data.usage?.completion_tokens || 0,
    latencyMs: Date.now() - startTime,
  };
}

export function getProviderConfig(provider: AIProvider, apiKey?: string): AIConfig | null {
  const key = apiKey || process.env[`${provider.toUpperCase()}_API_KEY`];
  if (!key) return null;

  const defaults = DEFAULT_CONFIGS[provider];
  return { ...defaults, apiKey: key } as AIConfig;
}
