import { serve } from "inngest/next";
import { inngest } from "@/jobs";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [],
});
