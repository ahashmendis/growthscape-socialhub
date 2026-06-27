// YouTube Data API v3 + Analytics API adapter

export interface YouTubeChannel {
  id: string;
  title: string;
  customUrl: string;
  subscriberCount: number;
  viewCount: number;
  videoCount: number;
}

export interface YouTubeDailyAnalytics {
  date: string;
  views: number;
  estimatedMinutesWatched: number;
  averageViewDuration: number;
  subscribersGained: number;
  likes: number;
  comments: number;
}

export const youtubeApi = {
  async getChannel(accessToken: string): Promise<YouTubeChannel | null> {
    const res = await fetch("https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&mine=true", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error.message);
    if (!data.items?.length) return null;

    const ch = data.items[0];
    return {
      id: ch.id,
      title: ch.snippet.title,
      customUrl: ch.snippet.customUrl || "",
      subscriberCount: parseInt(ch.statistics.subscriberCount || "0", 10),
      viewCount: parseInt(ch.statistics.viewCount || "0", 10),
      videoCount: parseInt(ch.statistics.videoCount || "0", 10),
    };
  },

  async getDailyAnalytics(accessToken: string, since: string, until: string): Promise<YouTubeDailyAnalytics[]> {
    const metrics = "views,estimatedMinutesWatched,averageViewDuration,subscribersGained,likes,comments";
    const url = `https://youtubeanalytics.googleapis.com/v2/reports?ids=channel==MINE&startDate=${since}&endDate=${until}&metrics=${metrics}&dimensions=day&sort=day`;

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error.message);

    // YouTube Analytics returns data in column-based format:
    // { columnHeaders: [{name: "day"}, {name: "views"}, ...], rows: [["2024-01-01", 1000, ...], ...] }
    const headers = data.columnHeaders?.map((h: { name: string }) => h.name) || [];
    const rows = data.rows || [];

    return rows.map((row: unknown[]) => {
      const record: Record<string, unknown> = {};
      headers.forEach((h: string, i: number) => { record[h] = row[i]; });
      return {
        date: (record.day as string) || "",
        views: parseInt(record.views as string || "0", 10),
        estimatedMinutesWatched: parseInt(record.estimatedMinutesWatched as string || "0", 10),
        averageViewDuration: parseFloat(record.averageViewDuration as string || "0"),
        subscribersGained: parseInt(record.subscribersGained as string || "0", 10),
        likes: parseInt(record.likes as string || "0", 10),
        comments: parseInt(record.comments as string || "0", 10),
      };
    });
  },

  async refreshAccessToken(refreshToken: string, clientId: string, clientSecret: string): Promise<string> {
    const res = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: "refresh_token",
      }),
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error_description);
    return data.access_token;
  },
};
