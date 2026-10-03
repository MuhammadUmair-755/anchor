import assert from 'node:assert/strict';
import { tasksService } from '../src/services/tasksService';
import { CreateTaskPayload } from '../src/types/models';

async function runTasksServiceTestSuite() {
  console.log('--- STARTING MILESTONE 1: TASKS SERVICE INTEGRITY SUITE ---');
  await tasksService.resetState();

  // Test 1: Verify Initial Fixtures & Stitch Baseline
  console.log('Test 1: Verify initial task fixtures load Stitch specs');
  const allTasks = await tasksService.getTasks();
  assert.equal(allTasks.length, 8, 'Must return 8 baseline tasks (6 Stitch + 2 extra)');

  const stitch1 = allTasks.find((t) => t.id === 'task-stitch-1');
  assert.ok(stitch1, 'Task stitch-1 must exist');
  assert.equal(stitch1?.title, 'Complete API integration');
  assert.equal(stitch1?.isCompleted, true, 'Task stitch-1 must be completed');
  assert.equal(stitch1?.priority, 'high');
  assert.equal(stitch1?.categoryLabel, 'Engineering');

  const stitch4 = allTasks.find((t) => t.id === 'task-stitch-4');
  assert.ok(stitch4, 'Task stitch-4 must exist');
  assert.equal(stitch4?.title, 'Study TypeScript 5.5 performance notes');
  assert.equal(stitch4?.isCompleted, false, 'Task stitch-4 must be pending');
  assert.equal(stitch4?.estimatedMinutes, 45);
  console.log('  -> PASS: Baseline Stitch items accurately verified');

  // Test 2: Filter Tabs Verification
  console.log('Test 2: Verify filter tabs behavior');
  const todayTasks = await tasksService.getTasks('today');
  assert.equal(todayTasks.length, 5, "Today tab must return 5 today's items");
  assert.ok(todayTasks.every((t) => t.tabCategory === 'today'));

  const completedTasks = await tasksService.getTasks('completed');
  assert.equal(completedTasks.length, 3, 'Must have exactly 3 completed tasks initially');
  assert.ok(completedTasks.every((t) => t.isCompleted === true));

  const upcomingTasks = await tasksService.getTasks('upcoming');
  assert.equal(upcomingTasks.length, 1, 'Must have 1 upcoming task (Draft Q4 roadmap)');
  assert.equal(upcomingTasks[0].id, 'task-stitch-6');

  const overdueTasks = await tasksService.getTasks('overdue');
  assert.equal(overdueTasks.length, 1, 'Must have 1 overdue task');
  assert.equal(overdueTasks[0].id, 'task-overdue-1');

  const backlogTasks = await tasksService.getTasks('backlog');
  assert.equal(backlogTasks.length, 1, 'Must have 1 backlog task');
  assert.equal(backlogTasks[0].id, 'task-backlog-1');
  console.log('  -> PASS: Tab filtering operates correctly');

  // Test 3: Task Completion Toggle & Project Synchronization
  console.log('Test 3: Toggle task completion and project reactive sync');
  const projectsBefore = await tasksService.getActiveProjects();
  const nextjsBefore = projectsBefore.find((p) => p.id === 'proj-nextjs')!;
  const nextjsDoneBefore = nextjsBefore.tasksCompleted;

  // Toggle stitch-4 (Next.js project task) from pending to completed
  const toggledDone = await tasksService.toggleTask('task-stitch-4');
  assert.equal(toggledDone.isCompleted, true, 'Task must now be completed');
  assert.ok(toggledDone.completedAt, 'Must set completedAt timestamp');
  assert.equal(toggledDone.statusBadge, 'Done');

  const projectsAfter = await tasksService.getActiveProjects();
  const nextjsAfter = projectsAfter.find((p) => p.id === 'proj-nextjs')!;
  assert.equal(
    nextjsAfter.tasksCompleted,
    nextjsDoneBefore + 1,
    'Project tasksCompleted must increment by 1'
  );

  // Toggle back to pending
  const toggledPending = await tasksService.toggleTask('task-stitch-4');
  assert.equal(toggledPending.isCompleted, false, 'Task must now be pending');
  assert.equal(toggledPending.completedAt, undefined, 'completedAt must be cleared');
  assert.equal(toggledPending.statusBadge, 'Learning');

  const projectsReset = await tasksService.getActiveProjects();
  const nextjsReset = projectsReset.find((p) => p.id === 'proj-nextjs')!;
  assert.equal(
    nextjsReset.tasksCompleted,
    nextjsDoneBefore,
    'Project tasksCompleted must decrement back to baseline'
  );
  console.log('  -> PASS: Task toggle and project synchronization operate correctly');

  // Test 4: Quick Task Creation
  console.log('Test 4: Create new task via Quick Task Capture');
  const anchorBefore = (await tasksService.getActiveProjects()).find((p) => p.id === 'proj-anchor')!;
  const anchorTotalBefore = anchorBefore.totalTasks;

  const payload: CreateTaskPayload = {
    title: 'Audit cold storage ledger balances',
    priority: 'high',
    projectId: 'proj-anchor',
    dueDate: 'Today',
    dueTime: '6:30 PM',
    category: 'Finance',
    categoryLabel: 'Treasury Audit',
  };

  const created = await tasksService.createTask(payload);
  assert.ok(created.id.startsWith('task-'), 'Must generate a unique task ID');
  assert.equal(created.title, 'Audit cold storage ledger balances');
  assert.equal(created.priority, 'high');
  assert.equal(created.projectName, 'Personal Life Management (ANCHOR)');
  assert.equal(created.statusBadge, 'HIGH');
  assert.equal(created.dueInfo, 'Due 6:30 PM');

  // Verify project total tasks updated
  const anchorAfter = (await tasksService.getActiveProjects()).find((p) => p.id === 'proj-anchor')!;
  assert.equal(anchorAfter.totalTasks, anchorTotalBefore + 1, 'Project totalTasks must increment');

  // Verify created task appears first in getTasks()
  const currentTasks = await tasksService.getTasks();
  assert.equal(currentTasks[0].id, created.id, 'New task must be unshifted to the top');
  console.log('  -> PASS: Task creation and project rollup functioning properly');

  // Test 5: Validation & Error Handling
  console.log('Test 5: Validation and error throwing');
  let toggleError = false;
  try {
    await tasksService.toggleTask('non-existent-id-xyz');
  } catch (err: unknown) {
    toggleError = true;
    assert.match((err as Error).message, /Task with id "non-existent-id-xyz" not found/);
  }
  assert.ok(toggleError, 'Toggling non-existent task must throw');

  let createError = false;
  try {
    await tasksService.createTask({ title: '   ', priority: 'low' });
  } catch (err: unknown) {
    createError = true;
    assert.match((err as Error).message, /Task title is required/);
  }
  assert.ok(createError, 'Creating task with empty title must throw');
  console.log('  -> PASS: Error handling accurately validated');

  // Test 6: Active Projects & Rhythm Telemetry
  console.log('Test 6: Active projects and weekly rhythm metrics');
  await tasksService.resetState();
  const projects = await tasksService.getActiveProjects();
  assert.equal(projects.length, 3, 'Must have 3 active projects');
  assert.equal(projects[0].progressPercentage, 72);
  assert.equal(projects[1].progressPercentage, 45);
  assert.equal(projects[2].progressPercentage, 85);

  const weeklyRhythm = await tasksService.getWeeklyRhythm();
  assert.equal(weeklyRhythm.length, 7, 'Must have 7 days in weekly rhythm');
  const wed = weeklyRhythm[2];
  assert.equal(wed.day, 'W');
  assert.equal(wed.isToday, true, 'Wednesday must be marked as today');
  assert.equal(wed.heightPercent, 100);

  const guardrail = await tasksService.getExecutionRhythm();
  assert.ok(guardrail.description.includes('2:30 PM — 4:00 PM'));
  assert.equal(guardrail.focusMode, true);
  console.log('  -> PASS: Project and rhythm telemetry accurate');

  // Test 7: Immutability / Deep Clone Leak Prevention
  console.log('Test 7: Immutability check on getTasks()');
  const t1 = await tasksService.getTasks();
  t1[0].title = 'MUTATED TITLE';
  const t2 = await tasksService.getTasks();
  assert.notEqual(t2[0].title, 'MUTATED TITLE', 'Service state must not be mutated by external modification');
  console.log('  -> PASS: Deep cloning prevents state pollution');

  // Test 8: Clean Reset
  console.log('Test 8: Reset state back to pristine fixtures');
  await tasksService.resetState();
  const resetTasks = await tasksService.getTasks();
  assert.equal(resetTasks.length, 8, 'Reset must restore pristine 8 tasks');
  assert.equal(resetTasks[0].id, 'task-stitch-1', 'Reset must restore pristine order');
  const resetProjects = await tasksService.getActiveProjects();
  const resetAnchor = resetProjects.find((p) => p.id === 'proj-anchor')!;
  assert.equal(resetAnchor.totalTasks, 11, 'Reset must restore pristine totalTasks');
  console.log('  -> PASS: State cleanly reset');

  console.log('--- ALL MILESTONE 1 TESTS PASSED SUCCESSFULLY ---');
}

runTasksServiceTestSuite().catch((err) => {
  console.error('Milestone 1 Test Suite Failed:', err);
  process.exit(1);
});
