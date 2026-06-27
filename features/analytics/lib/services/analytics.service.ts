import { prisma } from "@/lib/db/client";

export const analyticsService = {
  async getDailyAnalytics(params: { socialAccountId: string; dateFrom: string; dateTo: string }) {
    return prisma.dailyAnalytics.findMany({
      where: {
        socialAccountId: params.socialAccountId,
        date: { gte: new Date(params.dateFrom), lte: new Date(params.dateTo) },
      },
      orderBy: { date: "asc" },
    });
  },

  async getAggregatedByBrand(brandId: string, dateFrom: string, dateTo: string) {
    const accounts = await prisma.socialAccount.findMany({
      where: { brandId, deletedAt: null, isActive: true },
      select: { id: true, platform: true, accountName: true },
    });

    const results = [];
    for (const account of accounts) {
      const analytics = await prisma.dailyAnalytics.findMany({
        where: {
          socialAccountId: account.id,
          date: { gte: new Date(dateFrom), lte: new Date(dateTo) },
        },
        orderBy: { date: "asc" },
      });

      const totals = analytics.reduce(
        (acc, day) => ({
          impressions: acc.impressions + day.impressions,
          reach: acc.reach + day.reach,
          engagement: acc.engagement + day.engagement,
          views: acc.views + day.views,
          watchTimeSeconds: acc.watchTimeSeconds + day.watchTimeSeconds,
          likes: acc.likes + day.likes,
          comments: acc.comments + day.comments,
        }),
        { impressions: 0, reach: 0, engagement: 0, views: 0, watchTimeSeconds: 0, likes: 0, comments: 0 }
      );

      results.push({ platform: account.platform, accountName: account.accountName, ...totals, days: analytics.length });
    }

    return results;
  },

  async getCrossPlatformComparison(workspaceId: string, dateFrom: string, dateTo: string) {
    const brands = await prisma.brand.findMany({
      where: { workspaceId, deletedAt: null },
      include: {
        socialAccounts: {
          where: { deletedAt: null, isActive: true },
          include: {
            dailyAnalytics: { where: { date: { gte: new Date(dateFrom), lte: new Date(dateTo) } } },
          },
        },
      },
    });

    return brands.map((brand) => {
      const platformTotals: Record<string, { impressions: number; reach: number; engagement: number; followers: number }> = {};
      for (const account of brand.socialAccounts) {
        const totals = account.dailyAnalytics.reduce(
          (acc, day) => ({ impressions: acc.impressions + day.impressions, reach: acc.reach + day.reach, engagement: acc.engagement + day.engagement }),
          { impressions: 0, reach: 0, engagement: 0 }
        );
        platformTotals[account.platform] = { ...totals, followers: account.followers };
      }
      return { brandId: brand.id, brandName: brand.name, platforms: platformTotals };
    });
  },

  async getDashboardOverview(workspaceId: string, dateFrom: string, dateTo: string) {
    const brands = await prisma.brand.findMany({
      where: { workspaceId, deletedAt: null },
      include: {
        socialAccounts: {
          where: { deletedAt: null, isActive: true },
          include: { dailyAnalytics: { where: { date: { gte: new Date(dateFrom), lte: new Date(dateTo) } } } },
        },
      },
    });

    let totalFollowers = 0, totalImpressions = 0, totalReach = 0, totalEngagement = 0, totalViews = 0;
    for (const brand of brands) {
      for (const account of brand.socialAccounts) {
        totalFollowers += account.followers;
        for (const day of account.dailyAnalytics) {
          totalImpressions += day.impressions;
          totalReach += day.reach;
          totalEngagement += day.engagement;
          totalViews += day.views;
        }
      }
    }

    // Previous period comparison
    const periodDays = new Date(dateTo).getDate() - new Date(dateFrom).getDate();
    const prevFrom = new Date(dateFrom); prevFrom.setDate(prevFrom.getDate() - periodDays);
    const prevTo = new Date(dateFrom); prevTo.setDate(prevTo.getDate() - 1);

    const prevBrands = await prisma.brand.findMany({
      where: { workspaceId, deletedAt: null },
      include: {
        socialAccounts: {
          where: { deletedAt: null, isActive: true },
          include: { dailyAnalytics: { where: { date: { gte: prevFrom, lte: prevTo } } } },
        },
      },
    });

    let prevFollowers = 0, prevImpressions = 0;
    for (const brand of prevBrands) {
      for (const account of brand.socialAccounts) {
        prevFollowers += account.followers;
        for (const day of account.dailyAnalytics) prevImpressions += day.impressions;
      }
    }

    return {
      totalFollowers, totalImpressions, totalReach, totalEngagement, totalViews,
      followersChange: prevFollowers > 0 ? Math.round(((totalFollowers - prevFollowers) / prevFollowers) * 1000) / 10 : 0,
      impressionsChange: prevImpressions > 0 ? Math.round(((totalImpressions - prevImpressions) / prevImpressions) * 1000) / 10 : 0,
      brandCount: brands.length,
      accountCount: brands.reduce((acc, b) => acc + b.socialAccounts.length, 0),
    };
  },
};
