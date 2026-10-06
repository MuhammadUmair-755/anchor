import assert from 'node:assert/strict';
import { filterTasks, formatDue } from '../src/services/tasksService';
import { parseTaskInput, tabCategoryFor, isUuid } from '../src/app/api/tasks/shared';
import { TaskItem } from '../src/types/models';

const today = '2026-10-06';
const t = (id: string, dueDate?: string, isCompleted = false): TaskItem => ({
  id, title: `Task ${id}`, isCompleted, priority: 'medium', category: 'work', categoryLabel: 'WORK',
  tabCategory: 'today', createdAt: '', dueDate,
});
const tasks = [t('a', today), t('b', '2026-10-09'), t('c'), t('d', '2026-10-01'), t('e', today, true)];
const ids = (xs: TaskItem[]) => xs.map((x) => x.id).join('');

// filterTasks
assert.equal(ids(filterTasks(tasks, 'open', '', today)), 'abcd');
assert.equal(ids(filterTasks(tasks, 'today', '', today)), 'a');
assert.equal(ids(filterTasks(tasks, 'upcoming', '', today)), 'b');
assert.equal(ids(filterTasks(tasks, 'completed', '', today)), 'e');
assert.equal(ids(filterTasks(tasks, 'open', 'TASK C', today)), 'c');

// formatDue
assert.equal(formatDue(undefined, undefined, today), null);
assert.equal(formatDue(today, undefined, today), 'Today');
assert.equal(formatDue('2026-10-07', '18:30', today), 'Tomorrow, 6:30 PM');
assert.equal(formatDue('2026-10-05', undefined, today), 'Yesterday');
assert.equal(formatDue('2026-10-12', undefined, today), 'Mon, Oct 12');

// tabCategoryFor
assert.equal(tabCategoryFor(true, today, today), 'completed');
assert.equal(tabCategoryFor(false, null, today), 'backlog');
assert.equal(tabCategoryFor(false, '2026-10-01', today), 'overdue');
assert.equal(tabCategoryFor(false, today, today), 'today');
assert.equal(tabCategoryFor(false, '2026-11-01', today), 'upcoming');

// parseTaskInput
const err = (body: unknown, partial = false) => 'error' in parseTaskInput(body, partial);
assert.ok(err({}));
assert.ok(err({ title: '   ' }));
assert.ok(err({ title: 'x', category: 'Engineering' }));
assert.ok(err({ title: 'x', priority: 'urgent' }));
assert.ok(err({ title: 'x', dueDate: 'Today' }));
assert.ok(err({ title: 'x', dueDate: '2026-02-30' }));
assert.ok(err({ title: 'x', dueTime: '6:00 PM' }));
assert.ok(err({ isCompleted: 'yes' }, true));
assert.deepEqual(parseTaskInput({ title: ' Ship ', category: 'finance', dueDate: '2026-10-06', dueTime: '09:15' }, false), {
  updates: { title: 'Ship', category: 'finance', due_date: '2026-10-06', due_time: '09:15', due_info: null },
});
assert.deepEqual(parseTaskInput({ isCompleted: true }, true), { updates: { is_completed: true } });
assert.deepEqual(parseTaskInput({ dueDate: null }, true), { updates: { due_date: null, due_info: null } });

assert.ok(isUuid('3f2b1c4e-1a2b-4c3d-8e9f-0a1b2c3d4e5f'));
assert.ok(!isUuid('proj-anchor'));

console.log('tasks_service.test.ts: all assertions passed');
