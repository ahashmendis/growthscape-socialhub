# Growthscape Social Hub — Foundation Design Spec

**Date:** 2026-06-26
**Status:** Draft — awaiting review
**Phase:** Phase 1 (Foundation + Auth + Dashboard)
**Author:** Staff Engineering

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Software Architecture](#2-software-architecture)
3. [Database Architecture](#3-database-architecture)
4. [API Architecture](#4-api-architecture)
5. [Frontend Architecture](#5-frontend-architecture)
6. [Feature Parity Matrix](#6-feature-parity-matrix)
7. [Phased Roadmap](#7-phased-roadmap)
8. [Recommendations](#8-recommendations)

---

## 1. Project Overview

Growthscape Social Hub is an AI-first Social Media Operating System. It combines analytics, scheduling, AI, automation, reporting, planning, and content generation into one unified platform.

**Primary reference:** Metricool (feature organization, workflows)
**Quality bar:** Linear, Vercel, Stripe, Notion, Arc, Supabase
**Differentiators:** AI Social Manager, AI Content Studio, predictive analytics, brand memory, automation engine, cross-platform insights

**Tech Stack:**
- Frontend: Next.js 15, React 19, TypeScript, Tailwind CSS, shadcn/ui, Motion, Lucide React, Recharts, TanStack Table, React Hook Form, Zod, Zustand, TanStack Query
- Backend: Next.js Route Handlers (layered: Route → Action → Service → Repository → Prisma)
- Database: PostgreSQL via Supabase, Prisma ORM
- Auth: Supabase Auth (email/password, Google OAuth, Meta OAuth)
- AI: Multi-provider abstraction (OpenAI, Claude, Gemini, OpenRouter)
- Hosting: Vercel (app) + Supabase (database, auth, storage)

**Team:** Solo developer initially. Architecture optimized for minimal ops overhead with clear module boundaries for future team expansion.

---

## 2. Software Architecture

### 2.1 Layered Architecture

Every request flows through four distinct layers:

```
Client Request
    ↓
┌─────────────────────────────────┐
│ API Route (app/api/v1/...)      │  HTTP layer only: method routing, response formatting
└──────────────┬──────────────────┘
               ↓
┌─────────────────────────────────┐
│ Action (lib/actions/...)        │  Auth validation, Zod validation, permission checks
└──────────────┬──────────────────┘
               ↓
┌─────────────────────────────────┐
│ Service (features/*/lib/)       │  Business logic, no HTTP concerns
└──────────────┬──────────────────┘
               ↓
┌─────────────────────────────────┐
│ Repository (features/*/lib/)    │  All Prisma queries, returns domain objects
└──────────────┬──────────────────┘
               ↓
         Prisma / Database
```

### 2.2 Project Structure

```
growthscape-social-hub/
├── app/                              # Next.js App Router (thin routing layer)
│   ├── (auth)/                       # Unauthenticated route group
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   └── callback/route.ts
│   ├── (dashboard)/                  # Authenticated route group
│   │   ├── layout.tsx                # AppShell (imports from features/)
│   │   ├── page.tsx                  # Dashboard home
│   │   ├── analytics/page.tsx
│   │   ├── calendar/page.tsx
│   │   ├── scheduler/page.tsx
│   │   ├── content-library/page.tsx
│   │   ├── ai-social-manager/page.tsx
│   │   ├── ai-content-studio/page.tsx
│   │   ├── trend-center/page.tsx
│   │   ├── competitor-tracker/page.tsx
│   │   ├── reports/page.tsx
│   │   ├── goals/page.tsx
│   │   ├── automation/page.tsx
│   │   └── settings/page.tsx
│   ├── api/                          # Route handlers → actions
│   ├── layout.tsx                    # Root layout (fonts + providers)
│   └── providers.tsx                 # All app providers
│
├── providers/                        # Dedicated provider folder
│   ├── theme-provider.tsx
│   ├── query-provider.tsx
│   ├── supabase-provider.tsx
│   ├── toast-provider.tsx
│   ├── command-palette-provider.tsx
│   ├── feature-flag-provider.tsx
│   ├── workspace-provider.tsx
│   └── motion-provider.tsx
│
├── jobs/                             # Inngest background jobs
│   ├── analytics/                    # Sync, aggregation, export jobs
│   ├── publishing/                   # Scheduled post publishing queue
│   ├── ai/                           # Content generation, recommendations, analysis
│   ├── reports/                      # Report generation and delivery
│   ├── sync/                         # Platform data synchronization
│   ├── webhooks/                     # Webhook processing and delivery
│   └── notifications/                # Notification dispatch jobs
│
├── features/                         # Feature modules (self-contained)
│   ├── auth/                         # components, hooks, services, types, schemas, utils
│   ├── dashboard/
│   ├── analytics/
│   ├── scheduler/
│   ├── calendar/
│   ├── content-library/
│   ├── ai/
│   ├── reports/
│   ├── competitors/
│   ├── trend-center/
│   ├── notifications/
│   ├── goals/
│   ├── automation/
│   └── settings/
│
├── components/                       # Cross-cutting UI
│   ├── ui/                           # shadcn/ui primitives
│   ├── layout/                       # AppShell, Sidebar, TopBar, PageHeader
│   ├── shared/                       # EmptyState, MetricCard, CommandPalette, etc.
│   └── forms/                        # Shared form field wrappers
│
├── design-system/                    # Design tokens and rules
│   ├── tokens/                       # colors, typography, spacing, radii, shadows
│   ├── animations/                   # motion-config, page-transitions, presets
│   ├── layouts/                      # grid, stack
│   └── theme/                        # CSS variables, theme config
│
├── lib/                              # Cross-cutting utilities
│   ├── api/                          # Typed fetch client, error parsing
│   ├── hooks/                        # useCurrentUser, usePermission, etc.
│   ├── utils/                        # formatters, validators, cn()
│   └── types/                        # Global TypeScript types
│
├── packages/                         # Shared code (extraction candidates)
│   ├── ai/                           # Provider-agnostic AI abstraction
│   ├── social/                       # Platform API adapters
│   ├── db/                           # Prisma client, seed utilities
│   └── shared/                       # Universal types, constants
│
├── prisma/
│   └── schema.prisma
│
├── middleware.ts                     # Auth guards, workspace resolution
├── .env.example
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

### 2.3 Import Rules

- `app/` → imports from `features/`, `components/`, `lib/`, `providers/` only
- `features/X/` → imports from `packages/`, `components/`, `lib/`, `design-system/`, and its own internals only
- `features/X/` → **never** imports from `features/Y/` directly (use API routes or shared packages)
- `components/` → imports from `design-system/`, `lib/`, and external dependencies only
- `lib/` → imports from `packages/` and external dependencies only
- `packages/` → imports only from other packages or external dependencies

### 2.4 Separation of Concerns

| Layer | Responsibility | Location |
|---|---|---|
| Routes | HTTP method routing, response formatting | `app/api/` |
| Actions | Auth, validation, orchestration, error handling | `lib/actions/` |
| Services | Business logic, domain rules | `features/*/lib/services/` |
| Repositories | Prisma queries, data access | `features/*/lib/repositories/` |
| Components | UI rendering, user interaction | `features/*/components/`, `components/` |
| Providers | App-wide context, configuration | `providers/` |
| Pages | Thin routing, imports feature components | `app/(dashboard)/` |

### 2.5 Background Jobs (Inngest)

**Framework:** Inngest — durable, typed, retryable background functions.

All long-running operations execute through Inngest, never inside API routes. API routes enqueue jobs and return immediately with a job ID.

#### Job Categories

| Job Directory | Responsibilities |
|---|---|
| `jobs/analytics/` | Platform data sync, daily aggregation, export |
| `jobs/publishing/` | Scheduled post publishing, retry on failure |
| `jobs/ai/` | Content generation, recommendations, media analysis, strategy |
| `jobs/reports/` | Report generation, PDF/CSV assembly, email delivery |
| `jobs/sync/` | Trend synchronization, competitor data sync |
| `jobs/webhooks/` | Platform webhook ingestion, delivery dispatch |
| `jobs/notifications/` | Notification dispatch (email, push, in-app) |

#### Flow: API Route → Inngest → Job → Database

```
POST /api/v1/analytics/sync
  → Action: validate request, check permissions
  → Action: inngest.send({
      name: "analytics.sync.trigger",
      data: { workspaceId, brandId, platform }
    })
  → Response: { success: true, data: { jobId: "sync_abc123" } }

  (async) Inngest worker receives event
  → jobs/analytics/sync.ts:
    → SyncJob model: status = RUNNING
    → Call Meta/YouTube API, store DailyAnalytics
    → SyncJob model: status = COMPLETED, recordsProcessed = N
```

#### Job Status Tracking

Jobs update the relevant database model (`SyncJob`, `Report`, `PublishQueue`, etc.) as they progress. Clients poll or use server-sent events to check status:

```
GET /api/v1/sync/jobs/:id  → { status: "RUNNING", recordsProcessed: 450, ... }
GET /api/v1/reports/:id    → { status: "GENERATING", ... }
```

#### Retry & Reliability

- All Inngest functions have built-in retry with exponential backoff
- Failed jobs update the database model with `errorMessage` and `retryCount`
- Max retries configurable per function (default: 3)
- Dead-letter: jobs exceeding max retries are marked `FAILED` with full error context

#### Local Development

```bash
npx inngest-cli@latest dev
# Functions auto-discovered from jobs/ directory
# UI at http://127.0.0.1:8288
```

### 2.6 Frontend Error Boundaries

---

## 3. Database Architecture

### 3.1 Overview

**Stack:** PostgreSQL + Prisma ORM + Supabase

**Schema:** `prisma/schema.prisma`

**Scope:** 39 models, 45 enums, 60+ indexes, 150+ relations

### 3.2 Model Groups

**Identity & Workspace:**
- `User` — Supabase auth UUID, role, profile
- `Workspace` — Multi-tenant container, plan tier, timezone
- `WorkspaceMember` — User-workspace membership with role (OWNER/ADMIN/EDITOR/VIEWER)
- `WorkspaceSetting` — Key-value settings per workspace

**Brands & Persona:**
- `Brand` — Social media brand/entity within a workspace
- `BrandPersona` — 1:1 with Brand; tone, audience, writing style, guidelines
- `SocialAccount` — Connected platform account (Facebook, Instagram, YouTube, etc.)
- `OAuthCredential` — 1:1 with SocialAccount; token storage, rotation, scopes

**Content Pipeline:**
- `Draft` — Standalone draft content with media
- `DraftMedia` — Media attachments for drafts
- `ScheduledPost` — Scheduled for publishing, optional draft source
- `PostMedia` — Media attachments for scheduled posts
- `PublishQueue` — Async publishing with retry, priority, failure tracking

**Analytics:**
- `DailyAnalytics` — Daily account-level snapshots with delta tracking
- `PostAnalytics` — Per-post performance metrics
- `AggregatedAnalytics` — Pre-computed weekly/monthly/quarterly summaries

**Sync:**
- `SyncJob` — Data sync tracking (status, retry, error, records processed)

**AI:**
- `ChatSession` — Persistent AI conversation sessions
- `ChatMessage` — Individual messages with role, content, tool calls, token counts
- `AIMemory` — Per-brand memory with type, importance, source, embedding reference
- `AIRecommendation` — Cached recommendations with confidence, priority, lifecycle
- `AIUsage` — Token/cost tracking per request
- `PromptTemplate` — Versioned prompt library with variables

**Content Ideas:**
- `ContentIdea` — AI-generated or manual ideas with review pipeline

**Media:**
- `MediaAsset` — Brand media library with tags
- `MediaAnalysis` — AI-generated analysis (hook score, quality, emotion, etc.)

**Competitors:**
- `Competitor` — Tracked competitor accounts
- `CompetitorSnapshot` — Periodic data captures with period-over-period deltas

**Trends:**
- `Trend` — Trending topics/events
- `TrendKeyword` — Keywords within trends with volume, growth, difficulty
- `TrendSource` — Source attribution (Google, YouTube, Reddit, etc.)

**Social Comments:**
- `SocialComment` — Inbox comments with sentiment analysis, reply tracking

**Goals:**
- `Goal` — Trackable targets with progress, deadline, status

**Notifications:**
- `Notification` — User notifications with type, read status, metadata

**Reports:**
- `Report` — Generated reports with type, format, status, scheduled delivery

**Storage:**
- `StorageFile` — File tracking (provider, bucket, checksum, metadata)

**User Preferences:**
- `UserPreference` — Theme, language, timezone, notification settings

**Dashboard:**
- `SavedView` — Filter presets per feature
- `DashboardLayout` — Widget positions, sizes, visibility per user/workspace

**Infrastructure:**
- `Integration` — Generic integration (Slack, Discord, Zapier, etc.)
- `Webhook` — Webhook configuration with event types
- `WebhookDelivery` — Per-delivery tracking with retry, response
- `AuditLog` — Action tracking with JSON diff, IP, user agent
- `FeatureFlag` — Feature toggles with workspace targeting, rollout %
- `ApiKey` — API keys with permissions, expiry, revocation

### 3.3 Design Decisions

- **Multi-tenant:** Workspace → Brand → SocialAccount hierarchy
- **Supabase Auth:** User.id maps to Supabase auth UUID; no password storage
- **Soft deletes:** `deletedAt` on Brand, SocialAccount, Draft, ScheduledPost, Competitor, ContentIdea, StorageFile, Workspace
- **Token isolation:** OAuthCredential separate from SocialAccount for security and rotation
- **Analytics performance:** DailyAnalytics has `@@unique([socialAccountId, date])` for upsert; AggregatedAnalytics avoids runtime aggregation for reports
- **AI-ready:** AIMemory includes `embeddingReference` for future pgvector semantic search
- **Audit trail:** AuditLog with JSON previous/new values for agency compliance
- **Publishing reliability:** PublishQueue with retry count, max retries, next retry timestamp

### 3.4 Indexing Strategy

All foreign keys are indexed. Composite indexes cover common query patterns:
- `[workspaceId, status]` — workspace-scoped status filters
- `[socialAccountId, date]` — time-series analytics queries
- `[brandId, scheduledFor]` — calendar/scheduler queries
- `[userId, createdAt(sort: Desc)]` — notification/activity feeds
- `[workspaceId, isRead]` — notification read/unread counts

---

## 4. API Architecture

### 4.1 Versioning

All routes under `/api/v1/`. Future versions coexist without breaking clients.

### 4.2 Standard Response Format

```json
{
  "success": true,
  "data": {},
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 156,
    "hasMore": true,
    "cursor": "eyJpZCI6IjIwIn0"
  },
  "error": null
}
```

Error responses:
```json
{
  "success": false,
  "data": null,
  "meta": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid date range: dateFrom must be before dateTo",
    "details": { "field": "dateFrom" },
    "requestId": "req_abc123"
  }
}
```

### 4.3 Error Code Taxonomy

| Code | Meaning |
|---|---|
| `VALIDATION_ERROR` | Zod validation failed |
| `UNAUTHORIZED` | Not authenticated |
| `FORBIDDEN` | Lacks permission |
| `NOT_FOUND` | Resource doesn't exist |
| `CONFLICT` | Resource conflict |
| `RATE_LIMITED` | Too many requests |
| `SYNC_FAILED` | Platform sync error |
| `AI_PROVIDER_ERROR` | AI service failure |
| `PUBLISH_FAILED` | Publishing error |
| `INTERNAL_ERROR` | Unexpected server error |

### 4.4 Complete Endpoint Map

```
/api/v1/
├── auth/
│   POST   /signup, /login, /logout
│   POST   /oauth/:provider/init, /oauth/:provider/callback
│   POST   /forgot-password, /reset-password, /verify-email, /refresh-token
│   GET    /session
│
├── workspaces/
│   GET    /, POST /
│   GET    /:id, PATCH /:id, DELETE /:id
│   GET    /:id/members, POST /:id/members
│   PATCH  /:id/members/:userId, DELETE /:id/members/:userId
│   GET    /:id/usage, /:id/activity
│
├── brands/
│   GET    /, POST /
│   GET    /:id, PATCH /:id, DELETE /:id
│   GET/PATCH/POST /:id/persona
│   GET    /:id/social-accounts, /:id/goals
│
├── social/
│   POST   /connect/:platform
│   GET    /:id, /:id/analytics, /:id/comments
│   POST   /:id/sync, /:id/comments
│   DELETE /:id
│   GET    /platforms
│
├── dashboard/
│   GET    /overview, /summary, /widgets, /activity, /goals, /recommendations, /layout
│
├── drafts/
│   GET    /, POST /, POST /bulk
│   GET    /:id, PATCH /:id, DELETE /:id, DELETE /bulk
│   POST   /:id/schedule
│
├── scheduled-posts/
│   GET    /, POST /, POST /bulk, POST /bulk-update, POST /bulk-publish
│   GET    /:id, PATCH /:id, DELETE /:id, DELETE /bulk
│
├── publish-queue/
│   GET    /, POST /:id/retry, POST /bulk-retry
│
├── analytics/
│   GET    /daily, /posts/:postId, /aggregated, /comparison
│   GET    /platform/:platform, /export
│   POST   /sync
│
├── content-library/
│   GET    /, POST /upload, POST /upload-url
│   DELETE /:id, PATCH /:id, PATCH /bulk, DELETE /bulk
│   GET    /collections, POST /collections
│   GET    /:id/analysis, POST /:id/analyze
│
├── content-ideas/
│   GET    /, POST /, POST /generate, POST /bulk
│   GET    /:id, PATCH /:id, PATCH /:id/approve, PATCH /:id/convert
│   DELETE /:id, DELETE /bulk
│
├── calendar/
│   GET    /, /best-times, /availability
│
├── ai/
│   POST   /chat, GET /chat/sessions, GET /chat/sessions/:id, DELETE /chat/sessions/:id
│   POST   /recommendations, GET /recommendations, PATCH /recommendations/:id
│   POST   /content, /content/bulk
│   GET    /prompts, GET /prompts/:id
│   POST   /persona/analyze, PATCH /persona
│   POST   /strategy, /predict, /media-analysis, /workflows
│   GET    /usage
│
├── competitors/
│   GET    /, POST /, POST /bulk
│   GET    /:id, PATCH /:id, DELETE /:id, DELETE /bulk
│   GET    /:id/snapshots, /comparison, /insights
│   POST   /sync
│
├── trends/
│   GET    /, POST /sync, GET /google, /youtube, /reddit, /topics
│   GET    /:id, POST /:id/content
│
├── reports/
│   GET    /, POST /generate, GET /:id, GET /:id/download
│   POST   /:id/share, DELETE /:id, POST /schedule
│   GET    /templates
│
├── notifications/
│   GET    /, PATCH /:id/read, PATCH /read-all, DELETE /:id
│   GET/PATCH /preferences, /settings
│   POST   /test
│
├── goals/
│   GET    /, POST /, GET /:id, PATCH /:id, PATCH /:id/progress, DELETE /:id
│
├── search/
│   GET    /
│
├── settings/
│   GET/PATCH /workspace, /user, /brand/:brandId, /ai, /scheduler
│   GET/POST/PATCH/DELETE /integrations/:id?
│
├── webhooks/
│   GET    /, POST /, PATCH /:id, DELETE /:id
│   GET    /deliveries, /:id/deliveries, POST /:id/test
│   POST   /ingest/meta, /ingest/youtube, /ingest/:platform
│
├── sync/
│   POST   /trigger, GET /jobs, GET /jobs/:id
│
├── feature-flags/
│   GET    /, PATCH /:id, GET /client
│
├── health/
│   GET    /, /ready, /live, /metrics, /status, /version
│
└── openapi.json
```

### 4.5 Query Parameters (All List Endpoints)

```
?page=1&limit=20              # Pagination
&cursor=<id>                   # Cursor-based (future)
&sort=createdAt&order=desc     # Sorting
&search=<query>                # Full-text search
&filters[platform]=instagram   # Dynamic filters
```

Analytics filters: `workspaceId`, `brandId`, `platform`, `dateFrom`, `dateTo`, `campaignId`, `tags`, `status`

### 4.6 Authorization

Centralized permission checks:
- `requireWorkspaceAccess(userId, workspaceId, minRole?)`
- `requireBrandAccess(userId, brandId, minRole?)`
- `requireOwnership(userId, resourceId)`

Role hierarchy: `OWNER > ADMIN > EDITOR > VIEWER`

### 4.7 Background Jobs

Long-running operations (analytics sync, AI generation, report generation, publishing) are enqueued. API responses return immediately with a `jobId`. Job status tracked via `SyncJob` model.

### 4.8 Caching

- Analytics: 5 min cache (stale-while-revalidate)
- Dashboard overview: 1 min cache
- Brand persona: 1 hour cache
- Feature flags: 5 min cache
- Prompt templates: 1 hour cache

### 4.9 Rate Limiting

- Auth: 10 req/min per IP
- AI: 30 req/min per user
- Publishing: 60 req/min per workspace
- General: 120 req/min per user
- Webhooks: 1000 req/min per platform

### 4.10 Validation

Every request validated with Zod schemas before reaching business logic. No request bypasses validation.

### 4.11 Logging

Structured logging per request: `requestId`, `timestamp`, `method`, `path`, `userId`, `workspaceId`, `executionTimeMs`, `statusCode`, `error`.

### 4.12 OpenAPI

Auto-generated from Zod schemas + route metadata. Served at `/api/v1/openapi.json`. Swagger UI at `/api/v1/docs` (dev only).

---

## 5. Frontend Architecture

### 5.1 Stack

Next.js 15 App Router, React 19, TypeScript, Tailwind CSS, shadcn/ui, Motion, Lucide React, Recharts, TanStack Table, React Hook Form, Zod, Zustand, TanStack Query

### 5.2 State Management

| State Type | Tool | Scope |
|---|---|---|
| Server state | TanStack Query | Caching, background refresh, optimistic updates |
| Global UI state | Zustand | Theme, sidebar, workspace, notifications, command palette |
| Form state | React Hook Form + Zod | Local to form components |
| URL state | Search params | Filters, pagination, tabs (shareable) |

**Never put in Zustand:** API responses, cached data, form values, URL state.

### 5.3 Design System

**Colors (custom brand palette):**
- Primary: `#6C5CE7` (Growthscape purple) with derived hover/active/disabled
- Secondary: `#00CEC9` (teal accent)
- Surface: Light `#FAFAFA` / Dark `#0A0A0A`
- Border: Light `#E5E5E5` / Dark `#262626`
- Text: Light `#171717` / Dark `#FAFAFA`
- Text-muted: Light `#737373` / Dark `#A3A3A3`
- Success: `#10B981`, Warning: `#F59E0B`, Error: `#EF4444`, Info: `#3B82F6`
- Platform colors: Facebook `#1877F2`, Instagram gradient, YouTube `#FF0000`, etc.

**Typography:**
- Display: Inter (headings) — tracking `-0.03em`, weight 600-700
- Body: Inter (body text) — line-height 1.7, weight 400-500
- Mono: JetBrains Mono (code, metrics)
- Scale: xs(12) sm(14) base(16) lg(18) xl(20) 2xl(24) 3xl(30) 4xl(36)

**Spacing scale (px):** 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96

**Shadows (layered, color-tinted):**
- sm: `0 1px 2px rgba(108, 92, 231, 0.04), 0 1px 3px rgba(0, 0, 0, 0.06)`
- md: `0 4px 6px rgba(108, 92, 231, 0.06), 0 2px 4px rgba(0, 0, 0, 0.08)`
- lg: `0 10px 15px rgba(108, 92, 231, 0.08), 0 4px 6px rgba(0, 0, 0, 0.10)`
- xl: `0 20px 25px rgba(108, 92, 231, 0.10), 0 8px 10px rgba(0, 0, 0, 0.12)`

**Border radius:** sm(6px), md(8px), lg(12px), xl(16px), full(9999px)

**Card variants:** Default, Elevated, Interactive (hover lift), Highlighted (accent border), Compact (dense)

**Button variants:** Primary, Secondary, Ghost, Destructive, AI (gradient with sparkle icon)

### 5.4 Component Hierarchy

```
Primitive Components (shadcn/ui)
    ↓
Shared Components (layout, shared, forms)
    ↓
Feature Components (features/*/components/)
    ↓
Page Layouts (thin wrappers)
    ↓
Pages (routing only)
```

**Tier 1 — UI Primitives** (`components/ui/`): Button, Card, Dialog, Input, Select, Table, Tabs, Badge, Avatar, Tooltip, Popover, Dropdown, Sheet, Skeleton, Separator, Alert, Toast, Command, ScrollArea, Switch, Checkbox, RadioGroup, Slider, Textarea, Label, Accordion, Progress, Pagination, Breadcrumb

**Tier 2 — Shared Composites** (`components/`):
- `layout/`: AppShell, Sidebar, TopBar, PageHeader, BreadcrumbNav
- `shared/`: EmptyState, ErrorState, PermissionDenied, OfflineState, LoadingSkeleton, MetricCard, DataGrid, ChartCard, DateRangePicker, PlatformIcon, StatusBadge, ConfirmDialog, FileUpload, ImagePreview, CommandPalette, AIActionButton, InlineAISuggestion
- `forms/`: FormField, FormSelect, FormTextarea, FormDatePicker, FormTagInput, FormFileUpload, FormErrorMessage

**Tier 3 — Feature Components** (`features/*/components/`): Each feature owns its domain-specific components.

### 5.5 Widget System

Dashboard widgets are draggable, resizable, hideable:

```typescript
interface Widget {
  id: string;
  type: 'metric' | 'chart' | 'table' | 'activity' | 'recommendation' | 'goals';
  title: string;
  size: 'sm' | 'md' | 'lg' | 'xl';
  position: { x: number; y: number; w: number; h: number };
  config: Record<string, unknown>;
  visibility: 'always' | 'mobile-hide' | 'desktop-only';
  dataSource: string;
  refreshInterval?: number;
}
```

Default dashboard layout answers four questions:
1. **What happened?** → Metric cards with period-over-period comparison
2. **Why did it happen?** → AI insight cards with natural language explanation
3. **What should I do next?** → Recommendation feed with actionable items
4. **What will likely happen?** → Growth forecast sparkline + prediction card

### 5.6 Motion System

Centralized via `design-system/animations/motion-config.ts`:

```typescript
const motionConfig = {
  fast:    { duration: 0.15, ease: [0.25, 0.1, 0.25, 1] },  // Hover states
  normal:  { duration: 0.25, ease: [0.25, 0.1, 0.25, 1] },  // Card interactions
  slow:    { duration: 0.4,  ease: [0.25, 0.1, 0.25, 1] },  // Page transitions
  spring:  { type: 'spring', stiffness: 300, damping: 25 },   // Dialogs, popovers
};
```

**Rules:** Only animate `transform` and `opacity`. Never `transition-all`. Respect `prefers-reduced-motion`.

**Microinteractions:**
- Button press: `scale(0.97)` + shadow reduction
- Card hover: `translateY(-2px)` + shadow elevation
- Success: subtle scale pulse + green flash
- Loading: staggered skeleton fade
- Drag: `scale(1.02)` + shadow increase
- AI generating: pulsing border with purple glow

### 5.7 Responsive Strategy

| Breakpoint | Behavior |
|---|---|
| Mobile (<640px) | Single column, bottom nav, stacked cards, collapsible sidebar |
| Tablet (640-1024px) | Collapsible sidebar, 2-column grids |
| Laptop (1024-1536px) | Full sidebar, 3-column grids |
| Desktop (>1536px) | Full sidebar, 4-column grids, multi-panel layouts |
| Ultra-wide (>1920px) | Side-by-side analytics, wider content area |

Command palette fully functional on all screen sizes. Sidebar collapses to icons on tablet, bottom drawer on mobile.

### 5.8 Loading States

Every page has dedicated skeleton screens — never generic spinners:
- Cards: Skeleton blocks matching card dimensions
- Charts: Skeleton with chart outline
- Tables: Skeleton rows matching column count
- Forms: Skeleton input fields
- Sidebar: Skeleton nav items
- Navigation: Skeleton breadcrumbs + header

### 5.9 Error States

Every feature supports:
- **Empty State** — "No data yet" with CTA to create/add
- **Error State** — "Something went wrong" with retry action
- **Permission Denied** — Role-based access explanation
- **Offline State** — "Check your connection" with retry
- **Loading State** — Skeleton screens

### 5.10 AI UX

AI is integrated inline, not siloed in a chatbot:

- Dashboard: "Explain this metric" button on any KPI
- Analytics: "Why did engagement drop?" → inline insight card
- Scheduler: "Best time to post" → AI-highlighted optimal slots
- Content Library: "Analyze this media" → AI scores overlay
- Drafts: "Improve caption" / "Generate hashtags" / "Predict performance" → inline buttons
- Everywhere: `⌘+I` opens AI context panel for current page

### 5.11 Accessibility

WCAG 2.1 AA minimum:
- Keyboard navigation for sidebar, tables, modals, command palette
- ARIA labels on icon-only buttons
- Proper heading hierarchy (one h1 per page)
- Color contrast ratio ≥ 4.5:1
- Skip-to-content link
- Screen reader announcements for async actions
- Focus trapping in modals and dialogs
- Accessible charts (data tables as alternatives)
- Accessible tables (proper th, scope, caption)
- `prefers-reduced-motion` respected
- High contrast theme support

### 5.12 Performance

- Server Components where appropriate (static data, layouts)
- Client Components only for interactivity
- Dynamic imports for heavy components (charts, calendars)
- Code splitting by route
- Image optimization via Next.js Image
- Streaming for slow data sources
- Partial rendering for dashboard widgets
- TanStack Query caching with stale-while-revalidate

### 5.13 Error Boundaries

Every layer of the UI has a corresponding Error Boundary. Failures are isolated so one broken component never crashes the entire application.

#### Boundary Hierarchy

```
┌─────────────────────────────────────────────────────┐
│ Root Error Boundary                                 │
│ Catches: unhandled errors anywhere in the app tree  │
│ Fallback: "Something went wrong" + retry + report   │
├─────────────────────────────────────────────────────┤
│ Dashboard Error Boundary                            │
│ Catches: errors in any dashboard page               │
│ Fallback: Dashboard-specific error + back to home   │
├─────────────────────────────────────────────────────┤
│ Feature-level Error Boundaries                      │
│ Catches: errors in a specific feature module        │
│ Fallback: Feature-specific error + retry            │
├─────────────────────────────────────────────────────┤
│ Widget-level Error Boundaries                       │
│ Catches: errors in individual dashboard widgets     │
│ Fallback: "This widget failed to load" + retry      │
│ Widget fails independently — rest of dashboard ok   │
└─────────────────────────────────────────────────────┘
```

#### Route-Level Error Files

Every route group has `error.tsx` and `not-found.tsx`:

- `app/(dashboard)/error.tsx` — Dashboard-level error boundary
- `app/(dashboard)/[feature]/error.tsx` — Feature-level error boundary (per feature as needed)
- `app/not-found.tsx` — Global 404 page
- `app/(dashboard)/not-found.tsx` — Dashboard-scoped 404

#### Error Boundary Responsibilities

| Boundary | Location | Scope | Fallback |
|---|---|---|---|
| Root | `components/shared/root-error-boundary.tsx` | Entire app tree | Generic error, retry, error report |
| Dashboard | `app/(dashboard)/error.tsx` | All dashboard pages | "Dashboard unavailable", back to home |
| Feature | `features/*/components/*-error-boundary.tsx` | Individual feature | "Feature unavailable", retry |
| Widget | `components/shared/widget-error-boundary.tsx` | Individual dashboard widgets | Inline error card, retry, hide option |
| Route | `app/(dashboard)/*/error.tsx` | Specific route | Route-specific error message |

#### Every Error Boundary Provides

1. **Friendly error message** — User-facing text, no stack traces
2. **Retry action** — Button to re-render the failed component tree
3. **Error logging** — `console.error` in dev, structured logging in prod (with `requestId`)
4. **Graceful fallback** — UI that fits the context (inline for widgets, full-page for routes)

#### Widget-Level Isolation

Dashboard widgets are wrapped individually:

```tsx
<DashboardGrid>
  <WidgetErrorBoundary widgetId="followers">
    <MetricWidget type="followers" />
  </WidgetErrorBoundary>
  <WidgetErrorBoundary widgetId="engagement">
    <MetricWidget type="engagement" />
  </WidgetErrorBoundary>
  <WidgetErrorBoundary widgetId="forecast">
    <ChartWidget type="forecast" />
  </WidgetErrorBoundary>
</DashboardGrid>
```

If the forecast widget crashes (e.g., AI provider error), followers and engagement widgets continue to render normally.

---

## 6. Feature Parity Matrix

| Metricool Feature | Growthscape Equivalent | Improvement | AI-First Addition |
|---|---|---|---|
| Planner | Calendar + Scheduler + Drafts | Draft→Schedule→Publish flow, bulk ops | AI optimal time, auto-calendar |
| Analytics | Analytics module | Pre-computed aggregations, faster queries | AI explanations, anomaly detection |
| Reports | Reports module | More formats, real-time status | AI narrative summaries |
| Inbox | Social Comments + Inbox | Sentiment analysis, reply templates | AI suggested replies |
| Media Library | Content Library | AI analysis, tagging, collections | Auto-tagging, quality scoring |
| AI Assistant | AI Content Studio | Dedicated studio, prompt library | Brand memory, batch generation |
| Team | Workspace + Members | Audit logs, role-based permissions | AI workload suggestions |
| Hashtag Tracker | Content Ideas + Trends | Integrated workflow | AI per-post recommendations |
| — | AI Social Manager | — | Predictive analytics, forecasting |
| — | Trend Center | — | Multi-source aggregation |
| — | Competitor Tracker | — | Side-by-side comparison |
| — | Goals | — | Auto-tracked, milestone alerts |
| — | Automation Center | — | Rule engine |
| — | Cross-platform Comparison | — | Normalized analytics |
| — | AI Chat Assistant | — | Persistent conversations |
| — | Media Intelligence | — | Video analysis (hooks, pacing) |
| — | Performance Prediction | — | Pre-publish scoring |
| — | Brand Memory | — | Learning from performance data |
| — | Brand Persona | — | Configurable brand voice |
| — | Dashboard | Widget system, drag-drop | AI + forecast widgets |
| — | Global Search | Command palette ⌘K | Search + AI commands |
| — | Feature Flags | Admin controls | Per-workspace rollout |

---

## 7. Phased Roadmap

### Phase 1: Foundation (Weeks 1-3)
Project setup, database schema, Supabase Auth, workspace model, app shell, design system, component library, providers, dashboard skeleton, command palette, API framework, Inngest background job framework, Error Boundary architecture

### Phase 2: Brand & Social Connections (Weeks 4-5)
Brand CRUD, social account OAuth (Facebook, Instagram, YouTube), OAuth credential management, brand persona UI, settings pages

### Phase 3: Analytics Engine (Weeks 6-8)
Meta Graph API, YouTube API, daily analytics ingestion, sync job system, analytics dashboard, aggregated analytics, post-level analytics, cross-platform comparison, caching

### Phase 4: Content Management (Weeks 9-11)
Draft system, scheduled posts, publishing queue, content library, calendar view, bulk operations, publishing status tracking

### Phase 5: AI Layer (Weeks 12-14)
AI provider abstraction, prompt library, AI Content Studio, AI Chat Assistant, AI Social Manager, brand memory, media intelligence, content ideas pipeline, AI usage tracking

### Phase 6: Dashboard & Reports (Weeks 15-16)
Dashboard widget system, KPI cards, AI insight cards, reports module, goals module

### Phase 7: Advanced Features (Weeks 17-19)
Trend Center, Competitor Tracker, notifications, automation center, inbox, global search

### Phase 8: Polish & Production (Weeks 20-22)
Accessibility audit, performance optimization, error boundaries, E2E tests, API documentation, webhooks, audit log viewer, feature flags, integration framework, production deployment

### Future Phases (Post-MVP)
Smartlinks, ads management, agency dashboard, mobile app, TikTok/Threads/LinkedIn/Pinterest/X, advanced AI video analysis, revenue tracking, CRM, marketplace

---

## 8. Recommendations

1. **Rate limiting from Phase 1** — Basic rate limiting on auth endpoints prevents abuse before launch.

2. **Design review step in BMAD** — Between "Frontend Design" and "Development," add a visual QA pass.

3. **Durable background jobs** — ✅ Adopted. Inngest is the official background job framework. See Section 2.5.

4. **Soft-delete convention** — Enforce `deletedAt` in all repository methods from day one. Hard deletes require explicit override.

5. **Plan for vector embeddings** — `AIMemory.embeddingReference` is ready. Add pgvector to Supabase when semantic search is needed.

6. **Staging environment** — Use Vercel branch previews for deploy previews before production.

7. **Shared API error codes** — Both frontend and backend import from `packages/shared/types/api.ts` — no drift.

8. **Multi-currency planning** — `AIUsage.estimatedCost` should store currency alongside amount for future billing.

9. **User `lastSeenAt`** — Add for session management and inactive user cleanup.

10. **Component Storybook** — With 50+ components across 3 tiers, Storybook or Ladle in Phase 2 accelerates development and ensures visual consistency.

11. **Error Boundary architecture** — ✅ Adopted. Full Error Boundary hierarchy implemented. See Section 5.13.

---

## 9. Architecture Freeze

**This architecture is now frozen.**

The foundation is complete. No further architectural changes will be introduced unless they solve a concrete implementation problem discovered during development.

Future work focuses on implementing features according to the approved architecture, database schema, API structure, frontend architecture, and phased roadmap — not on redesigning them.

**Frozen artifacts:**
- Software architecture (feature-first, layered, Inngest background jobs)
- Database schema (39 models, 45 enums, `prisma/schema.prisma`)
- API architecture (150+ endpoints, `/api/v1/`, standard responses, Zod validation)
- Frontend architecture (design system, widget system, Error Boundaries, Motion)
- Phased roadmap (8 phases, ~22 weeks)
