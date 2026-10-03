import assert from 'node:assert/strict';
import { calendarService } from '../src/services/calendarService';
import { NewCalendarEventPayload } from '../src/types/models';

async function runCalendarTestSuite() {
  console.log('--- STARTING CALENDAR & GOALS NEXUS SERVICE INTEGRITY SUITE ---');
  await calendarService.resetState();

  // Test 1: Calendar Days Matrix Retrieval (35 cells for Sep 2026)
  console.log('Test 1: Verify 35-day calendar matrix for September 2026');
  const days = await calendarService.getCalendarDays('2026-09');
  assert.equal(days.length, 35, 'Calendar matrix must have 35 day cells (5 weeks x 7 days)');
  const sep11 = days.find((d) => d.dateKey === '2026-09-11');
  assert.ok(sep11, 'September 11 must be present in calendar matrix');
  assert.equal(sep11?.dayNumber, 11, 'September 11 dayNumber must be 11');
  assert.equal(sep11?.isToday, true, 'September 11 must be marked as isToday');
  assert.equal(sep11?.isCurrentMonth, true, 'September 11 must be marked as current month');
  assert.equal(sep11?.financeAmount, -1300, 'September 11 finance amount must be -1300');
  assert.equal(sep11?.tasksDone, 3, 'September 11 tasksDone must be 3');
  assert.equal(sep11?.tasksTotal, 5, 'September 11 tasksTotal must be 5');
  assert.equal(sep11?.hasJournal, true, 'September 11 must have journal inscription');
  console.log('  -> PASS: 35-day matrix and Sep 11 verified accurately');

  // Test 2: Sep 11 Active Day Nexus Inspector Data
  console.log('Test 2: Verify Sep 11 Day Nexus Inspector telemetry');
  const inspector11 = await calendarService.getDayInspectorData('2026-09-11');
  assert.equal(inspector11.dateTitle, 'Friday, September 11, 2026');
  assert.equal(inspector11.tasksDone, 3);
  assert.equal(inspector11.tasksPending, 2);
  assert.equal(inspector11.tasksList.length, 5);
  assert.equal(inspector11.ledgerItems.length, 3);
  assert.equal(inspector11.ledgerTotal, -1300);
  assert.ok(inspector11.journalQuote.length > 0);
  assert.equal(inspector11.cadenceDelta, '+2.4% to Reserve');
  console.log('  -> PASS: Day Nexus Inspector telemetry verified');

  // Test 3: Synthesized Day Inspector for other days
  console.log('Test 3: Verify dynamic inspector data synthesis for non-anchor days');
  const inspector15 = await calendarService.getDayInspectorData('2026-09-15');
  assert.ok(inspector15.dateTitle.includes('September 15, 2026'));
  assert.ok(inspector15.tasksList.length >= 2);
  assert.ok(inspector15.ledgerItems.length >= 1);
  console.log('  -> PASS: Dynamic inspector synthesis verified');

  // Test 4: Task Toggle Interactivity
  console.log('Test 4: Verify interactive task toggling on selected day');
  const initialTask = inspector11.tasksList[3]; // 4th task is incomplete (index 3)
  assert.equal(initialTask.isCompleted, false);
  const updatedInspector = await calendarService.toggleDayTask('2026-09-11', initialTask.id);
  const toggledTask = updatedInspector.tasksList.find((t) => t.id === initialTask.id);
  assert.equal(toggledTask?.isCompleted, true, 'Task completion should toggle to true');
  assert.equal(updatedInspector.tasksDone, 4, 'tasksDone should increase to 4');
  assert.equal(updatedInspector.tasksPending, 1, 'tasksPending should decrease to 1');

  // Verify reflection in calendarDays matrix
  const daysAfterToggle = await calendarService.getCalendarDays('2026-09');
  const sep11After = daysAfterToggle.find((d) => d.dateKey === '2026-09-11');
  assert.equal(sep11After?.tasksDone, 4);
  console.log('  -> PASS: Task toggle and matrix synchronization verified');

  // Test 5: Sovereign Goals Retrieval
  console.log('Test 5: Verify Sovereign Goals Hub items');
  const goals = await calendarService.getSovereignGoals();
  assert.equal(goals.length, 3, 'Must have 3 persistent sovereign goals');
  const capital = goals.find((g) => g.id === 'goal-capital-reserve');
  assert.ok(capital, 'Annual Capital Reserve goal must exist');
  assert.equal(capital?.progressPercentage, 72);
  assert.ok(capital?.title.includes('Rs. 100,000'));
  assert.equal(capital?.targetHorizon, 'Dec 31, 2026');
  assert.equal(capital?.gapMetric, 'Gap: Rs. 28,000');
  const nextjs = goals.find((g) => g.id === 'goal-nextjs-mastery');
  assert.ok(nextjs, 'Next.js 15 Mastery goal must exist');
  assert.equal(nextjs?.progressPercentage, 70);
  const resilience = goals.find((g) => g.id === 'goal-physical-resilience');
  assert.ok(resilience, 'Physical Resilience goal must exist');
  assert.equal(resilience?.progressPercentage, 82);
  console.log('  -> PASS: Sovereign Goals accurately configured');

  // Test 6: Goal Progress Update & Boundary Clamping
  console.log('Test 6: Verify updating goal progress with boundary clamping');
  const updatedGoal = await calendarService.updateGoalProgress('goal-nextjs-mastery', 75);
  assert.equal(updatedGoal.progressPercentage, 75);
  // Clamping over 100
  const clampedGoal = await calendarService.updateGoalProgress('goal-nextjs-mastery', 120);
  assert.equal(clampedGoal.progressPercentage, 100);
  // Clamping below 0
  const minClamped = await calendarService.updateGoalProgress('goal-nextjs-mastery', -10);
  assert.equal(minClamped.progressPercentage, 0);
  console.log('  -> PASS: Goal progress update and boundary clamping verified');

  // Test 7: Temporal Health Metrics
  console.log('Test 7: Verify Matrix Temporal Health metrics');
  const health = await calendarService.getTemporalHealth('2026-09');
  assert.equal(health.monthName, 'September 2026');
  assert.equal(health.operationalEquilibriumTitle, 'September Operational Equilibrium');
  assert.ok(health.tasksResolvedCount >= 41);
  assert.equal(health.tasksTotalCount, 48);
  assert.equal(health.netBalanceMtd, 18340);
  assert.equal(health.currency, 'INR');
  console.log('  -> PASS: Temporal Health metrics verified');

  // Test 8: Add New Event / Entry
  console.log('Test 8: Verify adding new calendar event/entry');
  const newEvent: NewCalendarEventPayload = {
    title: 'Strategic Portfolio Review',
    date: '2026-09-18',
    type: 'event',
    amount: 0,
  };
  const updatedDay = await calendarService.addEvent(newEvent);
  assert.equal(updatedDay.dateKey, '2026-09-18');
  assert.equal(updatedDay.specialNote, 'Strategic Portfolio Review');
  console.log('  -> PASS: Adding new calendar entry verified');

  // Test 9: Immutability and State Protection
  console.log('Test 9: Verify deep cloning protects service state');
  const daysCopy = await calendarService.getCalendarDays('2026-09');
  daysCopy[0].dayNumber = 999;
  const daysVerify = await calendarService.getCalendarDays('2026-09');
  assert.notEqual(daysVerify[0].dayNumber, 999, 'Mutating return value must not affect internal state');
  console.log('  -> PASS: Immutability verified');

  // Test 10: Reset State
  console.log('Test 10: Reset state to pristine fixtures');
  await calendarService.resetState();
  const resetDays = await calendarService.getCalendarDays('2026-09');
  const resetSep11 = resetDays.find((d) => d.dateKey === '2026-09-11');
  assert.equal(resetSep11?.tasksDone, 3, 'tasksDone should reset to 3');
  console.log('  -> PASS: Reset state operates cleanly');

  console.log('--- ALL CALENDAR & GOALS NEXUS TESTS PASSED (10/10) ---');
}

runCalendarTestSuite().catch((err) => {
  console.error('Test Suite Failed:', err);
  process.exit(1);
});
