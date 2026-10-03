# ANCHOR Interactive Live Testing & Findings Ledger

This document tracks all real-activity UI & functionality test sessions, detected anomalies, console telemetry warnings, and their verified resolutions using the **Playwright MCP** live-testing workflow.

---

## Session History & Summary

| Session ID | Date | Tested Routes | Viewports | Issues Discovered | Issues Resolved | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `SESSION-001` | 2026-10-03 | `/calendar`, `/`, `/finance`, `/tasks`, `/notes` | Mobile (375x812), Desktop (1440x900) | 1 | 1 | **PASSED** |
| `SESSION-002` | 2026-10-03 | `/`, `/finance`, `/calendar`, `/tasks`, `/notes` | Mobile (375x812), Desktop (1440x900) | 1 | 1 | **PASSED** |
| `SESSION-003` | 2026-10-03 | `/finance` | Mobile (375x812, 360x800), Desktop (1280x800) | 1 | 1 | **PASSED** |

---

## Logged Findings & Resolutions

### [ISSUE-001] CalendarPage Hook Order Violation on Early Loading Return
- **Severity**: `CRITICAL`
- **Route**: `/calendar`
- **Viewport**: All viewports (Mobile, Tablet, Desktop)
- **Status**: `RESOLVED`
- **Reproduction**:
  1. Navigate to `http://localhost:3000/calendar`.
  2. Component initializes with `loading = true` and returns loading skeleton early.
  3. Once data resolves, `loading = false`, component renders `useMemo` for `cycleRangeText`.
- **Observed Behavior**:
  React console error:
  ```text
  React has detected a change in the order of Hooks called by CalendarPage.
  Previous render: 17 hooks (useState, useCallback, useEffect)
  Next render: 18 hooks (useMemo)
  ```
