import { Sparkles } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";

export function DashboardEmpty() {
  return (
    <EmptyState
      icon={Sparkles}
      title="Welcome to Growthscape"
      description="Connect your first social media account to start seeing analytics and AI insights."
      actionLabel="Connect Account"
      onAction={() => {}}
    />
  );
}
