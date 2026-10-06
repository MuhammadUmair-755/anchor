import assert from 'node:assert/strict';
import { toNote, bodyStats, parseNoteInput } from '../src/services/notesService';
import { Database } from '../src/types/database.types';

type Row = Database['public']['Tables']['journal_entries']['Row'];

// parseNoteInput: create requires a title and a string body
assert.deepEqual(parseNoteInput({ title: '  Hi  ', body: 'x' }, false), { title: 'Hi', body: 'x' });
assert.ok('error' in parseNoteInput({ title: '   ', body: '' }, false));
assert.ok('error' in parseNoteInput({ title: 'a'.repeat(201), body: '' }, false));
assert.ok('error' in parseNoteInput({ title: 'ok' }, false));
assert.ok('error' in parseNoteInput(null, false));
// patch: any subset, but not nothing
assert.deepEqual(parseNoteInput({ body: 'new' }, true), { body: 'new' });
assert.ok('error' in parseNoteInput({}, true));
assert.ok('error' in parseNoteInput({ title: '' }, true));

// bodyStats
assert.deepEqual(bodyStats(''), { word_count: 0, reading_time_minutes: 1, snippet: '' });
const stats = bodyStats('one two\n\nthree ' + 'w '.repeat(300));
assert.equal(stats.word_count, 303);
assert.equal(stats.reading_time_minutes, 2);
assert.ok(stats.snippet.startsWith('one two three') && stats.snippet.length === 140);

// toNote: body wins, falls back to legacy content_paragraphs
const row = {
  id: 'n1', title: 'T', body: '', content_paragraphs: ['a', 'b'], is_pinned: false,
  created_at: 'c', updated_at: 'u',
} as unknown as Row;
assert.equal(toNote(row).body, 'a\n\nb');
assert.equal(toNote({ ...row, body: 'real' }).body, 'real');
assert.deepEqual(Object.keys(toNote(row)).sort(), ['body', 'createdAt', 'id', 'isPinned', 'title', 'updatedAt']);

console.log('notes_service: all assertions passed');
