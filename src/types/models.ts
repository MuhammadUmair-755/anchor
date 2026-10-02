/**
 * ANCHOR Life Command Center - Domain Models
 * Strictly typed entities with ZERO `any`.
 */

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
