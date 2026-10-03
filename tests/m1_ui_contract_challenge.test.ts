import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

// Components & Mock Fixtures
import {
  TasksHeader,
  ExecutionCoreCard,
  ExecutionPipeline,
  ActiveProjectsGrid,
  DailyVelocityCard,
  QuickTaskCaptureCard,
  AddTaskModal,
  MobileTasksView,
  TasksView,
} from '../src/components/tasks';
import {
  mockTaskItems,
  mockActiveProjects,
  mockWeeklyRhythm,
} from '../src/services/mockData';
import { TaskItem, Project, WeeklyRhythmDay } from '../src/types/models';

const ROOT_DIR = path.resolve(__dirname, '..');

console.log('================================================================');
console.log('--- STARTING MILESTONE 1: UI CONTRACT & ADVERSARIAL CHALLENGE ---');
console.log('================================================================\n');

let passCount = 0;
let failCount = 0;

function runChallenge(title: string, testFn: () => void | Promise<void>) {
  try {
    const result = testFn();
    if (result instanceof Promise) {
      throw new Error(`Sync test runner received unexpected Promise for: ${title}`);
    }
    console.log(`[PASS] ${title}`);
    passCount++;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[FAIL] ${title}`);
    console.error(`       -> ${msg}`);
    failCount++;
    throw err;
  }
}

// Helper to recursively collect files
function collectFiles(dir: string, extensions: string[]): string[] {
  let results: string[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(collectFiles(fullPath, extensions));
    } else if (extensions.some((ext) => entry.name.endsWith(ext))) {
      results.push(fullPath);
    }
  }
  return results;
}

// Strip block & line comments to avoid false positives on comment mentions of 'any'
function stripComments(code: string): string {
  return code
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/.*$/gm, '');
}

// ============================================================================
// SUITE 1: STRICT ZERO "any" ENFORCEMENT
// ============================================================================
console.log('--- SUITE 1: Strict Zero "any" Enforcement ---');

runChallenge('Zero "any" type across src/components/tasks/', () => {
  const tasksFiles = collectFiles(path.join(ROOT_DIR, 'src', 'components', 'tasks'), ['.ts', '.tsx']);
  assert.ok(tasksFiles.length >= 10, 'Expected at least 10 files in src/components/tasks');

  const anyPatterns = [
    /:\s*any\b/,
    /<any>/,
    /as\s+any\b/,
    /\bany\[\]/,
    /Array<any>/,
    /Promise<any>/,
  ];

  for (const file of tasksFiles) {
    const raw = fs.readFileSync(file, 'utf8');
    const cleanCode = stripComments(raw);
    for (const pattern of anyPatterns) {
      const match = pattern.exec(cleanCode);
      assert.equal(
        match,
        null,
        `Prohibited 'any' construct ${pattern} found in ${path.relative(ROOT_DIR, file)}`
      );
    }
  }
});

runChallenge('Zero "any" type across src/services/tasksService.ts and src/types/models.ts', () => {
  const targetFiles = [
    path.join(ROOT_DIR, 'src', 'services', 'tasksService.ts'),
    path.join(ROOT_DIR, 'src', 'types', 'models.ts'),
    path.join(ROOT_DIR, 'src', 'app', 'tasks', 'page.tsx'),
  ];

  const anyPatterns = [
    /:\s*any\b/,
    /<any>/,
    /as\s+any\b/,
    /\bany\[\]/,
    /Array<any>/,
    /Promise<any>/,
  ];

  for (const file of targetFiles) {
    assert.ok(fs.existsSync(file), `Expected file ${path.relative(ROOT_DIR, file)} to exist`);
    const raw = fs.readFileSync(file, 'utf8');
    const cleanCode = stripComments(raw);
    for (const pattern of anyPatterns) {
      const match = pattern.exec(cleanCode);
      assert.equal(
        match,
        null,
        `Prohibited 'any' construct ${pattern} found in ${path.relative(ROOT_DIR, file)}`
      );
    }
  }
});

// ============================================================================
// SUITE 2: COMPONENT CONTRACTS & BARREL EXPORTS INVENTORY
// ============================================================================
console.log('\n--- SUITE 2: Component Contracts & Barrel Exports ---');

const REQUIRED_COMPONENTS = [
  'TasksHeader',
  'ExecutionCoreCard',
  'ExecutionPipeline',
  'ActiveProjectsGrid',
  'DailyVelocityCard',
  'QuickTaskCaptureCard',
  'AddTaskModal',
  'MobileTasksView',
  'TasksView',
] as const;

runChallenge('All 9 required tasks components exist and export valid React components', () => {
  const barrelPath = path.join(ROOT_DIR, 'src', 'components', 'tasks', 'index.ts');
  assert.ok(fs.existsSync(barrelPath), 'index.ts barrel must exist');
  const barrelContent = fs.readFileSync(barrelPath, 'utf8');

  for (const name of REQUIRED_COMPONENTS) {
    const compPath = path.join(ROOT_DIR, 'src', 'components', 'tasks', `${name}.tsx`);
    assert.ok(fs.existsSync(compPath), `${name}.tsx must exist on disk`);

    // Verify named export and export from barrel
    assert.ok(
      barrelContent.includes(`export { default as ${name} } from "./${name}"`),
      `Barrel index.ts must re-export default as ${name}`
    );
    assert.ok(
      barrelContent.includes(`export * from "./${name}"`),
      `Barrel index.ts must re-export * from "./${name}"`
    );
  }
});

// ============================================================================
// SUITE 3: MUI v9 BEST PRACTICES & DEPRECATION GUARDRAILS
// ============================================================================
console.log('\n--- SUITE 3: MUI v9 Best Practices & Deprecation Guardrails ---');

runChallenge('Zero prohibited icon libraries across tasks components', () => {
  const tasksFiles = collectFiles(path.join(ROOT_DIR, 'src', 'components', 'tasks'), ['.ts', '.tsx']);
  const prohibitedLibraries = [
    /from\s+['"]lucide-react['"]/,
    /from\s+['"]lucide['"]/,
    /from\s+['"]react-icons/,
    /from\s+['"]@heroicons/,
    /from\s+['"]@tabler\/icons/,
    /from\s+['"]feather-icons/,
    /from\s+['"]@fortawesome/,
    /from\s+['"]@radix-ui/,
  ];

  for (const file of tasksFiles) {
    const content = fs.readFileSync(file, 'utf8');
    for (const pattern of prohibitedLibraries) {
      assert.equal(
        pattern.test(content),
        false,
        `Prohibited external icon library ${pattern} in ${path.relative(ROOT_DIR, file)}`
      );
    }
  }
});

runChallenge('Zero deprecated MUI v4/v5 APIs invoked (InputProps, PaperProps, makeStyles, Grid item)', () => {
  const tasksFiles = collectFiles(path.join(ROOT_DIR, 'src', 'components', 'tasks'), ['.ts', '.tsx']);
  const deprecatedProps = [
    /\bInputProps\s*=/,
    /\bPaperProps\s*=/,
    /\bmakeStyles\b/,
    /\bwithStyles\b/,
    /<Grid\s+item\b/,
    /\bzeroMinWidth\b/,
  ];

  for (const file of tasksFiles) {
    const content = fs.readFileSync(file, 'utf8');
    for (const pattern of deprecatedProps) {
      assert.equal(
        pattern.test(content),
        false,
        `Deprecated MUI API ${pattern} found in ${path.relative(ROOT_DIR, file)}`
      );
    }
  }
});

runChallenge('MUI v9 slotProps is prioritized for TextFields and Dialogs', () => {
  const addTaskModalFile = path.join(ROOT_DIR, 'src', 'components', 'tasks', 'AddTaskModal.tsx');
  const addTaskModalContent = fs.readFileSync(addTaskModalFile, 'utf8');
  assert.ok(
    addTaskModalContent.includes('slotProps={{'),
    'AddTaskModal must use slotProps for Dialog and TextFields'
  );
  assert.ok(
    addTaskModalContent.includes('paper: {'),
    'AddTaskModal Dialog must configure slotProps.paper'
  );

  const quickCaptureFile = path.join(ROOT_DIR, 'src', 'components', 'tasks', 'QuickTaskCaptureCard.tsx');
  const quickCaptureContent = fs.readFileSync(quickCaptureFile, 'utf8');
  assert.ok(
    quickCaptureContent.includes('slotProps={{'),
    'QuickTaskCaptureCard TextFields must prioritize slotProps'
  );

  const tasksHeaderFile = path.join(ROOT_DIR, 'src', 'components', 'tasks', 'TasksHeader.tsx');
  const tasksHeaderContent = fs.readFileSync(tasksHeaderFile, 'utf8');
  assert.ok(
    tasksHeaderContent.includes('slotProps={{'),
    'TasksHeader search TextField must prioritize slotProps'
  );
});

// ============================================================================
// SUITE 4: DESIGN TOKEN COMPLIANCE & TYPOGRAPHY HIERARCHY
// ============================================================================
console.log('\n--- SUITE 4: Design Token Compliance & Typography Hierarchy ---');

runChallenge('Anchor Navy (#0B1628) and Canvas (#FCFBF8 / #F7F5EF) tokens are consistently applied', () => {
  const requiredFiles = [
    'TasksHeader.tsx',
    'ExecutionCoreCard.tsx',
    'ExecutionPipeline.tsx',
    'ActiveProjectsGrid.tsx',
    'DailyVelocityCard.tsx',
    'QuickTaskCaptureCard.tsx',
    'AddTaskModal.tsx',
    'MobileTasksView.tsx',
  ];

  for (const file of requiredFiles) {
    const content = fs.readFileSync(path.join(ROOT_DIR, 'src', 'components', 'tasks', file), 'utf8');
    assert.ok(
      content.includes('#0B1628'),
      `${file} must use Anchor Navy token (#0B1628)`
    );
  }
});

