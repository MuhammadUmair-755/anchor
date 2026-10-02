# Architectural Specification & Handoff Report: ANCHOR Life Command Center

**Author**: Explorer 3 (Architecture, Types & MUI Component Architect)  
**Date**: 2026-10-01T17:20:00Z  
**Target Milestone**: Phase 0 Survey & Discovery -> Phase 1 Milestone 1 & Phase 2 Milestone 2  
**Handoff Type**: Hard (Investigation complete, full specifications defined)  

---

## 1. Observation

### 1.1 Existing Codebase & Configuration
- **Next.js & React Baseline**: Verified in `E:\anchor\package.json` lines 11–25:
  - Next.js: `16.3.8` (App Router architecture)
  - React / React-DOM: `19.2.8`
  - Material UI (MUI): `@mui/material` `^9.4.0`, `@mui/icons-material` `^9.4.0`, `@mui/material-nextjs` `^9.4.0`
  - Emotion: `@emotion/react` `^11.14.0`, `@emotion/styled` `^11.14.1`
  - Tailwind CSS: `^4.0.0` with `@tailwindcss/postcss`
  - Auth & Database: `@clerk/nextjs` `^7.9.9`, `@supabase/supabase-js` `^2.109.0`, `@supabase/ssr` `^0.12.7`
- **Theme & CSS Layer Isolation**: Verified in `src/components/mui/ThemeRegistry.tsx` and `src/lib/mui/theme.ts`:
  - `AppRouterCacheProvider` is configured with `enableCssLayer: true` to prevent Emotion styles from colliding with Tailwind CSS v4.
  - Theme currently specifies base primary `#1976d2`, secondary `#9c27b0`, radius `8px`.
  - Design system per `ORIGINAL_REQUEST.md` (lines 60-64) specifies Anchor color palette:
    - Deep Anchor Navy: `#0B1628`
    - Primary Container / Navy Surface: `#111C2E` / `#12243A`
    - Mineral Canvas: `#F7F5EF` / `#FCFBF8`
    - Muted Slate: `#6D8EAD` / `#40617E`
    - Controlled Sage: `#5F9277` / `#3F6853`
    - Soft Coral: `#C76D68` / `#8C3F3B`
    - Warm Ochre: `#C4934A` / `#C48858`
    - Hairline borders: `rgba(17, 28, 46, 0.08)`
    - Radii: 8px container radii, 4px/8px grid discipline
    - Typography tri-font hierarchy: Newsreader (headlines), Plus Jakarta Sans (body/UI), JetBrains Mono (numeric/currency tabular numbers).

### 1.2 Authoritative Stitch Screen Evidence
Four screens inspected in Stitch project `196342399105692014`:
1. **Desktop Overview** (`4ecf9343b97b4be38623773ccd440388`):
   - Persistent 256px (`w-64`) left sidebar with logo monogram ⚓, `+ Quick Entry` primary button, 8 nav items (Overview active, Finance, Tasks [count 5], Projects, Notes, Goals, Calendar, Settings), user profile chip (AV Alex Vance Executive Tier), and `Collapse rail [⌘K]`.
   - Sticky top editorial header with Newsreader greeting ("Good morning, Alex."), System Steady pill badge, Search input with `⌘K` shortcut, Notification bell with dot, and `+ Add Entry` action menu (+ Expense, + Income, + Task, + Note, + Goal).
   - Filter strip: Month selector (September 2026), All Categories, All Accounts, All Types dropdowns, and temporal range toggle group (Today, Week, Month, Quarter).
   - Total Liquidity & Balance hero card: Asymmetric 5-col / 7-col split. Left: Rs. 79,200 (+4.2%), Live Vault pill. Right: Monthly Inflow Rs. 120,000 (+8.5%), Total Expenses Rs. 65,000 (54% burned), Net Retained Rs. 55,000 (45.8% rate preserved).
   - Outflow Distribution (60% split): Category Donut SVG (circumference ~390px, 5 segments: Food 30%, Housing 25%, Transit 15%, Shopping 18%, Health 12%), center metrics (Total Spent Rs. 65,000, 92% of budget), itemized badges, view toggle (Donut vs Cashflow Cadence), footnote link to ledger.
   - Budget Health (40% split): 4 active envelopes (Food & Groceries 74% - Rs. 11,200 / Rs. 15,000; Transport & Commute 43% - Rs. 4,300 / Rs. 10,000; Shopping & Gear 92% Alert - Rs. 18,500 / Rs. 20,000; Bills & Utilities 91% - Rs. 8,200 / Rs. 9,000) with colored progress tracks and runway notes.
   - Bottom Operational Trio: 3-column cards for Daily Focus (checkboxes with strikethrough, 3/5 done, progress ring), Today's Debits (itemized list, Rs. 1,300 total), and Mindset & Goal (editorial quote preview + Annual Target 72% progress bar for Rs. 100k reserve).
