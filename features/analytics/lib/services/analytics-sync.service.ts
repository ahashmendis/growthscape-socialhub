import { prisma } from "@/lib/db/client";
import { metaApi } from "@/packages/social/meta";
import { youtubeApi } from "@/packages/social/youtube";

export const analyticsSyncService = {
  async syncAccount(accountId: string, since?: string, until?: string) {
    const account = await prisma.socialAccount.findUnique({
      where: { id: accountId, deletedAt: null },
      include: { credential: true, brand: true },
    });
    if (!account?.credential) throw new Error("Account or credential not found");

    const endDate = until || new Date().toISOString().split("T")[0];
    const startDate = since || new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]; // Last 90 days

    // Update follower count from platform
    let followers = account.followers;

    switch (account.platform) {
      case "FACEBOOK":
        await this.syncFacebook(account, account.credential.accessToken, startDate, endDate);
        followers = await this.updateFacebookFollowers(account.id, account.credential.accessToken);
        break;
      case "INSTAGRAM":
        await this.syncInstagram(account, account.credential.accessToken, startDate, endDate);
        break;
      case "YOUTUBE":
        await this.syncYouTube(account, account.credential.accessToken, startDate, endDate);
        followers = await this.updateYouTubeFollowers(account.id, account.credential.accessToken);
        break;
    }

    // Update account followers
    await prisma.socialAccount.update({
      where: { id: account.id },
      data: { followers, lastSyncedAt: new Date() },
    });

    // Create sync job record
    await prisma.syncJob.create({
      data: {
        workspaceId: account.brand.workspaceId,
        socialAccountId: account.id,
        jobType: "ANALYTICS_INCREMENTAL",
        status: "COMPLETED",
        provider: account.platform.toLowerCase(),
        startedAt: new Date(),
        finishedAt: new Date(),
        recordsProcessed: Math.floor((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)),
      },
    });
  },

  async syncFacebook(account: { id: string; platformId: string }, accessToken: string, since: string, until: string) {
    const insights = await metaApi.getPageInsights(account.platformId, accessToken, since, until);

    for (const day of insights) {
      await prisma.dailyAnalytics.upsert({
        where: { socialAccountId_date: { socialAccountId: account.id, date: new Date(day.date) } },
        create: {
          socialAccountId: account.id,
          date: new Date(day.date),
          impressions: day.impressions,
          reach: day.reach,
          engagement: day.engagement,
        },
        update: {
          impressions: day.impressions,
          reach: day.reach,
          engagement: day.engagement,
        },
      });
    }
  },

  async syncInstagram(account: { id: string; platformId: string }, accessToken: string, since: string, until: string) {
    const insights = await metaApi.getInstagramInsights(account.platformId, accessToken, since, until);

    for (const day of insights) {
      await prisma.dailyAnalytics.upsert({
        where: { socialAccountId_date: { socialAccountId: account.id, date: new Date(day.date) } },
        create: {
          socialAccountId: account.id,
          date: new Date(day.date),
          impressions: day.impressions,
          reach: day.reach,
          engagement: day.engagement,
          followers: day.followers,
        },
        update: {
          impressions: day.impressions,
          reach: day.reach,
          engagement: day.engagement,
          followers: day.followers,
        },
      });
    }
  },

  async syncYouTube(account: { id: string }, accessToken: string, since: string, until: string) {
    const analytics = await youtubeApi.getDailyAnalytics(accessToken, since, until);

    for (const day of analytics) {
      await prisma.dailyAnalytics.upsert({
        where: { socialAccountId_date: { socialAccountId: account.id, date: new Date(day.date) } },
        create: {
          socialAccountId: account.id,
          date: new Date(day.date),
          views: day.views,
          watchTimeSeconds: Math.round(day.estimatedMinutesWatched * 60),
          engagement: day.likes + day.comments,
          likes: day.likes,
          comments: day.comments,
        },
        update: {
          views: day.views,
          watchTimeSeconds: Math.round(day.estimatedMinutesWatched * 60),
          engagement: day.likes + day.comments,
          likes: day.likes,
          comments: day.comments,
        },
      });
    }
  },

  async updateFacebookFollowers(accountId: string, accessToken: string): Promise<number> {
    // Fetch latest page info for follower count
    return 0; // Placeholder - requires additional API call
  },

  async updateYouTubeFollowers(accountId: string, accessToken: string): Promise<number> {
    const channel = await youtubeApi.getChannel(accessToken);
    if (channel) {
      await prisma.socialAccount.update({
        where: { id: accountId },
        data: { followers: channel.subscriberCount },
      });
      return channel.subscriberCount;
    }
    return 0;
  },
};
