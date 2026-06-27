import { z } from "zod";

export const connectSocialSchema = z.object({
  platform: z.enum(["FACEBOOK", "INSTAGRAM", "YOUTUBE", "TIKTOK", "LINKEDIN", "PINTEREST", "X", "THREADS"]),
  brandId: z.string().uuid("Invalid brand ID"),
  code: z.string().optional(), // OAuth authorization code
  state: z.string().optional(), // OAuth state token
});

export const refreshTokenSchema = z.object({
  accountId: z.string().uuid(),
});

export type ConnectSocialInput = z.infer<typeof connectSocialSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
