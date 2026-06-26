"use client";

import { SupabaseProvider } from "@/providers/supabase-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import { QueryProvider } from "@/providers/query-provider";
import { ToastProvider } from "@/providers/toast-provider";
import { WorkspaceProvider } from "@/providers/workspace-provider";
import { MotionProvider } from "@/providers/motion-provider";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <MotionProvider>
        <SupabaseProvider>
          <QueryProvider>
            <WorkspaceProvider>
              {children}
              <ToastProvider />
            </WorkspaceProvider>
          </QueryProvider>
        </SupabaseProvider>
      </MotionProvider>
    </ThemeProvider>
  );
}
