import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api/response";
import { socialAccountRepository } from "@/features/settings/lib/repositories/social.repository";
import { isAppError } from "@/lib/api/errors";
import { requireUser } from "@/lib/auth/server";
import type { ErrorCode } from "@/lib/types/api";

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  try {
    await requireUser();
    await socialAccountRepository.softDelete(id);
    return successResponse({ disconnected: true });
  } catch (error) {
    if (isAppError(error)) {
      return errorResponse(error.code as ErrorCode, error.message, 401);
    }
    return errorResponse("INTERNAL_ERROR", "Failed to disconnect account", 500);
  }
}
