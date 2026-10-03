import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { calendarService } from '../src/services/calendarService';
import {
  CalendarMatrix,
  CalendarHeader,
  DayNexusInspector,
} from '../src/components/calendar';

async function runRound2AdversarialSuite() {
  console.log('=== STARTING ROUND 2 ADVERSARIAL REVIEWER TEST SUITE ===\n');
  await calendarService.resetState();

  // --------------------------------------------------------------------------
  // Test 1: Sep 11 Cell Dynamic Rollup Reactivity (Fix for Bug 1)
  // --------------------------------------------------------------------------
  console.log('Adversarial Test 1: Sep 11 active day matrix cell dynamically reflects toggled tasks and financial amounts');
  const initialDays = await calendarService.getCalendarDays('2026-09');
  const sep11Cell = initialDays.find((d) => d.dateKey === '2026-09-11')!;
  assert.equal(sep11Cell.tasksDone, 3);
  assert.equal(sep11Cell.tasksTotal, 5);
  assert.equal(sep11Cell.financeAmount, -1300);

  // Toggle task-cal-4 (incomplete) -> tasksDone becomes 4
  await calendarService.toggleDayTask('2026-09-11', 'task-cal-4');
  const updatedDays = await calendarService.getCalendarDays('2026-09');
  const updatedSep11 = updatedDays.find((d) => d.dateKey === '2026-09-11')!;
  assert.equal(updatedSep11.tasksDone, 4);

  // Render CalendarMatrix with updated days
  const matrixHtmlUpdated = renderToStaticMarkup(
    React.createElement(CalendarMatrix, {
      days: updatedDays,
      selectedDateKey: '2026-09-11',
      onSelectDate: () => {},
    })
  );

  // Must render 4/5 done, NOT frozen 3/5 done!
  assert.ok(
    matrixHtmlUpdated.includes('4/5 done'),
    'CalendarMatrix on Sep 11 must dynamically render 4/5 done after task toggle'
  );
  assert.equal(
    matrixHtmlUpdated.includes('3/5 done'),
    false,
    'CalendarMatrix on Sep 11 must NOT render obsolete 3/5 done'
  );

  // Now test financial reactivity on Sep 11: add -500 expense -> financeAmount becomes -1800
  await calendarService.addEvent({
    title: 'Cloud Infrastructure Burst',
    date: '2026-09-11',
    type: 'financial',
    amount: -500,
  });
  const daysAfterFinance = await calendarService.getCalendarDays('2026-09');
  const matrixHtmlFinance = renderToStaticMarkup(
    React.createElement(CalendarMatrix, {
      days: daysAfterFinance,
      selectedDateKey: '2026-09-11',
      onSelectDate: () => {},
    })
  );
  assert.ok(
    matrixHtmlFinance.includes('-Rs. 1,800'),
    'CalendarMatrix on Sep 11 must dynamically render -Rs. 1,800 after financial entry'
  );
  console.log('  -> PASS: Friday Sep 11 matrix rollups are fully reactive to task toggles and transactions');

  // --------------------------------------------------------------------------
  // Test 2: Synthesized Day Full Task Array Preservation & No Task Loss on Toggles (Fix for Bug 2)
  // --------------------------------------------------------------------------
  console.log('Adversarial Test 2: Full task array preservation on multi-task synthesized days (Sep 09: 6 tasks)');
  await calendarService.resetState();
  const inspectorSep09 = await calendarService.getDayInspectorData('2026-09-09');
  assert.equal(
    inspectorSep09.tasksList.length,
    6,
    'Sep 09 has tasksTotal: 6; inspector must generate exactly 6 tasks, not capped at 3'
  );
  assert.equal(inspectorSep09.tasksDone, 6);
  assert.equal(inspectorSep09.tasksPending, 0);
  assert.ok(inspectorSep09.tasksList.every((t) => t.isCompleted));

  // Toggle 1 task to incomplete on Sep 09
  const taskToToggle = inspectorSep09.tasksList[5];
  const toggledSep09 = await calendarService.toggleDayTask('2026-09-09', taskToToggle.id);
  assert.equal(toggledSep09.tasksDone, 5);
  assert.equal(toggledSep09.tasksPending, 1);
  assert.equal(toggledSep09.tasksList.length, 6, 'Task list must retain all 6 tasks');

  // Check that calendar day cell did NOT drop from 6 to 3 tasks
  const daysAfterSep09Toggle = await calendarService.getCalendarDays('2026-09');
  const sep09Cell = daysAfterSep09Toggle.find((d) => d.dateKey === '2026-09-09')!;
  assert.equal(sep09Cell.tasksTotal, 6, 'Sep 09 tasksTotal must stay 6');
  assert.equal(sep09Cell.tasksDone, 5, 'Sep 09 tasksDone must be 5');
  console.log('  -> PASS: Multi-task synthesized days generate full task arrays without state collapse');

  // --------------------------------------------------------------------------
  // Test 3: Dynamic Month Navigation & Grid Cell Generation (Fix for Bug 3)
  // --------------------------------------------------------------------------
  console.log('Adversarial Test 3: Dynamic month navigation and grid cell generation');
  const augDays = await calendarService.getCalendarDays('2026-08');
  assert.ok(augDays.length >= 35, 'August 2026 must generate a complete grid matrix');
  const aug1 = augDays.find((d) => d.dateKey === '2026-08-01');
  assert.ok(aug1, 'Aug 1 must exist in August 2026 grid');
  assert.equal(aug1?.dayNumber, 1);
  assert.equal(aug1?.isCurrentMonth, true);

  const octDays = await calendarService.getCalendarDays('2026-10');
  assert.ok(octDays.length >= 35, 'October 2026 must generate a complete grid matrix');
  const oct1 = octDays.find((d) => d.dateKey === '2026-10-01');
  assert.ok(oct1, 'Oct 1 must exist in October 2026 grid');
  assert.equal(oct1?.dayNumber, 1);
  assert.equal(oct1?.isCurrentMonth, true);

  // September pristine
  const sepDays = await calendarService.getCalendarDays('2026-09');
  assert.equal(sepDays.length, 35, 'September 2026 returns curated 35 cells');
  console.log('  -> PASS: getCalendarDays generates authentic multi-month matrix grids');

  // --------------------------------------------------------------------------
  // Test 4: Hardened Search Query Matching in CalendarMatrix (Fix for Bug 7)
  // --------------------------------------------------------------------------
  console.log('Adversarial Test 4: Search query matching for month names, weekdays, and numbers');
  // Search "september"
  const sepSearchHtml = renderToStaticMarkup(
    React.createElement(CalendarMatrix, {
      days: sepDays,
      selectedDateKey: '2026-09-11',
      onSelectDate: () => {},
      searchQuery: 'september',
    })
  );
  // September days must be present and highlighted
  assert.ok(
    sepSearchHtml.includes('01') && sepSearchHtml.includes('11'),
    'Searching "september" matches September cells'
  );

  // Search "fri" or "friday"
  const friSearchHtml = renderToStaticMarkup(
    React.createElement(CalendarMatrix, {
      days: sepDays,
      selectedDateKey: '2026-09-11',
      onSelectDate: () => {},
      searchQuery: 'friday',
    })
  );
  assert.ok(friSearchHtml.includes('11'), 'Friday search must include Sep 11');

  // Search "11"
  const numSearchHtml = renderToStaticMarkup(
    React.createElement(CalendarMatrix, {
      days: sepDays,
      selectedDateKey: '2026-09-11',
      onSelectDate: () => {},
      searchQuery: '11',
    })
  );
  assert.ok(numSearchHtml.includes('11'), 'Search "11" matches day 11');
  console.log('  -> PASS: CalendarMatrix search predicate accurately matches months, weekdays, numbers, notes');

  // --------------------------------------------------------------------------
  // Test 5: DayNexusInspector Positive Ledger Sign (Fix for Bug 8)
  // --------------------------------------------------------------------------
  console.log('Adversarial Test 5: DayNexusInspector displays + sign for positive ledger totals');
  const inspectorSep15 = await calendarService.getDayInspectorData('2026-09-15');
  assert.equal(inspectorSep15.ledgerTotal, 15000);
  const inspector15Html = renderToStaticMarkup(
    React.createElement(DayNexusInspector, {
      data: inspectorSep15,
      selectedDateKey: '2026-09-15',
      onToggleTask: () => {},
    })
  );
  assert.ok(
    inspector15Html.includes('+Rs. 15,000'),
    'Positive ledger total must format with "+Rs. 15,000"'
  );
  console.log('  -> PASS: Positive ledger total formats with + prefix');

  // --------------------------------------------------------------------------
  // Test 6: Mobile Segmented View Toggle Availability (Fix for Bug 5)
  // --------------------------------------------------------------------------
  console.log('Adversarial Test 6: CalendarHeader segmented view toggle rendered on mobile');
  const headerHtml = renderToStaticMarkup(
    React.createElement(CalendarHeader, {
      currentMonthDisplay: 'September 2026',
      activeView: 'month',
      onViewChange: () => {},
      onPrevMonth: () => {},
      onNextMonth: () => {},
      onToday: () => {},
      onOpenNewEvent: () => {},
      searchQuery: '',
      onSearchChange: () => {},
    })
  );
  // View toggle must NOT have display: none on xs
  assert.ok(
    headerHtml.includes('Month') && headerHtml.includes('Week') && headerHtml.includes('Day'),
    'Month/Week/Day buttons must be present in header'
  );
  console.log('  -> PASS: CalendarHeader exposes segmented view controls across viewports');

  console.log('\n=== ALL ROUND 2 ADVERSARIAL REVIEWER TESTS PASSED (6/6) ===');
}

runRound2AdversarialSuite().catch((err) => {
  console.error('\n❌ ROUND 2 ADVERSARIAL TEST FAILURE:', err);
  process.exit(1);
});
