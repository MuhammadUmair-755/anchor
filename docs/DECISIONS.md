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

---

## Decision 009: Unified Calendar & Goals Nexus Architecture (`/calendar`)

Date: 2026-10-02  
Status: Accepted  

### Context
The final remaining screen from Stitch (`https://stitch.withgoogle.com/projects/196342399105692014`, Desktop `1107476226ef43f3ab26357445fb9cba`) is the Unified Calendar & Goals Nexus. It brings together cross-system operational vectors: financial ledger rollups, task completion cadences, journal inscription markers, and persistent sovereign goals tracking.

### Decision
1. Implement an interactive 5-week 35-cell matrix for September 2026 in `CalendarMatrix.tsx`, highlighted with the Friday, Sep 11 active focus day badge, pulsing indicator, and rollup pills.
2. Synchronize day cell selections with `DayNexusInspector.tsx` (35% desktop width), supporting real-time interactive task toggling across 5 operational tasks, financial breakdowns, journal quotes, and cadence contribution banners.
3. Persistent sovereign tracking cards in `SovereignGoalsHub.tsx` tracking Annual Capital Reserve (72%), Next.js 15 Mastery (70%), and Physical Resilience (82%) with native MUI progress meters and milestone calibration via `AdjustMilestonesModal.tsx`.
4. Dedicated `calendarService.ts` maintaining in-memory state with deep cloning and synthesized inspector generation for arbitrary calendar days.
5. Strict MUI v9 `slotProps` usage across dialogs (`NewEventModal.tsx`, `AdjustMilestonesModal.tsx`) with zero `any` and 100% test coverage.

### Reason
Ensures complete fidelity with Google Stitch tokens, seamless navigation connectivity, strict TypeScript safety, and decoupled domain architecture.

### Impact
Affects `src/app/calendar/`, `src/components/calendar/`, `src/services/calendarService.ts`, and `tests/calendar_service_and_ui.test.ts`.

---

## Decision 010: Adversarial Hardening & Telemetry Synchronization in Calendar Nexus

Date: 2026-10-02  
Status: Accepted  

### Context
Adversarial review (Round 1) identified subtle state integrity risks in the Calendar & Goals Nexus:
1. `addEvent()` invalidated day inspector caches, which wiped out authentic Stitch day inspector datasets on Sep 11 and failed to append new tasks to inspector checklists.
2. `toggleDayTask()` used a clamped ceiling (`Math.max(allDone, 41)`) that froze the Matrix Temporal Health resolved tasks count at 41 regardless of task toggling.
3. Milestone slider calibrations updated percentages without recalculating corresponding achieved and gap metrics.
4. Raw platform-dependent emojis (`⚓`, `🎯`) degraded cross-OS rendering consistency.
5. CalendarMatrix lacked dynamic responsive adaptation for the Month / Week / Day segmented toggle.

### Decision
1. Hardened `calendarService.addEvent()` to mutate and append directly to existing inspector datasets instead of evicting them.
2. Implemented reactive delta tracking in `calendarService.toggleDayTask()` to dynamically increment/decrement `temporalHealth.tasksResolvedCount`.
3. Added automatic recalculation of achieved and gap metrics in `calendarService.updateGoalProgress()` for all three sovereign goals.
4. Standardized all icon triggers to native `@mui/icons-material` vector components (`AnchorIcon`, `TrackChangesIcon`).
5. Enabled dynamic view slicing (`month`, `week`, `day`) in `CalendarMatrix.tsx` and connected the `⌘K` keyboard shortcut listener in `CalendarHeader.tsx`.

### Impact
Applied across `src/services/calendarService.ts`, `src/components/calendar/`, `src/app/calendar/page.tsx`, and verified by `tests/calendar_reviewer_adversarial.test.ts`.

---

## Decision 011: Adversarial Hardening (Round 2) — Reactive Rollups, Dynamic Month Navigation, & Multi-Task Synthesis

Date: 2026-10-02  
Status: Accepted  

### Context
Adversarial review (Round 2) identified eight state synchronization, telemetry, and responsiveness flaws:
1. Active focus day (Friday Sep 11) in `CalendarMatrix.tsx` hardcoded `-Rs. 1,300` and `3/5 done`, preventing the cell from reflecting toggled tasks or recorded transactions.
2. `getDayInspectorData` synthesis capped generated task items at 3, causing multi-task days (e.g. Sep 09 with 6 tasks) to lose tasks upon inspection and toggling.
3. Month navigation (`onPrevMonth` / `onNextMonth`) hardcoded August/October strings and skipped calendar day regeneration.
4. `NewEventModal` failed to sync its `date` state when opened with a newly selected calendar day.
5. `CalendarHeader` hid segmented view toggles on mobile screens, blocking access to Week and Day views.
6. `CalendarMatrix` 7-column layout lacked mobile text abbreviations and cell overflow handling.
7. `DayNexusInspector` ledger items used unconstrained dynamic columns squishing cards into thin slivers on multiple additions.
8. `DayNexusInspector` omitted the `+` sign for positive ledger totals.

