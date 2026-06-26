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

    if (!workspaceId) {
      return errorResponse("BAD_REQUEST" as ErrorCode, "Missing workspaceId", 400);
    }

    const recommendations = await aiService.getRecommendations(workspaceId);
    return successResponse(recommendations);
  } catch (error) {
    if (isAppError(error)) {
      return errorResponse(error.code as ErrorCode, error.message, 401);
    }
    return errorResponse("INTERNAL_ERROR", "Failed to get recommendations", 500);
  }
}