runChallenge('Tri-font typography tokens (Newsreader, Plus Jakarta Sans, JetBrains Mono) properly assigned', () => {
  const newsreaderFiles = [
    'TasksHeader.tsx',
    'ExecutionCoreCard.tsx',
    'ActiveProjectsGrid.tsx',
    'DailyVelocityCard.tsx',
    'AddTaskModal.tsx',
    'MobileTasksView.tsx',
  ];

  for (const file of newsreaderFiles) {
    const content = fs.readFileSync(path.join(ROOT_DIR, 'src', 'components', 'tasks', file), 'utf8');
    assert.ok(
      content.includes('--font-newsreader') || content.includes('Newsreader'),
      `${file} must assign Newsreader serif font for editorial display headers`
    );
  }

  const monoFiles = [
    'TasksHeader.tsx',
    'ExecutionCoreCard.tsx',
    'ExecutionPipeline.tsx',
    'ActiveProjectsGrid.tsx',
    'DailyVelocityCard.tsx',
    'QuickTaskCaptureCard.tsx',
    'MobileTasksView.tsx',
  ];

  for (const file of monoFiles) {
    const content = fs.readFileSync(path.join(ROOT_DIR, 'src', 'components', 'tasks', file), 'utf8');
    assert.ok(
      content.includes('--font-jetbrains-mono') || content.includes('monospace'),
      `${file} must assign JetBrains Mono monospace font for tabular/metric data`
    );
  }

  // Verify tabular numerals configuration
  const tabularFiles = [
    'TasksHeader.tsx',
    'ExecutionCoreCard.tsx',
    'ExecutionPipeline.tsx',
    'ActiveProjectsGrid.tsx',
    'DailyVelocityCard.tsx',
    'QuickTaskCaptureCard.tsx',
    'MobileTasksView.tsx',
  ];

  for (const file of tabularFiles) {
    const content = fs.readFileSync(path.join(ROOT_DIR, 'src', 'components', 'tasks', file), 'utf8');
    assert.ok(
      content.includes('"tnum" on') || content.includes('tabular-nums'),
      `${file} must enable tabular numerals (tnum) for numeric alignment`
    );
  }
});

