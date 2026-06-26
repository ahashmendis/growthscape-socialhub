# ARCHITECTURE.md

# Technology Stack

## Frontend

* Next.js
* React
* TypeScript
* Tailwind CSS
* shadcn/ui
* Magic UI
* Motion
* Lucide React
* TanStack Table
* Recharts
* React Hook Form
* Zustand
* Zod

---

## Backend

* Next.js Route Handlers
* Supabase
* Prisma ORM

---

## Database

* PostgreSQL

---

## Authentication

* Supabase Auth
* Google OAuth
* Meta OAuth

---

## APIs

* Meta Graph API
* Instagram Graph API
* YouTube Data API
* YouTube Analytics API
* Google Trends

Future:

* TikTok API
* LinkedIn API
* Pinterest API

---

## AI

* Gemini (Free Tier)
* OpenRouter Free Models

---

## Hosting

* Vercel
* Supabase

---

# Folder Structure

apps/

web/

packages/

ui/

database/

api/

auth/

analytics/

scheduler/

social/

ai/

shared/

docs/

tests/

scripts/

---

# MCP Usage

## Context7

Use when:

* Installing packages
* Reading documentation
* API integration
* Framework updates
* Library usage

---

## Sequential Thinking

Use when:

* Architecture
* Planning
* Refactoring
* Debugging
* Complex features

---

## Supabase MCP

Use when:

* Authentication
* Database
* Storage
* Edge Functions
* Policies
* Migrations

---

## GitHub MCP

Use when:

* Large refactors
* Pull Requests
* Commit history
* Repository management

---

## Playwright MCP

Use after every UI feature.

Validate:

* Navigation
* Forms
* Responsive layouts
* Accessibility
* Animations
* User flows

---

## Browser MCP

Use when:

* Inspecting deployed pages
* Debugging frontend
* Verifying production behavior

---

## Filesystem MCP

Use for:

* Exploring the project
* Refactoring
* Organizing files
* Updating documentation

---

## Figma MCP

Use when implementing designs from Figma.

Maintain pixel-perfect implementation.

---

# UI Libraries

Always use:

* shadcn/ui
* Magic UI
* Motion
* Recharts
* TanStack Table
* Lucide React

Never create custom components if a high-quality reusable component already exists.

---

# Development Rules

One feature per task.

One pull request per feature.

One responsibility per module.

Never introduce breaking changes without approval.

Always update documentation.

Always test before completion.

---

# Performance Goals

Fast page loads

Server Components where appropriate

Optimized database queries

Lazy loading

Code splitting

Caching

Optimized bundle size

Responsive design

Accessibility

SEO where applicable

---

# Quality Assurance

Every completed feature must include:

* Type safety
* Error handling
* Responsive UI
* Accessibility
* Loading states
* Empty states
* Testing
* Documentation

Production-ready quality is required before considering any feature complete.
