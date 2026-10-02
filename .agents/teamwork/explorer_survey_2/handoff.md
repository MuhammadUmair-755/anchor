# Stitch Design Specification Report — ANCHOR Life Command Center

**Author**: Explorer 2 (Stitch Design Specification Miner)  
**Date**: 2026-10-01  
**Project**: ANCHOR Life Command Center  
**Stitch Project ID**: `196342399105692014` (`Anchor Life Command Center`)  
**Design System Identifier**: `assets/168d2a0edbd44fe99be9ccab57a39351` (`Anchor OS`)  

---

## 1. Executive Summary & Specification Sources

This specification report captures the authoritative design tokens, visual hierarchy, layout structures, typography scales, interactive states, and component behaviors extracted directly from Stitch MCP for the ANCHOR Life Command Center.

### Probed Authoritative Screens
1. **Desktop Overview**: `4ecf9343b97b4be38623773ccd440388` (Width: 2560px, Canvas Layout: 1280px / 1360px max)
2. **Mobile Overview**: `5bc44953af514701bbf80fde4228033e` (Width: 780px / 390px viewport, Height: 3590px / 1756px)
3. **Desktop Finance**: `280651f0fb354645b93b898c13eeeff4` (Width: 2560px, Canvas Layout: 1280px / 1440px max)
4. **Mobile Finance**: `1a983f2d68c5459ba5da6af1493ef2e7` (Width: 780px / 390px viewport, Height: 2928px / 1483px)
5. **Project Design System & Theme**: Extracted via `get_project` and `list_design_systems` (`designMd`, `theme`, and typography scales).

---

## Features Discovered

