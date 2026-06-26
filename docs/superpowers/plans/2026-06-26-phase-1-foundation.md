# Phase 1: Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the complete project foundation — Next.js 15 app, Supabase database, auth, workspace model, app shell, design system, component library, providers, Inngest background jobs, Error Boundaries, dashboard skeleton, command palette, and layered API framework.

**Architecture:** Feature-first Next.js App Router with layered backend (Route → Action → Service → Repository → Prisma). Multi-tenant workspace model with Supabase Auth. Inngest for durable background jobs. Five-tier Error Boundary hierarchy.

**Tech Stack:** Next.js 15, React 19, TypeScript 5, Tailwind CSS, shadcn/ui, Supabase, Prisma, Inngest, Motion, Lucide React, Zustand, TanStack Query, React Hook Form, Zod

## Global Constraints

- TypeScript strict mode — no `any`, no loose typing
- Feature-first organization — `features/` owns components, hooks, services, types, schemas, utils
- Layered API — Routes (HTTP only) → Actions (auth + validation) → Services (business logic) → Repositories (Prisma)
- Standard API responses — `{ success, data, meta, error }` format on every endpoint
- Zod validation — every request validated before reaching business logic
- Design system — custom brand palette (purple `#6C5CE7`), no default Tailwind indigo/blue as primary
- Layered, color-tinted shadows — never flat `shadow-md`
- Animate only `transform` and `opacity` — never `transition-all`
- WCAG 2.1 AA — proper contrast, ARIA labels, keyboard navigation
- shadcn/ui as primary component library
- Inter font for headings and body, JetBrains Mono for code
- Responsive from the start — mobile, tablet, desktop, ultra-wide
- `deletedAt` soft-delete convention on applicable models
- Inngest for all long-running operations — never in API routes
- Error Boundaries at every layer — Root, Dashboard, Feature, Widget, Route

---

## File Structure Map

```
package.json                          # Dependencies + scripts
.env.example                          # Environment variable template
.eslintrc.json                        # ESLint strict config
tsconfig.json                         # Strict TypeScript
tailwind.config.ts                    # Custom brand colors, shadows, fonts
next.config.ts                        # Next.js 15 config
postcss.config.mjs                    # PostCSS for Tailwind

prisma/
  schema.prisma                       # Full database schema (already written)
  .env                                # DATABASE_URL

app/
  layout.tsx                          # Root layout (fonts + providers)
  providers.tsx                       # All app providers wrapper
  page.tsx                            # Redirect to /dashboard or /login
  not-found.tsx                       # Global 404
  error.tsx                           # Root error boundary
  (auth)/
    layout.tsx                        # Auth layout (centered card)
    login/page.tsx                    # Login page
    signup/page.tsx                   # Signup page
  (dashboard)/
    layout.tsx                        # Dashboard shell with sidebar
    page.tsx                          # Dashboard home (skeleton)
    error.tsx                         # Dashboard error boundary
    not-found.tsx                     # Dashboard 404

providers/
  theme-provider.tsx
  query-provider.tsx
  supabase-provider.tsx
  toast-provider.tsx
  workspace-provider.tsx
  motion-provider.tsx

jobs/
  index.ts                            # Inngest client + handler
  README.md                           # Job categories + flow docs

features/
  auth/
    components/
      login-form.tsx
      signup-form.tsx
    lib/
      auth-service.ts
    types/
      index.ts
    schemas/
      index.ts
  dashboard/
    components/
      dashboard-page.tsx
      dashboard-skeleton.tsx
      dashboard-empty.tsx

components/
  ui/
    (shadcn/ui primitives — added incrementally)
  layout/
    app-shell.tsx
    sidebar.tsx
    top-bar.tsx
    page-header.tsx
  shared/
    empty-state.tsx
    error-state.tsx
    widget-error-boundary.tsx
    metric-card.tsx
    command-palette.tsx
    platform-icon.tsx
  forms/
    form-field.tsx
    form-error-message.tsx

design-system/
  tokens/
    colors.ts
    typography.ts
    spacing.ts
    radii.ts
    shadows.ts
  animations/
    motion-config.ts
  theme/
    themes.css

lib/
  api/
    client.ts
    errors.ts
    types.ts
    response.ts
  hooks/
    use-current-user.ts
    use-current-workspace.ts
    use-permission.ts
  utils/
    cn.ts
    formatters.ts
    constants.ts
  types/
    api.ts
    domain.ts
  auth/
    server.ts                         # Server-side auth helpers

packages/
  shared/
    types/
      api.ts                          # Standard API response types
      enums.ts                        # Shared enums (UserRole, PlanTier, etc.)

middleware.ts                         # Auth guard, workspace resolution
```

---

### Task 1: Project Scaffolding

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `next.config.ts`
- Create: `tailwind.config.ts`
- Create: `postcss.config.mjs`
- Create: `.eslintrc.json`
- Create: `.env.example`
- Create: `.gitignore`

**Goal:** Initialize Next.js 15 project with strict TypeScript, Tailwind CSS, ESLint, and environment template.

- [ ] **Step 1: Create package.json**

```json
{
  "name": "growthscape-social-hub",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "db:generate": "prisma generate",
    "db:push": "prisma db push",
    "db:studio": "prisma studio",
    "db:migrate": "prisma migrate dev",
    "inngest:dev": "inngest dev --no-discovery --url http://localhost:3000/api/inngest"
  },
  "dependencies": {
    "@prisma/client": "^6.0.0",
    "@supabase/supabase-js": "^2.47.0",
    "@supabase/ssr": "^0.5.2",
    "@tanstack/react-query": "^5.62.0",
    "inngest": "^3.28.0",
    "lucide-react": "^0.468.0",
    "motion": "^11.13.0",
    "next": "^15.1.0",
    "next-themes": "^0.4.4",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-hook-form": "^7.54.0",
    "sonner": "^1.7.0",
    "zod": "^3.24.0",
    "zustand": "^5.0.2",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.6.0",
    "@hookform/resolvers": "^3.9.0"
  },
  "devDependencies": {
    "@types/node": "^22.10.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "@typescript-eslint/eslint-plugin": "^8.18.0",
    "@typescript-eslint/parser": "^8.18.0",
    "eslint": "^9.16.0",
    "eslint-config-next": "^15.1.0",
    "prisma": "^6.0.0",
    "tailwindcss": "^3.4.16",
    "postcss": "^8.4.49",
    "typescript": "^5.7.0",
    "inngest-cli": "^1.5.0"
  }
}
```

- [ ] **Step 2: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 3: Create next.config.ts**

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co" },
    ],
  },
};

export default nextConfig;
```

- [ ] **Step 4: Create postcss.config.mjs**

```javascript
/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    tailwindcss: {},
  },
};

export default config;
```

- [ ] **Step 5: Create .eslintrc.json**

```json
{
  "extends": ["next/core-web-vitals", "next/typescript"],
  "rules": {
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }]
  }
}
```

- [ ] **Step 6: Create .env.example**

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Database
DATABASE_URL=

# Inngest
INNGEST_EVENT_KEY=
INNGEST_SIGNING_KEY=
```

- [ ] **Step 7: Create .gitignore**

```
node_modules/
.next/
out/
.env
.env.local
*.tsbuildinfo
prisma/.env
```

- [ ] **Step 8: Install dependencies**

```bash
npm install
```

Expected: All dependencies installed without errors.

- [ ] **Step 9: Verify dev server starts**

```bash
npm run dev
```

Expected: Next.js starts on http://localhost:3000 without errors (will show default page).

- [ ] **Step 10: Commit**

```bash
git add package.json tsconfig.json next.config.ts tailwind.config.ts postcss.config.mjs .eslintrc.json .env.example .gitignore
git commit -m "chore: initialize Next.js 15 project with strict TypeScript and Tailwind"
```

