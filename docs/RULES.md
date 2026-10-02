# ANCHOR — Engineering & Development Rules

These rules define the baseline standards for building and maintaining the ANCHOR application. Every contributor and AI agent must adhere to these guidelines to ensure consistency, maintainability, and clean code.

---

## 1. Command Execution Restrictions (CRITICAL)

* **Permission Required for Heavy Commands:** Never run `npm run build`, full production rebuilds, heavy benchmarking scripts, or long-running automated test suites without explicit permission from the user.
* **Lightweight Verification First:** Use targeted type checks (`npx tsc --noEmit` if necessary) or lint checks only when requested or relevant, and always keep command execution lean and unobtrusive.

---

## 2. Architecture & Folder Structure

Anchor follows a structured Next.js App Router convention inside `src/`:

```text
src/
├── app/                  # App Router pages, layouts, and route handlers
│   ├── (auth)/           # Authentication route group (sign-in, sign-up)
│   ├── api/              # Backend Route Handlers
│   ├── globals.css       # Global stylesheet & Tailwind root
│   └── layout.tsx        # Root layout with providers
├── components/           # UI Components
│   ├── common/           # Shared, generic UI components (buttons, badges, modals)
│   ├── layout/           # App shell (Navbar, Sidebar, Footer)
│   └── mui/              # MUI wrappers and Theme Registry
├── lib/                  # Shared utilities and SDK client configurations
│   ├── clerk/            # Clerk auth helpers and utilities
│   ├── supabase/         # Supabase client factories (browser, server, admin)
│   ├── mui/              # Theme configuration and palette definitions
│   └── utils.ts          # General helper functions (cn, formatters)
├── hooks/                # Custom reusable React hooks
├── types/                # Shared TypeScript definitions & database schemas
└── services/             # Business logic and data access layer
```

* **Naming Conventions:**
  * Components: PascalCase (e.g., `TechCard.tsx`, `Navbar.tsx`).
  * Utilities, hooks, and services: camelCase (e.g., `useUserSession.ts`, `formatDate.ts`).
  * Route files: Next.js conventions (`page.tsx`, `layout.tsx`, `route.ts`, `loading.tsx`, `error.tsx`).

---

## 3. Component Architecture & Reusability

* **Readability → Reuse → Simplicity:** Prioritize clear, simple components. Do not prematurely abstract code for hypothetical use cases.
* **Single Responsibility:** Keep components focused and small (<150–200 lines). Break large views into logical sub-components.
* **Prefer Existing Components:** Always check `src/components/common` or established UI patterns before creating duplicate markup or new components.
* **Configurable via Props:** Build reusable components that accept typed props and callbacks rather than hardcoding business logic or data fetching inside them.
* **Server vs. Client Boundaries:**
  * Default to React Server Components (RSC) for data fetching and static markup.
  * Only mark components with `"use client"` when state, browser APIs, or event handlers are required.

---

## 4. TypeScript & Typing Standards

* **Strict Typing:** No `any`. If an unknown external input is received, use `unknown` and validate with Zod or type guards.
* **Centralized Shared Types:** Place cross-module types and entity schemas in `src/types/` (e.g., `src/types/database.types.ts`).
* **Explicit Prop Interfaces:** Every component must have an explicit TypeScript interface or type for its props.
* **Synchronized Contracts:** API responses, database models, and frontend component states must remain strictly synchronized through shared types.

---

## 5. API Design & Data Handling

* **Separation of Concerns:** Keep API/database logic completely out of UI presentation components. Use dedicated helper services in `src/services/` or route handlers.
* **Consistent Response Format:** API routes must return predictable JSON schemas:
  ```json
  { "data": T, "error": null }
  { "data": null, "error": { "message": string, "code": string } }
  ```
* **State Completeness:** Every dynamic UI must gracefully handle four distinct states:
  1. **Loading State:** Skeleton loaders or subtle spinners.
  2. **Error State:** Human-readable message with recovery/retry options.
  3. **Empty State:** Clear, constructive feedback guiding the user on next actions.
  4. **Success State:** Populated UI.
* **Input Validation:** Validate all incoming parameters and payload bodies (using Zod or equivalent) before processing.

---