| # | Category | Feature | Description | Inputs | Outputs | Error Behavior | Discovered Via |
|---|----------|---------|-------------|--------|---------|----------------|----------------|
| 1 | Navigation | Spine Navigation (Desktop) | 256px fixed left rail (`w-64`), anchor brand monogram, Quick Entry CTA, 8 navigation destinations, user profile chip, and collapse trigger | User click on nav links, quick entry, or collapse button | Active state styling (`bg-surface-container-highest/60`, indicator dot, or inset border `2px solid #111c2e`) | Fallback to default route if anchor link missing | Desktop Overview & Finance HTML |
| 2 | Navigation | Bottom App Bar (Mobile) | 64px (`h-16`) fixed bottom navigation with 5 destinations (Home, Finance, Center Floating `+` Quick Entry FAB, Tasks, Profile) | Tap on bottom nav item or FAB | Route change; active item rendered with filled icon and primary color | None; default to Home | Mobile Overview & Finance HTML |
| 3 | Navigation | Mobile Top App Bar | 56px (`h-14`) sticky top bar with brand anchor, pulsing status pill ("System Steady" / "Reconciled 10m ago"), search, notifications, or CSV export | Tap on actions | Activates search, notification drawer, or file export | None | Mobile Overview & Finance HTML |
| 4 | Header | Editorial Morning Header | Time-contextual greeting ("Good morning, Alex."), System Steady status pill with pulsing green indicator, date subtitle | Current system time and user profile | Editorial serif headline (Newsreader 26px/28px) and status pill | Fallbacks to neutral status if telemetry fails | Desktop & Mobile Overview HTML |
| 5 | Header | Global Search & Command Bar | Quick search bar with `⌘K` keyboard shortcut badge, active focus ring, and placeholder `Search ANCHOR... ⌘K` | Text input, `⌘K` or `Ctrl+K` keypress | Filters content or opens command palette | Graceful empty search message | Desktop Overview & Finance HTML |
| 6 | Header | Contextual `+ Add Entry` Flyout | Dropdown menu with styled icons for fast logging (+ Expense [red], + Income [green], + Task [blue], + Note [gray], + Goal [ochre]) | Click or hover on `+ Add Entry` button | Floating menu with 5 segmented quick action items | Closes on click outside / Esc | Desktop Overview HTML |
| 7 | Filters | Persistent Temporal Filter Strip | Calendar month picker (`September 2026 ▾`), Category dropdown, Account dropdown, Type dropdown, and fast temporal range switches (Today, Week, Month, Quarter) | Dropdown selection, tab click | Updates active time horizon and recalculates all ledger metrics | Reverts to current month if invalid | Desktop Overview HTML |
| 8 | Filters | Horizontal Scrollable Filter Tray (Mobile) | Swipeable chip tray (`no-scrollbar`) with Month button, Category pill, Account pill, and View mode | Touch swipe / tap | Segmented filtering across mobile viewport | Clamps scroll boundaries | Mobile Overview & Finance HTML |
| 9 | Overview Hero | Asymmetric Liquidity Hero Card | Primary balance display showing total liquidity (`Rs. 79,200`), Live Vault status dot, and percentage delta (`+4.2%`) | Aggregated balances across connected accounts | 5-col primary balance anchor + 7-col 3-submetric breakdown (Inflow: Rs. 120k, Expenses: Rs. 65k, Retained: Rs. 55k / 45.8%) | Displays `Rs. 0` or dash if unlinked | Desktop & Mobile Overview HTML |
| 10 | Analytics | Outflow Distribution Donut | Interactive SVG donut visualization with center metrics (Total Spent: Rs. 65,000, 92% of budget) and category breakdown list | Expense transactions grouped by sector | 5 colored SVG circle strokes with `stroke-dasharray` matching exact percentages (Food 30%, Housing 25%, Shopping 18%, Transit 15%, Health 12%) | Shows empty ring if zero expenses | Desktop & Mobile Overview HTML |
| 11 | Analytics | View Toggle (Category / Cadence) | Segmented button switcher between "Category Donut" and "Cashflow Cadence" | User click | Switches between categorical pie view and velocity timeline view | Stays on active view | Desktop Overview HTML |
| 12 | Budget | Budget Health Envelopes | Interactive envelope progress bars displaying allocated budget, spent amount, remaining buffer, and state warnings | Monthly budget allocations vs real-time category debits | 4 envelope bars with semantic states: Normal (Sage `#5F9277`), Well Contained (Teal `#508E8C`), Approaching Limit Alert (Coral `#C76D68`, 92% Limit), and Fixed Bills (Secondary `#40617E`) | Displays warning badge when spending >= 90% | Desktop & Mobile Overview HTML |
| 13 | Operations | Daily Focus Checklist | Interactive task checklist with category tags and circular SVG completion progress gauge ("3 / 5 Done") | Checkbox toggle | Instant strikethrough, text color muting, and progress gauge update | Persists toggle in local/remote state | Desktop & Mobile Overview HTML |
| 14 | Operations | Today's Debits Itemized Feed | Real-time list of today's debits grouped by transaction type, merchant name, category, payment method, and timestamp | Ingested debits for current date | Itemized rows with icons (Coffee, Taxi, Book), formatted prices, and total sum (`Rs. 1,300`) | Displays empty state if no debits | Desktop & Mobile Overview HTML |
| 15 | Operations | Mindset & Goal Anchor | Editorial reflective journal preview with quotation styling and annual reserve goal progress bar | Daily journal entry + annual target savings goal | Serif italic quote + Annual Reserve Goal (`72% Achieved`, `Rs. 72,000` / `Rs. 100,000` target) | Fallback placeholder quote if none logged | Desktop & Mobile Overview HTML |
| 16 | Finance Header | Executive Ledger Header & Philosophy | Cycle badge (`Executive Ledger • Q3 Fiscal Cycle`), page title (`FINANCE`), editorial quote: *"Know where your money goes. Control where it goes next."*, and action buttons (Month picker, CSV Export, `+ Add Transaction`) | Page load, date selection, click export/add | Displays executive masthead; triggers export or transaction modal | Shows fallback date if unselected | Desktop & Mobile Finance HTML |
| 17 | Finance Accounts | Liquidity & Holdings Accounts Ribbon | 4 distinct account cards: Operating Bank (HDFC ••4092), Physical Vault (Safe Deposit), High-Yield Vault (Treasury 4.2% APY), and Amex Platinum (12% Utilized, Payment due Oct 05) | Account service data | Balances, institution details, account type tags, and delta trends | Shows alert badge on negative or high-utilization credit cards | Desktop & Mobile Finance HTML |
| 18 | Finance Accounts | Mobile Snap-Scroll Account Tray | Horizontal swipeable card stack with snap points (`snap-x snap-mandatory`, min-w 200px per card) | Touch swipe left/right | Smooth inertial scroll across all 4 account cards | Snaps to closest card boundary | Mobile Finance HTML |
| 19 | Finance Ledger | Transaction Stream & Multi-Filter Ledger | Ledger feed with inline search, sort dropdown (Date Newest, Amount High-Low, Amount Low-High), category pills, account filters, and inflow/outflow toggles | Query string, category, account, type filter clicks | Grouped chronological feed (Today, Yesterday, Earlier this week, Sep 01) with semantic delta colors | "No transactions found matching filter criteria" | Desktop & Mobile Finance HTML |
| 20 | Finance Ledger | Ledger Pagination & Summary Bar | Bottom table controls: record count ("Showing 8 of 42 transactions"), page buttons (`1`, `2`, `3`, `…`, `6`), and "Download statement ↗" link | Page click | Navigates ledger pages | Disables inactive page numbers | Desktop Finance HTML |
| 21 | Finance Panel | Docked Quick Entry Form (Desktop) | Inline right-hand form with "I spent" / "I received" / "I moved" toggle, large currency input (`Rs. 2,500`), 2x2 category/account selectors, date input, memo input, and submit with `Enter ↵` shortcut | Form field input, intent button click | Dispatches new transaction to ledger | Validates amount > 0, required account/category | Desktop Finance HTML |
| 22 | Finance Panel | Cashflow Velocity & Hotspots Panel | Inflow vs Outflow comparison box, Monthly Retention Rate bar (`69.4%`, target `50.0%`), and Observed Velocity Hotspots list (Dining out pace +18%, Ad hoc ride-hailing Rs. 2,100/wk) | Real-time monthly cashflow data | Visual velocity meter, percentage delta badges, and proactive friction warnings | Displays zero velocity if no data | Desktop & Mobile Finance HTML |
| 23 | Finance Panel | Recurring Obligations Registry | Itemized subscription and recurring debits card (AWS Cloud Services Rs. 4,200, Bloomberg Terminal Rs. 2,100, Residential Lease Rs. 24,000) with renewal countdowns and "Manage →" link | Subscription database records | Monthly total (`Rs. 31,500/mo`) and itemized list with alert tags | Flags upcoming renewal (< 5 days) | Desktop & Mobile Finance HTML |
| 24 | Mobile Actions | Quick Action Button Trio | 3 compact action pills: "Log Expense" (`add_circle`), "Log Income" (`arrow_circle_down`), "Move Funds" (`sync_alt`) | Tap on pill | Opens corresponding quick entry drawer or sheet | None | Mobile Finance HTML |

---

## Edge Cases

