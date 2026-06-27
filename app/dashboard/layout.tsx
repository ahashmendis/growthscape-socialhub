import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/auth/server";
import { prisma } from "@/lib/db/client";
import { AppShell } from "@/components/layout/app-shell";
import type { ReactNode } from "react";

async function ensureUserExists(supabaseUser: { id: string; email: string | null; user_metadata?: { name?: string } }) {
  const existing = await prisma.user.findUnique({ where: { id: supabaseUser.id } });
  if (existing) return existing;

  // Create user record from Supabase auth data
  return prisma.user.create({
    data: {
      id: supabaseUser.id,
      email: supabaseUser.email || "",
      name: supabaseUser.user_metadata?.name || null,
    },
  });
}

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Ensure user exists in our database
  await ensureUserExists(user);

  return <AppShell>{children}</AppShell>;
}
