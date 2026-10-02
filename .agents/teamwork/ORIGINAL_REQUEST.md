# Original User Request

## 2026-10-01T17:03:38Z

Build and implement the ANCHOR Life Command Center in `E:\anchor` using the Stitch MCP to access designs from `https://stitch.withgoogle.com/projects/196342399105692014`. The application must be fully responsive across mobile, tablet, and desktop, following the established design system, documentation, and engineering rules.

Working directory: E:\anchor
Integrity mode: development
Reference design: https://stitch.withgoogle.com/projects/196342399105692014

## Mandatory Pre-Flight Checklist
Before writing code, read and follow:
- `/docs/RULES.md`
- `/docs/DECISIONS.md`
- `/docs/PROGRESS.md`
- `/docs/CONTEXT.md`

Follow the existing project architecture, design system, decisions, and reusable components. Implement incrementally rather than rewriting unrelated parts of the project.

CRITICAL COMMAND RESTRICTION: NEVER run `npm run build` or heavy commands without explicit user permission.

---

## Requirements

### R1. Dashboard Command Center Module (Overview)
Implement the executive Overview dashboard matching Stitch Desktop (`4ecf9343b97b4be38623773ccd440388`) and Mobile (`5bc44953af514701bbf80fde4228033e`):
- Persistent collapsible navigation spine (Anchor logo, quick entry action, 8 navigation links, profile chip, collapse trigger).
- Editorial header (greeting, steady status pill, search bar with `⌘K` shortcut, notifications, contextual `+ Add Entry` menu).
- Persistent filter strip (month selector, category/account/type dropdowns, temporal range tabs).
- Primary liquidity & balance hero section displaying net capital, live vault status, monthly inflow, total expenses, and net retained.
- Outflow distribution section with category donut visualization, center metrics, category breakdown badges, and trend notes.
- Budget health section with interactive envelope progress bars (normal, alert, contained states).
- Bottom operational trio: Daily Focus checklist (interactive checkbox toggle), Today's Debits itemized list, and Mindset & Goal anchor card.

### R2. Finance & Accounts Command Center Module
Implement the Finance view accessible via `/finance` matching Stitch Desktop (`280651f0fb354645b93b898c13eeeff4`) and Mobile (`1a983f2d68c5459ba5da6af1493ef2e7`):
- Executive ledger header with cycle subtitle, philosophy quote, date range selector, CSV export trigger, and `+ Add Transaction` button.
- Liquidity & Holdings accounts ribbon (Operating Bank, Physical Vault, High-Yield Vault, Amex Platinum) with balance, trend badges, and account metadata.
- Transaction stream & ledger table with quick search, sort dropdown, category filter pills, account filter bar, and pagination footer.
- Docked financial intelligence right panel: Quick Entry form (`I spent` / `I received` / `I moved` toggle, currency input, category, account, date, memo), Cashflow Velocity metrics (retention rate bar, velocity hotspots), and Recurring Obligations list.

### R3. Material UI (MUI) Component Priority & Design System
- Prioritize **MUI components** wherever an equivalent exists:
  - Buttons (`Button`, `IconButton`)
  - Dialogs & Modals (`Dialog`, `Modal`)
  - Drawers (`Drawer` for mobile/tablet responsive nav)
  - Menus (`Menu`, `MenuItem`)
  - Tabs (`Tabs`, `Tab`)
  - Forms & Inputs (`TextField`, `InputAdornment`, `FormControl`, `FormLabel`)
  - Selects (`Select`, `MenuItem`)
  - Tooltips (`Tooltip`)
  - Cards (`Card`, `CardContent`, `CardHeader`)
  - Alerts & Snackbars (`Alert`, `Snackbar`)
  - Progress (`LinearProgress`, `CircularProgress`)
  - Chips & Badges (`Chip`, `Badge`)
- Do NOT create custom components when a suitable MUI component already exists.
- Create custom reusable components only when MUI does not provide an appropriate solution.
- Keep components small, readable, reusable, and maintainable.
- Faithfully preserve the ANCHOR design system:
  - Colors: Deep Anchor Navy (`#0B1628`), Navy Surface (`#12243A`), Mineral Canvas (`#F7F5EF` / `#FCFBF8`), Muted Slate (`#6D8EAD`), Controlled Sage (`#5F9277`), Soft Coral (`#C76D68`), Warm Ochre (`#C4934A`).
  - Typography: Newsreader for display/editorial headlines, Plus Jakarta Sans for UI/body, JetBrains Mono for monetary values and tabular numbers.
  - Spacing & Shapes: 4px/8px grid discipline, 8px container radii, hairline borders (`rgba(17,28,46,0.08)`).

### R4. Responsive Multi-Device Adaptability
Ensure fluid, dedicated layouts across all device form factors:
- Desktop (>=1280px): Persistent sidebar navigation, full multi-column grids, split ledger and docked quick entry.
- Tablet (768px-1279px): Collapsible rail / compact navigation, 2-column card layouts.
- Mobile (<768px): Top bar with mobile menu drawer, single-column vertical flow, horizontal balance trays, compact SVG donut, and touch-friendly targets.

### R5. Engineering, Security & State Handling
- Follow existing project patterns for TypeScript, Clerk auth, and Supabase client factories.
- Keep API and business logic completely separate from UI components using typed services in `src/services/`.
- Handle loading, error, empty, and responsive states across all modules.
- Avoid duplicated types, API calls, and UI logic.
- Do not introduce unnecessary dependencies.

### R6. Living Documentation Synchronization
- After completing each major module:
  - Update `/docs/PROGRESS.md`
  - Update `/docs/CONTEXT.md`
- If an important architectural, UI, library, or implementation decision is made:
  - Record it in `/docs/DECISIONS.md`
- Do not silently change existing project decisions or rules.

---

## Acceptance Criteria

### Visual & Functional Completeness
- [ ] Overview dashboard faithfully reflects Stitch Screen `4ecf9343b97b4be38623773ccd440388` on desktop and Screen `5bc44953af514701bbf80fde4228033e` on mobile.
- [ ] Finance ledger faithfully reflects Stitch Screen `280651f0fb354645b93b898c13eeeff4` on desktop and Screen `1a983f2d68c5459ba5da6af1493ef2e7` on mobile.
- [ ] Navigation transitions seamlessly between `/` (Overview) and `/finance` (Finance & Accounts).

### Component & Design System Standards
- [ ] MUI components are utilized for all applicable interactive UI elements (Buttons, Inputs, Selects, Cards, Menus, Drawers, Chips, Progress bars).
- [ ] Tri-font typography hierarchy is applied correctly (Newsreader serif headers, Plus Jakarta Sans body, JetBrains Mono tabular numbers).
- [ ] Interactive controls function: task checkboxes toggle with visual strikethrough, quick entry form responds with feedback, filter pills highlight on click.

### Responsive Quality
- [ ] Layout is fully responsive across mobile (390px), tablet (768px), and desktop (1280px+) with no horizontal scroll overflows or clipped elements.
- [ ] Mobile navigation drawer opens and closes smoothly.

### Architecture & Rules Compliance
- [ ] Zero usage of `any` in newly added TypeScript files.
- [ ] Business logic and mock datasets are housed in `src/services/` or `src/types/`.
- [ ] `/docs/PROGRESS.md` and `/docs/CONTEXT.md` are updated to reflect the new state.
- [ ] `npm run build` is NEVER executed without explicit user permission.
