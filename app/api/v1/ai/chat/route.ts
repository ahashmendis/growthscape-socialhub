import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api/response";
import { aiService } from "@/features/ai/lib/services/ai.service";
import { isAppError } from "@/lib/api/errors";
import { requireUser } from "@/lib/auth/server";
import type { ErrorCode } from "@/lib/types/api";

export async function POST(request: NextRequest) {
  try {
    await requireUser();
    const body = await request.json();
    const { sessionId, messages, provider, model, systemPrompt } = body;

    if (!messages || !Array.isArray(messages) || !provider) {
      return errorResponse("BAD_REQUEST" as ErrorCode, "Missing messages or provider", 400);
    }

    const response = await aiService.chat(sessionId, messages, provider, model, systemPrompt);
    return successResponse(response);
  } catch (error) {
    if (isAppError(error)) {
      return errorResponse(error.code as ErrorCode, error.message, 400);
    }
    return errorResponse("INTERNAL_ERROR", "Chat failed", 500);
  }
}
