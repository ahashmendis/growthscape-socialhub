import { z } from "zod";

export const createDraftSchema = z.object({
  brandId: z.string().uuid("Invalid brand ID"),
  title: z.string().max(200).optional().or(z.literal("")),
  caption: z.string().min(1, "Caption is required").max(5000),
  hashtags: z.array(z.string()).default([]),
  notes: z.string().max(1000).optional().or(z.literal("")),
  media: z.array(z.object({
    type: z.enum(["IMAGE", "VIDEO", "CAROUSEL", "GIF"]),
    url: z.string().url(),
    altText: z.string().max(500).optional().or(z.literal("")),
    order: z.number().int().default(0),
  })).default([]),
});

export const scheduleDraftSchema = z.object({
  draftId: z.string().uuid("Invalid draft ID"),
  scheduledFor: z.string().datetime("Invalid date/time"),
  socialAccountId: z.string().uuid().optional(),
});

export const bulkScheduleSchema = z.object({
  draftIds: z.array(z.string().uuid()),
  scheduledFor: z.string().datetime(),
});

export type CreateDraftInput = z.infer<typeof createDraftSchema>;
export type ScheduleDraftInput = z.infer<typeof scheduleDraftSchema>;
export type BulkScheduleInput = z.infer<typeof bulkScheduleSchema>;
