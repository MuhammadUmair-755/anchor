# Project: ANCHOR Life Command Center

## Architecture
- **Framework**: Next.js 16.3.8 (App Router), React 19.2.8
- **UI & Design System**: Material UI (MUI v9 `@mui/material` ^9.4.0) with `@mui/icons-material`, integrated via `@mui/material-nextjs` in `ThemeRegistry.tsx` (`enableCssLayer: true`). Styled with Anchor OS Design System tokens (Deep Anchor Navy `#0B1628`, Mineral Canvas `#F7F5EF` / `#FCFBF8`, Controlled Sage `#5F9277`, Soft Coral `#C76D68`, Muted Slate `#6D8EAD`, Warm Ochre `#C4934A`).
- **Typography**: Tri-font framework via `next/font/google`:
  - Display/Editorial: `Newsreader` (weights 400-600)
  - UI & Interface: `Plus Jakarta Sans` (weights 400-700)
  - Tabular & Financial Numbers: `JetBrains Mono` (weights 400-600, `tnum`, `zero`)
- **Data & Business Logic Separation**:
  - `src/types/models.ts`: Centralized domain models with zero `any`.
  - `src/services/`: Pure TypeScript business logic and mock state management (`overviewService.ts`, `financeService.ts`, `mockData.ts`).
- **Responsive Architecture**:
  - Desktop (>=1280px): Persistent 256px left navigation spine, multi-column asymmetric grids.
  - Tablet (768px-1279px): Collapsible rail / 2-column cards.
  - Mobile (<768px): Sticky Top App Bar + Fixed Bottom Navigation Bar with elevated Quick Entry FAB (`+`), horizontal scroll trays (`snap-x snap-mandatory`), single-column card feeds.

