"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Flag } from "lucide-react";

type FeatureFlag = {
  id: string;
  name: string;
  description: string | null;
  isEnabled: boolean;
  targetWorkspaces: string[];
  rolloutPercentage: number;
};

export function FeatureFlagsPage() {
  const [flags, setFlags] = useState<FeatureFlag[]>([
    { id: "1", name: "ai-content-studio", description: "AI Content Studio module", isEnabled: true, targetWorkspaces: [], rolloutPercentage: 100 },
    { id: "2", name: "ai-social-manager", description: "AI Social Manager module", isEnabled: true, targetWorkspaces: [], rolloutPercentage: 100 },
    { id: "3", name: "competitor-tracker", description: "Competitor tracking module", isEnabled: true, targetWorkspaces: [], rolloutPercentage: 100 },
    { id: "4", name: "trend-center", description: "Trend Center module", isEnabled: true, targetWorkspaces: [], rolloutPercentage: 100 },
    { id: "5", name: "automation-engine", description: "Automation rules engine", isEnabled: false, targetWorkspaces: [], rolloutPercentage: 0 },
  ]);

  const toggleFlag = (id: string) => {
    setFlags(flags.map((f) => f.id === id ? { ...f, isEnabled: !f.isEnabled } : f));
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Feature Flags"
        description="Control feature availability per workspace"
      />

      <div className="space-y-3">
        {flags.map((flag) => (
          <Card key={flag.id}>
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-muted p-2">
                    <Flag className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{flag.name}</p>
                    {flag.description && (
                      <p className="text-xs text-muted-foreground">{flag.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {flag.rolloutPercentage < 100 && (
                    <Badge variant="outline">{flag.rolloutPercentage}% rollout</Badge>
                  )}
                  <Switch
                    checked={flag.isEnabled}
                    onCheckedChange={() => toggleFlag(flag.id)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