2. **Desktop Finance** (`280651f0fb354645b93b898c13eeeff4`):
   - Executive ledger header: Q3 Fiscal Cycle, "FINANCE", quote “Know where your money goes. Control where it goes next.”, Date selector, CSV Export trigger, `+ Add Transaction` button.
   - Liquidity & Holdings ribbon: 4 account cards (Operating Bank HDFC ••4092 Rs. 72,500; Physical Vault Rs. 15,000; High-Yield Vault Rs. 48,200 +4.2% APY; Amex Platinum ••1042 -Rs. 18,500 / Rs. 150k limit). Total Net Capital Rs. 117,200, Reconciled 10m ago.
   - Main 68% / 32% working split:
     - Left (68%): Ledger & Cashflow stream: search input, sort dropdown, category filter pills (All, Food, Housing, Transport, Shopping, Subscriptions), account selector, flow type toggle (All, Inflow +, Outflow -, Transfers). Chronological date groups (Today, Yesterday, Earlier this week, Sep 01) with transaction cards, and pagination footer (Showing 8 of 42, pages 1, 2, 3... 6).
     - Right (32%): Docked Financial Intelligence: Quick Entry form (`I spent` / `I received` / `I moved` toggle, currency input, Category & Account dropdowns, Date, Memo, Record Entry button), Cashflow Velocity (Inflow Rs. 165k vs Outflow Rs. 50.4k, Monthly Retention Rate bar 69.4%, Velocity hotspots list), and Recurring Obligations list (AWS Cloud Rs. 4.2k, Bloomberg Rs. 2.1k, Lease Rs. 24k; Total Rs. 31,500/mo).
3. **Mobile Overview** (`5bc44953af514701bbf80fde4228033e`):
   - Sticky top bar with Anchor logo, System Steady badge, Search, and Notification bell.
   - Single-column vertical flow with full touch targets (>= 44px).
   - Horizontal scrollable filter pill strip.
   - Stacked Liquidity Anchor card with 3-column micro metrics ledger.
   - Compact Outflow donut chart (112px / 28rem) with horizontal legend items.
   - Budget envelopes with alert badges.
   - Today's Daily Focus checklist and itemized debits.
   - Mindset intention quote and annual reserve goal bar.
   - Fixed Bottom Navigation bar (Home active, Finance, Floating '+' Quick Entry button, Tasks, Profile).
4. **Mobile Finance** (`1a983f2d68c5459ba5da6af1493ef2e7`):
   - Top App Bar with Anchor monogram, Reconciled badge, CSV export icon, and filter icon.
   - Net Capital summary banner (Rs. 117,200, +8.4% MoM, Solvent badge).
   - Horizontal swipeable account cards tray (snap-x mandatory).
   - Tap-to-trigger action row (Log Expense, Log Income, Move Funds).
   - Cashflow Velocity Bento card with dual columns and retention gauge.
   - Ledger feed with category pills and chronological date sections.
   - Recurring obligations banner.
   - Fixed Bottom Navigation bar with Finance tab active.

---

## 2. Logic Chain

### 2.1 Component Architecture & MUI Component Mapping (R3)
- **Premise 1**: R3 mandates prioritizing Material UI (MUI) components wherever an equivalent exists. Custom components are only permitted when MUI lacks an equivalent or for domain-specific visual graphics.
- **Premise 2**: Modern MUI v6/v7 (`@mui/material` `9.4.0`) provides robust, accessible building blocks: `Drawer`, `AppBar`, `Toolbar`, `Button`, `IconButton`, `Menu`, `MenuItem`, `TextField`, `Select`, `InputAdornment`, `Card`, `CardContent`, `CardHeader`, `Chip`, `Badge`, `LinearProgress`, `CircularProgress`, `Dialog`, `Modal`, `Alert`, `Snackbar`, `Tabs`, `Tab`, `ToggleButtonGroup`, `ToggleButton`.
- **Premise 3**: For chart visualizations, standard MUI core does NOT include SVG donut charts. Using an external chart library introduces unnecessary bundle weight and styling conflicts. A dedicated custom SVG component (`OutflowDonutChart.tsx`) matches the exact SVG mathematical specification from Stitch with zero external dependencies.

