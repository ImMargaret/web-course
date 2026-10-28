export const MONTHS = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
export const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
export const INITIAL_VIEW = { year: 2027, month: 8 };
// Visual examples from the supplied PDF, not actual availability.
const DEMO_BUSY = { '2027-09': [14, 15, 16, 18, 20, 21, 25, 26, 27, 28, 29, 30] };
export function dateKey(year, month, day) {
  return String(year) + '-' + String(month + 1).padStart(2, '0') + '-' + String(day).padStart(2, '0');
}
export function monthKey(year, month) { return dateKey(year, month, 1).slice(0, 7); }
export function calendarCells(year, month) {
  const offset = (new Date(year, month, 1, 12).getDay() + 6) % 7;
  const count = new Date(year, month + 1, 0, 12).getDate();
  return Array.from({ length: Math.ceil((offset + count) / 7) * 7 }, (_, i) => {
    const day = i - offset + 1;
    return day > 0 && day <= count ? day : null;
  });
}
export function shiftMonth({ year, month }, step) {
  const next = new Date(year, month + step, 1, 12);
  return { year: next.getFullYear(), month: next.getMonth() };
}
export function isBusy(year, month, day) { return Boolean(DEMO_BUSY[monthKey(year, month)]?.includes(day)); }
export function isPast(year, month, day, today = new Date()) {
  return dateKey(year, month, day) < dateKey(today.getFullYear(), today.getMonth(), today.getDate());
}
export function readableDate(key) {
  if (!key) return '';
  return new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(key + 'T12:00:00'));
}
export function validateBooking({ name, phone, date }, today = new Date()) {
  const errors = {};
  if (name.trim().length < 2 || name.trim().length > 80) errors.name = 'Укажите имя: от 2 до 80 символов.';
  const digits = phone.replace(/\D/g, '');
  if (!/^[+\d\s()\-]+$/.test(phone) || digits.length < 10 || digits.length > 15) errors.phone = 'Укажите телефон: от 10 до 15 цифр, можно с кодом страны.';
  const parts = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date || '');
  if (!parts) errors.date = 'Выберите свободную дату в календаре.';
  else {
    const [, y, m, d] = parts.map(Number);
    const parsed = new Date(y, m - 1, d, 12);
    if (parsed.getFullYear() !== y || parsed.getMonth() !== m - 1 || parsed.getDate() !== d || isPast(y, m - 1, d, today)) errors.date = 'Выберите дату, которая ещё не прошла.';
    else if (isBusy(y, m - 1, d)) errors.date = 'Эта дата занята в деморасписании. Выберите другую.';
  }
  return errors;
}
