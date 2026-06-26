import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold tracking-tight">Growthscape</h1>
          <p className="text-sm text-muted-foreground mt-2">
            AI-first Social Media Operating System
          </p>
        </div>
        <div className="rounded-xl border bg-card p-6 shadow-growthscape-md">
          {children}
        </div>
      </div>
    </div>
  );
}
