import { inngest } from "@/jobs";
import { prisma } from "@/lib/db/client";
import { facebookPublishApi } from "@/packages/social/facebook";
import { youtubePublishApi } from "@/packages/social/youtube-publish";

export const processPublishQueue = inngest.createFunction(
  { id: "publish-process-queue" },
  { cron: "*/5 * * * *" }, // Every 5 minutes
  async ({ step }) => {
    // Get pending/retiring posts due for publishing
    const duePosts = await step.run("get-due-posts", async () => {
      return prisma.scheduledPost.findMany({
        where: {
          status: "SCHEDULED",
          scheduledFor: { lte: new Date() },
          deletedAt: null,
        },
        include: {
          socialAccount: { include: { credential: true } },
          media: { orderBy: { order: "asc" } },
        },
        take: 10,
      });
    });

    const results = [];
    for (const post of duePosts) {
      const result = await step.run(`publish-${post.id}`, async () => {
        try {
          if (!post.socialAccount?.credential?.accessToken) {
            throw new Error("No access token");
          }

          let publishResult: { postId: string; url?: string };

          switch (post.socialAccount.platform) {
            case "FACEBOOK":
              publishResult = await facebookPublishApi.publishToFacebookPage(
                post.socialAccount.platformId,
                post.socialAccount.credential.accessToken,
                {
                  message: post.caption,
                  mediaUrls: post.media.map((m) => m.url),
                }
              );
              break;

            case "INSTAGRAM":
              if (post.media.length === 0) throw new Error("Instagram requires media");
              publishResult = await facebookPublishApi.publishToInstagram(
                post.socialAccount.platformId,
                post.socialAccount.credential.accessToken,
                {
                  caption: post.caption,
                  mediaUrl: post.media[0].url,
                  mediaType: post.media[0].type as any,
                }
              );
              break;

            case "YOUTUBE":
              if (post.media.length === 0) throw new Error("YouTube requires video");
              const ytResult = await youtubePublishApi.uploadVideo(
                post.socialAccount.credential.accessToken,
                {
                  title: post.title || post.caption.slice(0, 100),
                  description: post.caption,
                  tags: post.hashtags,
                }
              );
              publishResult = { postId: ytResult.videoId, url: ytResult.url };
              break;

            default:
              throw new Error(`Unsupported platform: ${post.socialAccount.platform}`);
          }

          await prisma.scheduledPost.update({
            where: { id: post.id },
            data: {
              status: "PUBLISHED",
              publishedAt: new Date(),
              platformPostId: publishResult.postId,
              platformUrl: publishResult.url || null,
            },
          });

          return { success: true, postId: publishResult.postId };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Unknown error";

          // Check if we should retry
          const queueEntry = await prisma.publishQueue.findFirst({
            where: { scheduledPostId: post.id },
            orderBy: { createdAt: "desc" },
          });

          if (queueEntry && queueEntry.retryCount < queueEntry.maxRetries) {
            await prisma.publishQueue.update({
              where: { id: queueEntry.id },
              data: {
                status: "RETRYING",
                failureReason: errorMessage,
                nextRetryAt: new Date(Date.now() + 5 * 60 * 1000), // 5 min retry
              },
            });
            return { success: false, retrying: true, error: errorMessage };
          }

          // Max retries exceeded
          await prisma.scheduledPost.update({
            where: { id: post.id },
            data: { status: "FAILED" },
          });

          return { success: false, error: errorMessage };
        }
      });

      results.push({ postId: post.id, ...result });
    }

    return { processed: results.length, results };
  }
);
