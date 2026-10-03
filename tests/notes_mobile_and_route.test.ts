import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { mockJournalEntries, mockConsistencyStats, mockPinnedMaxim } from '../src/services/mockData';
import { notesService } from '../src/services/notesService';

const ROOT_DIR = path.resolve('E:/anchor');

async function runNotesRouteAndIntegritySuite() {
  console.log('--- STARTING NOTES ROUTE, MOBILE & ARCHITECTURAL INTEGRITY SUITE ---');

  // Test 1: AppShell Duplication Isolation Check
  console.log('Test 1: AppShell Duplication Isolation in src/app/notes/page.tsx');
  const routePagePath = path.join(ROOT_DIR, 'src/app/notes/page.tsx');
  assert.ok(fs.existsSync(routePagePath), 'src/app/notes/page.tsx must exist');
  const routeContent = fs.readFileSync(routePagePath, 'utf8');

  assert.equal(
    routeContent.includes('<AppShell'),
    false,
    'src/app/notes/page.tsx must NOT wrap content in <AppShell> (RootLayout already wraps globally)'
  );
  assert.equal(
    routeContent.includes('import AppShell'),
    false,
    'src/app/notes/page.tsx must NOT import AppShell'
  );
  console.log('  -> PASS: AppShell isolation confirmed (no double shell wrapping)');

  // Test 2: Strict Zero-Any Verification across all Milestone 2 files
  console.log('Test 2: Zero-any scan across Milestone 2 codebase files');
  const filesToCheck = [
    'src/types/models.ts',
    'src/services/notesService.ts',
    'src/services/mockData.ts',
    'src/components/notes/NotesSubBar.tsx',
    'src/components/notes/JournalArchiveColumn.tsx',
    'src/components/notes/EditorialSanctuary.tsx',
    'src/components/notes/ContextualIntelligenceAside.tsx',
    'src/components/notes/MobileNotesView.tsx',
    'src/components/notes/NotesView.tsx',
    'src/components/notes/index.ts',
    'src/app/notes/page.tsx',
  ];

  for (const relPath of filesToCheck) {
    const fullPath = path.join(ROOT_DIR, relPath);
    assert.ok(fs.existsSync(fullPath), `${relPath} must exist`);
    const content = fs.readFileSync(fullPath, 'utf8');

    // Check for ': any' or 'as any'
    const anyMatches = content.match(/(:\s*any\b|as\s+any\b)/g);
    assert.equal(
      anyMatches,
      null,
      `Found forbidden 'any' type in ${relPath}: ${anyMatches ? anyMatches.join(', ') : ''}`
    );
  }
  console.log('  -> PASS: Strictly 0 "any" types across all M2 files');

  // Test 3: Stitch Verbatim Copy Fidelity
  console.log('Test 3: Verbatim copy fidelity for all 5 Stitch entries');
  assert.equal(mockJournalEntries.length, 5, 'Must contain 5 journal entries');
  const titles = mockJournalEntries.map((e) => e.title);
  assert.ok(titles.includes('Stabilizing the core pipelines & emotional grounding'));
  assert.ok(titles.includes('Restraint as leverage: on capital discipline'));
  assert.ok(titles.includes('Quarterly advisory retrospective'));
  assert.ok(titles.includes('Architecture decisions and system simplicity'));
  assert.ok(titles.includes('Weekly review & energetic audit'));

  const sep11 = mockJournalEntries.find((e) => e.id === 'entry-sep-11');
  assert.ok(sep11?.quote?.includes('Agitation is expensive'));
  assert.equal(sep11?.linkedEntities.financialDebit?.amount, 1300);
  assert.equal(sep11?.linkedEntities.tasksResolved?.count, 3);
  assert.equal(sep11?.linkedEntities.project?.name, 'ANCHOR Core');

  assert.equal(mockConsistencyStats.scorePercentage, 94);
  assert.equal(mockConsistencyStats.sparkMatrix.length, 30);
  assert.ok(mockPinnedMaxim.quote.includes('Restraint is power'));
  console.log('  -> PASS: Stitch copy fidelity verified');

  // Test 4: Component Barrel Exports
  console.log('Test 4: Verify barrel exports in src/components/notes/index.ts');
  const barrelPath = path.join(ROOT_DIR, 'src/components/notes/index.ts');
  const barrelContent = fs.readFileSync(barrelPath, 'utf8');
  assert.ok(barrelContent.includes('NotesSubBar'));
  assert.ok(barrelContent.includes('JournalArchiveColumn'));
  assert.ok(barrelContent.includes('EditorialSanctuary'));
  assert.ok(barrelContent.includes('ContextualIntelligenceAside'));
  assert.ok(barrelContent.includes('MobileNotesView'));
  assert.ok(barrelContent.includes('NotesView'));
  console.log('  -> PASS: All components exported cleanly');

  // Test 5: Service Pin Toggle & Persistence
  console.log('Test 5: Pin toggle and state mutation');
  await notesService.resetState();
  const pinnedInitial = await notesService.getJournalEntryById('entry-sep-09');
  assert.equal(pinnedInitial?.isPinned, false);

  const toggled = await notesService.togglePinEntry('entry-sep-09');
  assert.equal(toggled.isPinned, true);

  const reChecked = await notesService.getJournalEntryById('entry-sep-09');
  assert.equal(reChecked?.isPinned, true);

  await notesService.resetState();
  console.log('  -> PASS: Pin toggle verified');

  console.log('--- ALL NOTES ROUTE & ARCHITECTURAL INTEGRITY TESTS PASSED ---');
}

runNotesRouteAndIntegritySuite().catch((err) => {
  console.error('Test suite failed:', err);
  process.exit(1);
});
