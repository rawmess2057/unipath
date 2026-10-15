import { useId, useState, type DragEvent, type ReactNode } from 'react';
import { Icon } from './Icon';

/** The dashed drop zone. `children` is the title/sub block. */
export function Drop({ accept, onFile, children, btnSm = false, className = '' }: { accept: string; onFile: (f: File) => void; children: ReactNode; btnSm?: boolean; className?: string }) {
  const id = useId();
  const [over, setOver] = useState(false);
  const prevent = (e: DragEvent) => { e.preventDefault(); };
  return (
    <label
      className={['drop', over && 'over', className].filter(Boolean).join(' ')}
      htmlFor={id}
      onDragEnter={(e) => { prevent(e); setOver(true); }}
      onDragOver={(e) => { prevent(e); setOver(true); }}
      onDragLeave={(e) => { prevent(e); setOver(false); }}
      onDrop={(e) => { prevent(e); setOver(false); const f = e.dataTransfer.files[0]; if (f) onFile(f); }}
    >
      <div className="drop-ico"><Icon name="upload" /></div>
      <div>{children}</div>
      <input type="file" id={id} className="sr-only" accept={accept} onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); e.target.value = ''; }} />
      <span className={`btn btn-primary${btnSm ? ' btn-sm' : ''}`} aria-hidden="true">Choose file</span>
    </label>
  );
}