| # | Feature | Input | Observed Behavior |
|---|---------|-------|-------------------|
| 1 | Keyboard Shortcut | User presses `⌘K` or `Ctrl+K` on Desktop | Event listener catches shortcut, prevents default browser action, and focuses global search input immediately |
| 2 | Checklist Interaction | User clicks completed checkbox | Checkbox status toggles; label text dynamically gains/removes `line-through` and `text-outline`, and circular SVG stroke progress adjusts |
| 3 | Credit Card Debt | Amex Platinum with negative balance `-Rs. 18,500` | Displayed with negative prefix, coral alert text `#8C3F3B`, 12% utilization tag, and payment due date |
| 4 | Large Retainer Inflow | Single large transaction (`+Rs. 45,000` / `+Rs. 120,000`) | Distinct tinted background `bg-[#5F9277]/5`, bold green text `#3F6853`, and `INFLOW` / `DIRECT DEPOSIT` badge |
| 5 | Approaching Budget Ceiling | Category expense exceeds 90% of allocated envelope (Shopping 92%) | Envelope changes to coral alert `#C76D68` / amber, displays warning icon with "Approaching limit / Near ceiling" |
| 6 | Mobile Viewport Overflow | Long category names and account numbers on 390px screens | Horizontal trays utilize `no-scrollbar` and `overflow-x-auto` with flex snap points; account numbers truncated (`••4092`) |
| 7 | Tabular Number Misalignment | Rapidly changing numeric balances and amounts | All numerical elements enforce `font-label-numeric` (JetBrains Mono) and `font-feature-settings: "tnum" 1, "zero" 1` to prevent horizontal jitter |
| 8 | Search Query Filtering | Filtering transactions with active category + account pills | Multi-constraint filter summary displayed ("Showing 8 of 42 transactions · 3 filter constraints applied") |

---

## 2. Authoritative Design Tokens (Anchor OS)

### 2.1 Color Palette
The ANCHOR color architecture is grounded in warm mineral ivories, deep structural navies, and serene botanical/mineral accents, explicitly avoiding sterile clinical whites or jarring neon gamification.

#### Base Canvas & Surfaces
- **Canvas Base Ground**: `#F7F5EF` (Tactile, paper-like warm ivory)
- **Card / Surface Ground**: `#FCFBF8` (Luminous alabaster surface)
- **Pure Canvas Overlay**: `#FFFFFF` (Modals, flyouts, and pure contrast surfaces)
- **Recessed Well Ground**: `#F5F3ED` / `#F0EEE8` (Inset ledgers, metric boxes, progress tracks)
- **Tonal Stepping Surfaces**:
  - `surface-container-lowest`: `#FFFFFF`
  - `surface-container-low`: `#F5F3ED`
  - `surface-container`: `#F0EEE8`
  - `surface-container-high`: `#EAE8E2`
  - `surface-container-highest`: `#E4E2DD`
  - `surface-dim`: `#DCDAD4`
  - `surface-bright`: `#FBF9F3`

#### Structural Anchors & Ink
- **Primary Anchor Navy**: `#0B1628` (Brand bedrock, primary buttons, monogram background)
- **Primary Navy Container**: `#111C2E` (Sidebar action button, active pills, dark badges)
- **Navy Surface**: `#12243A` (Hover state for primary nav and dark controls)
- **Deep Ink Text**: `#17202B` / `#1B1C18` (`on-surface`, high-contrast legible editorial text)
- **Muted Graphite**: `#68717C` / `#45474C` (`on-surface-variant`, secondary descriptors, timestamps)
- **Outline & Hairlines**: `#75777D` (`outline`), `#C5C6CD` (`outline-variant`), hairline `rgba(17, 28, 46, 0.08)`

#### Semantic Accents & Status Tints
- **Controlled Sage (Positive / Equilibrium)**:
  - Base: `#5F9277`
  - Text: `#3F6853`
  - Ground Tint: `rgba(95, 146, 119, 0.10)` to `rgba(95, 146, 119, 0.15)`
  - Border: `rgba(95, 146, 119, 0.30)`
- **Soft Coral (Risk / Negative / Alert)**:
  - Base: `#C76D68` / `#BA1A1A`
  - Text: `#8C3F3B` / `#93000A`
  - Ground Tint: `rgba(199, 109, 104, 0.10)` to `rgba(199, 109, 104, 0.15)`
  - Border: `rgba(199, 109, 104, 0.30)`
- **Muted Slate Secondary**:
  - Base: `#40617E` / `#6D8EAD`
  - Text: `#274A65`
  - Ground Tint: `rgba(64, 97, 126, 0.12)`
- **Mineral Teal Tertiary**:
  - Base: `#508E8C` / `#5E9C9A`
  - Container: `#00201F`
  - Dim/Pill: `#93D2CF` / `#AFEEEC`
- **Warm Ochre / Amber (Attention / Warnings)**:
  - Base: `#C4934A` / `#C48858`
  - Text: `#8C6B28` / `#78350F`
  - Ground Tint: `bg-amber-100` / `rgba(196, 136, 88, 0.15)`

---

### 2.2 Typography Hierarchy (Tri-Font System)

