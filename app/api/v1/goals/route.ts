import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api/response";
import { goalService } from "@/features/goals/lib/services/goal.service";
import { isAppError } from "@/lib/api/errors";
import { requireUser } from "@/lib/auth/server";
import type { ErrorCode } from "@/lib/types/api";

export async function GET(request: NextRequest) {
  try {
    await requireUser();
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get("workspaceId");
    const brandId = searchParams.get("brandId") || undefined;

    if (!workspaceId) {
      return errorResponse("BAD_REQUEST" as ErrorCode, "workspaceId is required", 400);
    }

    const goals = await goalService.list(workspaceId, brandId);
    return successResponse(goals);
  } catch (error) {
    if (isAppError(error)) {
      return errorResponse(error.code as ErrorCode, error.message, 401);
    }
    return errorResponse("INTERNAL_ERROR", "Failed to list goals", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser();
    const body = await request.json();
    const { workspaceId, type, target, brandId, deadline } = body;

    if (!workspaceId || !type || !target) {
      return errorResponse("BAD_REQUEST" as ErrorCode, "workspaceId, type, and target are required", 400);
    }

    const goal = await goalService.create(user.id, workspaceId, { type, target, brandId, deadline });
    return successResponse(goal);
  } catch (error) {
    if (isAppError(error)) {
      return errorResponse(error.code as ErrorCode, error.message, 400);
    }
    return errorResponse("INTERNAL_ERROR", "Failed to create goal", 500);
  }
}
