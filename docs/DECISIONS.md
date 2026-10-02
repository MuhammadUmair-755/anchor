# ANCHOR — Technical & Architectural Decision Log

This log documents all major technical, architectural, design, and integration decisions made for the ANCHOR project. Follow this format when adding new decisions.

---

## Decision 001: Next.js 16 App Router & React 19 Foundation

Date: 2026-10-01  
Status: Accepted  

### Context
Anchor requires a scalable, full-stack React framework capable of server-side rendering, streaming, efficient routing, and modern React 19 features.

### Decision
Use Next.js 16 with the App Router, TypeScript, and `src/` directory layout.

### Reason
* Next.js App Router provides Server Components (RSC) by default, lowering client-side bundle size.
* Built-in route handlers, metadata APIs, and server actions reduce boilerplate.
* Strict TypeScript integration ensures end-to-end type safety.

### Impact
Affects all routing, rendering boundaries, data fetching, and core application configuration.

---

## Decision 002: Dual Styling Architecture with Tailwind CSS & Material UI (MUI)

Date: 2026-10-01  
Status: Accepted  

### Context
The user requested both Tailwind CSS and Material UI (MUI) for Anchor. Combining both libraries can sometimes lead to CSS specificity collisions or SSR hydration issues in Next.js App Router.

### Decision
Integrate MUI using `@mui/material-nextjs/v16-appRouter` wrapped in `ThemeRegistry.tsx` with `enableCssLayer: true`. Use Tailwind CSS for responsive layout, grids, and shell architecture, and MUI for rich accessible components (Dialogs, Buttons, Menus, Cards).

### Reason
* `AppRouterCacheProvider` guarantees zero hydration mismatches by collecting Emotion styles on the server during streaming.
* Enabling CSS layers ensures Tailwind utility classes and MUI component styles coexist without specificity bugs.

### Impact
Affects `src/app/layout.tsx`, `src/lib/mui/theme.ts`, `src/components/mui/ThemeRegistry.tsx`, and all UI components.

---

## Decision 003: Clerk for Authentication and User Management

Date: 2026-10-01  
Status: Accepted  

### Context
Secure, drop-in user authentication and profile management are required without managing raw passwords or authentication microservices manually.

### Decision
Use `@clerk/nextjs` for authentication, session handling, protected routes, and user profile UI.

### Reason
* Offloads security compliance, OAuth providers, MFA, and session tokens to a battle-tested service.
* Provides native Next.js Server Component helpers (`auth()`, `currentUser()`) and client-side hooks (`useAuth()`, `useUser()`).
* Pre-built accessible components (`<SignIn />`, `<SignUp />`, `<UserButton />`) accelerate delivery.

### Impact
Affects `src/proxy.ts`, `src/app/(auth)/`, `src/lib/clerk/`, and authentication guards in API routes.

---

## Decision 004: Supabase for PostgreSQL Database and SSR Architecture

Date: 2026-10-01  
Status: Accepted  

### Context
Anchor requires a reliable relational database with real-time capabilities and flexible querying from both server and client environments.

### Decision
Use `@supabase/supabase-js` and `@supabase/ssr` to configure three distinct client instances:
1. `client.ts`: Browser-side client using public anon key for Client Components.
2. `server.ts`: Server-side client using cookies for Server Components and Route Handlers.
3. `admin.ts`: Privileged administrative client using Service Role key for secure server tasks.

### Reason
* The `@supabase/ssr` package handles Next.js async cookie lifecycle securely.
* Separation into browser, server, and admin clients prevents accidental leakage of service role keys.
* Enables strong Row Level Security (RLS) policies directly on Postgres.

### Impact
Affects `src/lib/supabase/`, `src/types/database.types.ts`, and all future data storage services.

---

## Decision 005: Command Execution Policy (Heavy Commands Restricted)

Date: 2026-10-01  
Status: Accepted  

### Context
Full project builds (`npm run build`), deep bundling steps, and heavy long-running operations consume significant time, memory, and CPU resources, causing workflow delays or environment interruptions.