| Token Name | Font Family | Size | Weight | Line Height | Letter Spacing | Purpose & Usage |
|------------|-------------|------|--------|-------------|----------------|-----------------|
| `display-hero` | Newsreader | 56px | 400 (Regular) | 64px | -0.02em | Editorial hero statements & quotes |
| `display-hero-mobile` | Newsreader | 38px | 400 (Regular) | 44px | -0.02em | Mobile hero displays |
| `headline-lg` | Newsreader | 36px | 400 (Regular) | 44px | -0.015em | Top executive page headlines ("FINANCE") |
| `headline-lg-mobile` | Newsreader | 28px | 400 (Regular) | 34px | -0.01em | Mobile page greetings & headers |
| `headline-md` | Newsreader | 24px | 500 (Medium) | 32px | -0.01em | Brand title ("ANCHOR"), section headers |
| `headline-sm` | Plus Jakarta Sans | 18px | 600 (SemiBold)| 24px | -0.005em | Card headers ("Outflow Distribution", "Budget Health") |
| `body-lg` | Plus Jakarta Sans | 16px | 400 (Regular) | 26px | 0em | High-readability narrative body text |
| `body-md` | Plus Jakarta Sans | 14px | 400 (Regular) | 22px | 0em | Standard interface text, forms, navigation |
| `body-sm` | Plus Jakarta Sans | 12px | 500 (Medium) | 18px | 0.01em | Sub-labels, badges, checklist items |
| `label-numeric` | JetBrains Mono | 14px | 500/600 (Med/SB)| 20px | -0.02em | All currency (`Rs.`), ledger numbers, percentages, tnum |
| `label-caps` | Plus Jakarta Sans | 11px | 700 (Bold) | 16px | 0.08em | Uppercase section tracking tags ("TOTAL LIQUIDITY") |
| `caption` | Plus Jakarta Sans | 11px | 400 (Regular) | 16px | 0.01em | Timestamps, micro-metadata, footnotes |

---

### 2.3 Layout Spacing & Grid Discipline

- **Baseline Multiples**: Strict adherence to 4px (`space-xs`), 8px (`space-sm`), 16px (`space-md`), 24px (`space-lg`), and 40px (`space-xl`).
- **Gutters & Margins**:
  - `gutter-sm`: `1rem` (16px)
  - `gutter`: `1.5rem` (24px)
  - `gutter-lg`: `2rem` (32px)
  - `margin-sm`: `1rem` (16px)
  - `margin`: `2rem` (32px)
  - `margin-lg`: `3.5rem` (56px)
- **Container Max-Widths**:
  - Desktop: Centered canvas at 1360px (Overview) and 1440px (Finance), offset by 256px (`ml-64`) for persistent sidebar.
  - Mobile: Max-width 390px-420px canonical phone frame, horizontally centered.

---

### 2.4 Shapes, Borders & Elevation Model

- **Containers & Cards**: `rounded-xl` (12px / 0.5rem - 0.75rem) or `rounded-lg` (8px).
- **Interactive Controls (Buttons, Inputs)**: `rounded-lg` (8px) or `rounded-md` (6px).
- **Status Pills & Chips**: `rounded-full` (9999px) for status indicators; `rounded-md` (4px-6px) for category pills.
- **Hairlines**:
  - Standard structural border: `1px solid rgba(17, 28, 46, 0.08)` (`border-black/[0.08]`).
  - Soft divider: `1px solid rgba(17, 28, 46, 0.05)` (`border-black/[0.04]` / `border-outline-variant/20`).
- **Elevation / Shadows**:
  - Cards: `shadow-[0_2px_8px_-2px_rgba(11,22,40,0.03)]`
  - Overlays / Dropdowns: `shadow-[0_12px_32px_-4px_rgba(11,22,40,0.08)]`, border `1px solid rgba(11,22,40,0.12)`.
  - Floating Action Buttons: `shadow-lg` (`0 10px 15px -3px rgba(0,0,0,0.1)`).

---

## 3. Element-by-Element Breakdown: Overview Dashboard

### 3.1 Spine Navigation (Desktop)
- **Width & Position**: Fixed left sidebar, `w-64` (256px), `h-screen`, `z-30`, `bg-surface-container-low` (`#F5F3ED`), `border-r border-outline-variant/30`.
- **Monogram & Header**:
  - Container: 32x32px (`w-8 h-8 rounded-lg`), background `bg-primary-container` (`#111C2E`), text white.
  - Icon: ⚓ anchor monogram.
  - Text: `ANCHOR` (`font-headline-md font-medium text-on-background`), Subtitle: `Personal Operating System` (`font-caption text-on-surface-variant/80`).
- **Quick Entry CTA**:
  - Full width button, `bg-primary-container` (`#111C2E`), hover `#182840`.
  - Text: `+ Quick Entry`, Material Symbol `add` (18px), white text, `rounded-lg`, border `1px solid rgba(255,255,255,0.1)`.
- **Navigation Links (8 Destinations)**:
  1. `Overview` (Active): `bg-surface-container-highest/60`, text `text-primary font-semibold`, 6px indicator dot on left (`w-1.5 h-1.5 rounded-full bg-primary`), icon `dashboard`.
  2. `Finance`: Icon `account_balance`, text `text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high`.
  3. `Tasks`: Icon `check_circle`, counter badge (`5`) set in `JetBrains Mono text-caption bg-surface-container-high`.
  4. `Projects`: Icon `folder_open`.
  5. `Notes`: Icon `edit_note`.
  6. `Goals`: Icon `flag`.
  7. `Calendar`: Icon `calendar_today`.
  8. `Settings`: Icon `settings`.
- **Footer Profile & Rail Controls**:
  - User Chip: Avatar with initials `AV` in 32x32px circle (`bg-secondary/15 text-secondary`), name "Alex Vance", tier "Executive Tier", trailing `more_vert` icon.
  - Collapse rail trigger: Icon `keyboard_double_arrow_left`, text "Collapse rail", shortcut badge `<kbd>⌘K</kbd>`.

