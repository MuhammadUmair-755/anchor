# ANCHOR — Current Development Context

This document captures the current operational state of ANCHOR to help any developer or AI coding agent quickly ramp up and continue development accurately.

---

## 1. Project Purpose & Product Vision

**ANCHOR** is a modern full-stack web application platform designed for stability, scalability, and modular expansion. The codebase serves as a robust base ready for implementing business workflows, dashboards, and interactive user experiences.

---

## 2. Tech Stack Overview

* **Framework:** Next.js 16 (App Router with Server Components & Streaming).
* **Language & Runtime:** TypeScript 5.x on Node.js (v20+).
* **Authentication:** Clerk (`@clerk/nextjs`).
* **Database & Storage:** Supabase PostgreSQL (`@supabase/supabase-js`, `@supabase/ssr`).
* **Styling & Layout:** Tailwind CSS v4 (`@tailwindcss/postcss`).
* **UI Component Library:** Material UI (MUI v9, `@mui/material`, `@emotion/react`, `@emotion/styled`, `@mui/icons-material`, `@mui/material-nextjs`).
* **Utilities:** `clsx`, `tailwind-merge`.

---

## 3. Current Architecture & File Structure

```text
E:\anchor/
├── docs/                     # Living project documentation
│   ├── RULES.md              # Engineering rules, standards, and command restrictions
│   ├── DECISIONS.md          # Architectural and technical decision log (001-008)
│   ├── PROGRESS.md           # Module-by-module implementation status
│   └── CONTEXT.md            # High-level operational context (this file)
├── src/
│   ├── app/
│   │   ├── (auth)/           # Clerk Auth pages (sign-in, sign-up)
│   │   ├── finance/          # Milestone 3: Finance & Accounts Command Center
│   │   │   └── page.tsx      # Multi-filter ledger, accounts ribbon & intelligence dock
│   │   ├── globals.css       # Tailwind CSS root imports & font definitions
│   │   ├── layout.tsx        # Root layout with fonts, ClerkProvider, ThemeRegistry, AppShell
│   │   └── page.tsx          # Milestone 2: Executive Overview Dashboard
│   ├── components/
│   │   ├── finance/          # Finance module components (Header, Ribbon, Ledger, Velocity, Dock)
│   │   ├── overview/         # Overview components (FilterStrip, LiquidityHero, Donut, Budget, Focus)
│   │   ├── layout/           # AppShell, DesktopSidebar, TopHeader, MobileNav, QuickEntryModal
│   │   └── mui/              # MUI ThemeRegistry with AppRouterCacheProvider
│   ├── lib/
│   │   ├── clerk/            # Server-side auth helpers
│   │   ├── mui/              # MUI theme definitions (Anchor palette, typography, shape)
│   │   ├── supabase/         # Supabase client factories (client, server, admin)
│   │   └── utils.ts          # Utility functions (cn)
│   ├── services/
│   │   ├── mockData.ts       # High-fidelity domain mock fixtures matching Stitch designs
│   │   ├── overviewService.ts# Asynchronous data service for Overview aggregates & tasks
│   │   └── financeService.ts # Asynchronous data service for Accounts, Ledger & Quick Entry
│   ├── proxy.ts              # Next.js 16 Proxy convention for Clerk middleware
│   └── types/
│       ├── database.types.ts # TypeScript database definitions
│       └── models.ts         # Strict domain contracts with ZERO `any`
├── tests/
│   ├── m2_adversarial_reviewer.test.ts # 4 adversarial test suites for Overview
│   └── m3_finance_service.test.ts      # 5 verification suites for Finance
├── .env.example              # Public template of required environment keys
├── .env.local                # Local environment placeholders (ignored in git)
├── package.json              # Project dependencies and scripts
└── tsconfig.json             # TypeScript configuration
```

---

## 4. Authentication Approach

* Managed entirely through **Clerk**.
* **Global Provider:** `ClerkProvider` in `src/app/layout.tsx`.
* **Request Interceptor:** `src/proxy.ts` uses Next.js 16's proxy convention to invoke `clerkMiddleware()` across applicable routes while skipping static assets.
* **Server-side Session Access:** `src/lib/clerk/index.ts` provides `getSession()` and `getCurrentUser()`.
* **Client-side Auth Elements:** Integrated into `src/components/layout/DesktopSidebar.tsx` and mobile drawers.

---

## 5. Database Architecture (Supabase)

* **Relational Core:** PostgreSQL hosted via Supabase.
* **Client Access Patterns:**
  * `createClient()` from `src/lib/supabase/client.ts` for browser Client Components.
  * `createClient()` from `src/lib/supabase/server.ts` using cookies for Server Components, Route Handlers, and Server Actions.
  * `createAdminClient()` from `src/lib/supabase/admin.ts` using `SUPABASE_SERVICE_ROLE_KEY` for privileged backend scripts.
* **Schema Definition:** Initialized with a sample `profiles` table schema in `src/types/database.types.ts`.

---

## 6. Design System Integration

* **MUI & Tailwind Coexistence:**
  * Configured via `src/components/mui/ThemeRegistry.tsx` using `@mui/material-nextjs/v16-appRouter`.
  * `enableCssLayer: true` is configured to prevent Emotion CSS from overriding Tailwind utility classes or causing specificity conflicts.
* **Google Stitch Tokens:**
  * **Colors:** Deep Anchor Navy (`#0B1628`), Navy Surface (`#12243A`), Mineral Canvas (`#F7F5EF` / `#FCFBF8`), Muted Slate (`#6D8EAD`), Controlled Sage (`#5F9277`), Soft Coral (`#C76D68`), Warm Ochre (`#C4934A`).
  * **Typography:** `Newsreader` (editorial display serif), `Plus Jakarta Sans` (UI body), `JetBrains Mono` (tabular numbers with `fontFeatureSettings: '"tnum" on, "zero" on'`).
* **Icons:** Standardized on `@mui/icons-material`.

---

## 7. Development Constraints & Critical Rules

1. **NO Heavy Commands Without Permission:** Never run `npm run build`, production bundling, heavy test suites, or benchmarks unless the user explicitly directs you to do so.
2. **Consult Docs First:** Read `RULES.md`, `DECISIONS.md`, `PROGRESS.md`, and `CONTEXT.md` before starting any new module.
3. **Log All Decisions:** Any new technical, structural, or UX decision must be recorded in `docs/DECISIONS.md`.
4. **Maintain Sync:** Update `PROGRESS.md` and `CONTEXT.md` after completing each module.

---

## 8. Current Phase & Active Modules

* **Overview Command Center (`/`):** 100% complete and fully verified.
* **Finance & Accounts Command Center (`/finance`):** 100% complete and fully verified.
* **Tasks Management System (`/tasks`):** 100% complete and fully verified.
* **Daily Notes & Journal System (`/notes`):** 100% complete and fully verified.
* **Unified Calendar & Goals Nexus (`/calendar`):** 100% complete and fully verified matching Stitch Desktop `1107476226ef43f3ab26357445fb9cba`.
* **Automated Tests:** All test suites passing 100% (including `tests/calendar_service_and_ui.test.ts` 14/14, `tests/calendar_service.test.ts` 10/10, `tests/calendar_reviewer_adversarial.test.ts` 6/6, `tests/calendar_reviewer_adversarial_round2.test.ts` 6/6, and `tests/calendar_reviewer_adversarial_round3.test.ts` 7/7 tests).
* **Type Safety:** Full `npx tsc --noEmit` clean compile with 0 errors across the entire codebase.
* **Next Steps:** Production readiness, Clerk/Supabase live key attachment when directed.