### Decision
AI agents and automated tools must never run `npm run build` or heavy commands without explicit user consent.

### Reason
* Prevents unnecessary build overhead during incremental development steps.
* Gives the user full oversight over resource-intensive operations.

### Impact
Affects all development workflows, automated testing commands, and verification steps.

---

## Decision 006: Stitch Design System Fidelity & Tri-Font Typography

Date: 2026-10-01  
Status: Accepted  

### Context
The Stitch designs (`https://stitch.withgoogle.com/projects/196342399105692014`) specify a precise, high-trust sovereign aesthetic featuring an editorial executive tone, warm mineral backgrounds, and crisp tabular data.

### Decision
Standardize on the ANCHOR tri-font hierarchy and color palette:
- **Newsreader** (Georgia serif fallback): Editorial headlines, philosophy quotes, sovereign target notes.
- **Plus Jakarta Sans** (sans-serif fallback): UI elements, card headings, navigation labels, button text.
- **JetBrains Mono** (monospace fallback with `fontFeatureSettings: '"tnum" on, "zero" on'`): Currency values, percentages, ledger amounts, time stamps.
- **Colors**: Deep Anchor Navy (`#0B1628`), Mineral Canvas (`#F7F5EF` / `#FCFBF8`), Muted Slate (`#6D8EAD`), Controlled Sage (`#5F9277`), Soft Coral (`#C76D68`), Warm Ochre (`#C4934A`).

### Reason
Preserves visual fidelity with Google Stitch screens while ensuring maximum readability for dense financial figures.

### Impact
Applied across `src/app/layout.tsx`, `src/lib/mui/theme.ts`, `src/app/globals.css`, and all overview/finance components.

---

## Decision 007: MUI v9 `slotProps` Convention & Reusable UI Priority

Date: 2026-10-01  
Status: Accepted  

### Context
Material UI v9 deprecates legacy props like `InputProps` on `TextField`, `PaperProps` on `Dialog`/`Menu`, and the `item` prop on `Grid`.

### Decision
- Standardize on `slotProps={{ input: { ... } }}` for TextFields, and `slotProps={{ paper: { sx: ... } }}` for Dialogs/Menus.
- Replace legacy MUI Grid containers with CSS Grid (`Box sx={{ display: 'grid', gridTemplateColumns: ... }}`) for fluid responsive control without framework deprecation noise.
- Prioritize native MUI components (`Button`, `Dialog`, `Drawer`, `Menu`, `Select`, `TextField`, `Card`, `LinearProgress`, `Chip`, `Snackbar`) over custom UI elements.

### Reason
Guarantees clean compile-time TypeScript compatibility with Next.js 16 and MUI v9 while strictly adhering to user instructions to favor MUI components.

### Impact
Affects all modal dialogs, entry forms, selects, and grid layouts across `src/components/`.

---

## Decision 008: Decoupled Service Architecture with In-Memory State & Supabase Fallback

Date: 2026-10-01  
Status: Accepted  

### Context
UI components need immediate, responsive interactions (task toggling, budget allocation tweaking, transaction quick entry, CSV exports) while retaining the ability to sync with Supabase when environment keys are configured.

### Decision
Implement domain-specific typed services (`overviewService.ts`, `financeService.ts`) providing asynchronous APIs (`getOverviewData`, `toggleTask`, `addTask`, `getAccounts`, `getTransactions`, `recordTransaction`, `exportLedgerToCsv`). Services operate on deep-cloned in-memory state initialized from Stitch-compliant mock fixtures with high-entropy collision-resistant ID generation (`task-${Date.now()}-${random}`).

### Reason
Decouples UI views from data storage implementation, prevents accidental in-memory state pollution, facilitates comprehensive programmatic testing (`npx tsx tests/...`), and allows seamless swapping to Supabase PostgreSQL client calls.

### Impact
Affects `src/services/`, `src/types/models.ts`, and page data loaders.

