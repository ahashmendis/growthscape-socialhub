// Publish adapter for Facebook Pages & Instagram

export const facebookPublishApi = {
  async publishToFacebookPage(
    pageId: string,
    accessToken: string,
    params: { message: string; scheduledTime?: string; mediaUrls?: string[] }
  ) {
    const url = `https://graph.facebook.com/v18.0/${pageId}/feed`;
    const body: Record<string, unknown> = {
      message: params.message,
      access_token: accessToken,
    };

    if (params.scheduledTime) {
      body.published = false;
      body.scheduled_publish_time = Math.floor(new Date(params.scheduledTime).getTime() / 1000);
    }

    if (params.mediaUrls?.length) {
      // Facebook photo upload requires separate multipart upload
      // For now, text-only or use link sharing
      body.link = params.mediaUrls[0];
    }

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error.message);
    return { postId: data.id, url: `https://facebook.com/${data.id}` };
  },

  async publishToInstagram(
    instagramBusinessId: string,
    accessToken: string,
    params: { caption: string; mediaUrl: string; mediaType?: "IMAGE" | "VIDEO" | "CAROUSEL" }
  ) {
    // Step 1: Create media container
    const containerUrl = `https://graph.facebook.com/v18.0/${instagramBusinessId}/media`;
    const containerBody: Record<string, unknown> = {
      image_url: params.mediaUrl,
      caption: params.caption,
      access_token: accessToken,
    };
    if (params.mediaType === "VIDEO") {
      containerBody.video_url = params.mediaUrl;
      containerBody.media_type = "VIDEO";
      delete containerBody.image_url;
    }
    if (params.mediaType === "CAROUSEL") {
      containerBody.media_type = "CAROUSEL";
      containerBody.children = params.mediaUrl; // Comma-separated URLs
    }

    const containerRes = await fetch(containerUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(containerBody),
    });
    const containerData = await containerRes.json();
    if (containerData.error) throw new Error(containerData.error.message);

    // Step 2: Publish the container
    const publishUrl = `https://graph.facebook.com/v18.0/${instagramBusinessId}/media_publish`;
    const publishRes = await fetch(publishUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        creation_id: containerData.id,
        access_token: accessToken,
      }),
    });
    const publishData = await publishRes.json();
    if (publishData.error) throw new Error(publishData.error.message);

    return { postId: publishData.id };
  },

  async scheduleInstagramPost(
    instagramBusinessId: string,
    accessToken: string,
    params: { caption: string; mediaUrl: string; scheduledTime: string }
  ) {
    // Instagram doesn't support direct scheduling via API
    // Create the post and store for manual publishing or use a workaround
    return this.publishToInstagram(instagramBusinessId, accessToken, {
      caption: params.caption,
      mediaUrl: params.mediaUrl,
    });
  },
};
