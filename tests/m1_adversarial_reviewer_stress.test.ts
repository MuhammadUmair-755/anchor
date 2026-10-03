import assert from 'node:assert/strict';
import { tasksService } from '../src/services/tasksService';
import { CreateTaskPayload } from '../src/types/models';

async function runAdversarialStressSuite() {
  console.log('--- STARTING ADVERSARIAL STRESS & INTEGRITY SUITE FOR M1 ---');

  // Scenario 1: State Isolation & Reset
  await tasksService.resetState();
  const initialTasks = await tasksService.getTasks();
  assert.equal(initialTasks.length, 8, 'Initial task count must be 8');

  // Scenario 2: Rapid sequential toggling stress test
  console.log('Scenario 2: Rapid sequential toggling stress test (10 rapid flips)');
  const targetTask = 'task-stitch-4'; // initially pending, proj-nextjs
  const projBefore = (await tasksService.getActiveProjects()).find((p) => p.id === 'proj-nextjs')!;
  const baselineDone = projBefore.tasksCompleted;

  for (let i = 0; i < 10; i++) {
    await tasksService.toggleTask(targetTask);
  }
  // After 10 toggles (even number), task should be back to pending
  const after10 = (await tasksService.getTasks()).find((t) => t.id === targetTask)!;
  assert.equal(after10.isCompleted, false, 'After 10 toggles, task must return to pending');
  assert.equal(after10.completedAt, undefined, 'completedAt must be cleared');

  const projAfter10 = (await tasksService.getActiveProjects()).find((p) => p.id === 'proj-nextjs')!;
  assert.equal(
    projAfter10.tasksCompleted,
    baselineDone,
    'Project tasksCompleted must match baseline after even number of toggles'
  );
  console.log('  -> PASS: Rapid toggling maintained exact mathematical consistency');

  // Scenario 3: Non-existent / Invalid task IDs
  console.log('Scenario 3: Error handling on malformed or non-existent task IDs');
  const invalidIds = ['', 'null', 'undefined', 'task-fake-999', '   '];
  for (const id of invalidIds) {
    let threw = false;
    try {
      await tasksService.toggleTask(id);
    } catch {
      threw = true;
    }
    assert.ok(threw, `Toggling id "${id}" must throw an error`);
  }
  console.log('  -> PASS: All invalid task IDs rejected safely');

  // Scenario 4: Malformed title validations in createTask
  console.log('Scenario 4: Malformed and boundary title validations in createTask');
  const invalidTitles = ['', '   ', '\t', '\n\r   \n'];
  for (const title of invalidTitles) {
    let threw = false;
    try {
      await tasksService.createTask({ title, priority: 'low' });
    } catch (err: unknown) {
      threw = true;
      assert.match((err as Error).message, /Task title is required/);
    }
    assert.ok(threw, `Title "${title}" must throw validation error`);
  }
  console.log('  -> PASS: Blank/whitespace titles safely rejected');

  // Scenario 5: Edge case inputs (Unicode, Emojis, Long Strings, Unassigned Inbox)
  console.log('Scenario 5: Unicode, extreme lengths, and unassigned inbox tasks');
  const longTitle = 'Super long title '.repeat(50); // ~850 chars
  const unicodeTitle = '🔐 審查智能合約與冷錢包儲備庫 (Cryptographic Ledger Audit)';
  
  const createdLong = await tasksService.createTask({
    title: longTitle,
    priority: 'low',
    projectId: 'inbox',
  });
  assert.equal(createdLong.title, longTitle.trim());
  assert.equal(createdLong.projectName, 'Unassigned / Inbox');
  assert.equal(createdLong.projectId, 'inbox');

  const createdUnicode = await tasksService.createTask({
    title: unicodeTitle,
    priority: 'high',
    projectId: undefined,
  });
  assert.equal(createdUnicode.title, unicodeTitle);
  assert.equal(createdUnicode.priority, 'high');
  assert.equal(createdUnicode.statusBadge, 'HIGH');
  console.log('  -> PASS: Unicode and extreme input lengths handled seamlessly');

  // Scenario 6: Division by zero prevention and dynamic project progress calculation
  console.log('Scenario 6: Project progress calculation when tasks completed changes');
  const anchorProjectInitial = (await tasksService.getActiveProjects()).find((p) => p.id === 'proj-anchor')!;
  assert.equal(anchorProjectInitial.progressPercentage, 72, 'Initial value matches Stitch design spec (72%)');

  // Now create a task for proj-anchor and check dynamic calculation
  await tasksService.createTask({
    title: 'Audit vault security protocols',
    priority: 'medium',
    projectId: 'proj-anchor',
  });
  const anchorProjectUpdated = (await tasksService.getActiveProjects()).find((p) => p.id === 'proj-anchor')!;
  assert.equal(anchorProjectUpdated.totalTasks, 12, 'Total tasks incremented from 11 to 12');
  const expectedPercent = Math.round((8 / 12) * 100); // 67%
  assert.equal(anchorProjectUpdated.progressPercentage, expectedPercent, 'Updated percentage must equal Math.round(8 / 12 * 100)');
  console.log('  -> PASS: Dynamic project progress math verified');

  // Scenario 7: Velocity metrics synchronization
  console.log('Scenario 7: Dynamic velocity metrics recalculation');
  const metricsBefore = await tasksService.getVelocityMetrics();
  // Toggle one pending task to completed
  const pendingStitch4 = (await tasksService.getTasks()).find((t) => t.id === 'task-stitch-4')!;
  assert.equal(pendingStitch4.isCompleted, false);
  await tasksService.toggleTask('task-stitch-4');

  const metricsAfter = await tasksService.getVelocityMetrics();
  assert.equal(
    metricsAfter.completedCount,
    metricsBefore.completedCount + 1,
    'Velocity metrics completedCount must reflect newly completed task'
  );
  console.log('  -> PASS: Velocity metrics synchronously updated');

  // Scenario 8: Clean reset restores pristine state
  console.log('Scenario 8: Complete reset check');
  await tasksService.resetState();
  const resetTasks = await tasksService.getTasks();
  assert.equal(resetTasks.length, 8);
  const resetCompleted = resetTasks.filter((t) => t.isCompleted).length;
  assert.equal(resetCompleted, 3);
  console.log('  -> PASS: State cleanly restored');

  console.log('--- ALL ADVERSARIAL STRESS TESTS PASSED EMPIRICALLY ---');
}

runAdversarialStressSuite().catch((err) => {
  console.error('Adversarial Test Suite Failed:', err);
  process.exit(1);
});
