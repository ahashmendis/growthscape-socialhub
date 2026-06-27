import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api/response";
import { inngest } from "@/jobs";
import { isAppError } from "@/lib/api/errors";
import { requireUser } from "@/lib/auth/server";
import type { ErrorCode } from "@/lib/types/api";

export async function POST(request: NextRequest) {
  try {
    await requireUser();
    const body = await request.json();
    const { accountId } = body;

    if (!accountId) {
      return errorResponse("BAD_REQUEST" as ErrorCode, "accountId is required", 400);
    }

    await inngest.send({
      name: "analytics.sync.trigger",
      data: { accountId },
    });

    return successResponse({ message: "Sync job queued", accountId });
  } catch (error) {
    if (isAppError(error)) {
      return errorResponse(error.code as ErrorCode, error.message, 401);
    }
    return errorResponse("INTERNAL_ERROR", "Failed to trigger sync", 500);
  }
}