### 3.2 Editorial Header & Action Cluster (Desktop)
- **Morning Greeting**: Newsreader 26px (`font-headline-lg font-normal text-on-surface`), text: "Good morning, Alex."
- **Status Pill**: `bg-[#5F9277]/10`, border `border-[#5F9277]/30`, text `#3F6853`, label: "System Steady" with a 6px solid green indicator dot.
- **Date & Sentiment**: "Friday · September 11 — You're staying on track." (`font-body-sm text-on-surface-variant`).
- **Search Bar**: 288px (`w-72`), surface `#FCFBF8`, border `border-outline-variant/40`, left icon `search`, placeholder `Search ANCHOR... ⌘K`, right shortcut badge `<kbd>⌘K</kbd>`.
- **Notifications Button**: Icon `notifications`, relative unread dot in `bg-secondary` with 2px canvas border.
- **`+ Add Entry` Button & Menu**:
  - Trigger: `bg-primary-container` (`#111C2E`), text white, `+ Add Entry`, trailing `arrow_drop_down`.
  - Dropdown Menu: Surface `#FCFBF8`, border `border-outline-variant/30`, shadow `0 12px 32px -4px rgba(11,22,40,0.08)`.
  - Actions:
    - `+ Expense`: Icon `payments` (`text-error`)
    - `+ Income`: Icon `trending_up` (`text-[#3F6853]`)
    - Divider
    - `+ Task`: Icon `check_circle` (`text-secondary`)
    - `+ Note`: Icon `edit_note` (`text-outline`)
    - `+ Goal`: Icon `flag` (`text-[#8C6B28]`)

### 3.3 Filter Strip
- **Filter Dropdown Pills**: `#FCFBF8` background, 1px border `border-outline-variant/40`:
  - `September 2026 ▾` (with leading `calendar_month` icon)
  - `All Categories ▾`
  - `All Accounts ▾`
  - `All Types ▾`
- **Fast Temporal Switches**: Segmented control in `bg-surface-container`:
  - `Today`, `Week`, `Month` (active with `#FCFBF8` surface & primary font), `Quarter`.

### 3.4 Hero Liquidity & Balance Section (Asymmetric Ledger)
- **Container**: Card surface `#FCFBF8`, border `border-black/[0.08]`, `p-6`, `rounded-xl`.
- **Left 5-Columns (Total Liquidity Anchor)**:
  - Tag: `TOTAL LIQUIDITY & BALANCE` (`font-label-caps uppercase text-on-surface-variant`).
  - Live status: `Live Vault` with 8px pulsing green dot (`#5F9277`).
  - Primary Balance: `Rs. 79,200` (`font-label-numeric font-semibold text-[44px] tracking-tight tnum`).
  - Delta Tag: `+4.2%` (`bg-[#5F9277]/12 text-[#3F6853]`, icon `arrow_upward`).
  - Footnote: "Net capital across primary operating and savings reserves vs last calendar cycle."
- **Right 7-Columns (3-Metric Sub-Ledger)**:
  - Inset well styling: `bg-[#F7F5EF]/60`, border `border-black/[0.04]`, `p-3.5 rounded-lg`.
  - Inflow Card: "Monthly Inflow", delta `+8.5%` (green), value `Rs. 120,000` (JetBrains Mono 18px), subtext "2 primary payrolls".
  - Expense Card: "Total Expenses", delta "54% burned", value `Rs. 65,000`, subtext "Under monthly ceiling".
  - Retained Card: "Net Retained", delta "On Target", value `Rs. 55,000` (green), subtext "45.8% rate preserved".

### 3.5 Outflow Distribution Donut & Legend
- **Header**: "Outflow Distribution & Cadence", subtitle "Allocated spending breakdown for current 30-day window", view toggle pills: "Category Donut" (active) / "Cashflow Cadence".
- **Visual Donut**: 160x160px SVG, radius 62, stroke width 18, circumference ~390px:
  - Track: `#EFECE2`
  - Food & Dining: 30% (117px dash), color `#111C2E`
  - Housing & Base: 25% (97.5px dash), color `#40617E`
  - Transit & Travel: 15% (58.5px dash), color `#508E8C`
  - Shopping & Gear: 18% (70px dash), color `#C48858`
  - Health & Fitness: 12% (47px dash), color `#93A8B8`
- **Center Label**: Total Spent `Rs. 65,000` (17px SemiBold tnum), subtitle "92% of budget" (green).
- **Category List Rows**:
  - Food & Dining: 30%, `Rs. 19,500`
  - Housing & Base: 25%, `Rs. 16,250`
  - Shopping & Gear: 18%, `Rs. 11,700`
  - Transit & Travel: 15%, `Rs. 9,750`
  - Health & Fitness: 12%, `Rs. 7,800`
- **Footnote**: Trend note "Discretionary expenses are 8.4% lower than August average", link "View comprehensive ledger →".

### 3.6 Budget Health Envelopes
- **Header**: "Budget Health", subtitle "Active envelope thresholds for September 2026", badge "4 Active".
- **Envelopes**:
  1. Food & Groceries: `Rs. 11,200 / Rs. 15,000` (74%), progress bar 74.6% in `#5F9277` (green), status "Normal burn rate", "Rs. 3,800 buffer remains".
  2. Transport & Commute: `Rs. 4,300 / Rs. 10,000` (43%), progress bar 43% in `#508E8C` (teal), status "Well contained", "Rs. 5,700 available".
  3. Shopping & Gear (Alert): `Rs. 18,500 / Rs. 20,000` (92%), progress bar 92.5% in `#C76D68` (coral), warning icon, status "Approaching limit", "Rs. 1,500 runway".
  4. Bills & Utilities: `Rs. 8,200 / Rs. 9,000` (91%), progress bar 91.1% in `#40617E` (slate), status "Recurring debits completed", "Rs. 800 balance".
- **Footer**: "Adjust Category Allocations" with `tune` icon.

