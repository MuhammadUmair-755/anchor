import assert from 'node:assert/strict';
import { overviewService } from '../src/services/overviewService';
import { ExecutiveOverviewData, TaskCategory, PriorityLevel } from '../src/types/models';

async function runAdversarialM2Suite() {
  console.log('--- STARTING ADVERSARIAL REVIEWER 2 SUITE FOR M2 ---');
  await overviewService.resetState();

  // Test 1: Immutability / Deep Clone Leak Prevention
  console.log('Test 1: Immutability check on getOverviewData()');
  const d1 = await overviewService.getOverviewData();
  // Attempt to mutate d1 directly
  d1.totalLiquidity = 9999999;
  d1.dailyTasks[0].title = 'MUTATED TITLE';

  const d2 = await overviewService.getOverviewData();
  assert.notEqual(d2.totalLiquidity, 9999999, 'overviewService state must not be mutated by external modification');
  assert.notEqual(d2.dailyTasks[0].title, 'MUTATED TITLE', 'overviewService tasks must not be mutated by external modification');
  console.log('  -> PASS: Deep cloning prevents state pollution');

  // Test 2: Error handling on non-existent task toggle
  console.log('Test 2: Error handling on invalid task id');
  let threw = false;
  try {
    await overviewService.toggleTask('non-existent-task-id-12345');
  } catch (err: unknown) {
    threw = true;
    assert.match((err as Error).message, /Task with id ".*" not found/);
  }
  assert.ok(threw, 'Toggling non-existent task must throw an error');
  console.log('  -> PASS: Invalid task toggle properly throws');

  // Test 3: Budget Envelope Boundary Cases (Zero, Negative, Exceeded)
  console.log('Test 3: Budget Envelope Boundary Cases');
  const d = await overviewService.getOverviewData();
  const testEnvId = d.budgetEnvelopes[0].id;

  // Case 3a: Zero allocation
  const zeroEnv = await overviewService.updateBudgetEnvelope(testEnvId, 0);
  assert.equal(zeroEnv.allocatedAmount, 0);
  assert.equal(zeroEnv.burnPercentage, 100, 'Zero allocation must report 100% burn');
  assert.equal(zeroEnv.bufferRemaining, 0, 'Buffer must be 0 for zero allocation');
  assert.equal(zeroEnv.burnRateStatus, 'exceeded', 'Zero allocation with spend must be marked exceeded');

  // Case 3b: Huge allocation
  const hugeEnv = await overviewService.updateBudgetEnvelope(testEnvId, 1000000);
  assert.equal(hugeEnv.allocatedAmount, 1000000);
  assert.ok(hugeEnv.burnPercentage < 5, 'Burn percentage should be very low');
  assert.equal(hugeEnv.bufferRemaining, 1000000 - hugeEnv.spentAmount);
  assert.equal(hugeEnv.burnRateStatus, 'normal');

  // Case 3c: Invalid envelope ID
  let envThrew = false;
  try {
    await overviewService.updateBudgetEnvelope('invalid-env-id', 5000);
  } catch (err: unknown) {
    envThrew = true;
    assert.match((err as Error).message, /Budget envelope with id ".*" not found/);
  }
  assert.ok(envThrew, 'Updating non-existent envelope must throw an error');
  console.log('  -> PASS: Budget envelope boundaries safely handled');

  // Test 4: Task Additions & Rapid Sequential Operations
  console.log('Test 4: Sequential task additions and state consistency');
  const categories: TaskCategory[] = ['work', 'personal', 'finance', 'learning'];
  const priorities: PriorityLevel[] = ['low', 'medium', 'high'];

  const addedIds: string[] = [];
  for (let i = 0; i < 10; i++) {
    const t = await overviewService.addTask({
      title: `Stress Task ${i}`,
      category: categories[i % categories.length],
      categoryLabel: "Work · Engineering",
      priority: priorities[i % priorities.length],
      isCompleted: false,
    });
    assert.ok(t.id);
    addedIds.push(t.id);
  }

  const postAddData = await overviewService.getOverviewData();
  assert.equal(postAddData.dailyTasks.length, 5 + 10, 'Must have 15 tasks total');

  // Toggle each added task
  for (const id of addedIds) {
    const updated = await overviewService.toggleTask(id);
    assert.equal(updated.isCompleted, true);
  }

  const postToggleData = await overviewService.getOverviewData();
  const completedCount = postToggleData.dailyTasks.filter((t) => t.isCompleted).length;
  // Initially 3 were completed, plus 10 newly toggled = 13 completed
  assert.equal(completedCount, 13);
  console.log('  -> PASS: Sequential stress operations maintained state consistency');

  // Reset state to baseline
  await overviewService.resetState();
  const cleanData = await overviewService.getOverviewData();
  assert.equal(cleanData.dailyTasks.length, 5);
  console.log('  -> PASS: State cleanly reset');

  console.log('--- ALL ADVERSARIAL M2 REVIEW TESTS PASSED SUCCESSFULLY ---');
}

runAdversarialM2Suite().catch((err) => {
  console.error('Adversarial suite failure:', err);
  process.exit(1);
});
