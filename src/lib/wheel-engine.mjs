/*
 * Motion and interactions ported from the supplied month-wheel.html:
 * requestAnimationFrame easing, 30° snapping, inertia, pointer capture,
 * mouse wheel, keyboard and reduced-motion support. No iframe or libraries.
 */
const mod = (n, m) => ((n % m) + m) % m;
const clamp = (n, a, b) => Math.min(b, Math.max(a, n));
export function createWheelEngine({ svg, rotor, initialMonth, onVisualChange, onChange, onPlayChange }) {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let angle = -initialMonth * 30, target = angle, index = initialMonth;
  let auto = false, drag = null, previousTime = 0, raf = 0, snapTimer = 0, ignoreClick = false, clickTimer = 0;
  let committed = initialMonth, destroyed = false;
  const cleanups = [];
  function listen(element, name, fn, options) {
    element.addEventListener(name, fn, options);
    cleanups.push(() => element.removeEventListener(name, fn, options));
  }
  function commit(i) {
    if (i !== committed) { committed = i; onChange(i); }
  }
  function setIndex(i) {
    if (i !== index) { index = i; onVisualChange(i); }
  }
  function schedule() { if (!raf && !destroyed) raf = requestAnimationFrame(frame); }
  function frame(time) {
    raf = 0;
    const dt = previousTime ? Math.min((time - previousTime) / 1000, .04) : 1 / 60;
    previousTime = time;
    if (auto && !document.hidden) target -= 18 * dt;
    if (drag || reduced.matches) angle = target;
    else angle += (target - angle) * (1 - Math.exp(-11 * dt));
    if (Math.abs(target - angle) < .001) angle = target;
    if (!drag && Math.abs(angle) > 36000) {
      const turns = Math.trunc(angle / 360) * 360; angle -= turns; target -= turns;
    }
    rotor.setAttribute('transform', 'rotate(' + angle + ' 500 500)');
    setIndex(mod(Math.round(-angle / 30), 12));
    if ((auto && !document.hidden) || drag || Math.abs(target - angle) > .001) schedule();
    else previousTime = 0;
  }
  function setAuto(value) { auto = value; onPlayChange(auto); }
  function snap(notify = true) {
    target = Math.round(target / 30) * 30;
    if (notify) commit(mod(Math.round(-target / 30), 12));
    schedule();
  }
  function play(value) {
    setAuto(value);
    if (!auto) snap();
    schedule();
  }
  function select(i, notify = true) {
    if (!Number.isFinite(i)) return;
    i = mod(Math.round(i), 12);
    setAuto(false);
    target += mod(-i * 30 - target + 180, 360) - 180;
    if (notify) commit(i); else committed = i;
    schedule();
  }
  function step(n) {
    setAuto(false);
    target = Math.round(target / 30) * 30 - n * 30;
    commit(mod(Math.round(-target / 30), 12));
    schedule();
  }
  function angleAt(event) {
    const r = svg.getBoundingClientRect();
    return Math.atan2(event.clientY - r.top - r.height / 2, event.clientX - r.left - r.width / 2) * 180 / Math.PI;
  }
  listen(svg, 'pointerdown', event => {
    if (event.button !== 0 || event.target.closest('[data-control]')) return;
    clearTimeout(snapTimer);
    setAuto(false);
    target = angle;
    drag = { id: event.pointerId, x: event.clientX, y: event.clientY, last: angleAt(event), time: event.timeStamp, velocity: 0, moved: false, month: event.target.closest('[data-month]')?.getAttribute('data-month') ?? null };
    svg.setPointerCapture(event.pointerId);
    svg.classList.add('is-dragging');
    schedule();
  });
  listen(svg, 'pointermove', event => {
    if (!drag || event.pointerId !== drag.id) return;
    const a = angleAt(event), delta = mod(a - drag.last + 180, 360) - 180;
    if (Math.hypot(event.clientX - drag.x, event.clientY - drag.y) > 4) drag.moved = true;
    if (drag.moved) { target += delta; drag.velocity = delta / Math.max(8, event.timeStamp - drag.time); angle = target; }
    drag.last = a; drag.time = event.timeStamp; schedule();
  });
  function endDrag(event, cancel = false) {
    if (!drag || drag.id !== event.pointerId) return;
    const moved = drag.moved, month = drag.month, velocity = event.timeStamp - drag.time > 90 ? 0 : drag.velocity;
    if (moved && !cancel) target += clamp(velocity * 135, -90, 90);
    drag = null;
    svg.classList.remove('is-dragging');
    if (svg.hasPointerCapture(event.pointerId)) svg.releasePointerCapture(event.pointerId);
    ignoreClick = !cancel && (moved || month !== null);
    if (!moved && !cancel && month !== null) select(Number(month)); else snap();
    clearTimeout(clickTimer);
    clickTimer = window.setTimeout(() => { ignoreClick = false; }, 0);
  }
  listen(svg, 'pointerup', event => endDrag(event));
  listen(svg, 'pointercancel', event => endDrag(event, true));
  listen(svg, 'lostpointercapture', event => { if (drag) endDrag(event, true); });
  listen(svg, 'click', event => {
    if (ignoreClick) { ignoreClick = false; return; }
    const month = event.target.closest('[data-month]');
    if (month) select(Number(month.dataset.month));
  });
  listen(svg, 'wheel', event => {
    if (event.ctrlKey) return;
    event.preventDefault(); setAuto(false);
    let delta = Math.abs(event.deltaY) >= Math.abs(event.deltaX) ? event.deltaY : event.deltaX;
    if (event.deltaMode === 1) delta *= 16;
    if (event.deltaMode === 2) delta *= svg.clientHeight;
    target -= clamp(delta * .13, -60, 60);
    clearTimeout(snapTimer); snapTimer = window.setTimeout(snap, 160); schedule();
  }, { passive: false });
  listen(svg, 'keydown', event => {
    if (event.target.closest('[data-control]')) return;
    const month = event.target.closest('[data-month]');
    if (month && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault(); select(Number(month.dataset.month)); return;
    }
    const handlers = { ArrowRight: () => step(1), ArrowUp: () => step(1), ArrowLeft: () => step(-1), ArrowDown: () => step(-1), Home: () => select(0), End: () => select(11), ' ': () => play(!auto) };
    if (handlers[event.key]) { event.preventDefault(); handlers[event.key](); }
  });
  listen(document, 'visibilitychange', () => { previousTime = 0; if (!document.hidden) schedule(); });
  listen(reduced, 'change', () => { if (reduced.matches) play(false); });
  rotor.setAttribute('transform', 'rotate(' + angle + ' 500 500)');
  return {
    select, step, play,
    getState: () => ({ month: committed, index, angle, auto }),
    destroy() { destroyed = true; cancelAnimationFrame(raf); clearTimeout(snapTimer); clearTimeout(clickTimer); cleanups.forEach(fn => fn()); },
  };
}
