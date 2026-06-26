"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, Flame, BarChart3, ExternalLink, RefreshCw } from "lucide-react";

type Trend = {
  id: string;
  title: string;
  category: string;
  platform: string;
  viralScore: number;
  region: string;
  isActive: boolean;
  keywords: { keyword: string; volume: number | null; growth: number | null }[];
};

export function TrendCenterPage() {
  const [trends, setTrends] = useState<Trend[]>([]);
  const [loading, setLoading] = useState(true);
  const [platform, setPlatform] = useState<"all" | "google" | "youtube" | "reddit">("all");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Trend Center"
        description="Monitor trending topics across platforms"
        actions={
          <Button variant="outline" size="sm" onClick={() => {}}>
            <RefreshCw className="h-4 w-4 mr-1" />
            Sync Trends
          </Button>
        }
      />

      {/* Platform Filter */}
      <div className="flex gap-2">
        {(["all", "google", "youtube", "reddit"] as const).map((p) => (
          <Button
            key={p}
            variant={platform === p ? "default" : "outline"}
            size="sm"
            onClick={() => setPlatform(p)}
          >
            {p === "all" ? "All" : p.charAt(0).toUpperCase() + p.slice(1)}
          </Button>
        ))}
      </div>

      {/* Trend Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}><CardContent className="py-8"><div className="h-4 bg-muted rounded w-3/4 animate-pulse" /></CardContent></Card>
          ))}
        </div>
      ) : trends.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <TrendingUp className="h-8 w-8 mx-auto mb-3 opacity-50" />
            <p>No trending topics found. Sync with trend sources to discover opportunities.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {trends.map((trend) => (
            <Card key={trend.id} className="hover:shadow-growthscape-md transition-normal">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base">{trend.title}</CardTitle>
                  {trend.viralScore > 80 && <Flame className="h-5 w-5 text-orange-500" />}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Badge variant="outline">{trend.platform}</Badge>
                  <span>{trend.category}</span>
                </div>
              </CardHeader>
              <CardContent>
                {/* Viral Score */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Viral Score</span>
                    <span className="font-bold">{trend.viralScore}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${trend.viralScore}%` }}
                    />
                  </div>
                </div>
                {/* Keywords */}
                <div className="flex flex-wrap gap-1">
                  {trend.keywords.slice(0, 3).map((kw) => (
                    <Badge key={kw.keyword} variant="secondary" className="text-[10px]">
                      {kw.keyword}
                      {kw.growth && kw.growth > 0 && (
                        <span className="ml-1 text-green-600">+{kw.growth}%</span>
                      )}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
