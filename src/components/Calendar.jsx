import { useRef } from 'react';
import { MONTHS, WEEKDAYS, calendarCells, dateKey, isBusy, isPast, readableDate, shiftMonth } from '../lib/calendar.mjs';
import { Arrow } from './Icons.jsx';
export default function Calendar({ view, selected, onViewChange, onSelect, error }) {
  const gridRef = useRef(null);
  const { year, month } = view;
  const cells = calendarCells(year, month);
  function moveView(step) { onViewChange(shiftMonth(view, step)); }
  function navigate(event, index) {
    const moves = { ArrowRight: 1, ArrowLeft: -1, ArrowUp: -7, ArrowDown: 7 };
    let target;
    if (event.key in moves) target = index + moves[event.key];
    if (event.key === 'Home') target = Math.floor(index / 7) * 7;
    if (event.key === 'End') target = Math.floor(index / 7) * 7 + 6;
    if (target === undefined) return;
    event.preventDefault();
    const direction = target >= index ? 1 : -1;
    while (target >= 0 && target < cells.length) {
      const button = gridRef.current.querySelector('[data-cell="' + target + '"]');
      if (button && !button.disabled) { button.focus(); return; }
      target += direction;
    }
  }
  return <div className="calendar" aria-label="Выбор даты" aria-describedby="calendar-note">
    <div className="calendar-heading">
      <button className="icon-button" type="button" aria-label="Предыдущий месяц календаря" onClick={() => moveView(-1)}><Arrow direction="left" /></button>
      <h3 id="calendar-title" tabIndex="-1" aria-live="polite">{MONTHS[month]} {year}</h3>
      <button className="icon-button" type="button" aria-label="Следующий месяц календаря" onClick={() => moveView(1)}><Arrow /></button>
    </div>
    <table className="calendar-table" aria-labelledby="calendar-title" ref={gridRef}>
      <thead><tr>{WEEKDAYS.map(day => <th scope="col" key={day}>{day}</th>)}</tr></thead>
      <tbody>{Array.from({ length: cells.length / 7 }, (_, row) => <tr key={row}>
        {cells.slice(row * 7, row * 7 + 7).map((day, col) => {
          if (!day) return <td key={col} />;
          const key = dateKey(year, month, day), busy = isBusy(year, month, day), past = isPast(year, month, day);
          return <td key={col}><button type="button" data-date={key} data-cell={row * 7 + col} disabled={busy || past} className={'calendar-day' + (busy ? ' is-busy' : '') + (selected === key ? ' is-selected' : '') + (past ? ' is-past' : '')} aria-label={readableDate(key) + (busy ? ', занято в деморасписании' : past ? ', дата прошла' : ', выбрать дату')} aria-pressed={selected === key} onClick={() => onSelect(key)} onKeyDown={event => navigate(event, row * 7 + col)}>{day}</button></td>;
        })}
      </tr>)}</tbody>
    </table>
    <p className={'calendar-selection' + (error ? ' has-error' : '')} id="date-error" aria-live="polite">{error || (selected ? readableDate(selected) : 'Выберите свободную дату')}</p>
    <p className="calendar-note" id="calendar-note"><span className="red-dot" />Красные — занятые даты. Расписание демонстрационное.</p>
  </div>;
}
