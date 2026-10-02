import assert from 'node:assert/strict';
import { financeService } from '../src/services/financeService';
import { TransactionFilterCriteria, QuickEntryPayload } from '../src/types/models';

async function runFinanceTestSuite() {
  console.log('--- STARTING MILESTONE 3: FINANCE SERVICE INTEGRITY SUITE ---');
  await financeService.resetState();

  // Test 1: Accounts Retrieval & Verification
  console.log('Test 1: Verify Accounts structure & balances');
  const accounts = await financeService.getAccounts();
  assert.equal(accounts.length, 4, 'Must have 4 primary accounts from Stitch design');
  const hdfc = accounts.find((a) => a.id === 'acc-hdfc-4092');
  assert.ok(hdfc, 'HDFC operating checking account must exist');
  assert.equal(hdfc?.type, 'checking');
  assert.equal(hdfc?.currency, 'INR');
  console.log('  -> PASS: Accounts accurately loaded');

  // Test 2: Transaction Ledger & Filtering
  console.log('Test 2: Ledger filtering & pagination');
  const initialPage = await financeService.getTransactions({ page: 1, pageSize: 5 });
  assert.equal(initialPage.transactions.length, 5, 'Page 1 must return 5 transactions');
  assert.ok(initialPage.totalCount > 5, 'Total count must exceed single page size');
  assert.equal(initialPage.page, 1);

  // Filter by category
  const foodOnly = await financeService.getTransactions({ category: 'food_dining' });
  for (const tx of foodOnly.transactions) {
    assert.equal(tx.category, 'food_dining', 'Every transaction must be food_dining');
  }
  console.log('  -> PASS: Category filtering operates correctly');

  // Search filter
  const searchAws = await financeService.getTransactions({ searchQuery: 'AWS' });
  assert.ok(searchAws.transactions.length > 0, 'Searching for AWS must yield results');
  assert.ok(searchAws.transactions[0].payeeOrPayer.includes('AWS'), 'Payee must match search');
  console.log('  -> PASS: Search query filter functional');

  // Test 3: Record Transaction & Balance Impact
  console.log('Test 3: Record new transaction & verify balance deduction');
  const startingAccounts = await financeService.getAccounts();
  const checkingBefore = startingAccounts.find((a) => a.id === 'acc-hdfc-4092')!.balance;

  const testEntry: QuickEntryPayload = {
    intent: 'spent',
    amount: 1500,
    currency: 'INR',
    category: 'food_dining',
    accountId: 'acc-hdfc-4092',
    date: '2026-10-01',
    memo: 'Executive Lunch Meeting',
  };

  const recordedTx = await financeService.recordTransaction(testEntry);
  assert.ok(recordedTx.id, 'Must generate unique transaction id');
  assert.equal(recordedTx.amount, -1500, 'Spent intent must produce negative amount');
  assert.equal(recordedTx.categoryLabel, 'Food & Dining');

  const postAccounts = await financeService.getAccounts();
  const checkingAfter = postAccounts.find((a) => a.id === 'acc-hdfc-4092')!.balance;
  assert.equal(checkingAfter, checkingBefore - 1500, 'Account balance must decrease by transaction amount');
  console.log('  -> PASS: Transaction creation dynamically updates account balance');

  // Test 4: CSV Export Validation
  console.log('Test 4: RFC-4180 CSV Export validation');
  const csv = await financeService.exportLedgerToCsv();
  assert.ok(csv.startsWith('Transaction ID,Date,Time'), 'CSV must contain standard headers');
  const lines = csv.trim().split('\n');
  assert.ok(lines.length > 10, 'CSV must contain exported records');
  console.log('  -> PASS: CSV export generated successfully');

  // Test 5: Clean reset
  await financeService.resetState();
  const resetAccounts = await financeService.getAccounts();
  const resetChecking = resetAccounts.find((a) => a.id === 'acc-hdfc-4092')!.balance;
  assert.equal(resetChecking, checkingBefore, 'Reset must restore pristine balance');
  console.log('  -> PASS: State cleanly reset');

  console.log('--- ALL MILESTONE 3 TESTS PASSED SUCCESSFULLY ---');
}

runFinanceTestSuite().catch((err) => {
  console.error('Milestone 3 Test Suite Failed:', err);
  process.exit(1);
});
