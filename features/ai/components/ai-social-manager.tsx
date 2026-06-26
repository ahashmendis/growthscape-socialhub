"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, TrendingUp, AlertTriangle, Lightbulb, Check, X, RefreshCw, Loader2 } from "lucide-react";

type Recommendation = {
  id: string;
  type: string;
  priority: number;
  title: string;
  message: string;
  confidence: number;
  status: string;
  generatedAt: string;
};

export function AiSocialManagerPage() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/ai/recommendations?workspaceId=");
      const data = await res.json();
      if (data.success) setRecommendations(data.data);
    } catch {
      // Silently fail
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRecommendations(); }, []);

  const handleDismiss = async (id: string) => {
    setRecommendations(recommendations.filter((r) => r.id !== id));
  };

  const typeIcons: Record<string, typeof Lightbulb> = {
    POSTING_TIME: Lightbulb,
    CONTENT_TYPE: TrendingUp,
    HASHTAG: Sparkles,
    GROWTH_OPPORTUNITY: TrendingUp,
    ENGAGEMENT_IMPROVEMENT: AlertTriangle,
  };

  const priorityColors: Record<number, string> = {
    10: "border-l-red-500",
    8: "border-l-amber-500",
    6: "border-l-blue-500",
    4: "border-l-muted",
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Social Manager"
        description="AI-powered insights and recommendations for your social media strategy"
        actions={
          <Button variant="outline" size="sm" onClick={fetchRecommendations} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-1 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        }
      />

      {/* AI Summary Card */}
      <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
        <CardContent className="py-6">
          <div className="flex items-start gap-4">
            <div className="rounded-full bg-primary/10 p-3">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-primary mb-1">AI Analysis Summary</h3>
              <p className="text-sm text-muted-foreground">
                Connect your social accounts to receive personalized AI recommendations about optimal posting times,
                content strategy, audience insights, and growth opportunities.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <h3 className="text-lg font-semibold">Recommendations</h3>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}><CardContent className="py-6"><div className="h-4 bg-muted rounded w-3/4 animate-pulse" /></CardContent></Card>
          ))}
        </div>
      ) : recommendations.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Sparkles className="h-8 w-8 mx-auto mb-3 opacity-50" />
            <p>No recommendations yet. Connect accounts and sync data to get started.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {recommendations.map((rec) => {
            const Icon = typeIcons[rec.type] || Lightbulb;
            return (
              <Card key={rec.id} className={`border-l-4 ${priorityColors[rec.priority] || "border-l-muted"}`}>
                <CardContent className="py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="rounded-full bg-muted p-2 mt-0.5">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium">{rec.title}</p>
                          <Badge variant="outline" className="text-[10px]">
                            {Math.round(rec.confidence * 100)}% confidence
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{rec.message}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {new Date(rec.generatedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-green-600">
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleDismiss(rec.id)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
