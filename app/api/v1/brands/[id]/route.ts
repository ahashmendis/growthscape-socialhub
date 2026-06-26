import { NextRequest } from "next/server";
import { successResponse, errorResponse, validationError } from "@/lib/api/response";
import { brandService } from "@/features/settings/lib/services/brand.service";
import { updateBrandSchema } from "@/features/settings/schemas/brand";
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
    const brand = await brandService.getById(id);
    return successResponse(brand);
  } catch (error) {
    if (isAppError(error)) {
      return errorResponse(error.code as ErrorCode, error.message, 404);
    }
    return errorResponse("INTERNAL_ERROR", "Failed to get brand", 500);
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  try {
    await requireUser();
    const body = await request.json();
    const validation = updateBrandSchema.safeParse(body);
    if (!validation.success) {
      return validationError(validation.error.flatten().fieldErrors);
    }

    const brand = await brandService.update(id, validation.data);
    return successResponse(brand);
  } catch (error) {
    if (isAppError(error)) {
      return errorResponse(error.code as ErrorCode, error.message, 404);
    }
    return errorResponse("INTERNAL_ERROR", "Failed to update brand", 500);
  }
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  try {
    await requireUser();
    await brandService.delete(id);
    return successResponse({ deleted: true });
  } catch (error) {
    if (isAppError(error)) {
      return errorResponse(error.code as ErrorCode, error.message, 404);
    }
    return errorResponse("INTERNAL_ERROR", "Failed to delete brand", 500);
  }
}
