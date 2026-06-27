import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");
  const platform = searchParams.get("platform") || "facebook";

  if (error) {
    return NextResponse.redirect(
      new URL(`/dashboard/settings?tab=brands&error=${encodeURIComponent(error)}&platform=${platform}`, request.url)
    );
  }

  if (!code || !state) {
    return NextResponse.redirect(new URL("/dashboard/settings?tab=brands&error=missing_params", request.url));
  }

  // Exchange code for tokens and create account
  try {
    const { socialService } = await import("@/features/settings/lib/services/social.service");
    const platformFromState = JSON.parse(Buffer.from(state, "base64").toString()).platform;
    await socialService.handleOAuthCallback(platformFromState, code, state);

    return NextResponse.redirect(new URL("/dashboard/settings?tab=brands&success=connected", request.url));
  } catch {
    return NextResponse.redirect(new URL("/dashboard/settings?tab=brands&error=connection_failed", request.url));
  }
}
