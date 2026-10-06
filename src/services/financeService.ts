import {
  Transaction,
  CashflowVelocity,
  TransactionFilterCriteria,
  PaginatedTransactionsResponse,
  QuickEntryPayload,
} from '@/types/models';
import { apiRequest } from '@/lib/api/client';

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

type VelocityResponse = { velocity: CashflowVelocity };

/** Finance API client. Every call throws on failure so the UI can report it. */
export const financeService = {
  async getBalance(): Promise<number> {
    return (await apiRequest<{ balance: number }>('/api/finance/balance')).balance;
  },

  /** Adds (positive delta) or removes (negative delta) funds. Returns the new balance. */
  async adjustBalance(delta: number): Promise<number> {
    const res = await apiRequest<{ balance: number }>('/api/finance/balance', {
      method: 'POST',
      body: JSON.stringify({ delta }),
    });
    return res.balance;
  },

  getTransactions(criteria: TransactionFilterCriteria = {}): Promise<PaginatedTransactionsResponse> {
    const params = new URLSearchParams();
    if (criteria.page) params.set('page', String(criteria.page));
    if (criteria.pageSize) params.set('pageSize', String(criteria.pageSize));
    if (criteria.category) params.set('category', criteria.category);
    if (criteria.flowType) params.set('flowType', criteria.flowType);
    if (criteria.selectedMonth) params.set('selectedMonth', criteria.selectedMonth);
    if (criteria.searchQuery) params.set('searchQuery', criteria.searchQuery);
    if (criteria.sortBy) params.set('sortBy', criteria.sortBy);
    return apiRequest<PaginatedTransactionsResponse>(`/api/finance/transactions?${params.toString()}`);
  },

  /** Records a transaction; the server applies it to the balance. */
  recordTransaction(entry: QuickEntryPayload): Promise<Transaction> {
    return apiRequest<Transaction>('/api/finance/transactions', {
      method: 'POST',
      body: JSON.stringify({
        amount: entry.amount,
        currency: entry.currency,
        flowType: entry.intent === 'received' ? 'inflow' : 'outflow',
        category: entry.category,
        payeeOrPayer: entry.memo || CATEGORY_LABELS[entry.category] || 'Quick Entry',
        note: entry.memo,
        date: entry.date,
      }),
    });
  },

  async getCashflowVelocity(): Promise<CashflowVelocity> {
    return (await apiRequest<VelocityResponse>('/api/finance/velocity')).velocity;
  },

  /** Exports the filtered ledger as an RFC-4180 CSV string. */
  async exportLedgerToCsv(filter?: TransactionFilterCriteria): Promise<string> {
    const res = await this.getTransactions({ ...filter, page: 1, pageSize: 10000 });
    const headers = [
      'Transaction ID',
      'Date',
      'Time',
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
};
