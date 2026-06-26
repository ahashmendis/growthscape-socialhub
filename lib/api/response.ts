import { NextResponse } from "next/server";
import type { ApiResponse, ApiMeta, ErrorCode } from "@/lib/types/api";

export function successResponse<T>(
  data: T,
  meta?: ApiMeta | null
): NextResponse<ApiResponse<T>> {
  return NextResponse.json({
    success: true,
    data,
    meta: meta ?? null,
    error: null,
  });
}

export function errorResponse(
  code: ErrorCode,
  message: string,
  status: number,
  details?: Record<string, unknown>,
  requestId?: string
): NextResponse<ApiResponse<never>> {
  return NextResponse.json(
    {
      success: false,
      data: null,
      meta: null,
      error: {
        code,
        message,
        details,
        requestId: requestId ?? crypto.randomUUID(),
      },
    },
    { status }
  );
}

export function paginatedResponse<T>(
  data: T[],
  page: number,
  limit: number,
  total: number
): NextResponse<ApiResponse<T[]>> {
  const meta: ApiMeta = {
    page,
    limit,
    total,
    hasMore: page * limit < total,
  };
  return successResponse(data, meta);
}

export function validationError(
  details: Record<string, unknown>,
  message = "Validation failed"
): NextResponse<ApiResponse<never>> {
  return errorResponse("VALIDATION_ERROR", message, 400, details);
}

export function unauthorizedError(
  message = "Authentication required"
): NextResponse<ApiResponse<never>> {
  return errorResponse("UNAUTHORIZED", message, 401);
}

export function forbiddenError(
  message = "You do not have permission to perform this action"
): NextResponse<ApiResponse<never>> {
  return errorResponse("FORBIDDEN", message, 403);
}

export function notFoundError(
  message = "Resource not found"
): NextResponse<ApiResponse<never>> {
  return errorResponse("NOT_FOUND", message, 404);
}
