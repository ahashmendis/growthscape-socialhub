import { NextRequest } from "next/server";
import { createServerSupabaseClient } from "@/lib/auth/server";
import { successResponse, errorResponse } from "@/lib/api/response";

export async function GET(_request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return errorResponse("UNAUTHORIZED", "Not authenticated", 401);
    }

    const { data: profile } = await supabase
      .from("users")
      .select("id, email, name, avatar_url, role, created_at")
      .eq("id", user.id)
      .single();

    return successResponse({
      user: {
        id: user.id,
        email: user.email,
        name: profile?.name ?? user.user_metadata?.name,
        avatarUrl: profile?.avatar_url ?? user.user_metadata?.avatar_url,
        role: profile?.role ?? "USER",
      },
    });
  } catch {
    return errorResponse("INTERNAL_ERROR", "Failed to get session", 500);
  }
}