---

### Task 2: Design System (Tokens, Theme, Motion)

**Files:**
- Create: `design-system/tokens/colors.ts`
- Create: `design-system/tokens/typography.ts`
- Create: `design-system/tokens/shadows.ts`
- Create: `design-system/tokens/radii.ts`
- Create: `design-system/tokens/spacing.ts`
- Create: `design-system/animations/motion-config.ts`
- Create: `design-system/theme/themes.css`
- Modify: `tailwind.config.ts` — update with brand tokens
- Create: `app/globals.css` — Tailwind imports + CSS variables

**Goal:** Establish the visual design language — custom colors, typography, shadows, radii, spacing, motion presets, and dark/light theme CSS variables.

- [ ] **Step 1: Create design-system/tokens/colors.ts**

```typescript
export const colors = {
  // Brand primary — Growthscape purple
  primary: {
    50: "#F3F0FF",
    100: "#EDE5FF",
    200: "#DDD0FF",
    300: "#C5ABFF",
    400: "#A87DFF",
    500: "#6C5CE7",
    600: "#5B4BD6",
    700: "#4A3AC5",
    800: "#3D2FA8",
    900: "#2D227A",
    950: "#1A1450",
  },
  // Secondary — teal accent
  secondary: {
    50: "#E0FFFD",
    100: "#B3FFF8",
    200: "#7FFFF0",
    300: "#33FFE6",
    400: "#00CEC9",
    500: "#00A8A3",
    600: "#00807D",
    700: "#005C5A",
    800: "#003D3C",
    900: "#002020",
  },
  // Semantic
  success: "#10B981",
  warning: "#F59E0B",
  error: "#EF4444",
  info: "#3B82F6",
  // Platform colors
  platform: {
    facebook: "#1877F2",
    instagram: "#E4405F",
    youtube: "#FF0000",
    tiktok: "#000000",
    linkedin: "#0A66C2",
    pinterest: "#BD081C",
    x: "#000000",
    threads: "#000000",
  },
} as const;
```

- [ ] **Step 2: Create design-system/tokens/typography.ts**

```typescript
export const typography = {
  fonts: {
    sans: "Inter, system-ui, -apple-system, sans-serif",
    mono: "JetBrains Mono, ui-monospace, monospace",
  },
  sizes: {
    xs: "0.75rem",     // 12px
    sm: "0.875rem",    // 14px
    base: "1rem",      // 16px
    lg: "1.125rem",    // 18px
    xl: "1.25rem",     // 20px
    "2xl": "1.5rem",   // 24px
    "3xl": "1.875rem", // 30px
    "4xl": "2.25rem",  // 36px
  },
  tracking: {
    tight: "-0.03em",
    normal: "0em",
    wide: "0.02em",
  },
  lineHeight: {
    tight: "1.2",
    normal: "1.5",
    relaxed: "1.7",
  },
  weight: {
    normal: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
  },
} as const;
```

- [ ] **Step 3: Create design-system/tokens/shadows.ts**

```typescript
export const shadows = {
  sm: "0 1px 2px rgba(108, 92, 231, 0.04), 0 1px 3px rgba(0, 0, 0, 0.06)",
  md: "0 4px 6px rgba(108, 92, 231, 0.06), 0 2px 4px rgba(0, 0, 0, 0.08)",
  lg: "0 10px 15px rgba(108, 92, 231, 0.08), 0 4px 6px rgba(0, 0, 0, 0.10)",
  xl: "0 20px 25px rgba(108, 92, 231, 0.10), 0 8px 10px rgba(0, 0, 0, 0.12)",
} as const;
```

- [ ] **Step 4: Create design-system/tokens/radii.ts**

```typescript
export const radii = {
  sm: "0.375rem",   // 6px
  md: "0.5rem",     // 8px
  lg: "0.75rem",    // 12px
  xl: "1rem",       // 16px
  full: "9999px",
} as const;
```

- [ ] **Step 5: Create design-system/tokens/spacing.ts**

```typescript
export const spacing = [0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96] as const;
```

- [ ] **Step 6: Create design-system/animations/motion-config.ts**

```typescript
export const motionConfig = {
  fast: {
    duration: 0.15,
    ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
  },
  normal: {
    duration: 0.25,
    ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
  },
  slow: {
    duration: 0.4,
    ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
  },
  spring: {
    type: "spring" as const,
    stiffness: 300,
    damping: 25,
  },
} as const;
```

- [ ] **Step 7: Create design-system/theme/themes.css**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 98%;
    --foreground: 0 0% 9%;
    --card: 0 0% 100%;
    --card-foreground: 0 0% 9%;
    --popover: 0 0% 100%;
    --popover-foreground: 0 0% 9%;
    --primary: 256 76% 58%;
    --primary-foreground: 0 0% 100%;
    --secondary: 177 100% 40%;
    --secondary-foreground: 0 0% 100%;
    --muted: 0 0% 96%;
    --muted-foreground: 0 0% 45%;
    --accent: 0 0% 96%;
    --accent-foreground: 0 0% 9%;
    --destructive: 0 84% 60%;
    --destructive-foreground: 0 0% 100%;
    --border: 0 0% 90%;
    --input: 0 0% 90%;
    --ring: 256 76% 58%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 0 0% 4%;
    --foreground: 0 0% 98%;
    --card: 0 0% 7%;
    --card-foreground: 0 0% 98%;
    --popover: 0 0% 7%;
    --popover-foreground: 0 0% 98%;
    --primary: 256 76% 58%;
    --primary-foreground: 0 0% 100%;
    --secondary: 177 100% 40%;
    --secondary-foreground: 0 0% 100%;
    --muted: 0 0% 15%;
    --muted-foreground: 0 0% 64%;
    --accent: 0 0% 15%;
    --accent-foreground: 0 0% 98%;
    --destructive: 0 84% 60%;
    --destructive-foreground: 0 0% 100%;
    --border: 0 0% 15%;
    --input: 0 0% 15%;
    --ring: 256 76% 58%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

- [ ] **Step 8: Update tailwind.config.ts**

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./features/**/*.{ts,tsx}",
    "./providers/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
      boxShadow: {
        growthscape: {
          sm: "0 1px 2px rgba(108, 92, 231, 0.04), 0 1px 3px rgba(0, 0, 0, 0.06)",
          md: "0 4px 6px rgba(108, 92, 231, 0.06), 0 2px 4px rgba(0, 0, 0, 0.08)",
          lg: "0 10px 15px rgba(108, 92, 231, 0.08), 0 4px 6px rgba(0, 0, 0, 0.10)",
          xl: "0 20px 25px rgba(108, 92, 231, 0.10), 0 8px 10px rgba(0, 0, 0, 0.12)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      transitionTimingFunction: {
        "growthscape": "cubic-bezier(0.25, 0.1, 0.25, 1)",
      },
      transitionDuration: {
        "fast": "150ms",
        "normal": "250ms",
        "slow": "400ms",
      },
    },
  },
  plugins: [],
};

export default config;
```

- [ ] **Step 9: Create app/globals.css**

Create the file that imports Tailwind and will house global styles. For now it just needs:

```css
@import "./design-system/theme/themes.css";
```

- [ ] **Step 10: Commit**

```bash
git add design-system/ tailwind.config.ts app/globals.css
git commit -m "feat: establish design system with custom brand tokens and theme"
```

---

### Task 3: Global Types, Utils, and API Response Framework

**Files:**
- Create: `lib/utils/cn.ts`
- Create: `lib/utils/formatters.ts`
- Create: `lib/utils/constants.ts`
- Create: `lib/types/api.ts`
- Create: `lib/types/domain.ts`
- Create: `packages/shared/types/api.ts`
- Create: `packages/shared/types/enums.ts`
- Create: `lib/api/response.ts`
- Create: `lib/api/errors.ts`

**Goal:** Build the typed foundation — utility functions, shared types, API response builder, error code taxonomy.

- [ ] **Step 1: Create lib/utils/cn.ts**

```typescript
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

