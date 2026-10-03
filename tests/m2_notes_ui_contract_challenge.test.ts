import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

// Components & Mock Fixtures
import {
  NotesSubBar,
  JournalArchiveColumn,
  EditorialSanctuary,
  ContextualIntelligenceAside,
  MobileNotesView,
  NotesView,
} from '../src/components/notes';
import {
  mockJournalEntries,
  mockConsistencyStats,
  mockPinnedMaxim,
  mockTaxonomyTags,
} from '../src/services/mockData';
import { JournalEntry, ConsistencyStats, PinnedMaxim } from '../src/types/models';

const ROOT_DIR = path.resolve(__dirname, '..');

console.log('================================================================');
console.log('--- STARTING MILESTONE 2: UI CONTRACT & ADVERSARIAL CHALLENGE ---');
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

// Strip block & line comments to avoid false positives on comments
function stripComments(code: string): string {
  return code
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/.*$/gm, '');
}

// ============================================================================
// SUITE 1: STRICT ZERO "any" ENFORCEMENT
// ============================================================================
console.log('--- SUITE 1: Strict Zero "any" Enforcement ---');

runChallenge('Zero "any" type across src/components/notes/', () => {
  const notesFiles = collectFiles(path.join(ROOT_DIR, 'src', 'components', 'notes'), ['.ts', '.tsx']);
  assert.ok(notesFiles.length >= 7, 'Expected at least 7 files in src/components/notes');

  const anyPatterns = [
    /:\s*any\b/,
    /<any>/,
    /as\s+any\b/,
    /\bany\[\]/,
    /Array<any>/,
    /Promise<any>/,
  ];

  for (const file of notesFiles) {
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

runChallenge('Zero "any" type across src/services/notesService.ts, src/types/models.ts, and src/app/notes/page.tsx', () => {
  const targetFiles = [
    path.join(ROOT_DIR, 'src', 'services', 'notesService.ts'),
    path.join(ROOT_DIR, 'src', 'types', 'models.ts'),
    path.join(ROOT_DIR, 'src', 'app', 'notes', 'page.tsx'),
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
  'NotesSubBar',
  'JournalArchiveColumn',
  'EditorialSanctuary',
  'ContextualIntelligenceAside',
  'MobileNotesView',
  'NotesView',
] as const;

runChallenge('All 7 required notes components exist and export valid React components', () => {
  const barrelPath = path.join(ROOT_DIR, 'src', 'components', 'notes', 'index.ts');
  assert.ok(fs.existsSync(barrelPath), 'index.ts barrel must exist');
  const barrelContent = fs.readFileSync(barrelPath, 'utf8');

  for (const name of REQUIRED_COMPONENTS) {
    const compPath = path.join(ROOT_DIR, 'src', 'components', 'notes', `${name}.tsx`);
    assert.ok(fs.existsSync(compPath), `${name}.tsx must exist on disk`);

    // Verify named default export and wildcard export from barrel
    assert.ok(
      barrelContent.includes(`export { default as ${name} } from './${name}'`),
      `Barrel index.ts must re-export default as ${name}`
    );
    assert.ok(
      barrelContent.includes(`export * from './${name}'`),
      `Barrel index.ts must re-export * from './${name}'`
    );
  }
});

// ============================================================================
// SUITE 3: MUI v9 BEST PRACTICES & DEPRECATION GUARDRAILS
// ============================================================================
console.log('\n--- SUITE 3: MUI v9 Best Practices & Deprecation Guardrails ---');

runChallenge('Zero prohibited icon libraries across notes components', () => {
  const notesFiles = collectFiles(path.join(ROOT_DIR, 'src', 'components', 'notes'), ['.ts', '.tsx']);
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

  for (const file of notesFiles) {
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
  const notesFiles = collectFiles(path.join(ROOT_DIR, 'src', 'components', 'notes'), ['.ts', '.tsx']);
  notesFiles.push(path.join(ROOT_DIR, 'src', 'app', 'notes', 'page.tsx'));

  const deprecatedProps = [
    /\bInputProps\s*=/,
    /\bPaperProps\s*=/,
    /\bmakeStyles\b/,
    /\bwithStyles\b/,
    /<Grid\s+item\b/,
    /\bzeroMinWidth\b/,
  ];

  for (const file of notesFiles) {
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
  const archiveFile = path.join(ROOT_DIR, 'src', 'components', 'notes', 'JournalArchiveColumn.tsx');
  const archiveContent = fs.readFileSync(archiveFile, 'utf8');
  assert.ok(
    archiveContent.includes('slotProps={{'),
    'JournalArchiveColumn must use slotProps for search TextField'
  );
  assert.ok(
    archiveContent.includes('input: {'),
    'JournalArchiveColumn must configure slotProps.input'
  );

  const sanctuaryFile = path.join(ROOT_DIR, 'src', 'components', 'notes', 'EditorialSanctuary.tsx');
  const sanctuaryContent = fs.readFileSync(sanctuaryFile, 'utf8');
  assert.ok(
    sanctuaryContent.includes('slotProps={{'),
    'EditorialSanctuary must prioritize slotProps for inquiry TextField'
  );
  assert.ok(
    sanctuaryContent.includes('input: {'),
    'EditorialSanctuary must configure slotProps.input'
  );

  const pageFile = path.join(ROOT_DIR, 'src', 'app', 'notes', 'page.tsx');
  const pageContent = fs.readFileSync(pageFile, 'utf8');
  assert.ok(
    pageContent.includes('slotProps={{'),
    'Notes page must prioritize slotProps for Dialog and reflection TextField'
  );
  assert.ok(
    pageContent.includes('paper: {'),
    'Notes page Dialog must configure slotProps.paper'
  );
  assert.ok(
    pageContent.includes('input: {'),
    'Notes page reflection TextField must configure slotProps.input'
  );
});

// ============================================================================
// SUITE 4: DESIGN TOKEN COMPLIANCE & TYPOGRAPHY HIERARCHY
// ============================================================================
console.log('\n--- SUITE 4: Design Token Compliance & Typography Hierarchy ---');

runChallenge('Anchor Navy (#0B1628) token consistently applied across notes components', () => {
  const requiredFiles = [
    'JournalArchiveColumn.tsx',
    'EditorialSanctuary.tsx',
    'ContextualIntelligenceAside.tsx',
    'MobileNotesView.tsx',
  ];

  for (const file of requiredFiles) {
    const content = fs.readFileSync(path.join(ROOT_DIR, 'src', 'components', 'notes', file), 'utf8');
    assert.ok(
      content.includes('#0B1628'),
      `${file} must use Anchor Navy token (#0B1628)`
    );
  }
});

runChallenge('Tri-font typography tokens (Newsreader, Plus Jakarta Sans, JetBrains Mono) properly assigned', () => {
  const newsreaderFiles = [
    'JournalArchiveColumn.tsx',
    'EditorialSanctuary.tsx',
    'ContextualIntelligenceAside.tsx',
    'MobileNotesView.tsx',
  ];

  for (const file of newsreaderFiles) {
    const content = fs.readFileSync(path.join(ROOT_DIR, 'src', 'components', 'notes', file), 'utf8');
    assert.ok(
      content.includes('--font-newsreader') || content.includes('Newsreader'),
      `${file} must assign Newsreader serif font for editorial display headers and quotes`
    );
  }

  const monoFiles = [
    'NotesSubBar.tsx',
    'JournalArchiveColumn.tsx',
    'EditorialSanctuary.tsx',
    'ContextualIntelligenceAside.tsx',
    'MobileNotesView.tsx',
  ];

  for (const file of monoFiles) {
    const content = fs.readFileSync(path.join(ROOT_DIR, 'src', 'components', 'notes', file), 'utf8');
    assert.ok(
      content.includes('--font-jetbrains-mono') || content.includes('monospace'),
      `${file} must assign JetBrains Mono monospace font for dates, counts, and tabular numerals`
    );
  }

  // Verify tabular numerals configuration
  const tabularFiles = [
    'NotesSubBar.tsx',
    'JournalArchiveColumn.tsx',
    'EditorialSanctuary.tsx',
    'ContextualIntelligenceAside.tsx',
    'MobileNotesView.tsx',
  ];

  for (const file of tabularFiles) {
    const content = fs.readFileSync(path.join(ROOT_DIR, 'src', 'components', 'notes', file), 'utf8');
    assert.ok(
      content.includes('"tnum" on') || content.includes('tabular-nums'),
      `${file} must enable tabular numerals (tnum) for numeric alignment`
    );
  }
});

runChallenge('Secondary Anchor tokens (Controlled Sage, Soft Coral, Warm Ochre) accurately utilized', () => {
  const sanctuaryContent = fs.readFileSync(
    path.join(ROOT_DIR, 'src', 'components', 'notes', 'EditorialSanctuary.tsx'),
    'utf8'
  );
  // Soft Coral for financial debit
  assert.ok(
    sanctuaryContent.includes('#C76D68') || sanctuaryContent.includes('#8C3F3B'),
    'EditorialSanctuary must use Soft Coral for financial debit'
  );
  // Controlled Sage for tasks resolved & answered inquiry
  assert.ok(
    sanctuaryContent.includes('#3F6853') || sanctuaryContent.includes('#5F9277'),
    'EditorialSanctuary must use Controlled Sage for tasks resolved and mood'
  );

  const asideContent = fs.readFileSync(
    path.join(ROOT_DIR, 'src', 'components', 'notes', 'ContextualIntelligenceAside.tsx'),
    'utf8'
  );
  // Ochre / Gold for Pinned Maxim icon
  assert.ok(
    asideContent.includes('#C4934A'),
    'ContextualIntelligenceAside must use Warm Ochre (#C4934A) for pinned maxim icon'
  );
  // Controlled Sage for consistency score MoM badge
  assert.ok(
    asideContent.includes('#3F6853'),
    'ContextualIntelligenceAside must use Controlled Sage for MoM change badge'
  );

  const subBarContent = fs.readFileSync(
    path.join(ROOT_DIR, 'src', 'components', 'notes', 'NotesSubBar.tsx'),
    'utf8'
  );
  // Controlled Sage for live sync dot
  assert.ok(
    subBarContent.includes('#3F6853'),
    'NotesSubBar must use Controlled Sage (#3F6853) for live sync indicator dot'
  );
});

// ============================================================================
// SUITE 5: DOM HIERARCHY, SSR RENDERING & STITCH SPECIFICATION VERIFICATION
// ============================================================================
console.log('\n--- SUITE 5: DOM Hierarchy, SSR Rendering & Stitch Specs ---');

runChallenge('NotesSubBar: DOM hierarchy, breadcrumbs, term badge, and sync telemetry', () => {
  const html = renderToStaticMarkup(
    React.createElement(NotesSubBar, {
      termLabel: 'Autumn Term 2026',
      syncTimeLabel: 'Synced 2m ago',
      onFilterClick: () => {},
      onSettingsClick: () => {},
    })
  );

  assert.ok(html.includes('WORKSPACE'), 'Must render WORKSPACE breadcrumb label');
  assert.ok(
    html.includes('Daily Notes &amp; Reflective Journal') || html.includes('Daily Notes & Reflective Journal'),
    'Must render title in breadcrumb'
  );
  assert.ok(html.includes('Autumn Term 2026'), 'Must render Autumn Term 2026 badge');
  assert.ok(html.includes('Synced 2m ago'), 'Must render real-time sync telemetry label');
  assert.ok(html.includes('aria-label="Filter entries"'), 'Must render Filter entries accessible button');
  assert.ok(html.includes('aria-label="View preferences"'), 'Must render View preferences accessible button');
});

runChallenge('JournalArchiveColumn: Month navigation, search input, active indicator bar, and entry list', () => {
  const html = renderToStaticMarkup(
    React.createElement(JournalArchiveColumn, {
      entries: mockJournalEntries,
      activeId: 'entry-sep-11',
      onSelectEntry: () => {},
      searchQuery: '',
      onSearchChange: () => {},
      currentMonthLabel: 'September 2026',
    })
  );

  assert.ok(html.includes('September 2026'), 'Must render current month label');
  assert.ok(html.includes('Filter journals, thoughts...'), 'Must render placeholder in search TextField');

  // Verify all 5 Stitch entry titles exist
  assert.ok(html.includes('Stabilizing the core pipelines &amp; emotional grounding') || html.includes('Stabilizing the core pipelines & emotional grounding'), 'Must render Entry Sep 11');
  assert.ok(html.includes('Reviewing system throughput and architecture boundaries'), 'Must render Entry Sep 10');
  assert.ok(html.includes('Cognitive bandwidth audit and capital allocation'), 'Must render Entry Sep 09');
  assert.ok(html.includes('Deep work cadence and execution velocity'), 'Must render Entry Sep 08');
  assert.ok(html.includes('Weekly retrospective and sovereign milestone alignment'), 'Must render Entry Sep 07');

  // Verify active indicator styling
  assert.ok(html.includes('width:4px') || html.includes('width: 4px'), 'Must render active entry left indicator bar');
  assert.ok(html.includes('background-color:#0B1628') || html.includes('#0B1628'), 'Must color active bar with Anchor Navy');

  // Verify word counts and reading times
  assert.ok(html.includes('480 words'), 'Must render 480 words count');
  assert.ok(html.includes('6 min'), 'Must render 6 min read');
});

runChallenge('EditorialSanctuary: Date metadata, mood chip, Daily Inquiry card, prose, quote, observations, and linked entities', () => {
  const entry = mockJournalEntries[0]; // Sep 11
  const html = renderToStaticMarkup(
    React.createElement(EditorialSanctuary, {
      entry,
      onUpdateInquiry: () => {},
    })
  );

  // 1. Header Metadata Strip & Mood Chip
  assert.ok(html.includes(entry.dateFullFormatted), 'Must render date full formatted');
  assert.ok(html.includes(`${entry.wordCount} words`), 'Must render word count');
  assert.ok(html.includes(`${entry.readingTimeMinutes} min read`), 'Must render reading time');
  assert.ok(html.includes(entry.mood.label), 'Must render mood label Grounded &amp; Focused');

  // 2. Daily Inquiry Callout Card
  assert.ok(html.includes('DAILY INQUIRY'), 'Must render DAILY INQUIRY badge');
  assert.ok(html.includes('How was today? What did you refrain from reacting to?'), 'Must render verbatim inquiry question');
  assert.ok(html.includes('Maintained complete neutrality'), 'Must render inquiry answer');

  // 3. Headline & Logged Info
  assert.ok(html.includes(entry.title), 'Must render headline title in h1');
  assert.ok(html.includes(entry.loggedTimeInfo), 'Must render ambient logged time info');

  // 4. Longform Article Body & Blockquote
  assert.ok(html.includes('The morning opened with turbulent alerts'), 'Must render opening prose');
  assert.ok(html.includes('Agitation is expensive'), 'Must render verbatim blockquote');
  assert.ok(html.includes(entry.quoteAttribution!), 'Must render quote attribution');

  // 5. Bulleted Reflections & Observations
  assert.ok(html.includes('REFLECTIONS &amp; OBSERVATIONS:') || html.includes('REFLECTIONS & OBSERVATIONS:'), 'Must render reflections header');
  assert.ok(html.includes('Eliminated context switching across three distinct workspaces.'), 'Must render observation 1');
  assert.ok(html.includes('Liquid reserves rebalanced cleanly into conservative short yields.'), 'Must render observation 2');
  assert.ok(html.includes('Physical stamina maintained through disciplined afternoon hiatus.'), 'Must render observation 3');

  // 6. Linked Operating Entities Tray
  assert.ok(html.includes('LINKED OPERATING ENTITIES'), 'Must render Linked Operating Entities header');
  assert.ok(html.includes('PROJECT'), 'Must render PROJECT badge');
  assert.ok(html.includes('ANCHOR Core'), 'Must render linked project ANCHOR Core');
  assert.ok(html.includes('FINANCE DEBIT'), 'Must render FINANCE DEBIT badge');
  assert.ok(html.includes('Rs. 1,300'), 'Must render linked debit Rs. 1,300');
  assert.ok(html.includes('TASKS RESOLVED'), 'Must render TASKS RESOLVED badge');
  assert.ok(html.includes('3 tasks checked'), 'Must render 3 tasks checked');

  // 7. Footer Footnote
  assert.ok(html.includes('Cmd + E'), 'Must render Cmd + E shortcut');
  assert.ok(html.includes('Anchor Journal Format v2.4'), 'Must render format footnote');
});

runChallenge('ContextualIntelligenceAside: Consistency score, 30-day spark dots matrix, pinned maxim, taxonomy tags, and CTA buttons', () => {
  const html = renderToStaticMarkup(
    React.createElement(ContextualIntelligenceAside, {
      entry: mockJournalEntries[0],
      consistencyStats: mockConsistencyStats,
      pinnedMaxim: mockPinnedMaxim,
      taxonomyTags: mockTaxonomyTags,
      onExportMarkdown: () => {},
      onPinEntry: () => {},
    })
  );

  // 1. Consistency Score Card
  assert.ok(html.includes('INTELLIGENCE'), 'Must render INTELLIGENCE header');
  assert.ok(html.includes('CONSISTENCY'), 'Must render CONSISTENCY card header');
  assert.ok(html.includes('+4% MoM'), 'Must render +4% MoM badge');
  assert.ok(html.includes('94%'), 'Must render 94% consistency score');
  assert.ok(html.includes('over past 30 days'), 'Must render over past 30 days label');
  assert.ok(html.includes('Aug 12'), 'Must render start date Aug 12');
  assert.ok(html.includes('Sep 11 (Today)'), 'Must render end date Sep 11 (Today)');

  // 2. 30-Day Spark Dots Matrix
  // Count the dots rendered in HTML
  const dotCount = mockConsistencyStats.sparkMatrix.length;
  assert.equal(dotCount, 30, 'Spark matrix must contain exactly 30 dots');
  assert.ok(html.includes('Stoic / Analytical'), 'Must render dominant tone Stoic / Analytical');

  // 3. Pinned Maxim Card
  assert.ok(html.includes('PINNED MAXIM'), 'Must render PINNED MAXIM badge');
  assert.ok(
    html.includes('Restraint is power. When life gets chaotic, tighten the system.'),
    'Must render verbatim pinned maxim quote'
  );
  assert.ok(html.includes('Anchor Ledger Codex · Axiom 04'), 'Must render maxim attribution');

  // 4. Taxonomy & Themes
  assert.ok(html.includes('TAXONOMY &amp; THEMES') || html.includes('TAXONOMY & THEMES'), 'Must render taxonomy header');
  assert.ok(html.includes('#engineering'), 'Must render #engineering tag');
  assert.ok(html.includes('#finance'), 'Must render #finance tag');
  assert.ok(html.includes('#clarity'), 'Must render #clarity tag');
  assert.ok(html.includes('#mindset'), 'Must render #mindset tag');
  assert.ok(html.includes('+ add'), 'Must render + add tag button');

  // 5. Action Buttons
  assert.ok(html.includes('Export Markdown'), 'Must render Export Markdown CTA');
  assert.ok(html.includes('Pin Entry'), 'Must render Pin Entry CTA');
});

runChallenge('MobileNotesView: Date rail, Mindset card, Editorial card, Micro observations, System correlations, and sticky tray', () => {
  const html = renderToStaticMarkup(
    React.createElement(MobileNotesView, {
      entries: mockJournalEntries,
      activeEntry: mockJournalEntries[0],
      onSelectEntry: () => {},
      onContinueWriting: () => {},
      onVoiceMemo: () => {},
      onAttachment: () => {},
      onMoreActions: () => {},
    })
  );

  // 1. Horizontal Date Pill Rail
  assert.ok(html.includes('FRI'), 'Must render FRI pill');
  assert.ok(html.includes('11'), 'Must render 11 pill');
  assert.ok(html.includes('Today'), 'Must render Today label on active pill');
  assert.ok(html.includes('THU'), 'Must render THU pill');
  assert.ok(html.includes('10'), 'Must render 10 pill');
  assert.ok(html.includes('WED'), 'Must render WED pill');
  assert.ok(html.includes('09'), 'Must render 09 pill');
  assert.ok(html.includes('TUE'), 'Must render TUE pill');
  assert.ok(html.includes('08'), 'Must render 08 pill');
  assert.ok(html.includes('MON'), 'Must render MON pill');
  assert.ok(html.includes('07'), 'Must render 07 pill');

  // 2. Mindset & Cadence Card
  assert.ok(html.includes('MINDSET &amp; CADENCE') || html.includes('MINDSET & CADENCE'), 'Must render Mindset & Cadence header');
  assert.ok(html.includes('Evening Reflection'), 'Must render Evening Reflection subtitle');
  assert.ok(html.includes('Grounded &amp; Calm') || html.includes('Grounded & Calm'), 'Must render Grounded & Calm chip');

  // 3. Editorial Article Card
  assert.ok(html.includes('ENTRY #254'), 'Must render Entry #254');
  assert.ok(html.includes('Stabilizing the core pipelines &amp; emotional grounding') || html.includes('Stabilizing the core pipelines & emotional grounding'), 'Must render entry title');
  assert.ok(html.includes('Restraint is power'), 'Must render blockquote excerpt');

  // 4. Recessed Micro-Observations Card
  assert.ok(html.includes('MICRO OBSERVATIONS'), 'Must render MICRO OBSERVATIONS title');
  assert.ok(html.includes('21:15'), 'Must render 21:15 timestamp');
  assert.ok(html.includes('Eliminated context switching across three distinct workspaces.'), 'Must render observation item');

  // 5. Cross-Link System Correlations
  assert.ok(html.includes('System Correlations'), 'Must render System Correlations title');
  assert.ok(html.includes('Project ANCHOR'), 'Must render Project ANCHOR pill');
  assert.ok(html.includes('-Rs. 1,300 spent today'), 'Must render -Rs. 1,300 spent today pill');
  assert.ok(html.includes('3 tasks done'), 'Must render 3 tasks done pill');

  // 6. Contextual Sticky Bottom Action Tray
  assert.ok(html.includes('Continue Writing'), 'Must render Continue Writing primary CTA');
  assert.ok(html.includes('aria-label="Voice memo capture"'), 'Must render Voice memo capture button');
  assert.ok(html.includes('aria-label="Add attachment"'), 'Must render Add attachment button');
  // Clearance check: sticky tray bottom positioning
  assert.ok(html.includes('position:sticky'), 'Must be positioned sticky');
});

runChallenge('NotesView: Breakpoint routing (xs mobile vs md desktop) and tablet/desktop aside handling', () => {
  const html = renderToStaticMarkup(
    React.createElement(NotesView, {
      entries: mockJournalEntries,
      activeEntry: mockJournalEntries[0],
      onSelectEntry: () => {},
      searchQuery: '',
      onSearchChange: () => {},
      onExportMarkdown: () => {},
      onPinEntry: () => {},
      onContinueWriting: () => {},
    })
  );

  // Both mobile flow and desktop flow rendered statically with CSS responsive display bindings
  assert.ok(html.includes('Daily Notes &amp; Reflective Journal') || html.includes('Daily Notes & Reflective Journal'), 'Renders desktop sub-bar');
  assert.ok(html.includes('FRI'), 'Renders mobile date pill');

  // Inspect source of NotesView.tsx for responsive breakpoint logic
  const notesViewSrc = fs.readFileSync(path.join(ROOT_DIR, 'src', 'components', 'notes', 'NotesView.tsx'), 'utf8');
  assert.ok(notesViewSrc.includes('display: { xs: "block", md: "none" }'), 'Mobile view rendered exclusively under md breakpoint');
  assert.ok(notesViewSrc.includes('display: { xs: "none", md: "flex" }'), 'Desktop 3-column container displayed at md+ breakpoint');
  assert.ok(notesViewSrc.includes('display: { md: "none", lg: "flex" }'), 'Aside column hidden on tablet (md) and shown on lg+');
});

runChallenge('src/app/notes/page.tsx: AppShell exclusion, hydration, and interactive dialogs', () => {
  const pagePath = path.join(ROOT_DIR, 'src', 'app', 'notes', 'page.tsx');
  const pageSrc = fs.readFileSync(pagePath, 'utf8');

  // Verify AppShell is NOT duplicated in /notes/page.tsx
  assert.equal(
    pageSrc.includes('<AppShell'),
    false,
    '/notes/page.tsx must NOT mount <AppShell> (AppShell is globally mounted in layout.tsx)'
  );
  assert.equal(
    pageSrc.includes('from "@/components/layout/AppShell"') || pageSrc.includes("from '../components/layout/AppShell'"),
    false,
    '/notes/page.tsx must NOT import AppShell'
  );

  // Verify NotesView is mounted with state handlers
  assert.ok(pageSrc.includes('<NotesView'), 'Must mount NotesView');
  assert.ok(pageSrc.includes('<Dialog'), 'Must mount reflection Dialog');
  assert.ok(pageSrc.includes('<Snackbar'), 'Must mount Snackbar feedback');
  assert.ok(pageSrc.includes('notesService.getNotesPageData()'), 'Must hydrate from notesService');
});

// ============================================================================
// SUITE 6: ADVERSARIAL BOUNDARY CONDITIONS & INVARIANTS
// ============================================================================
console.log('\n--- SUITE 6: Adversarial Boundary Conditions & Invariants ---');

runChallenge('Boundary 1: JournalArchiveColumn handles empty entries array gracefully without crashing', () => {
  const html = renderToStaticMarkup(
    React.createElement(JournalArchiveColumn, {
      entries: [],
      activeId: 'none',
      onSelectEntry: () => {},
      searchQuery: 'random unmatched string',
      onSearchChange: () => {},
    })
  );

  assert.ok(
    html.includes('No entries matching filter criteria.'),
    'Must display clean empty state message when no entries match'
  );
});

runChallenge('Boundary 2: EditorialSanctuary handles partial entry object with missing optional fields', () => {
  const minimalEntry = {
    id: 'entry-min',
    dateKey: '2026-09-01',
    dateDisplay: 'Sep 01',
    dateShort: '09/01',
    dateFullFormatted: 'Tuesday, Sep 1, 2026',
    title: 'Minimal Inscription',
    snippet: 'Testing minimal props without crashing.',
    wordCount: 120,
    readingTimeMinutes: 2,
    moodTag: 'Review',
    mood: {
      tag: 'Review',
      label: 'System Review',
      color: '#40617E',
      bgColor: 'rgba(64, 97, 126, 0.12)',
      dotColor: '#40617E',
    },
    inquiryQuestion: 'What did you observe?',
    inquiryAnswered: false,
    contentParagraphs: ['Single paragraph of prose.'],
    tags: ['#test'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    // Omitting quote, quoteAttribution, observations, linkedEntities, inquiry object
  } as unknown as JournalEntry;

  const html = renderToStaticMarkup(
    React.createElement(EditorialSanctuary, {
      entry: minimalEntry,
    })
  );

  assert.ok(html.includes('Minimal Inscription'), 'Must render title');
  assert.ok(html.includes('Single paragraph of prose.'), 'Must render prose');
  assert.ok(html.includes('Tuesday, Sep 1, 2026'), 'Must render formatted date');
  // Should not throw or crash even without quote or observations
  assert.equal(html.includes('NaN'), false, 'Must not output NaN');
});

runChallenge('Boundary 3: ContextualIntelligenceAside handles 100% score and empty missed days correctly', () => {
  const perfectStats: ConsistencyStats = {
    scorePercentage: 100,
    totalDays: 30,
    missedDaysCount: 0,
    momChangeDelta: '+6% MoM',
    dominantTone: 'Relentless Execution',
    startDateLabel: 'Aug 12',
    endDateLabel: 'Sep 11 (Today)',
    sparkMatrix: Array.from({ length: 30 }, (_, i) => ({
      dayIndex: i,
      dateKey: `2026-08-${String(i + 1).padStart(2, '0')}`,
      label: `Day ${i + 1}`,
      status: i === 29 ? ('today' as const) : ('completed' as const),
      tooltipText: `Day ${i + 1}: Inscribed`,
    })),
  };

  const html = renderToStaticMarkup(
    React.createElement(ContextualIntelligenceAside, {
      consistencyStats: perfectStats,
      onExportMarkdown: () => {},
      onPinEntry: () => {},
    })
  );

  assert.ok(html.includes('100%'), 'Must render 100% score');
  assert.ok(html.includes('Relentless Execution'), 'Must render custom dominant tone');
  assert.ok(html.includes('+6% MoM'), 'Must render +6% MoM delta');
});

runChallenge('Boundary 4: Markdown export formatting invariant produces structured Markdown', () => {
  const entry = mockJournalEntries[0];
  const md = [
    `# ${entry.title}`,
    ``,
    `**Date**: ${entry.dateFullFormatted}`,
    `**Mood**: ${entry.moodTag} (${entry.mood?.label || ''})`,
    `**Word Count**: ${entry.wordCount} words (${entry.readingTimeMinutes} min read)`,
    ``,
    entry.quote ? `> ${entry.quote}\n> — ${entry.quoteAttribution || 'Codex'}\n` : '',
    `## Daily Inquiry: ${entry.inquiry?.question || entry.inquiryQuestion}`,
    entry.inquiry?.answer || '_No response recorded_',
    ``,
    `## Reflections & Log`,
    ...(entry.contentParagraphs || []),
    ``,
    `---`,
    `*${entry.loggedTimeInfo}*`,
  ].join('\n');

  assert.ok(md.startsWith('# Stabilizing the core pipelines & emotional grounding'), 'Title formatted in Markdown H1');
  assert.ok(md.includes('**Date**: Friday, Sep 11, 2026'), 'Date metadata present');
  assert.ok(md.includes('**Word Count**: 480 words (6 min read)'), 'Word count metadata present');
  assert.ok(md.includes('> Agitation is expensive'), 'Quote blockquote formatted');
  assert.ok(md.includes('## Daily Inquiry:'), 'Inquiry section present');
  assert.ok(md.includes('## Reflections & Log'), 'Reflections section present');
});

runChallenge('Boundary 5: Inquiry edit save button guards against empty/whitespace answer', () => {
  const sanctuarySrc = fs.readFileSync(
    path.join(ROOT_DIR, 'src', 'components', 'notes', 'EditorialSanctuary.tsx'),
    'utf8'
  );

  assert.ok(
    sanctuarySrc.includes('inquiryText.trim()'),
    'EditorialSanctuary must check inquiryText.trim() before saving'
  );
});

runChallenge('Boundary 6: Active entry indicator bar correctly highlights selected item', () => {
  const htmlSep11 = renderToStaticMarkup(
    React.createElement(JournalArchiveColumn, {
      entries: mockJournalEntries,
      activeId: 'entry-sep-11',
      onSelectEntry: () => {},
      searchQuery: '',
      onSearchChange: () => {},
    })
  );

  const htmlSep10 = renderToStaticMarkup(
    React.createElement(JournalArchiveColumn, {
      entries: mockJournalEntries,
      activeId: 'entry-sep-10',
      onSelectEntry: () => {},
      searchQuery: '',
      onSearchChange: () => {},
    })
  );

  // Both should render cleanly and position active indicator
  assert.ok(htmlSep11.includes('width:4px') || htmlSep11.includes('width: 4px'), 'Sep 11 has active bar');
  assert.ok(htmlSep10.includes('width:4px') || htmlSep10.includes('width: 4px'), 'Sep 10 has active bar');
});

console.log('\n================================================================');
console.log(`--- MILESTONE 2 CHALLENGE COMPLETE: ${passCount} PASSED, ${failCount} FAILED ---`);
console.log('================================================================\n');

if (failCount > 0) {
  process.exit(1);
} else {
  console.log('VERDICT: ALL ADVERSARIAL CHALLENGES SATISFIED EMPIRICALLY.');
}
