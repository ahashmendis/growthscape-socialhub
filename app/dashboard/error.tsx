"use client";

import { ErrorState } from "@/components/shared/error-state";
import { useEffect } from "react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <ErrorState
      title="Dashboard unavailable"
      description="We couldn't load your dashboard. Please try again."
      onRetry={reset}
    />
  );
}