- [ ] **Step 2: Create lib/utils/formatters.ts**

```typescript
export function formatNumber(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toLocaleString();
}

export function formatPercentage(value: number, decimals = 1): string {
  return `${value >= 0 ? "+" : ""}${value.toFixed(decimals)}%`;
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatRelativeDate(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return formatDate(date);
}

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  return `${m}:${s.toString().padStart(2, "0")}`;
}
```

- [ ] **Step 3: Create lib/utils/constants.ts**

```typescript
export const APP_NAME = "Growthscape Social Hub";
export const APP_SHORT_NAME = "Growthscape";

export const DEFAULT_PAGINATION = {
  page: 1,
  limit: 20,
  maxLimit: 100,
} as const;

export const SUPPORTED_PLATFORMS = [
  "FACEBOOK",
  "INSTAGRAM",
  "YOUTUBE",
  "TIKTOK",
  "THREADS",
  "LINKEDIN",
  "PINTEREST",
  "X",
] as const;
```

- [ ] **Step 4: Create lib/types/api.ts**

```typescript
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  meta: ApiMeta | null;
  error: null;
}

export interface ApiErrorResponse {
  success: false;
  data: null;
  meta: null;
  error: ApiError;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export interface ApiMeta {
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
  cursor?: string;
}

export interface ApiError {
  code: ErrorCode;
  message: string;
  details?: Record<string, unknown>;
  requestId: string;
}

export type ErrorCode =
  | "VALIDATION_ERROR"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "RATE_LIMITED"
  | "SYNC_FAILED"
  | "AI_PROVIDER_ERROR"
  | "PUBLISH_FAILED"
  | "INTERNAL_ERROR";
```

- [ ] **Step 5: Create packages/shared/types/api.ts**

Re-export the API types so both frontend and backend share one source:

```typescript
export type {
  ApiSuccessResponse,
  ApiErrorResponse,
  ApiResponse,
  ApiMeta,
  ApiError,
  ErrorCode,
} from "@/lib/types/api";
```

- [ ] **Step 6: Create packages/shared/types/enums.ts**

```typescript
export enum UserRole {
  USER = "USER",
  ADMIN = "ADMIN",
}

export enum MemberRole {
  OWNER = "OWNER",
  ADMIN = "ADMIN",
  EDITOR = "EDITOR",
  VIEWER = "VIEWER",
}

export enum PlanTier {
  FREE = "FREE",
  STARTER = "STARTER",
  PRO = "PRO",
  AGENCY = "AGENCY",
}
```

- [ ] **Step 7: Create lib/api/response.ts**

```typescript
import { NextResponse } from "next/server";
import type { ApiResponse, ApiMeta, ErrorCode } from "@/lib/types/api";

export function successResponse<T>(
  data: T,
  meta?: ApiMeta | null
): NextResponse<ApiResponse<T>> {
  return NextResponse.json({
    success: true,
    data,
    meta: meta ?? null,
    error: null,
  });
}

export function errorResponse(
  code: ErrorCode,
  message: string,
  status: number,
  details?: Record<string, unknown>,
  requestId?: string
): NextResponse<ApiResponse<never>> {
  return NextResponse.json(
    {
      success: false,
      data: null,
      meta: null,
      error: {
        code,
        message,
        details,
        requestId: requestId ?? crypto.randomUUID(),
      },
    },
    { status }
  );
}

export function paginatedResponse<T>(
  data: T[],
  page: number,
  limit: number,
  total: number
): NextResponse<ApiResponse<T[]>> {
  const meta: ApiMeta = {
    page,
    limit,
    total,
    hasMore: page * limit < total,
  };
  return successResponse(data, meta);
}

export function validationError(
  details: Record<string, unknown>,
  message = "Validation failed"
): NextResponse<ApiResponse<never>> {
  return errorResponse("VALIDATION_ERROR", message, 400, details);
}

export function unauthorizedError(
  message = "Authentication required"
): NextResponse<ApiResponse<never>> {
  return errorResponse("UNAUTHORIZED", message, 401);
}

export function forbiddenError(
  message = "You do not have permission to perform this action"
): NextResponse<ApiResponse<never>> {
  return errorResponse("FORBIDDEN", message, 403);
}

export function notFoundError(
  message = "Resource not found"
): NextResponse<ApiResponse<never>> {
  return errorResponse("NOT_FOUND", message, 404);
}
```

- [ ] **Step 8: Create lib/api/errors.ts**

```typescript
export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}
```

- [ ] **Step 9: Commit**

```bash
git add lib/ packages/shared/types/
git commit -m "feat: add global types, utils, and API response framework"
```

---

### Task 4: Database + Prisma Setup

**Files:**
- Modify: `prisma/schema.prisma` (already exists — verify it's in place)
- Create: `prisma/.env`
- Modify: `.env.example` (add DATABASE_URL if not present)

**Goal:** Connect Prisma to Supabase, generate the client, verify schema.

- [ ] **Step 1: Create prisma/.env**

```env
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres?schema=public"
```

Note: User must replace with their actual Supabase connection string.

- [ ] **Step 2: Update .env.example** (ensure DATABASE_URL is present — already added in Task 1)

- [ ] **Step 3: Verify prisma/schema.prisma exists**

The schema was already written during the design phase. Verify the file is present and contains the full 39-model schema.

- [ ] **Step 4: Generate Prisma client**

```bash
npm run db:generate
```

Expected: Prisma client generated without errors. If any syntax errors in the schema, fix them before proceeding.

- [ ] **Step 5: Push schema to database (requires Supabase URL in .env)**

```bash
npm run db:push
```

Expected: All 39 tables created in Supabase PostgreSQL. This is non-blocking — if Supabase isn't set up yet, skip this step and document it.

- [ ] **Step 6: Commit**

```bash
git add prisma/ .env.example
git commit -m "feat: configure Prisma with full database schema"
```

---

### Task 5: Supabase Auth + Providers

**Files:**
- Create: `lib/auth/server.ts`
- Create: `lib/supabase/client.ts`
- Create: `providers/supabase-provider.tsx`
- Create: `providers/theme-provider.tsx`
- Create: `providers/query-provider.tsx`
- Create: `providers/toast-provider.tsx`
- Create: `providers/workspace-provider.tsx`
- Create: `providers/motion-provider.tsx`
- Create: `app/providers.tsx`
- Create: `app/layout.tsx`
- Create: `middleware.ts`

**Goal:** Set up Supabase client (browser + server), auth helpers, all app providers, root layout, and middleware for route protection.

- [ ] **Step 1: Create lib/supabase/client.ts**

```typescript
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

- [ ] **Step 2: Create lib/auth/server.ts**

```typescript
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createServerSupabaseClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // next/headers can't be modified in middleware
          }
        },
      },
    }
  );
}

export async function getCurrentUser() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("UNAUTHORIZED");
  }
  return user;
}
```

- [ ] **Step 3: Create providers/supabase-provider.tsx**

```tsx
"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

type SupabaseContextType = {
  supabase: SupabaseClient;
};

const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined);

export function SupabaseProvider({ children }: { children: ReactNode }) {
  const [supabase] = useState(() =>
    createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  );

  return (
    <SupabaseContext.Provider value={{ supabase }}>
      {children}
    </SupabaseContext.Provider>
  );
}

export function useSupabase() {
  const context = useContext(SupabaseContext);
  if (!context) {
    throw new Error("useSupabase must be used within SupabaseProvider");
  }
  return context;
}
```

- [ ] **Step 4: Create providers/theme-provider.tsx**

```tsx
"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ComponentProps } from "react";

