"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Copy, RefreshCw, Loader2, MessageSquare, Lightbulb } from "lucide-react";
import { toast } from "sonner";

type ContentType = "caption" | "hook" | "hashtags" | "title" | "thread" | "cta" | "script" | "seo";
type Tab = "generate" | "chat" | "ideas";

export function AiContentStudioPage() {
  const [activeTab, setActiveTab] = useState<Tab>("generate");

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Content Studio"
        description="Generate content, chat with AI, and get content ideas"
      />

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg bg-muted p-1 w-fit">
        <button
          onClick={() => setActiveTab("generate")}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-fast ${
            activeTab === "generate" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Sparkles className="h-4 w-4 inline mr-2" />
          Generate
        </button>
        <button
          onClick={() => setActiveTab("chat")}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-fast ${
            activeTab === "chat" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <MessageSquare className="h-4 w-4 inline mr-2" />
          Chat
        </button>
        <button
          onClick={() => setActiveTab("ideas")}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-fast ${
            activeTab === "ideas" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Lightbulb className="h-4 w-4 inline mr-2" />
          Ideas
        </button>
      </div>

      {activeTab === "generate" && <GenerateContent />}
      {activeTab === "chat" && <AIChat />}
      {activeTab === "ideas" && <GenerateIdeas />}
    </div>
  );
}

function GenerateContent() {
  const [prompt, setPrompt] = useState("");
  const [contentType, setContentType] = useState<ContentType>("caption");
  const [provider, setProvider] = useState("google");
  const [output, setOutput] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const contentTypes: { key: ContentType; label: string }[] = [
    { key: "caption", label: "Caption" },
    { key: "hook", label: "Hook" },
    { key: "hashtags", label: "Hashtags" },
    { key: "title", label: "Title" },
    { key: "thread", label: "Thread" },
    { key: "cta", label: "CTA" },
    { key: "script", label: "Video Script" },
    { key: "seo", label: "SEO Description" },
  ];

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/v1/ai/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, contentType, provider }),
      });
      const data = await res.json();
      if (data.success) {
        setOutput(data.data.content);
      } else {
        toast.error(data.error?.message || "Generation failed");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (output) navigator.clipboard.writeText(output);
    toast.success("Copied to clipboard");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Input Panel */}
      <Card>
        <CardHeader><CardTitle className="text-base">Create Content</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {contentTypes.map((type) => (
              <Badge
                key={type.key}
                variant={contentType === type.key ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setContentType(type.key)}
              >
                {type.label}
              </Badge>
            ))}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">AI Provider</label>
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              className="w-full text-sm rounded-md border bg-background px-3 py-1.5"
            >
              <option value="google">Gemini (Free)</option>
              <option value="openai">OpenAI GPT-4o</option>
              <option value="anthropic">Claude Sonnet</option>
              <option value="openrouter">OpenRouter</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Prompt</label>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Write a caption for our new product launch..."
              className="min-h-[120px]"
            />
          </div>

          <Button onClick={handleGenerate} disabled={loading || !prompt.trim()} className="w-full">
            {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
            {loading ? "Generating..." : `Generate ${contentType}`}
          </Button>
        </CardContent>
      </Card>

      {/* Output Panel */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Output</CardTitle>
          {output && (
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={copyToClipboard}>
                <Copy className="h-4 w-4 mr-1" /> Copy
              </Button>
              <Button variant="ghost" size="sm" onClick={handleGenerate} disabled={loading}>
                <RefreshCw className="h-4 w-4 mr-1" /> Regenerate
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {loading && (
            <div className="space-y-3">
              <div className="h-4 bg-muted rounded w-full animate-pulse" />
              <div className="h-4 bg-muted rounded w-5/6 animate-pulse" />
              <div className="h-4 bg-muted rounded w-4/6 animate-pulse" />
            </div>
          )}
          {output && !loading && (
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <p className="whitespace-pre-wrap text-sm">{output}</p>
            </div>
          )}
          {!output && !loading && (
            <div className="py-12 text-center text-muted-foreground">
              <Sparkles className="h-8 w-8 mx-auto mb-3 opacity-50" />
              <p className="text-sm">Your AI-generated content will appear here</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function AIChat() {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [provider, setProvider] = useState("google");
  const [sessionId, setSessionId] = useState<string | null>(null);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/v1/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, content: input, provider }),
      });
      const data = await res.json();
      if (data.success) {
        setMessages((prev) => [...prev, { role: "assistant", content: data.data.content }]);
        if (!sessionId) setSessionId(data.data.sessionId);
      }
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Error: Failed to get response" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>AI Chat Assistant</CardTitle>
        <select
          value={provider}
          onChange={(e) => setProvider(e.target.value)}
          className="text-sm rounded-md border bg-background px-2 py-1"
        >
          <option value="google">Gemini</option>
          <option value="openai">GPT-4o</option>
          <option value="anthropic">Claude</option>
        </select>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 mb-4 max-h-[400px] overflow-y-auto">
          {messages.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Ask me anything about your social media strategy</p>
            </div>
          )}
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] rounded-lg px-4 py-2 text-sm ${
                msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
              }`}>
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-lg px-4 py-2">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask a question..."
            className="flex-1 rounded-md border bg-background px-3 py-2 text-sm"
          />
          <Button onClick={handleSend} disabled={loading || !input.trim()}>Send</Button>
        </div>
      </CardContent>
    </Card>
  );
}

function GenerateIdeas() {
  const [topic, setTopic] = useState("");
  const [platform, setPlatform] = useState("FACEBOOK");
  const [provider, setProvider] = useState("google");
  const [ideas, setIdeas] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/v1/ai/ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, platform, provider }),
      });
      const data = await res.json();
      if (data.success) {
        setIdeas(data.data.map((idea: { title: string }) => idea.title));
      }
    } catch {
      toast.error("Failed to generate ideas");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader><CardTitle className="text-base">Generate Content Ideas</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Topic</label>
              <input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., summer sale, product launch"
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Platform</label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              >
                <option value="FACEBOOK">Facebook</option>
                <option value="INSTAGRAM">Instagram</option>
                <option value="YOUTUBE">YouTube</option>
                <option value="TIKTOK">TikTok</option>
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">AI Provider</label>
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            >
              <option value="google">Gemini (Free)</option>
              <option value="openai">OpenAI GPT-4o</option>
              <option value="anthropic">Claude Sonnet</option>
            </select>
          </div>
          <Button onClick={handleGenerate} disabled={loading || !topic.trim()} className="w-full">
            {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Lightbulb className="h-4 w-4 mr-2" />}
            {loading ? "Generating..." : "Generate Ideas"}
          </Button>
        </CardContent>
      </Card>

      {ideas.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Ideas</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {ideas.map((idea, i) => (
                <li key={i} className="flex items-start gap-2 p-2 rounded-lg bg-muted/50">
                  <Lightbulb className="h-4 w-4 text-yellow-500 mt-0.5 shrink-0" />
                  <span className="text-sm">{idea}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
