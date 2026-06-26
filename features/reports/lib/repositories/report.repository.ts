import { prisma } from "@/lib/db/client";

export const reportRepository = {
  async list(workspaceId: string, limit = 20) {
    return prisma.report.findMany({
      where: { workspaceId },
      include: { brand: { select: { name: true, logoUrl: true } } },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  },

  async create(data: {
    workspaceId: string;
    brandId?: string;
    reportType: string;
    format: string;
    title: string;
    description?: string;
    dateRangeStart?: Date;
    dateRangeEnd?: Date;
    metrics?: string[];
    platforms?: string[];
  }) {
    return prisma.report.create({
      data: {
        workspaceId: data.workspaceId,
        brandId: data.brandId || null,
        reportType: data.reportType as any,
        format: data.format as any,
        title: data.title,
        description: data.description || null,
        dateRangeStart: data.dateRangeStart || null,
        dateRangeEnd: data.dateRangeEnd || null,
        metrics: data.metrics || [],
        platforms: (data.platforms || []) as any[],
        status: "PENDING",
      },
    });
  },

  async updateStatus(id: string, status: string, fileUrl?: string, errorMessage?: string) {
    return prisma.report.update({
      where: { id },
      data: {
        status: status as any,
        fileUrl: fileUrl || null,
        errorMessage: errorMessage || null,
        deliveredAt: status === "COMPLETED" ? new Date() : undefined,
      },
    });
  },
};
