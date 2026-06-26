import { serve } from "inngest/next";
import { inngest } from "@/jobs";

const functions = [];

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions,
});
