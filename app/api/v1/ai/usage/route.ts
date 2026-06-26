import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api/response";
import { aiService } from "@/features/ai/lib/services/ai.service";
import { isAppError } from "@/lib/api/errors";
import { requireUser } from "@/lib/auth/server";
import type { ErrorCode } from "@/lib/types/api";

export async function GET(request: NextRequest) {
  try {
    await requireUser();
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get("workspaceId");
    const days = parseInt(searchParams.get("days") || "30");

    if (!workspaceId) {
      return errorResponse("BAD_REQUEST" as ErrorCode, "Missing workspaceId", 400);
    }

    const usage = await aiService.getUsage(workspaceId, days);
    return successResponse(usage);
  } catch (error) {
    if (isAppError(error)) {
      return errorResponse(error.code as ErrorCode, error.message, 401);
    }
    return errorResponse("INTERNAL_ERROR", "Failed to get usage stats", 500);
  }
}
