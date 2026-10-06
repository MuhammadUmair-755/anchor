/**
 * ANCHOR Life Command Center - Domain Models
 * Strictly typed entities with ZERO `any`.
 */

/** Supported currencies */
export type CurrencyCode = 'INR' | 'USD' | 'EUR' | 'GBP';

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

export interface Transaction {
  id: string;
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

// ----------------------------------------------------------------------------
// Overview & Finance Aggregates
// ----------------------------------------------------------------------------

export interface ExecutiveOverviewData {
  greeting: string;
  userName: string;
  systemStatus: 'steady' | 'reconciling' | 'attention';
  dateDisplay: string;
  totalLiquidity: number;
  currency: CurrencyCode;
  monthlyInflow: number;
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
}

export interface TransactionFilterCriteria {
  temporalRange?: TemporalRange;
  selectedMonth?: string; // YYYY-MM
  category?: TransactionCategory | 'all';
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
  intent: 'spent' | 'received';
  amount: number;
  currency: CurrencyCode;
  category: TransactionCategory;
  date: string;
  memo?: string;
}

// ----------------------------------------------------------------------------
// Tasks & Projects Systems Models
// ----------------------------------------------------------------------------

export type TaskFilterTab = 'today' | 'upcoming' | 'overdue' | 'completed' | 'backlog';
export type MobileTaskTab = 'today' | 'upcoming' | 'projects' | 'completed';

export interface TaskItem {
  id: string;
  title: string;
  isCompleted: boolean;
  priority: PriorityLevel; // 'low' | 'medium' | 'high'
  category: string;
  categoryLabel: string;
  statusBadge?: string;
  dueInfo?: string;
  dueTime?: string;
  dueDate?: string;
  projectId?: string;
  projectName?: string;
  metaPill?: string;
  estimatedMinutes?: number;
  tabCategory: TaskFilterTab;
  isFocusBlock?: boolean;
  domain?: string;
  createdAt: string;
  completedAt?: string;
}

export interface CreateTaskPayload {
  title: string;
  priority: PriorityLevel;
  projectId?: string;
  projectName?: string;
  dueDate?: string;
  dueTime?: string;
  dueInfo?: string;
  category?: string;
  categoryLabel?: string;
  metaPill?: string;
  estimatedMinutes?: number;
  tabCategory?: TaskFilterTab;
}

export interface Project {
  id: string;
  title: string;
  tag: string;
  description: string;
  progressPercentage: number;
  nextMilestone: string;
  tasksCompleted: number;
  totalTasks: number;
  targetDate?: string;
  accentColor?: string;
}

export interface WeeklyRhythmDay {
  day: string;
  heightPercent: number;
  isToday?: boolean;
}

export interface ExecutionRhythmData {
  allocatedTimeRange: string;
  title: string;
  description: string;
  blockName: string;
  focusMode: boolean;
}

export interface SystemPhase {
  id: string;
  name: string;
  status: 'completed' | 'active' | 'upcoming';
}

export interface TasksVelocityMetrics {
  completedCount: number;
  weeklyAverageDelta: string;
  weeklyRhythm: WeeklyRhythmDay[];
  syncStatus: string;
  syncLatencyMs: number;
}

export interface TasksPageData {
  tasks: TaskItem[];
  activeProjects: Project[];
  weeklyRhythm: WeeklyRhythmDay[];
  executionRhythm: ExecutionRhythmData;
  velocityMetrics: TasksVelocityMetrics;
  systemPhases: SystemPhase[];
}

// ----------------------------------------------------------------------------
// Notes
// ----------------------------------------------------------------------------

export interface Note {
  id: string;
  title: string;
  body: string;
  isPinned?: boolean;
  createdAt: string;
  updatedAt: string;
}

// ----------------------------------------------------------------------------
// Calendar Models
// ----------------------------------------------------------------------------

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:MM
  note?: string;
}

/** One grid cell, aggregating everything real that happened on that date. */
export interface CalendarDay {
  dateKey: string; // YYYY-MM-DD (local)
  dayNumber: number;
  inMonth: boolean;
  events: CalendarEvent[];
  tasks: { id: string; title: string; isCompleted: boolean }[];
  transactions: { id: string; title: string; amount: number }[];
  notes: { id: string; title: string }[];
}

export interface CalendarMonthData {
  month: string; // YYYY-MM
  days: CalendarDay[];
}

export interface NewCalendarEventPayload {
  title: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:MM
  note?: string;
}