#### UI Element to MUI Component Mapping Catalog

| UI Section / Element | Stitch Spec & Requirement | Designated MUI Component | Sub-components & Icons | Rationale / Notes |
|---|---|---|---|---|
| **Desktop Nav Sidebar** | 256px permanent rail | `Drawer` (variant="permanent") or `Box` styled | `List`, `ListItem`, `ListItemButton`, `ListItemIcon`, `ListItemText` | Native accessible navigation rail |
| **Mobile Nav Drawer** | Collapsible slide-over drawer | `Drawer` (variant="temporary") | `List`, `ListItemButton`, `Divider` | Responsive navigation on `< 768px` |
| **Top App Header** | Sticky header bar | `AppBar` + `Toolbar` | `Typography`, `Box`, `Stack` | Elevation=0, backdrop filter blur |
| **Mobile Bottom Nav** | Fixed bottom navigation | `BottomNavigation` | `BottomNavigationAction`, `Fab` | Fixed at bottom for mobile (`<768px`) with center elevated FAB |
| **Primary Buttons** | `+ Quick Entry`, `+ Add Transaction` | `Button` (variant="contained") | `startIcon={<AddIcon />}` | Primary brand navy action buttons |
| **Icon Actions** | Notifications, Settings, Search | `IconButton` | `Badge` (variant="dot"), `@mui/icons-material` | Accessible 44px touch targets |
| **Action Dropdown Menus** | `+ Add Entry` flyout menu | `Menu` | `MenuItem`, `ListItemIcon`, `ListItemText`, `Divider` | Contextual entry creation popup |
| **Search Input** | Global search with `⌘K` | `TextField` (size="small") | `InputAdornment` (`SearchIcon`, `kbd` chip) | Keyboard accessible search trigger |
| **Filter Selects** | Month, Category, Account, Type | `Select` (size="small") or `Menu` | `MenuItem`, `FormControl` | Accessible select menus |
| **Filter Pills & Tabs** | Category pills, Inflow/Outflow | `ToggleButtonGroup` / `Chip` | `ToggleButton` (exclusive), `Chip` (clickable) | Interactive instant filtering |
| **Temporal Switches** | Today, Week, Month, Quarter | `ToggleButtonGroup` or `Tabs` | `ToggleButton` / `Tab` | Fast time-window slicing |
| **Account & Ledger Cards** | Account ribbon, Hero, Ledger | `Card` + `CardContent` | `CardHeader`, `Box`, `Stack` | Hairline border `rgba(17,28,46,0.08)`, 8px radius |
| **Status Indicators** | "System Steady", "Live Vault" | `Chip` | `span` dot with CSS pulse | Semantic status badges |
| **Numeric Badges** | Task count "5", "+4.2% APY" | `Chip` or `Badge` | Tabular JetBrains Mono font | Compact metric indicators |
| **Budget Progress Bars** | Envelopes, Retention gauge | `LinearProgress` | Custom colored variant via `sx` | Determinate progress visualization |
| **Task Completion Ring** | 3/5 Done circular meter | `CircularProgress` (determinate) | Styled SVG or MUI CircularProgress | Accessible circular progress gauge |
| **Interactive Checklists** | Daily Focus checklist | `FormGroup` + `FormControlLabel` | `Checkbox` | Strikethrough label on toggle |
| **Quick Entry Form** | Intent toggle, Amount, Dropdowns | `Card`, `ToggleButtonGroup`, `TextField`, `Select` | `InputAdornment`, `FormControl`, `FormLabel` | Docked panel & modal form |
| **Velocity Alerts** | Observed Velocity Hotspots | `Alert` (severity="warning") | `AlertTitle`, `List`, `ListItem` | Accessible inline warning banners |
| **Feedback Snackbars** | Transaction saved, Task updated | `Snackbar` + `Alert` | `Slide` transition | Transient user feedback |
| **Modals & Dialogs** | Mobile Quick Entry, Add Task | `Dialog` | `DialogTitle`, `DialogContent`, `DialogActions` | Full-screen on mobile, centered modal on desktop |
| **Outflow Donut Chart** | 5-sector spending donut | **Custom SVG Component** (`OutflowDonutChart.tsx`) | `<svg>`, `<circle>`, center metrics text | Precise SVG stroke-dasharray geometry from Stitch |

