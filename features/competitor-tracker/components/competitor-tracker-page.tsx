"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlatformIcon } from "@/components/shared/platform-icon";
import { Users, TrendingUp, Plus, RefreshCw } from "lucide-react";

type Competitor = {
  id: string;
  platform: string;
  username: string;
  displayName: string;
  followers: number;
  uploads: number;
  engagement: number;
  postingFrequency: number;
};

export function CompetitorTrackerPage() {
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [loading, setLoading] = useState(true);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Competitor Tracker"
        description="Monitor competitor performance and strategy"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm"><RefreshCw className="h-4 w-4 mr-1" />Sync</Button>
            <Button size="sm"><Plus className="h-4 w-4 mr-2" />Add Competitor</Button>
          </div>
        }
      />

      {competitors.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Users className="h-8 w-8 mx-auto mb-3 opacity-50" />
            <p>No competitors tracked. Add competitors to start monitoring their performance.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Comparison Header */}
          <div className="grid grid-cols-6 gap-4 px-4 text-xs font-medium text-muted-foreground uppercase">
            <span>Competitor</span>
            <span>Followers</span>
            <span>Uploads</span>
            <span>Engagement</span>
            <span>Posts/Week</span>
            <span>Actions</span>
          </div>

          {competitors.map((competitor) => (
            <Card key={competitor.id} className="hover:shadow-growthscape-sm transition-normal">
              <CardContent className="py-4">
                <div className="grid grid-cols-6 gap-4 items-center">
                  <div className="flex items-center gap-3">
                    <PlatformIcon platform={competitor.platform.toLowerCase() as any} size="md" />
                    <div>
                      <p className="font-medium text-sm">{competitor.displayName}</p>
                      <p className="text-xs text-muted-foreground">@{competitor.username}</p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold">{competitor.followers.toLocaleString()}</span>
                  <span className="text-sm">{competitor.uploads}</span>
                  <span className="text-sm">{competitor.engagement.toLocaleString()}</span>
                  <span className="text-sm">{competitor.postingFrequency.toFixed(1)}</span>
                  <div className="flex gap-1">
                    <Badge variant="outline" className="text-xs">Tracked</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
