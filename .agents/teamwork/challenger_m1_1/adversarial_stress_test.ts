/**
 * Adversarial Stress Test Suite for ANCHOR Life Command Center
 * Milestone 1: Failure Modes, Edge Cases & Boundary Conditions
 */

import { overviewService } from '@/services/overviewService';
import { financeService } from '@/services/financeService';

interface StressResult {
  name: string;
  passed: boolean;
  notes: string;
}

const stressResults: StressResult[] = [];

function assert(condition: boolean, msg: string) {
  if (!condition) throw new Error(msg);
}

async function runStress(name: string, fn: () => Promise<void>) {
  try {
    await fn();
    stressResults.push({ name, passed: true, notes: 'Handled safely and correctly' });
    console.log(`  [STRESS-PASS] ${name}`);
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    stressResults.push({ name, passed: false, notes: errorMsg });
    console.error(`  [STRESS-FAIL] ${name}: ${errorMsg}`);
  }
}

async function runAdversarialSuite() {
  console.log('================================================================');
  console.log('ANCHOR Life Command Center - Adversarial Stress & Edge Case Test');
  console.log('================================================================\n');

  await overviewService.resetState();
  await financeService.resetState();

  // Test 1: Search query with regex metacharacters
  await runStress('Search query containing regex metacharacters: .*+?^${}()|[]\\', async () => {
    const trickyQueries = ['.*', '(', '[a-z]', '+', '?', '\\', '^$', '{1,3}'];
    for (const q of trickyQueries) {
      const res = await financeService.getTransactions({ searchQuery: q });
      assert(Array.isArray(res.transactions), `Failed on query: ${q}`);
    }
  });

  // Test 2: Search query with whitespace and emojis
  await runStress('Search query with extreme whitespace and unicode symbols', async () => {
    const res = await financeService.getTransactions({ searchQuery: '   \t  \n  ' });
    assert(res.totalCount === 13, 'Empty/whitespace-only query should return all transactions');

    const emojiRes = await financeService.getTransactions({ searchQuery: '☕💸🚀' });
    assert(emojiRes.totalCount === 0, 'Non-existent emoji query should return empty set without crashing');
  });

  // Test 3: Record transaction with unknown account ID
  await runStress('recordTransaction handles unknown account ID gracefully', async () => {
    const tx = await financeService.recordTransaction({
      intent: 'spent',
      amount: 100,
      currency: 'INR',
      category: 'other',
      accountId: 'non-existent-account-id',
      date: '2026-10-01',
      memo: 'Ghost account purchase',
    });
    assert(tx.accountName === 'Primary Account', 'Should fallback to default account name without crashing');
    assert(tx.amount === -100, 'Should still record valid negative amount');
  });

  // Test 4: Record transfer with invalid destination account
  await runStress('recordTransaction transfer handles invalid destination account gracefully', async () => {
    const accountsBefore = await financeService.getAccounts();
    const hdfcBefore = accountsBefore.find((a) => a.id === 'acc-hdfc-4092')!.balance;

    const tx = await financeService.recordTransaction({
      intent: 'moved',
      amount: 500,
      currency: 'INR',
      category: 'other',
      accountId: 'acc-hdfc-4092',
      destinationAccountId: 'invalid-dest-account',
      date: '2026-10-01',
    });

    assert(tx.flowType === 'transfer', 'FlowType should be transfer');
    const accountsAfter = await financeService.getAccounts();
    const hdfcAfter = accountsAfter.find((a) => a.id === 'acc-hdfc-4092')!.balance;
    assert(hdfcAfter === hdfcBefore - 500, 'Source account should still be deducted');
  });

  // Test 5: CSV export with RFC-4180 complex strings (quotes, commas, newlines)
  await runStress('CSV export correctly quotes and escapes complex punctuation and quotes', async () => {
    await financeService.recordTransaction({
      intent: 'spent',
      amount: 1200,
      currency: 'INR',
      category: 'shopping_gear',
      accountId: 'acc-hdfc-4092',
      date: '2026-10-01',
      memo: 'Item with "double quotes", and, commas; plus special chars',
    });

    const csv = await financeService.exportLedgerToCsv();
    assert(csv.includes('""double quotes""'), 'Double quotes must be escaped as double double-quotes per RFC-4180');
    assert(csv.includes('"Item with ""double quotes"", and, commas; plus special chars"'), 'Full string must be properly enclosed in quotes');
  });

  // Test 6: Zero amount transaction
  await runStress('recordTransaction handles 0 amount without NaN or corruption', async () => {
    const tx = await financeService.recordTransaction({
      intent: 'spent',
      amount: 0,
      currency: 'INR',
      category: 'other',
      accountId: 'acc-hdfc-4092',
      date: '2026-10-01',
      memo: 'Zero verification charge',
    });
    assert(tx.amount === 0 || tx.amount === -0, 'Amount should be 0');
  });

  // Test 7: Envelope update with 0 allocated amount
  await runStress('updateBudgetEnvelope handles 0 allocation safely without division by zero', async () => {
    const data = await overviewService.getOverviewData();
    const env = data.budgetEnvelopes[0];
    const res = await overviewService.updateBudgetEnvelope(env.id, 0);
    assert(res.burnPercentage === 100, 'Zero allocation should result in 100% burn');
    assert(res.burnRateStatus === 'exceeded', 'Zero allocation with spend should be exceeded');
    assert(res.bufferRemaining === 0, 'Buffer remaining should clamp to 0');
  });

  // Test 8: Non-existent envelope update throws
  await runStress('updateBudgetEnvelope throws on non-existent envelope ID', async () => {
    let threw = false;
    try {
      await overviewService.updateBudgetEnvelope('fake-envelope-id', 5000);
    } catch (e: unknown) {
      threw = true;
      assert((e as Error).message.includes('not found'), 'Message mentions not found');
    }
    assert(threw, 'Must throw error');
  });

  // Test 9: Rapid sequential mutations maintain integrity
  await runStress('Rapid sequential mutations maintain account ledger parity', async () => {
    await financeService.resetState();
    const initAccounts = await financeService.getAccounts();
    const initHdfc = initAccounts.find((a) => a.id === 'acc-hdfc-4092')!.balance;

    // Run 10 sequential transactions
    for (let i = 1; i <= 10; i++) {
      await financeService.recordTransaction({
        intent: 'spent',
        amount: 100 * i,
        currency: 'INR',
        category: 'food_dining',
        accountId: 'acc-hdfc-4092',
        date: '2026-10-01',
        memo: `Batch ${i}`,
      });
    }

    // Total spent: 100 * (10 * 11 / 2) = 5500
    const finalAccounts = await financeService.getAccounts();
    const finalHdfc = finalAccounts.find((a) => a.id === 'acc-hdfc-4092')!.balance;
    assert(finalHdfc === initHdfc - 5500, `Expected balance ${initHdfc - 5500}, got ${finalHdfc}`);

    const ledger = await financeService.getTransactions({ pageSize: 50 });
    assert(ledger.totalCount === 13 + 10, `Expected 23 transactions, got ${ledger.totalCount}`);
  });

  console.log('\n================================================================');
  const total = stressResults.length;
  const passed = stressResults.filter((r) => r.passed).length;
  const failed = stressResults.filter((r) => !r.passed).length;
  console.log(`TOTAL ADVERSARIAL TESTS: ${total}`);
  console.log(`PASSED: ${passed}`);
  console.log(`FAILED: ${failed}`);
  console.log('================================================================');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runAdversarialSuite().catch((e) => {
  console.error('Fatal stress test failure:', e);
  process.exit(1);
});
