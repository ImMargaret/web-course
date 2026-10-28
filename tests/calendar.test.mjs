import test from 'node:test';
import assert from 'node:assert/strict';
import { calendarCells, dateKey, shiftMonth, validateBooking, isBusy } from '../src/lib/calendar.mjs';
test('September 2027 starts on Wednesday and has 30 actual days', () => {
  const cells = calendarCells(2027, 8);
  assert.deepEqual(cells.slice(0, 7), [null, null, 1, 2, 3, 4, 5]);
  assert.equal(cells.filter(Boolean).length, 30);
  assert.equal(cells.length, 35);
});
test('Leap February and six-week months preserve every real date', () => {
  assert.equal(calendarCells(2028, 1).filter(Boolean).length, 29);
  assert.equal(calendarCells(2027, 7).length, 42);
});
test('Month navigation handles year boundaries', () => {
  assert.deepEqual(shiftMonth({ year: 2027, month: 11 }, 1), { year: 2028, month: 0 });
  assert.deepEqual(shiftMonth({ year: 2027, month: 0 }, -1), { year: 2026, month: 11 });
});
test('Submission rejects past, nonexistent and example busy dates', () => {
  const data = { name: 'Маргарита', phone: '+7 (999) 123-45-67' };
  const today = new Date(2026, 9, 28, 12);
  for (const date of ['2026-01-01', '2027-02-30', '2027-09-14', '']) assert.ok(validateBooking({ ...data, date }, today).date);
  assert.deepEqual(validateBooking({ ...data, date: dateKey(2027, 8, 17) }, today), {});
  assert.equal(isBusy(2027, 8, 14), true);
  assert.equal(isBusy(2027, 9, 14), false);
});
test('Incomplete contact details cannot reach confirmation', () => {
  const errors = validateBooking({ name: 'А', phone: 'abc123', date: '2027-09-17' }, new Date(2026, 9, 28));
  assert.ok(errors.name);
  assert.ok(errors.phone);
});
