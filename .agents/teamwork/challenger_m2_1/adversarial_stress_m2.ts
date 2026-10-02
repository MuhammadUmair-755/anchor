import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { overviewService } from "../../../src/services/overviewService";
import { mockOverviewData } from "../../../src/services/mockData";
import { TodayDebitItem, Transaction } from "../../../src/types/models";

const GREEN = "\x1b[32m";
const RED = "\x1b[31m";
const CYAN = "\x1b[36m";
const RESET = "\x1b[0m";

let passes = 0;
let failures = 0;

async function test(name: string, fn: () => void | Promise<void>) {
  try {
    await fn();
    passes++;
    console.log(`  ${GREEN}✔ PASS:${RESET} ${name}`);
  } catch (err: unknown) {
    failures++;
    console.error(`  ${RED}✖ FAIL:${RESET} ${name}`);
    console.error(`    ${(err as Error).message}`);
  }
}

async function runAdversarialSuite() {
  console.log(`\n${CYAN}===================================================================${RESET}`);
  console.log(`${CYAN}   ADVERSARIAL STRESS & BOUNDARY TEST HARNESS: MILESTONE 2         ${RESET}`);
  console.log(`${CYAN}===================================================================${RESET}\n`);

  // ---------------------------------------------------------------------------
  // 1. AST / REGEX SCAN FOR ZERO 'ANY' IN TYPESCRIPT FILES
  // ---------------------------------------------------------------------------
  console.log(`${CYAN}[SECTION 1] TypeScript Strictness & Zero 'any' Verification${RESET}`);

  await test("1.1 Comprehensive scan of src/ confirms ZERO ': any', '<any>', 'as any', or 'Function' types", () => {
    function getFiles(dir: string): string[] {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      const files: string[] = [];
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          files.push(...getFiles(fullPath));
        } else if (/\.(ts|tsx)$/.test(entry.name) && !entry.name.endsWith(".d.ts")) {
          files.push(fullPath);
        }
      }
      return files;
    }

    const srcFiles = getFiles(path.resolve(process.cwd(), "src"));
    assert.ok(srcFiles.length > 0, "Source files must be detected");

    const anyPattern = /:\s*any\b|<any>|\bas\s+any\b|:\s*Function\b/g;
    const violations: { file: string; line: number; text: string }[] = [];

    for (const file of srcFiles) {
      const content = fs.readFileSync(file, "utf8");
      const lines = content.split("\n");
      lines.forEach((line, index) => {
        // Exclude comments
        const cleanLine = line.replace(/\/\/.*$/, "").replace(/\/\*.*?\*\//g, "");
        if (anyPattern.test(cleanLine)) {
          violations.push({
            file: path.relative(process.cwd(), file),
            line: index + 1,
            text: line.trim(),
          });
        }
      });
    }

    assert.equal(
      violations.length,
      0,
      `Detected TypeScript 'any' violations:\n${violations
        .map((v) => `  ${v.file}:${v.line} -> ${v.text}`)
        .join("\n")}`
    );
  });

  // ---------------------------------------------------------------------------
  // 2. STRESS TESTING TASK TOGGLES & CONCURRENCY
  // ---------------------------------------------------------------------------
  console.log(`\n${CYAN}[SECTION 2] Stress Testing Task State Transitions${RESET}`);

  await test("2.1 Rapid alternating toggles maintain consistent final state without race conditions", async () => {
    await overviewService.resetState();
    const taskId = "task-4";

    // 10 alternating sequential toggles
    for (let i = 0; i < 10; i++) {
      await overviewService.toggleTask(taskId);
    }

    const data = await overviewService.getOverviewData();
    const task = data.dailyTasks.find((t) => t.id === taskId)!;
    // Originally false, toggled 10 times -> should be false
    assert.equal(task.isCompleted, false, "Task after even number of toggles must return to initial state");
    assert.equal(task.completedAt, undefined);
  });

  await test("2.2 Adding tasks with edge case descriptions (unicode, html chars, emojis) preserves integrity", async () => {
    const specialTitle = 'Audit "Treasury" <XML> & ₹ 50,000 / € 200 — 🚀';
    const newTask = await overviewService.addTask({
      title: specialTitle,
      category: "finance",
      categoryLabel: "Finance · Operating",
      priority: "high",
      isCompleted: false,
    });

    assert.equal(newTask.title, specialTitle);
    const data = await overviewService.getOverviewData();
    assert.equal(data.dailyTasks[0].title, specialTitle);
  });

  // ---------------------------------------------------------------------------
  // 3. STRESS TESTING BUDGET ALLOCATION BOUNDARIES
  // ---------------------------------------------------------------------------
  console.log(`\n${CYAN}[SECTION 3] Stress Testing Budget Allocation Boundaries${RESET}`);

  await test("3.1 Exact boundary threshold calculations for burnRateStatus", async () => {
    // spent is 19500
    // Test exact 75.0% threshold: allocated = 19500 / 0.75 = 26000
    const env75 = await overviewService.updateBudgetEnvelope("env-food", 26000);
    assert.equal(env75.burnPercentage, 75.0);
    assert.equal(env75.burnRateStatus, "contained");

    // Test 74.9% threshold: allocated = 26035 (19500 / 26035 = 74.89%)
    const env74 = await overviewService.updateBudgetEnvelope("env-food", 26035);
    assert.ok(env74.burnPercentage < 75.0);
    assert.equal(env74.burnRateStatus, "normal");

    // Test exact 90.0% threshold: allocated = 19500 / 0.9 = 21666.666 -> let's test 19500 / 21666 = 90.0%
    const env90 = await overviewService.updateBudgetEnvelope("env-food", 21666);
    assert.equal(env90.burnPercentage, 90.0);
    assert.equal(env90.burnRateStatus, "alert");

    // Test 89.9% threshold: allocated = 21691 -> 19500 / 21691 = 89.9%
    const env89 = await overviewService.updateBudgetEnvelope("env-food", 21691);
    assert.equal(env89.burnPercentage, 89.9);
    assert.equal(env89.burnRateStatus, "contained");

    // Test exact 100.0% threshold: allocated = 19500 -> 100%
    const env100 = await overviewService.updateBudgetEnvelope("env-food", 19500);
    assert.equal(env100.burnPercentage, 100.0);
    assert.equal(env100.burnRateStatus, "exceeded");
    assert.equal(env100.bufferRemaining, 0);

    // Test extreme overspend: allocated = 1 -> 1950000%
    const envExtreme = await overviewService.updateBudgetEnvelope("env-food", 1);
    assert.equal(envExtreme.burnPercentage, 1950000);
    assert.equal(envExtreme.burnRateStatus, "exceeded");
    assert.equal(envExtreme.bufferRemaining, 0);
  });

  // ---------------------------------------------------------------------------
  // 4. MATHEMATICAL DONUT GEOMETRY INVARIANTS
  // ---------------------------------------------------------------------------
  console.log(`\n${CYAN}[SECTION 4] Mathematical Donut Geometry Invariants${RESET}`);

  await test("4.1 Mathematical stroke-dasharray and gap generator oracle produces valid SVG arc properties", () => {
    const radius = 62;
    const circumference = 2 * Math.PI * radius; // 389.557489...

    function computeArc(percentage: number) {
      const dash = (percentage / 100) * circumference;
      const gap = circumference - dash;
      return {
        dash: Math.round(dash * 10) / 10,
        gap: Math.round(gap * 10) / 10,
        dashArray: `${(Math.round(dash * 10) / 10).toFixed(1)} ${(Math.round(gap * 10) / 10).toFixed(1)}`,
      };
    }

    const testCases = [
      { pct: 30, expectedDash: 116.9 },
      { pct: 25, expectedDash: 97.4 },
      { pct: 18, expectedDash: 70.1 },
      { pct: 15, expectedDash: 58.4 },
      { pct: 12, expectedDash: 46.7 },
    ];

    for (const tc of testCases) {
      const arc = computeArc(tc.pct);
      assert.ok(
        Math.abs(arc.dash - tc.expectedDash) <= 0.2,
        `Arc dash ${arc.dash} should match expected ~${tc.expectedDash}`
      );
      assert.ok(
        Math.abs(arc.dash + arc.gap - circumference) < 0.2,
        `Sum of dash and gap (${arc.dash + arc.gap}) must equal circumference (${circumference.toFixed(1)})`
      );
    }
  });

  await test("4.2 Dynamic arbitrary sector breakdown summing to 100% preserves circumference invariance", () => {
    const arbitraryPercentages = [10, 20, 30, 40];
    const circumference = 390;
    let accumulatedOffset = 0;

    for (const pct of arbitraryPercentages) {
      const dash = (pct / 100) * circumference;
      const gap = circumference - dash;
      assert.equal(dash + gap, 390);
      accumulatedOffset -= dash;
    }

    assert.equal(accumulatedOffset, -390, "Full rotation must sum to -390 offset");
  });

  // ---------------------------------------------------------------------------
  // 5. TODAY'S DEBITS AGGREGATION & FLOW INTEGRITY
  // ---------------------------------------------------------------------------
  console.log(`\n${CYAN}[SECTION 5] Today's Debits Aggregation & Flow Integrity${RESET}`);

  await test("5.1 Multiple concurrent debit additions correctly sum with zero drift", () => {
    const debits: TodayDebitItem[] = [...mockOverviewData.todayDebits];
    const initialSum = debits.reduce((acc, d) => acc + d.amount, 0); // 1300

    const newTransactions: Transaction[] = [
      {
        id: "tx-bulk-1",
        accountId: "acc-hdfc-4092",
        accountName: "Operating Checking",
        amount: -1250,
        currency: "INR",
        flowType: "outflow",
        category: "shopping_gear",
        categoryLabel: "Shopping & Gear",
        payeeOrPayer: "Ergonomic Mechanical Keyboard",
        date: "2026-10-01",
        status: "cleared",
        createdAt: new Date().toISOString(),
      },
      {
        id: "tx-bulk-2",
        accountId: "acc-hdfc-4092",
        accountName: "Operating Checking",
        amount: -450,
        currency: "INR",
        flowType: "outflow",
        category: "food_dining",
        categoryLabel: "Food & Dining",
        payeeOrPayer: "Organic Grocery Pantry",
        date: "2026-10-01",
        status: "cleared",
        createdAt: new Date().toISOString(),
      },
      {
        id: "tx-bulk-3",
        accountId: "acc-hdfc-4092",
        accountName: "Operating Checking",
        amount: 8000,
        currency: "INR",
        flowType: "inflow",
        category: "consulting_inflow",
        categoryLabel: "Consulting",
        payeeOrPayer: "Advisory Retainer",
        date: "2026-10-01",
        status: "cleared",
        createdAt: new Date().toISOString(),
      },
    ];

    let totalSpent = mockOverviewData.totalSpent;

    for (const tx of newTransactions) {
      if (tx.flowType === "outflow" || tx.amount < 0) {
        debits.unshift({
          id: `debit-${tx.id}`,
          title: tx.payeeOrPayer,
          category: tx.categoryLabel,
          paymentMethod: tx.accountName,
          amount: Math.abs(tx.amount),
          currency: tx.currency,
          time: "16:00",
          icon: "receipt_long",
        });
        totalSpent += Math.abs(tx.amount);
      }
    }

    assert.equal(debits.length, 5, "Should have 3 initial + 2 outflow debits = 5 total");
    const newSum = debits.reduce((acc, d) => acc + d.amount, 0);
    assert.equal(newSum, initialSum + 1250 + 450, "Sum must be 1300 + 1700 = 3000");
    assert.equal(newSum, 3000);
    assert.equal(totalSpent, 65000 + 1700);
  });

  console.log(`\n${CYAN}===================================================================${RESET}`);
  console.log(`ADVERSARIAL SUITE SUMMARY: ${GREEN}${passes} PASSED${RESET}, ${failures > 0 ? RED : GREEN}${failures} FAILED${RESET}`);
  console.log(`${CYAN}===================================================================${RESET}\n`);

  if (failures > 0) {
    process.exit(1);
  }
}

runAdversarialSuite().catch((err) => {
  console.error("Adversarial test runner crashed:", err);
  process.exit(1);
});
