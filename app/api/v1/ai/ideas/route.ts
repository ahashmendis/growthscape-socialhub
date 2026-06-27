import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api/response";
import { aiContentService } from "@/features/ai/lib/services/ai-content.service";
import { isAppError } from "@/lib/api/errors";
import { requireUser } from "@/lib/auth/server";
import type { ErrorCode } from "@/lib/types/api";

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser();
    const body = await request.json();
    const { brandId, topic, platform, count, provider } = body;

    if (!brandId && !topic) {
      return errorResponse("BAD_REQUEST" as ErrorCode, "brandId or topic is required", 400);
    }

    const ideas = await aiContentService.generateIdeas(user.id, null, {
      brandId, topic, platform, count, provider,
    });
    return successResponse(ideas);
  } catch (error) {
    if (isAppError(error)) {
      return errorResponse(error.code as ErrorCode, error.message, 400);
    }
    return errorResponse("INTERNAL_ERROR", "Idea generation failed", 500);
  }
}