## Feature Inventory
| # | Category | Feature | Description | Milestone | Source |
|---|----------|---------|-------------|-----------|--------|
| 1 | Navigation | Desktop Spine Navigation | 256px fixed left rail (`w-64`), brand monogram, Quick Entry CTA, 8 navigation links, profile chip, rail collapse trigger | M1 | Stitch Screen 1 & 3 |
| 2 | Navigation | Mobile Bottom App Bar | 64px fixed bottom navigation with 5 destinations (Home, Finance, Center Floating `+` FAB, Tasks, Profile) | M1 | Stitch Screen 2 & 4 |
| 3 | Navigation | Mobile Top App Bar | 56px sticky top bar with brand anchor, status pill ("System Steady" / "Reconciled"), search/notifications | M1 | Stitch Screen 2 & 4 |
| 4 | Header | Editorial Morning Header | Greeting ("Good morning, Alex."), System Steady green pill, date subtitle | M1 | Stitch Screen 1 & 2 |
| 5 | Header | Global Search & Command Bar | Quick search bar with `⌘K` keyboard shortcut badge, active focus ring | M1 | Stitch Screen 1 & 3 |
| 6 | Header | Contextual `+ Add Entry` Flyout | Dropdown menu for fast logging (+ Expense, + Income, + Task, + Note, + Goal) | M1 | Stitch Screen 1 |
| 7 | Filters | Persistent Temporal Filter Strip | Month picker (`September 2026 ▾`), Category, Account, Type dropdowns, temporal range tabs (Today, Week, Month, Quarter) | M2 | Stitch Screen 1 |
| 8 | Filters | Mobile Filter Tray | Horizontal swipeable chip tray (`no-scrollbar`) with Month, Category, Account, and View mode | M2 | Stitch Screen 2 & 4 |
| 9 | Overview Hero | Asymmetric Liquidity Hero Card | Total liquidity balance (`Rs. 79,200`, `+4.2%`), Live Vault status dot, and 3-submetric ledger (Inflow Rs. 120k, Expenses Rs. 65k, Retained Rs. 55k) | M2 | Stitch Screen 1 & 2 |
| 10 | Analytics | Outflow Distribution Donut | Interactive SVG donut visualization with center metrics (Spent Rs. 65k, 92% budget) and 5 category sectors | M2 | Stitch Screen 1 & 2 |
| 11 | Analytics | View Toggle (Category / Cadence) | Segmented button switcher between Category Donut and Cashflow Cadence | M2 | Stitch Screen 1 |
| 12 | Budget | Budget Health Envelopes | 4 envelope progress bars (Food, Transport, Shopping Alert, Bills) with buffers and warning thresholds | M2 | Stitch Screen 1 & 2 |
| 13 | Operations | Daily Focus Checklist | Interactive task checklist with category tags, strikethrough toggle, and circular SVG completion gauge (3/5 Done) | M2 | Stitch Screen 1 & 2 |
| 14 | Operations | Today's Debits Itemized Feed | Real-time itemized list of today's debits (`Rs. 1,300` sum, Coffee, Transit, Books) | M2 | Stitch Screen 1 & 2 |
| 15 | Operations | Mindset & Goal Anchor | Editorial reflective journal quote and annual reserve goal progress bar (72% achieved, Rs. 100k target) | M2 | Stitch Screen 1 & 2 |
| 16 | Finance Header | Executive Ledger Header & Philosophy | Subtitle, "FINANCE" title, philosophy quote, month picker, CSV export, `+ Add Transaction` button | M3 | Stitch Screen 3 & 4 |
| 17 | Finance Accounts | Liquidity & Holdings Accounts Ribbon | 4 account cards (Operating Bank HDFC ••4092, Physical Vault, High-Yield Vault, Amex Platinum) | M3 | Stitch Screen 3 & 4 |
| 18 | Finance Accounts | Mobile Snap-Scroll Account Tray | Horizontal swipeable card stack with CSS snap points (`snap-x snap-mandatory`) | M3 | Stitch Screen 4 |
| 19 | Finance Ledger | Transaction Stream & Multi-Filter Ledger | Ledger feed with inline search, sort dropdown, category pills, account filter, and chronological groups (Today, Yesterday, Earlier this week, Sep 01) | M3 | Stitch Screen 3 & 4 |
| 20 | Finance Ledger | Ledger Pagination & Summary Bar | Record count, pagination controls (pages 1-6), and "Download statement ↗" link | M3 | Stitch Screen 3 |
| 21 | Finance Panel | Docked Quick Entry Form (Desktop) | Inline form with "I spent" / "I received" / "I moved" toggle, large currency input, category/account selects, date, memo, and submit | M3 | Stitch Screen 3 |
| 22 | Finance Panel | Cashflow Velocity & Hotspots Panel | Inflow vs Outflow box, Monthly Retention Rate bar (69.4%), and velocity hotspots list | M3 | Stitch Screen 3 & 4 |
| 23 | Finance Panel | Recurring Obligations Registry | Itemized subscriptions (AWS Rs. 4,200, Bloomberg Rs. 2,100, Lease Rs. 24,000; Total Rs. 31,500/mo) | M3 | Stitch Screen 3 & 4 |
| 24 | Mobile Actions | Quick Action Button Trio | 3 compact action pills: "Log Expense", "Log Income", "Move Funds" | M3 | Stitch Screen 4 |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Foundation, Theme & App Shell | Anchor Theme, Google Fonts (Newsreader, Plus Jakarta Sans, JetBrains Mono), Domain Types (`src/types/models.ts`), Services (`src/services/`), Desktop Sidebar Navigation, Mobile Top App Bar & Bottom Navigation, Header Search & Quick Entry flyout | none | DONE |
| M2 | Overview Command Center Module | Dashboard view (`/`): Temporal filter strip, Liquidity hero card, Outflow Donut SVG chart, Budget health envelopes, Daily focus checklist, Today's debits, Mindset & goal anchor | M1 | READY_FOR_DISPATCH |
| M3 | Finance & Accounts Command Center Module | Finance view (`/finance`): Executive ledger header, Liquidity accounts ribbon & mobile snap tray, Transaction stream ledger table, Docked quick entry form, Cashflow velocity panel, Recurring obligations registry | M1 | PLANNED |
| M4 | Living Docs Synchronization & Acceptance Gating | Synchronize `/docs/PROGRESS.md`, `/docs/CONTEXT.md`, `/docs/DECISIONS.md`, verify zero `any`, verify responsive adaptability (390px, 768px, 1280px+), verify MUI component priority, verify command restriction compliance | M2, M3 | PLANNED |

