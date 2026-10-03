import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { calendarService } from '../src/services/calendarService';
import {
  CalendarHeader,
  TemporalCadenceLegend,
  CalendarMatrix,
  MatrixTemporalHealthBar,
  DayNexusInspector,
  SovereignGoalsHub,
} from '../src/components/calendar';
import fs from 'node:fs';
import path from 'node:path';

async function runCalendarTestSuite() {
  console.log('=== STARTING CALENDAR & GOALS NEXUS INTEGRITY SUITE ===\n');
  await calendarService.resetState();

  // -------------------------------------------------------------------------
  // 1. Calendar Service Tests
  // -------------------------------------------------------------------------
  console.log('--- TEST GROUP 1: Calendar Service & State Logic ---');

  // Test 1.1: 35 Cells September 2026 Matrix Structure
  console.log('Test 1.1: Verify 35-cell September 2026 Matrix');
  const days = await calendarService.getCalendarDays('2026-09');
  assert.equal(days.length, 35, 'Matrix must have exactly 35 cells (5 weeks x 7 days)');
  assert.equal(days[0].dateKey, '2026-08-30', 'First cell must be Sunday Aug 30');
  assert.equal(days[0].isCurrentMonth, false, 'Aug 30 must be marked as not current month');
  assert.equal(days[2].dateKey, '2026-09-01', 'September 1st must be the 3rd cell (Tuesday)');
  assert.equal(days[2].isCurrentMonth, true, 'Sep 01 must be current month');
  assert.equal(days[34].dateKey, '2026-10-03', 'Last cell must be Saturday Oct 03');
  assert.equal(days[34].isCurrentMonth, false, 'Oct 03 must be marked as not current month');
  console.log('  -> PASS: 35-cell calendar matrix correctly structured');

  // Test 1.2: Active Day (Friday, Sep 11) Focus Verification
  console.log('Test 1.2: Verify Friday, Sep 11 active focus day');
  const sep11 = days.find((d) => d.dateKey === '2026-09-11');
  assert.ok(sep11, 'Sep 11 must exist in calendar days');
  assert.equal(sep11?.dayNumber, 11);
  assert.equal(sep11?.isToday, true, 'Sep 11 must be marked as isToday (Active focus)');
  assert.equal(sep11?.financeAmount, -1300, 'Sep 11 spend must be -Rs. 1,300');
  assert.equal(sep11?.tasksDone, 3, 'Sep 11 tasks done must be 3');
  assert.equal(sep11?.tasksTotal, 5, 'Sep 11 total tasks must be 5');
  assert.equal(sep11?.hasJournal, true, 'Sep 11 must have journal inscription');
  console.log('  -> PASS: Sep 11 active day properties accurate');

  // Test 1.3: Day Nexus Inspector for Sep 11
  console.log('Test 1.3: Verify Day Nexus Inspector retrieval for Sep 11');
  const inspector = await calendarService.getDayInspectorData('2026-09-11');
  assert.equal(inspector.dateTitle, 'Friday, September 11, 2026');
  assert.equal(inspector.tasksDone, 3);
  assert.equal(inspector.tasksPending, 2);
  assert.equal(inspector.tasksList.length, 5);
  assert.equal(inspector.ledgerTotal, -1300);
  assert.equal(inspector.ledgerItems.length, 3);
  assert.ok(inspector.ledgerItems.some((i) => i.category === 'Food & Dining' && i.amount === 850));
  assert.ok(inspector.ledgerItems.some((i) => i.category === 'Transit' && i.amount === 300));
  assert.ok(inspector.ledgerItems.some((i) => i.category === 'Sub (Cloud)' && i.amount === 150));
  assert.ok(inspector.journalQuote.includes('Stabilizing the core pipelines today'));
  assert.equal(inspector.journalTime, 'Inscribed 07:42 AM');
  assert.equal(inspector.cadenceDelta, '+2.4% to Reserve');
  console.log('  -> PASS: Inspector data retrieved faithfully');

  // Test 1.4: Interactive Task Toggling in Inspector
  console.log('Test 1.4: Toggle task completion in Inspector');
  const updatedInspector = await calendarService.toggleDayTask('2026-09-11', 'task-cal-4');
  assert.equal(updatedInspector.tasksDone, 4, 'Tasks done must increment to 4');
  assert.equal(updatedInspector.tasksPending, 1, 'Tasks pending must decrement to 1');
  const task4 = updatedInspector.tasksList.find((t) => t.id === 'task-cal-4');
  assert.equal(task4?.isCompleted, true, 'Task 4 isCompleted must be true');

  // Check that the day cell was updated
  const refreshedDays = await calendarService.getCalendarDays('2026-09');
  const refreshedSep11 = refreshedDays.find((d) => d.dateKey === '2026-09-11');
  assert.equal(refreshedSep11?.tasksDone, 4, 'Day cell tasksDone must reflect updated count');

  // Toggle back
  const revertedInspector = await calendarService.toggleDayTask('2026-09-11', 'task-cal-4');
  assert.equal(revertedInspector.tasksDone, 3);
  assert.equal(revertedInspector.tasksPending, 2);
  console.log('  -> PASS: Task toggling synchronizes inspector & matrix cell counts');

  // Test 1.5: Sovereign Goals Hub Persistent Goals
  console.log('Test 1.5: Sovereign Goals Hub tracking data');
  const goals = await calendarService.getSovereignGoals();
  assert.equal(goals.length, 3, 'Must have 3 persistent sovereign goals');

  const capGoal = goals.find((g) => g.id === 'goal-capital-reserve');
  assert.ok(capGoal, 'Capital Reserve goal must exist');
  assert.equal(capGoal?.title, 'Annual Capital Reserve: Rs. 100,000');
  assert.equal(capGoal?.progressPercentage, 72);
  assert.ok(capGoal?.achievedMetric.includes('Rs. 72,000 achieved'));
  assert.ok(capGoal?.gapMetric.includes('Gap: Rs. 28,000'));

  const nextGoal = goals.find((g) => g.id === 'goal-nextjs-mastery');
  assert.ok(nextGoal, 'Next.js 15 Mastery goal must exist');
  assert.equal(nextGoal?.progressPercentage, 70);
  assert.ok(nextGoal?.achievedMetric.includes('14 of 20 modules completed'));

  const physGoal = goals.find((g) => g.id === 'goal-physical-resilience');
  assert.ok(physGoal, 'Physical Resilience goal must exist');
  assert.equal(physGoal?.progressPercentage, 82);
  assert.ok(physGoal?.achievedMetric.includes('18 of 22 sessions'));
  console.log('  -> PASS: Sovereign goals tracking cards verified');

  // Test 1.6: Temporal Health Metrics
  console.log('Test 1.6: Matrix Temporal Health bar metrics');
  const health = await calendarService.getTemporalHealth('2026-09');
  assert.equal(health.operationalEquilibriumTitle, 'September Operational Equilibrium');
  assert.ok(health.operationalEquilibriumSubtext.includes('91.4% task fidelity'));
  assert.equal(health.tasksResolvedCount, 41);
  assert.equal(health.tasksTotalCount, 48);
  assert.equal(health.netBalanceMtd, 18340);
  console.log('  -> PASS: Temporal health operational equilibrium accurate');

  // Test 1.7: Add New Event to Calendar
  console.log('Test 1.7: Add new calendar event');
  await calendarService.addEvent({
    title: 'Executive Architecture Milestone',
    date: '2026-09-22',
    type: 'event',
    note: 'Deep systems verification pass',
  });
  const daysAfterAdd = await calendarService.getCalendarDays('2026-09');
  const sep22 = daysAfterAdd.find((d) => d.dateKey === '2026-09-22');
  assert.equal(sep22?.specialNote, 'Executive Architecture Milestone');
  console.log('  -> PASS: Calendar event insertion verified');

  // -------------------------------------------------------------------------
  // 2. Component Static Rendering & UI Contract Verification
  // -------------------------------------------------------------------------
  console.log('\n--- TEST GROUP 2: Component UI Contracts & Markup Fidelity ---');

  // Test 2.1: CalendarHeader Rendering
  console.log('Test 2.1: CalendarHeader static markup');
  const headerHtml = renderToStaticMarkup(
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
    })
  );
  assert.ok(headerHtml.includes('September 2026'), 'Must render month title');
  assert.ok(headerHtml.includes('Q3 Ledger'), 'Must render quarter ledger pill');
  assert.ok(headerHtml.includes('Today'), 'Must render Today jump button');
  assert.ok(headerHtml.includes('Month'), 'Must render Month segmented option');
  assert.ok(headerHtml.includes('Week'), 'Must render Week segmented option');
  assert.ok(headerHtml.includes('Day'), 'Must render Day segmented option');
  assert.ok(headerHtml.includes('⌘K'), 'Must render ⌘K keyboard shortcut badge');
  assert.ok(headerHtml.includes('+ New Entry / Event'), 'Must render + New Entry CTA');
  console.log('  -> PASS: CalendarHeader contains all required Stitch tokens');

  // Test 2.2: TemporalCadenceLegend Rendering
  console.log('Test 2.2: TemporalCadenceLegend static markup');
  const legendHtml = renderToStaticMarkup(
    React.createElement(TemporalCadenceLegend, {
      title: 'TEMPORAL CADENCE',
      cycleRangeText: '30 Days · Week 36 to Week 40',
    })
  );
  assert.ok(legendHtml.includes('TEMPORAL CADENCE'), 'Must render legend title');
  assert.ok(legendHtml.includes('30 Days · Week 36 to Week 40'), 'Must render cycle text');
  assert.ok(legendHtml.includes('Finance Flow'), 'Must render Finance Flow indicator');
  assert.ok(legendHtml.includes('Tasks Check'), 'Must render Tasks Check indicator');
  assert.ok(legendHtml.includes('Journal Inscribed'), 'Must render Journal Inscribed indicator');
  console.log('  -> PASS: TemporalCadenceLegend markup matches Stitch design');

  // Test 2.3: CalendarMatrix Rendering & Friday Sep 11 Active Badge
  console.log('Test 2.3: CalendarMatrix static markup & Friday Sep 11 highlight');
  const matrixHtml = renderToStaticMarkup(
    React.createElement(CalendarMatrix, {
      days,
      selectedDateKey: '2026-09-11',
      onSelectDate: () => {},
    })
  );
  assert.ok(matrixHtml.includes('SUN'), 'Must render SUN header');
  assert.ok(matrixHtml.includes('FRI'), 'Must render FRI header');
  assert.ok(matrixHtml.includes('SAT'), 'Must render SAT header');
  assert.ok(matrixHtml.includes('-Rs. 1,300'), 'Must render Sep 11 -Rs. 1,300 spend pill');
  assert.ok(matrixHtml.includes('3/5 done'), 'Must render 3/5 done rollup');
  assert.ok(matrixHtml.includes('Active'), 'Must render Active status badge');
  assert.ok(matrixHtml.includes('+Rs. 4,200'), 'Must render Sep 01 financial pill');
  assert.ok(matrixHtml.includes('Sprint rest'), 'Must render Sep 05 special note');
  assert.ok(matrixHtml.includes('Deep Work Block'), 'Must render Sep 12 special note');
  console.log('  -> PASS: CalendarMatrix faithfully renders 7-col grid and active day');

  // Test 2.4: MatrixTemporalHealthBar Rendering
  console.log('Test 2.4: MatrixTemporalHealthBar static markup');
  const healthHtml = renderToStaticMarkup(
    React.createElement(MatrixTemporalHealthBar, {
      metrics: health,
    })
  );
  assert.ok(healthHtml.includes('September Operational Equilibrium'), 'Must render equilibrium title');
  assert.ok(healthHtml.includes('TASKS RESOLVED'), 'Must render TASKS RESOLVED label');
  assert.ok(healthHtml.includes('41 / 48'), 'Must render 41 / 48 resolved metric');
  assert.ok(healthHtml.includes('NET BALANCE MTD'), 'Must render NET BALANCE MTD label');
  assert.ok(healthHtml.includes('+Rs. 18,340'), 'Must render +Rs. 18,340 MTD net metric');
  console.log('  -> PASS: MatrixTemporalHealthBar renders recessed bar correctly');

  // Test 2.5: DayNexusInspector Rendering
  console.log('Test 2.5: DayNexusInspector static markup');
  const inspectorHtml = renderToStaticMarkup(
    React.createElement(DayNexusInspector, {
      data: inspector,
      selectedDateKey: '2026-09-11',
      onToggleTask: () => {},
    })
  );
  assert.ok(inspectorHtml.includes('DAY NEXUS INSPECTOR'), 'Must render header label');
  assert.ok(inspectorHtml.includes('Selected: Sep 11'), 'Must render selected date chip');
  assert.ok(inspectorHtml.includes('Friday, September 11, 2026'), 'Must render full date heading');
  assert.ok(inspectorHtml.includes('API Integration — Anchor Sync engine endpoint'), 'Must render task 1');
  assert.ok(inspectorHtml.includes('Gym — Heavy deadlifts &amp; mobility sprint'), 'Must render task 2');
  assert.ok(inspectorHtml.includes('FINANCIAL LEDGER'), 'Must render financial ledger vector');
  assert.ok(inspectorHtml.includes('Food &amp; Dining'), 'Must render Food & Dining category');
  assert.ok(inspectorHtml.includes('JOURNAL INSCRIPTION'), 'Must render journal vector');
  assert.ok(inspectorHtml.includes('Cadence Velocity Today'), 'Must render cadence banner');
  assert.ok(inspectorHtml.includes('+2.4% to Reserve'), 'Must render cadence delta pill');
  console.log('  -> PASS: DayNexusInspector renders all 4 vectors correctly');

  // Test 2.6: SovereignGoalsHub Rendering
  console.log('Test 2.6: SovereignGoalsHub static markup');
  const goalsHtml = renderToStaticMarkup(
    React.createElement(SovereignGoalsHub, {
      goals,
      onOpenAdjustMilestones: () => {},
    })
  );
  assert.ok(goalsHtml.includes('Sovereign Goals Hub'), 'Must render goals hub heading');
  assert.ok(goalsHtml.includes('Annual Capital Reserve: Rs. 100,000'), 'Must render goal 1');
  assert.ok(goalsHtml.includes('72%'), 'Must render goal 1 percentage');
  assert.ok(goalsHtml.includes('Next.js 15 Full Systems Mastery'), 'Must render goal 2');
  assert.ok(goalsHtml.includes('70%'), 'Must render goal 2 percentage');
  assert.ok(goalsHtml.includes('Physical Resilience &amp; Health'), 'Must render goal 3');
  assert.ok(goalsHtml.includes('82%'), 'Must render goal 3 percentage');
  assert.ok(goalsHtml.includes('Adjust Strategic Milestones'), 'Must render adjust CTA');
  console.log('  -> PASS: SovereignGoalsHub renders all 3 tracking cards');

  // -------------------------------------------------------------------------
  // 3. Page Architecture & AppShell Isolation
  // -------------------------------------------------------------------------
  console.log('\n--- TEST GROUP 3: Page Architecture & AppShell Isolation ---');
  const pageFile = path.join(process.cwd(), 'src/app/calendar/page.tsx');
  const pageSrc = fs.readFileSync(pageFile, 'utf8');

  assert.equal(
    pageSrc.includes('<AppShell'),
    false,
    '/calendar/page.tsx must NOT mount <AppShell> (AppShell is globally mounted in layout.tsx)'
  );
  assert.equal(
    pageSrc.includes('import AppShell'),
    false,
    '/calendar/page.tsx must NOT import AppShell'
  );
  assert.ok(
    pageSrc.includes('calendarService'),
    '/calendar/page.tsx must use calendarService'
  );
  assert.ok(
    pageSrc.includes('DayNexusInspector'),
    '/calendar/page.tsx must render DayNexusInspector'
  );
  assert.ok(
    pageSrc.includes('CalendarMatrix'),
    '/calendar/page.tsx must render CalendarMatrix'
  );
  assert.ok(
    pageSrc.includes('SovereignGoalsHub'),
    '/calendar/page.tsx must render SovereignGoalsHub'
  );
  console.log('  -> PASS: AppShell isolation and modular composition confirmed');

  console.log('\n=== ALL CALENDAR & GOALS NEXUS TESTS PASSED (14/14) ===');
}

runCalendarTestSuite().catch((err) => {
  console.error('\n❌ CALENDAR TEST SUITE FAILURE:');
  console.error(err);
  process.exit(1);
});
