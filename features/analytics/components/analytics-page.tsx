"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { MetricCard } from "@/components/shared/metric-card";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { PlatformIcon } from "@/components/shared/platform-icon";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, TrendingUp, RefreshCw, Users, Eye } from "lucide-react";

type DailyData = {
  date: string;
  followers: number;
  impressions: number;
  reach: number;
  engagement: number;
  engagementRate: number;
  likes: number;
  comments: number;
  shares: number;
  views: number;
  clicks: number;
};

type ComparisonData = {
  brand: { id: string; name: string };
  platforms: {
    platform: string;
    handle: string | null;
    followers: number;
    totalImpressions: number;
    totalReach: number;
    totalEngagement: number;
    avgEngagementRate: number;
  }[];
};

export function AnalyticsPage() {
  const [selectedPlatform, setSelectedPlatform] = useState<string>("all");
  const [dateRange, setDateRange] = useState<"7d" | "30d" | "90d">("30d");
  const [dailyData, setDailyData] = useState<DailyData[]>([]);
  const [comparisonData, setComparisonData] = useState<ComparisonData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasData, setHasData] = useState(false);

  const dateFrom = new Date(Date.now() - (dateRange === "7d" ? 7 : dateRange === "30d" ? 30 : 90) * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
  const dateTo = new Date().toISOString().split("T")[0];

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch comparison data for the workspace
      const response = await fetch(`/api/v1/analytics/comparison?workspaceId=&dateFrom=${dateFrom}&dateTo=${dateTo}`);
      const result = await response.json();
      if (result.success) {
        setComparisonData(result.data);
        setHasData(result.data.length > 0);
      }
    } catch {
      setError("Failed to load analytics data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [dateRange]);

  // Aggregate metrics for summary
  const totalFollowers = comparisonData.reduce((sum, b) => sum + b.platforms.reduce((s, p) => s + p.followers, 0), 0);
  const totalImpressions = comparisonData.reduce((sum, b) => sum + b.platforms.reduce((s, p) => s + p.totalImpressions, 0), 0);
  const totalEngagement = comparisonData.reduce((sum, b) => sum + b.platforms.reduce((s, p) => s + p.totalEngagement, 0), 0);
  const avgEngagementRate = comparisonData.length > 0 && comparisonData[0]?.platforms?.length > 0
    ? comparisonData.reduce((sum, b) => sum + b.platforms.reduce((s, p) => s + p.avgEngagementRate, 0) / b.platforms.length, 0) / comparisonData.length
    : 0;

  const platforms = ["FACEBOOK", "INSTAGRAM", "YOUTUBE"] as const;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics"
        description="Cross-platform performance metrics and insights"
        actions={
          <div className="flex items-center gap-2">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as "7d" | "30d" | "90d")}
              className="text-sm rounded-md border bg-background px-3 py-1.5"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
            <Button variant="outline" size="sm" onClick={fetchData} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-1 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        }
      />

      {error && <ErrorState title="Error" description={error} onRetry={fetchData} />}

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Followers"
          value={totalFollowers}
          icon={<Users className="h-4 w-4" />}
          loading={loading}
        />
        <MetricCard
          title="Impressions"
          value={totalImpressions}
          icon={<Eye className="h-4 w-4" />}
          loading={loading}
        />
        <MetricCard
          title="Engagement"
          value={totalEngagement}
          icon={<BarChart3 className="h-4 w-4" />}
          loading={loading}
        />
        <MetricCard
          title="Avg Engagement Rate"
          value={Math.round(avgEngagementRate * 100)}
          suffix="%"
          icon={<TrendingUp className="h-4 w-4" />}
          loading={loading}
        />
      </div>

      {!hasData && !loading && !error && (
        <EmptyState
          icon={BarChart3}
          title="No analytics data yet"
          description="Connect your social accounts and trigger a sync to start seeing analytics"
        />
      )}

      {hasData && (
        <>
          {/* Platform Breakdown */}
          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              {platforms.map((platform) => (
                <TabsTrigger key={platform} value={platform.toLowerCase()}>
                  <PlatformIcon platform={platform.toLowerCase() as any} size="sm" />
                  <span className="ml-2">{platform}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="overview" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Cross-Platform Comparison</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {comparisonData.map((brand) => (
                      <div key={brand.brand.id} className="space-y-2">
                        <h4 className="font-medium text-sm">{brand.brand.name}</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {brand.platforms.map((platform) => (
                            <Card key={platform.platform} className="bg-muted/50">
                              <CardContent className="py-3">
                                <div className="flex items-center gap-2 mb-2">
                                  <PlatformIcon platform={platform.platform.toLowerCase() as any} size="sm" />
                                  <span className="text-sm font-medium">{platform.handle || platform.platform}</span>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                  <div>
                                    <span className="text-muted-foreground">Followers</span>
                                    <p className="font-semibold">{platform.followers.toLocaleString()}</p>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">Impressions</span>
                                    <p className="font-semibold">{platform.totalImpressions.toLocaleString()}</p>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">Reach</span>
                                    <p className="font-semibold">{platform.totalReach.toLocaleString()}</p>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">Eng. Rate</span>
                                    <p className="font-semibold">{(platform.avgEngagementRate * 100).toFixed(1)}%</p>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {platforms.map((platform) => (
              <TabsContent key={platform} value={platform.toLowerCase()} className="mt-4">
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <PlatformIcon platform={platform.toLowerCase() as any} />
                      <CardTitle>{platform} Analytics</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Detailed {platform} analytics will appear here once data is synced.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </>
      )}
    </div>
  );
}
