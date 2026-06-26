import { draftRepository } from "../repositories/draft.repository";
import { scheduledPostRepository } from "../repositories/scheduled-post.repository";
import { publishQueueRepository } from "../repositories/publish-queue.repository";
import { createDraftSchema, scheduleDraftSchema } from "../../schemas/draft";
import { AppError } from "@/lib/api/errors";

export const schedulerService = {
  // Drafts
  async listDrafts(brandId: string, status?: string) {
    return draftRepository.findByBrand(brandId, status);
  },

  async getDraft(id: string) {
    const draft = await draftRepository.findById(id);
    if (!draft) throw new AppError("NOT_FOUND", "Draft not found");
    return draft;
  },

  async createDraft(input: { brandId: string; title?: string; caption: string; hashtags: string[]; notes?: string; media?: any[] }) {
    const validated = createDraftSchema.parse(input);
    return draftRepository.create(validated);
  },

  async updateDraft(id: string, input: Partial<{ title: string; caption: string; hashtags: string[]; notes: string }>) {
    const draft = await draftRepository.findById(id);
    if (!draft) throw new AppError("NOT_FOUND", "Draft not found");
    return draftRepository.update(id, input);
  },

  async deleteDraft(id: string) {
    const draft = await draftRepository.findById(id);
    if (!draft) throw new AppError("NOT_FOUND", "Draft not found");
    return draftRepository.softDelete(id);
  },

  // Scheduling
  async scheduleDraft(input: { draftId: string; scheduledFor: string; socialAccountId?: string }) {
    const validated = scheduleDraftSchema.parse(input);
    const draft = await draftRepository.findById(validated.draftId);
    if (!draft) throw new AppError("NOT_FOUND", "Draft not found");
    if (draft.status !== "NEW" && draft.status !== "IN_REVIEW" && draft.status !== "APPROVED") {
      throw new AppError("CONFLICT", "Draft cannot be scheduled");
    }

    const post = await scheduledPostRepository.create({
      brandId: draft.brandId,
      draftId: draft.id,
      caption: draft.caption,
      hashtags: draft.hashtags,
      scheduledFor: new Date(validated.scheduledFor),
      socialAccountId: validated.socialAccountId,
      media: (draft as any).media?.map((m: any) => ({
        type: m.type,
        url: m.url,
        altText: m.altText,
        order: m.order,
      })),
    });

    // Update draft status
    await draftRepository.update(draft.id, { status: "SCHEDULED" });

    // Enqueue for publishing
    await publishQueueRepository.enqueue(post.id);

    return post;
  },

  async listScheduledPosts(brandId: string, dateFrom?: string, dateTo?: string) {
    return scheduledPostRepository.list(
      brandId,
      dateFrom ? new Date(dateFrom) : undefined,
      dateTo ? new Date(dateTo) : undefined
    );
  },

  async reschedulePost(id: string, scheduledFor: string) {
    return scheduledPostRepository.reschedule(id, new Date(scheduledFor));
  },

  async cancelPost(id: string) {
    return scheduledPostRepository.softDelete(id);
  },

  // Publishing Queue
  async getQueue() {
    return publishQueueRepository.getPending();
  },
};
