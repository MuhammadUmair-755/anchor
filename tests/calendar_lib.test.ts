import assert from 'node:assert/strict';
import { monthGrid, shiftMonth, toDateKey, isMonthKey } from '../src/lib/calendar';

// Grid is Monday-first, full weeks, and covers every day of the month exactly once.
const oct = monthGrid('2026-10'); // 1 Oct 2026 is a Thursday
assert.equal(oct[0].dateKey, '2026-09-28', 'starts on the Monday before the 1st');
assert.equal(oct.length % 7, 0, 'full weeks');
assert.equal(oct.filter((d) => d.inMonth).length, 31);
assert.equal(oct.find((d) => d.inMonth)?.dateKey, '2026-10-01');
assert.equal(new Set(oct.map((d) => d.dateKey)).size, oct.length, 'no duplicate days (DST-safe)');

// Month starting on Monday has no leading days; February in a non-leap year.
assert.equal(monthGrid('2027-02')[0].dateKey, '2027-02-01');
assert.equal(monthGrid('2027-02').filter((d) => d.inMonth).length, 28);

// Month arithmetic across year boundaries.
assert.equal(shiftMonth('2026-12', 1), '2027-01');
assert.equal(shiftMonth('2026-01', -1), '2025-12');

// Local date keys never go through UTC (the old off-by-one bug).
assert.equal(toDateKey(new Date(2026, 9, 6, 0, 30)), '2026-10-06');
assert.equal(toDateKey(new Date(2026, 9, 6, 23, 59)), '2026-10-06');

assert.ok(isMonthKey('2026-10') && !isMonthKey('2026-13') && !isMonthKey('oct'));

console.log('calendar lib tests passed');