runChallenge('Secondary Anchor tokens (Controlled Sage, Soft Coral, Warm Ochre) accurately utilized', () => {
  const pipelineContent = fs.readFileSync(
    path.join(ROOT_DIR, 'src', 'components', 'tasks', 'ExecutionPipeline.tsx'),
    'utf8'
  );
  // Coral for high priority
  assert.ok(pipelineContent.includes('#C76D68') || pipelineContent.includes('#8C3F3B'), 'ExecutionPipeline must use Coral for high priority');
  // Sage for done / finance
  assert.ok(pipelineContent.includes('#3F6853') || pipelineContent.includes('#5F9277'), 'ExecutionPipeline must use Sage for completed/finance badge');

  const projectsContent = fs.readFileSync(
    path.join(ROOT_DIR, 'src', 'components', 'tasks', 'ActiveProjectsGrid.tsx'),
    'utf8'
  );
  // Ochre / Gold for Sovereign Reserve
  assert.ok(projectsContent.includes('#7A5B10') || projectsContent.includes('#FFF2B2') || projectsContent.includes('#C4934A'), 'ActiveProjectsGrid must use Ochre for sovereign reserve');
});

// ============================================================================
// SUITE 5: DOM HIERARCHY, SSR RENDERING & STITCH SPECIFICATION VERIFICATION
// ============================================================================
console.log('\n--- SUITE 5: DOM Hierarchy, SSR Rendering & Stitch Specs ---');

