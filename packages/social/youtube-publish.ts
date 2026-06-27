// YouTube Data API v3 for video uploads

export const youtubePublishApi = {
  async uploadVideo(
    accessToken: string,
    params: {
      title: string;
      description: string;
      tags?: string[];
      // Note: Actual video upload requires multipart/resumable upload
      // This is a simplified version for metadata-only
      videoId?: string; // If video already uploaded via resumable upload
    }
  ) {
    // Full video upload requires multipart POST to upload endpoint
    // This handles the metadata update for an existing video
    if (params.videoId) {
      const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet`;
      const res = await fetch(url, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: params.videoId,
          snippet: {
            title: params.title,
            description: params.description,
            tags: params.tags || [],
          },
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error.message);
      return { videoId: data.id, url: `https://youtube.com/watch?v=${data.id}` };
    }

    throw new Error("Video upload requires multipart/resumable upload. Use YouTube client library for full upload.");
  },

  async getUploadStatus(videoId: string, accessToken: string) {
    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=status,snippet&id=${videoId}`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    const data = await res.json();
    if (data.error) throw new Error(data.error.message);
    if (!data.items?.length) return null;

    const video = data.items[0];
    return {
      status: video.status.privacyStatus,
      uploadStatus: video.status.uploadStatus,
      failureReason: video.status.failureReason,
      rejectionReason: video.status.rejectionReason,
    };
  },
};
