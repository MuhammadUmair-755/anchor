import assert from 'node:assert/strict';
import { tasksService } from '../src/services/tasksService';
import { CreateTaskPayload, TaskFilterTab, PriorityLevel } from '../src/types/models';

/**
 * Adversarial Stress & Integrity Test Suite for Milestone 1: Tasks & Projects Command Center
 * Agent: teamwork_preview_challenger_m1_1
 */
async function runAdversarialStressSuite() {
  console.log('================================================================');
  console.log('STARTING ADVERSARIAL CHALLENGER STRESS SUITE: MILESTONE 1 (/tasks)');
  console.log('================================================================\n');

  // Ensure pristine baseline
  await tasksService.resetState();

  // --------------------------------------------------------------------------
  // SUITE 1: Task Creation Edge Cases & Malformed Input Handling
  // --------------------------------------------------------------------------
  console.log('>>> SUITE 1: Task Creation Edge Cases & Input Validation');

  // 1.1 Empty and Whitespace Definitions
  console.log('  1.1 Probing empty, whitespace-only, and nil task definitions...');
  const initialTaskCount = (await tasksService.getTasks()).length;
  const invalidTitles: (string | null | undefined)[] = [
    '',
    '   ',
    '\t\t',
    '\n\r\n',
    ' \t \n ',
    null,
    undefined,
  ];

  for (const badTitle of invalidTitles) {
    let threw = false;
    try {
      await tasksService.createTask({
        title: badTitle as unknown as string,
        priority: 'medium',
      });
    } catch (err: unknown) {
      threw = true;
      assert.match(
        (err as Error).message,
        /Task title is required/,
        `Creating task with "${badTitle}" must throw descriptive error`
      );
    }
    assert.ok(threw, `Creating task with "${badTitle}" must be rejected`);
  }
  const postInvalidCount = (await tasksService.getTasks()).length;
  assert.equal(
    postInvalidCount,
    initialTaskCount,
    'Store task count must not change after failed task creation attempts'
  );
  console.log('    -> PASS: All empty/whitespace definitions rejected cleanly');

  // 1.2 Excessive Lengths & Special Unicode Strings
  console.log('  1.2 Probing excessive string lengths and adversarial payloads...');
  const lengthsToTest = [1000, 10000, 50000];
  for (const len of lengthsToTest) {
    const hugeTitle = 'A'.repeat(len);
    const hugeTask = await tasksService.createTask({
      title: hugeTitle,
      priority: 'low',
    });
    assert.equal(hugeTask.title.length, len, `Task must preserve exact length of ${len} chars`);
    assert.equal(hugeTask.isCompleted, false);
  }

  // Complex multi-byte emoji and symbols
  const unicodeTitle = '🚀 Deep Work Sprint: 🔥 Architecture & 💎 Capital Ledger — 4K & 100% ⚡';
  const unicodeTask = await tasksService.createTask({
    title: unicodeTitle,
    priority: 'high',
  });
  assert.equal(unicodeTask.title, unicodeTitle, 'Unicode strings must be preserved without distortion');
  assert.equal(unicodeTask.statusBadge, 'HIGH', 'High priority must produce HIGH status badge');

  // XSS and SQL injection payloads
  const xssPayload = '<script>alert("xss")</script><img src=x onerror=alert(1)>';
  const xssTask = await tasksService.createTask({
    title: xssPayload,
    priority: 'medium',
  });
  assert.equal(xssTask.title, xssPayload, 'XSS payloads must be stored literally as inert text');

  const sqlPayload = "'; DROP TABLE tasks; --";
  const sqlTask = await tasksService.createTask({
    title: sqlPayload,
    priority: 'low',
  });
  assert.equal(sqlTask.title, sqlPayload, 'SQL injection strings must be stored literally');
  console.log('    -> PASS: Excessive length, unicode, and injection strings handled safely');

  // 1.3 Missing, Malformed, or Unrecognized Priorities
  console.log('  1.3 Probing missing or unexpected priority values...');
  const noPriorityTask = await tasksService.createTask({
    title: 'Task with undefined priority',
    priority: undefined as unknown as PriorityLevel,
  });
  assert.equal(noPriorityTask.priority, 'medium', 'Missing priority must default safely to "medium"');

  const emptyPriorityTask = await tasksService.createTask({
    title: 'Task with empty string priority',
    priority: '' as unknown as PriorityLevel,
  });
  assert.equal(emptyPriorityTask.priority, 'medium', 'Empty string priority must default to "medium"');

  const unkPriorityTask = await tasksService.createTask({
    title: 'Task with unrecognized priority',
    priority: 'critical_emergency' as unknown as PriorityLevel,
  });
  assert.equal(unkPriorityTask.priority, 'critical_emergency');
  assert.equal(unkPriorityTask.statusBadge, undefined, 'Non-high priority must not assign HIGH badge');
  console.log('    -> PASS: Priority fallbacks and edge values verified');

  // 1.4 Nonexistent, Empty, and Valid Project IDs
  console.log('  1.4 Probing nonexistent and edge project IDs...');
  const beforeProjects = await tasksService.getActiveProjects();
  const nonexistentProjTask = await tasksService.createTask({
    title: 'Task with nonexistent project ID',
    priority: 'low',
    projectId: 'proj-nonexistent-999999',
  });
  assert.equal(nonexistentProjTask.projectId, 'proj-nonexistent-999999');
  assert.equal(nonexistentProjTask.projectName, 'Unassigned / Inbox');
  const afterProjects = await tasksService.getActiveProjects();
  assert.deepEqual(
    beforeProjects,
    afterProjects,
    'Projects store must remain untouched when task has nonexistent projectId'
  );

  // Assign to valid project 'proj-anchor'
  const anchorProjBefore = beforeProjects.find((p) => p.id === 'proj-anchor')!;
  const anchorValidTask = await tasksService.createTask({
    title: 'Task assigned to ANCHOR Core',
    priority: 'high',
    projectId: 'proj-anchor',
  });
  assert.equal(anchorValidTask.projectId, 'proj-anchor');
  assert.equal(anchorValidTask.projectName, 'Personal Life Management (ANCHOR)');

  const anchorProjAfter = (await tasksService.getActiveProjects()).find((p) => p.id === 'proj-anchor')!;
  assert.equal(
    anchorProjAfter.totalTasks,
    anchorProjBefore.totalTasks + 1,
    'Valid project assignment must increment totalTasks by 1'
  );
  const expectedPercentage = Math.round(
    (anchorProjBefore.tasksCompleted / (anchorProjBefore.totalTasks + 1)) * 100
  );
  assert.equal(
    anchorProjAfter.progressPercentage,
    expectedPercentage,
    'Project progressPercentage must be mathematically exact'
  );
  console.log('    -> PASS: Project ID boundary handling verified');

  // --------------------------------------------------------------------------
  // SUITE 2: Concurrency & Mathematical Exactness of Counters & Percentages
  // --------------------------------------------------------------------------
  console.log('\n>>> SUITE 2: Concurrency & Mathematical Exactness of Telemetry');
  await tasksService.resetState();

  // 2.1 100 Rapid Sequential & Concurrent Toggles on a Single Task
  console.log('  2.1 Rapid toggling of a single task (100 iterations)...');
  const nextjsProjInit = (await tasksService.getActiveProjects()).find((p) => p.id === 'proj-nextjs')!;
  const baselineDone = nextjsProjInit.tasksCompleted; // 9
  const baselineTotal = nextjsProjInit.totalTasks; // 20
  const baselinePct = nextjsProjInit.progressPercentage; // 45

  // Toggle 100 times in Promise.all
  const togglePromises = Array.from({ length: 100 }, () =>
    tasksService.toggleTask('task-stitch-4')
  );
  await Promise.all(togglePromises);

  // 100 toggles is an even number -> state must return to initial isCompleted: false
  const taskAfter100 = (await tasksService.getTasks()).find((t) => t.id === 'task-stitch-4')!;
  assert.equal(taskAfter100.isCompleted, false, '100 toggles (even) must leave task as pending');
  assert.equal(taskAfter100.completedAt, undefined);

  const nextjsProjAfter100 = (await tasksService.getActiveProjects()).find((p) => p.id === 'proj-nextjs')!;
  assert.equal(
    nextjsProjAfter100.tasksCompleted,
    baselineDone,
    'Project tasksCompleted must return exactly to baseline after even toggles'
  );
  assert.equal(
    nextjsProjAfter100.progressPercentage,
    baselinePct,
    'Project progressPercentage must return exactly to baseline'
  );

  // Toggle 1 more time (101 total -> odd -> isCompleted: true)
  const taskAfter101 = await tasksService.toggleTask('task-stitch-4');
  assert.equal(taskAfter101.isCompleted, true, '101 toggles (odd) must leave task as completed');
  assert.ok(taskAfter101.completedAt);
  const nextjsProjAfter101 = (await tasksService.getActiveProjects()).find((p) => p.id === 'proj-nextjs')!;
  assert.equal(
    nextjsProjAfter101.tasksCompleted,
    baselineDone + 1,
    'Odd toggle must increment completed count by 1'
  );
  const expectedNextjsPct = Math.round(((baselineDone + 1) / baselineTotal) * 100); // 10/20 = 50%
  assert.equal(
    nextjsProjAfter101.progressPercentage,
    expectedNextjsPct,
    `Percentage must be exact: expected ${expectedNextjsPct}%, got ${nextjsProjAfter101.progressPercentage}%`
  );
  console.log('    -> PASS: 100-cycle toggles maintain mathematical perfection');

  // 2.2 Concurrent Multi-Task Toggling on the Same Project
  console.log('  2.2 Multi-task concurrent toggles on same project (proj-sovereign)...');
  // Baseline proj-sovereign: tasksCompleted = 6, totalTasks = 7
  // task-stitch-3 is completed; task-stitch-5 is pending
  const sovProjInit = (await tasksService.getActiveProjects()).find((p) => p.id === 'proj-sovereign')!;
  assert.equal(sovProjInit.tasksCompleted, 6);
  assert.equal(sovProjInit.totalTasks, 7);

  // Concurrently toggle task-stitch-3 (completed -> pending) AND task-stitch-5 (pending -> completed)
  await Promise.all([
    tasksService.toggleTask('task-stitch-3'),
    tasksService.toggleTask('task-stitch-5'),
  ]);

  const sovProjNetZero = (await tasksService.getActiveProjects()).find((p) => p.id === 'proj-sovereign')!;
  assert.equal(
    sovProjNetZero.tasksCompleted,
    6,
    'Net change of +1 and -1 simultaneously must keep completed count at 6'
  );

  // Now toggle task-stitch-3 back to completed -> both tasks are now completed
  await tasksService.toggleTask('task-stitch-3');
  const sovProjAllDone = (await tasksService.getActiveProjects()).find((p) => p.id === 'proj-sovereign')!;
  assert.equal(
    sovProjAllDone.tasksCompleted,
    7,
    'All tasks completed must reach exactly totalTasks (7)'
  );
  assert.equal(
    sovProjAllDone.progressPercentage,
    100,
    '7 out of 7 tasks must report exactly 100% progress'
  );
  console.log('    -> PASS: Multi-task concurrent toggles retain net mathematical invariants');

  // 2.3 Creation and Immediate Toggle Concurrency
  console.log('  2.3 Creating 10 tasks concurrently and toggling them under load...');
  await tasksService.resetState();
  const anchorInit = (await tasksService.getActiveProjects()).find((p) => p.id === 'proj-anchor')!;
  const initAnchorDone = anchorInit.tasksCompleted; // 8
  const initAnchorTotal = anchorInit.totalTasks; // 11

  // Create 10 tasks in parallel
  const createdTasks = await Promise.all(
    Array.from({ length: 10 }, (_, i) =>
      tasksService.createTask({
        title: `Stress Batch Task #${i + 1}`,
        priority: i % 2 === 0 ? 'high' : 'medium',
        projectId: 'proj-anchor',
      })
    )
  );

  const anchorAfterBatchCreate = (await tasksService.getActiveProjects()).find((p) => p.id === 'proj-anchor')!;
  assert.equal(
    anchorAfterBatchCreate.totalTasks,
    initAnchorTotal + 10,
    'Project totalTasks must equal baseline (11) + 10 = 21'
  );
  assert.equal(
    anchorAfterBatchCreate.tasksCompleted,
    initAnchorDone,
    'Completed tasks must remain at 8'
  );
  assert.equal(
    anchorAfterBatchCreate.progressPercentage,
    Math.round((8 / 21) * 100),
    'Progress percentage must reflect 8 / 21 = 38%'
  );

  // Concurrently toggle all 10 newly created tasks
  await Promise.all(createdTasks.map((t) => tasksService.toggleTask(t.id)));
  const anchorAfterBatchToggle = (await tasksService.getActiveProjects()).find((p) => p.id === 'proj-anchor')!;
  assert.equal(
    anchorAfterBatchToggle.tasksCompleted,
    initAnchorDone + 10,
    'Completed tasks must now equal baseline (8) + 10 = 18'
  );
  assert.equal(
    anchorAfterBatchToggle.progressPercentage,
    Math.round((18 / 21) * 100),
    'Progress percentage must reflect 18 / 21 = 86%'
  );
  console.log('    -> PASS: 10 parallel creations & toggles maintained flawless counters');

  // 2.4 Concurrent Mix of Valid and Invalid Toggles
  console.log('  2.4 Interleaved valid and invalid toggles...');
  const mixedResults = await Promise.allSettled([
    tasksService.toggleTask('task-stitch-1'),
    tasksService.toggleTask('INVALID_TASK_A'),
    tasksService.toggleTask('task-stitch-2'),
    tasksService.toggleTask('INVALID_TASK_B'),
    tasksService.toggleTask(''),
  ]);

  const rejected = mixedResults.filter((r) => r.status === 'rejected');
  const fulfilled = mixedResults.filter((r) => r.status === 'fulfilled');
  assert.equal(rejected.length, 3, 'Must cleanly reject 3 invalid toggle attempts');
  assert.equal(fulfilled.length, 2, 'Must cleanly fulfill 2 valid toggle attempts');
  console.log('    -> PASS: Mixed settled promises isolate errors without store corruption');

  // --------------------------------------------------------------------------
  // SUITE 3: Deep Mutation Resistance & Service Store Immunity
  // --------------------------------------------------------------------------
  console.log('\n>>> SUITE 3: Deep Mutation Resistance & Service Store Immunity');
  await tasksService.resetState();

  // 3.1 Mutating getTasks() results
  console.log('  3.1 Deep mutation attack on getTasks()...');
  const tasksCopy1 = await tasksService.getTasks();
  tasksCopy1[0].title = 'EXTERNALLY_MUTATED_TITLE';
  tasksCopy1[0].isCompleted = !tasksCopy1[0].isCompleted;
  tasksCopy1[0].priority = 'low';
  tasksCopy1[0].projectId = 'mutated-project';
  (tasksCopy1 as unknown as Record<string, unknown>[])[0]['maliciousPayload'] = { injected: true };
  tasksCopy1.push({ id: 'injected-task' } as unknown as (typeof tasksCopy1)[0]);
  tasksCopy1.length = 0; // Truncate array

  const tasksCopy2 = await tasksService.getTasks();
  assert.equal(tasksCopy2.length, 8, 'tasksStore must still have exactly 8 tasks');
  assert.equal(tasksCopy2[0].title, 'Complete API integration');
  assert.equal(tasksCopy2[0].isCompleted, true);
  assert.equal(tasksCopy2[0].priority, 'high');
  assert.equal(
    (tasksCopy2[0] as unknown as Record<string, unknown>)['maliciousPayload'],
    undefined,
    'Store must not leak injected properties'
  );
  console.log('    -> PASS: getTasks() is fully immune to external mutation');

  // 3.2 Mutating getActiveProjects() results
  console.log('  3.2 Deep mutation attack on getActiveProjects()...');
  const projectsCopy1 = await tasksService.getActiveProjects();
  projectsCopy1[0].title = 'HACKED_PROJECT_NAME';
  projectsCopy1[0].progressPercentage = -99999;
  projectsCopy1[0].tasksCompleted = 99999;
  projectsCopy1.length = 0;

  const projectsCopy2 = await tasksService.getActiveProjects();
  assert.equal(projectsCopy2.length, 3, 'projectsStore must still have 3 projects');
  assert.equal(projectsCopy2[0].title, 'Personal Life Management (ANCHOR)');
  assert.equal(projectsCopy2[0].progressPercentage, 72);
  assert.equal(projectsCopy2[0].tasksCompleted, 8);
  console.log('    -> PASS: getActiveProjects() is fully immune to external mutation');

  // 3.3 Mutating Telemetry Stores (WeeklyRhythm, ExecutionRhythm, VelocityMetrics, SystemPhases)
  console.log('  3.3 Deep mutation attack on telemetry and phases stores...');
  const rhythmCopy = await tasksService.getWeeklyRhythm();
  rhythmCopy[2].heightPercent = -100;
  rhythmCopy[2].day = 'X';
  const rhythmFresh = await tasksService.getWeeklyRhythm();
  assert.equal(rhythmFresh[2].heightPercent, 100);
  assert.equal(rhythmFresh[2].day, 'W');

  const execCopy = await tasksService.getExecutionRhythm();
  execCopy.title = 'HACKED_GUARDRAIL';
  execCopy.focusMode = false;
  const execFresh = await tasksService.getExecutionRhythm();
  assert.equal(execFresh.title, 'Rhythm Guardrail');
  assert.equal(execFresh.focusMode, true);

  const velocityCopy = await tasksService.getVelocityMetrics();
  velocityCopy.completedCount = -999;
  velocityCopy.weeklyRhythm[0].heightPercent = 0;
  const velocityFresh = await tasksService.getVelocityMetrics();
  assert.equal(velocityFresh.completedCount, 3);
  assert.equal(velocityFresh.weeklyRhythm[0].heightPercent, 60);

  const phasesCopy = await tasksService.getSystemPhases();
  phasesCopy[0].name = 'HACKED_PHASE';
  phasesCopy.splice(0, 2);
  const phasesFresh = await tasksService.getSystemPhases();
  assert.equal(phasesFresh.length, 3);
  assert.equal(phasesFresh[0].name, 'Phase I: Foundation');
  console.log('    -> PASS: All telemetry stores completely immune to mutation');

  // 3.4 Mutating Return Values of Mutations
  console.log('  3.4 Deep mutation of values returned by toggleTask and createTask...');
  const created = await tasksService.createTask({
    title: 'Immunity Test Task',
    priority: 'medium',
  });
  created.title = 'POLLUTED_CREATED_TITLE';
  created.isCompleted = true;

  const foundCreated = (await tasksService.getTasks()).find((t) => t.id === created.id)!;
  assert.equal(foundCreated.title, 'Immunity Test Task');
  assert.equal(foundCreated.isCompleted, false);

  const toggled = await tasksService.toggleTask(created.id);
  toggled.statusBadge = 'COMPROMISED_BADGE';
  const foundToggled = (await tasksService.getTasks()).find((t) => t.id === created.id)!;
  assert.equal(foundToggled.statusBadge, 'Done');
  console.log('    -> PASS: Mutation return values do not leak references into store');

  // 3.5 Mutating Payload Passed to createTask
  console.log('  3.5 Mutating payload object after calling createTask...');
  const dynamicPayload: CreateTaskPayload = {
    title: 'Pre-mutation Payload Title',
    priority: 'low',
    category: 'Finance',
  };
  const taskFromDynamicPayload = await tasksService.createTask(dynamicPayload);
  dynamicPayload.title = 'Post-mutation Polluted Title';
  dynamicPayload.priority = 'high';
  dynamicPayload.category = 'Compromised';

  const storedDynamicTask = (await tasksService.getTasks()).find(
    (t) => t.id === taskFromDynamicPayload.id
  )!;
  assert.equal(storedDynamicTask.title, 'Pre-mutation Payload Title');
  assert.equal(storedDynamicTask.priority, 'low');
  assert.equal(storedDynamicTask.category, 'Finance');
  console.log('    -> PASS: Internal store is insulated from subsequent payload mutation');

  // --------------------------------------------------------------------------
  // SUITE 4: Tab Filtering Boundary & Unrecognized Key Probes
  // --------------------------------------------------------------------------
  console.log('\n>>> SUITE 4: Tab Filtering Boundary & Edge Cases');
  await tasksService.resetState();

  // 4.1 Valid Standard Filter Tabs
  console.log('  4.1 Verifying standard filter tab predicates...');
  const todayTasks = await tasksService.getTasks('today');
  assert.equal(todayTasks.length, 5);
  assert.ok(todayTasks.every((t) => t.tabCategory === 'today'));

  const completedTasks = await tasksService.getTasks('completed');
  assert.equal(completedTasks.length, 3);
  assert.ok(completedTasks.every((t) => t.isCompleted === true));

  const upcomingTasks = await tasksService.getTasks('upcoming');
  assert.equal(upcomingTasks.length, 1);
  assert.equal(upcomingTasks[0].id, 'task-stitch-6');

  const overdueTasks = await tasksService.getTasks('overdue');
  assert.equal(overdueTasks.length, 1);
  assert.equal(overdueTasks[0].id, 'task-overdue-1');

  const backlogTasks = await tasksService.getTasks('backlog');
  assert.equal(backlogTasks.length, 1);
  assert.equal(backlogTasks[0].id, 'task-backlog-1');
  console.log('    -> PASS: Standard filter tabs return expected subsets');

  // 4.2 Unrecognized or Malformed Filter Keys
  console.log('  4.2 Probing unrecognized or malformed filter keys...');
  const unrecognizedKeys = [
    'unknown_tab',
    'TODAY', // Uppercase
    'COMPLETED',
    'nonexistent',
    '12345',
  ];

  for (const badKey of unrecognizedKeys) {
    const res = await tasksService.getTasks(badKey as unknown as TaskFilterTab);
    assert.deepEqual(
      res,
      [],
      `Querying unrecognized filter key "${badKey}" must return empty array without crashing`
    );
  }

  // Falsy filter values should return all tasks
  const allTasksUndef = await tasksService.getTasks(undefined);
  assert.equal(allTasksUndef.length, 8);

  const allTasksEmpty = await tasksService.getTasks('' as unknown as TaskFilterTab);
  assert.equal(allTasksEmpty.length, 8);

  const allTasksNull = await tasksService.getTasks(null as unknown as TaskFilterTab);
  assert.equal(allTasksNull.length, 8);
  console.log('    -> PASS: Unrecognized keys safely yield empty array, falsy keys return all');

  // 4.3 Dynamically Toggled Tasks Across Filter Tabs
  console.log('  4.3 Cross-tab visibility after dynamic completion...');
  // Toggle backlog task to done
  await tasksService.toggleTask('task-backlog-1');
  const completedAfterBacklog = await tasksService.getTasks('completed');
  assert.equal(completedAfterBacklog.length, 4, 'Completed tab must now contain 4 items');
  assert.ok(completedAfterBacklog.some((t) => t.id === 'task-backlog-1'));

  // Toggle upcoming task to done
  await tasksService.toggleTask('task-stitch-6');
  const completedAfterUpcoming = await tasksService.getTasks('completed');
  assert.equal(completedAfterUpcoming.length, 5, 'Completed tab must now contain 5 items');
  assert.ok(completedAfterUpcoming.some((t) => t.id === 'task-stitch-6'));
  console.log('    -> PASS: Dynamically resolved tasks flow cleanly into completed tab');

  // --------------------------------------------------------------------------
  // SUITE 5: Repeated State Resets Under High Stress & Mutation Pressure
  // --------------------------------------------------------------------------
  console.log('\n>>> SUITE 5: Repeated Resets Under Mutation Pressure');

  console.log('  5.1 Executing 50 chaos mutation & reset cycles...');
  for (let cycle = 1; cycle <= 50; cycle++) {
    // 1. Create a task
    await tasksService.createTask({
      title: `Chaos Task Cycle ${cycle}`,
      priority: cycle % 2 === 0 ? 'high' : 'low',
      projectId: cycle % 3 === 0 ? 'proj-anchor' : 'proj-nextjs',
    });

    // 2. Toggle a task
    await tasksService.toggleTask('task-stitch-1');

    // 3. Mutate an array
    const leaked = await tasksService.getTasks();
    leaked[0].title = `Mutated Cycle ${cycle}`;

    // 4. Reset state
    await tasksService.resetState();

    // 5. Verify invariant preservation
    const resetTasks = await tasksService.getTasks();
    assert.equal(resetTasks.length, 8, `Cycle ${cycle}: Must reset to 8 baseline tasks`);
    assert.equal(resetTasks[0].id, 'task-stitch-1', `Cycle ${cycle}: First task must be stitch-1`);
    assert.equal(resetTasks[0].isCompleted, true, `Cycle ${cycle}: stitch-1 must be completed`);

    const resetProjects = await tasksService.getActiveProjects();
    assert.equal(resetProjects.length, 3, `Cycle ${cycle}: Must have 3 projects`);
    assert.equal(resetProjects[0].progressPercentage, 72);
    assert.equal(resetProjects[0].tasksCompleted, 8);
    assert.equal(resetProjects[0].totalTasks, 11);
    assert.equal(resetProjects[1].progressPercentage, 45);
    assert.equal(resetProjects[2].progressPercentage, 85);

    const resetRhythm = await tasksService.getWeeklyRhythm();
    assert.equal(resetRhythm.length, 7, `Cycle ${cycle}: Weekly rhythm must have 7 days`);

    const resetPhases = await tasksService.getSystemPhases();
    assert.equal(resetPhases.length, 3, `Cycle ${cycle}: System phases must have 3 items`);
  }
  console.log('    -> PASS: 50 cycles of chaos mutations cleanly reset with zero leaks');

  // 5.2 Simultaneous resetState calls
  console.log('  5.2 Concurrent resetState calls...');
  await Promise.all(Array.from({ length: 20 }, () => tasksService.resetState()));
  const finalTasks = await tasksService.getTasks();
  assert.equal(finalTasks.length, 8, 'Concurrent resets must preserve 8 tasks');
  const finalProjects = await tasksService.getActiveProjects();
  assert.equal(finalProjects.length, 3, 'Concurrent resets must preserve 3 projects');
  console.log('    -> PASS: Concurrent resets executed cleanly');

  // --------------------------------------------------------------------------
  // SUITE 6: Aggregated getTasksPageData End-to-End Integrity
  // --------------------------------------------------------------------------
  console.log('\n>>> SUITE 6: getTasksPageData Aggregation Integrity');
  const pageData = await tasksService.getTasksPageData();
  assert.equal(pageData.tasks.length, 5, 'Page data tasks should return 5 today tasks');
  assert.equal(pageData.activeProjects.length, 3, 'Page data should have 3 projects');
  assert.equal(pageData.weeklyRhythm.length, 7, 'Page data should have 7 weekly rhythm days');
  assert.equal(pageData.executionRhythm.title, 'Rhythm Guardrail');
  assert.equal(pageData.velocityMetrics.completedCount, 3);
  assert.equal(pageData.systemPhases.length, 3);
  console.log('    -> PASS: Full page data aggregation operates flawlessly');

  console.log('\n================================================================');
  console.log('ADVERSARIAL STRESS SUITE COMPLETED: 100% OF TESTS PASSED');
  console.log('================================================================');
}

runAdversarialStressSuite().catch((err) => {
  console.error('\n*** ADVERSARIAL STRESS TEST FAILED ***\n', err);
  process.exit(1);
});
