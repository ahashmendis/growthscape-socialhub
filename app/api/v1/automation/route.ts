import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api/response";
import { automationService } from "@/features/automation/lib/services/automation.service";
import { isAppError } from "@/lib/api/errors";
import { requireUser } from "@/lib/auth/server";
import type { ErrorCode } from "@/lib/types/api";

export async function GET(request: NextRequest) {
  try {
    await requireUser();
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get("workspaceId");

    if (!workspaceId) {
      return errorResponse("BAD_REQUEST" as ErrorCode, "workspaceId is required", 400);
    }

    const rules = await automationService.listRules(workspaceId);
    return successResponse(rules);
  } catch (error) {
    if (isAppError(error)) {
      return errorResponse(error.code as ErrorCode, error.message, 401);
    }
    return errorResponse("INTERNAL_ERROR", "Failed to list rules", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser();
    const body = await request.json();
    const { workspaceId, name, trigger, action, config } = body;

    if (!workspaceId || !name || !trigger || !action) {
      return errorResponse("BAD_REQUEST" as ErrorCode, "workspaceId, name, trigger, and action are required", 400);
    }

    const rule = await automationService.createRule(user.id, workspaceId, { name, trigger, action, config });
    return successResponse(rule);
  } catch (error) {
    if (isAppError(error)) {
      return errorResponse(error.code as ErrorCode, error.message, 400);
    }
    return errorResponse("INTERNAL_ERROR", "Failed to create rule", 500);
  }
}
