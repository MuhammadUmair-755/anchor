import assert from "node:assert/strict";
import { overviewService } from "../overviewService";

async function runTests() {
  console.log("Starting overviewService test suite...");

  // Test 1: getOverviewData
  console.log("Test 1: getOverviewData returns complete aggregated overview data");
  await overviewService.resetState();
  const data = await overviewService.getOverviewData();
  assert.equal(typeof data.totalLiquidity, "number");
  assert.equal(data.totalLiquidity, 79200);
  assert.equal(data.monthlyInflow, 120000);
  assert.equal(data.totalExpenses, 65000);
  assert.equal(data.netRetained, 55000);
  assert.equal(data.budgetEnvelopes.length, 4);
  assert.equal(data.dailyTasks.length, 5);
  assert.equal(data.todayDebits.length, 3);
  assert.ok(data.outflowSectors.length >= 5);
  assert.equal(data.mindsetGoal.targetAmount, 100000);

  // Test 2: toggleTask
  console.log("Test 2: toggleTask toggles completion state");
  const taskToToggle = data.dailyTasks[3]; // 'task-4' (initially false)
  assert.equal(taskToToggle.isCompleted, false);

  const toggled = await overviewService.toggleTask(taskToToggle.id);
  assert.equal(toggled.isCompleted, true);
  assert.ok(toggled.completedAt);

  const toggledBack = await overviewService.toggleTask(taskToToggle.id);
  assert.equal(toggledBack.isCompleted, false);
  assert.equal(toggledBack.completedAt, undefined);

  // Test 3: addTask
  console.log("Test 3: addTask adds a new task to the top of the list");
  const newTask = await overviewService.addTask({
    title: "Verify zero-trust token rotation",
    category: "finance",
    categoryLabel: "Finance · Operating",
    priority: "high",
    isCompleted: false,
    dueInfo: "Due 5:00 PM",
  });
  assert.ok(newTask.id.startsWith("task-"));
  assert.equal(newTask.title, "Verify zero-trust token rotation");

  const refreshedData = await overviewService.getOverviewData();
  assert.equal(refreshedData.dailyTasks[0].id, newTask.id);
  assert.equal(refreshedData.dailyTasks.length, 6);

  // Test 4: updateBudgetEnvelope
  console.log("Test 4: updateBudgetEnvelope updates envelope and recalculates burn rate and buffer");
  const envelope = data.budgetEnvelopes[0]; // env-food: allocated 22000, spent 19500
  const updatedEnvelope = await overviewService.updateBudgetEnvelope(envelope.id, 30000);
  assert.equal(updatedEnvelope.allocatedAmount, 30000);
  assert.equal(updatedEnvelope.bufferRemaining, 30000 - envelope.spentAmount);
  assert.equal(updatedEnvelope.burnRateStatus, "normal");

  // Threshold alert check: lower allocation to create alert status
  const alertEnvelope = await overviewService.updateBudgetEnvelope(envelope.id, 20000);
  assert.equal(alertEnvelope.burnRateStatus, "alert");

  // Test 5: resetState
  console.log("Test 5: resetState restores baseline state");
  await overviewService.resetState();
  const resetData = await overviewService.getOverviewData();
  assert.equal(resetData.dailyTasks.length, 5);

  console.log("All overviewService tests passed successfully!");
}

runTests().catch((err) => {
  console.error("Test failed with error:", err);
  process.exit(1);
});
