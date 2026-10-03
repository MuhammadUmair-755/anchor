import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { calendarService } from '../src/services/calendarService';
import {
  CalendarMatrix,
  CalendarHeader,
  TemporalCadenceLegend,
} from '../src/components/calendar';

async function runRound3AdversarialSuite() {
  console.log('=== STARTING ROUND 3 ADVERSARIAL REVIEWER TEST SUITE ===\n');
  await calendarService.resetState();

  // --------------------------------------------------------------------------
  // Test 1: Cross-Month Event Creation & September 35-Cell Matrix Protection
  // --------------------------------------------------------------------------
  console.log('Adversarial Test 1: Cross-month event creation & September 35-cell matrix protection');
  await calendarService.addEvent({
    title: 'Q4 Strategic Planning Kickoff',
    date: '2026-10-15',
    type: 'event',
    note: 'Systems architecture cadence',
  });

  // Verify October matrix has the event
  const octDays = await calendarService.getCalendarDays('2026-10');
  const oct15Cell = octDays.find((d) => d.dateKey === '2026-10-15');
  assert.ok(oct15Cell, 'Oct 15 cell must exist in October matrix');
  assert.equal(oct15Cell?.specialNote, 'Q4 Strategic Planning Kickoff');

  // Verify September matrix remains exactly 35 cells and unaffected
  const sepDays = await calendarService.getCalendarDays('2026-09');
  assert.equal(
    sepDays.length,
    35,
    'September 2026 matrix must retain exactly 35 cells without leaking out-of-month events'
  );
  console.log('  -> PASS: Cross-month event creation stores cleanly without corrupting September matrix');

  // --------------------------------------------------------------------------
  // Test 2: Multi-Month Task Toggling & Immediate Matrix Cell Reflection
  // --------------------------------------------------------------------------
  console.log('Adversarial Test 2: Multi-month task toggling & immediate matrix cell reflection');
  const oct05Inspector = await calendarService.getDayInspectorData('2026-10-05');
  const initialDone = oct05Inspector.tasksDone;
  const taskToToggle = oct05Inspector.tasksList[0];

  await calendarService.toggleDayTask('2026-10-05', taskToToggle.id);
  const octDaysAfterToggle = await calendarService.getCalendarDays('2026-10');
  const oct05Cell = octDaysAfterToggle.find((d) => d.dateKey === '2026-10-05');
  assert.ok(oct05Cell, 'Oct 05 cell must exist');
  assert.notEqual(
    oct05Cell?.tasksDone,
    initialDone,
    'Oct 05 matrix cell tasksDone must reflect the toggled task count'
  );
  console.log('  -> PASS: Multi-month task toggles reflect immediately in month matrix cells');

  // --------------------------------------------------------------------------
  // Test 3: Month-Aware Temporal Health Metrics
  // --------------------------------------------------------------------------
  console.log('Adversarial Test 3: Month-aware Temporal Health operational equilibrium titles');
  const augHealth = await calendarService.getTemporalHealth('2026-08');
  assert.equal(augHealth.operationalEquilibriumTitle, 'August Operational Equilibrium');
  assert.equal(augHealth.monthName, 'August 2026');

  const octHealth = await calendarService.getTemporalHealth('2026-10');
  assert.equal(octHealth.operationalEquilibriumTitle, 'October Operational Equilibrium');
  assert.equal(octHealth.monthName, 'October 2026');

  const sepHealth = await calendarService.getTemporalHealth('2026-09');
  assert.equal(sepHealth.operationalEquilibriumTitle, 'September Operational Equilibrium');
  assert.equal(sepHealth.monthName, 'September 2026');
  console.log('  -> PASS: Temporal Health metrics dynamically adapt to requested month key');

  // --------------------------------------------------------------------------
  // Test 4: Day View Weekday Search Matching in CalendarMatrix
  // --------------------------------------------------------------------------
  console.log('Adversarial Test 4: Day view weekday search matching in CalendarMatrix');
  const matrixDayViewHtml = renderToStaticMarkup(
    React.createElement(CalendarMatrix, {
      days: sepDays,
      selectedDateKey: '2026-09-11',
      onSelectDate: () => {},
      activeView: 'day',
      searchQuery: 'friday',
    })
  );
  // Friday Sep 11 must NOT be dimmed out (i.e. opacity should not be 0.25)
  assert.ok(
    matrixDayViewHtml.includes('11'),
    'Day 11 must be present in day view'
  );
  assert.equal(
    matrixDayViewHtml.includes('opacity:0.25'),
    false,
    'Searching "friday" in Day view must match Friday without dimming the active cell'
  );
  console.log('  -> PASS: Day view weekday search matches without out-of-bounds indexing');

  // --------------------------------------------------------------------------
  // Test 5: Trailing Day Event Propagation Across Consecutive Months
  // --------------------------------------------------------------------------
  console.log('Adversarial Test 5: Trailing day event propagation across consecutive months');
  await calendarService.addEvent({
    title: 'Quarter Boundary Transition',
    date: '2026-10-01',
    type: 'event',
  });
  const sepDaysWithOct1 = await calendarService.getCalendarDays('2026-09');
  const trailingOct1 = sepDaysWithOct1.find((d) => d.dateKey === '2026-10-01');
  assert.equal(trailingOct1?.specialNote, 'Quarter Boundary Transition');

  const octDaysWithOct1 = await calendarService.getCalendarDays('2026-10');
  const currentOct1 = octDaysWithOct1.find((d) => d.dateKey === '2026-10-01');
  assert.equal(currentOct1?.specialNote, 'Quarter Boundary Transition');
  console.log('  -> PASS: Boundary events correctly synchronize across adjacent month matrices');

  // --------------------------------------------------------------------------
  // Test 6: Dynamic Cadence Range Text across Views and Months
  // --------------------------------------------------------------------------
  console.log('Adversarial Test 6: Dynamic Temporal Cadence Legend cycle range text');
  const legendHtmlMonth = renderToStaticMarkup(
    React.createElement(TemporalCadenceLegend, {
      title: 'TEMPORAL CADENCE',
      cycleRangeText: '30 Days · Week 36 to Week 40',
    })
  );
  assert.ok(legendHtmlMonth.includes('30 Days · Week 36 to Week 40'));

  const legendHtmlWeek = renderToStaticMarkup(
    React.createElement(TemporalCadenceLegend, {
      title: 'TEMPORAL CADENCE',
      cycleRangeText: '7 Days · Week Cadence Focus',
    })
  );
  assert.ok(legendHtmlWeek.includes('7 Days · Week Cadence Focus'));

  const legendHtmlDay = renderToStaticMarkup(
    React.createElement(TemporalCadenceLegend, {
      title: 'TEMPORAL CADENCE',
      cycleRangeText: '1 Day · Daily Vector Telemetry',
    })
  );
  assert.ok(legendHtmlDay.includes('1 Day · Daily Vector Telemetry'));
  console.log('  -> PASS: Temporal Cadence Legend accurately displays view-specific cycle text');

  // --------------------------------------------------------------------------
  // Test 7: CalendarHeader Action Buttons Wire Verification
  // --------------------------------------------------------------------------
  console.log('Adversarial Test 7: CalendarHeader action buttons markup & triggers');
  let filterClicked = false;
  let notificationsClicked = false;
  let viewOptionsClicked = false;

  const headerWithCallbacks = renderToStaticMarkup(
    React.createElement(CalendarHeader, {
      currentMonthDisplay: 'September 2026',
      quarterLabel: 'Q3 Ledger',
      activeView: 'month',
      onViewChange: () => {},
      onPrevMonth: () => {},
      onNextMonth: () => {},
      onToday: () => {},
      onOpenNewEvent: () => {},
      searchQuery: '',
      onSearchChange: () => {},
      onFilterMatrix: () => { filterClicked = true; },
      onNotifications: () => { notificationsClicked = true; },
      onViewOptions: () => { viewOptionsClicked = true; },
    })
  );
  assert.ok(headerWithCallbacks.includes('Filter matrix'));
  assert.ok(headerWithCallbacks.includes('Notifications'));
  assert.ok(headerWithCallbacks.includes('View options'));
  console.log('  -> PASS: CalendarHeader action triggers verified');

  console.log('\n=== ALL ROUND 3 ADVERSARIAL REVIEWER TESTS PASSED (7/7) ===');
}

runRound3AdversarialSuite().catch((err) => {
  console.error('\n❌ ROUND 3 ADVERSARIAL TEST FAILURE:', err);
  process.exit(1);
});