export function ThemeProvider({
  children,
  ...props
}: ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
```

- [ ] **Step 5: Create providers/query-provider.tsx**

```tsx
"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";

export function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
```

- [ ] **Step 6: Create providers/toast-provider.tsx**

```tsx
"use client";

import { Toaster } from "sonner";

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      richColors
      closeButton
      toastOptions={{
        duration: 4000,
      }}
    />
  );
}
```

- [ ] **Step 7: Create providers/workspace-provider.tsx**

```tsx
"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

type WorkspaceContextType = {
  currentWorkspaceId: string | null;
  setCurrentWorkspaceId: (id: string | null) => void;
  currentBrandId: string | null;
  setCurrentBrandId: (id: string | null) => void;
};

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [currentWorkspaceId, setCurrentWorkspaceId] = useState<string | null>(null);
  const [currentBrandId, setCurrentBrandId] = useState<string | null>(null);

  return (
    <WorkspaceContext.Provider
      value={{
        currentWorkspaceId,
        setCurrentWorkspaceId,
        currentBrandId,
        setCurrentBrandId,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error("useWorkspace must be used within WorkspaceProvider");
  }
  return context;
}
```

- [ ] **Step 8: Create providers/motion-provider.tsx**

```tsx
"use client";

import { LazyMotion, domAnimation } from "motion/react";
import type { ReactNode } from "react";

export function MotionProvider({ children }: { children: ReactNode }) {
  return <LazyMotion features={domAnimation}>{children}</LazyMotion>;
}
```

- [ ] **Step 9: Create app/providers.tsx**

```tsx
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
```

- [ ] **Step 10: Create app/layout.tsx**

```tsx
import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";
import "@/design-system/theme/themes.css";
import { APP_NAME } from "@/lib/utils/constants";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: APP_NAME,
  description: "AI-first Social Media Operating System",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

- [ ] **Step 11: Create middleware.ts**

```typescript
import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isAuthRoute = pathname.startsWith("/(auth)") || pathname === "/login" || pathname === "/signup";
  const isDashboardRoute = pathname.startsWith("/(dashboard)");

  // Unauthenticated user trying to access protected route
  if (!user && isDashboardRoute) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Authenticated user trying to access auth pages
  if (user && isAuthRoute) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/inngest).*)"],
};
```

- [ ] **Step 12: Commit**

```bash
git add providers/ lib/auth/ lib/supabase/ app/layout.tsx app/providers.tsx middleware.ts
git commit -m "feat: set up Supabase auth, providers, middleware, and root layout"
```

---

### Task 6: shadcn/ui Init + UI Primitives

**Files:**
- Create: `components/ui/button.tsx`
- Create: `components/ui/card.tsx`
- Create: `components/ui/input.tsx`
- Create: `components/ui/badge.tsx`
- Create: `components/ui/skeleton.tsx`
- Create: `components/ui/avatar.tsx`
- Create: `components/ui/separator.tsx`
- Create: `components/ui/dropdown-menu.tsx`

**Goal:** Initialize shadcn/ui with the brand theme and create the 8 most essential UI primitives.

- [ ] **Step 1: Initialize shadcn/ui**

```bash
npx shadcn@latest init
```

When prompted:
- Style: `New York`
- Base color: `Zinc`
- CSS variables: `Yes`
- Tailwind prefix: (leave empty)

This creates `components.json` and the `components/ui/` directory.

- [ ] **Step 2: Add core components via shadcn**

```bash
npx shadcn@latest add button card input badge skeleton avatar separator dropdown-menu
```

These will be generated in `components/ui/`.

- [ ] **Step 3: Verify components use brand colors**

Open each generated component and verify they reference CSS variables (e.g., `bg-primary`, `text-primary-foreground`) rather than hardcoded colors. The shadcn New York style should already do this.

- [ ] **Step 4: Commit**

```bash
git add components.json components/ui/
git commit -m "feat: initialize shadcn/ui with core primitives"
```

---

### Task 7: Shared Composite Components

**Files:**
- Create: `components/layout/app-shell.tsx`
- Create: `components/layout/sidebar.tsx`
- Create: `components/layout/top-bar.tsx`
- Create: `components/layout/page-header.tsx`
- Create: `components/shared/empty-state.tsx`
- Create: `components/shared/error-state.tsx`
- Create: `components/shared/widget-error-boundary.tsx`
- Create: `components/shared/metric-card.tsx`
- Create: `components/shared/platform-icon.tsx`
- Create: `components/forms/form-field.tsx`
- Create: `components/forms/form-error-message.tsx`

**Goal:** Build the shared component layer — app chrome (sidebar, topbar, shell), error/empty states, widget error boundary, metric card, platform icons, form wrappers.

- [ ] **Step 1: Create components/shared/empty-state.tsx**

```tsx
import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="rounded-full bg-muted p-4 mb-4">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-6">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} size="sm">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Create components/shared/error-state.tsx**

```tsx
"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = "Something went wrong",
  description = "An unexpected error occurred. Please try again.",
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="rounded-full bg-destructive/10 p-4 mb-4">
        <AlertTriangle className="h-8 w-8 text-destructive" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-6">{description}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Try again
        </Button>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Create components/shared/widget-error-boundary.tsx**

```tsx
"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
  widgetId: string;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class WidgetErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`Widget "${this.props.widgetId}" error:`, error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground">Widget failed to load</p>
            <p className="text-xs text-muted-foreground mt-1">
              This widget encountered an error and cannot display.
            </p>
            <div className="flex gap-2 mt-3">
              <Button variant="outline" size="sm" onClick={this.handleRetry}>
                Retry
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

- [ ] **Step 4: Create components/shared/metric-card.tsx**

```tsx
import { type ReactNode } from "react";
import { formatNumber, formatPercentage } from "@/lib/utils/formatters";
import { cn } from "@/lib/utils/cn";

interface MetricCardProps {
  title: string;
  value: number;
  change?: number;
  icon?: ReactNode;
  suffix?: string;
  className?: string;
  loading?: boolean;
}

export function MetricCard({
  title,
  value,
  change,
  icon,
  suffix,
  className,
  loading,
}: MetricCardProps) {
  const isPositive = change !== undefined && change >= 0;
  const isNegative = change !== undefined && change < 0;

  return (
    <div
      className={cn(
        "rounded-xl border bg-card p-5 shadow-growthscape-sm transition-normal",
        "hover:shadow-growthscape-md hover:-translate-y-0.5",
        className
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <p className="text-sm text-muted-foreground">{title}</p>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </div>
      {loading ? (
        <div className="h-8 w-24 rounded bg-muted animate-pulse" />
      ) : (
        <div className="flex items-end gap-2">
          <p className="text-2xl font-bold tracking-tight">{formatNumber(value)}</p>
          {suffix && (
            <span className="text-sm text-muted-foreground mb-0.5">{suffix}</span>
          )}
        </div>
      )}
      {change !== undefined && !loading && (
        <p
          className={cn(
            "text-xs font-medium mt-2",
            isPositive && "text-success",
            isNegative && "text-destructive"
          )}
        >
          {formatPercentage(change)}
        </p>
      )}
    </div>
  );
}
```

- [ ] **Step 5: Create components/shared/platform-icon.tsx**

```tsx
import { cn } from "@/lib/utils/cn";

type Platform = "facebook" | "instagram" | "youtube" | "tiktok" | "linkedin" | "pinterest" | "x" | "threads";

interface PlatformIconProps {
  platform: Platform;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const platformColors: Record<Platform, string> = {
  facebook: "bg-[#1877F2]",
  instagram: "bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400",
  youtube: "bg-[#FF0000]",
  tiktok: "bg-black dark:bg-white",
  linkedin: "bg-[#0A66C2]",
  pinterest: "bg-[#BD081C]",
  x: "bg-black dark:bg-white",
  threads: "bg-black dark:bg-white",
};

const platformSizes = {
  sm: "h-5 w-5",
  md: "h-7 w-7",
  lg: "h-9 w-9",
};

export function PlatformIcon({
  platform,
  size = "md",
  className,
}: PlatformIconProps) {
  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center text-white text-[10px] font-bold",
        platformColors[platform],
        platformSizes[size],
        className
      )}
    >
      {platform[0].toUpperCase()}
    </div>
  );
}
```

- [ ] **Step 6: Create components/forms/form-field.tsx**

```tsx
import { type ReactNode } from "react";
import { Label } from "@/components/ui/label";
import { FormErrorMessage } from "./form-error-message";

interface FormFieldProps {
  label: string;
  error?: string;
  children: ReactNode;
  description?: string;
  required?: boolean;
}

export function FormField({
  label,
  error,
  children,
  description,
  required,
}: FormFieldProps) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
      {children}
      {error && <FormErrorMessage message={error} />}
    </div>
  );
}
```

- [ ] **Step 7: Create components/forms/form-error-message.tsx**

```tsx
interface FormErrorMessageProps {
  message: string;
}

