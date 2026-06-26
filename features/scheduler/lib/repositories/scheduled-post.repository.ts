import { prisma } from "@/lib/db/client";

export const scheduledPostRepository = {
  async list(brandId: string, dateFrom?: Date, dateTo?: Date) {
    return prisma.scheduledPost.findMany({
      where: {
        brandId,
        deletedAt: null,
        ...(dateFrom && dateTo ? {
          scheduledFor: { gte: dateFrom, lte: dateTo },
        } : {}),
      },
      include: {
        media: { orderBy: { order: "asc" } },
        socialAccount: { select: { platform: true, platformHandle: true } },
        analytics: { orderBy: { scrapedAt: "desc" }, take: 1 },
      },
      orderBy: { scheduledFor: "asc" },
    });
  },

  async create(data: {
    brandId: string;
    draftId?: string;
    caption: string;
    hashtags: string[];
    scheduledFor: Date;
    socialAccountId?: string;
    title?: string;
    media?: { type: string; url: string; altText?: string; order: number }[];
  }) {
    return prisma.scheduledPost.create({
      data: {
        brandId: data.brandId,
        draftId: data.draftId || null,
        title: data.title || null,
        caption: data.caption,
        hashtags: data.hashtags,
        scheduledFor: data.scheduledFor,
        socialAccountId: data.socialAccountId || null,
        media: data.media?.length
          ? { create: data.media.map((m) => ({ ...m, type: m.type as any })) }
          : undefined,
      },
      include: { media: true },
    });
  },

  async reschedule(id: string, scheduledFor: Date) {
    return prisma.scheduledPost.update({
      where: { id },
      data: { scheduledFor, status: "SCHEDULED" },
    });
  },

  async updateStatus(id: string, status: string, publishedAt?: Date, platformPostId?: string, platformUrl?: string) {
    return prisma.scheduledPost.update({
      where: { id },
      data: {
        status: status as any,
        publishedAt: publishedAt || null,
        platformPostId: platformPostId || null,
        platformUrl: platformUrl || null,
      },
    });
  },

  async softDelete(id: string) {
    return prisma.scheduledPost.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  },

  async getDuePosts(now: Date) {
    return prisma.scheduledPost.findMany({
      where: {
        status: "SCHEDULED",
        scheduledFor: { lte: now },
        deletedAt: null,
      },
      include: {
        socialAccount: { include: { credential: true } },
        media: { orderBy: { order: "asc" } },
      },
    });
  },
};
