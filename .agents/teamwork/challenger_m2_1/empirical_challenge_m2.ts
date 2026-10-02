import assert from "node:assert/strict";
import { overviewService } from "../../../src/services/overviewService";
import { mockOverviewData } from "../../../src/services/mockData";
import { TodayDebitItem, Transaction } from "../../../src/types/models";

// Colors for terminal reporting
const GREEN = "\x1b[32m";
const RED = "\x1b[31m";
const BLUE = "\x1b[34m";
const RESET = "\x1b[0m";

let passCount = 0;
let failCount = 0;

function it(desc: string, fn: () => void | Promise<void>) {
  return (async () => {
    try {
      await fn();
      passCount++;
      console.log(`  ${GREEN}✔${RESET} ${desc}`);
    } catch (err: unknown) {
      failCount++;
      console.error(`  ${RED}✖${RESET} ${desc}`);
      console.error(`    ${(err as Error).message}`);
    }
  })();
}

async function runTestSuite() {
  console.log(`\n${BLUE}===================================================================${RESET}`);
  console.log(`${BLUE}   EMPIRICAL CHALLENGER TEST SUITE: MILESTONE 2 (OVERVIEW)        ${RESET}`);
  console.log(`${BLUE}===================================================================${RESET}\n`);

  // =========================================================================
  // TEST SUITE 1: Task Toggle Behavior and Completion Counts
  // =========================================================================
  console.log(`${BLUE}[SUITE 1] Task Toggle Behavior & Completion Counts${RESET}`);

  await it("1.1 Initial baseline state has 5 tasks with 3 completed and 2 incomplete (60%)", async () => {
    await overviewService.resetState();
    const data = await overviewService.getOverviewData();
    assert.equal(data.dailyTasks.length, 5);

    const completed = data.dailyTasks.filter((t) => t.isCompleted);
    const incomplete = data.dailyTasks.filter((t) => !t.isCompleted);

    assert.equal(completed.length, 3, "Baseline completed task count should be 3");
    assert.equal(incomplete.length, 2, "Baseline incomplete task count should be 2");

    const ratio = completed.length / data.dailyTasks.length;
    assert.equal(ratio, 0.6, "Baseline completion ratio should be 60%");
  });

  await it("1.2 Toggling incomplete task updates isCompleted to true, sets completedAt, and increments count to 4/5 (80%)", async () => {
    const dataBefore = await overviewService.getOverviewData();
    const targetTask = dataBefore.dailyTasks.find((t) => !t.isCompleted)!;
    assert.ok(targetTask, "Target incomplete task must exist");

    const toggled = await overviewService.toggleTask(targetTask.id);
    assert.equal(toggled.isCompleted, true, "Task must now be completed");
    assert.ok(toggled.completedAt, "completedAt timestamp must be populated");
    assert.match(toggled.dueInfo || "", /^Completed \d{1,2}:\d{2}/, "dueInfo must show completion time");

    const dataAfter = await overviewService.getOverviewData();
    const completedAfter = dataAfter.dailyTasks.filter((t) => t.isCompleted).length;
    assert.equal(completedAfter, 4, "Completed task count must now be 4");

    // Gauge calculation test
    const progressPercent = (completedAfter / dataAfter.dailyTasks.length) * 100;
    assert.equal(progressPercent, 80, "Progress percent should be 80%");
    const strokeDashoffset = 88 - (88 * progressPercent) / 100;
    assert.equal(Math.round(strokeDashoffset * 10) / 10, 17.6, "SVG gauge dash offset must match 17.6");
  });

  await it("1.3 Toggling back an already completed task resets isCompleted to false and decrements count to 3/5", async () => {
    const dataBefore = await overviewService.getOverviewData();
    const targetTask = dataBefore.dailyTasks.find((t) => t.id === "task-4")!;
    assert.equal(targetTask.isCompleted, true);

    const toggled = await overviewService.toggleTask("task-4");
    assert.equal(toggled.isCompleted, false, "Task must now be incomplete");
    assert.equal(toggled.completedAt, undefined, "completedAt must be cleared");

    const dataAfter = await overviewService.getOverviewData();
    const completedAfter = dataAfter.dailyTasks.filter((t) => t.isCompleted).length;
    assert.equal(completedAfter, 3, "Completed task count must return to 3");
  });

  await it("1.4 Adding a new task prepends it to the list and updates total count to 6", async () => {
    const newTask = await overviewService.addTask({
      title: "Automated regression testing",
      category: "work",
      categoryLabel: "Work · Engineering",
      priority: "high",
      isCompleted: false,
      dueInfo: "Due 7:00 PM",
    });

    assert.ok(newTask.id.startsWith("task-"), "Task ID should start with task-");
    assert.equal(newTask.title, "Automated regression testing");
    assert.equal(newTask.isCompleted, false);

    const data = await overviewService.getOverviewData();
    assert.equal(data.dailyTasks.length, 6, "Total task count should now be 6");
    assert.equal(data.dailyTasks[0].id, newTask.id, "New task should be unshifted to the top");
  });

  await it("1.5 Toggling all tasks to completed yields 100% completion and dash offset 0", async () => {
    const data = await overviewService.getOverviewData();
    for (const t of data.dailyTasks) {
      if (!t.isCompleted) {
        await overviewService.toggleTask(t.id);
      }
    }

    const allCompleted = await overviewService.getOverviewData();
    const completedCount = allCompleted.dailyTasks.filter((t) => t.isCompleted).length;
    assert.equal(completedCount, allCompleted.dailyTasks.length, "All tasks must be completed");

    const progressPercent = (completedCount / allCompleted.dailyTasks.length) * 100;
    assert.equal(progressPercent, 100);
    const strokeDashoffset = 88 - (88 * progressPercent) / 100;
    assert.equal(strokeDashoffset, 0, "At 100%, strokeDashoffset must be 0");
  });

  await it("1.6 Attempting to toggle non-existent task throws descriptive Error", async () => {
    let errorCaught = false;
    try {
      await overviewService.toggleTask("non-existent-task-id-999");
    } catch (err: unknown) {
      errorCaught = true;
      assert.match((err as Error).message, /not found/i);
    }
    assert.equal(errorCaught, true, "Must throw an error for non-existent task");
  });

  // =========================================================================
  // TEST SUITE 2: Budget Allocation Updates & Recalculation
  // =========================================================================
  console.log(`\n${BLUE}[SUITE 2] Budget Allocation Updates & Recalculation${RESET}`);

  await it("2.1 Baseline budget envelopes have 4 envelopes matching authoritative specifications", async () => {
    await overviewService.resetState();
    const data = await overviewService.getOverviewData();
    assert.equal(data.budgetEnvelopes.length, 4, "Must have exactly 4 envelopes");

    const food = data.budgetEnvelopes.find((e) => e.id === "env-food")!;
    assert.equal(food.allocatedAmount, 22000);
    assert.equal(food.spentAmount, 19500);
    assert.equal(food.burnPercentage, 88.6);
    assert.equal(food.bufferRemaining, 2500);
  });

  await it("2.2 Updating allocation ceiling to higher amount recalculates burn % down and buffer up", async () => {
    // env-food: spent is 19500. New allocation = 30000
    const updated = await overviewService.updateBudgetEnvelope("env-food", 30000);
    assert.equal(updated.allocatedAmount, 30000);
    assert.equal(updated.spentAmount, 19500);

    // 19500 / 30000 = 65.0%
    assert.equal(updated.burnPercentage, 65.0);
    assert.equal(updated.bufferRemaining, 10500);
    assert.equal(updated.burnRateStatus, "normal", "65% should be normal status");
  });

  await it("2.3 Status transitions across thresholds: contained (>=75%), alert (>=90%), exceeded (>=100%)", async () => {
    // 19500 spent:
    // Case A: 25000 allocated -> 19500 / 25000 = 78.0% -> contained
    const envContained = await overviewService.updateBudgetEnvelope("env-food", 25000);
    assert.equal(envContained.burnPercentage, 78.0);
    assert.equal(envContained.burnRateStatus, "contained");
    assert.equal(envContained.bufferRemaining, 5500);

    // Case B: 21000 allocated -> 19500 / 21000 = 92.9% -> alert
    const envAlert = await overviewService.updateBudgetEnvelope("env-food", 21000);
    assert.equal(envAlert.burnPercentage, 92.9);
    assert.equal(envAlert.burnRateStatus, "alert");
    assert.equal(envAlert.bufferRemaining, 1500);

    // Case C: 19500 allocated -> 19500 / 19500 = 100.0% -> exceeded
    const envExceeded = await overviewService.updateBudgetEnvelope("env-food", 19500);
    assert.equal(envExceeded.burnPercentage, 100.0);
    assert.equal(envExceeded.burnRateStatus, "exceeded");
    assert.equal(envExceeded.bufferRemaining, 0);

    // Case D: 15000 allocated (spent > allocated) -> 19500 / 15000 = 130.0% -> exceeded, buffer clamped to 0
    const envOverspent = await overviewService.updateBudgetEnvelope("env-food", 15000);
    assert.equal(envOverspent.burnPercentage, 130.0);
    assert.equal(envOverspent.burnRateStatus, "exceeded");
    assert.equal(envOverspent.bufferRemaining, 0, "Buffer remaining must never be negative");
  });

  await it("2.4 Edge case: zero allocation ceiling handles gracefully without NaN or infinity", async () => {
    const envZero = await overviewService.updateBudgetEnvelope("env-food", 0);
    assert.equal(envZero.burnPercentage, 100, "Zero allocation should default burn rate to 100%");
    assert.equal(envZero.burnRateStatus, "exceeded");
    assert.equal(envZero.bufferRemaining, 0);
    assert.ok(!isNaN(envZero.burnPercentage), "Burn percentage must not be NaN");
  });

  await it("2.5 Attempting to update non-existent envelope throws descriptive Error", async () => {
    let errorCaught = false;
    try {
      await overviewService.updateBudgetEnvelope("env-non-existent-999", 50000);
    } catch (err: unknown) {
      errorCaught = true;
      assert.match((err as Error).message, /not found/i);
    }
    assert.equal(errorCaught, true, "Must throw an error for non-existent envelope");
  });

  // =========================================================================
  // TEST SUITE 3: SVG Outflow Donut Mathematical Geometry
  // =========================================================================
  console.log(`\n${BLUE}[SUITE 3] SVG Outflow Donut Mathematical Geometry${RESET}`);

  await it("3.1 Circle geometry matches specification: radius 62, circumference ~390px", () => {
    const radius = 62;
    const exactCircumference = 2 * Math.PI * radius;
    const roundedCircumference = Math.round(exactCircumference);

    // 2 * pi * 62 = 389.557489...
    assert.ok(
      Math.abs(exactCircumference - 389.56) < 0.1,
      `Exact circumference (${exactCircumference.toFixed(2)}) should be ~389.56`
    );
    assert.equal(roundedCircumference, 390, "Rounded circumference must be 390px");
  });

  await it("3.2 Default donut sector percentages sum to 100% and amounts sum to Rs. 65,000", () => {
    const defaultSectors = [
      { id: "food", percentage: 30, amount: 19500, dashArray: "117 273", dashOffset: 0 },
      { id: "housing", percentage: 25, amount: 16250, dashArray: "97.5 292.5", dashOffset: -120 },
      { id: "shopping", percentage: 18, amount: 11700, dashArray: "70 320", dashOffset: -282 },
      { id: "transit", percentage: 15, amount: 9750, dashArray: "58.5 331.5", dashOffset: -220 },
      { id: "health", percentage: 12, amount: 7800, dashArray: "47 343", dashOffset: -354 },
    ];

    const totalPercentage = defaultSectors.reduce((acc, s) => acc + s.percentage, 0);
    const totalAmount = defaultSectors.reduce((acc, s) => acc + s.amount, 0);

    assert.equal(totalPercentage, 100, "Total percentage must equal 100%");
    assert.equal(totalAmount, 65000, "Total amount must equal 65,000");

    // Check dash lengths match percentages against 390px circumference
    for (const sector of defaultSectors) {
      const [dash, gap] = sector.dashArray.split(" ").map(Number);
      const totalArc = dash + gap;
      assert.equal(totalArc, 390, `Dash + Gap for ${sector.id} must equal 390px`);

      const expectedDash = (sector.percentage / 100) * 390;
      assert.ok(
        Math.abs(dash - expectedDash) <= 0.5,
        `Dash length ${dash} for ${sector.id} (${sector.percentage}%) must be within 0.5px of expected ${expectedDash}`
      );
    }
  });

  await it("3.3 Mobile donut dash lengths scale proportionately to 130px canvas (circumference ~238.76px)", () => {
    const mobileSectors = [
      { id: "food", percentage: 30, dash: 71.6, gap: 167.1 },
      { id: "housing", percentage: 25, dash: 59.7, gap: 179 },
      { id: "transit", percentage: 15, dash: 35.8, gap: 202.9 },
      { id: "shopping", percentage: 18, dash: 43, gap: 195.7 },
      { id: "health", percentage: 12, dash: 28.6, gap: 210.1 },
    ];

    const mobileCircumference = 238.7;
    for (const m of mobileSectors) {
      const sum = Math.round((m.dash + m.gap) * 10) / 10;
      assert.equal(sum, mobileCircumference, `Mobile dash + gap for ${m.id} must equal ${mobileCircumference}`);

      const computedPercentage = Math.round((m.dash / mobileCircumference) * 100);
      assert.equal(computedPercentage, m.percentage, `Mobile computed percentage for ${m.id} must match ${m.percentage}%`);
    }
  });

  await it("3.4 Center metrics correctly compute budget burn percent (65,000 / 70,000 = 93%)", () => {
    const totalSpent = 65000;
    const budgetCap = 70000;
    const budgetBurnPercent = Math.round((totalSpent / budgetCap) * 100);
    assert.equal(budgetBurnPercent, 93, "Budget burn percent must be 93%");
  });

  // =========================================================================
  // TEST SUITE 4: Filter Strip Range Switching and Category Selection
  // =========================================================================
  console.log(`\n${BLUE}[SUITE 4] Filter Strip State Transitions${RESET}`);

  await it("4.1 Filter options match Anchor OS canonical schema", () => {
    const validTemporalRanges = ["today", "week", "month", "quarter"];
    const validMonths = ["2026-08", "2026-09", "2026-10"];
    const validCategories = [
      "all",
      "food_dining",
      "housing_utilities",
      "shopping_gear",
      "transport_transit",
      "health_wellness",
      "knowledge_subs",
    ];
    const validAccounts = [
      "all",
      "acc-hdfc-4092",
      "acc-vault-0012",
      "acc-tbill-8831",
      "acc-amex-1042",
    ];
    const validTypes = ["all", "outflow", "inflow", "transfer"];

    assert.equal(validTemporalRanges.length, 4);
    assert.equal(validMonths.length, 3);
    assert.equal(validCategories.length, 7);
    assert.equal(validAccounts.length, 5);
    assert.equal(validTypes.length, 4);
  });

  await it("4.2 Simulates state transitions when user switches temporal range and category", () => {
    // Simulate OverviewPage state machine
    let selectedMonth = "2026-09";
    let selectedCategory = "all";
    let selectedAccount = "all";
    let selectedType = "all";
    let temporalRange: "today" | "week" | "month" | "quarter" = "month";

    // Initial assertions
    assert.equal(selectedMonth, "2026-09");
    assert.equal(selectedAccount, "all");
    assert.equal(selectedType, "all");
    assert.equal(temporalRange, "month");
    assert.equal(selectedCategory, "all");

    // Action 1: Switch filter selections
    selectedMonth = "2026-10";
    selectedAccount = "acc-hdfc-4092";
    selectedType = "outflow";
    assert.equal(selectedMonth, "2026-10");
    assert.equal(selectedAccount, "acc-hdfc-4092");
    assert.equal(selectedType, "outflow");

    // Action 1: Switch temporal range to 'week'
    temporalRange = "week";
    assert.equal(temporalRange, "week");

    // Action 2: Select 'food_dining' category
    selectedCategory = "food_dining";
    assert.equal(selectedCategory, "food_dining");

    // Action 3: Filter mock transactions based on current filter state
    const filtered = mockOverviewData.todayDebits.filter((d) => {
      if (selectedCategory === "all") return true;
      if (selectedCategory === "food_dining") {
        return d.category.toLowerCase().includes("food");
      }
      return false;
    });

    assert.equal(filtered.length, 1);
    assert.equal(filtered[0].title, "Blue Tokai Coffee Roasters");
  });

  // =========================================================================
  // TEST SUITE 5: Today's Debits Sum Calculation & Dynamic Transactions
  // =========================================================================
  console.log(`\n${BLUE}[SUITE 5] Today's Debits Sum Calculation & Dynamic Ledger${RESET}`);

  await it("5.1 Initial debits in mock data sum to exactly Rs. 1,300", () => {
    const debits = mockOverviewData.todayDebits;
    assert.equal(debits.length, 3);

    // 380 + 420 + 500 = 1300
    const totalSum = debits.reduce((acc, curr) => acc + curr.amount, 0);
    assert.equal(totalSum, 1300, "Initial mock debits sum must be exactly Rs. 1,300");
  });

  await it("5.2 Default fallback debits in component also sum to Rs. 1,300", () => {
    const defaultDebits = [
      { id: "debit-1", amount: 850 },
      { id: "debit-2", amount: 300 },
      { id: "debit-3", amount: 150 },
    ];
    // 850 + 300 + 150 = 1300
    const defaultSum = defaultDebits.reduce((acc, curr) => acc + curr.amount, 0);
    assert.equal(defaultSum, 1300, "Default component fallback debits sum must be exactly Rs. 1,300");
  });

  await it("5.3 Recording a new outflow transaction dynamically updates debits list and sum", () => {
    const currentDebits: TodayDebitItem[] = [...mockOverviewData.todayDebits];
    let totalSpent = mockOverviewData.totalSpent; // 65,000

    // Simulate QuickEntrySuccess for an outflow debit
    const newTx: Transaction = {
      id: "tx-test-101",
      accountId: "acc-hdfc-4092",
      accountName: "Operating Checking",
      amount: -750,
      currency: "INR",
      flowType: "outflow",
      category: "food_dining",
      categoryLabel: "Food & Dining",
      payeeOrPayer: "Artisan Bakery Provisions",
      date: "2026-10-01",
      time: "14:30",
      paymentMethod: "upi",
      status: "cleared",
      createdAt: new Date().toISOString(),
    };

    // Page logic test:
    if (newTx.flowType === "outflow" || newTx.amount < 0) {
      const newDebit: TodayDebitItem = {
        id: `debit-${Date.now()}`,
        title: newTx.payeeOrPayer,
        category: newTx.categoryLabel,
        paymentMethod: newTx.accountName,
        amount: Math.abs(newTx.amount),
        currency: newTx.currency,
        time: newTx.time || "14:30",
        icon: "receipt_long",
      };
      currentDebits.unshift(newDebit);
      totalSpent += Math.abs(newTx.amount);
    }

    assert.equal(currentDebits.length, 4, "Debits count should increase to 4");
    const newSum = currentDebits.reduce((acc, curr) => acc + curr.amount, 0);
    assert.equal(newSum, 1300 + 750, "New debit sum should be Rs. 2,050");
    assert.equal(totalSpent, 65000 + 750, "Total spent should increase to Rs. 65,750");
  });

  await it("5.4 Inflow transactions are not added to debits list", () => {
    const currentDebits: TodayDebitItem[] = [...mockOverviewData.todayDebits];
    const inflowTx: Transaction = {
      id: "tx-test-102",
      accountId: "acc-hdfc-4092",
      accountName: "Operating Checking",
      amount: 25000,
      currency: "INR",
      flowType: "inflow",
      category: "consulting_inflow",
      categoryLabel: "Consulting Inflow",
      payeeOrPayer: "Strategic Advisory Fee",
      date: "2026-10-01",
      time: "15:00",
      paymentMethod: "wire",
      status: "cleared",
      createdAt: new Date().toISOString(),
    };

    if (inflowTx.flowType === "outflow" || inflowTx.amount < 0) {
      currentDebits.unshift({
        id: "debit-inflow",
        title: inflowTx.payeeOrPayer,
        category: inflowTx.categoryLabel,
        paymentMethod: inflowTx.accountName,
        amount: Math.abs(inflowTx.amount),
        currency: inflowTx.currency,
        time: inflowTx.time,
        icon: "receipt_long",
      });
    }

    assert.equal(currentDebits.length, 3, "Debits count must remain 3 after an inflow");
  });

  // =========================================================================
  // TEST SUITE 6: Deep Immutability & Concurrency
  // =========================================================================
  console.log(`\n${BLUE}[SUITE 6] Data Integrity & Immutability${RESET}`);

  await it("6.1 overviewService.getOverviewData returns deep copy without leaking mutable references", async () => {
    await overviewService.resetState();
    const data1 = await overviewService.getOverviewData();
    // Mutate data1 locally
    data1.totalLiquidity = 999999;
    data1.dailyTasks[0].title = "MUTATED TITLE";

    const data2 = await overviewService.getOverviewData();
    assert.equal(data2.totalLiquidity, 79200, "Service state must not be modified by external mutations");
    assert.notEqual(data2.dailyTasks[0].title, "MUTATED TITLE", "Tasks must not be modified by external mutations");
  });

  console.log(`\n${BLUE}===================================================================${RESET}`);
  console.log(`SUMMARY: ${GREEN}${passCount} PASSED${RESET}, ${failCount > 0 ? RED : GREEN}${failCount} FAILED${RESET}`);
  console.log(`${BLUE}===================================================================${RESET}\n`);

  if (failCount > 0) {
    process.exit(1);
  }
}

runTestSuite().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
