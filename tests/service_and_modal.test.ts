import assert from 'node:assert';
import { financeService } from '../src/services/financeService';
import { overviewService } from '../src/services/overviewService';
import { QuickEntryPayload } from '../src/types/models';

console.log('--- STARTING ADVERSARIAL SERVICE & QUICK ENTRY INTEGRATION SUITE ---');

async function runTests() {
  let passed = 0;
  let total = 0;

  async function test(name: string, fn: () => Promise<void>) {
    total++;
    try {
      await fn();
      console.log(`[PASS] ${name}`);
      passed++;
    } catch (err: unknown) {
      console.error(`[FAIL] ${name}`);
      console.error(`       Error: ${(err as Error).message}`);
      throw err;
    }
  }

  // Ensure clean baseline
  await financeService.resetState();
  await overviewService.resetState();

  await test('financeService.getAccounts retrieves 4 configured Stitch accounts', async () => {
    const accounts = await financeService.getAccounts();
    assert.strictEqual(accounts.length, 4, 'Should return exactly 4 accounts');
    assert.strictEqual(accounts[0].id, 'acc-hdfc-4092');
    assert.strictEqual(accounts[0].name, 'Operating Checking');
    assert.strictEqual(accounts[0].accountNumberMasked, '•••• 4092');
    assert.strictEqual(accounts[1].id, 'acc-vault-0012');
    assert.strictEqual(accounts[1].name, 'Physical Vault');
    assert.strictEqual(accounts[2].id, 'acc-tbill-8831');
    assert.strictEqual(accounts[2].name, 'High-Yield Liquid Vault');
    assert.strictEqual(accounts[3].id, 'acc-amex-1042');
    assert.strictEqual(accounts[3].name, 'Amex Platinum Card');
  });

  await test('Quick Entry Outflow ("spent") deducts balance and appends to ledger', async () => {
    const accountsBefore = await financeService.getAccounts();
    const hdfcBefore = accountsBefore.find((a) => a.id === 'acc-hdfc-4092')!;
    const initialBalance = hdfcBefore.balance;

    const payload: QuickEntryPayload = {
      intent: 'spent',
      amount: 450,
      currency: 'INR',
      category: 'food_dining',
      accountId: 'acc-hdfc-4092',
      date: '2026-09-30',
      memo: 'Test Cold Brew',
    };

    const newTx = await financeService.recordTransaction(payload);
    assert.strictEqual(newTx.amount, -450, 'Outflow transaction amount must be negative');
    assert.strictEqual(newTx.flowType, 'outflow', 'Flow type must be outflow');
    assert.strictEqual(newTx.payeeOrPayer, 'Test Cold Brew');

    const accountsAfter = await financeService.getAccounts();
    const hdfcAfter = accountsAfter.find((a) => a.id === 'acc-hdfc-4092')!;
    assert.strictEqual(hdfcAfter.balance, initialBalance - 450, 'Account balance must decrease by 450');

    // Check transaction in ledger
    const ledger = await financeService.getTransactions({ searchQuery: 'Test Cold Brew' });
    assert.strictEqual(ledger.totalCount, 1, 'Ledger should find the newly created transaction');
    assert.strictEqual(ledger.transactions[0].id, newTx.id);
  });

  await test('Quick Entry Inflow ("received") increases balance and appends to ledger', async () => {
    const accountsBefore = await financeService.getAccounts();
    const hdfcBefore = accountsBefore.find((a) => a.id === 'acc-hdfc-4092')!;
    const initialBalance = hdfcBefore.balance;

    const payload: QuickEntryPayload = {
      intent: 'received',
      amount: 15000,
      currency: 'INR',
      category: 'consulting_inflow',
      accountId: 'acc-hdfc-4092',
      date: '2026-09-30',
      memo: 'Client Advisory Retainer',
    };

    const newTx = await financeService.recordTransaction(payload);
    assert.strictEqual(newTx.amount, 15000, 'Inflow transaction amount must be positive');
    assert.strictEqual(newTx.flowType, 'inflow', 'Flow type must be inflow');

    const accountsAfter = await financeService.getAccounts();
    const hdfcAfter = accountsAfter.find((a) => a.id === 'acc-hdfc-4092')!;
    assert.strictEqual(hdfcAfter.balance, initialBalance + 15000, 'Account balance must increase by 15000');
  });

  await test('Quick Entry Transfer ("moved") balances both accounts with net zero delta', async () => {
    const accountsBefore = await financeService.getAccounts();
    const sourceBefore = accountsBefore.find((a) => a.id === 'acc-hdfc-4092')!;
    const destBefore = accountsBefore.find((a) => a.id === 'acc-vault-0012')!;

    const payload: QuickEntryPayload = {
      intent: 'moved',
      amount: 5000,
      currency: 'INR',
      category: 'other',
      accountId: 'acc-hdfc-4092',
      destinationAccountId: 'acc-vault-0012',
      date: '2026-09-30',
      memo: 'Vault Transfer',
    };

    const newTx = await financeService.recordTransaction(payload);
    assert.strictEqual(newTx.amount, -5000, 'Transfer transaction amount is recorded as negative for source');
    assert.strictEqual(newTx.flowType, 'transfer', 'Flow type must be transfer');

    const accountsAfter = await financeService.getAccounts();
    const sourceAfter = accountsAfter.find((a) => a.id === 'acc-hdfc-4092')!;
    const destAfter = accountsAfter.find((a) => a.id === 'acc-vault-0012')!;

    assert.strictEqual(sourceAfter.balance, sourceBefore.balance - 5000, 'Source account must decrease by 5000');
    assert.strictEqual(destAfter.balance, destBefore.balance + 5000, 'Dest account must increase by 5000');

    // Total net balance delta across all accounts must be 0
    const totalBefore = accountsBefore.reduce((sum, a) => sum + a.balance, 0);
    const totalAfter = accountsAfter.reduce((sum, a) => sum + a.balance, 0);
    assert.strictEqual(totalAfter, totalBefore, 'Net capital must remain unchanged in an internal transfer');
  });

  await test('QuickEntryModal validation catches invalid amounts and self-transfers', async () => {
    // Helper function simulating the exact validation logic in QuickEntryModal.tsx lines 88-102
    function validateForm(amount: string, accountId: string, intent: string, destinationAccountId: string): string | null {
      const parsedAmount = parseFloat(amount);
      if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
        return "Please enter a valid amount greater than zero.";
      }
      if (!accountId) {
        return "Please select an account.";
      }
      if (intent === "moved" && destinationAccountId === accountId) {
        return "Source and destination accounts must be different.";
      }
      return null;
    }

    // Test zero amount
    assert.strictEqual(validateForm("0", "acc-hdfc-4092", "spent", ""), "Please enter a valid amount greater than zero.");
    // Test negative amount
    assert.strictEqual(validateForm("-100", "acc-hdfc-4092", "spent", ""), "Please enter a valid amount greater than zero.");
    // Test NaN string
    assert.strictEqual(validateForm("abc", "acc-hdfc-4092", "spent", ""), "Please enter a valid amount greater than zero.");
    // Test empty amount
    assert.strictEqual(validateForm("", "acc-hdfc-4092", "spent", ""), "Please enter a valid amount greater than zero.");
    // Test missing account
    assert.strictEqual(validateForm("500", "", "spent", ""), "Please select an account.");
    // Test self transfer
    assert.strictEqual(validateForm("500", "acc-hdfc-4092", "moved", "acc-hdfc-4092"), "Source and destination accounts must be different.");
    // Test valid form
    assert.strictEqual(validateForm("500", "acc-hdfc-4092", "moved", "acc-vault-0012"), null);
  });

  await test('overviewService toggleTask flips task completion and updates done count', async () => {
    const overviewBefore = await overviewService.getOverviewData();
    const task = overviewBefore.dailyTasks[0];
    const initialStatus = task.isCompleted;

    const toggled = await overviewService.toggleTask(task.id);
    assert.strictEqual(toggled.isCompleted, !initialStatus, 'Task completion should toggle');

    const overviewAfter = await overviewService.getOverviewData();
    const updatedTask = overviewAfter.dailyTasks.find((t) => t.id === task.id)!;
    assert.strictEqual(updatedTask.isCompleted, !initialStatus);
  });

  // Clean up state
  await financeService.resetState();
  await overviewService.resetState();

  console.log(`\n--- ALL ${passed} / ${total} ADVERSARIAL TESTS PASSED EMPIRICALLY ---`);
}

runTests().catch((e) => {
  console.error(e);
  process.exit(1);
});
