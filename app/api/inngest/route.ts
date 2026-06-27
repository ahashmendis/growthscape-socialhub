import { serve } from "inngest/next";
import { inngest } from "@/jobs";
import { syncAccountAnalytics, syncAllAccounts } from "@/jobs/analytics/sync";
import { processPublishQueue } from "@/jobs/publishing/process";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [syncAccountAnalytics, syncAllAccounts, processPublishQueue],
});