### 3.7 Operational Trio (Daily Focus, Today's Debits, Mindset & Goal)
- **Card 1: Today's Focus (Checklist)**:
  - Header: Icon `check_circle`, title "Today's Focus", progress badge "3 / 5 Done", circular SVG indicator.
  - Tasks:
    - [x] Complete API integration (Work · High) - checked, strikethrough.
    - [x] Morning gym session (Personal · Health) - checked, strikethrough.
    - [x] Review monthly investment yield (Finance · Portfolio) - checked, strikethrough.
    - [ ] Study TypeScript 5.5 performance notes (Learning · Medium) - unchecked.
    - [ ] Weekly financial reconciliation (Finance · Due 6:00 PM) - unchecked.
  - Footer Action: `+ Add new task`.
- **Card 2: Today's Debits**:
  - Header: Icon `receipt_long`, title "Today's Debits", total sum `Rs. 1,300`.
  - Itemized Entries:
    - Blue Tokai Coffee & Lunch: `Rs. 850` (Food · Cash wallet, icon `local_cafe`)
    - Metro & Uber Cab: `Rs. 300` (Transit · HDFC Bank, icon `local_taxi`)
    - Technical Publication Sub: `Rs. 150` (Books · Amex Platinum, icon `menu_book`)
  - Footer: "3 recorded transactions", `+ Log Expense`.
- **Card 3: Mindset & Goal Anchor**:
  - Header: Icon `auto_stories`, title "Mindset & Goal", timestamp "10:45 AM Entry".
  - Journal Note: Quotation mark “ in serif, italic text: *"Today I finally stabilized the core data pipelines. The feeling of financial grounding brings immense creative clarity. Restraint is power."*
  - Goal Anchor: "Annual Target", badge "72% Achieved", title "SAVE Rs. 100,000 RESERVE", progress track 72% in `#111C2E`, metadata: `Rs. 72,000 recorded` / `Target Dec 31`.
  - Footer: "Continue writing in Journal →".

---

## 4. Element-by-Element Breakdown: Finance Command Center

### 4.1 Executive Ledger Header & Philosophy
- **Subtitle & Cycle**: `Executive Ledger • Q3 Fiscal Cycle` (`font-label-caps tracking-wider uppercase`).
- **Title**: `FINANCE` (`font-headline-lg font-normal tracking-tight text-on-surface`).
- **Editorial Quote**: *“Know where your money goes. Control where it goes next.”* (`font-display-hero text-lg italic text-on-surface-variant font-serif`).
- **Trailing Action Buttons**:
  - Date Range: `September 2026 ▾` with `calendar_month` icon.
  - Export: `Export Ledger (CSV)` with `download` icon.
  - Primary Action: `+ Add Transaction` (`bg-primary-container text-white hover:bg-black`).

### 4.2 Liquidity & Holdings Accounts Ribbon
- **Ribbon Meta**: "LIQUIDITY & HOLDINGS", status pill "Reconciled 10m ago" with pulsing green dot, Total Net Capital badge: `Rs. 117,200`.
- **Four Distinctive Account Cards (4-col grid)**:
  1. **Primary Operating Bank**:
     - Institution: `HDFC ••4092`, Tag: `Checking · Active`
     - Balance: `Rs. 72,500` (JetBrains Mono 20px)
     - Trend: `+Rs. 120,000 inflow this mo` (icon `trending_up`, green `#3F6853`)
  2. **Physical Vault & Cash**:
     - Institution: `Secure Safe Deposit`, Tag: `Liquid Cash`
     - Balance: `Rs. 15,000`
     - Trend: `Updated today` (icon `history`)
  3. **High-Yield Vault (Treasury)**:
     - Institution: `Sovereign Treasury`, Tag: `Reserves`
     - Balance: `Rs. 48,200`
     - Trend: `+4.2% APY · Compounding` (icon `percent`, green `#3F6853`)
  4. **Amex Platinum**:
     - Institution: `Charge ••1042`, Tag: `12% Utilized` (soft coral badge `#C76D68`/10)
     - Balance: `-Rs. 18,500 / Rs. 150,000` (negative debt in coral `#8C3F3B`)
     - Trend: `Payment due Oct 05` (icon `schedule`)

### 4.3 Transaction Stream & Ledger Table (Left 68% / 8 Cols)
- **Ledger Header Controls**:
  - Title: "THE LEDGER & CASHFLOW", count "42 total".
  - Search input: "Filter records...", Sort select: "Date (Newest)", "Amount (High to Low)", "Amount (Low to High)".
  - Category Pills: `All` (active navy), `Food & Dining`, `Housing & Utilities`, `Transport`, `Shopping`, `Subscriptions`.
  - Account Filter: `All Accounts`, `Bank`, `Cash`, `Credit Card`.
  - Flow Type Switcher: `All`, `Inflow (+)`, `Outflow (-)`, `Transfers`.
- **Grouped Chronological Transaction Feed**:
  - **Group 1: TODAY — FRIDAY, SEP 11** (Outflow: `-Rs. 1,300`):
    - Blue Tokai Coffee & Lunch: `-Rs. 850`, 13:42, Food & Dining · Cash Wallet, tag `Work meeting`.
    - Metro & Uber Black: `-Rs. 300`, 10:15, Transport · Amex Platinum ••1042, tag `Client commute`.
    - Technical Publication Annual: `-Rs. 150`, 08:30, Subscriptions · Amex Platinum ••1042, tag `Knowledge`.
  - **Group 2: YESTERDAY — THURSDAY, SEP 10** (Net: `+Rs. 41,580`):
    - Nature's Basket Organic Provisions: `-Rs. 3,420`, 19:10, Grocery & Base · Primary Bank ••4092, tag `Weekly pantry`.
    - Quarterly Advisory Retainer — Acme Labs: `+Rs. 45,000`, 14:02, Consulting Inflow · Direct Deposit · Primary Bank ••4092, highlighted in green background `bg-[#5F9277]/5` with badge `INFLOW`.
  - **Group 3: EARLIER THIS WEEK — TUESDAY, SEP 08** (Outflow: `-Rs. 27,200`):
    - Residential Lease Base Rent: `-Rs. 24,000`, 00:05, Housing · Primary Bank ••4092, tag `Scheduled auto-debit`.
    - Equinox Membership: `-Rs. 3,200`, 11:20, Wellness · Amex Platinum ••1042, tag `Health & fitness`.
  - **Group 4: SEPTEMBER 01** (Inflow: `+Rs. 120,000`):
    - Primary Executive Payroll — Stripe Transfer: `+Rs. 120,000`, 09:00, Payroll / Salary · Primary Bank ••4092, green background `bg-[#5F9277]/5` with badge `DIRECT DEPOSIT`.
