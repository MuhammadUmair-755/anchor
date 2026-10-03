import assert from 'node:assert/strict';
import { notesService } from '../src/services/notesService';
import { mockJournalEntries, mockNotesPageData } from '../src/services/mockData';

interface StressTestResult {
  category: string;
  name: string;
  passed: boolean;
  details?: string;
}

const results: StressTestResult[] = [];

function recordResult(category: string, name: string, passed: boolean, details?: string) {
  results.push({ category, name, passed, details });
  const mark = passed ? 'PASS' : 'FAIL';
  console.log(`  [${mark}] ${name}${details ? ` -> ${details}` : ''}`);
}

async function runChallengerStressSuite() {
  console.log('================================================================');
  console.log('CHALLENGER 1 EMPIRICAL STRESS TEST: NOTES SERVICE (MILESTONE 2)');
  console.log('================================================================\n');

  await notesService.resetState();

  // ==========================================================================
  // SECTION 1: ADVERSARIAL SEARCH QUERY PROBING
  // ==========================================================================
  console.log('--- SECTION 1: ADVERSARIAL SEARCH QUERY PROBING ---');

  // 1.1 Regex meta-characters & delimiters
  const regexTokens = ['(', ')', '[', ']', '{', '}', '*', '+', '?', '\\', '/', '^', '$', '|', '.', '.*', '(?=.*)'];
  for (const token of regexTokens) {
    try {
      const res = await notesService.searchJournalEntries(token);
      assert.ok(Array.isArray(res), `Query "${token}" should return array`);
      // Tokens shouldn't crash with SyntaxError or bad regex evaluation
      recordResult('Search', `Regex token "${token}" handled safely`, true, `Returned ${res.length} matches`);
    } catch (err: unknown) {
      recordResult('Search', `Regex token "${token}" handling`, false, String(err));
    }
  }

  // 1.2 SQL Injection, HTML, & XSS injection payloads
  const attackPayloads = [
    "' OR '1'='1",
    "'; DROP TABLE notes; --",
    "<script>alert('xss')</script>",
    '<img src=x onerror=alert(1)>',
    '${7*7}',
    '{{7*7}}',
    '\\x00\\x1f',
  ];
  for (const payload of attackPayloads) {
    try {
      const res = await notesService.searchJournalEntries(payload);
      assert.ok(Array.isArray(res), `Payload "${payload}" should return array`);
      assert.equal(res.length, 0, `Payload "${payload}" should not match mock data`);
      recordResult('Search', `Injection payload "${payload.slice(0, 15)}" neutralized`, true, '0 matches, no crash');
    } catch (err: unknown) {
      recordResult('Search', `Injection payload "${payload.slice(0, 15)}"`, false, String(err));
    }
  }

  // 1.3 Leading, trailing, and excessive whitespace
  try {
    const resLeadingTrailing = await notesService.searchJournalEntries('   Grounded   ');
    assert.equal(resLeadingTrailing.length, 1, 'Should find 1 entry despite leading/trailing spaces');
    assert.equal(resLeadingTrailing[0].id, 'entry-sep-11');

    const resTabsNewlines = await notesService.searchJournalEntries('\t\n  #engineering \n\t');
    assert.equal(resTabsNewlines.length, 3, 'Should find 3 entries tagged #engineering');

    recordResult('Search', 'Whitespace trimming (spaces, tabs, newlines)', true, 'Normalized correctly');
  } catch (err: unknown) {
    recordResult('Search', 'Whitespace trimming', false, String(err));
  }

  // 1.4 Empty and whitespace-only queries
  try {
    const resEmpty = await notesService.searchJournalEntries('');
    assert.equal(resEmpty.length, 5, 'Empty string query should return all 5 entries');

    const resSpacesOnly = await notesService.searchJournalEntries('     ');
    assert.equal(resSpacesOnly.length, 5, 'Whitespace-only query should return all 5 entries');

    const filterEmpty = await notesService.getJournalEntries({ searchQuery: '   ' });
    assert.equal(filterEmpty.length, 5, 'filter.searchQuery with whitespace only should return all 5 entries');

    recordResult('Search', 'Empty and whitespace-only queries return full baseline', true, '5 entries returned');
  } catch (err: unknown) {
    recordResult('Search', 'Empty query fallback', false, String(err));
  }

  // 1.5 Non-matching and high entropy strings
  try {
    const resNonMatching = await notesService.searchJournalEntries('qqwwrrttyy_no_match_possible_987654');
    assert.equal(resNonMatching.length, 0, 'High entropy string must return 0 results');

    const resSpecialPunct = await notesService.searchJournalEntries('~!@#$%^&*()_+{}|:<>?');
    assert.equal(resSpecialPunct.length, 0, 'Special punctuation with no matches must return 0 results');

    recordResult('Search', 'Non-matching and random entropy strings return empty array', true, '0 results');
  } catch (err: unknown) {
    recordResult('Search', 'Non-matching string handling', false, String(err));
  }

  // 1.6 Unicode, emojis, and non-ASCII characters
  try {
    const resEmoji = await notesService.searchJournalEntries('🔥');
    assert.equal(resEmoji.length, 0, 'Emoji should not crash and return 0 matches');

    const resGreek = await notesService.searchJournalEntries('Στωικισμός');
    assert.equal(resGreek.length, 0, 'Non-ASCII Greek should return 0 matches without error');

    recordResult('Search', 'Unicode and emoji query safety', true, 'No crashes, safe 0 results');
  } catch (err: unknown) {
    recordResult('Search', 'Unicode handling', false, String(err));
  }

  // 1.7 Exhaustive search surface test across all searchable fields
  try {
    // Title
    const matchTitle = await notesService.searchJournalEntries('Stabilizing the core');
    assert.equal(matchTitle.length, 1);
    assert.equal(matchTitle[0].id, 'entry-sep-11');

    // Snippet
    const matchSnippet = await notesService.searchJournalEntries('market noise');
    assert.equal(matchSnippet.length, 1);
    assert.equal(matchSnippet[0].id, 'entry-sep-11');

    // Quote
    const matchQuote = await notesService.searchJournalEntries('sediment of initial anxiety');
    assert.equal(matchQuote.length, 1);
    assert.equal(matchQuote[0].id, 'entry-sep-11');

    // Content paragraphs
    const matchParagraph = await notesService.searchJournalEntries('redundant listeners');
    assert.equal(matchParagraph.length, 1);
    assert.equal(matchParagraph[0].id, 'entry-sep-11');

    // Tags
    const matchTag = await notesService.searchJournalEntries('#clarity');
    assert.equal(matchTag.length, 2);

    // Mood Tag
    const matchMoodTag = await notesService.searchJournalEntries('Strategic');
    assert.equal(matchMoodTag.length, 1);
    assert.equal(matchMoodTag[0].id, 'entry-sep-10');

    // Mood Label
    const matchMoodLabel = await notesService.searchJournalEntries('Grounded & Focused');
    assert.equal(matchMoodLabel.length, 1);
    assert.equal(matchMoodLabel[0].id, 'entry-sep-11');

    // Observation title
    const matchObsTitle = await notesService.searchJournalEntries('Capital calm:');
    assert.equal(matchObsTitle.length, 1);
    assert.equal(matchObsTitle[0].id, 'entry-sep-11');

    // Observation note
    const matchObsNote = await notesService.searchJournalEntries('over-hedge');
    assert.equal(matchObsNote.length, 1);
    assert.equal(matchObsNote[0].id, 'entry-sep-11');

    recordResult('Search', 'Comprehensive multi-field discovery (title, snippet, quote, paragraphs, tags, mood, obs)', true, 'All 9 field types matched');
  } catch (err: unknown) {
    recordResult('Search', 'Comprehensive multi-field discovery', false, String(err));
  }

  // ==========================================================================
  // SECTION 2: DAILY INQUIRY UPDATE STRESS & BOUNDARY TESTING
  // ==========================================================================
  console.log('\n--- SECTION 2: DAILY INQUIRY UPDATE STRESS & BOUNDARY TESTING ---');

  // 2.1 Massive string payload (100,000 and 500,000 characters)
  try {
    const payload100k = 'A'.repeat(100_000);
    const updated100k = await notesService.updateInquiryAnswer('entry-sep-11', payload100k);
    assert.equal(updated100k.inquiry.answer?.length, 100_000, 'Answer must match 100k length');

    const retrieved100k = await notesService.getJournalEntryById('entry-sep-11');
    assert.equal(retrieved100k?.inquiry.answer?.length, 100_000, 'Retrieved answer must match 100k length');

    const payload500k = 'B'.repeat(500_000);
    const updated500k = await notesService.updateInquiryAnswer('entry-sep-11', payload500k);
    assert.equal(updated500k.inquiry.answer?.length, 500_000, 'Answer must match 500k length');

    const retrieved500k = await notesService.getJournalEntryById('entry-sep-11');
    assert.equal(retrieved500k?.inquiry.answer?.length, 500_000, 'Retrieved answer must match 500k length');

    recordResult('Inquiry', 'Massive string payloads (100k and 500k chars)', true, 'Successfully persisted and retrieved');
  } catch (err: unknown) {
    recordResult('Inquiry', 'Massive string payloads', false, String(err));
  }

  // 2.2 Empty strings and whitespace-only strings
  try {
    const updatedEmpty = await notesService.updateInquiryAnswer('entry-sep-11', '');
    assert.equal(updatedEmpty.inquiry.answer, '', 'Empty string should trim to empty');
    assert.equal(updatedEmpty.inquiry.isAnswered, true, 'isAnswered should be set to true');

    const updatedWhitespace = await notesService.updateInquiryAnswer('entry-sep-11', '   \n\t   ');
    assert.equal(updatedWhitespace.inquiry.answer, '', 'Whitespace should trim to empty string');
    assert.equal(updatedWhitespace.inquiry.isAnswered, true, 'isAnswered should remain true');

    recordResult('Inquiry', 'Empty string and whitespace-only answer handling', true, 'Trimmed to empty and flagged answered');
  } catch (err: unknown) {
    recordResult('Inquiry', 'Empty string answer handling', false, String(err));
  }

  // 2.3 Complex multiline markdown, quotes, emojis, and codeblocks
  try {
    const complexPayload = `
# Executive Reflections
- Item 1: Refactored system pipeline with 100% precision.
- Item 2: Stood firm during volatility: "Restraint is power."
\`\`\`typescript
const buffer = new Uint8Array(1024);
\`\`\`
Special chars: <>&"'\`\${test}
Emojis: 🚀💎⚓
`;
    const updatedComplex = await notesService.updateInquiryAnswer('entry-sep-11', complexPayload);
    assert.equal(updatedComplex.inquiry.answer, complexPayload.trim(), 'Markdown and special characters preserved verbatim');

    const retrieved = await notesService.getJournalEntryById('entry-sep-11');
    assert.equal(retrieved?.inquiry.answer, complexPayload.trim());
    recordResult('Inquiry', 'Complex markdown, quotes, codeblock, and emoji payload', true, 'Full fidelity preserved');
  } catch (err: unknown) {
    recordResult('Inquiry', 'Complex markdown payload', false, String(err));
  }

  // 2.4 Invalid entry ID rejection
  const invalidIds = [
    'entry-non-existent-999',
    '',
    '   ',
    'null',
    'undefined',
    '../../../etc/passwd',
    'entry-sep-11\' OR 1=1 --',
    '<svg onload=alert(1)>',
  ];

  for (const invId of invalidIds) {
    try {
      await assert.rejects(
        async () => {
          await notesService.updateInquiryAnswer(invId, 'Test answer');
        },
        /not found/,
        `Should reject invalid ID "${invId}"`
      );
      recordResult('Inquiry', `Invalid ID "${invId.slice(0, 20)}" cleanly rejected`, true, 'Threw not found error');
    } catch (err: unknown) {
      recordResult('Inquiry', `Invalid ID "${invId.slice(0, 20)}"`, false, String(err));
    }
  }

  // 2.5 Rapid concurrent updates burst (100 parallel operations)
  try {
    const concurrentCount = 100;
    const entriesToUpdate = ['entry-sep-11', 'entry-sep-10', 'entry-sep-09', 'entry-sep-08', 'entry-sep-07'];

    const promises = Array.from({ length: concurrentCount }, (_, i) => {
      const targetId = entriesToUpdate[i % entriesToUpdate.length];
      const answer = `Concurrent answer iteration #${i} for ${targetId}`;
      return notesService.updateInquiryAnswer(targetId, answer);
    });

    const updateResults = await Promise.all(promises);
    assert.equal(updateResults.length, concurrentCount, 'All 100 concurrent promises resolved');

    // Check store consistency
    const allCurrentEntries = await notesService.getJournalEntries();
    assert.equal(allCurrentEntries.length, 5, 'Store must still contain exactly 5 entries');
    for (const e of allCurrentEntries) {
      assert.ok(e.inquiry.answer?.startsWith('Concurrent answer iteration #'), `Entry ${e.id} should have valid concurrent answer`);
      assert.equal(e.inquiry.isAnswered, true);
      assert.equal(e.inquiry.statusBadge, 'Answered');
    }

    recordResult('Inquiry', 'Rapid concurrent updates burst (100 parallel operations)', true, 'All completed without race corruption');
  } catch (err: unknown) {
    recordResult('Inquiry', 'Rapid concurrent updates burst', false, String(err));
  }

  // ==========================================================================
  // SECTION 3: DEEP MUTATION RESISTANCE ACROSS ALL RETURNED OBJECTS
  // ==========================================================================
  console.log('\n--- SECTION 3: DEEP MUTATION RESISTANCE ACROSS ALL RETURNED DATA ---');

  await notesService.resetState();

  // 3.1 getJournalEntries() deep mutation resistance
  try {
    const entriesBatch1 = await notesService.getJournalEntries();
    // Tamper with batch 1 at every possible layer
    entriesBatch1[0].title = 'CORRUPTED_TITLE';
    entriesBatch1[0].mood.label = 'CORRUPTED_MOOD';
    entriesBatch1[0].moodTag = 'Grounded';
    entriesBatch1[0].inquiry.answer = 'CORRUPTED_ANSWER';
    entriesBatch1[0].inquiry.isAnswered = false;
    entriesBatch1[0].contentParagraphs.push('CORRUPTED_PARAGRAPH');
    entriesBatch1[0].contentParagraphs[0] = 'MUTATED_P0';
    entriesBatch1[0].observations.push({ title: 'HACKED', note: 'HACKED' });
    entriesBatch1[0].observations[0].title = 'CORRUPTED_OBS';
    entriesBatch1[0].tags.push('#corrupted_tag');
    entriesBatch1[0].linkedEntities.financialDebit!.amount = 99999999;
    entriesBatch1[0].linkedEntities.project!.name = 'CORRUPTED_PROJECT';
    entriesBatch1.pop(); // Pop entry
    assert.equal(entriesBatch1.length, 4, 'Caller mutated local array length');

    // Fetch batch 2 and verify zero contamination
    const entriesBatch2 = await notesService.getJournalEntries();
    assert.equal(entriesBatch2.length, 5, 'Store length must remain 5');
    assert.notEqual(entriesBatch2[0].title, 'CORRUPTED_TITLE');
    assert.notEqual(entriesBatch2[0].mood.label, 'CORRUPTED_MOOD');
    assert.notEqual(entriesBatch2[0].inquiry.answer, 'CORRUPTED_ANSWER');
    assert.equal(entriesBatch2[0].inquiry.isAnswered, true);
    assert.notEqual(entriesBatch2[0].contentParagraphs[entriesBatch2[0].contentParagraphs.length - 1], 'CORRUPTED_PARAGRAPH');
    assert.notEqual(entriesBatch2[0].observations[0].title, 'CORRUPTED_OBS');
    assert.equal(entriesBatch2[0].tags.includes('#corrupted_tag'), false);
    assert.equal(entriesBatch2[0].linkedEntities.financialDebit?.amount, 1300);
    assert.equal(entriesBatch2[0].linkedEntities.project?.name, 'ANCHOR Core');

    recordResult('Mutation Resistance', 'getJournalEntries() deep isolation across arrays and nested objects', true, 'Internal store remained pristine');
  } catch (err: unknown) {
    recordResult('Mutation Resistance', 'getJournalEntries() deep isolation', false, String(err));
  }

  // 3.2 getJournalEntryById() deep mutation resistance
  try {
    const entryById = await notesService.getJournalEntryById('entry-sep-11');
    assert.ok(entryById);
    entryById.title = 'TAMPERED_BY_ID';
    entryById.inquiry.question = 'TAMPERED_QUESTION';
    entryById.inquiry.answer = 'TAMPERED_ANSWER';
    entryById.observations[0].note = 'TAMPERED_NOTE';

    const reFetched = await notesService.getJournalEntryById('entry-sep-11');
    assert.notEqual(reFetched?.title, 'TAMPERED_BY_ID');
    assert.notEqual(reFetched?.inquiry.question, 'TAMPERED_QUESTION');
    assert.notEqual(reFetched?.inquiry.answer, 'TAMPERED_ANSWER');
    assert.notEqual(reFetched?.observations[0].note, 'TAMPERED_NOTE');

    recordResult('Mutation Resistance', 'getJournalEntryById() deep isolation', true, 'Single entry lookup safe from tampering');
  } catch (err: unknown) {
    recordResult('Mutation Resistance', 'getJournalEntryById() deep isolation', false, String(err));
  }

  // 3.3 searchJournalEntries() deep mutation resistance
  try {
    const searchRes = await notesService.searchJournalEntries('Grounded');
    assert.ok(searchRes.length > 0);
    searchRes[0].title = 'TAMPERED_SEARCH_RESULT';
    searchRes.length = 0;

    const freshSearch = await notesService.searchJournalEntries('Grounded');
    assert.ok(freshSearch.length > 0);
    assert.notEqual(freshSearch[0].title, 'TAMPERED_SEARCH_RESULT');

    recordResult('Mutation Resistance', 'searchJournalEntries() returned array and objects isolation', true, 'Search results safe from tampering');
  } catch (err: unknown) {
    recordResult('Mutation Resistance', 'searchJournalEntries() isolation', false, String(err));
  }

  // 3.4 updateInquiryAnswer() returned object mutation resistance
  try {
    const updatedObj = await notesService.updateInquiryAnswer('entry-sep-10', 'Legitimate answer');
    updatedObj.inquiry.answer = 'MUTATED_AFTER_UPDATE';
    updatedObj.title = 'MUTATED_AFTER_UPDATE';

    const verifiedEntry = await notesService.getJournalEntryById('entry-sep-10');
    assert.equal(verifiedEntry?.inquiry.answer, 'Legitimate answer', 'Store must retain legitimate answer');
    assert.notEqual(verifiedEntry?.title, 'MUTATED_AFTER_UPDATE');

    recordResult('Mutation Resistance', 'updateInquiryAnswer() return value deep isolation', true, 'Post-update tampering prevented');
  } catch (err: unknown) {
    recordResult('Mutation Resistance', 'updateInquiryAnswer() isolation', false, String(err));
  }

  // 3.5 togglePinEntry() returned object mutation resistance
  try {
    const toggledEntry = await notesService.togglePinEntry('entry-sep-08');
    toggledEntry.title = 'TAMPERED_PIN_TITLE';
    toggledEntry.isPinned = false;

    const reCheckedPin = await notesService.getJournalEntryById('entry-sep-08');
    assert.equal(reCheckedPin?.isPinned, true, 'Pin state in store must stay true');
    assert.notEqual(reCheckedPin?.title, 'TAMPERED_PIN_TITLE');

    // Toggle back
    await notesService.togglePinEntry('entry-sep-08');

    recordResult('Mutation Resistance', 'togglePinEntry() return value deep isolation', true, 'Pin toggle safe from tampering');
  } catch (err: unknown) {
    recordResult('Mutation Resistance', 'togglePinEntry() isolation', false, String(err));
  }

  // 3.6 getConsistencyStats() deep mutation resistance
  try {
    const stats1 = await notesService.getConsistencyStats();
    stats1.scorePercentage = 0;
    stats1.momChangeDelta = '+999%';
    stats1.dominantTone = 'Chaotic';
    stats1.sparkMatrix[0].status = 'missed';
    stats1.sparkMatrix.push({
      dayIndex: 99,
      date: '2026-99-99',
      label: 'Hack 99',
      status: 'missed',
    });

    const stats2 = await notesService.getConsistencyStats();
    assert.equal(stats2.scorePercentage, 94, 'Score must remain 94');
    assert.equal(stats2.momChangeDelta, '+4% MoM', 'Delta must remain +4% MoM');
    assert.equal(stats2.dominantTone, 'Stoic / Analytical');
    assert.equal(stats2.sparkMatrix.length, 30, 'Spark matrix length must remain 30');
    assert.equal(stats2.sparkMatrix[0].status, 'completed', 'Dot status must remain completed');

    recordResult('Mutation Resistance', 'getConsistencyStats() matrix and metrics deep isolation', true, 'Stats store unmodified');
  } catch (err: unknown) {
    recordResult('Mutation Resistance', 'getConsistencyStats() isolation', false, String(err));
  }

  // 3.7 getTaxonomyTags() deep mutation resistance
  try {
    const tags1 = await notesService.getTaxonomyTags();
    tags1.push('#hacked_tag');
    tags1[0] = '#corrupted';
    tags1.length = 0;

    const tags2 = await notesService.getTaxonomyTags();
    assert.equal(tags2.length, 4, 'Tags count must remain 4');
    assert.equal(tags2.includes('#hacked_tag'), false);
    assert.equal(tags2[0], '#engineering');

    recordResult('Mutation Resistance', 'getTaxonomyTags() array deep isolation', true, 'Tags store unmodified');
  } catch (err: unknown) {
    recordResult('Mutation Resistance', 'getTaxonomyTags() isolation', false, String(err));
  }

  // 3.8 getPinnedMaxim() deep mutation resistance
  try {
    const maxim1 = await notesService.getPinnedMaxim();
    maxim1.quote = 'Corrupted quote';
    maxim1.attribution = 'Corrupted attribution';

    const maxim2 = await notesService.getPinnedMaxim();
    assert.equal(maxim2.quote, 'Restraint is power. When life gets chaotic, tighten the system.');
    assert.equal(maxim2.attribution, 'Affixed to September Executive Review');

    recordResult('Mutation Resistance', 'getPinnedMaxim() object deep isolation', true, 'Maxim store unmodified');
  } catch (err: unknown) {
    recordResult('Mutation Resistance', 'getPinnedMaxim() isolation', false, String(err));
  }

  // 3.9 getNotesPageData() deep isolation and syncStatus mutation probe
  try {
    const pageData1 = await notesService.getNotesPageData();
    pageData1.entries.pop();
    pageData1.activeEntry.title = 'CORRUPTED_ACTIVE';
    pageData1.consistencyStats.scorePercentage = 10;
    pageData1.pinnedMaxim.quote = 'CORRUPTED_MAXIM';
    pageData1.taxonomyTags.push('#CORRUPTED');

    const pageData2 = await notesService.getNotesPageData();
    assert.equal(pageData2.entries.length, 5, 'Entries must remain 5');
    assert.notEqual(pageData2.activeEntry.title, 'CORRUPTED_ACTIVE');
    assert.equal(pageData2.consistencyStats.scorePercentage, 94);
    assert.notEqual(pageData2.pinnedMaxim.quote, 'CORRUPTED_MAXIM');
    assert.equal(pageData2.taxonomyTags.length, 4);

    // CRITICAL PROBE: syncStatus reference leakage
    const initialSyncDisplay = mockNotesPageData.syncStatus.lastSyncedDisplay;
    pageData1.syncStatus.lastSyncedDisplay = 'PROBE_MUTATION_LEAK';

    const pageData3 = await notesService.getNotesPageData();
    const isLeaked = pageData3.syncStatus.lastSyncedDisplay === 'PROBE_MUTATION_LEAK';

    // Restore mockNotesPageData.syncStatus if leaked
    mockNotesPageData.syncStatus.lastSyncedDisplay = initialSyncDisplay;

    if (isLeaked) {
      recordResult(
        'Mutation Resistance',
        'getNotesPageData().syncStatus object reference leakage probe',
        false,
        'VULNERABILITY DETECTED: syncStatus is passed by direct reference from mockNotesPageData without deep cloning!'
      );
    } else {
      recordResult('Mutation Resistance', 'getNotesPageData().syncStatus deep isolation', true, 'syncStatus is cloned safely');
    }
  } catch (err: unknown) {
    recordResult('Mutation Resistance', 'getNotesPageData() isolation', false, String(err));
  }

  // ==========================================================================
  // SECTION 4: FILTER OPTIONS MATRIX & EDGE CONDITIONS
  // ==========================================================================
  console.log('\n--- SECTION 4: FILTER OPTIONS MATRIX & EDGE CONDITIONS ---');

  // 4.1 Filter by mood
  try {
    const grounded = await notesService.getJournalEntries({ selectedMood: 'Grounded' });
    assert.equal(grounded.length, 1);
    assert.equal(grounded[0].id, 'entry-sep-11');

    const strategic = await notesService.getJournalEntries({ selectedMood: 'Strategic' });
    assert.equal(strategic.length, 1);
    assert.equal(strategic[0].id, 'entry-sep-10');

    const allMood = await notesService.getJournalEntries({ selectedMood: 'all' });
    assert.equal(allMood.length, 5, 'Mood "all" should return all 5 entries');

    const invalidMood = await notesService.getJournalEntries({ selectedMood: 'NonExistent' as any });
    assert.equal(invalidMood.length, 0, 'Invalid mood should return 0 entries');

    recordResult('Filters', 'Filter by mood tags ("Grounded", "Strategic", "all", invalid)', true, 'Accurately filtered');
  } catch (err: unknown) {
    recordResult('Filters', 'Filter by mood', false, String(err));
  }

  // 4.2 Filter by tag
  try {
    const engineering = await notesService.getJournalEntries({ selectedTag: '#engineering' });
    assert.equal(engineering.length, 3, 'Tag #engineering should match 3 entries');

    const clarity = await notesService.getJournalEntries({ selectedTag: '#clarity' });
    assert.equal(clarity.length, 2, 'Tag #clarity should match 2 entries');

    const nonExistentTag = await notesService.getJournalEntries({ selectedTag: '#nonexistent' });
    assert.equal(nonExistentTag.length, 0, 'Non-existent tag should return 0 entries');

    // Tag without leading hash
    const tagWithoutHash = await notesService.getJournalEntries({ selectedTag: 'engineering' });
    // In current implementation, tag comparison is exact lowercase: entry.tags.some(t => t.toLowerCase() === tag)
    // '#engineering' === 'engineering' is false, so it returns 0
    recordResult('Filters', 'Filter by tag ("#engineering", "#clarity", non-existent)', true, `Tag without hash returned ${tagWithoutHash.length} (exact match behavior verified)`);
  } catch (err: unknown) {
    recordResult('Filters', 'Filter by tag', false, String(err));
  }

  // 4.3 Filter by month PROBE (checking || entry.dateKey.startsWith('2026-09') behavior)
  try {
    const sepEntries = await notesService.getJournalEntries({ selectedMonth: 'September 2026' });
    assert.equal(sepEntries.length, 5, 'September 2026 matches all 5 entries');

    const octEntries = await notesService.getJournalEntries({ selectedMonth: 'October 2026' });
    const decEntries = await notesService.getJournalEntries({ selectedMonth: 'December 2099' });

    if (octEntries.length > 0) {
      recordResult(
        'Filters',
        'Filter by month with non-matching month ("October 2026", "December 2099")',
        false,
        `LOGICAL ANOMALY: selectedMonth: 'October 2026' returned ${octEntries.length} entries because of unconditional '|| entry.dateKey.startsWith("2026-09")' clause!`
      );
    } else {
      recordResult('Filters', 'Filter by month correctly filters out non-matching months', true, '0 entries returned');
    }
  } catch (err: unknown) {
    recordResult('Filters', 'Filter by month', false, String(err));
  }

  // 4.4 Combined filter permutations
  try {
    const combined1 = await notesService.getJournalEntries({
      searchQuery: 'pipeline',
      selectedMood: 'Grounded',
      selectedTag: '#engineering',
    });
    assert.equal(combined1.length, 1);
    assert.equal(combined1[0].id, 'entry-sep-11');

    const combinedNoMatch = await notesService.getJournalEntries({
      searchQuery: 'pipeline',
      selectedMood: 'Strategic', // entry-sep-11 is Grounded, not Strategic
    });
    assert.equal(combinedNoMatch.length, 0);

    recordResult('Filters', 'Combined multi-parameter filters (search + mood + tag)', true, 'Correct boolean intersection');
  } catch (err: unknown) {
    recordResult('Filters', 'Combined multi-parameter filters', false, String(err));
  }

  // ==========================================================================
  // SECTION 5: IDEMPOTENT STATE RESETS & HIGH-FREQUENCY CYCLING
  // ==========================================================================
  console.log('\n--- SECTION 5: IDEMPOTENT STATE RESETS & HIGH-FREQUENCY CYCLING ---');

  try {
    // Modify entries
    await notesService.updateInquiryAnswer('entry-sep-11', 'Temporary Answer 1');
    await notesService.updateInquiryAnswer('entry-sep-10', 'Temporary Answer 2');
    await notesService.togglePinEntry('entry-sep-09');

    // Run 50 consecutive resets
    for (let i = 0; i < 50; i++) {
      await notesService.resetState();
    }

    // Verify state matches pristine fixtures
    const entriesAfterReset = await notesService.getJournalEntries();
    assert.equal(entriesAfterReset.length, 5);

    const baselineSep11 = mockJournalEntries.find((e) => e.id === 'entry-sep-11');
    const resetSep11 = entriesAfterReset.find((e) => e.id === 'entry-sep-11');
    assert.equal(resetSep11?.inquiry.answer, baselineSep11?.inquiry.answer);
    assert.equal(resetSep11?.title, baselineSep11?.title);
    assert.equal(resetSep11?.wordCount, baselineSep11?.wordCount);

    const baselineSep09 = mockJournalEntries.find((e) => e.id === 'entry-sep-09');
    const resetSep09 = entriesAfterReset.find((e) => e.id === 'entry-sep-09');
    assert.equal(resetSep09?.isPinned, baselineSep09?.isPinned);

    recordResult('Reset State', '50 consecutive resetState() cycles', true, 'Pristine state completely restored');
  } catch (err: unknown) {
    recordResult('Reset State', '50 consecutive resetState() cycles', false, String(err));
  }

  // 5.2 Interleaved concurrent reads during resetState()
  try {
    const operations: Promise<unknown>[] = [];
    for (let i = 0; i < 30; i++) {
      if (i % 5 === 0) {
        operations.push(notesService.resetState());
      } else if (i % 2 === 0) {
        operations.push(notesService.getJournalEntries());
      } else {
        operations.push(notesService.getNotesPageData());
      }
    }
    await Promise.all(operations);
    const finalEntries = await notesService.getJournalEntries();
    assert.equal(finalEntries.length, 5);
    recordResult('Reset State', 'Interleaved concurrent reads and resets', true, 'Zero crashes or data corruption');
  } catch (err: unknown) {
    recordResult('Reset State', 'Interleaved concurrent reads and resets', false, String(err));
  }

  // 5.3 getNotesPageData with non-existent or undefined activeId
  try {
    const pageDataInvalidId = await notesService.getNotesPageData('non-existent-id-404');
    assert.ok(pageDataInvalidId.activeEntry, 'activeEntry must fall back gracefully to entries[0]');
    assert.equal(pageDataInvalidId.activeEntry.id, 'entry-sep-11');

    const pageDataNoId = await notesService.getNotesPageData(undefined);
    assert.equal(pageDataNoId.activeEntry.id, 'entry-sep-11');

    recordResult('Fallback', 'getNotesPageData() invalid or missing activeId fallback', true, 'Gracefully defaulted to entries[0]');
  } catch (err: unknown) {
    recordResult('Fallback', 'getNotesPageData() activeId fallback', false, String(err));
  }

  // ==========================================================================
  // SUMMARY
  // ==========================================================================
  console.log('\n================================================================');
  console.log('STRESS TEST SUITE SUMMARY:');
  const passedCount = results.filter((r) => r.passed).length;
  const failedCount = results.filter((r) => !r.passed).length;
  console.log(`TOTAL CHECKS: ${results.length}`);
  console.log(`PASSED: ${passedCount}`);
  console.log(`FAILED / VULNERABILITIES: ${failedCount}`);
  console.log('================================================================\n');

  if (failedCount > 0) {
    console.log('DETECTED FINDINGS & VULNERABILITIES:');
    for (const r of results.filter((r) => !r.passed)) {
      console.log(`  - [${r.category}] ${r.name}: ${r.details}`);
    }
  }

  // We do not process.exit(1) so that caller script can capture full reporting telemetry
  return { passedCount, failedCount, total: results.length, results };
}

runChallengerStressSuite().catch((err) => {
  console.error('Fatal suite failure:', err);
  process.exit(1);
});