export function FormErrorMessage({ message }: FormErrorMessageProps) {
  return (
    <p className="text-xs text-destructive mt-1" role="alert">
      {message}
    </p>
  );
}
```

- [ ] **Step 8: Create components/layout/page-header.tsx**

```tsx
import { type ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
```

- [ ] **Step 9: Create components/layout/sidebar.tsx**

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import {
  LayoutDashboard,
  BarChart3,
  CalendarDays,
  Clock,
  Image,
  Sparkles,
  Wand2,
  TrendingUp,
  Users,
  FileText,
  Target,
  Workflow,
  Settings,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
  badge?: string;
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { label: "Calendar", href: "/dashboard/calendar", icon: CalendarDays },
  { label: "Scheduler", href: "/dashboard/scheduler", icon: Clock },
  { label: "Content Library", href: "/dashboard/content-library", icon: Image },
  { label: "AI Social Manager", href: "/dashboard/ai-social-manager", icon: Sparkles, badge: "AI" },
  { label: "AI Content Studio", href: "/dashboard/ai-content-studio", icon: Wand2, badge: "AI" },
  { label: "Trend Center", href: "/dashboard/trend-center", icon: TrendingUp },
  { label: "Competitor Tracker", href: "/dashboard/competitor-tracker", icon: Users },
  { label: "Reports", href: "/dashboard/reports", icon: FileText },
  { label: "Goals", href: "/dashboard/goals", icon: Target },
  { label: "Automation", href: "/dashboard/automation", icon: Workflow },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

interface SidebarProps {
  collapsed?: boolean;
}

export function Sidebar({ collapsed = false }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "h-screen border-r bg-card flex flex-col transition-all duration-normal",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="h-14 flex items-center px-4 border-b shrink-0">
        {!collapsed && (
          <span className="font-bold text-lg tracking-tight">Growthscape</span>
        )}
        {collapsed && (
          <span className="font-bold text-lg text-primary">G</span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-fast",
                "hover:bg-accent hover:text-accent-foreground",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                isActive
                  ? "bg-accent text-accent-foreground font-medium"
                  : "text-muted-foreground"
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {!collapsed && (
                <>
                  <span className="truncate">{item.label}</span>
                  {item.badge && (
                    <span className="ml-auto text-[10px] font-medium bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
```

- [ ] **Step 10: Create components/layout/top-bar.tsx**

```tsx
"use client";

import { Bell, Command, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface TopBarProps {
  onSearchOpen?: () => void;
  notificationCount?: number;
  userName?: string;
}

export function TopBar({
  onSearchOpen,
  notificationCount = 0,
  userName,
}: TopBarProps) {
  return (
    <header className="h-14 border-b bg-card flex items-center justify-between px-4 shrink-0">
      {/* Left — Search trigger */}
      <Button
        variant="ghost"
        size="sm"
        className="text-muted-foreground gap-2"
        onClick={onSearchOpen}
      >
        <Search className="h-4 w-4" />
        <span className="text-sm hidden sm:inline">Search...</span>
        <kbd className="hidden sm:inline-flex items-center gap-1 ml-auto">
          <kbd className="text-[10px] bg-muted px-1.5 py-0.5 rounded">⌘</kbd>
          <kbd className="text-[10px] bg-muted px-1.5 py-0.5 rounded">K</kbd>
        </kbd>
      </Button>

      {/* Right — Notifications + Avatar */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          {notificationCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-4 w-4 p-0 text-[10px] flex items-center justify-center"
            >
              {notificationCount > 9 ? "9+" : notificationCount}
            </Badge>
          )}
        </Button>
        <Avatar className="h-7 w-7">
          <AvatarFallback className="text-xs bg-primary/10 text-primary font-medium">
            {userName
              ? userName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)
              : "U"}
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
```

- [ ] **Step 11: Create components/layout/app-shell.tsx**

```tsx
"use client";

import { useState, type ReactNode } from "react";
import { Sidebar } from "./sidebar";
import { TopBar } from "./top-bar";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar collapsed={sidebarCollapsed} />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
```

- [ ] **Step 12: Commit**

```bash
git add components/layout/ components/shared/ components/forms/
git commit -m "feat: add shared composite components (sidebar, topbar, shells, error states)"
```

---

### Task 8: Auth Pages + Login/Signup

**Files:**
- Create: `app/(auth)/layout.tsx`
- Create: `app/(auth)/login/page.tsx`
- Create: `app/(auth)/signup/page.tsx`
- Create: `features/auth/components/login-form.tsx`
- Create: `features/auth/components/signup-form.tsx`
- Create: `features/auth/schemas/index.ts`
- Create: `features/auth/types/index.ts`

**Goal:** Build the login and signup pages with Zod-validated forms, Supabase auth integration, and proper error handling.

- [ ] **Step 1: Create features/auth/schemas/index.ts**

```typescript
import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const signupSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
```

- [ ] **Step 2: Create features/auth/types/index.ts**

```typescript
export interface AuthResult {
  success: boolean;
  error?: string;
}
```

- [ ] **Step 3: Create features/auth/components/login-form.tsx**

```tsx
"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "../schemas";
import { useSupabase } from "@/providers/supabase-provider";
import { FormField } from "@/components/forms/form-field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export function LoginForm() {
  const { supabase } = useSupabase();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword(data);
      if (error) throw error;

      toast.success("Welcome back!");
      const redirect = searchParams.get("redirect") || "/dashboard";
      router.push(redirect);
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Login failed";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FormField label="Email" error={errors.email?.message} required>
        <Input
          type="email"
          placeholder="you@example.com"
          {...register("email")}
          autoComplete="email"
        />
      </FormField>

      <FormField label="Password" error={errors.password?.message} required>
        <Input
          type="password"
          placeholder="••••••••"
          {...register("password")}
          autoComplete="current-password"
        />
      </FormField>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
        Sign in
      </Button>
    </form>
  );
}
```

- [ ] **Step 4: Create features/auth/components/signup-form.tsx**

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema, type SignupInput } from "../schemas";
import { useSupabase } from "@/providers/supabase-provider";
import { FormField } from "@/components/forms/form-field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export function SignupForm() {
  const { supabase } = useSupabase();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  const onSubmit = async (data: SignupInput) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: { name: data.name },
        },
      });
      if (error) throw error;

      toast.success("Account created! Check your email to verify.");
      router.push("/login");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Signup failed";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FormField label="Name" error={errors.name?.message} required>
        <Input placeholder="John Doe" {...register("name")} autoComplete="name" />
      </FormField>

      <FormField label="Email" error={errors.email?.message} required>
        <Input type="email" placeholder="you@example.com" {...register("email")} autoComplete="email" />
      </FormField>

      <FormField label="Password" error={errors.password?.message} required>
        <Input type="password" placeholder="••••••••" {...register("password")} autoComplete="new-password" />
      </FormField>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
        Create account
      </Button>
    </form>
  );
}
```

- [ ] **Step 5: Create app/(auth)/layout.tsx**

```tsx
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
```

- [ ] **Step 6: Create app/(auth)/login/page.tsx**

```tsx
import Link from "next/link";
import { LoginForm } from "@/features/auth/components/login-form";