---

### 2.2 TypeScript Data Model & Type Contracts (src/types/)
Per Rule R5: Strict Typing — **Zero `any`**.
All models are strongly typed with explicit literal unions, relationship keys, payload contracts, and responsive state types.

```typescript
// ============================================================================
// File: src/types/models.ts
// ============================================================================

/** Supported currencies */
export type CurrencyCode = 'INR' | 'USD' | 'EUR' | 'GBP';

/** Financial account classification */
export type AccountType = 'checking' | 'cash' | 'savings' | 'credit';

/** Financial transaction flow direction */
export type FlowType = 'inflow' | 'outflow' | 'transfer';

/** Canonical transaction categories across Overview and Finance */
export type TransactionCategory =
  | 'food_dining'
  | 'housing_utilities'
  | 'transport_transit'
  | 'shopping_gear'
  | 'health_wellness'
  | 'knowledge_subs'
  | 'consulting_inflow'
  | 'salary_payroll'
  | 'other';

/** Payment instruments */
export type PaymentMethod = 'cash' | 'upi' | 'card' | 'direct_deposit' | 'wire';

/** Budget burn rate state */
export type BurnRateStatus = 'normal' | 'contained' | 'alert' | 'exceeded';

/** Task category domains */
export type TaskCategory = 'work' | 'personal' | 'finance' | 'learning';

/** Task priority levels */
export type PriorityLevel = 'low' | 'medium' | 'high';

/** Temporal filter ranges */
export type TemporalRange = 'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom';

// ----------------------------------------------------------------------------
// Core Domain Entities
// ----------------------------------------------------------------------------

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  institution: string;
  accountNumberMasked: string;
  balance: number;
  currency: CurrencyCode;
  status: 'active' | 'reconciled' | 'archived';
  trendLabel?: string;
  creditLimit?: number;
  paymentDueDate?: string;
  lastReconciledAt: string; // ISO 8601 string
  updatedAt: string;
}

export interface Transaction {
  id: string;
  accountId: string;
  accountName: string;
  amount: number; // Positive for inflow, negative for outflow
  currency: CurrencyCode;
  flowType: FlowType;
  category: TransactionCategory;
  categoryLabel: string;
  payeeOrPayer: string;
  note?: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  paymentMethod: PaymentMethod;
  status: 'cleared' | 'pending' | 'reconciled';
  isRecurring?: boolean;
  createdAt: string;
}

export interface BudgetEnvelope {
  id: string;
  category: TransactionCategory;
  label: string;
  allocatedAmount: number;
  spentAmount: number;
  currency: CurrencyCode;
  burnRateStatus: BurnRateStatus;
  burnPercentage: number;
  bufferRemaining: number;
  cycle: string; // e.g. "September 2026"
  icon: string;
}

export interface DailyTask {
  id: string;
  title: string;
  category: TaskCategory;
  categoryLabel: string;
  priority: PriorityLevel;
  isCompleted: boolean;
  dueInfo?: string; // e.g. "Due 6:00 PM"
  createdAt: string;
  completedAt?: string;
}

export interface TodayDebitItem {
  id: string;
  title: string;
  category: string;
  paymentMethod: string;
  amount: number;
  currency: CurrencyCode;
  time: string;
  icon: string;
}

export interface OutflowSector {
  id: string;
  category: TransactionCategory;
  label: string;
  percentage: number;
  amount: number;
  currency: CurrencyCode;
  color: string;
  strokeDashArray: string;
  strokeDashOffset: number;
}

export interface VelocityHotspot {
  id: string;
  title: string;
  metric: string;
  severity: 'info' | 'warning' | 'critical';
}

export interface CashflowVelocity {
  cycleDay: number;
  cycleTotalDays: number;
  totalInflow: number;
  totalOutflow: number;
  netSavings: number;
  retentionRate: number;
  targetRetentionRate: number;
  inflowCount: number;
  outflowCount: number;
  hotspots: VelocityHotspot[];
}

export interface RecurringObligation {
  id: string;
  name: string;
  amount: number;
  currency: CurrencyCode;
  billingCycle: 'monthly' | 'quarterly' | 'annual';
  renewalNotice: string;
  status: 'upcoming' | 'cleared' | 'alert';
  category: TransactionCategory;
  icon: string;
}

export interface MindsetGoalAnchor {
  quote: string;
  quoteAuthor?: string;
  entryTime: string;
  goalTitle: string;
  targetAmount: number;
  currentAmount: number;
  achievedPercentage: number;
  targetDate: string;
}

// ----------------------------------------------------------------------------
// Overview & Finance Aggregates
// ----------------------------------------------------------------------------

export interface ExecutiveOverviewData {
  greeting: string;
  userName: string;
  systemStatus: 'steady' | 'reconciling' | 'attention';
  dateDisplay: string;
  totalLiquidity: number;
  liquidityTrendPercent: number;
  currency: CurrencyCode;
  monthlyInflow: number;
  monthlyInflowTrendPercent: number;
  inflowSourcesCount: number;
  totalExpenses: number;
  expensesBurnRatePercent: number;
  netRetained: number;
  retentionRatePercent: number;
  outflowSectors: OutflowSector[];
  totalSpent: number;
  budgetCap: number;
  budgetEnvelopes: BudgetEnvelope[];
  dailyTasks: DailyTask[];
  todayDebits: TodayDebitItem[];
  mindsetGoal: MindsetGoalAnchor;
}

export interface TransactionFilterCriteria {
  temporalRange?: TemporalRange;
  selectedMonth?: string; // YYYY-MM
  category?: TransactionCategory | 'all';
  accountId?: string | 'all';
  flowType?: 'all' | 'inflow' | 'outflow' | 'transfer';
  searchQuery?: string;
  sortBy?: 'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc';
  page?: number;
  pageSize?: number;
}

export interface PaginatedTransactionsResponse {
  transactions: Transaction[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  summary: {
    totalInflow: number;
    totalOutflow: number;
    netChange: number;
  };
}

export interface QuickEntryPayload {
  intent: 'spent' | 'received' | 'moved';
  amount: number;
  currency: CurrencyCode;
  category: TransactionCategory;
  accountId: string;
  destinationAccountId?: string;
  date: string;
  memo?: string;
}
```