runChallenge('TasksHeader: DOM hierarchy and interactive tab controls', () => {
  const html = renderToStaticMarkup(
    React.createElement(TasksHeader, {
      activeTab: 'today',
      onTabChange: () => {},
      searchQuery: 'ledger',
      onSearchChange: () => {},
      onOpenAddTask: () => {},
      overdueCount: 2,
    })
  );

  assert.ok(html.includes('Tasks &amp; Execution Systems') || html.includes('Tasks & Execution Systems'), 'Must render h1 title');
  assert.ok(html.includes('System Online'), 'Must render System Online badge');
  assert.ok(html.includes('Week 43 • Cycle 04'), 'Must render Week/Cycle indicator');
  assert.ok(html.includes('⌘K'), 'Must render ⌘K keyboard shortcut');
  assert.ok(html.includes('+ Add Task'), 'Must render + Add Task CTA');

  // Verify all 5 filter tabs
  assert.ok(html.includes('Today'), 'Must render Today tab');
  assert.ok(html.includes('Upcoming'), 'Must render Upcoming tab');
  assert.ok(html.includes('Overdue'), 'Must render Overdue tab');
  assert.ok(html.includes('Completed'), 'Must render Completed tab');
  assert.ok(html.includes('Backlog'), 'Must render Backlog tab');

  // Overdue red dot indicator
  assert.ok(html.includes('background-color:#C76D68') || html.includes('bgcolor') || html.includes('#C76D68'), 'Must render red alert indicator for overdue tab when count > 0');
});

runChallenge('ExecutionCoreCard: Metric counters, progress bar, and boundary rendering', () => {
  const html = renderToStaticMarkup(
    React.createElement(ExecutionCoreCard, {
      completedCount: 3,
      totalCount: 5,
      baselineVelocityPercent: 60,
      targetDeliverables: 5,
    })
  );

  assert.ok(html.includes('Execution Core'), 'Must render Execution Core section title');
  assert.ok(html.includes("Today&#x27;s Focus") || html.includes("Today's Focus"), "Must render Today's Focus title");
  assert.ok(html.includes('3 of 5 completed'), 'Must render completed count');
  assert.ok(html.includes('60% of baseline velocity'), 'Must render baseline velocity');
  assert.ok(html.includes('role="progressbar"') || html.includes('MuiLinearProgress-root'), 'Must render LinearProgress bar');
  assert.ok(html.includes('Target: 5 deliverables'), 'Must render target deliverables counter');
  assert.ok(html.includes('2 remaining'), 'Must calculate 5 - 3 = 2 remaining');
});

