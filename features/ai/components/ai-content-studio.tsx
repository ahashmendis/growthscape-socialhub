"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Copy, RefreshCw, Loader2 } from "lucide-react";

type ContentType = "caption" | "hook" | "hashtags" | "title" | "thread" | "cta";

export function AiContentStudioPage() {
  const [prompt, setPrompt] = useState("");
  const [contentType, setContentType] = useState<ContentType>("caption");
  const [provider, setProvider] = useState("google");
  const [output, setOutput] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const contentTypes: { key: ContentType; label: string }[] = [
    { key: "caption", label: "Caption" },
    { key: "hook", label: "Hook" },
    { key: "hashtags", label: "Hashtags" },
    { key: "title", label: "Title" },
    { key: "thread", label: "Thread" },
    { key: "cta", label: "CTA" },
  ];

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError(null);
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
        setError(data.error?.message || "Generation failed");
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (output) navigator.clipboard.writeText(output);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Content Studio"
        description="Generate social media content with AI"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Create Content</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Content Type */}
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

            {/* Provider */}
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

            {/* Prompt */}
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
              {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4 mr-2" />
              )}
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
                  <Copy className="h-4 w-4 mr-1" />
                  Copy
                </Button>
                <Button variant="ghost" size="sm" onClick={handleGenerate} disabled={loading}>
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Regenerate
                </Button>
              </div>
            )}
          </CardHeader>
          <CardContent>
            {error && (
              <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
                {error}
              </div>
            )}
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
            {!output && !loading && !error && (
              <div className="py-12 text-center text-muted-foreground">
                <Sparkles className="h-8 w-8 mx-auto mb-3 opacity-50" />
                <p className="text-sm">Your AI-generated content will appear here</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
