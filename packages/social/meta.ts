// Meta (Facebook + Instagram) Graph API adapter

export interface MetaPageInsights {
  date: string;
  impressions: number;
  reach: number;
  engagement: number;
  pageFans: number;
}

export interface MetaInstagramInsights {
  date: string;
  impressions: number;
  reach: number;
  engagement: number;
  followers: number;
  profileViews: number;
}

export const metaApi = {
  async getPageInsights(pageId: string, accessToken: string, since: string, until: string): Promise<MetaPageInsights[]> {
    const fields = ["page_impressions_unique", "page_posts_impressions_unique", "page_post_engagements", "page_fans", "page_impressions", "page_engaged_users"].join(",");
    const url = `https://graph.facebook.com/v18.0/${pageId}/insights?fields=${fields}&period=day&since=${since}&until=${until}&access_token=${accessToken}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.error) throw new Error(data.error.message);

    const metrics: Record<string, Record<string, { value: number; end_time: string }>> = {};
    for (const insight of data.data || []) {
      metrics[insight.name] = {};
      for (const v of insight.values || []) {
        const date = v.end_time.split("T")[0];
        metrics[insight.name][date] = v;
      }
    }

    const dates = new Set<string>();
    for (const name of Object.keys(metrics)) {
      for (const date of Object.keys(metrics[name])) dates.add(date);
    }

    return Array.from(dates).sort().map((date) => ({
      date,
      impressions: metrics["page_impressions"]?.[date]?.value || 0,
      reach: metrics["page_impressions_unique"]?.[date]?.value || 0,
      engagement: metrics["page_post_engagements"]?.[date]?.value || 0,
      pageFans: metrics["page_fans"]?.[date]?.value || 0,
    }));
  },

  async getInstagramInsights(igBusinessId: string, accessToken: string, since: string, until: string): Promise<MetaInstagramInsights[]> {
    const url = `https://graph.facebook.com/v18.0/${igBusinessId}/insights?metric=impressions,reach,profile_views,follower_count&period=day&since=${since}&until=${until}&access_token=${accessToken}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.error) throw new Error(data.error.message);

    const metrics: Record<string, Record<string, { value: number }>> = {};
    for (const insight of data.data || []) {
      metrics[insight.name] = {};
      for (const v of insight.values || []) {
        metrics[insight.name][v.end_time.split("T")[0]] = v;
      }
    }

    const dates = new Set<string>();
    for (const name of Object.keys(metrics)) {
      for (const date of Object.keys(metrics[name])) dates.add(date);
    }

    return Array.from(dates).sort().map((date) => ({
      date,
      impressions: metrics["impressions"]?.[date]?.value || 0,
      reach: metrics["reach"]?.[date]?.value || 0,
      engagement: metrics["profile_views"]?.[date]?.value || 0,
      followers: metrics["follower_count"]?.[date]?.value || 0,
      profileViews: metrics["profile_views"]?.[date]?.value || 0,
    }));
  },

  async getUserPages(accessToken: string) {
    const res = await fetch(`https://graph.facebook.com/v18.0/me/accounts?fields=id,name,username,fan_count,instagram_business_account{id,username}&access_token=${accessToken}`);
    const data = await res.json();
    if (data.error) throw new Error(data.error.message);
    return data.data || [];
  },
};
