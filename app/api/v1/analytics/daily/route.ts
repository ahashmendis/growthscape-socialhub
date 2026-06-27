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
    const socialAccountId = searchParams.get("socialAccountId");
    const dateFrom = searchParams.get("dateFrom") || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    const dateTo = searchParams.get("dateTo") || new Date().toISOString().split("T")[0];

    if (!socialAccountId) {
      return errorResponse("BAD_REQUEST" as ErrorCode, "socialAccountId is required", 400);
    }

    const data = await analyticsService.getDailyAnalytics({ socialAccountId, dateFrom, dateTo });
    return successResponse(data);
  } catch (error) {
    if (isAppError(error)) {
      return errorResponse(error.code as ErrorCode, error.message, 401);
    }
    return errorResponse("INTERNAL_ERROR", "Failed to fetch analytics", 500);
  }
}
