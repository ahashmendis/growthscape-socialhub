import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api/response";
import { analyticsService } from "@/features/analytics/lib/services/analytics.service";
import { isAppError } from "@/lib/api/errors";
import { requireUser } from "@/lib/auth/server";
import type { ErrorCode } from "@/lib/types/api";

export async function GET(request: NextRequest) {
  try {
    await requireUser();
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get("workspaceId");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");

    if (!workspaceId || !dateFrom || !dateTo) {
      return errorResponse("BAD_REQUEST" as ErrorCode, "Missing required parameters", 400);
    }

    const data = await analyticsService.getCrossPlatformComparison(workspaceId, dateFrom, dateTo);
    return successResponse(data);
  } catch (error) {
    if (isAppError(error)) {
      return errorResponse(error.code as ErrorCode, error.message, 401);
    }
    return errorResponse("INTERNAL_ERROR", "Failed to fetch comparison", 500);
  }
}