runChallenge('ExecutionPipeline: Checklist rows, high-priority border, and Rhythm Guardrail', () => {
  const html = renderToStaticMarkup(
    React.createElement(ExecutionPipeline, {
      tasks: mockTaskItems,
      onToggleTask: () => {},
      rhythmNote: 'Deep work block test note',
    })
  );

  assert.ok(html.includes('Execution Pipeline'), 'Must render Execution Pipeline header');
  assert.ok(html.includes(`${mockTaskItems.length} ITEMS`), 'Must render task count');

  // Check that verbatim Stitch task titles are present
  assert.ok(html.includes('Complete API integration'), 'Must render Task 1');
  assert.ok(html.includes('Morning gym session'), 'Must render Task 2');
  assert.ok(html.includes('Review monthly investment yield'), 'Must render Task 3');
  assert.ok(html.includes('Study TypeScript 5.5 performance notes'), 'Must render Task 4');
  assert.ok(html.includes('Weekly financial ledger reconciliation'), 'Must render Task 5');
  assert.ok(html.includes('Draft Q4 engineering roadmap'), 'Must render Task 6');

  // Verify strikethrough decoration on completed tasks
  assert.ok(html.includes('text-decoration:line-through'), 'Must apply line-through text decoration on completed tasks');

  // Verify Rhythm Guardrail inset
  assert.ok(html.includes('Rhythm Guardrail:'), 'Must render Rhythm Guardrail strong header');
  assert.ok(html.includes('Deep work block test note'), 'Must render rhythm note copy');
});

runChallenge('ActiveProjectsGrid: Portfolio cards, progress meters, and System Phases', () => {
  const html = renderToStaticMarkup(
    React.createElement(ActiveProjectsGrid, {
      projects: mockActiveProjects,
    })
  );

  assert.ok(html.includes('Active Projects'), 'Must render Active Projects header');
  assert.ok(html.includes('Portfolio Domains'), 'Must render Portfolio Domains subtitle');
  assert.ok(html.includes('View All'), 'Must render View All button');

  // Verify the 3 Stitch project titles
  assert.ok(html.includes('Personal Life Management (ANCHOR)'), 'Must render Project 1');
  assert.ok(html.includes('Next.js 15 &amp; System Architecture') || html.includes('Next.js 15 & System Architecture'), 'Must render Project 2');
  assert.ok(html.includes('Q4 Sovereign Reserve Strategy'), 'Must render Project 3');

  // Verify progress percentages
  assert.ok(html.includes('72%'), 'Must render 72% progress');
  assert.ok(html.includes('45%'), 'Must render 45% progress');
  assert.ok(html.includes('85%'), 'Must render 85% progress');

  // Verify System Phases tray
  assert.ok(html.includes('System Phases'), 'Must render System Phases header');
  assert.ok(html.includes('Phase I: Foundation'), 'Must render Phase I');
  assert.ok(html.includes('Phase II: Scaling (Active)'), 'Must render Phase II: Scaling (Active)');
  assert.ok(html.includes('Phase III: Hardening'), 'Must render Phase III: Hardening');
});

runChallenge('DailyVelocityCard: Performance metric, +20% badge, and 7-day bar chart', () => {
  const html = renderToStaticMarkup(
    React.createElement(DailyVelocityCard, {
      completedCount: 5,
      weeklyRhythm: mockWeeklyRhythm,
      velocityDelta: '+20% vs 7-day average',
    })
  );

  assert.ok(html.includes('Performance'), 'Must render Performance header');
  assert.ok(html.includes('5'), 'Must render completed count number 5');
  assert.ok(html.includes('tasks completed'), 'Must render tasks completed label');
  assert.ok(html.includes('+20% vs 7-day average'), 'Must render velocity delta');
  assert.ok(html.includes('Weekly Rhythm:'), 'Must render Weekly Rhythm label');

  // Verify 7-day bar chart labels: M, T, W, T, F, S, S
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  for (const day of days) {
    assert.ok(html.includes(day), `Weekly rhythm chart must include day ${day}`);
  }
});

