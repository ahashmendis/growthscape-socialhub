// YouTube Data API v3 client
export interface YouTubeChannel {
  id: string;
  title: string;
  customUrl: string;
  thumbnailUrl: string;
  subscriberCount: string;
  videoCount: string;
  viewCount: string;
}

export interface YouTubeVideo {
  id: string;
  title: string;
  publishedAt: string;
  viewCount: string;
  likeCount: string;
  commentCount: string;
}

export interface YouTubeAnalyticsResponse {
  columnHeaders: { name: string; columnType: string; dataType: string }[];
  rows: (string | number)[][];
}

const YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3";
const YOUTUBE_ANALYTICS_BASE = "https://youtubeanalytics.googleapis.com/v2/reports";

export const youtubeApi = {
  async getChannel(accessToken: string): Promise<YouTubeChannel | null> {
    const params = new URLSearchParams({
      part: "snippet,statistics",
      mine: "true",
      access_token: accessToken,
    });

    const response = await fetch(`${YOUTUBE_API_BASE}/channels?${params}`);
    if (!response.ok) throw new Error(`YouTube API error: ${response.statusText}`);
    const data = await response.json();
    if (!data.items?.length) return null;

    const item = data.items[0];
    return {
      id: item.id,
      title: item.snippet.title,
      customUrl: item.snippet.customUrl || "",
      thumbnailUrl: item.snippet.thumbnails?.default?.url || "",
      subscriberCount: item.statistics?.subscriberCount || "0",
      videoCount: item.statistics?.videoCount || "0",
      viewCount: item.statistics?.viewCount || "0",
    };
  },

  async getChannelAnalytics(
    channelId: string,
    accessToken: string,
    startDate: string,
    endDate: string
  ): Promise<YouTubeAnalyticsResponse> {
    const params = new URLSearchParams({
      ids: `channel==${channelId}`,
      startDate,
      endDate,
      metrics: "views,estimatedMinutesWatched,averageViewDuration,averageViewPercentage,subscribersGained,likes,dislikes,shares,comments",
      dimensions: "day",
      sort: "day",
      access_token: accessToken,
      maxResults: "1000",
    });

    const response = await fetch(`${YOUTUBE_ANALYTICS_BASE}?${params}`);
    if (!response.ok) throw new Error(`YouTube Analytics error: ${response.statusText}`);
    return response.json();
  },

  async getVideoList(
    channelId: string,
    accessToken: string,
    maxResults = 50
  ): Promise<YouTubeVideo[]> {
    // First get video IDs
    const searchParams = new URLSearchParams({
      part: "id",
      channelId,
      order: "date",
      maxResults: maxResults.toString(),
      type: "video",
      access_token: accessToken,
    });

    const searchResponse = await fetch(`${YOUTUBE_API_BASE}/search?${searchParams}`);
    if (!searchResponse.ok) throw new Error(`YouTube API error: ${searchResponse.statusText}`);
    const searchData = await searchResponse.json();

    if (!searchData.items?.length) return [];

    const videoIds = searchData.items.map((item: { id: { videoId: string } }) => item.id.videoId).join(",");

    // Then get video stats
    const videoParams = new URLSearchParams({
      part: "snippet,statistics",
      id: videoIds,
      access_token: accessToken,
    });

    const videoResponse = await fetch(`${YOUTUBE_API_BASE}/videos?${videoParams}`);
    if (!videoResponse.ok) throw new Error(`YouTube API error: ${videoResponse.statusText}`);
    const videoData = await videoResponse.json();

    return videoData.items.map((item: any) => ({
      id: item.id,
      title: item.snippet.title,
      publishedAt: item.snippet.publishedAt,
      viewCount: item.statistics.viewCount,
      likeCount: item.statistics.likeCount,
      commentCount: item.statistics.commentCount,
    }));
  },
};
