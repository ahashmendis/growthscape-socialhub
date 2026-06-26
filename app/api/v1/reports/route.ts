import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api/response";
import { reportService } from "@/features/reports/lib/services/report.service";
import { isAppError } from "@/lib/api/errors";
import { requireUser } from "@/lib/auth/server";
import type { ErrorCode } from "@/lib/types/api";

export async function GET(request: NextRequest) {
  try {
    await requireUser();
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get("workspaceId");

    if (!workspaceId) {
      return errorResponse("BAD_REQUEST" as ErrorCode, "Missing workspaceId", 400);
    }

    const reports = await reportService.list(workspaceId);
    return successResponse(reports);
  } catch (error) {
    if (isAppError(error)) {
      return errorResponse(error.code as ErrorCode, error.message, 401);
    }
    return errorResponse("INTERNAL_ERROR", "Failed to list reports", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireUser();
    const body = await request.json();
    const { workspaceId, brandId, reportType, format, title, description, dateRangeStart, dateRangeEnd, metrics, platforms } = body;

    if (!workspaceId || !reportType || !format || !title) {
      return errorResponse("BAD_REQUEST" as ErrorCode, "Missing required fields", 400);
    }

    const report = await reportService.create({
      workspaceId, brandId, reportType, format, title, description, dateRangeStart, dateRangeEnd, metrics, platforms,
    });
    return successResponse(report);
  } catch (error) {
    if (isAppError(error)) {
      return errorResponse(error.code as ErrorCode, error.message, 400);
    }
    return errorResponse("INTERNAL_ERROR", "Failed to create report", 500);
  }
}