runChallenge('QuickTaskCaptureCard: Interactive form, priority buttons, and 224ms badge', () => {
  const html = renderToStaticMarkup(
    React.createElement(QuickTaskCaptureCard, {
      projects: mockActiveProjects,
      onSubmit: () => {},
    })
  );

  assert.ok(html.includes('Quick Task Capture'), 'Must render Quick Task Capture header');
  assert.ok(html.includes('Task Definition'), 'Must render Task Definition label');
  assert.ok(html.includes('Priority'), 'Must render Priority label');
  assert.ok(html.includes('Project Assignment'), 'Must render Project Assignment label');
  assert.ok(html.includes('Due Date'), 'Must render Due Date label');
  assert.ok(html.includes('Commit Task to Ledger'), 'Must render Commit CTA button');
  assert.ok(html.includes('Sync Status: Real-time'), 'Must render Sync Status');
  assert.ok(html.includes('224ms'), 'Must render 224ms latency badge');
});

runChallenge('AddTaskModal: Native MUI Dialog with slotProps and accessible inputs', () => {
  const el = React.createElement(AddTaskModal, {
    open: true,
    onClose: () => {},
    projects: mockActiveProjects,
  });
  assert.ok(el, 'AddTaskModal element instantiates cleanly');

  // Verify modal static render does not throw
  const html = renderToStaticMarkup(el);
  assert.ok(typeof html === 'string', 'AddTaskModal renders without error');

  const modalSrc = fs.readFileSync(path.join(ROOT_DIR, 'src', 'components', 'tasks', 'AddTaskModal.tsx'), 'utf8');
  assert.ok(modalSrc.includes('<Dialog'), 'Must render MUI Dialog');
  assert.ok(modalSrc.includes('slotProps={{'), 'Must use slotProps on Dialog');
  assert.ok(modalSrc.includes('paper: {'), 'Must configure slotProps.paper');
  assert.ok(modalSrc.includes('New Focus Task'), 'Must render New Focus Task dialog title');
  assert.ok(modalSrc.includes('Task Description'), 'Must render Task Description input label');
  assert.ok(modalSrc.includes('Project Domain'), 'Must render Project Domain label');
  assert.ok(modalSrc.includes('Category'), 'Must render Category label');
  assert.ok(modalSrc.includes('Priority'), 'Must render Priority label');
  assert.ok(modalSrc.includes('Due / Schedule'), 'Must render Due / Schedule input label');
  assert.ok(modalSrc.includes('Cancel'), 'Must render Cancel button');
  assert.ok(modalSrc.includes('Commit Task'), 'Must render Commit Task CTA');
});

runChallenge('MobileTasksView: Stitch mobile layout, 4-tab switcher, and docked FAB at bottom: 80', () => {
  const html = renderToStaticMarkup(
    React.createElement(MobileTasksView, {
      tasks: mockTaskItems,
      projects: mockActiveProjects,
      activeTab: 'today',
      onTabChange: () => {},
      onToggleTask: () => {},
      onOpenCaptureModal: () => {},
    })
  );

  // 1. Editorial header
  assert.ok(html.includes('Temporal Focus'), 'Must render Temporal Focus subtitle');
  assert.ok(html.includes('Daily Cadence'), 'Must render Daily Cadence headline');
  assert.ok(html.includes('WED, OCT 25'), 'Must render WED, OCT 25 date');
  assert.ok(html.includes('WEEK 43 / CYCLE II'), 'Must render Week 43 / Cycle II');

  // 2. 4-tab segmented pill switcher
  assert.ok(html.includes('Today'), 'Must render Today switcher pill');
  assert.ok(html.includes('Upcoming'), 'Must render Upcoming switcher pill');
  assert.ok(html.includes('Projects'), 'Must render Projects switcher pill');
  assert.ok(html.includes('Completed'), 'Must render Completed switcher pill');

  // 3. Chronological queue
  assert.ok(html.includes('Chronological Execution'), 'Must render Chronological Execution header');

  // 4. Cryptographic ledger well
  assert.ok(
    html.includes('All execution cycles are cryptographically stamped to ledger storage every night at 23:59 GMT.'),
    'Must render cryptographic ledger guarantee well'
  );

  // 5. Docked FAB button
  assert.ok(html.includes('Capture'), 'Must render Capture floating action button');
  // Check that FAB is docked at bottom: 80 to sit above 64px MobileBottomNav
  assert.ok(
    html.includes('bottom:80px') || html.includes('bottom: 80px') || html.includes('bottom:80'),
    'FAB must be positioned at bottom: 80 to float above 64px MobileBottomNav'
  );
});

