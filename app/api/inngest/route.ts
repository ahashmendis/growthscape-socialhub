import { serve } from "inngest/next";
import { inngest } from "@/jobs";
import { syncAccountAnalytics, syncAllAccounts } from "@/jobs/analytics/sync";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [syncAccountAnalytics, syncAllAccounts],
});
