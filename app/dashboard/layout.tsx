import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/auth/server";
import { AppShell } from "@/components/layout/app-shell";
import type { ReactNode } from "react";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return <AppShell>{children}</AppShell>;
}