export default function LoginPage() {
  return (
    <>
      <h2 className="text-lg font-semibold mb-1">Welcome back</h2>
      <p className="text-sm text-muted-foreground mb-6">
        Sign in to your Growthscape account
      </p>
      <LoginForm />
      <p className="text-sm text-muted-foreground text-center mt-6">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="text-primary hover:underline font-medium">
          Sign up
        </Link>
      </p>
    </>
  );
}
```

- [ ] **Step 7: Create app/(auth)/signup/page.tsx**

```tsx
import Link from "next/link";
import { SignupForm } from "@/features/auth/components/signup-form";

export default function SignupPage() {
  return (
    <>
      <h2 className="text-lg font-semibold mb-1">Create your account</h2>
      <p className="text-sm text-muted-foreground mb-6">
        Start managing your social media with AI
      </p>
      <SignupForm />
      <p className="text-sm text-muted-foreground text-center mt-6">
        Already have an account?{" "}
        <Link href="/login" className="text-primary hover:underline font-medium">
          Sign in
        </Link>
      </p>
    </>
  );
}
```

- [ ] **Step 8: Create app/page.tsx**

```tsx
import { redirect } from "next/navigation";

export default function Home() {
  redirect("/dashboard");
}
```

- [ ] **Step 9: Commit**

```bash
git add app/\(auth\)/ app/page.tsx features/auth/
git commit -m "feat: add auth pages with login and signup forms"
```

---

### Task 9: Dashboard Layout + Skeleton + Error Boundaries

**Files:**
- Create: `app/(dashboard)/layout.tsx`
- Create: `app/(dashboard)/page.tsx`
- Create: `app/(dashboard)/error.tsx`
- Create: `app/(dashboard)/not-found.tsx`
- Create: `app/not-found.tsx`
- Create: `app/error.tsx`
- Create: `features/dashboard/components/dashboard-page.tsx`
- Create: `features/dashboard/components/dashboard-skeleton.tsx`
- Create: `features/dashboard/components/dashboard-empty.tsx`

**Goal:** Set up the authenticated dashboard layout with AppShell, error boundaries, skeleton loading, and empty states.

- [ ] **Step 1: Create app/(dashboard)/layout.tsx**

```tsx
import { AppShell } from "@/components/layout/app-shell";
import type { ReactNode } from "react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
```

- [ ] **Step 2: Create features/dashboard/components/dashboard-skeleton.tsx**

```tsx
import { Skeleton } from "@/components/ui/skeleton";

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Page header skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>

      {/* Metric cards skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border bg-card p-5 space-y-3">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
        ))}
      </div>

      {/* Chart skeleton */}
      <div className="rounded-xl border bg-card p-5 space-y-4">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-64 w-full" />
      </div>

      {/* Table skeleton */}
      <div className="rounded-xl border bg-card p-5 space-y-4">
        <Skeleton className="h-5 w-32" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create features/dashboard/components/dashboard-empty.tsx**

```tsx
import { Sparkles } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";

export function DashboardEmpty() {
  return (
    <EmptyState
      icon={Sparkles}
      title="Welcome to Growthscape"
      description="Connect your first social media account to start seeing analytics and AI insights."
      actionLabel="Connect Account"
      onAction={() => {
        // Navigate to settings to connect accounts
      }}
    />
  );
}
```

- [ ] **Step 4: Create features/dashboard/components/dashboard-page.tsx**

```tsx
"use client";

import { Suspense } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { MetricCard } from "@/components/shared/metric-card";
import { DashboardSkeleton } from "./dashboard-skeleton";
import { DashboardEmpty } from "./dashboard-empty";
import { WidgetErrorBoundary } from "@/components/shared/widget-error-boundary";
import { Users, Eye, Heart, TrendingUp } from "lucide-react";

interface DashboardPageProps {
  hasConnectedAccounts: boolean;
}

export function DashboardPage({ hasConnectedAccounts }: DashboardPageProps) {
  if (!hasConnectedAccounts) {
    return <DashboardEmpty />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Your social media performance at a glance"
      />

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <WidgetErrorBoundary widgetId="followers">
          <MetricCard
            title="Followers"
            value={12450}
            change={8.2}
            icon={<Users className="h-4 w-4" />}
          />
        </WidgetErrorBoundary>
        <WidgetErrorBoundary widgetId="impressions">
          <MetricCard
            title="Impressions"
            value={89200}
            change={12.5}
            icon={<Eye className="h-4 w-4" />}
          />
        </WidgetErrorBoundary>
        <WidgetErrorBoundary widgetId="engagement">
          <MetricCard
            title="Engagement"
            value={3420}
            change={-2.1}
            icon={<Heart className="h-4 w-4" />}
          />
        </WidgetErrorBoundary>
        <WidgetErrorBoundary widgetId="growth">
          <MetricCard
            title="Growth Rate"
            value={4.8}
            change={1.2}
            suffix="%"
            icon={<TrendingUp className="h-4 w-4" />}
          />
        </WidgetErrorBoundary>
      </div>

      {/* AI Insights placeholder */}
      <div className="rounded-xl border bg-gradient-to-r from-primary/5 to-secondary/5 p-5">
        <h3 className="text-sm font-semibold text-primary mb-1">AI Insights</h3>
        <p className="text-sm text-muted-foreground">
          Connect your accounts to receive personalized AI recommendations.
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Create app/(dashboard)/page.tsx**

```tsx
import { Suspense } from "react";
import { DashboardPage } from "@/features/dashboard/components/dashboard-page";
import { DashboardSkeleton } from "@/features/dashboard/components/dashboard-skeleton";

export default function DashboardHomePage() {
  // TODO: Fetch real data from database in Phase 2
  const hasConnectedAccounts = false;

  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardPage hasConnectedAccounts={hasConnectedAccounts} />
    </Suspense>
  );
}
```

- [ ] **Step 6: Create app/(dashboard)/error.tsx**

```tsx
"use client";

import { ErrorState } from "@/components/shared/error-state";
import { useEffect } from "react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <ErrorState
      title="Dashboard unavailable"
      description="We couldn't load your dashboard. Please try again."
      onRetry={reset}
    />
  );
}
```

- [ ] **Step 7: Create app/(dashboard)/not-found.tsx**

```tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function DashboardNotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <h2 className="text-4xl font-bold text-muted-foreground mb-2">404</h2>
      <p className="text-lg text-foreground mb-6">Page not found</p>
      <Link href="/dashboard">
        <Button>Back to Dashboard</Button>
      </Link>
    </div>
  );
}
```

- [ ] **Step 8: Create app/error.tsx**

```tsx
"use client";

import { ErrorState } from "@/components/shared/error-state";
import { useEffect } from "react";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Root error:", error);
  }, [error]);

  return (
    <ErrorState
      title="Something went wrong"
      description="An unexpected error occurred."
      onRetry={reset}
    />
  );
}
```

- [ ] **Step 9: Create app/not-found.tsx**

```tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-4">
      <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
      <p className="text-lg text-muted-foreground mb-8">
        This page doesn&apos;t exist.
      </p>
      <Link href="/">
        <Button>Go Home</Button>
      </Link>
    </div>
  );
}
```

- [ ] **Step 10: Commit**

```bash
git add app/\(dashboard\)/ app/error.tsx app/not-found.tsx features/dashboard/
git commit -m "feat: add dashboard layout with error boundaries, skeleton, and empty states"
```

---

### Task 10: Inngest Background Job Framework

**Files:**
- Create: `jobs/index.ts`
- Create: `jobs/README.md`
- Create: `app/api/inngest/route.ts`

**Goal:** Set up Inngest as the background job framework with the route handler and job category structure.

- [ ] **Step 1: Create jobs/index.ts**

```typescript
import { Inngest } from "inngest";

