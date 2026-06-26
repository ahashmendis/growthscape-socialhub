import { prisma } from "@/lib/db/client";
import type { DailyAnalytics, AggregatedAnalytics, PostAnalytics } from "@prisma/client";

export const analyticsRepository = {
  async getDaily(
    socialAccountId: string,
    dateFrom: Date,
    dateTo: Date
  ): Promise<DailyAnalytics[]> {
    return prisma.dailyAnalytics.findMany({
      where: {
        socialAccountId,
        date: { gte: dateFrom, lte: dateTo },
      },
      orderBy: { date: "asc" },
    });
  },

  async getDailyByBrand(
    brandId: string,
    dateFrom: Date,
    dateTo: Date
  ): Promise<DailyAnalytics[]> {
    return prisma.dailyAnalytics.findMany({
      where: {
        socialAccount: { brandId, deletedAt: null },
        date: { gte: dateFrom, lte: dateTo },
      },
      include: { socialAccount: true },
      orderBy: [{ date: "asc" }],
    });
  },

  async upsertDaily(
    socialAccountId: string,
    date: Date,
    data: Omit<DailyAnalytics, "id" | "socialAccountId" | "date" | "createdAt" | "updatedAt">
  ): Promise<DailyAnalytics> {
    return prisma.dailyAnalytics.upsert({
      where: { socialAccountId_date: { socialAccountId, date } },
      create: { socialAccountId, date, ...data },
      update: data,
    });
  },

  async getAggregated(
    socialAccountId: string,
    period: "WEEKLY" | "MONTHLY" | "QUARTERLY" | "ANNUAL"
  ): Promise<AggregatedAnalytics[]> {
    return prisma.aggregatedAnalytics.findMany({
      where: { socialAccountId, period },
      orderBy: { periodStart: "desc" },
    });
  },

  async getPostAnalytics(postId: string): Promise<PostAnalytics | null> {
    return prisma.postAnalytics.findFirst({
      where: { scheduledPostId: postId },
      orderBy: { scrapedAt: "desc" },
    });
  },

  async upsertPostAnalytics(
    postId: string,
    data: Omit<PostAnalytics, "id" | "scheduledPostId" | "scrapedAt" | "updatedAt">
  ): Promise<PostAnalytics> {
    const existing = await prisma.postAnalytics.findFirst({
      where: { scheduledPostId: postId },
      orderBy: { scrapedAt: "desc" },
    });

    if (existing) {
      return prisma.postAnalytics.update({
        where: { id: existing.id },
        data: { ...data, updatedAt: new Date() },
      });
    }

    return prisma.postAnalytics.create({
      data: { scheduledPostId: postId, ...data },
    });
  },
};
