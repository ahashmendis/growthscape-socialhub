import { Inngest } from "inngest";

export const inngest = new Inngest({
  id: "growthscape-social-hub",
  retryFunction: async (attempt: number) => ({
    delay: Math.pow(2, attempt) * 1000,
    maxAttempts: 3,
  }),
});
