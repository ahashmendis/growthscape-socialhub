import { successResponse, errorResponse } from "@/lib/api/response";
import { schedulerService } from "@/features/scheduler/lib/services/scheduler.service";
import { isAppError } from "@/lib/api/errors";
import { requireUser } from "@/lib/auth/server";
import type { ErrorCode } from "@/lib/types/api";

export async function GET() {
  try {
    await requireUser();
    const queue = await schedulerService.getQueue();
    return successResponse(queue);
  } catch (error) {
    if (isAppError(error)) {
      return errorResponse(error.code as ErrorCode, error.message, 401);
    }
    return errorResponse("INTERNAL_ERROR", "Failed to get queue", 500);
  }
}
