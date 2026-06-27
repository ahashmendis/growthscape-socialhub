import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api/response";
import { contentLibraryService } from "@/features/content-library/lib/services/content-library.service";
import { isAppError } from "@/lib/api/errors";
import { requireUser } from "@/lib/auth/server";
import type { ErrorCode } from "@/lib/types/api";

export async function GET(request: NextRequest) {
  try {
    await requireUser();
    const { searchParams } = new URL(request.url);
    const brandId = searchParams.get("brandId");
    const type = searchParams.get("type") || undefined;
    const search = searchParams.get("search") || undefined;

    if (!brandId) {
      return errorResponse("BAD_REQUEST" as ErrorCode, "brandId is required", 400);
    }

    const assets = await contentLibraryService.listAssets(brandId, { type, search });
    return successResponse(assets);
  } catch (error) {
    if (isAppError(error)) {
      return errorResponse(error.code as ErrorCode, error.message, 401);
    }
    return errorResponse("INTERNAL_ERROR", "Failed to list assets", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireUser();
    const body = await request.json();
    const { brandId, name, type, url, thumbnailUrl, width, height, size, tags } = body;

    if (!brandId || !name || !url) {
      return errorResponse("BAD_REQUEST" as ErrorCode, "brandId, name, and url are required", 400);
    }

    const asset = await contentLibraryService.createAsset({
      brandId, name, type, url, thumbnailUrl, width, height, size, tags,
    });
    return successResponse(asset);
  } catch (error) {
    if (isAppError(error)) {
      return errorResponse(error.code as ErrorCode, error.message, 400);
    }
    return errorResponse("INTERNAL_ERROR", "Failed to create asset", 500);
  }
}
