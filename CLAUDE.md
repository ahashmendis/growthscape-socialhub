# CLAUDE.md

# Growthscape Social Hub

Growthscape Social Hub is an AI-first Social Media Operating System inspired by Metricool, but designed to go far beyond it.

This project is expected to become a production-grade SaaS platform with a modular architecture, clean codebase, excellent UI/UX, AI-powered insights, and scalable infrastructure.

The primary objective is **quality over speed**.

---

# Core Principles

Always prioritize:

* Scalability
* Maintainability
* Modularity
* Clean Architecture
* Reusable Components
* Strong Typing
* Security
* Performance
* Accessibility
* Excellent UI/UX

Never write quick hacks.

Never duplicate code.

Never ignore architecture.

Always think long-term.

---

# Development Workflow (BMAD)

Every feature must follow:

Business Analysis

↓

Requirements

↓

Architecture

↓

Database Design

↓

API Design

↓

Frontend Design

↓

Development

↓

Testing

↓

Review

↓

Documentation

↓

Commit

Never skip steps.

---

# Before Starting Any Task

Always:

1. Read PROJECT.md
2. Read ARCHITECTURE.md
3. Understand the requested module
4. Ask for clarification if requirements are ambiguous
5. Implement ONLY the requested feature

Never build unrelated features.

---

# Coding Standards

Always use:

* TypeScript
* Functional React Components
* Server Components where appropriate
* Strict TypeScript
* Strict ESLint
* Zod Validation
* Prisma ORM
* Supabase Auth
* Tailwind CSS

Avoid:

* any
* duplicated logic
* inline SQL
* inline CSS
* giant components
* unnecessary abstractions

---

# Frontend Development Rules

The UI is a first-class requirement.

Never create placeholder dashboards.

Never create generic admin templates.

Every screen must look like a modern commercial SaaS.

## Required Frontend Stack

Always use:

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
* Zod
* Zustand

Do not replace these libraries unless explicitly requested.

---

# Frontend MCP Rules

Before building any UI:

Use Context7 MCP to obtain the latest documentation.

Use Magic UI whenever suitable.

Use shadcn/ui as the primary component library.

If a Figma design exists, use Figma MCP.

After every completed UI:

Use Playwright MCP to verify:

* Responsiveness
* Navigation
* Forms
* Animations
* Layout
* Accessibility

---

# UI Quality

Every page should feel comparable to:

* Linear
* Vercel
* Stripe
* Notion
* Arc Browser
* Supabase Dashboard

Avoid:

* Generic CRUD layouts
* Plain HTML
* Poor spacing
* Inconsistent cards
* Random colors
* Default styling

---

# Component Rules

Always create reusable components.

Examples:

* AnalyticsCard
* StatsCard
* GrowthChart
* Sidebar
* Navbar
* CommandPalette
* DataTable
* EmptyState
* LoadingSkeleton
* ActivityFeed

Never duplicate component logic.

---

# Responsive Design

Support:

* Mobile
* Tablet
* Desktop
* Ultra-wide

Responsiveness must be implemented from the beginning.

---

# Accessibility

Support:

* Keyboard navigation
* Proper contrast
* Semantic HTML
* ARIA labels
* Focus states

---

# Backend Rules

Always:

* Validate every input
* Handle every error
* Create reusable APIs
* Keep business logic outside UI
* Use service layers

---

# Database Rules

Always:

* Prisma ORM
* PostgreSQL
* Proper indexing
* Foreign keys
* Transactions
* Migrations

Never duplicate data.

---

# AI Rules

AI recommendations must explain WHY.

Never generate random suggestions.

Always use available analytics.

Recommendations must be actionable.

---

# Documentation

Every completed feature must update documentation.

Documentation must always stay synchronized with the project.

---

# MCP Usage

Use Context7 whenever documentation is required.

Use Sequential Thinking for:

* Planning
* Architecture
* Debugging
* Refactoring

Use Supabase MCP for:

* Auth
* Database
* Storage
* Policies
* Migrations

Use GitHub MCP before major refactors.

Use Browser MCP when validating deployed pages.

Use Playwright MCP after every UI feature.

Use Filesystem MCP to explore and organize the project.

Use Figma MCP only when implementing Figma designs.

---

# Final Rule

Think like a Senior Staff Engineer.

Optimize for maintainability, scalability, developer experience, and an exceptional user experience.

Never stop at "working."

Aim for "production-ready."
