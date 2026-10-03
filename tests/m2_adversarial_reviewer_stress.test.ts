import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { notesService } from '../src/services/notesService';
import {
  mockJournalEntries,
  mockConsistencyStats,
  mockPinnedMaxim,
  mockTaxonomyTags,
} from '../src/services/mockData';

const ROOT_DIR = path.resolve('E:/anchor');

async function runAdversarialM2ReviewerStressTest() {
  console.log('=== STARTING ADVERSARIAL STRESS & INTEGRITY SUITE FOR MILESTONE 2 ===');

  await notesService.resetState();

  // --------------------------------------------------------------------------
  // STRESS TEST 1: Adversarial Deep Cloning & Nested Mutation Immunity
  // --------------------------------------------------------------------------
  console.log('Stress Test 1: Deep Cloning & Nested Mutation Immunity');

  // Fetch entries and aggressively mutate deep properties
  const entries1 = await notesService.getJournalEntries();
  assert.ok(entries1.length >= 5, 'Must have at least 5 entries');

  entries1[0].title = 'CORRUPTED_TITLE';
  entries1[0].mood.label = 'CORRUPTED_MOOD_LABEL';
  entries1[0].mood.color = '#999999';
  entries1[0].linkedEntities.project!.name = 'CORRUPTED_PROJECT';
  entries1[0].linkedEntities.financialDebit!.amount = 999999;
  entries1[0].observations[0].note = 'CORRUPTED_OBSERVATION';
  entries1[0].tags.push('#corrupted_tag');
  entries1[0].contentParagraphs[0] = 'CORRUPTED_PARAGRAPH';

  // Fetch again and verify pristine baseline remains intact
  const entries2 = await notesService.getJournalEntries();
  assert.notEqual(entries2[0].title, 'CORRUPTED_TITLE');
  assert.equal(entries2[0].title, 'Stabilizing the core pipelines & emotional grounding');
  assert.equal(entries2[0].mood.label, 'Grounded & Focused');
  assert.equal(entries2[0].linkedEntities.project?.name, 'ANCHOR Core');
  assert.equal(entries2[0].linkedEntities.financialDebit?.amount, 1300);
  assert.notEqual(entries2[0].observations[0].note, 'CORRUPTED_OBSERVATION');
  assert.equal(entries2[0].tags.includes('#corrupted_tag'), false);
  assert.notEqual(entries2[0].contentParagraphs[0], 'CORRUPTED_PARAGRAPH');

  // Verify consistency stats mutation immunity
  const stats1 = await notesService.getConsistencyStats();
  stats1.scorePercentage = 0;
  stats1.sparkMatrix[0].status = 'missed';
  stats1.sparkMatrix.pop();

  const stats2 = await notesService.getConsistencyStats();
  assert.equal(stats2.scorePercentage, 94);
  assert.equal(stats2.sparkMatrix.length, 30);
  assert.equal(stats2.sparkMatrix[0].status, 'completed');

  // Verify pinned maxim mutation immunity
  const maxim1 = await notesService.getPinnedMaxim();
  maxim1.quote = 'CORRUPTED_MAXIM';
  const maxim2 = await notesService.getPinnedMaxim();
  assert.notEqual(maxim2.quote, 'CORRUPTED_MAXIM');

  // Verify taxonomy tags mutation immunity
  const tags1 = await notesService.getTaxonomyTags();
  tags1.push('#hacked_tag');
  const tags2 = await notesService.getTaxonomyTags();
  assert.equal(tags2.includes('#hacked_tag'), false);

  console.log('  -> PASS: All in-memory stores exhibit complete deep-cloned immutability');

  // --------------------------------------------------------------------------
  // STRESS TEST 2: Adversarial Search & Filter Edge Cases
  // --------------------------------------------------------------------------
  console.log('Stress Test 2: Adversarial Search & Filter Edge Cases');

  // Extreme whitespace, special regex characters, casing
  const queryChars = await notesService.searchJournalEntries('   *.*   ');
  assert.equal(queryChars.length, 0);

  const queryPartial = await notesService.searchJournalEntries('stabilizing');
  assert.equal(queryPartial.length, 1);
  assert.equal(queryPartial[0].id, 'entry-sep-11');

  const queryObservations = await notesService.searchJournalEntries('cognitive load');
  assert.equal(queryObservations.length, 1);
  assert.equal(queryObservations[0].id, 'entry-sep-11');

  const queryQuote = await notesService.searchJournalEntries('Agitation is expensive');
  assert.equal(queryQuote.length, 1);
  assert.equal(queryQuote[0].id, 'entry-sep-11');

  const queryTagsClarity = await notesService.searchJournalEntries('#clarity');
  assert.equal(queryTagsClarity.length, 5, 'All 5 entries have #clarity tag');

  const queryTagsMindset = await notesService.searchJournalEntries('#mindset');
  assert.equal(queryTagsMindset.length, 4, '4 entries have #mindset tag');

  // Filter with combinations
  const combinedFilter = await notesService.getJournalEntries({
    selectedMood: 'Systems',
    selectedTag: '#engineering',
    selectedMonth: 'September 2026',
  });
  assert.equal(combinedFilter.length, 1);
  assert.equal(combinedFilter[0].id, 'entry-sep-08');

  // Empty string query should return all entries
  const emptyQuery = await notesService.searchJournalEntries('   ');
  assert.equal(emptyQuery.length, 5);

  console.log('  -> PASS: Search and filter pipelines handle adversarial inputs correctly');

  // --------------------------------------------------------------------------
  // STRESS TEST 3: State Mutation & Invalidation Stress
  // --------------------------------------------------------------------------
  console.log('Stress Test 3: State Mutation & Invalidation Stress');

  // Repeated inquiry update with weird strings
  const weirdAnswer = '   Line 1\nLine 2\twith tabs and unicode: 🧘‍♂️✨   ';
  const updatedEntry = await notesService.updateInquiryAnswer('entry-sep-10', weirdAnswer);
  assert.equal(updatedEntry.inquiry.answer, weirdAnswer.trim());
  assert.equal(updatedEntry.inquiry.isAnswered, true);
  assert.ok(updatedEntry.updatedAt);

  // Pin toggling sequence: false -> true -> false
  const initialPin = await notesService.getJournalEntryById('entry-sep-08');
  assert.equal(initialPin?.isPinned, false);

  const pinned1 = await notesService.togglePinEntry('entry-sep-08');
  assert.equal(pinned1.isPinned, true);

  const pinned2 = await notesService.togglePinEntry('entry-sep-08');
  assert.equal(pinned2.isPinned, false);

  // Invalid ID checks
  await assert.rejects(async () => {
    await notesService.togglePinEntry('non-existent-entry-id');
  }, /not found/);

  // Reset state wipes all mutations
  await notesService.resetState();
  const restoredEntry = await notesService.getJournalEntryById('entry-sep-10');
  assert.notEqual(restoredEntry?.inquiry.answer, weirdAnswer.trim());
  assert.equal(restoredEntry?.inquiry.answer, mockJournalEntries[1].inquiry.answer);

  console.log('  -> PASS: State mutation, pin toggling, and clean reset validated');

  // --------------------------------------------------------------------------
  // STRESS TEST 4: getNotesPageData Edge Cases & Fallbacks
  // --------------------------------------------------------------------------
  console.log('Stress Test 4: getNotesPageData Edge Cases & Fallbacks');

  // Default call returns first entry as active
  const pageData1 = await notesService.getNotesPageData();
  assert.equal(pageData1.activeEntry.id, 'entry-sep-11');
  assert.equal(pageData1.termBadge, 'Autumn Term 2026');
  assert.equal(pageData1.currentMonth, 'September 2026');

  // Specific valid active ID
  const pageData2 = await notesService.getNotesPageData('entry-sep-07');
  assert.equal(pageData2.activeEntry.id, 'entry-sep-07');

  // Nonexistent active ID must fall back gracefully to entries[0]
  const pageData3 = await notesService.getNotesPageData('non-existent-xyz');
  assert.equal(pageData3.activeEntry.id, 'entry-sep-11');

  console.log('  -> PASS: getNotesPageData handles valid, missing, and invalid active IDs safely');

  // --------------------------------------------------------------------------
  // STRESS TEST 5: Component Syntax, Design Tokens & MUI Priority Audit
  // --------------------------------------------------------------------------
  console.log('Stress Test 5: Component Syntax, Design Tokens & MUI Priority Audit');

  const components = [
    'src/components/notes/NotesSubBar.tsx',
    'src/components/notes/JournalArchiveColumn.tsx',
    'src/components/notes/EditorialSanctuary.tsx',
    'src/components/notes/ContextualIntelligenceAside.tsx',
    'src/components/notes/MobileNotesView.tsx',
    'src/components/notes/NotesView.tsx',
  ];

  for (const comp of components) {
    const content = fs.readFileSync(path.join(ROOT_DIR, comp), 'utf8');

    // 1. Verify "use client" directive
    assert.ok(content.startsWith('"use client";') || content.startsWith("'use client';"), `${comp} must have use client`);

    // 2. Verify zero prohibited icon libraries
    assert.equal(content.includes('lucide-react'), false, `${comp} must not import lucide`);
    assert.equal(content.includes('react-icons'), false, `${comp} must not import react-icons`);

    // 3. Verify native MUI components are imported
    assert.ok(content.includes('@mui/material'), `${comp} must import from @mui/material`);
  }

  // Verify slotProps in JournalArchiveColumn and EditorialSanctuary and page.tsx
  const archiveColContent = fs.readFileSync(path.join(ROOT_DIR, 'src/components/notes/JournalArchiveColumn.tsx'), 'utf8');
  assert.ok(archiveColContent.includes('slotProps'), 'JournalArchiveColumn must use slotProps on TextField');

  const pageContent = fs.readFileSync(path.join(ROOT_DIR, 'src/app/notes/page.tsx'), 'utf8');
  assert.ok(pageContent.includes('slotProps'), 'NotesPage must use slotProps on Dialog/TextField');

  // Verify tri-font CSS variable usages
  const fontVars = [
    'var(--font-newsreader)',
    'var(--font-plus-jakarta-sans)',
    'var(--font-jetbrains-mono)',
  ];
  for (const fontVar of fontVars) {
    assert.ok(
      archiveColContent.includes(fontVar) ||
      fs.readFileSync(path.join(ROOT_DIR, 'src/components/notes/EditorialSanctuary.tsx'), 'utf8').includes(fontVar),
      `Components must use font variable ${fontVar}`
    );
  }

  console.log('  -> PASS: Component syntax, MUI slotProps, and tri-font hierarchy verified');

  // --------------------------------------------------------------------------
  // STRESS TEST 6: Responsive Layout & Isolation Audit
  // --------------------------------------------------------------------------
  console.log('Stress Test 6: Responsive Layout & Isolation Audit');

  const notesViewContent = fs.readFileSync(path.join(ROOT_DIR, 'src/components/notes/NotesView.tsx'), 'utf8');

  // Mobile layout switch: xs vs md
  assert.ok(notesViewContent.includes('display: { xs: "block", md: "none" }'), 'MobileNotesView rendered for <md');
  assert.ok(notesViewContent.includes('display: { xs: "none", md: "flex" }'), 'Desktop 3-column rendered for >=md');

  // Column 3 hidden on tablet (md), shown on desktop (lg)
  assert.ok(notesViewContent.includes('display: { md: "none", lg: "flex" }'), 'Aside hidden on md, flex on lg');

  // Page isolation check
  assert.equal(pageContent.includes('<AppShell'), false, 'src/app/notes/page.tsx must NOT contain <AppShell>');

  console.log('  -> PASS: Responsive breakpoints and AppShell isolation fully verified');

  console.log('=== ALL ADVERSARIAL STRESS TESTS PASSED SUCCESSFULLY (100%) ===');
}

runAdversarialM2ReviewerStressTest().catch((err) => {
  console.error('ADVERSARIAL STRESS TEST FAILURE:', err);
  process.exit(1);
});
