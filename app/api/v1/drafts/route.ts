import { NextRequest } from "next/server";
import { successResponse, errorResponse, validationError } from "@/lib/api/response";
import { schedulerService } from "@/features/scheduler/lib/services/scheduler.service";
import { isAppError } from "@/lib/api/errors";
import { requireUser } from "@/lib/auth/server";
import type { ErrorCode } from "@/lib/types/api";

export async function GET(request: NextRequest) {
  try {
    await requireUser();
    const { searchParams } = new URL(request.url);
    const brandId = searchParams.get("brandId");
    const status = searchParams.get("status") || undefined;

    if (!brandId) {
      return errorResponse("BAD_REQUEST" as ErrorCode, "Missing brandId", 400);
    }

    const drafts = await schedulerService.listDrafts(brandId, status);
    return successResponse(drafts);
  } catch (error) {
    if (isAppError(error)) {
      return errorResponse(error.code as ErrorCode, error.message, 401);
    }
    return errorResponse("INTERNAL_ERROR", "Failed to list drafts", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireUser();
    const body = await request.json();
    const validation = await import("@/features/scheduler/schemas/draft").then((m) =>
      m.createDraftSchema.safeParse(body)
    );

    if (!validation.success) {
      return validationError(validation.error.flatten().fieldErrors);
    }

    const draft = await schedulerService.createDraft(validation.data);
    return successResponse(draft);
  } catch (error) {
    if (isAppError(error)) {
      return errorResponse(error.code as ErrorCode, error.message, 400);
    }
    return errorResponse("INTERNAL_ERROR", "Failed to create draft", 500);
  }
}