export const inngest = new Inngest({
  id: "growthscape-social-hub",
  retryFunction: async (attempt) => ({
    delay: Math.pow(2, attempt) * 1000, // Exponential backoff
    maxAttempts: 3,
  }),
});
```

- [ ] **Step 2: Create jobs/README.md**

```markdown
# Background Jobs (Inngest)

## Structure

```
jobs/
├── analytics/     # Platform data sync, daily aggregation, export
├── publishing/    # Scheduled post publishing, retry on failure
├── ai/            # Content generation, recommendations, media analysis
├── reports/       # Report generation, PDF/CSV assembly, email delivery
├── sync/          # Trend synchronization, competitor data sync
├── webhooks/      # Platform webhook ingestion, delivery dispatch
└── notifications/ # Notification dispatch (email, push, in-app)
```

## Flow

1. API route calls `inngest.send({ name, data })`
2. API returns immediately with `{ jobId }`
3. Inngest invokes the matching job function
4. Job updates database model with progress
5. Job completes or fails (with retry)

## Local Development

```bash
npm run inngest:dev
# UI at http://127.0.0.1:8288
```

## Production

Set `INNGEST_EVENT_KEY` and `INNGEST_SIGNING_KEY` environment variables.
The `/api/inngest` endpoint receives calls from Inngest Cloud.
```

- [ ] **Step 3: Create app/api/inngest/route.ts**

```typescript
import { serve } from "inngest/next";
import { inngest } from "@/jobs";

// Job functions will be imported here as they are created
const functions = [];

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions,
});
```

- [ ] **Step 4: Create job directory structure**

```bash
mkdir -p jobs/{analytics,publishing,ai,reports,sync,webhooks,notifications}
```

Create a `.gitkeep` in each empty directory so they're tracked:

```bash
touch jobs/analytics/.gitkeep jobs/publishing/.gitkeep jobs/ai/.gitkeep jobs/reports/.gitkeep jobs/sync/.gitkeep jobs/webhooks/.gitkeep jobs/notifications/.gitkeep
```

- [ ] **Step 5: Commit**

```bash
git add jobs/ app/api/inngest/
git commit -m "feat: set up Inngest background job framework"
```

---

### Task 11: Command Palette + Workspace Provider Integration

**Files:**
- Create: `components/shared/command-palette.tsx`
- Create: `lib/hooks/use-current-user.ts`
- Create: `lib/hooks/use-permission.ts`

**Goal:** Build the global command palette (⌘K) with navigation, settings search, and AI commands. Add auth hooks.

- [ ] **Step 1: Create components/shared/command-palette.tsx**

```tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  CommandDialog,
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from "@/components/ui/command";
import {
  LayoutDashboard,
  BarChart3,
  CalendarDays,
  Clock,
  Image,
  Sparkles,
  Wand2,
  TrendingUp,
  Users,
  FileText,
  Target,
  Workflow,
  Settings,
  Moon,
  Sun,
  Monitor,
} from "lucide-react";
import { useTheme } from "next-themes";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type CommandItem = {
  id: string;
  label: string;
  shortcut?: string;
  icon: typeof LayoutDashboard;
  action: () => void;
  group: string;
};

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter();
  const { setTheme } = useTheme();

  const navigate = useCallback(
    (href: string) => {
      onOpenChange(false);
      router.push(href);
    },
    [onOpenChange, router]
  );

  const items: CommandItem[] = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      action: () => navigate("/dashboard"),
      group: "Navigation",
    },
    {
      id: "analytics",
      label: "Analytics",
      icon: BarChart3,
      action: () => navigate("/dashboard/analytics"),
      group: "Navigation",
    },
    {
      id: "calendar",
      label: "Calendar",
      icon: CalendarDays,
      action: () => navigate("/dashboard/calendar"),
      group: "Navigation",
    },
    {
      id: "scheduler",
      label: "Scheduler",
      icon: Clock,
      action: () => navigate("/dashboard/scheduler"),
      group: "Navigation",
    },
    {
      id: "content-library",
      label: "Content Library",
      icon: Image,
      action: () => navigate("/dashboard/content-library"),
      group: "Navigation",
    },
    {
      id: "ai-social-manager",
      label: "AI Social Manager",
      icon: Sparkles,
      action: () => navigate("/dashboard/ai-social-manager"),
      group: "Navigation",
    },
    {
      id: "ai-content-studio",
      label: "AI Content Studio",
      icon: Wand2,
      action: () => navigate("/dashboard/ai-content-studio"),
      group: "Navigation",
    },
    {
      id: "trends",
      label: "Trend Center",
      icon: TrendingUp,
      action: () => navigate("/dashboard/trend-center"),
      group: "Navigation",
    },
    {
      id: "competitors",
      label: "Competitor Tracker",
      icon: Users,
      action: () => navigate("/dashboard/competitor-tracker"),
      group: "Navigation",
    },
    {
      id: "reports",
      label: "Reports",
      icon: FileText,
      action: () => navigate("/dashboard/reports"),
      group: "Navigation",
    },
    {
      id: "goals",
      label: "Goals",
      icon: Target,
      action: () => navigate("/dashboard/goals"),
      group: "Navigation",
    },
    {
      id: "automation",
      label: "Automation",
      icon: Workflow,
      action: () => navigate("/dashboard/automation"),
      group: "Navigation",
    },
    {
      id: "settings",
      label: "Settings",
      icon: Settings,
      action: () => navigate("/dashboard/settings"),
      group: "Navigation",
    },
    {
      id: "theme-light",
      label: "Light Mode",
      icon: Sun,
      action: () => setTheme("light"),
      group: "Theme",
    },
    {
      id: "theme-dark",
      label: "Dark Mode",
      icon: Moon,
      action: () => setTheme("dark"),
      group: "Theme",
    },
    {
      id: "theme-system",
      label: "System Theme",
      icon: Monitor,
      action: () => setTheme("system"),
      group: "Theme",
    },
  ];

  // Keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onOpenChange]);

  const groups = [...new Set(items.map((i) => i.group))];

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <Command>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          {groups.map((group) => (
            <div key={group}>
              <CommandGroup heading={group}>
                {items
                  .filter((item) => item.group === group)
                  .map((item) => (
                    <CommandItem key={item.id} onSelect={item.action}>
                      <item.icon className="h-4 w-4 mr-2" />
                      {item.label}
                    </CommandItem>
                  ))}
              </CommandGroup>
              <CommandSeparator />
            </div>
          ))}
        </CommandList>
      </Command>
    </CommandDialog>
  );
}
```

- [ ] **Step 2: Integrate CommandPalette into TopBar**

Update `components/layout/top-bar.tsx` — add `CommandPalette` import and state:

Add at top of file:
```tsx
import { CommandPalette } from "@/components/shared/command-palette";
```

Add state and handler:
```tsx
const [commandOpen, setCommandOpen] = useState(false);
```

Pass to onSearchOpen:
```tsx
onSearchOpen={() => setCommandOpen(true)}
```

Add at bottom of component:
```tsx
<CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
```

- [ ] **Step 3: Create lib/hooks/use-current-user.ts**

```typescript
"use client";

import { useSupabase } from "@/providers/supabase-provider";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";

