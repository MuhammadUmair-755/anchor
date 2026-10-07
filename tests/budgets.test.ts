import assert from 'node:assert/strict';
import { toEnvelope } from '../src/lib/budgets';

const env = (allocated: number, spent: number) =>
  toEnvelope({ id: 'x', category: 'food_dining', label: 'Food', allocated, spent, cycle: '2026-10' });

assert.deepEqual([env(1000, 400).burnPercentage, env(1000, 400).burnRateStatus], [40, 'normal']);
assert.equal(env(1000, 600).burnRateStatus, 'contained');
assert.equal(env(1000, 900).burnRateStatus, 'alert');
assert.equal(env(1000, 1200).burnRateStatus, 'exceeded');
assert.equal(env(1000, 1200).bufferRemaining, 0); // never negative
assert.equal(env(0, 50).burnPercentage, 0); // no NaN/Infinity on a zero budget
assert.equal(env(1000, 0).icon, 'SavingsOutlined');

console.log('budgets tests passed');
