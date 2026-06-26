import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api/response";
import { socialAccountRepository } from "@/features/settings/lib/repositories/social.repository";
import { brandRepository } from "@/features/settings/lib/repositories/brand.repository";
import { isAppError } from "@/lib/api/errors";
import { requireUser } from "@/lib/auth/server";
import type { ErrorCode } from "@/lib/types/api";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  try {
    await requireUser();
    const brand = await brandRepository.findById(id);
    if (!brand) return errorResponse("NOT_FOUND", "Brand not found", 404);

    const accounts = await socialAccountRepository.findByBrandId(id);
    return successResponse(accounts);
  } catch (error) {
    if (isAppError(error)) {
      return errorResponse(error.code as ErrorCode, error.message, 401);
    }
    return errorResponse("INTERNAL_ERROR", "Failed to list social accounts", 500);
  }
}