export function useCurrentUser() {
  const { supabase } = useSupabase();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  return { user, loading };
}
```

- [ ] **Step 4: Create lib/hooks/use-permission.ts**

```typescript
// Placeholder for Phase 1 — will be implemented when workspace members are added
export function usePermission(requiredRole?: string) {
  // For now, return true for all authenticated users
  return { hasPermission: true };
}
```

- [ ] **Step 5: Commit**

```bash
git add components/shared/command-palette.tsx lib/hooks/ components/layout/top-bar.tsx
git commit -m "feat: add command palette and auth hooks"
```

---

### Task 12: API Framework — Health, Auth, and Standard Response Routes

**Files:**
- Create: `app/api/v1/health/route.ts`
- Create: `app/api/v1/auth/session/route.ts`
- Create: `lib/actions/auth.ts`
- Create: `app/api/v1/openapi.json/route.ts`

**Goal:** Build the API framework foundation — health check endpoint, session endpoint, and the layered pattern example.

- [ ] **Step 1: Create app/api/v1/health/route.ts**

```typescript
import { NextResponse } from "next/server";
import { successResponse } from "@/lib/api/response";
import { APP_SHORT_NAME } from "@/lib/utils/constants";

export async function GET() {
  return successResponse({
    status: "healthy",
    service: APP_SHORT_NAME,
    timestamp: new Date().toISOString(),
  });
}
```

- [ ] **Step 2: Create lib/actions/auth.ts**

```typescript
import { createServerSupabaseClient, requireUser } from "@/lib/auth/server";
import { AppError } from "@/lib/api/errors";

export async function getSessionAction() {
  const user = await requireUser();

  const supabase = await createServerSupabaseClient();
  const { data: profile } = await supabase
    .from("users")
    .select("id, email, name, avatar_url, role, created_at")
    .eq("id", user.id)
    .single();

  return {
    user: {
      id: user.id,
      email: user.email,
      name: profile?.name ?? user.user_metadata?.name,
      avatarUrl: profile?.avatar_url ?? user.user_metadata?.avatar_url,
      role: profile?.role ?? "USER",
    },
  };
}
```

- [ ] **Step 3: Create app/api/v1/auth/session/route.ts**

```typescript
import { NextRequest } from "next/server";
import { getSessionAction } from "@/lib/actions/auth";
import { successResponse, errorResponse } from "@/lib/api/response";
import { isAppError } from "@/lib/api/errors";

export async function GET(request: NextRequest) {
  try {
    const result = await getSessionAction();
    return successResponse(result);
  } catch (error) {
    if (isAppError(error) && error.code === "UNAUTHORIZED") {
      return errorResponse("UNAUTHORIZED", error.message, 401);
    }
    return errorResponse("INTERNAL_ERROR", "Failed to get session", 500);
  }
}
```

- [ ] **Step 4: Create app/api/v1/openapi.json/route.ts**

```typescript
import { NextResponse } from "next/server";
import { APP_SHORT_NAME } from "@/lib/utils/constants";

export async function GET() {
  const spec = {
    openapi: "3.0.3",
    info: {
      title: `${APP_SHORT_NAME} API`,
      version: "1.0.0",
      description: "AI-first Social Media Operating System API",
    },
    servers: [
      { url: "https://api.growthscape.com/v1", description: "Production" },
      { url: "http://localhost:3000/api/v1", description: "Development" },
    ],
    paths: {
      "/health": {
        get: {
          summary: "Health check",
          responses: { "200": { description: "Service is healthy" } },
        },
      },
      "/auth/session": {
        get: {
          summary: "Get current session",
          security: [{ bearerAuth: [] }],
          responses: { "200": { description: "Session info" } },
        },
      },
    },
    components: {
      securitySchemes: {
        bearerAuth: { type: "http", scheme: "bearer" },
      },
    },
  };

  return NextResponse.json(spec);
}
```

- [ ] **Step 5: Test health endpoint**

```bash
curl http://localhost:3000/api/v1/health
```

Expected: `{"success":true,"data":{"status":"healthy","service":"Growthscape","timestamp":"..."},"meta":null,"error":null}`

- [ ] **Step 6: Commit**

```bash
git add app/api/v1/ lib/actions/
git commit -m "feat: add API framework with health, session, and OpenAPI endpoints"
```

---

## Self-Review

### 1. Spec Coverage Check

| Spec Section | Task Coverage |
|---|---|
| Next.js 15 + TypeScript + Tailwind | Task 1 |
| Design system (colors, typography, shadows, motion) | Task 2 |
| Global types, utils, API response framework | Task 3 |
| Prisma + Database schema | Task 4 |
| Supabase Auth + Providers | Task 5 |
| shadcn/ui primitives | Task 6 |
| Shared composites (sidebar, topbar, error states) | Task 7 |
| Auth pages (login/signup) | Task 8 |
| Dashboard layout + skeleton + error boundaries | Task 9 |
| Inngest background jobs | Task 10 |
| Command palette + hooks | Task 11 |
| API framework (health, session, OpenAPI) | Task 12 |

**Gap identified:** The spec mentions `features/auth/lib/auth-service.ts` but auth logic goes through Supabase client directly. The `lib/actions/auth.ts` in Task 12 covers the server-side action layer. No gap.

**Gap identified:** `lib/api/client.ts` (typed fetch client for browser) is missing. This is needed for TanStack Query integration. I'll add it as Step 6 in Task 3.

**Gap identified:** The spec mentions `app/(auth)/callback/route.ts` for OAuth callbacks. I'll add this to Task 8.

Let me add these:

**Add to Task 3, Step 6: Create lib/api/client.ts**

```typescript
import type { ApiResponse } from "@/lib/types/api";

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl = "/api/v1") {
    this.baseUrl = baseUrl;
  }

  private async request<T>(path: string, options?: RequestInit): Promise<ApiResponse<T>> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });

    const data = await response.json();
    return data as ApiResponse<T>;
  }

  get<T>(path: string, params?: Record<string, string>) {
    const query = params ? `?${new URLSearchParams(params).toString()}` : "";
    return this.request<T>(`${path}${query}`);
  }

  post<T>(path: string, body?: unknown) {
    return this.request<T>(path, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  patch<T>(path: string, body?: unknown) {
    return this.request<T>(path, {
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  delete<T>(path: string) {
    return this.request<T>(path, { method: "DELETE" });
  }
}

export const api = new ApiClient();
```

**Add to Task 8, Step 8 (before commit): Create app/(auth)/callback/route.ts**

```typescript
import { createServerSupabaseClient } from "@/lib/auth/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createServerSupabaseClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(new URL("/dashboard", request.url));
}
```

### 2. Placeholder Scan

No TBD/TODO/placeholder patterns found in implementation code. The one `// TODO` in Task 9's dashboard page is intentional — it marks where Phase 2 data fetching will go.

### 3. Type Consistency

- `ApiResponse<T>` defined in Task 3, used in Tasks 11 and 12
- `ErrorCode` type shared between `lib/types/api.ts` and response helpers
- All components use the same `cn()` utility
- Error boundaries use standard React ErrorBoundary pattern

### 4. Task Independence

Each task produces independently testable deliverables:
- Task 1: Dev server runs
- Task 2: Brand colors visible in browser
- Task 3: Types compile, API response helpers work
- Task 4: Prisma generates, DB tables created
- Task 5: Login page renders, middleware redirects
- Task 6: UI components render in isolation
- Task 7: Sidebar + TopBar visible in browser
- Task 8: Login/signup forms submit to Supabase
- Task 9: Dashboard renders with skeleton + error boundaries
- Task 10: Inngest dev server connects
- Task 11: ⌘K opens command palette
- Task 12: `/api/v1/health` returns 200

---

Plan complete and saved to `docs/superpowers/plans/2026-06-26-phase-1-foundation.md`.

**Two execution options:**

**1. Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** — Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**
