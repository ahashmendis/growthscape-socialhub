import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api/response";
import { analyticsService } from "@/features/analytics/lib/services/analytics.service";
import { isAppError } from "@/lib/api/errors";
import { requireUser } from "@/lib/auth/server";
import type { ErrorCode } from "@/lib/types/api";

export async function POST(request: NextRequest) {
  try {
    await requireUser();
    const body = await request.json();
    const { workspaceId, socialAccountId, platform } = body;

    if (!workspaceId || !socialAccountId || !platform) {
      return errorResponse("BAD_REQUEST" as ErrorCode, "Missing required fields", 400);
    }

    const result = await analyticsService.triggerSync(workspaceId, socialAccountId, platform);
    return successResponse(result);
  } catch (error) {
    if (isAppError(error)) {
      return errorResponse(error.code as ErrorCode, error.message, 401);
    }
    return errorResponse("INTERNAL_ERROR", "Failed to trigger sync", 500);
  }
}