### Decision
1. Connected Friday Sep 11 spend pill and task rollup to `day.financeAmount`, `day.tasksDone`, and `day.tasksTotal`.
2. Expanded synthesized day inspector task generation to generate the full array of `tasksTotal` items.
3. Implemented dynamic month grid generation in `calendarService.getCalendarDays()` and genuine step navigation in `CalendarPage.tsx`.
4. Added `useEffect` in `NewEventModal.tsx` to synchronize `date` state whenever `open` or `defaultDate` updates.
5. Displayed segmented view toggle across all viewports with responsive font sizes and padding.
6. Added responsive mobile text formatting and overflow protection to `CalendarMatrix.tsx`.
7. Applied responsive wrapping columns (`repeat(auto-fit, minmax(90px, 1fr))` / `repeat(3, 1fr)`) to `DayNexusInspector.tsx` ledger cards.
8. Updated `formatLedgerAmount` to prepend `+` for positive balances.

### Impact
Affects `src/services/calendarService.ts`, `src/components/calendar/`, `src/app/calendar/page.tsx`, and verified by `tests/calendar_reviewer_adversarial_round2.test.ts`.

---

## Decision 012: Adversarial Hardening (Round 3) — Multi-Month State Isolation, Dynamic Cadence Range, & Weekday Search Resilience

Date: 2026-10-02  
Status: Accepted  

### Context
Adversarial review (Round 3) identified seven subtle edge cases and state synchronization gaps across multi-month operations and search predicates:
1. Hardcoded `"2026-09"` in `CalendarPage.tsx` caused the calendar matrix to snap back to September whenever a task was toggled or an event was recorded in non-September months (e.g. October).
2. `calendarService.getCalendarDays()` generated bare day cells for non-September months without merging stored events, newly created tasks, or inspector data, causing data erasure on month reload.
3. Adding events for dates outside September pushed new elements directly into `this.calendarDays`, violating the 35-cell September matrix structure contract.
4. Month navigation (`handleNavigateMonth`) failed to synchronize `selectedDateKey`, `inspectorData`, and `temporalHealth` with the newly viewed month, leaving the inspector showing September 11 while looking at October.
5. `calendarService.getTemporalHealth()` returned a hardcoded `"September Operational Equilibrium"` title regardless of the requested month.
6. In Day view, searching for full weekday names (e.g. `"friday"`) failed because `displayedWeekdays` was sliced to 1 element, causing `displayedWeekdays[dayIndex % 7]` to return `undefined`.
7. `AdjustMilestonesModal` and `NewEventModal` failed to re-initialize form state when opened after a previous cancellation, retaining stale unsubmitted values.
8. `TemporalCadenceLegend` rendered a static `"30 Days · Week 36 to Week 40"` label regardless of active view (Month / Week / Day) or month duration (31 days).

### Decision
1. Updated `handleToggleTask` and `handleCreateEvent` in `CalendarPage.tsx` to dynamically query and reload `currentMonthKey`.
2. Introduced `this.extraDayCells` in `calendarService.ts` to cleanly isolate out-of-month entries while enriching all generated multi-month matrix cells with existing events, rollups, and inspector records without mutating the curated 35-cell September matrix.
3. Synchronized `selectedDateKey`, `inspectorData`, and `temporalHealth` in `handleNavigateMonth` to automatically focus on the viewed month (Day 1, or Sep 11 for September).
4. Adapted `getTemporalHealth(month)` to dynamically produce month-aware operational equilibrium titles (e.g., `"October Operational Equilibrium"`).
5. Expanded weekday search matching in `CalendarMatrix.tsx` to reference the full `WEEKDAYS` constant and full weekday names (`"friday"`, `"monday"`, etc.), eliminating out-of-bounds evaluation in Day view.
6. Reset modal form states upon `open === true` in `AdjustMilestonesModal.tsx` and `NewEventModal.tsx`.
7. Dynamically derived `cycleRangeText` in `CalendarPage.tsx` based on `activeView` (`"1 Day · Daily Vector Telemetry"`, `"7 Days · Week Cadence Focus"`, or month day counts).
8. Connected `onFilterMatrix`, `onNotifications`, and `onViewOptions` header action callbacks to informative user feedback.

### Impact
Affects `src/services/calendarService.ts`, `src/components/calendar/`, `src/app/calendar/page.tsx`, and verified by `tests/calendar_reviewer_adversarial_round3.test.ts` (7/7 passing).

