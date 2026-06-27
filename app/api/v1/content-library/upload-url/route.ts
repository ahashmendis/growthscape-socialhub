import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api/response";
import { contentLibraryService } from "@/features/content-library/lib/services/content-library.service";
import { isAppError } from "@/lib/api/errors";
import { requireUser } from "@/lib/auth/server";
import type { ErrorCode } from "@/lib/types/api";

export async function POST(request: NextRequest) {
  try {
    await requireUser();
    const body = await request.json();
    const { fileName, mimeType } = body;

    if (!fileName) {
      return errorResponse("BAD_REQUEST" as ErrorCode, "fileName is required", 400);
    }

    const result = await contentLibraryService.getUploadUrl(fileName, mimeType || "application/octet-stream");
    return successResponse(result);
  } catch (error) {
    if (isAppError(error)) {
      return errorResponse(error.code as ErrorCode, error.message, 401);
    }
    return errorResponse("INTERNAL_ERROR", "Failed to get upload URL", 500);
  }
}
