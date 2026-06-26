// Meta Graph API client for Facebook & Instagram
export interface MetaPage {
  id: string;
  name: string;
  access_token: string;
  instagram_business_account?: { id: string };
}

export interface MetaInsightsResponse {
  data: {
    name: string;
    values: { value: number; end_time?: string }[];
    period?: string;
    title?: string;
    description?: string;
  }[];
  paging?: { previous?: string; next?: string };
}

export interface FacebookMetrics {
  followers: number;
  impressions: number;
  reach: number;
  engagement: number;
  likes: number;
  comments: number;
  shares: number;
  clicks: number;
}

export interface InstagramMetrics {
  followers: number;
  impressions: number;
  reach: number;
  engagement: number;
  likes: number;
  comments: number;
  saves: number;
  profileViews: number;
}

const GRAPH_API_BASE = "https://graph.facebook.com/v18.0";

export const metaApi = {
  async getPages(accessToken: string): Promise<MetaPage[]> {
    const response = await fetch(
      `${GRAPH_API_BASE}/me/accounts?access_token=${accessToken}&fields=id,name,access_token,instagram_business_account{id}`
    );
    if (!response.ok) throw new Error(`Meta API error: ${response.statusText}`);
    const data = await response.json();
    return data.data || [];
  },

  async getFacebookInsights(
    pageId: string,
    accessToken: string,
    since: string,
    until: string
  ): Promise<MetaInsightsResponse> {
    const params = new URLSearchParams({
      access_token: accessToken,
      metric: "page_impressions,page_posts_impressions,page_engaged_users,page_fans,page_post_engagements,page_actions_post_reactions_like_total",
      since,
      until,
    });

    const response = await fetch(`${GRAPH_API_BASE}/${pageId}/insights?${params}`);
    if (!response.ok) throw new Error(`Meta API error: ${response.statusText}`);
    return response.json();
  },

  async getInstagramInsights(
    igAccountId: string,
    accessToken: string,
    since: string,
    until: string
  ): Promise<MetaInsightsResponse> {
    const params = new URLSearchParams({
      access_token: accessToken,
      metric: "impressions,reach,profile_views,follower_count,online_followers,email_contacts,get_directions_clicks,text_message_clicks,call_clicks",
      period: "day",
      since,
      until,
    });

    const response = await fetch(`${GRAPH_API_BASE}/${igAccountId}/insights?${params}`);
    if (!response.ok) throw new Error(`Meta API error: ${response.statusText}`);
    return response.json();
  },

  async getFacebookPostsInsights(
    pageId: string,
    accessToken: string
  ): Promise<MetaInsightsResponse> {
    const params = new URLSearchParams({
      access_token: accessToken,
      fields: "message,created_time,shares,likes.summary(true),comments.summary(true),insights.metric(post_impressions,post_engagements)",
      since: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    });

    const response = await fetch(`${GRAPH_API_BASE}/${pageId}/posts?${params}`);
    if (!response.ok) throw new Error(`Meta API error: ${response.statusText}`);
    return response.json();
  },
};
