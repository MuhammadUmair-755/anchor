import {
  Account,
  Transaction,
  CashflowVelocity,
  RecurringObligation,
  TransactionFilterCriteria,
  PaginatedTransactionsResponse,
  QuickEntryPayload,
} from '@/types/models';
import {
  mockAccounts,
  mockTransactions,
  mockCashflowVelocity,
  mockRecurringObligations,
} from './mockData';

// Mutable in-memory stores initialized with mock fixtures
let accountsStore: Account[] = JSON.parse(JSON.stringify(mockAccounts));
let transactionsStore: Transaction[] = JSON.parse(JSON.stringify(mockTransactions));
let velocityStore: CashflowVelocity = JSON.parse(JSON.stringify(mockCashflowVelocity));
let recurringStore: RecurringObligation[] = JSON.parse(JSON.stringify(mockRecurringObligations));

const CATEGORY_LABELS: Record<string, string> = {
  food_dining: 'Food & Dining',
  housing_utilities: 'Housing & Utilities',
  transport_transit: 'Transport & Transit',
  shopping_gear: 'Shopping & Gear',
  health_wellness: 'Health & Wellness',
  knowledge_subs: 'Knowledge & Subs',
  consulting_inflow: 'Consulting Inflow',
  salary_payroll: 'Salary Payroll',
  other: 'Other Outflow',
};

/**
 * Finance Service - Decoupled asynchronous business logic for Treasury, Ledger & Accounts
 */
