import assert from 'node:assert/strict';
import { notesService } from '../src/services/notesService';

async function runNotesServiceTestSuite() {
  console.log('--- STARTING MILESTONE 2: NOTES SERVICE INTEGRITY SUITE ---');
  await notesService.resetState();

  // Test 1: Verify Initial Fixtures & Stitch Baseline
  console.log('Test 1: Verify baseline journal entries match Stitch specs');
  const allEntries = await notesService.getJournalEntries();
  assert.equal(allEntries.length, 5, 'Must return exactly 5 baseline entries');

  const sep11 = allEntries.find((e) => e.id === 'entry-sep-11');
  assert.ok(sep11, 'Sep 11 entry must exist');
  assert.equal(sep11?.title, 'Stabilizing the core pipelines & emotional grounding');
  assert.equal(sep11?.wordCount, 480);
  assert.equal(sep11?.readingTimeMinutes, 6);
  assert.equal(sep11?.moodTag, 'Grounded');
  assert.equal(sep11?.mood.label, 'Grounded & Focused');
  assert.equal(sep11?.isToday, true);
  assert.equal(sep11?.entryNumber, 254);
  assert.equal(sep11?.linkedEntities.project?.name, 'ANCHOR Core');
  assert.equal(sep11?.linkedEntities.financialDebit?.amount, 1300);
  assert.equal(sep11?.linkedEntities.tasksResolved?.count, 3);
  assert.ok(sep11?.quote?.includes('Agitation is expensive'));
  console.log('  -> PASS: Baseline Stitch items accurately verified');

  // Test 2: Entry Retrieval by ID & Not Found Handling
  console.log('Test 2: Verify ID lookup and null handling');
  const found = await notesService.getJournalEntryById('entry-sep-10');
  assert.ok(found, 'Sep 10 entry must be found');
  assert.equal(found?.moodTag, 'Strategic');
  assert.equal(found?.wordCount, 620);

  const notFound = await notesService.getJournalEntryById('entry-invalid-999');
  assert.equal(notFound, null, 'Must return null for non-existent id');
  console.log('  -> PASS: ID lookup and null safety verified');

  // Test 3: Search Functionality across fields
  console.log('Test 3: Search functionality across text, quote, and tags');
  const sedResult = await notesService.searchJournalEntries('sediment');
  assert.equal(sedResult.length, 1);
  assert.equal(sedResult[0].id, 'entry-sep-11');

  const marcusResult = await notesService.searchJournalEntries('Marcus');
  assert.equal(marcusResult.length, 1);
  assert.equal(marcusResult[0].id, 'entry-sep-09');

  const financeTagResult = await notesService.searchJournalEntries('#finance');
  assert.equal(financeTagResult.length, 3, 'Must match Sep 11, Sep 10, Sep 07');

  const emptySearch = await notesService.searchJournalEntries('nonexistent_word_xyz');
  assert.equal(emptySearch.length, 0);

  const caseInsensitive = await notesService.searchJournalEntries('GROUNDED');
  assert.equal(caseInsensitive.length, 1);
  console.log('  -> PASS: Search queries operate correctly');

  // Test 4: Inquiry Answer Update & Mutation Integrity
  console.log('Test 4: In-memory inquiry update and mutation integrity');
  const newAnswer = 'Instituted a strict 90-minute blackout buffer right after morning review.';
  const updated = await notesService.updateInquiryAnswer('entry-sep-11', newAnswer);
  assert.equal(updated.inquiry.answer, newAnswer);
  assert.equal(updated.inquiry.isAnswered, true);

  const reFetched = await notesService.getJournalEntryById('entry-sep-11');
  assert.equal(reFetched?.inquiry.answer, newAnswer, 'Mutation must persist in memory');

  await assert.rejects(
    async () => {
      await notesService.updateInquiryAnswer('entry-unknown', 'Some answer');
    },
    /not found/,
    'Must throw an error when entry id does not exist'
  );
  console.log('  -> PASS: Inquiry update and error handling validated');

  // Test 5: 30-Day Consistency Matrix & Statistics
  console.log('Test 5: Consistency matrix and statistics');
  const stats = await notesService.getConsistencyStats();
  assert.equal(stats.scorePercentage, 94);
  assert.equal(stats.momChangeDelta, '+4% MoM');
  assert.equal(stats.dominantTone, 'Stoic / Analytical');
  assert.equal(stats.sparkMatrix.length, 30);

  const missedDots = stats.sparkMatrix.filter((d) => d.status === 'missed');
  assert.equal(missedDots.length, 2, 'Must have exactly 2 missed days (Aug 15 & Aug 27)');
  assert.equal(stats.sparkMatrix[29].status, 'today', 'Last dot must be flagged as today');
  console.log('  -> PASS: Consistency metrics accurately verified');

  // Test 6: Pinned Maxim & Taxonomy Tags
  console.log('Test 6: Pinned maxim and taxonomy tags');
  const maxim = await notesService.getPinnedMaxim();
  assert.ok(maxim.quote.includes('Restraint is power'));

  const tags = await notesService.getTaxonomyTags();
  assert.equal(tags.length, 4);
  assert.ok(tags.includes('#engineering'));
  assert.ok(tags.includes('#clarity'));
  console.log('  -> PASS: Maxim and taxonomy tags verified');

  // Test 7: Filter Options Support
  console.log('Test 7: Filter options for mood and tags');
  const strategicEntries = await notesService.getJournalEntries({ selectedMood: 'Strategic' });
  assert.equal(strategicEntries.length, 1);
  assert.equal(strategicEntries[0].id, 'entry-sep-10');

  const engineeringEntries = await notesService.getJournalEntries({ selectedTag: '#engineering' });
  assert.equal(engineeringEntries.length, 3);
  console.log('  -> PASS: Filter options verified');

  // Test 8: Full NotesPageData Aggregation
  console.log('Test 8: Full NotesPageData aggregation');
  const pageDataDefault = await notesService.getNotesPageData();
  assert.equal(pageDataDefault.entries.length, 5);
  assert.equal(pageDataDefault.activeEntry.id, 'entry-sep-11');
  assert.equal(pageDataDefault.consistencyStats.scorePercentage, 94);
  assert.equal(pageDataDefault.termBadge, 'Autumn Term 2026');

  const pageDataCustomActive = await notesService.getNotesPageData('entry-sep-08');
  assert.equal(pageDataCustomActive.activeEntry.id, 'entry-sep-08');
  console.log('  -> PASS: Page data aggregation verified');

  // Test 9: Immutability and State Protection
  console.log('Test 9: Immutability and deep cloning');
  const entries1 = await notesService.getJournalEntries();
  entries1[0].title = 'MUTATED TITLE IN MEMORY';

  const entries2 = await notesService.getJournalEntries();
  assert.notEqual(entries2[0].title, 'MUTATED TITLE IN MEMORY', 'Deep cloning must prevent state corruption');
  console.log('  -> PASS: Deep cloning prevents memory leakage');

  // Test 10: Reset State
  console.log('Test 10: Reset state to pristine fixtures');
  await notesService.resetState();
  const resetEntry = await notesService.getJournalEntryById('entry-sep-11');
  assert.notEqual(resetEntry?.inquiry.answer, newAnswer, 'Inquiry answer must revert to baseline');
  console.log('  -> PASS: Reset state operates cleanly');

  console.log('--- ALL MILESTONE 2 TESTS PASSED SUCCESSFULLY ---');
}

runNotesServiceTestSuite().catch((err) => {
  console.error('Test suite failed:', err);
  process.exit(1);
});