## 6. Authentication & Database Security

* **Clerk Integration:**
  * Centralize auth logic in `src/lib/clerk/`.
  * Authenticate server actions and route handlers using `auth()` or `currentUser()` from `@clerk/nextjs/server`.
  * Use Clerk middleware/proxy (`src/proxy.ts`) to guard protected paths.
* **Supabase Access Patterns:**
  * Browser client (`src/lib/supabase/client.ts`): Use for public data or client-side queries subject to Row Level Security (RLS).
  * Server client (`src/lib/supabase/server.ts`): Use inside Server Components, Route Handlers, and Server Actions with cookies.
  * Admin client (`src/lib/supabase/admin.ts`): Only for trusted backend operations using `SUPABASE_SERVICE_ROLE_KEY`. Never import into Client Components.
* **Row Level Security (RLS):** Every Supabase table must have RLS enabled and tested.
* **Secrets & Environment Variables:**
  * Never commit `.env` or `.env.local` containing real API keys.
  * Keep `.env.example` updated with mock placeholders whenever a new variable is introduced.
  * Public client variables must start with `NEXT_PUBLIC_`. Private keys must stay server-only.

---

## 7. Design System & UI Consistency

Anchor uses a unified combination of **Tailwind CSS** (for structural layout and responsiveness) and **Material UI (MUI)** (for rich interactive components) coordinated via CSS layer isolation.

### Color Palette
* **Primary (Anchor Blue):** `#1976d2` (Hover/Dark: `#1565c0`, Light: `#42a5f5`)
* **Secondary / Accent:** `#9c27b0` (Hover: `#7b1fa2`)
* **Backgrounds:**
  * Light: `#f8fafc` (Page background), `#ffffff` (Card/Surface)
  * Dark: `#020617` (Page background), `#0f172a` (Card/Surface)
* **Text:**
  * Primary: Slate 900 (`#0f172a`) on light / Slate 50 (`#f8fafc`) on dark
  * Secondary / Muted: Slate 500 (`#64748b`) on light / Slate 400 (`#94a3b8`) on dark
* **Status Colors:**
  * Success: `#10b981` (Emerald)
  * Warning: `#f59e0b` (Amber)
  * Error: `#ef4444` (Red)
  * Info: `#3b82f6` (Blue)

### Typography
* **Font Family:** `var(--font-geist-sans), sans-serif` for body; `var(--font-geist-mono), monospace` for code.
* **Scale:** Use Tailwind font-size utilities (`text-xs` to `text-3xl`) or standard MUI variants (`h1`–`h6`, `body1`, `body2`).
* **Buttons:** Normal case (`textTransform: 'none'`), semi-bold (`fontWeight: 600`).

### Spacing, Radius & Shadows
* **Spacing:** 4px grid system (`p-1` = 4px, `p-2` = 8px, `p-4` = 16px, `p-6` = 24px, etc.).
* **Border Radius:** Default card and button radius is `8px` (`rounded-lg` or MUI `borderRadius: 8`).
* **Borders:** Thin, subtle borders (`border border-slate-200 dark:border-slate-800`).
* **Shadows:** Soft and modern (`shadow-sm` for cards, `shadow-md` for floating elements/dropdowns).

### Iconography
* **Icon Set:** Use `@mui/icons-material` exclusively for icons across the app. Do not mix third-party icon libraries without prior approval.

---

## 8. Responsive Design & Accessibility

* **Mobile-First:** Design and test every screen across `sm` (640px), `md` (768px), `lg` (1024px), and `xl` (1280px).
* **Accessible Semantics:** Use semantic HTML (`<main>`, `<nav>`, `<header>`, `<footer>`, `<section>`).
* **Labels & Roles:** Ensure buttons, inputs, and icon-only triggers have descriptive `aria-label` or visible labels.
* **Contrast:** Maintain accessible contrast ratios (WCAG AA compliant) in both light and dark themes.

---

## 9. Dependencies & Upgrades

* **No Unnecessary Packages:** Do not install utility libraries or packages without a clear justification. First check if native APIs, Tailwind, or MUI satisfy the requirement.
* **Record Changes:** Document any new dependency in `docs/DECISIONS.md`.
