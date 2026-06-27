import { inngest } from "@/jobs";
import { analyticsSyncService } from "@/features/analytics/lib/services/analytics-sync.service";

export const syncAccountAnalytics = inngest.createFunction(
  { id: "analytics-sync-account" },
  { event: "analytics.sync.trigger" },
  async ({ event, step }) => {
    const { accountId } = event.data;

    await step.run("sync-analytics", async () => {
      await analyticsSyncService.syncAccount(accountId);
    });

    return { success: true, accountId };
  }
);

export const syncAllAccounts = inngest.createFunction(
  { id: "analytics-sync-all" },
  { event: "analytics.sync.all.trigger" },
  async ({ event, step }) => {
    const { workspaceId } = event.data;

    await step.run("sync-all", async () => {
      // This would be implemented with proper job orchestration
      console.log(`Syncing all accounts for workspace ${workspaceId}`);
    });

    return { success: true, workspaceId };
  }
);