- **Expected Behavior**: All React hooks must execute in identical order on every render pass.
- **Root Cause**: `cycleRangeText = React.useMemo(...)` was declared after `if (loading) return ...` and `if (error) return ...` conditional returns.
- **Remediation & Verification**:
  - Lifted `cycleRangeText = React.useMemo(...)` to the top level of the component before any conditional early returns in [`src/app/calendar/page.tsx`](file:///E:/anchor/src/app/calendar/page.tsx).
  - Executed `npm run build` with Turbopack — compiled in 1.5s with zero errors.
  - Ran 21 unit & adversarial tests — 100% pass rate.
  - Verified clean console messages on navigation.

### [ISSUE-002] Nested Heading Hydration Error in AddTaskModal & DialogTitles
- **Severity**: `HIGH`
- **Route**: `/tasks`, `/overview`, `/calendar`, `/finance`
- **Viewport**: All viewports
- **Status**: `RESOLVED`
- **Reproduction**:
  1. Navigate to `/tasks`.
  2. Click `+ Add Task` button to open `AddTaskModal`.
- **Observed Behavior**:
  React console error:
  ```text
  In HTML, <h6> cannot be a child of <h2>.
  This will cause a hydration error.
  <DialogTitle> <h2> -> <Typography variant="h6"> <h6>
  ```
- **Expected Behavior**: HTML DOM heading tags must not be nested inside other heading elements.
- **Root Cause**: Material UI `<DialogTitle>` defaults to rendering an `<h2>`. Inside the title bar, `<Typography variant="h6">` rendered an `<h6>`, violating HTML specifications.
- **Remediation & Verification**:
  - Updated all modal DialogTitles to use `component="span"` or `component="div"` on inner Typography elements across:
    - [`src/components/tasks/AddTaskModal.tsx`](file:///E:/anchor/src/components/tasks/AddTaskModal.tsx)
    - [`src/components/overview/AddTaskModal.tsx`](file:///E:/anchor/src/components/overview/AddTaskModal.tsx)
    - [`src/components/overview/AdjustAllocationsModal.tsx`](file:///E:/anchor/src/components/overview/AdjustAllocationsModal.tsx)
    - [`src/components/calendar/NewEventModal.tsx`](file:///E:/anchor/src/components/calendar/NewEventModal.tsx)
    - [`src/components/calendar/AdjustMilestonesModal.tsx`](file:///E:/anchor/src/components/calendar/AdjustMilestonesModal.tsx)
    - [`src/components/finance/AddTransactionModal.tsx`](file:///E:/anchor/src/components/finance/AddTransactionModal.tsx)
  - Verified live in Playwright MCP by re-opening `+ Add Task` modal and re-submitting data; confirmed 0 console errors and clean DOM structure.

### [ISSUE-003] Mobile Viewport Horizontal Scrollbar Blowout on /finance
- **Severity**: `HIGH`
- **Route**: `/finance`
- **Viewport**: Mobile (375x812, 360x800)
- **Status**: `RESOLVED`
- **Reproduction**:
  1. Set viewport to `width: 375, height: 812`.
  2. Navigate to `http://localhost:3000/finance`.
  3. Inspect page `scrollWidth` vs `innerWidth`, or attempt to scroll page horizontally.
- **Observed Behavior**:
  - `document.documentElement.scrollWidth` was `393px` on a `375px` viewport (18px horizontal blowout).
  - Page body could be scrolled right horizontally, creating unwanted white edge and jittery mobile gestures.
- **Expected Behavior**: Entire viewport must be locked to `width: 100%`, `scrollWidth <= innerWidth`, with zero document horizontal scroll.
- **Root Cause**:
  1. In [`src/components/finance/LedgerSection.tsx`](file:///E:/anchor/src/components/finance/LedgerSection.tsx), the category filter chips container was nested inside a flex card without `minWidth: 0` / `overflow: hidden`, causing CSS flex child sizing to default to `min-width: auto` and push the card width to 393px.
  2. The Account pills container had `display: flex` without `flexWrap: "wrap"`, stretching its children across 370px when inner container width was constrained to 351px.
  3. The Account & Flow Type row had a fixed horizontal alignment (`alignItems: "center"`) instead of column wrapping on mobile breakpoints (`xs: "column", sm: "row"`).
- **Remediation & Verification**:
  - Updated [`src/components/finance/LedgerSection.tsx`](file:///E:/anchor/src/components/finance/LedgerSection.tsx):
    - Added `minWidth: 0, maxWidth: "100%", overflow: "hidden"` to outer card container.
    - Set category chips flex wrapper to `minWidth: 0, maxWidth: "100%"`, adding touch scrolling with hidden scrollbar.
    - Added responsive stacking `flexDirection: { xs: "column", sm: "row" }` and `alignItems: { xs: "stretch", sm: "center" }` to the filter controls row.
    - Added `flexWrap: "wrap", gap: 0.75, minWidth: 0, maxWidth: "100%"` to the Account pills row.
    - Added `maxWidth: "100%", overflowX: "auto"` to Flow Type toggle button group.
  - Verified live via Playwright MCP:
    - At `375x812`: `docScrollWidth = 360px`, `innerWidth = 375px`, `hasOverflow = false`, `canScrollHorizontally = false`.
    - At `360x800`: `docScrollWidth = 345px`, `innerWidth = 360px`, `hasOverflow = false`.
    - At `1280x800` (Desktop): `docScrollWidth = 1265px`, `innerWidth = 1280px`, `hasOverflow = false`.
    - Zero console errors and zero layout shifts.

---

## Active Finding Template

```markdown
### [ISSUE-<ID>] <Short Title>
- **Severity**: CRITICAL | HIGH | MEDIUM | LOW
- **Route**: `/...`
- **Viewport**: Mobile (375x812) | Tablet (768x1024) | Desktop (1440x900)
- **Status**: OPEN | IN_PROGRESS | RESOLVED
- **Steps to Reproduce**:
  1. ...
  2. ...
- **Observed Behavior**: ...
- **Expected Behavior**: ...
- **Console / Network Output**:
  ```text
  ...
  ```
- **Root Cause Analysis**: ...
- **Remediation Plan & Verification**:
  - Code edits made in: `...`
  - Verification: ...
```
