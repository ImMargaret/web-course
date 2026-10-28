export function Arrow({ direction = 'right', ...props }) {
  return <svg viewBox="0 0 24 24" width="24" height="24" fill="none" aria-hidden="true" {...props}>
    {direction === 'diagonal' ? <path d="M5 19 19 5M5 5h14v14" /> :
      direction === 'up' ? <path d="M12 21V3M6 9l6-6 6 6" /> :
      direction === 'left' ? <path d="M21 12H3M9 6l-6 6 6 6" /> :
      direction === 'down-diagonal' ? <path d="m5 5 14 14M5 19h14V5" /> :
      <path d="M3 12h18m-6-6 6 6-6 6" />}
  </svg>;
}
export function SectionEdge({ bottom = false }) {
  return <svg className={'section-edge' + (bottom ? ' section-edge--bottom' : '')} viewBox="0 0 1440 78" preserveAspectRatio="none" aria-hidden="true"><path d="M0 1h1400l40 76" /></svg>;
}
