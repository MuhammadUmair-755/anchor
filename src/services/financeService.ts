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
import { apiFetch } from '@/lib/api/client';

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
    const apiAccounts = await apiFetch<Account[]>('/api/finance/accounts');
    if (apiAccounts) {
      accountsStore = apiAccounts;
      return apiAccounts;
    }
    return JSON.parse(JSON.stringify(accountsStore));
  },

  /**
   * Retrieves paginated, sorted, and filtered transaction ledger
   */
  async getTransactions(
    criteria: TransactionFilterCriteria = {}
  ): Promise<PaginatedTransactionsResponse> {
    const params = new URLSearchParams();
    if (criteria.page) params.set('page', String(criteria.page));
    if (criteria.pageSize) params.set('pageSize', String(criteria.pageSize));
    if (criteria.category) params.set('category', criteria.category);
    if (criteria.accountId) params.set('accountId', criteria.accountId);
    if (criteria.flowType) params.set('flowType', criteria.flowType);
    if (criteria.selectedMonth) params.set('selectedMonth', criteria.selectedMonth);
    if (criteria.searchQuery) params.set('searchQuery', criteria.searchQuery);
    if (criteria.sortBy) params.set('sortBy', criteria.sortBy);

    const apiTxResponse = await apiFetch<PaginatedTransactionsResponse>(
      `/api/finance/transactions?${params.toString()}`
    );
    if (apiTxResponse) {
      return apiTxResponse;
    }

    // Fallback calculation using in-memory store
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

    if (selectedMonth) {
      filtered = filtered.filter((tx) => tx.date.startsWith(selectedMonth));
    }
    if (category && category !== 'all') {
      filtered = filtered.filter((tx) => tx.category === category);
    }
    if (accountId && accountId !== 'all') {
      filtered = filtered.filter((tx) => tx.accountId === accountId);
    }
    if (flowType && flowType !== 'all') {
      filtered = filtered.filter((tx) => tx.flowType === flowType);
    }
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
    let flowType: Transaction['flowType'] = 'outflow';
    if (entry.intent === 'received') {
      flowType = 'inflow';
    } else if (entry.intent === 'moved') {
      flowType = 'transfer';
    }

    const apiTx = await apiFetch<Transaction>('/api/finance/transactions', {
      method: 'POST',
      body: JSON.stringify({
        accountId: entry.accountId,
        destinationAccountId: entry.destinationAccountId,
        amount: entry.amount,
        currency: entry.currency,
        flowType,
        category: entry.category,
        payeeOrPayer: entry.memo || CATEGORY_LABELS[entry.category] || 'Quick Entry',
        note: entry.memo,
        date: entry.date,
      }),
    });

    if (apiTx) {
      transactionsStore.unshift(apiTx);
      // Refresh accounts in background
      this.getAccounts().catch(() => {});
      return apiTx;
    }

    // In-memory fallback
    const accountIndex = accountsStore.findIndex((a) => a.id === entry.accountId);
    const sourceAccount = accountIndex !== -1 ? accountsStore[accountIndex] : null;
    const accountName = sourceAccount ? sourceAccount.name : 'Primary Account';

    let computedAmount = -Math.abs(entry.amount);
    if (entry.intent === 'received') {
      computedAmount = Math.abs(entry.amount);
    }

    const now = new Date();
    const timeFormatted = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

    const newTransaction: Transaction = {
      id: `tx-user-${Date.now()}`,
      accountId: entry.accountId,
      accountName,
      amount: computedAmount,
      currency: entry.currency,
      flowType,
      category: entry.category,
      categoryLabel: CATEGORY_LABELS[entry.category] || 'Other Outflow',
      payeeOrPayer: entry.memo || 'Direct Entry',
      note: entry.memo,
      date: entry.date,
      time: timeFormatted,
      paymentMethod: 'card',
      status: 'cleared',
      createdAt: now.toISOString(),
    };

    transactionsStore.unshift(newTransaction);
    if (sourceAccount) {
      sourceAccount.balance += computedAmount;
      sourceAccount.updatedAt = now.toISOString();
    }

    return JSON.parse(JSON.stringify(newTransaction));
  },

  /**
   * Retrieves high-velocity metrics and cashflow retention health
   */
  async getCashflowVelocity(): Promise<CashflowVelocity> {
    const apiData = await apiFetch<{ velocity: CashflowVelocity; recurring: RecurringObligation[] }>(
      '/api/finance/velocity'
    );
    if (apiData?.velocity) {
      velocityStore = apiData.velocity;
      if (apiData.recurring) recurringStore = apiData.recurring;
      return apiData.velocity;
    }
    return JSON.parse(JSON.stringify(velocityStore));
  },

  /**
   * Retrieves recurring commitments and subscriptions
   */
  async getRecurringObligations(): Promise<RecurringObligation[]> {
    const apiData = await apiFetch<{ velocity: CashflowVelocity; recurring: RecurringObligation[] }>(
      '/api/finance/velocity'
    );
    if (apiData?.recurring) {
      recurringStore = apiData.recurring;
      return apiData.recurring;
    }
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
   * Resets in-memory stores back to canonical baseline (for test suites)
   */
  async resetState(): Promise<void> {
    accountsStore = JSON.parse(JSON.stringify(mockAccounts));
    transactionsStore = JSON.parse(JSON.stringify(mockTransactions));
    velocityStore = JSON.parse(JSON.stringify(mockCashflowVelocity));
    recurringStore = JSON.parse(JSON.stringify(mockRecurringObligations));
  },
};