## Interface Contracts

### 1. Domain Types (`src/types/models.ts`)
- `Account`: `id`, `name`, `type`, `institution`, `accountNumberMasked`, `balance`, `currency`, `trendLabel`, `creditLimit`, `paymentDueDate`
- `Transaction`: `id`, `accountId`, `accountName`, `amount`, `currency`, `flowType`, `category`, `categoryLabel`, `payeeOrPayer`, `date`, `time`, `paymentMethod`
- `BudgetEnvelope`: `id`, `category`, `label`, `allocatedAmount`, `spentAmount`, `burnRateStatus`, `burnPercentage`, `bufferRemaining`
- `DailyTask`: `id`, `title`, `category`, `priority`, `isCompleted`, `dueInfo`
- `CashflowVelocity`: `cycleDay`, `totalInflow`, `totalOutflow`, `retentionRate`, `hotspots`
- `RecurringObligation`: `id`, `name`, `amount`, `billingCycle`, `renewalNotice`, `status`

### 2. Service Layer Contracts (`src/services/`)
- `overviewService`:
  - `getOverviewData(): Promise<ExecutiveOverviewData>`
  - `toggleTask(taskId: string): Promise<DailyTask>`
- `financeService`:
  - `getAccounts(): Promise<Account[]>`
  - `getTransactions(filter: TransactionFilterCriteria): Promise<PaginatedTransactionsResponse>`
  - `recordTransaction(entry: QuickEntryPayload): Promise<Transaction>`
  - `getCashflowVelocity(): Promise<CashflowVelocity>`
  - `getRecurringObligations(): Promise<RecurringObligation[]>`
  - `exportLedgerToCsv(): Promise<string>`

## Code Layout
```
src/
├── app/
│   ├── layout.tsx              # Root layout with fonts, ThemeRegistry, Command Center AppShell
│   ├── globals.css             # Tailwind v4 theme variables and base styles
│   ├── page.tsx                # Overview Command Center (M2)
│   └── finance/
│       └── page.tsx            # Finance & Accounts Command Center (M3)
├── components/
│   ├── layout/
│   │   ├── AppShell.tsx        # Responsive container switching Desktop Sidebar / Mobile Nav
│   │   ├── DesktopSidebar.tsx  # 256px permanent navigation spine
│   │   ├── TopHeader.tsx       # Editorial header, search, status, and Add Entry menu
│   │   ├── MobileTopBar.tsx    # Mobile sticky top bar
│   │   └── MobileBottomNav.tsx # Mobile fixed 5-destination bottom bar with center FAB
│   ├── overview/               # Overview module components (M2)
│   │   ├── LiquidityHero.tsx
│   │   ├── OutflowDonutChart.tsx
│   │   ├── BudgetHealth.tsx
│   │   ├── DailyFocusCard.tsx
│   │   ├── TodayDebitsCard.tsx
│   │   └── MindsetGoalCard.tsx
│   └── finance/                # Finance module components (M3)
│       ├── FinanceHeader.tsx
│       ├── AccountsRibbon.tsx
│       ├── TransactionLedger.tsx
│       ├── QuickEntryForm.tsx
│       ├── CashflowVelocityCard.tsx
│       └── RecurringObligations.tsx
├── lib/
│   └── mui/
│       └── theme.ts            # Anchor OS theme configuration
├── services/
│   ├── mockData.ts             # Authoritative Stitch mock fixtures
│   ├── overviewService.ts      # Overview data & mutation service
│   └── financeService.ts       # Finance accounts & ledger service
└── types/
    └── models.ts               # Domain types (zero `any`)
```
