import { prisma } from "@/lib/db/client";

export const syncJobRepository = {
  async create(data: {
    workspaceId: string;
    jobType: string;
    provider?: string;
    socialAccountId?: string;
  }) {
    return prisma.syncJob.create({
      data: {
        workspaceId: data.workspaceId,
        jobType: data.jobType as any,
        provider: data.provider,
        socialAccountId: data.socialAccountId,
      },
    });
  },

  async updateStatus(
    jobId: string,
    status: "PENDING" | "RUNNING" | "COMPLETED" | "FAILED" | "PARTIAL",
    recordsProcessed?: number,
    errorMessage?: string
  ) {
    const data: Record<string, unknown> = { status };
    if (recordsProcessed !== undefined) data.recordsProcessed = recordsProcessed;
    if (errorMessage !== undefined) data.errorMessage = errorMessage;
    if (status === "RUNNING") data.startedAt = new Date();
    if (status === "COMPLETED" || status === "FAILED") data.finishedAt = new Date();

    return prisma.syncJob.update({ where: { id: jobId }, data });
  },

  async listByWorkspace(workspaceId: string, limit = 20) {
    return prisma.syncJob.findMany({
      where: { workspaceId },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  },

  async getPendingRetries() {
    return prisma.syncJob.findMany({
      where: {
        status: { in: ["PENDING", "FAILED"] },
        retryCount: { lt: 3 },
        OR: [
          { nextRetryAt: null },
          { nextRetryAt: { lte: new Date() } },
        ],
      },
    });
  },
};
