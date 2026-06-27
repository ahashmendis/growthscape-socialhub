import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api/response";
import { socialService } from "@/features/settings/lib/services/social.service";
import { isAppError } from "@/lib/api/errors";
import { requireUser } from "@/lib/auth/server";
import type { ErrorCode } from "@/lib/types/api";

export async function POST(request: NextRequest) {
  try {
    await requireUser();
    const body = await request.json();
    const url = await socialService.getOAuthUrl(body.platform, body.brandId, body.workspaceId);
    return successResponse({ authUrl: url });
  } catch (error) {
    if (isAppError(error)) {
      return errorResponse(error.code as ErrorCode, error.message, error.code === "NOT_FOUND" ? 404 : 400);
    }
    return errorResponse("INTERNAL_ERROR", "Failed to get OAuth URL", 500);
  }
}