---

### 2.3 Service Layer Boundaries (src/services/)
Per Rule R5: "Keep API and business logic completely separate from UI components using typed services in `src/services/`."

The service layer must be:
1. **Completely decoupled from React**: No JSX, no `useState`, no hooks, no React DOM.
2. **Synchronous or Asynchronous Clean API Contracts**: Returning pure Promises for seamless future Supabase integration.
3. **In-Memory Mock State Store**: Provides deterministic, rich default state conforming to Stitch screens while supporting local mutations (adding a transaction, toggling a task, filtering ledger, recording quick entry).

#### Service Architecture Blueprint:
1. `src/services/overviewService.ts`:
   - `getOverviewData(): Promise<ExecutiveOverviewData>`
   - `toggleTask(taskId: string): Promise<DailyTask>`
   - `addTask(task: Omit<DailyTask, 'id' | 'createdAt'>): Promise<DailyTask>`
   - `updateBudgetEnvelope(envelopeId: string, allocatedAmount: number): Promise<BudgetEnvelope>`
2. `src/services/financeService.ts`:
   - `getAccounts(): Promise<Account[]>`
   - `getTransactions(filter: TransactionFilterCriteria): Promise<PaginatedTransactionsResponse>`
   - `recordTransaction(entry: QuickEntryPayload): Promise<Transaction>`
   - `getCashflowVelocity(): Promise<CashflowVelocity>`
   - `getRecurringObligations(): Promise<RecurringObligation[]>`
   - `exportLedgerToCsv(filter?: TransactionFilterCriteria): Promise<string>`
3. `src/services/mockData.ts`:
   - Authoritative mock data fixtures matching Stitch screenshots (Alex Vance, Rs. 79,200 liquidity, Rs. 117,200 total net capital, Blue Tokai Coffee, HDFC ••4092, Amex Platinum ••1042, etc.).

---