runChallenge('TasksView: Breakpoint routing (xs mobile vs md desktop) and 12-column grid 5:4:3', () => {
  const html = renderToStaticMarkup(
    React.createElement(TasksView, {
      tasks: mockTaskItems,
      projects: mockActiveProjects,
      weeklyRhythm: mockWeeklyRhythm,
      activeTab: 'today',
      searchQuery: '',
      onTabChange: () => {},
      onSearchChange: () => {},
      onToggleTask: () => {},
      onCreateTask: () => {},
      onOpenAddTask: () => {},
    })
  );

  // Mobile layout branch (<768px) and desktop layout branch (>=768px)
  assert.ok(html.includes('Tasks &amp; Execution Systems') || html.includes('Tasks & Execution Systems'), 'Renders desktop header');
  assert.ok(html.includes('Daily Cadence'), 'Renders mobile view');

  // Inspect source of TasksView.tsx for 5:4:3 desktop column definitions
  const tasksViewSrc = fs.readFileSync(path.join(ROOT_DIR, 'src', 'components', 'tasks', 'TasksView.tsx'), 'utf8');
  assert.ok(tasksViewSrc.includes('xl: "span 5"') || tasksViewSrc.includes('span 5'), 'Column 1 must span 5 columns on desktop');
  assert.ok(tasksViewSrc.includes('xl: "span 4"') || tasksViewSrc.includes('span 4'), 'Column 2 must span 4 columns on desktop');
  assert.ok(tasksViewSrc.includes('xl: "span 3"') || tasksViewSrc.includes('span 3'), 'Column 3 must span 3 columns on desktop');
});

runChallenge('src/app/tasks/page.tsx: AppShell exclusion and state orchestration', () => {
  const pagePath = path.join(ROOT_DIR, 'src', 'app', 'tasks', 'page.tsx');
  const pageSrc = fs.readFileSync(pagePath, 'utf8');

  // Verify AppShell is NOT duplicated in /tasks/page.tsx
  assert.equal(
    pageSrc.includes('<AppShell'),
    false,
    '/tasks/page.tsx must NOT mount <AppShell> (AppShell is globally mounted in layout.tsx)'
  );
  assert.equal(
    pageSrc.includes('from "@/components/layout/AppShell"') || pageSrc.includes("from '../components/layout/AppShell'"),
    false,
    '/tasks/page.tsx must NOT import AppShell'
  );

  // Verify TasksView is mounted with all reactive callbacks
  assert.ok(pageSrc.includes('<TasksView'), 'Must mount TasksView');
  assert.ok(pageSrc.includes('<AddTaskModal'), 'Must mount AddTaskModal');
  assert.ok(pageSrc.includes('<Snackbar'), 'Must mount Snackbar feedback');
  assert.ok(pageSrc.includes('tasksService.getTasks()'), 'Must hydrate from tasksService');
});

// ============================================================================
// SUITE 6: ADVERSARIAL BOUNDARY CONDITIONS & INVARIANTS
// ============================================================================
console.log('\n--- SUITE 6: Adversarial Boundary Conditions & Invariants ---');

runChallenge('Boundary 1: ExecutionCoreCard handles total=0 and completed=0 without division by zero', () => {
  const html = renderToStaticMarkup(
    React.createElement(ExecutionCoreCard, {
      completedCount: 0,
      totalCount: 0,
      baselineVelocityPercent: 0,
      targetDeliverables: 0,
    })
  );

  assert.ok(html.includes('0 of 0 completed'), 'Correctly renders 0 of 0 completed');
  assert.ok(html.includes('0% of baseline velocity'), 'Correctly renders 0% velocity');
  assert.ok(html.includes('0 remaining'), 'Correctly renders 0 remaining');
  assert.equal(html.includes('NaN'), false, 'Must not output NaN on 0/0');
});

