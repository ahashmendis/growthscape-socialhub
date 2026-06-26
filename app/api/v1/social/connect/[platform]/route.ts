import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api/response";
import { requireUser } from "@/lib/auth/server";
import { isAppError } from "@/lib/api/errors";
import type { ErrorCode } from "@/lib/types/api";

const PLATFORM_CONFIG: Record<string, { authUrl: string; clientIdEnv: string; scopes: string[] }> = {
  facebook: {
    authUrl: "https://www.facebook.com/v18.0/dialog/oauth",
    clientIdEnv: "FACEBOOK_APP_ID",
    scopes: ["pages_manage_posts", "pages_read_engagement", "pages_show_list", "public_profile"],
  },
  instagram: {
    authUrl: "https://api.instagram.com/oauth/authorize",
    clientIdEnv: "INSTAGRAM_APP_ID",
    scopes: ["instagram_basic", "instagram_content_publish", "instagram_manage_insights", "pages_show_list"],
  },
  youtube: {
    authUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    clientIdEnv: "YOUTUBE_CLIENT_ID",
    scopes: ["https://www.googleapis.com/auth/youtube.readonly", "https://www.googleapis.com/auth/youtubeanalytics.readonly"],
  },
};

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ platform: string }> }
) {
  const { platform } = await context.params;
  try {
    await requireUser();
    const config = PLATFORM_CONFIG[platform.toLowerCase()];

    if (!config) {
      return errorResponse("NOT_FOUND", `Platform "${platform}" not supported`, 404);
    }

    const clientId = process.env[config.clientIdEnv];
    if (!clientId) {
      return errorResponse("INTERNAL_ERROR", `Platform "${platform}" not configured`, 500);
    }

    const { searchParams } = new URL(request.url);
    const brandId = searchParams.get("brandId");
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard/settings?tab=brands`;
    const state = brandId ? btoa(JSON.stringify({ brandId, platform })) : undefined;

    const authUrl = new URL(config.authUrl);
    authUrl.searchParams.set("client_id", clientId);
    authUrl.searchParams.set("redirect_uri", redirectUri);
    authUrl.searchParams.set("response_type", "code");
    if (state) authUrl.searchParams.set("state", state);
    authUrl.searchParams.set("scope", config.scopes.join(","));

    return successResponse({ authUrl: authUrl.toString() });
  } catch (error) {
    if (isAppError(error)) {
      return errorResponse(error.code as ErrorCode, error.message, 401);
    }
    return errorResponse("INTERNAL_ERROR", "Failed to initiate OAuth", 500);
  }
}
