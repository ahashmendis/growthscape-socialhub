export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  meta: ApiMeta | null;
  error: null;
}

export interface ApiErrorResponse {
  success: false;
  data: null;
  meta: null;
  error: ApiError;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export interface ApiMeta {
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
  cursor?: string;
}

export interface ApiError {
  code: ErrorCode;
  message: string;
  details?: Record<string, unknown>;
  requestId: string;
}

export type ErrorCode =
  | "VALIDATION_ERROR"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "RATE_LIMITED"
  | "SYNC_FAILED"
  | "AI_PROVIDER_ERROR"
  | "PUBLISH_FAILED"
  | "INTERNAL_ERROR"
  | "BAD_REQUEST";
