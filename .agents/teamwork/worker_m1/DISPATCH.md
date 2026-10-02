## 2026-10-01T17:11:22Z
You are Worker 1 (teamwork_preview_worker) implementing Milestone 1: Foundation, Theme & App Shell for the ANCHOR Life Command Center.

Your Working Directory: E:\anchor\.agents\teamwork\worker_m1
Original Request File: E:\anchor\.agents\teamwork\ORIGINAL_REQUEST.md
Project Specification: E:\anchor\.agents\teamwork\PROJECT.md
Explorer Reports:
- E:\anchor\.agents\teamwork\explorer_survey_1\handoff.md (Codebase & Mandatory Docs Survey)
- E:\anchor\.agents\teamwork\explorer_survey_2\handoff.md (Stitch Design Specification Report)
- E:\anchor\.agents\teamwork\explorer_survey_3\handoff.md (Architecture, Types & MUI Component Mapping)

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

CRITICAL COMMAND RESTRICTION:
NEVER run `npm run build`, full production rebuilds, heavy benchmarking scripts, or long-running automated test suites without explicit permission from the user. You MAY run lightweight checks such as `npx tsc --noEmit` or `npm run lint`.

TASK SCOPE (Milestone 1):
1. **Fonts & Layout Baseline**:
   - Update `src/app/layout.tsx` to import Google Fonts `Newsreader`, `Plus_Jakarta_Sans`, and `JetBrains_Mono` via `next/font/google` and attach their CSS variable classes (`--font-newsreader`, `--font-plus-jakarta-sans`, `--font-jetbrains-mono`).
   - Remove the existing marketing `<Navbar />` and `<Footer />` components from `src/app/layout.tsx`. Wrap `{children}` with the responsive `<AppShell>`.
2. **Theme & Tokens**:
   - Update `src/lib/mui/theme.ts` to implement the Anchor OS theme:
     - Primary Navy: `#0B1628`
     - Secondary Slate: `#40617E` / `#6D8EAD`
     - Canvas Background: `#F7F5EF`, Surface Paper: `#FCFBF8`
     - Controlled Sage: `#5F9277` (text `#3F6853`)
     - Soft Coral: `#C76D68` (text `#8C3F3B`)
     - Warm Ochre: `#C4934A`
     - Hairlines: `rgba(17, 28, 46, 0.08)`
     - Fonts mapped to CSS variables.
   - Update `src/app/globals.css` with `@theme` variables and utility classes (such as `.no-scrollbar`).
3. **Domain Models (`src/types/models.ts`)**:
   - Implement the complete TypeScript interfaces defined in Explorer 3's handoff (lines 114–348).
   - Ensure ZERO `any` types. Export all entities (`Account`, `Transaction`, `BudgetEnvelope`, `DailyTask`, `TodayDebitItem`, `OutflowSector`, `CashflowVelocity`, `RecurringObligation`, `MindsetGoalAnchor`, `ExecutiveOverviewData`, `TransactionFilterCriteria`, `PaginatedTransactionsResponse`, `QuickEntryPayload`).
4. **Service Layer (`src/services/`)**:
   - Create `src/services/mockData.ts` with rich, authentic mock data matching the Stitch screenshots (Alex Vance, Rs. 79,200 liquidity, Rs. 117,200 net capital, HDFC ••4092, Amex Platinum ••1042, Blue Tokai, etc.).
   - Create `src/services/overviewService.ts` and `src/services/financeService.ts` with clean asynchronous service methods.
5. **Responsive App Shell Components (`src/components/layout/`)**:
   - Create `AppShell.tsx`: Responsive container that switches between Desktop and Mobile navigation.
   - Create `DesktopSidebar.tsx`: 256px permanent left navigation spine (`w-64`) with ⚓ brand monogram, `+ Quick Entry` action button, 8 nav items (Overview `/`, Finance `/finance`, Tasks, Projects, Notes, Goals, Calendar, Settings), user profile chip (AV Alex Vance Executive Tier), and rail collapse trigger.
   - Create `TopHeader.tsx`: Editorial header with greeting, "System Steady" green pill, search bar with `⌘K` badge, notifications icon, and `+ Add Entry` flyout menu.
   - Create `MobileTopBar.tsx`: Sticky 56px top bar with brand anchor, status pill, search, and action icons.
   - Create `MobileBottomNav.tsx`: Fixed 64px bottom bar with 5 destinations (Home `/`, Finance `/finance`, center elevated floating `+` FAB for Quick Entry, Tasks, Profile).
   - Create `QuickEntryModal.tsx`: MUI `Dialog` supporting quick transaction entry from both header and mobile FAB.
6. **MUI Component Priority (R3)**:
   - Use Material UI components for all interactive controls: `Drawer`, `AppBar`, `Toolbar`, `BottomNavigation`, `BottomNavigationAction`, `Fab`, `Button`, `IconButton`, `Menu`, `MenuItem`, `TextField`, `Dialog`, `Chip`, `Badge`.
7. **Verification**:
   - Run `npx tsc --noEmit` to confirm zero type errors.
   - Document verification commands and output in your handoff report.
8. Maintain `progress.md` in your working directory with timestamps.
9. Write complete handoff report to `E:\anchor\.agents\teamwork\worker_m1\handoff.md`.
10. Send a completion message back to the orchestrator.
