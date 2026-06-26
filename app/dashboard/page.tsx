import { Suspense } from "react";
import { DashboardPage } from "@/features/dashboard/components/dashboard-page";
import { DashboardSkeleton } from "@/features/dashboard/components/dashboard-skeleton";

export default function DashboardHomePage() {
  const hasConnectedAccounts = false;

  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardPage hasConnectedAccounts={hasConnectedAccounts} />
    </Suspense>
  );
}
