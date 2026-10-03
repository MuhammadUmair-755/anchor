---
name: live-testing
description: >-
  Interactive live testing skill for the ANCHOR application using the Playwright MCP server.
  Use this skill whenever the user asks to test application functionality, verify UI behaviors,
  detect bugs or visual glitches through real browser interactions, log findings into test notes,
  or perform automated interactive verification and bug remediation cycles.
---

# Live Interactive Testing with Playwright MCP (`live-testing.md`)

This skill provides an interactive testing runbook for the **ANCHOR** project using the **Playwright MCP** server (`call_mcp_tool` with `ServerName: "playwright"`). It executes real user interactions across all viewports (Mobile, Tablet, Desktop), monitors runtime console and network errors, logs structured findings into `TEST_NOTES.md`, and validates iterative code fixes.

---

## 1. Quick Tool Reference (Playwright MCP)

Invoke these tools through `call_mcp_tool`:

```typescript
call_mcp_tool({
  ServerName: "playwright",
  ToolName: "<tool_name>",
  Arguments: { ... }
})
```

| Tool Name | Key Parameters | Primary Use Case |
| :--- | :--- | :--- |
| `browser_navigate` | `{"url": "http://localhost:3000/..."}` | Load application pages. |
| `browser_snapshot` | `{"boxes": true}` | Accessibility DOM inspection with element bounding boxes. |
| `browser_take_screenshot` | `{"filename": "..."}` | Visual rendering check and design verification. |
| `browser_resize` | `{"width": number, "height": number}` | Responsive breakpoint testing (375x812, 768x1024, 1440x900). |
| `browser_click` | `{"target": "selector or ref"}` | Trigger clicks on buttons, tabs, inputs, checkboxes. |
| `browser_fill_form` | `{"fields": [...]}` | Submit transaction modals, quick entry, event forms. |
| `browser_type` | `{"text": "..."}` | Type into input bars, search rails. |
| `browser_press_key` | `{"key": "Enter" \| "Escape"}` | Keyboard shortcuts (`⌘K`, `Escape` to close modals). |
| `browser_console_messages`| `{}` | Fetch browser console errors, React warnings, hook errors. |
| `browser_network_requests`| `{}` | Check network API request statuses (200, 404, 500). |
| `browser_wait_for` | `{"text": "...", "timeout": 5000}` | Wait for dynamic DOM changes, toasts, modals. |
| `browser_evaluate` | `{"expression": "..."}` | Evaluate JavaScript in the DOM (e.g. overflow checks). |
| `browser_close` | `{}` | Terminate browser instance after testing session. |

---

## 2. Standard Viewport Profiles

Always verify behavior against these 3 standard form-factors:

* **Mobile (375x812 / 390x844)**:
  - Verify `MobileTopBar` and `MobileBottomNav` visibility.
  - Verify bottom FAB (`+ Quick Entry`) clearance and tap action.
  - Check for horizontal overflow: `document.documentElement.scrollWidth > window.innerWidth`.
  - Verify touch-scroll on Calendar Matrix and Ledger tables.
* **Tablet (768x1024)**:
  - Verify 2-column or wrapping multi-column layouts.
  - Test modal sizing and backdrop dismissal.
* **Desktop (1440x900+)**:
  - Verify `DesktopSidebar` expansion/collapse toggle.
  - Verify 7-column calendar grid alignment and right-rail inspector.
  - Test keyboard shortcuts (`⌘K` global search focus).

---

## 3. Interactive Journey Runbooks

### Journey 1: Executive Overview (`/`)
1. **Navigate**: `browser_navigate("http://localhost:3000/")`.
2. **Filter Interaction**: Click timeframe pills (`Today`, `Week`, `Month`, `Quarter`).
3. **Task Toggle**: Click task checkbox in `DailyFocusCard`; verify state updates and snackbar notification appears.
4. **Donut Chart**: Toggle categories in `OutflowDonutChart`.
5. **Quick Entry**: Click `+ Quick Entry`, input expense, click **Commit to Ledger**, verify reflection in `TodayDebitsCard`.
6. **Telemetry Check**: Call `browser_console_messages` to ensure zero React or hydration warnings.

