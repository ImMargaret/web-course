import { useEffect, useRef, useState } from 'react';
import { MONTHS } from '../lib/calendar.mjs';
import { createWheelEngine } from '../lib/wheel-engine.mjs';
const LABELS = MONTHS.map((name, i) => name + ({ 2: ' ㄑ', 4: ' ☆', 6: ' ⺌' }[i] || ''));
const ACCENTS = new Set([2, 4, 8, 11]);
export default function MonthWheel({ month, onChange }) {
  const svgRef = useRef(null), rotorRef = useRef(null), engine = useRef(null), onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const [visualMonth, setVisualMonth] = useState(month), [playing, setPlaying] = useState(false);
  useEffect(() => {
    engine.current = createWheelEngine({ svg: svgRef.current, rotor: rotorRef.current, initialMonth: month, onVisualChange: setVisualMonth, onChange: value => onChangeRef.current(value), onPlayChange: setPlaying });
    return () => { engine.current.destroy(); engine.current = null; };
  }, []);
  useEffect(() => {
    if (engine.current && engine.current.getState().month !== month) engine.current.select(month, false);
  }, [month]);
  return <div className="wheel-component">
    <div className="wheel-stage">
      <button className="round-button wheel-prev" type="button" aria-label="Предыдущий месяц на колесе" onClick={() => engine.current.step(-1)}>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m14 6-6 6 6 6" /></svg>
      </button>
      <svg ref={svgRef} className="month-wheel" viewBox="0 0 1000 1000" xmlns="http://www.w3.org/2000/svg" tabIndex="0" role="group" aria-label="Круг месяцев. Потяните круг, прокрутите колесо мыши или используйте стрелки клавиатуры.">
        <g ref={rotorRef}>
          {Array.from({ length: 60 }, (_, i) => {
            if (i % 5 === 0) return null;
            const a = (180 + i * 6) * Math.PI / 180, len = i % 5 === 2 || i % 5 === 3 ? 24 : 17;
            return <line key={'tick' + i} className={'wheel-tick' + (i % 15 === 14 ? ' accent' : '')} x1={500 + (440 - len) * Math.cos(a)} y1={500 + (440 - len) * Math.sin(a)} x2={500 + 440 * Math.cos(a)} y2={500 + 440 * Math.sin(a)} />;
          })}
          {LABELS.map((label, i) => <g key={i} className={'wheel-month' + (ACCENTS.has(i) ? ' accent' : '') + (i === visualMonth ? ' is-selected' : '')} transform={'rotate(' + i * 30 + ' 500 500)'} data-month={i} role="button" tabIndex="0" aria-label={'Выбрать месяц: ' + MONTHS[i]} aria-pressed={i === visualMonth}>
            <rect x="88" y="461" width="224" height="78" fill="transparent" />
            <text className="wheel-label" x="200" y="500" textAnchor="middle" dominantBaseline="central">{label}</text>
            <text className="wheel-number" x="82" y="500" textAnchor="middle" dominantBaseline="central">{String(i + 1).padStart(2, '0')}</text>
          </g>)}
        </g>
        <g data-control="play" className="wheel-play" role="button" tabIndex="0" aria-label={playing ? 'Остановить вращение' : 'Включить вращение'} aria-pressed={playing} onClick={() => engine.current.play(!playing)} onKeyDown={event => { if (event.key === ' ' || event.key === 'Enter') { event.preventDefault(); engine.current.play(!playing); } }}>
          <circle cx="500" cy="500" r="29" />
          <path d={playing ? 'M493 490v20m14-20v20' : 'm494 489 17 11-17 11Z'} />
        </g>
      </svg>
      <button className="round-button wheel-next" type="button" aria-label="Следующий месяц на колесе" onClick={() => engine.current.step(1)}>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m10 6 6 6-6 6" /></svg>
      </button>
    </div>
    <div className="wheel-meta" aria-live="polite" aria-atomic="true"><span>{String(visualMonth + 1).padStart(2, '0')} / 12</span><span>МЕСЯЦ ГОДА</span><span className="sr-only">{MONTHS[visualMonth]}</span></div>
    <p className="wheel-help">Потяните круг · прокрутите колесо · выберите месяц</p>
  </div>;
}