- **Pagination & Footer**:
  - Filter summary: "Showing 8 of 42 transactions · 3 filter constraints applied".
  - Pagination numbers: `1` (active dark), `2`, `3`, `…`, `6`.
  - Download Statement: "Download statement ↗".

### 4.4 Docked Financial Intelligence Panel (Right 32% / 4 Cols)
- **Card 1: Quick Entry Form**:
  - Header: "Quick Entry", hint "ESC to clear".
  - Segmented Intent Toggle: `I spent` (active), `I received`, `I moved`.
  - Large Currency Input: Prefix `Rs.`, input `2,500` in JetBrains Mono 20px bold.
  - 2x2 Grid Selects:
    - Category: Food & Dining (selected), Transport, Housing, Knowledge, Wellness.
    - Account: Cash Wallet (selected), Primary Bank ••4092, Amex Platinum ••1042, High-Yield Vault.
  - Date input: `Today (Sep 11, 2026)`.
  - Memo input: `Dinner with founders at Aer...`.
  - Submit CTA: `Record Entry` button with `<kbd>Enter ↵</kbd>` shortcut badge.
- **Card 2: Cashflow Velocity**:
  - Header: "Cashflow Velocity", cycle day: `Cycle Day 11`.
  - Metric Inset:
    - Total Inflow: `Rs. 165,000` (2 deposits, green)
    - Total Outflow: `Rs. 50,420` (14 debits, dark red)
  - Retention Rate: `69.4%` (exceeding target of 50.0%), segmented progress bar (69.4% green, 30.6% track).
  - Observed Velocity Hotspots:
    - Dining out pace: `+18% vs Aug`
    - Ad hoc ride-hailing: `Rs. 2,100 / wk`
- **Card 3: Recurring Obligations**:
  - Header: "Recurring Obligations", monthly sum: `Rs. 31,500/mo`.
  - Items:
    - AWS Cloud Services: `Rs. 4,200` (alert: "Renews in 4 days")
    - Bloomberg Terminal Sub: `Rs. 2,100` ("Renews Sep 24")
    - Residential Lease Fixed: `Rs. 24,000` ("Auto-cleared Sep 08")
  - Footer: "All debits tokenized & verified", link "Manage →".

---

## 5. Responsive Multi-Device Adaptations (Desktop vs Mobile)

### 5.1 Architecture & Shell Adaptation
- **Desktop (>=1280px)**:
  - Sidebar: Persistent 256px (`w-64`) left spine navigation with 8 links, brand monogram, quick entry button, user identity chip, and rail collapse toggle.
  - Top Bar: Sticky editorial header with inline search bar (`⌘K`), status pill, and `+ Add Entry` contextual dropdown.
  - Main Canvas: Multi-column fluid grids (`max-w-[1360px]` or `max-w-[1440px]`).
- **Tablet (768px - 1279px)**:
  - Sidebar: Converts into an off-canvas drawer or streamlined icon rail (64px).
  - Main Canvas: 2-column or 8-column layout.
- **Mobile (<768px / Canonical 390px)**:
  - Sidebar: Replaced completely by a 56px sticky Top App Bar (brand icon, status pill, search/notifications) and a 64px fixed Bottom Navigation Bar (5 destinations: Home, Finance, Center Floating Quick Entry FAB `+`, Tasks, Profile).
  - Navigation Flow: The center floating button provides instant touch-first access to quick transaction logging.

### 5.2 Overview Module Adaptations
- **Hero Liquidity**:
  - Desktop: Asymmetric 12-column grid (5 cols primary balance hero + 7 cols 3-card sub-ledger).
  - Mobile: Full-width stacked card with 3-column micro-metrics ledger inset well (`Inflow`, `Expenses`, `Retained`) at the bottom of the card.
- **Outflow Donut**:
  - Desktop: 160px SVG donut on left, 7-column category list on right, and chart view switcher (Donut vs Cashflow Cadence).
  - Mobile: Compact 100px SVG donut beside a condensed 5-sector list showing abbreviated amounts (`Rs. 19.5k`).
- **Budget Health**:
  - Desktop: 4 full envelope progress cards with detailed buffer subtext and adjust allocations action.
  - Mobile: 3 key envelope bars with compact limit badges (`92% LIMIT`).
- **Operational Trio**:
  - Desktop: 3 side-by-side cards in a 3-column grid (Today's Focus, Today's Debits, Mindset & Goal).
  - Mobile: Single-column vertical stack, with Focus checklist first, itemized debits second, and Mindset/Goal card third.

### 5.3 Finance Module Adaptations
- **Header & Philosophy**:
  - Desktop: Horizontal flex layout with date picker, CSV export, and `+ Add Transaction` buttons.
  - Mobile: Stacked editorial header followed by a dedicated high-contrast `TOTAL NET CAPITAL` dark banner card (`Rs. 117,200`, `+8.4% MoM`, `SOLVENT`).