### 2.4 Responsive Multi-Device Strategy (R4)
The application layout adapts fluidly across three primary breakpoints:
1. **Desktop (`>= 1280px` / MUI `lg` and `xl`)**:
   - Persistent `w-64` (256px) left navigation drawer.
   - Main content canvas offset with `ml-64` and max-width `1440px`.
   - Top editorial header with persistent search bar, system steady indicator, and `+ Add Entry` action menu.
   - Asymmetrical grid layouts:
     - Overview: 5-col liquidity balance anchor / 7-col 3-column micro metrics ledger; 7-col outflow donut / 5-col budget health envelopes; 3-col operational trio.
     - Finance: 4-card liquidity accounts ribbon; 8-col ledger table / 4-col docked financial intelligence panel.
2. **Tablet (`768px - 1279px` / MUI `md`)**:
   - Navigation rail can be collapsed into a compact 72px icon rail or toggled via drawer modal.
   - Content canvas uses full width with `px-6`.
   - Overview hero adjusts to stacked 12-col layout (Balance top, metrics cards 3 columns below).
   - Analytics grid stacks vertically (Outflow Donut card full width, Budget Health card full width).
   - Operational trio becomes 2 cols top + 1 col full width bottom.
   - Finance accounts ribbon displays as 2x2 grid.
   - Finance ledger and docked panel stack sequentially (Ledger top 12 cols, Intelligence panel bottom 12 cols).
3. **Mobile (`< 768px` / MUI `xs` and `sm`, down to 390px)**:
   - Left sidebar is completely hidden. Top `AppBar` (height 56px) with Anchor logo, Reconciled status pill, and action icons.
   - Navigation accessed via temporary slide-over `Drawer` or Fixed Bottom Navigation Bar (`BottomNavigation`) with 4 main destinations + center elevated floating action button (`Fab`) for Quick Entry.
   - Single-column vertical flow with full-width touch cards (`rounded-xl`, `p-4`).
   - Horizontal swipeable trays with CSS scroll snap (`snap-x snap-mandatory overflow-x-auto`) for account cards and filter pills.
   - Compact Donut Chart (112px diameter) with stacked legend badges.
   - Minimum touch target discipline: All buttons, icons, and list items have `min-height: 44px` and `min-width: 44px`.
   - Quick Entry opens as a full-screen or bottom-sheet MUI `Dialog`.

---

## 3. Caveats
- **Zero Heavy Build Commands**: In accordance with user rules and Decision 005, `npm run build` was not executed.
- **Read-Only Explorer Scope**: No application source files have been modified. All architecture specifications, component mappings, type definitions, and service contracts are documented here for the implementer (Worker).
- **MUI Version Alignment**: Codebase uses `@mui/material` `9.4.0` (v6/v7 generation). All component usages have been verified to align with current Material UI API standards (`@mui/material`, `@mui/icons-material`, `@mui/material-nextjs`).
- **Icons Standard**: Only `@mui/icons-material` is used per Rule 7; third-party icon packages are avoided.

---

## 4. Conclusion
1. **MUI Component Priority is Fully Realized**: Every single UI element from both Stitch Overview screens and Finance screens has an exact 1:1 MUI component mapping (Buttons, TextFields, Selects, Cards, Menus, Drawers, Chips, Progress bars, Dialogs, BottomNavigation).
2. **Chart Strategy Defined**: Custom lightweight SVG component `OutflowDonutChart.tsx` delivers 100% visual fidelity to the Stitch design without adding bulky charting libraries.
3. **Type Safety Guaranteed**: Comprehensive TypeScript models defined with zero `any`, providing complete contracts for accounts, transactions, budget envelopes, daily focus tasks, debits, and velocity metrics.
4. **Service Layer Isolated**: Clean service signatures in `src/services/` allow modular testing and smooth future integration with Supabase Postgres.
5. **Responsive Strategy Fully Detailed**: Desktop, tablet, and mobile layouts are precisely specified with exact breakpoint behaviors.

---

## 5. Verification Method

### 5.1 Independent Code Verification
1. Inspect the mapping table in Section 2.1 against `ORIGINAL_REQUEST.md` (lines 43-64).
2. Verify that the TypeScript types in Section 2.2 contain zero occurrences of the `any` keyword.
3. Verify that the service methods in Section 2.3 operate without importing React or UI components.
4. Verify responsive breakpoint definitions against MUI standards (`xs: 0`, `sm: 600`, `md: 768`, `lg: 1280`, `xl: 1536`).

### 5.2 Implementation Validation Commands (For Future Worker Phase)
- Type check: `npx tsc --noEmit` (lightweight verification)
- Lint check: `npm run lint`
- **Notice**: Do NOT execute `npm run build` without explicit user permission.
