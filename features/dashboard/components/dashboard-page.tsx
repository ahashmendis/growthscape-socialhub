"use client";

import { PageHeader } from "@/components/layout/page-header";
import { MetricCard } from "@/components/shared/metric-card";
import { DashboardSkeleton } from "./dashboard-skeleton";
import { DashboardEmpty } from "./dashboard-empty";
import { WidgetErrorBoundary } from "@/components/shared/widget-error-boundary";
import { Users, Eye, Heart, TrendingUp } from "lucide-react";

interface DashboardPageProps {
  hasConnectedAccounts: boolean;
}

export function DashboardPage({ hasConnectedAccounts }: DashboardPageProps) {
  if (!hasConnectedAccounts) {
    return <DashboardEmpty />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Your social media performance at a glance"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <WidgetErrorBoundary widgetId="followers">
          <MetricCard
            title="Followers"
            value={12450}
            change={8.2}
            icon={<Users className="h-4 w-4" />}
          />
        </WidgetErrorBoundary>
        <WidgetErrorBoundary widgetId="impressions">
          <MetricCard
            title="Impressions"
            value={89200}
            change={12.5}
            icon={<Eye className="h-4 w-4" />}
          />
        </WidgetErrorBoundary>
        <WidgetErrorBoundary widgetId="engagement">
          <MetricCard
            title="Engagement"
            value={3420}
            change={-2.1}
            icon={<Heart className="h-4 w-4" />}
          />
        </WidgetErrorBoundary>
        <WidgetErrorBoundary widgetId="growth">
          <MetricCard
            title="Growth Rate"
            value={4.8}
            change={1.2}
            suffix="%"
            icon={<TrendingUp className="h-4 w-4" />}
          />
        </WidgetErrorBoundary>
      </div>

      <div className="rounded-xl border bg-gradient-to-r from-primary/5 to-secondary/5 p-5">
        <h3 className="text-sm font-semibold text-primary mb-1">AI Insights</h3>
        <p className="text-sm text-muted-foreground">
          Connect your accounts to receive personalized AI recommendations.
        </p>
      </div>
    </div>
  );
}