export const financeService = {
  /**
   * Retrieves all user accounts
   */
  async getAccounts(): Promise<Account[]> {
    return JSON.parse(JSON.stringify(accountsStore));
  },

  /**
   * Retrieves paginated, sorted, and filtered transaction ledger
   */
  async getTransactions(
    criteria: TransactionFilterCriteria = {}
  ): Promise<PaginatedTransactionsResponse> {
    const {
      selectedMonth,
      category = 'all',
      accountId = 'all',
      flowType = 'all',
      searchQuery = '',
      sortBy = 'date_desc',
      page = 1,
      pageSize = 8,
    } = criteria;

    let filtered = [...transactionsStore];

    // Filter by Month (YYYY-MM)
    if (selectedMonth) {
      filtered = filtered.filter((tx) => tx.date.startsWith(selectedMonth));
    }

    // Filter by Category
    if (category && category !== 'all') {
      filtered = filtered.filter((tx) => tx.category === category);
    }

    // Filter by Account
    if (accountId && accountId !== 'all') {
      filtered = filtered.filter((tx) => tx.accountId === accountId);
    }

    // Filter by Flow Type
    if (flowType && flowType !== 'all') {
      filtered = filtered.filter((tx) => tx.flowType === flowType);
    }

    // Search query match (payee, note, category label)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (tx) =>
          tx.payeeOrPayer.toLowerCase().includes(q) ||
          (tx.note && tx.note.toLowerCase().includes(q)) ||
          tx.categoryLabel.toLowerCase().includes(q) ||
          tx.accountName.toLowerCase().includes(q)
      );
    }

    // Sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date_asc':
          return `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`);
        case 'amount_desc':
          return Math.abs(b.amount) - Math.abs(a.amount);
        case 'amount_asc':
          return Math.abs(a.amount) - Math.abs(b.amount);
        case 'date_desc':
        default:
          return `${b.date} ${b.time}`.localeCompare(`${a.date} ${a.time}`);
      }
    });

    // Summary calculations across filtered set
    let totalInflow = 0;
    let totalOutflow = 0;

    for (const tx of filtered) {
      if (tx.amount > 0) {
        totalInflow += tx.amount;
      } else {
        totalOutflow += Math.abs(tx.amount);
      }
    }

    const netChange = totalInflow - totalOutflow;
    const totalCount = filtered.length;
    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
    const safePage = Math.min(Math.max(1, page), totalPages);
    const startIndex = (safePage - 1) * pageSize;
    const paginatedItems = filtered.slice(startIndex, startIndex + pageSize);

    return {
      transactions: JSON.parse(JSON.stringify(paginatedItems)),
      totalCount,
      page: safePage,
      pageSize,
      totalPages,
      summary: {
        totalInflow,
        totalOutflow,
        netChange,
      },
    };
  },

  /**
   * Records a new transaction via Quick Entry and updates associated account balances
   */
  async recordTransaction(entry: QuickEntryPayload): Promise<Transaction> {
    const accountIndex = accountsStore.findIndex((a) => a.id === entry.accountId);
    const sourceAccount = accountIndex !== -1 ? accountsStore[accountIndex] : null;
    const accountName = sourceAccount ? sourceAccount.name : 'Primary Account';

    let flowType: Transaction['flowType'] = 'outflow';
    let computedAmount = -Math.abs(entry.amount);

    if (entry.intent === 'received') {
      flowType = 'inflow';
      computedAmount = Math.abs(entry.amount);
    } else if (entry.intent === 'moved') {
      flowType = 'transfer';
      computedAmount = -Math.abs(entry.amount);
    }

    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newTx: Transaction = {
      id: `tx-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      accountId: entry.accountId,
      accountName,
      amount: computedAmount,
      currency: entry.currency,
      flowType,
      category: entry.category,
      categoryLabel: CATEGORY_LABELS[entry.category] || 'General',
      payeeOrPayer: entry.memo?.trim() || (flowType === 'inflow' ? 'Direct Deposit' : 'Ad hoc Expense'),
      note: entry.memo || undefined,
      date: entry.date || now.toISOString().slice(0, 10),
      time,
      paymentMethod: 'card',
      status: 'cleared',
      createdAt: now.toISOString(),
    };

    // Update source account balance
    if (sourceAccount) {
      sourceAccount.balance += computedAmount;
      sourceAccount.updatedAt = now.toISOString();
    }

    // If transfer to destination account
    if (entry.intent === 'moved' && entry.destinationAccountId) {
      const destAccount = accountsStore.find((a) => a.id === entry.destinationAccountId);
      if (destAccount) {
        destAccount.balance += Math.abs(entry.amount);
        destAccount.updatedAt = now.toISOString();
      }
    }

    transactionsStore.unshift(newTx);
    return JSON.parse(JSON.stringify(newTx));
  },

  /**
   * Retrieves cashflow velocity metrics and detected hotspots
   */
  async getCashflowVelocity(): Promise<CashflowVelocity> {
    return JSON.parse(JSON.stringify(velocityStore));
  },

  /**
   * Retrieves recurring subscription and lease obligations
   */
  async getRecurringObligations(): Promise<RecurringObligation[]> {
    return JSON.parse(JSON.stringify(recurringStore));
  },

  /**
   * Exports ledger to RFC-4180 compliant CSV string
   */
  async exportLedgerToCsv(filter?: TransactionFilterCriteria): Promise<string> {
    const res = await this.getTransactions({ ...filter, page: 1, pageSize: 10000 });
    const headers = [
      'Transaction ID',
      'Date',
      'Time',
      'Account',
      'Payee / Payer',
      'Category',
      'Flow Type',
      'Amount',
      'Currency',
      'Payment Method',
      'Status',
      'Note',
    ];

    const escapeCsv = (val: string | number | undefined) => {
      if (val === undefined || val === null) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = res.transactions.map((tx) => [
      escapeCsv(tx.id),
      escapeCsv(tx.date),
      escapeCsv(tx.time),
      escapeCsv(tx.accountName),
      escapeCsv(tx.payeeOrPayer),
      escapeCsv(tx.categoryLabel),
      escapeCsv(tx.flowType),
      tx.amount,
      escapeCsv(tx.currency),
      escapeCsv(tx.paymentMethod),
      escapeCsv(tx.status),
      escapeCsv(tx.note || ''),
    ]);

    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  },

  /**
   * Resets in-memory stores back to baseline fixtures (for test repeatability)
   */
  async resetState(): Promise<void> {
    accountsStore = JSON.parse(JSON.stringify(mockAccounts));
    transactionsStore = JSON.parse(JSON.stringify(mockTransactions));
    velocityStore = JSON.parse(JSON.stringify(mockCashflowVelocity));
    recurringStore = JSON.parse(JSON.stringify(mockRecurringObligations));
  },
};
