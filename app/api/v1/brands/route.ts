import { NextRequest } from "next/server";
import { successResponse, errorResponse, validationError } from "@/lib/api/response";
import { brandService } from "@/features/settings/lib/services/brand.service";
import { createBrandSchema } from "@/features/settings/schemas/brand";
import { isAppError } from "@/lib/api/errors";
import { requireUser } from "@/lib/auth/server";
import type { ErrorCode } from "@/lib/types/api";

export async function GET(request: NextRequest) {
  try {
    await requireUser();
    const workspaceId = request.headers.get("x-workspace-id");
    if (!workspaceId) {
      return errorResponse("BAD_REQUEST" as ErrorCode, "Missing workspace header", 400);
    }

    const brands = await brandService.listByWorkspace(workspaceId);
    return successResponse(brands);
  } catch (error) {
    if (isAppError(error)) {
      return errorResponse(error.code as ErrorCode, error.message, 401);
    }
    return errorResponse("INTERNAL_ERROR", "Failed to list brands", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireUser();
    const workspaceId = request.headers.get("x-workspace-id");
    if (!workspaceId) {
      return errorResponse("BAD_REQUEST" as ErrorCode, "Missing workspace header", 400);
    }

    const body = await request.json();
    const validation = createBrandSchema.safeParse(body);
    if (!validation.success) {
      return validationError(validation.error.flatten().fieldErrors);
    }

    const brand = await brandService.create(workspaceId, validation.data);
    return successResponse(brand);
  } catch (error) {
    if (isAppError(error)) {
      const status = error.code === "CONFLICT" ? 409 : 400;
      return errorResponse(error.code as ErrorCode, error.message, status);
    }
    return errorResponse("INTERNAL_ERROR", "Failed to create brand", 500);
  }
}
