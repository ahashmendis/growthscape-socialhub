import { analyticsRepository } from "../repositories/analytics.repository";
import { syncJobRepository } from "../repositories/sync-job.repository";
import { prisma } from "@/lib/db/client";
import type { DailyAnalytics } from "@prisma/client";

export const analyticsService = {
  async getDaily(socialAccountId: string, dateFrom: string, dateTo: string) {
    return analyticsRepository.getDaily(
      socialAccountId,
      new Date(dateFrom),
      new Date(dateTo)
    );
  },

  async getDailyByBrand(brandId: string, dateFrom: string, dateTo: string) {
    return analyticsRepository.getDailyByBrand(
      brandId,
      new Date(dateFrom),
      new Date(dateTo)
    );
  },

  async getAggregated(socialAccountId: string) {
    const [weekly, monthly, quarterly, annual] = await Promise.all([
      analyticsRepository.getAggregated(socialAccountId, "WEEKLY"),
      analyticsRepository.getAggregated(socialAccountId, "MONTHLY"),
      analyticsRepository.getAggregated(socialAccountId, "QUARTERLY"),
      analyticsRepository.getAggregated(socialAccountId, "ANNUAL"),
    ]);

    return { weekly, monthly, quarterly, annual };
  },

  async getCrossPlatformComparison(
    workspaceId: string,
    dateFrom: string,
    dateTo: string
  ) {
    const brands = await prisma.brand.findMany({
      where: { workspaceId, deletedAt: null },
      include: {
        socialAccounts: {
          where: { isActive: true, deletedAt: null },
          include: {
            dailyAnalytics: {
              where: {
                date: {
                  gte: new Date(dateFrom),
                  lte: new Date(dateTo),
                },
              },
            },
          },
        },
      },
    });

    const result = brands.map((brand) => ({
      brand: { id: brand.id, name: brand.name },
      platforms: brand.socialAccounts.map((account) => ({
        platform: account.platform,
        handle: account.platformHandle,
        followers: account.followers,
        totalImpressions: account.dailyAnalytics.reduce((sum, d) => sum + d.impressions, 0),
        totalReach: account.dailyAnalytics.reduce((sum, d) => sum + d.reach, 0),
        totalEngagement: account.dailyAnalytics.reduce((sum, d) => sum + d.engagement, 0),
        avgEngagementRate: account.dailyAnalytics.length > 0
          ? account.dailyAnalytics.reduce((sum, d) => sum + d.engagementRate, 0) / account.dailyAnalytics.length
          : 0,
      })),
    }));

    return result;
  },

  async processDailySync(
    socialAccountId: string,
    workspaceId: string,
    metrics: Omit<DailyAnalytics, "id" | "socialAccountId" | "date" | "createdAt" | "updatedAt">
  ) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayData = await prisma.dailyAnalytics.findUnique({
      where: {
        socialAccountId_date: { socialAccountId, date: today },
      },
    });

    if (todayData) {
      // Calculate deltas
      const deltaFields = {
        followersChange: metrics.followers - todayData.followers,
      };
      return analyticsRepository.upsertDaily(socialAccountId, today, {
        ...metrics,
        ...deltaFields,
      });
    }

    return analyticsRepository.upsertDaily(socialAccountId, today, metrics);
  },

  async triggerSync(workspaceId: string, socialAccountId: string, platform: string) {
    const job = await syncJobRepository.create({
      workspaceId,
      jobType: "ANALYTICS_INCREMENTAL",
      provider: platform,
      socialAccountId,
    });

    return { jobId: job.id };
  },

  async getSyncJobs(workspaceId: string) {
    return syncJobRepository.listByWorkspace(workspaceId);
  },
};
