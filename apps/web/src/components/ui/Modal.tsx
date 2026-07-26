import { X } from 'lucide-react';
import { useEffect, type ReactNode } from 'react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  header?: ReactNode;
  body?: ReactNode;
  footer?: ReactNode;
}

export function Modal({ open, onClose, header, body, footer }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 mx-4 w-full max-w-lg rounded-2xl bg-white shadow-xl" role="dialog" aria-modal="true" aria-label={typeof header === 'string' ? header : 'Dialog'}>
        {header && (
          <div className="flex items-center justify-between border-b border-slate-100 p-5">
            <div className="font-semibold text-slate-800" id="modal-header">{header}</div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600" aria-label="Close">
              <X className="h-5 w-5" />
            </button>
          </div>
        )}
        {body && <div className="p-5">{body}</div>}
        {footer && (
          <div className="flex justify-end gap-2 border-t border-slate-100 p-5">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
