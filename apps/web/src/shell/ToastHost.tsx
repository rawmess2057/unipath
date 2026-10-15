import { useEffect } from 'react';
import { useUi, type ToastItem } from '../stores/ui';

function ToastView({ t }: { t: ToastItem }) {
  const markOut = useUi((s) => s.markToastOut);
  const remove = useUi((s) => s.removeToast);
  useEffect(() => {
    const a = setTimeout(() => markOut(t.id), 3200);
    const b = setTimeout(() => remove(t.id), 3520);
    return () => { clearTimeout(a); clearTimeout(b); };
  }, [t.id, markOut, remove]);
  return (
    <div className={`toast${t.out ? ' out' : ''}`}>
      {t.pts != null && <span className="pts-b">+{t.pts}</span>}
      {t.content}
    </div>
  );
}

export function ToastHost() {
  const toasts = useUi((s) => s.toasts);
  return (
    <div id="toasts" role="status" aria-live="polite">
      {toasts.map((t) => <ToastView key={t.id} t={t} />)}
    </div>
  );
}
