import { reportRepository } from "../repositories/report.repository";
import { AppError } from "@/lib/api/errors";

export const reportService = {
  async list(workspaceId: string) {
    return reportRepository.list(workspaceId);
  },

  async create(data: {
    workspaceId: string;
    brandId?: string;
    reportType: "DAILY" | "WEEKLY" | "MONTHLY" | "QUARTERLY" | "ANNUAL" | "CUSTOM";
    format: "PDF" | "CSV" | "EXCEL" | "JSON";
    title: string;
    description?: string;
    dateRangeStart?: string;
    dateRangeEnd?: string;
    metrics?: string[];
    platforms?: string[];
  }) {
    return reportRepository.create({
      workspaceId: data.workspaceId,
      brandId: data.brandId,
      reportType: data.reportType,
      format: data.format,
      title: data.title,
      description: data.description,
      dateRangeStart: data.dateRangeStart ? new Date(data.dateRangeStart) : undefined,
      dateRangeEnd: data.dateRangeEnd ? new Date(data.dateRangeEnd) : undefined,
      metrics: data.metrics,
      platforms: data.platforms,
    });
  },

  async generateReport(reportId: string) {
    // In production, this would enqueue an Inngest job for async generation
    // For now, we'll mark it as generating
    await reportRepository.updateStatus(reportId, "GENERATING");
    return { message: "Report generation queued" };
  },
};
