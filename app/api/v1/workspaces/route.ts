import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api/response";
import { workspaceService } from "@/features/settings/lib/services/workspace.service";
import { isAppError } from "@/lib/api/errors";
import { requireUser } from "@/lib/auth/server";
import type { ErrorCode } from "@/lib/types/api";

export async function GET(_request: NextRequest) {
  try {
    const user = await requireUser();
    const workspaces = await workspaceService.listForUser(user.id);
    return successResponse(workspaces);
  } catch (error) {
    if (isAppError(error)) {
      return errorResponse(error.code as ErrorCode, error.message, 401);
    }
    return errorResponse("INTERNAL_ERROR", "Failed to list workspaces", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser();
    const body = await request.json();
    const workspace = await workspaceService.create(user.id, body);
    return successResponse(workspace);
  } catch (error) {
    if (isAppError(error)) {
      return errorResponse(error.code as ErrorCode, error.message, 400);
    }
    return errorResponse("INTERNAL_ERROR", "Failed to create workspace", 500);
  }
}
