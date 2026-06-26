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
    const { prompt, brandId, contentType, provider } = body;

    if (!prompt || !provider) {
      return errorResponse("BAD_REQUEST" as ErrorCode, "Missing prompt or provider", 400);
    }

    const response = await aiService.generateContent(prompt, brandId || null, contentType || "caption", provider);
    return successResponse(response);
  } catch (error) {
    if (isAppError(error)) {
      return errorResponse(error.code as ErrorCode, error.message, 400);
    }
    return errorResponse("INTERNAL_ERROR", "Content generation failed", 500);
  }
}
