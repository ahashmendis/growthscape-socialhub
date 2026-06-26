import { prisma } from "@/lib/db/client";

export const publishQueueRepository = {
  async enqueue(scheduledPostId: string) {
    return prisma.publishQueue.create({
      data: {
        scheduledPostId,
        status: "PENDING",
        priority: 0,
      },
    });
  },

  async getPending() {
    return prisma.publishQueue.findMany({
      where: {
        status: { in: ["PENDING", "RETRYING"] },
        OR: [
          { nextRetryAt: null },
          { nextRetryAt: { lte: new Date() } },
        ],
      },
      include: {
        scheduledPost: {
          include: {
            socialAccount: { include: { credential: true } },
            media: { orderBy: { order: "asc" } },
          },
        },
      },
      orderBy: [{ priority: "desc" }, { createdAt: "asc" }],
    });
  },

  async updateStatus(id: string, status: string, failureReason?: string) {
    const data: Record<string, unknown> = { status };
    if (status === "PROCESSING") {
      data.retryCount = { increment: 1 };
    }
    if (status === "FAILED" || status === "RETRYING") {
      data.failureReason = failureReason;
      data.nextRetryAt = new Date(Date.now() + 5 * 60 * 1000); // 5 min retry
    }
    if (status === "SENT") {
      data.sentAt = new Date();
    }

    return prisma.publishQueue.update({
      where: { id },
      data,
    });
  },
};