- **Accounts Ribbon**:
  - Desktop: 4-column side-by-side grid showing Operating Bank, Physical Vault, High-Yield Vault, and Amex Platinum.
  - Mobile: Horizontal snap-scroll tray (`snap-x snap-mandatory`, `overflow-x-auto`, `no-scrollbar`), allowing thumb-swiping across all 4 account cards.
- **Quick Action Triggers**:
  - Desktop: Integrated inside the docked right-hand panel.
  - Mobile: 3-column button trio directly below the accounts tray (`Log Expense`, `Log Income`, `Move Funds`), plus the center floating FAB in the bottom navigation.
- **Split Ledger vs Docked Panel**:
  - Desktop: Split 68% / 32% (8 cols ledger stream, 4 cols docked panel with Quick Entry, Velocity, Recurring).
  - Mobile: Linear stacked presentation: Net Capital Banner → Accounts Snap-Tray → Action Trio → Cashflow Velocity Card → Category Filter Pills → Grouped Ledger Entries → Recurring Obligations Summary Banner.

---

## 6. Five-Component Handoff Report

### 1. Observation
- Inspected Stitch project `196342399105692014` (`Anchor Life Command Center`) and design system `assets/168d2a0edbd44fe99be9ccab57a39351` (`Anchor OS`).
- Downloaded and analyzed the exact HTML files for:
  - Screen 1: Desktop Overview `4ecf9343b97b4be38623773ccd440388` (Lines 1-842)
  - Screen 2: Mobile Overview `5bc44953af514701bbf80fde4228033e` (Lines 1-518)
  - Screen 3: Desktop Finance `280651f0fb354645b93b898c13eeeff4` (Lines 1-987)
  - Screen 4: Mobile Finance `1a983f2d68c5459ba5da6af1493ef2e7` (Lines 1-494)
- Verified tri-font typography configuration:
  - Newsreader for editorial serif headlines and philosophy quotes.
  - Plus Jakarta Sans for interface UI and labels.
  - JetBrains Mono for financial figures, tabular amounts, and keyboard shortcuts (`font-feature-settings: "tnum" on, "zero" on`).
- Verified exact color codes:
  - Canvas base: `#F7F5EF`
  - Card surfaces: `#FCFBF8`
  - Structural navy: `#0B1628` / `#111C2E`
  - Controlled sage: `#5F9277` (text `#3F6853`)
  - Soft coral: `#C76D68` (text `#8C3F3B`)
  - Secondary slate: `#40617E` / `#6D8EAD`
  - Tertiary teal: `#508E8C` / `#5E9C9A`
  - Warm ochre: `#C4934A` / `#C48858`
  - Inset wells & tracks: `#EFECE2` / `#F5F3ED` / `#F0EEE8`
  - Structural hairlines: `1px solid rgba(17, 28, 46, 0.08)`

### 2. Logic Chain
1. The Stitch project specification defines Anchor OS as an executive-grade personal operating system built on "Editorial Modernism fused with Precision Productivity."
2. The visual hierarchy relies on warm mineral surfaces and structural hairlines rather than heavy drop shadows, requiring cards to use `#FCFBF8` on `#F7F5EF` backgrounds framed by 1px borders at 8% opacity.
3. The typography requires strict separation: Newsreader communicates literary authority, Plus Jakarta Sans provides crisp ergonomics, and JetBrains Mono guarantees character alignment for financial metrics.
4. On desktop screens (>=1280px), multi-column workspaces dominate (e.g. 5/7 hero split on Overview, 68/32 split on Finance, 256px persistent sidebar).
5. On mobile screens (<768px), the layout adapts into single-column vertical flows, replacing the sidebar with a fixed bottom nav bar (5 destinations with center floating FAB) and converting multi-card ribbons into horizontal snap-scroll trays (`snap-x snap-mandatory`).
6. All interactive elements (buttons, inputs, select dropdowns, menus, tabs, cards, dialogs, progress bars, chips) map directly to Material UI (MUI) components with customized theme overrides to match Anchor OS tokens.

### 3. Caveats
- Screen 1 and Screen 3 specify a collapse rail button with a keyboard shortcut hint `⌘K`, which is also used for the search bar. In implementation, the global shortcut `⌘K` should focus search, while the rail toggle can use an alternative shortcut or direct button click.
- Screen `37258fbf2c5b441090aa520e6b42e9a0` exists in the Stitch project as an alternate mobile screen, but Screen `1a983f2d68c5459ba5da6af1493ef2e7` is the authoritative reference specified in `ORIGINAL_REQUEST.md`.

### 4. Conclusion
The design specification for ANCHOR Life Command Center is fully discovered, authoritatively documented, and completely actionable. The design system combines high-craft editorial elegance with financial software precision. Developers can implement Overview (`/`) and Finance (`/finance`) using Material UI primitives styled with the exact tokens, typography, colors, and layout grids specified in this report.

### 5. Verification Method
1. Inspect downloaded authoritative HTML files in `.agents/teamwork/explorer_survey_2/`:
   - `screen1_desktop_overview.html`
   - `screen2_mobile_overview.html`
   - `screen3_desktop_finance.html`
   - `screen4_mobile_finance.html`
2. Cross-reference token values against `designMd` in `C:\Users\hp\.gemini\antigravity-cli\brain\73882b2a-569b-44f8-b773-c35aa1e1ab2f\.system_generated\steps\63\output.txt`.
3. In subsequent frontend development, verify responsive breakpoints using Playwright at 390px (Mobile), 768px (Tablet), and 1280px+ (Desktop).
