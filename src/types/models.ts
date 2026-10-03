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
// Daily Notes & Journal Workspace Models
// ----------------------------------------------------------------------------

export type JournalMoodTag =
  | 'Grounded'
  | 'Strategic'
  | 'Review'
  | 'Systems'
  | 'Weekly Audit';

export interface JournalMood {
  tag: JournalMoodTag;
  label: string; // e.g. "Grounded & Focused", "Strategic", "Review", "Systems Simplicity", "Weekly Audit"
  color: string; // e.g. "#3F6853", "#40617E"
  bgColor: string; // e.g. "rgba(95, 146, 119, 0.15)", "#cde5ff"
  dotColor?: string; // e.g. "#5F9277"
}

export interface LinkedProjectEntity {
  id?: string;
  name: string; // e.g. "ANCHOR Core"
  type: string; // e.g. "Core System" or "Project"
  category?: string;
}

export interface LinkedDebitEntity {
  id?: string;
  amount: number; // e.g. 1300
  currency: CurrencyCode; // 'INR'
  formattedText?: string; // e.g. "Rs. 1,300"
  subtitle?: string; // e.g. "-Rs. 1,300 spent today"
}

export interface LinkedTasksEntity {
  resolvedCount?: number;
  count?: number; // convenience alias
  formattedText?: string; // e.g. "3 tasks checked" or "3 tasks done"
  taskIds?: string[];
}

export interface LinkedOperatingEntities {
  project?: LinkedProjectEntity;
  financialDebit?: LinkedDebitEntity;
  tasksResolved?: LinkedTasksEntity;
}

export interface DailyInquiry {
  id: string;
  question: string; // e.g. "How was today? What did you refrain from reacting to?"
  isAnswered: boolean;
  answer?: string;
  assessedAt?: string; // e.g. "20:45"
  toneAssessment?: string; // e.g. "Assessed at 20:45 across focus, energy, and decision clarity."
  statusBadge?: string; // e.g. "Answered"
}

export interface JournalObservation {
  id?: string;
  title: string; // e.g. "Capital calm:"
  note: string; // e.g. "Executed standard monthly rebalance without yielding to the impulse to over-hedge."
}

export interface MicroObservations {
  time: string; // e.g. "21:15"
  items: string[];
}

export interface JournalEntry {
  id: string; // e.g. "entry-sep-11"
  dateKey: string; // e.g. "2026-09-11"
  date?: string; // Backwards-compatible alias
  dateDisplay: string; // e.g. "Sep 11 (Today)"
  dateShort: string; // e.g. "Sep 11"
  dateFullFormatted: string; // e.g. "Friday, September 11, 2026"
  dayNumber: number; // e.g. 11
  dayOfWeek: string; // e.g. "FRI"
  isToday?: boolean;
  entryNumber?: number; // e.g. 254
  title: string;
  snippet: string;
  wordCount: number; // e.g. 480
  readingTimeMinutes: number; // e.g. 6
  linksCount?: number; // e.g. 3
  mood: JournalMood;
  moodTag: JournalMoodTag;
  moodColor: string;
  inquiry: DailyInquiry;
  inquiryQuestion: string; // Backwards-compatible alias
  inquiryAnswered: boolean; // Backwards-compatible alias
  contentParagraphs: string[];
  quote?: string;
  quoteAttribution?: string;
  observations: JournalObservation[];
  microObservations?: MicroObservations;
  linkedEntities: LinkedOperatingEntities;
  linkedProject?: { name: string; type: string }; // Backwards-compatible alias
  linkedDebit?: { amount: number; currency: CurrencyCode }; // Backwards-compatible alias
  linkedTasksResolvedCount?: number; // Backwards-compatible alias
  loggedTimeInfo: string; // e.g. "Logged at 21:40 EST · Quiet Office · Room temp 20°C"
  tags: string[]; // e.g. ["#engineering", "#finance", "#clarity", "#mindset"]
  isPinned?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type ConsistencyDotStatus = 'completed' | 'missed' | 'today';

export interface ConsistencyMatrixDot {
  dayIndex: number; // 0 to 29
  date?: string; // YYYY-MM-DD
  dateKey?: string; // Backwards-compatible alias
  label: string; // e.g. "Aug 12"
  status: ConsistencyDotStatus;
  tooltipText?: string;
}

export interface ConsistencyStats {
  scorePercentage: number; // 94
  momChangeDelta: string; // "+4% MoM"
  totalDays: number; // 30
  startDateLabel: string; // "Aug 12"
  endDateLabel: string; // "Sep 11"
  dominantTone: string; // "Stoic / Analytical"
  sparkMatrix: ConsistencyMatrixDot[];
  missedDaysCount?: number;
}

export interface PinnedMaxim {
  id: string;
  quote: string; // "Restraint is power. When life gets chaotic, tighten the system."
  attribution: string; // "Affixed to September Executive Review"
  sourceCodex?: string; // "Anchor Ledger Codex · Axiom 04"
}

export interface NotesFilterOptions {
  searchQuery?: string;
  selectedMonth?: string; // e.g. "September 2026"
  selectedMood?: JournalMoodTag | 'all';
  selectedTag?: string;
}

export interface NotesSyncStatus {
  lastSyncedDisplay: string; // "Synced 2m ago"
  isLive: boolean;
}

export interface NotesPageData {
  entries: JournalEntry[];
  activeEntry: JournalEntry;
  consistencyStats: ConsistencyStats;
  pinnedMaxim: PinnedMaxim;
  taxonomyTags: string[];
  termBadge: string; // "Autumn Term 2026"
  currentMonth: string; // "September 2026"
  syncStatus: NotesSyncStatus;
}

// ----------------------------------------------------------------------------
// Unified Calendar & Goals Nexus Models
// ----------------------------------------------------------------------------

export interface CalendarDayCell {
  dateKey: string; // YYYY-MM-DD
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  financeAmount?: number;
  tasksDone?: number;
  tasksTotal?: number;
  hasJournal?: boolean;
  specialNote?: string;
  monthLabel?: string;
}

export interface SovereignGoal {
  id: string;
  title: string;
  subtitle: string;
  targetHorizon: string;
  progressPercentage: number;
  achievedMetric: string;
  gapMetric: string;
  meterColor: string;
}

export interface DayInspectorData {
  dateTitle: string;
  subtitle: string;
  tasksDone: number;
  tasksPending: number;
  tasksList: { id: string; title: string; isCompleted: boolean }[];
  ledgerItems: { category: string; amount: number }[];
  ledgerTotal: number;
  journalQuote: string;
  journalTime: string;
  cadenceDelta: string;
}

export interface TemporalHealthMetrics {
  monthName: string;
  operationalEquilibriumTitle: string;
  operationalEquilibriumSubtext: string;
  tasksResolvedCount: number;
  tasksTotalCount: number;
  netBalanceMtd: number;
  currency: CurrencyCode;
}

export interface NewCalendarEventPayload {
  title: string;
  date: string;
  type: 'event' | 'task' | 'financial' | 'journal';
  amount?: number;
  note?: string;
}