### Journey 2: Calendar & Sovereign Goals (`/calendar`)
1. **Navigate**: `browser_navigate("http://localhost:3000/calendar")`.
2. **Focus Day**: Verify September 11 is pre-selected and indicated with anchor badge.
3. **Date Selection**: Click date `2026-09-04`; verify `DayNexusInspector` displays Sep 4 details.
4. **Task Cadence**: In `DayNexusInspector`, click an active task; verify immediate update in inspector percentage and matrix day badge.
5. **View Toggle**: Switch active view between `Month`, `Week`, `Day`.
6. **Month Navigation**: Click `<` (Prev) and `>` (Next), then click `Today`.
7. **Telemetry Check**: Verify no hook order errors or React lifecycle warnings occur.

### Journey 3: The Ledger & Cashflow Stream (`/finance`)
1. **Navigate**: `browser_navigate("http://localhost:3000/finance")`.
2. **Accounts Filter**: Click checking/cash/credit cards in `AccountsRibbon`.
3. **Transaction Flow**: Toggle flow filter (`Inflow`, `Outflow`, `Transfers`).
4. **Search Filter**: Type into search input; verify real-time row filtering.
5. **Dock Entry**: Add transaction via `QuickEntryDock` and verify ledger append.
6. **CSV Export**: Click `Export CSV`; check network requests for clean generation.

### Journey 4: Temporal Focus & Tasks (`/tasks`)
1. **Navigate**: `browser_navigate("http://localhost:3000/tasks")`.
2. **Tab Switch**: Toggle `Today`, `Upcoming`, `Completed`.
3. **Task Toggle**: Resolve a task in `ExecutionPipeline`.
4. **Task Modal**: Open `+ Add Task` modal, fill title/priority, submit, and verify list update.

### Journey 5: Reflective Sanctuary & Journal (`/notes`)
1. **Navigate**: `browser_navigate("http://localhost:3000/notes")`.
2. **Timeline Rail**: Click date pills (`Sep 10`, `Sep 09`, `Sep 08`).
3. **Daily Inquiry**: Edit response and save; observe confirmation toast.
4. **Reflection Modal**: Click `Continue Writing`, enter thoughts, save to journal ledger.

---

## 4. Telemetry & Finding Ledger Protocol

1. **Continuous Telemetry Checks**:
   - Call `browser_console_messages` after every major state change.
   - Call `browser_network_requests` to ensure no 404/500 API failures.
   - Run overflow detection snippet via `browser_evaluate`:
     ```javascript
     ({
       scrollWidth: document.documentElement.scrollWidth,
       innerWidth: window.innerWidth,
       hasOverflow: document.documentElement.scrollWidth > window.innerWidth
     })
     ```

2. **Logging Findings into `TEST_NOTES.md`**:
   Whenever an anomaly is detected, append a record into `TEST_NOTES.md` following this structure:
   ```markdown
   ### [ISSUE-<ID>] <Summary>
   - **Severity**: CRITICAL | HIGH | MEDIUM | LOW
   - **Route**: `<route>`
   - **Viewport**: `<width>x<height>`
   - **Status**: OPEN | IN_PROGRESS | RESOLVED
   - **Reproduction**:
     1. ...
   - **Observed**: ...
   - **Expected**: ...
   - **Console / Network Output**: ...
   - **Root Cause Analysis**: ...
   - **Remediation & Verification**: ...
   ```

3. **Remediation & Fix Verification Loop**:
   - Make precise code edits to resolve the root cause.
   - Run `npx tsc --noEmit` and `npm run build`.
   - Use Playwright MCP to re-execute the exact interaction steps that triggered the issue.
   - Verify that `browser_console_messages` is clean and UI behaves properly.
   - Mark the issue as `RESOLVED` in `TEST_NOTES.md`.
