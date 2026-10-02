/**
 * Empirical Automated Test Harness for ANCHOR Life Command Center
 * Milestone 1: Service Layer Contracts & State Transitions
 */

import { overviewService } from '@/services/overviewService';
import { financeService } from '@/services/financeService';
import { mockOverviewData } from '@/services/mockData';

interface TestResult {
  suite: string;
  name: string;
  passed: boolean;
  error?: string;
  details?: unknown;
}

const results: TestResult[] = [];

function assert(condition: boolean, message: string, details?: unknown) {
  if (!condition) {
    throw new Error(message + (details ? ` Details: ${JSON.stringify(details)}` : ''));
  }
}

async function runTest(suite: string, name: string, fn: () => Promise<void>) {
  try {
    await fn();
    results.push({ suite, name, passed: true });
    console.log(`  [PASS] ${name}`);
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    results.push({ suite, name, passed: false, error: errorMsg });
    console.error(`  [FAIL] ${name}: ${errorMsg}`);
  }
}

async function runAllTests() {
  console.log('================================================================');
  console.log('ANCHOR Life Command Center - Empirical Service Contract Test Run');
  console.log('================================================================\n');

  // Ensure clean initial state
  await overviewService.resetState();
  await financeService.resetState();

  // --------------------------------------------------------------------------
  // Suite 1: overviewService.getOverviewData() Contract Verification
  // --------------------------------------------------------------------------
  console.log('Suite 1: overviewService.getOverviewData()');
  
  await runTest('overviewService', 'Returns valid data structure with non-null values', async () => {
    const data = await overviewService.getOverviewData();
    assert(data !== null && typeof data === 'object', 'Overview data should be a non-null object');
    
    // Core identity and greeting
    assert(typeof data.greeting === 'string' && data.greeting.length > 0, 'Greeting should be non-empty string');
    assert(typeof data.userName === 'string' && data.userName.length > 0, 'UserName should be non-empty string');
    assert(['steady', 'reconciling', 'attention'].includes(data.systemStatus), 'System status should be valid enum');
    assert(typeof data.dateDisplay === 'string' && data.dateDisplay.length > 0, 'DateDisplay should be non-empty string');

    // Financial aggregates
    assert(typeof data.totalLiquidity === 'number' && !isNaN(data.totalLiquidity), 'TotalLiquidity should be valid number');
    assert(typeof data.monthlyInflow === 'number' && data.monthlyInflow > 0, 'MonthlyInflow should be positive number');
    assert(typeof data.totalExpenses === 'number' && data.totalExpenses > 0, 'TotalExpenses should be positive number');
    assert(typeof data.netRetained === 'number', 'NetRetained should be valid number');
    assert(typeof data.retentionRatePercent === 'number', 'RetentionRatePercent should be valid number');
    assert(data.currency === 'INR', 'Currency should be INR');

    // Mathematical integrity of aggregates
    const expectedNetRetained = data.monthlyInflow - data.totalExpenses;
    assert(data.netRetained === expectedNetRetained, `NetRetained (${data.netRetained}) must match monthlyInflow - totalExpenses (${expectedNetRetained})`);
    
    const expectedRetentionRate = Number(((data.netRetained / data.monthlyInflow) * 100).toFixed(1));
    assert(data.retentionRatePercent === expectedRetentionRate, `RetentionRate (${data.retentionRatePercent}) must match netRetained / monthlyInflow (${expectedRetentionRate})`);

    // Array datasets
    assert(Array.isArray(data.outflowSectors) && data.outflowSectors.length > 0, 'OutflowSectors should be non-empty array');
    assert(Array.isArray(data.budgetEnvelopes) && data.budgetEnvelopes.length > 0, 'BudgetEnvelopes should be non-empty array');
    assert(Array.isArray(data.dailyTasks) && data.dailyTasks.length > 0, 'DailyTasks should be non-empty array');
    assert(Array.isArray(data.todayDebits) && data.todayDebits.length > 0, 'TodayDebits should be non-empty array');
    
    // Mindset goal anchor
    assert(data.mindsetGoal !== null && typeof data.mindsetGoal === 'object', 'MindsetGoal should be non-null object');
    assert(typeof data.mindsetGoal.goalTitle === 'string', 'GoalTitle should be valid string');
    assert(data.mindsetGoal.targetAmount > 0, 'TargetAmount should be > 0');
    assert(data.mindsetGoal.currentAmount > 0, 'CurrentAmount should be > 0');
    assert(data.mindsetGoal.achievedPercentage === Math.round((data.mindsetGoal.currentAmount / data.mindsetGoal.targetAmount) * 100), 'Achieved percentage should match ratio');
  });

  await runTest('overviewService', 'Returns deep clone to prevent direct state mutation', async () => {
    const data1 = await overviewService.getOverviewData();
    data1.totalLiquidity = 999999;
    const data2 = await overviewService.getOverviewData();
    assert(data2.totalLiquidity !== 999999, 'Modifying returned overview object must not mutate internal state store');
  });

  // --------------------------------------------------------------------------
  // Suite 2: overviewService.toggleTask() State Transitions
  // --------------------------------------------------------------------------
  console.log('\nSuite 2: overviewService.toggleTask() & Tasks');

  await runTest('overviewService', 'Flips task completion status and updates completed count', async () => {
    await overviewService.resetState();
    const initialData = await overviewService.getOverviewData();
    const initialCompletedCount = initialData.dailyTasks.filter((t) => t.isCompleted).length;

    // Find incomplete task
    const incompleteTask = initialData.dailyTasks.find((t) => !t.isCompleted);
    assert(incompleteTask !== undefined, 'Should have at least one uncompleted task for test');
    const taskId = incompleteTask!.id;

    // Toggle incomplete -> completed
    const updatedTask = await overviewService.toggleTask(taskId);
    assert(updatedTask.id === taskId, 'Toggled task ID should match');
    assert(updatedTask.isCompleted === true, 'Task should now be completed');
    assert(typeof updatedTask.completedAt === 'string', 'completedAt timestamp should be set');
    assert(updatedTask.dueInfo?.startsWith('Completed'), 'dueInfo should reflect completion');

    // Verify overview state reflects the new count
    const dataAfterToggle = await overviewService.getOverviewData();
    const newCompletedCount = dataAfterToggle.dailyTasks.filter((t) => t.isCompleted).length;
    assert(newCompletedCount === initialCompletedCount + 1, `Completed count should increment by 1 (was ${initialCompletedCount}, now ${newCompletedCount})`);

    // Toggle completed -> incomplete
    const revertedTask = await overviewService.toggleTask(taskId);
    assert(revertedTask.isCompleted === false, 'Task should revert to incomplete');
    assert(revertedTask.completedAt === undefined, 'completedAt should be cleared');

    const dataAfterRevert = await overviewService.getOverviewData();
    const revertedCount = dataAfterRevert.dailyTasks.filter((t) => t.isCompleted).length;
    assert(revertedCount === initialCompletedCount, `Completed count should return to initial ${initialCompletedCount}`);
  });

  await runTest('overviewService', 'Throws error when toggling non-existent task ID', async () => {
    let thrown = false;
    try {
      await overviewService.toggleTask('invalid-task-id-xyz');
    } catch (err: unknown) {
      thrown = true;
      assert((err as Error).message.includes('not found'), 'Error message should indicate task was not found');
    }
    assert(thrown, 'Should throw error when toggling non-existent task');
  });

  await runTest('overviewService', 'addTask prepends new task and increments task list', async () => {
    const beforeData = await overviewService.getOverviewData();
    const initialLength = beforeData.dailyTasks.length;

    const newTask = await overviewService.addTask({
      title: 'Review Challenger Security Harness',
      category: 'work',
      categoryLabel: 'Engineering',
      priority: 'high',
      isCompleted: false,
      dueInfo: 'Due 5:00 PM',
    });

    assert(newTask.id.startsWith('task-'), 'New task should have generated id');
    assert(newTask.title === 'Review Challenger Security Harness', 'Title should match');
    assert(typeof newTask.createdAt === 'string', 'createdAt should be set');

    const afterData = await overviewService.getOverviewData();
    assert(afterData.dailyTasks.length === initialLength + 1, 'Task count should increase by 1');
    assert(afterData.dailyTasks[0].id === newTask.id, 'New task should be unshifted to the front');
  });

  await runTest('overviewService', 'updateBudgetEnvelope recalculates burnPercentage and burnRateStatus', async () => {
    const data = await overviewService.getOverviewData();
    const targetEnvelope = data.budgetEnvelopes[0];

    // Set allocated amount higher than spent (normal burn rate, e.g. 30000 -> 65%)
    const updated = await overviewService.updateBudgetEnvelope(targetEnvelope.id, 30000);
    assert(updated.allocatedAmount === 30000, 'Allocated amount updated');
    assert(updated.burnPercentage === 65.0, `Burn percentage should be 65.0, got ${updated.burnPercentage}`);
    assert(updated.bufferRemaining === 10500, `Buffer remaining should be 10500, got ${updated.bufferRemaining}`);
    assert(updated.burnRateStatus === 'normal', `Status should be normal, got ${updated.burnRateStatus}`);

    // Set allocated to trigger 'alert' (e.g. 21000 -> 19500/21000 = 92.9%)
    const alertUpdated = await overviewService.updateBudgetEnvelope(targetEnvelope.id, 21000);
    assert(alertUpdated.burnRateStatus === 'alert', `Status should be alert, got ${alertUpdated.burnRateStatus}`);

    // Set allocated lower than spent to trigger 'exceeded' (e.g. 15000 -> 130%)
    const exceededUpdated = await overviewService.updateBudgetEnvelope(targetEnvelope.id, 15000);
    assert(exceededUpdated.burnRateStatus === 'exceeded', `Status should be exceeded, got ${exceededUpdated.burnRateStatus}`);
    assert(exceededUpdated.bufferRemaining === 0, 'Buffer remaining cannot be negative, should clamp to 0');
  });

  // --------------------------------------------------------------------------
  // Suite 3: financeService.getAccounts() Contract Verification
  // --------------------------------------------------------------------------
  console.log('\nSuite 3: financeService.getAccounts()');

  await runTest('financeService', 'Returns accounts with valid balances and required fields', async () => {
    await financeService.resetState();
    const accounts = await financeService.getAccounts();
    assert(Array.isArray(accounts) && accounts.length === 4, `Should return 4 accounts, got ${accounts.length}`);

    for (const acc of accounts) {
      assert(typeof acc.id === 'string' && acc.id.length > 0, 'Account ID must be valid');
      assert(typeof acc.name === 'string' && acc.name.length > 0, 'Account name must be valid');
      assert(['checking', 'cash', 'savings', 'credit'].includes(acc.type), `Account type invalid: ${acc.type}`);
      assert(typeof acc.balance === 'number' && !isNaN(acc.balance), `Account balance must be a number: ${acc.balance}`);
      assert(acc.currency === 'INR', 'Account currency must be INR');
      assert(['active', 'reconciled', 'archived'].includes(acc.status), `Account status invalid: ${acc.status}`);
      assert(acc.accountNumberMasked.includes('••'), 'Account number should be masked');
    }

    // Verify net capital sum matches mockOverviewData.totalLiquidity
    // Operating Checking (42500) + Physical Vault (15200) + High-Yield Vault (40000) - Amex (-18500) = 79200
    const totalCapital = accounts.reduce((acc, a) => acc + a.balance, 0);
    assert(totalCapital === mockOverviewData.totalLiquidity, `Net capital sum across accounts (${totalCapital}) must match totalLiquidity (${mockOverviewData.totalLiquidity})`);
  });

  // --------------------------------------------------------------------------
  // Suite 4: financeService.getTransactions() Filtering, Sorting, Pagination
  // --------------------------------------------------------------------------
  console.log('\nSuite 4: financeService.getTransactions() Filtering & Sorting');

  await runTest('financeService', 'Default criteria returns paginated response with accurate count', async () => {
    const res = await financeService.getTransactions({});
    assert(res.totalCount === 13, `Default totalCount should be 13, got ${res.totalCount}`);
    assert(res.transactions.length === 8, `Default pageSize should be 8, got ${res.transactions.length}`);
    assert(res.page === 1, 'Default page should be 1');
    assert(res.totalPages === 2, `Total pages should be 2 for 13 items with pageSize 8, got ${res.totalPages}`);
    assert(res.summary.totalInflow > 0, 'Summary totalInflow should be positive');
    assert(res.summary.totalOutflow > 0, 'Summary totalOutflow should be positive');
    assert(res.summary.netChange === res.summary.totalInflow - res.summary.totalOutflow, 'netChange must equal totalInflow - totalOutflow');
  });

  await runTest('financeService', 'Filters by category accurately', async () => {
    const res = await financeService.getTransactions({ category: 'food_dining', pageSize: 100 });
    assert(res.totalCount === 2, `Expected 2 food_dining transactions, got ${res.totalCount}`);
    for (const tx of res.transactions) {
      assert(tx.category === 'food_dining', `Transaction category should be food_dining, got ${tx.category}`);
    }
  });

  await runTest('financeService', 'Filters by account accurately', async () => {
    const targetAccountId = 'acc-amex-1042';
    const res = await financeService.getTransactions({ accountId: targetAccountId, pageSize: 100 });
    assert(res.totalCount === 5, `Expected 5 Amex transactions, got ${res.totalCount}`);
    for (const tx of res.transactions) {
      assert(tx.accountId === targetAccountId, `Transaction accountId should be ${targetAccountId}`);
    }
  });

  await runTest('financeService', 'Filters by flowType accurately', async () => {
    const inflowRes = await financeService.getTransactions({ flowType: 'inflow', pageSize: 100 });
    assert(inflowRes.totalCount === 2, `Expected 2 inflow transactions, got ${inflowRes.totalCount}`);
    for (const tx of inflowRes.transactions) {
      assert(tx.flowType === 'inflow', 'flowType should be inflow');
      assert(tx.amount > 0, 'inflow amount must be positive');
    }

    const outflowRes = await financeService.getTransactions({ flowType: 'outflow', pageSize: 100 });
    assert(outflowRes.totalCount === 11, `Expected 11 outflow transactions, got ${outflowRes.totalCount}`);
    for (const tx of outflowRes.transactions) {
      assert(tx.flowType === 'outflow', 'flowType should be outflow');
      assert(tx.amount < 0, 'outflow amount must be negative');
    }
  });

  await runTest('financeService', 'Filters by search query case-insensitively across payee, note, category, and account', async () => {
    // Search payee
    const resPayee = await financeService.getTransactions({ searchQuery: 'blue tokai' });
    assert(resPayee.totalCount === 1, `Expected 1 match for Blue Tokai, got ${resPayee.totalCount}`);
    assert(resPayee.transactions[0].payeeOrPayer === 'Blue Tokai Coffee Roasters', 'Matched correct payee');

    // Search note
    const resNote = await financeService.getTransactions({ searchQuery: 'acoustic equipment' });
    assert(resNote.totalCount === 1, `Expected 1 match for note, got ${resNote.totalCount}`);

    // Search account name
    const resAccount = await financeService.getTransactions({ searchQuery: 'Physical Vault', pageSize: 100 });
    assert(resAccount.totalCount === 1, `Expected 1 match for Physical Vault, got ${resAccount.totalCount}`);

    // Search non-existent query
    const resEmpty = await financeService.getTransactions({ searchQuery: 'nonexistent_qwerty_xyz' });
    assert(resEmpty.totalCount === 0, `Expected 0 matches, got ${resEmpty.totalCount}`);
    assert(resEmpty.transactions.length === 0, 'Transactions array should be empty');
  });

  await runTest('financeService', 'Sorts transactions by date and amount ascending and descending', async () => {
    // Date desc (default)
    const dateDesc = await financeService.getTransactions({ sortBy: 'date_desc', pageSize: 100 });
    for (let i = 1; i < dateDesc.transactions.length; i++) {
      const prev = `${dateDesc.transactions[i - 1].date} ${dateDesc.transactions[i - 1].time}`;
      const curr = `${dateDesc.transactions[i].date} ${dateDesc.transactions[i].time}`;
      assert(prev.localeCompare(curr) >= 0, `date_desc sort order violated: ${prev} vs ${curr}`);
    }

    // Date asc
    const dateAsc = await financeService.getTransactions({ sortBy: 'date_asc', pageSize: 100 });
    for (let i = 1; i < dateAsc.transactions.length; i++) {
      const prev = `${dateAsc.transactions[i - 1].date} ${dateAsc.transactions[i - 1].time}`;
      const curr = `${dateAsc.transactions[i].date} ${dateAsc.transactions[i].time}`;
      assert(prev.localeCompare(curr) <= 0, `date_asc sort order violated: ${prev} vs ${curr}`);
    }

    // Amount desc (by absolute magnitude)
    const amtDesc = await financeService.getTransactions({ sortBy: 'amount_desc', pageSize: 100 });
    for (let i = 1; i < amtDesc.transactions.length; i++) {
      const prev = Math.abs(amtDesc.transactions[i - 1].amount);
      const curr = Math.abs(amtDesc.transactions[i].amount);
      assert(prev >= curr, `amount_desc sort order violated: ${prev} vs ${curr}`);
    }
  });

  await runTest('financeService', 'Handles pagination boundary conditions and page clamping', async () => {
    // Request page 999: should clamp to safePage = totalPages (2)
    const clampedRes = await financeService.getTransactions({ page: 999, pageSize: 8 });
    assert(clampedRes.page === 2, `Should clamp page 999 to 2, got ${clampedRes.page}`);
    assert(clampedRes.transactions.length === 5, `Page 2 of 13 with pageSize 8 should have 5 items, got ${clampedRes.transactions.length}`);

    // Request negative/zero page: should clamp to safePage = 1
    const minClampedRes = await financeService.getTransactions({ page: 0, pageSize: 8 });
    assert(minClampedRes.page === 1, `Should clamp page 0 to 1, got ${minClampedRes.page}`);
  });

  // --------------------------------------------------------------------------
  // Suite 5: financeService.recordTransaction() Mutation & Balance Logic
  // --------------------------------------------------------------------------
  console.log('\nSuite 5: financeService.recordTransaction() & Balance Updates');

  await runTest('financeService', 'Records outflow (spent) and deducts from account balance', async () => {
    await financeService.resetState();
    const initialAccounts = await financeService.getAccounts();
    const hdfcBefore = initialAccounts.find((a) => a.id === 'acc-hdfc-4092')!;
    const initialBalance = hdfcBefore.balance; // 42500

    const tx = await financeService.recordTransaction({
      intent: 'spent',
      amount: 2500,
      currency: 'INR',
      category: 'shopping_gear',
      accountId: 'acc-hdfc-4092',
      date: '2026-10-01',
      memo: 'Mechanical Keyboard Studio',
    });

    assert(tx.amount === -2500, `Recorded amount should be -2500, got ${tx.amount}`);
    assert(tx.flowType === 'outflow', `FlowType should be outflow, got ${tx.flowType}`);
    assert(tx.categoryLabel === 'Shopping & Gear', `CategoryLabel should be Shopping & Gear, got ${tx.categoryLabel}`);
    assert(tx.payeeOrPayer === 'Mechanical Keyboard Studio', 'Payee should match memo');

    // Verify account balance deducted
    const accountsAfter = await financeService.getAccounts();
    const hdfcAfter = accountsAfter.find((a) => a.id === 'acc-hdfc-4092')!;
    assert(hdfcAfter.balance === initialBalance - 2500, `HDFC balance should be ${initialBalance - 2500}, got ${hdfcAfter.balance}`);

    // Verify transaction appears in getTransactions
    const ledger = await financeService.getTransactions({ pageSize: 1 });
    assert(ledger.transactions[0].id === tx.id, 'New transaction should be at head of ledger');
  });

  await runTest('financeService', 'Records inflow (received) and credits account balance', async () => {
    const initialAccounts = await financeService.getAccounts();
    const hdfcBefore = initialAccounts.find((a) => a.id === 'acc-hdfc-4092')!;
    const initialBalance = hdfcBefore.balance;

    const tx = await financeService.recordTransaction({
      intent: 'received',
      amount: 10000,
      currency: 'INR',
      category: 'consulting_inflow',
      accountId: 'acc-hdfc-4092',
      date: '2026-10-01',
      memo: 'Advisory Bonus',
    });

    assert(tx.amount === 10000, `Recorded amount should be +10000, got ${tx.amount}`);
    assert(tx.flowType === 'inflow', `FlowType should be inflow, got ${tx.flowType}`);

    const accountsAfter = await financeService.getAccounts();
    const hdfcAfter = accountsAfter.find((a) => a.id === 'acc-hdfc-4092')!;
    assert(hdfcAfter.balance === initialBalance + 10000, `HDFC balance should be ${initialBalance + 10000}, got ${hdfcAfter.balance}`);
  });

  await runTest('financeService', 'Records transfer (moved) and adjusts both source and destination accounts', async () => {
    const initialAccounts = await financeService.getAccounts();
    const hdfcBefore = initialAccounts.find((a) => a.id === 'acc-hdfc-4092')!;
    const vaultBefore = initialAccounts.find((a) => a.id === 'acc-vault-0012')!;

    const tx = await financeService.recordTransaction({
      intent: 'moved',
      amount: 3000,
      currency: 'INR',
      category: 'other',
      accountId: 'acc-hdfc-4092',
      destinationAccountId: 'acc-vault-0012',
      date: '2026-10-01',
      memo: 'Vault reserve cash transfer',
    });

    assert(tx.amount === -3000, 'Source transaction amount should be -3000');
    assert(tx.flowType === 'transfer', 'FlowType should be transfer');

    const accountsAfter = await financeService.getAccounts();
    const hdfcAfter = accountsAfter.find((a) => a.id === 'acc-hdfc-4092')!;
    const vaultAfter = accountsAfter.find((a) => a.id === 'acc-vault-0012')!;

    assert(hdfcAfter.balance === hdfcBefore.balance - 3000, `Source account balance should decrease by 3000 (was ${hdfcBefore.balance}, now ${hdfcAfter.balance})`);
    assert(vaultAfter.balance === vaultBefore.balance + 3000, `Destination account balance should increase by 3000 (was ${vaultBefore.balance}, now ${vaultAfter.balance})`);
  });

  await runTest('financeService', 'Normalizes negative amount input via Math.abs', async () => {
    const initialAccounts = await financeService.getAccounts();
    const hdfcBefore = initialAccounts.find((a) => a.id === 'acc-hdfc-4092')!;

    // Pass negative amount -500 with intent 'spent'
    const tx = await financeService.recordTransaction({
      intent: 'spent',
      amount: -500,
      currency: 'INR',
      category: 'food_dining',
      accountId: 'acc-hdfc-4092',
      date: '2026-10-01',
      memo: 'Espresso Bar',
    });

    assert(tx.amount === -500, `Amount should normalize to -500, got ${tx.amount}`);
    const accountsAfter = await financeService.getAccounts();
    const hdfcAfter = accountsAfter.find((a) => a.id === 'acc-hdfc-4092')!;
    assert(hdfcAfter.balance === hdfcBefore.balance - 500, `Balance should decrease by 500`);
  });

  // --------------------------------------------------------------------------
  // Suite 6: financeService.getCashflowVelocity() Retention & Hotspots
  // --------------------------------------------------------------------------
  console.log('\nSuite 6: financeService.getCashflowVelocity()');

  await runTest('financeService', 'Calculates retention rate correctly and returns valid hotspots', async () => {
    const velocity = await financeService.getCashflowVelocity();
    assert(velocity !== null && typeof velocity === 'object', 'Velocity should be an object');
    assert(velocity.totalInflow > 0, 'totalInflow should be > 0');
    assert(velocity.totalOutflow > 0, 'totalOutflow should be > 0');
    
    // Check net savings
    const expectedSavings = velocity.totalInflow - velocity.totalOutflow;
    assert(velocity.netSavings === expectedSavings, `netSavings (${velocity.netSavings}) must equal inflow - outflow (${expectedSavings})`);

    // Check retention rate formula: (netSavings / totalInflow) * 100
    const calculatedRate = Number(((velocity.netSavings / velocity.totalInflow) * 100).toFixed(1));
    assert(velocity.retentionRate === calculatedRate, `retentionRate (${velocity.retentionRate}) must match calculated retention rate (${calculatedRate})`);

    // Hotspots validation
    assert(Array.isArray(velocity.hotspots) && velocity.hotspots.length > 0, 'Hotspots should be non-empty array');
    for (const h of velocity.hotspots) {
      assert(typeof h.id === 'string' && h.id.length > 0, 'Hotspot ID must be non-empty string');
      assert(typeof h.title === 'string' && h.title.length > 0, 'Hotspot title must be non-empty string');
      assert(['info', 'warning', 'critical'].includes(h.severity), `Invalid hotspot severity: ${h.severity}`);
    }
  });

  // --------------------------------------------------------------------------
  // Suite 7: financeService.exportLedgerToCsv() Format & Escaping
  // --------------------------------------------------------------------------
  console.log('\nSuite 7: financeService.exportLedgerToCsv()');

  await runTest('financeService', 'Outputs RFC-4180 compliant CSV content with matching rows', async () => {
    await financeService.resetState();
    const csv = await financeService.exportLedgerToCsv();
    assert(typeof csv === 'string' && csv.length > 0, 'CSV output must be non-empty string');

    const lines = csv.split('\n');
    assert(lines.length === 14, `Expected 1 header + 13 transactions = 14 lines, got ${lines.length}`);

    // Verify header line
    const expectedHeader = 'Transaction ID,Date,Time,Account,Payee / Payer,Category,Flow Type,Amount,Currency,Payment Method,Status,Note';
    assert(lines[0] === expectedHeader, `Header does not match expected format.\nExpected: ${expectedHeader}\nGot: ${lines[0]}`);

    // Verify each line has proper column count and formatting
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      assert(line.startsWith('"tx-'), `Line ${i} should start with quoted transaction ID: ${line}`);
      assert(line.includes('"INR"'), `Line ${i} should include currency "INR"`);
    }
  });

  await runTest('financeService', 'exportLedgerToCsv respects filter criteria', async () => {
    const filteredCsv = await financeService.exportLedgerToCsv({ category: 'food_dining' });
    const lines = filteredCsv.split('\n');
    assert(lines.length === 3, `Expected 1 header + 2 food_dining txs = 3 lines, got ${lines.length}`);
  });

  // --------------------------------------------------------------------------
  // Final Test Summary & Evaluation
  // --------------------------------------------------------------------------
  console.log('\n================================================================');
  const total = results.length;
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;

  console.log(`TOTAL TESTS: ${total}`);
  console.log(`PASSED: ${passed}`);
  console.log(`FAILED: ${failed}`);
  console.log('================================================================');

  if (failed > 0) {
    console.error(`\nFAILED TEST DETAILS:`);
    for (const r of results.filter((r) => !r.passed)) {
      console.error(`- [${r.suite}] ${r.name}: ${r.error}`);
    }
    process.exit(1);
  } else {
    console.log('\nALL EMPIRICAL ASSERTIONS PASSED PERFECTLY!');
    process.exit(0);
  }
}

runAllTests().catch((e) => {
  console.error('Fatal test error:', e);
  process.exit(1);
});
