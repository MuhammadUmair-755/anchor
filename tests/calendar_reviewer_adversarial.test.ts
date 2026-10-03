import assert from 'node:assert/strict';
import fs from 'node:fs';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { calendarService } from '../src/services/calendarService';
import {
  CalendarMatrix,
  CalendarHeader,
  AdjustMilestonesModal,
  NewEventModal,
} from '../src/components/calendar';

async function runFullAdversarialSuite() {
  console.log('=== STARTING ADVERSARIAL REVIEWER ROUND 1 TEST SUITE ===\n');
  await calendarService.resetState();

  // 1. Data Preservation during addEvent on Sep 11
  console.log('Adversarial Test 1: addEvent preserves curated Stitch inspector data and appends new task');
  const initialSep11 = await calendarService.getDayInspectorData('2026-09-11');
  assert.equal(initialSep11.tasksList.length, 5);
  assert.ok(initialSep11.tasksList.some((t) => t.title.includes('API Integration')));

  await calendarService.addEvent({
    title: 'Adversarial Verification Task',
    date: '2026-09-11',
    type: 'task',
  });

  const sep11After = await calendarService.getDayInspectorData('2026-09-11');
  assert.equal(sep11After.tasksList.length, 6, 'Inspector must now have 6 tasks');
  assert.ok(
    sep11After.tasksList.some((t) => t.title.includes('API Integration')),
    'Original Stitch tasks must NOT be erased'
  );
  assert.ok(
    sep11After.tasksList.some((t) => t.title === 'Adversarial Verification Task'),
    'New task title must be appended to tasksList'
  );
  assert.ok(
    sep11After.journalQuote.includes('Stabilizing the core pipelines today'),
    'Curated Stitch journal quote must be preserved'
  );
  assert.equal(sep11After.ledgerItems.length, 3, 'Curated ledger items must be preserved');
  console.log('  -> PASS: Authentic Stitch dataset preserved during event creation');

  // 2. Dynamic Temporal Health Tasks Resolved Synchronization
  console.log('Adversarial Test 2: Temporal Health tasksResolvedCount dynamically syncs on toggle');
  await calendarService.resetState();
  const initialHealth = await calendarService.getTemporalHealth('2026-09');
  assert.equal(initialHealth.tasksResolvedCount, 41);

  // Toggle task-cal-4 (incomplete) to complete
  await calendarService.toggleDayTask('2026-09-11', 'task-cal-4');
  const healthAfterComplete = await calendarService.getTemporalHealth('2026-09');
  assert.equal(
    healthAfterComplete.tasksResolvedCount,
    42,
    'tasksResolvedCount must increment from 41 to 42 when task completed'
  );

  // Toggle task-cal-4 back to incomplete
  await calendarService.toggleDayTask('2026-09-11', 'task-cal-4');
  const healthAfterIncomplete = await calendarService.getTemporalHealth('2026-09');
  assert.equal(
    healthAfterIncomplete.tasksResolvedCount,
    41,
    'tasksResolvedCount must decrement back to 41 when task uncompleted'
  );
  console.log('  -> PASS: tasksResolvedCount dynamically tracks task completions');

  // 3. Goal Progress Metric Recalculation
  console.log('Adversarial Test 3: Milestone calibration dynamically updates achievedMetric and gapMetric');
  const updatedCap = await calendarService.updateGoalProgress('goal-capital-reserve', 85);
  assert.equal(updatedCap.progressPercentage, 85);
  assert.equal(updatedCap.achievedMetric, 'Rs. 85,000 achieved');
  assert.equal(updatedCap.gapMetric, 'Gap: Rs. 15,000');

  const updatedNext = await calendarService.updateGoalProgress('goal-nextjs-mastery', 90);
  assert.equal(updatedNext.progressPercentage, 90);
  assert.equal(updatedNext.achievedMetric, '18 of 20 modules completed');
  assert.equal(updatedNext.gapMetric, '2 remaining');

  const updatedPhys = await calendarService.updateGoalProgress('goal-physical-resilience', 95);
  assert.equal(updatedPhys.progressPercentage, 95);
  assert.equal(updatedPhys.achievedMetric, '21 of 22 sessions logged this month');
  assert.equal(updatedPhys.gapMetric, 'Cadence on track');
  console.log('  -> PASS: Subtext metrics dynamically recalculated without stale strings');

  // 4. CalendarMatrix Active View Support
  console.log('Adversarial Test 4: CalendarMatrix supports month, week, and day active views');
  const allDays = await calendarService.getCalendarDays('2026-09');

  const monthHtml = renderToStaticMarkup(
    React.createElement(CalendarMatrix, {
      days: allDays,
      selectedDateKey: '2026-09-11',
      onSelectDate: () => {},
      activeView: 'month',
    })
  );
  assert.ok(monthHtml.includes('SUN') && monthHtml.includes('SAT'), 'Month view shows all 7 day headers');

  const weekHtml = renderToStaticMarkup(
    React.createElement(CalendarMatrix, {
      days: allDays,
      selectedDateKey: '2026-09-11',
      onSelectDate: () => {},
      activeView: 'week',
    })
  );
  assert.ok(weekHtml.includes('-Rs. 1,300'), 'Week view contains active Friday Sep 11');

  const dayHtml = renderToStaticMarkup(
    React.createElement(CalendarMatrix, {
      days: allDays,
      selectedDateKey: '2026-09-11',
      onSelectDate: () => {},
      activeView: 'day',
    })
  );
  assert.ok(dayHtml.includes('-Rs. 1,300'), 'Day view displays Sep 11 focus day');
  console.log('  -> PASS: CalendarMatrix activeView rendering verified');

  // 5. Iconography and Zero Raw Emojis
  console.log('Adversarial Test 5: Verify zero raw emojis and native MUI SVG iconography');
  const matrixMarkup = renderToStaticMarkup(
    React.createElement(CalendarMatrix, {
      days: allDays,
      selectedDateKey: '2026-09-11',
      onSelectDate: () => {},
    })
  );
  assert.equal(matrixMarkup.includes('⚓'), false, 'CalendarMatrix must NOT contain raw ⚓ emoji');
  assert.ok(matrixMarkup.includes('data-testid="AnchorIcon"'), 'Must render native MUI AnchorIcon');

  const newEventSrc = fs.readFileSync('src/components/calendar/NewEventModal.tsx', 'utf8');
  assert.equal(newEventSrc.includes('⚓'), false, 'NewEventModal must NOT contain raw ⚓ emoji');
  assert.ok(newEventSrc.includes('AnchorIcon'), 'NewEventModal must import and render AnchorIcon');

  const adjustSrc = fs.readFileSync('src/components/calendar/AdjustMilestonesModal.tsx', 'utf8');
  assert.equal(adjustSrc.includes('🎯'), false, 'AdjustMilestonesModal must NOT contain raw 🎯 emoji');
  assert.ok(adjustSrc.includes('TrackChangesIcon'), 'AdjustMilestonesModal must import and render TrackChangesIcon');
  console.log('  -> PASS: All raw emojis replaced with native MUI icons');

  // 6. Out-of-month cell selection state
  console.log('Adversarial Test 6: Out-of-month cell selection styling');
  const outOfMonthSelectedMarkup = renderToStaticMarkup(
    React.createElement(CalendarMatrix, {
      days: allDays,
      selectedDateKey: '2026-08-30',
      onSelectDate: () => {},
    })
  );
  assert.ok(
    outOfMonthSelectedMarkup.includes('inset 0 0 0 2px #40617E'),
    'Selected out-of-month cell must render selection ring'
  );
  console.log('  -> PASS: Out-of-month selection styling confirmed');

  console.log('\n=== ALL ADVERSARIAL REVIEWER TESTS PASSED (6/6) ===');
}

runFullAdversarialSuite().catch((err) => {
  console.error('\n❌ ADVERSARIAL SUITE ERROR:');
  console.error(err);
  process.exit(1);
});
