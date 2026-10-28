import { useEffect, useId, useRef } from 'react';
export default function Dialog({ title, onClose, children }) {
  const ref = useRef(null), id = useId();
  useEffect(() => {
    const dialog = ref.current;
    dialog.showModal();
    return () => { if (dialog.open) dialog.close(); };
  }, []);
  return <dialog className="dialog" ref={ref} aria-labelledby={id} onCancel={event => { event.preventDefault(); onClose(); }} onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
    <div className="dialog-inner"><div className="dialog-header"><h2 id={id}>{title}</h2><button className="close-button" type="button" onClick={onClose} aria-label="Закрыть диалог">×</button></div>{children}</div>
  </dialog>;
}
