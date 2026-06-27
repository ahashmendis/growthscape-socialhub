import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api/response";
import { aiChatService } from "@/features/ai/lib/services/ai-chat.service";
import { isAppError } from "@/lib/api/errors";
import { requireUser } from "@/lib/auth/server";
import type { ErrorCode } from "@/lib/types/api";

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser();
    const body = await request.json();
    const { sessionId, content, provider, brandId } = body;

    if (!content || !provider) {
      return errorResponse("BAD_REQUEST" as ErrorCode, "content and provider are required", 400);
    }

    let activeSessionId = sessionId;
    if (!activeSessionId) {
      const session = await aiChatService.createSession(user.id, null, "New conversation");
      activeSessionId = session.id;
    }

    const result = await aiChatService.sendMessage(activeSessionId, content, provider, brandId);
    return successResponse({ ...result, sessionId: activeSessionId });
  } catch (error) {
    if (isAppError(error)) {
      return errorResponse(error.code as ErrorCode, error.message, 400);
    }
    return errorResponse("INTERNAL_ERROR", "Chat failed", 500);
  }
}