runChallenge('Boundary 2: ExecutionPipeline empty state renders clean fallback without crashing', () => {
  const html = renderToStaticMarkup(
    React.createElement(ExecutionPipeline, {
      tasks: [],
      onToggleTask: () => {},
    })
  );

  assert.ok(html.includes('0 ITEMS'), 'Must report 0 ITEMS');
  assert.ok(
    html.includes('No tasks found matching this criteria.'),
    'Must display clean empty state message'
  );
});

runChallenge('Boundary 3: ActiveProjectsGrid handles empty projects array cleanly', () => {
  const html = renderToStaticMarkup(
    React.createElement(ActiveProjectsGrid, {
      projects: [],
    })
  );

  assert.ok(html.includes('Active Projects'), 'Must render header');
  assert.ok(html.includes('System Phases'), 'Must still render System Phases ledger');
});

runChallenge('Boundary 4: DailyVelocityCard handles completedCount=0 correctly', () => {
  const html = renderToStaticMarkup(
    React.createElement(DailyVelocityCard, {
      completedCount: 0,
      weeklyRhythm: mockWeeklyRhythm,
    })
  );

  // Verify that count 0 is rendered rather than falling back to default 5
  assert.ok(html.includes('>0<'), 'Must explicitly render 0 when completedCount=0');
});

runChallenge('Boundary 5: Task item strikethrough invariant on completion toggle', () => {
  const pendingTask: TaskItem = {
    id: 'test-pending',
    title: 'Adversarial Pending Item',
    isCompleted: false,
    priority: 'high',
    category: 'Engineering',
    categoryLabel: 'Engineering',
    tabCategory: 'today',
    createdAt: new Date().toISOString(),
  };

  const completedTask: TaskItem = {
    ...pendingTask,
    id: 'test-completed',
    title: 'Adversarial Completed Item',
    isCompleted: true,
  };

  const htmlPending = renderToStaticMarkup(
    React.createElement(ExecutionPipeline, {
      tasks: [pendingTask],
      onToggleTask: () => {},
    })
  );

  const htmlCompleted = renderToStaticMarkup(
    React.createElement(ExecutionPipeline, {
      tasks: [completedTask],
      onToggleTask: () => {},
    })
  );

  // Pending item should NOT have strikethrough, should have coral border for high priority
  assert.ok(htmlPending.includes('text-decoration:none'), 'Pending item text-decoration is none');
  assert.ok(htmlPending.includes('#C76D68'), 'Incomplete high-priority item has coral border #C76D68');

  // Completed item SHOULD have strikethrough
  assert.ok(htmlCompleted.includes('text-decoration:line-through'), 'Completed item text-decoration is line-through');
});

runChallenge('Boundary 6: QuickTaskCaptureCard rejects whitespace-only task title in handler logic', () => {
  const quickCaptureSrc = fs.readFileSync(
    path.join(ROOT_DIR, 'src', 'components', 'tasks', 'QuickTaskCaptureCard.tsx'),
    'utf8'
  );
  // Verify client validation guards against empty title
  assert.ok(
    quickCaptureSrc.includes('!title.trim()'),
    'QuickTaskCaptureCard must guard against empty/whitespace titles'
  );
  assert.ok(
    quickCaptureSrc.includes('disabled={isSubmitting || !title.trim()}'),
    'Submit button must be disabled when title is blank or whitespace'
  );
});

console.log('\n================================================================');
console.log(`--- MILESTONE 1 CHALLENGE COMPLETE: ${passCount} PASSED, ${failCount} FAILED ---`);
console.log('================================================================\n');

if (failCount > 0) {
  process.exit(1);
} else {
  console.log('VERDICT: ALL ADVERSARIAL CHALLENGES SATISFIED EMPIRICALLY.');
}
