import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api/response";
import { notificationService } from "@/features/notifications/lib/services/notification.service";
import { isAppError } from "@/lib/api/errors";
import { requireUser } from "@/lib/auth/server";
import type { ErrorCode } from "@/lib/types/api";

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser();
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");

    const notifications = await notificationService.list(user.id, limit);
    const unreadCount = await notificationService.getUnreadCount(user.id);
    return successResponse({ notifications, unreadCount });
  } catch (error) {
    if (isAppError(error)) {
      return errorResponse(error.code as ErrorCode, error.message, 401);
    }
    return errorResponse("INTERNAL_ERROR", "Failed to list notifications", 500);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await requireUser();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    await notificationService.markAsRead(user.id, id || undefined);
    return successResponse({ marked: true });
  } catch (error) {
    if (isAppError(error)) {
      return errorResponse(error.code as ErrorCode, error.message, 401);
    }
    return errorResponse("INTERNAL_ERROR", "Failed to mark as read", 500);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await requireUser();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return errorResponse("BAD_REQUEST" as ErrorCode, "id is required", 400);
    }

    await notificationService.delete(user.id, id);
    return successResponse({ deleted: true });
  } catch (error) {
    if (isAppError(error)) {
      return errorResponse(error.code as ErrorCode, error.message, 401);
    }
    return errorResponse("INTERNAL_ERROR", "Failed to delete notification", 500);
  }
}
