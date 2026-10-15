import type { ReactNode } from 'react';

export function Seg({ children }: { children: ReactNode }) {
  return <div className="seg">{children}</div>;
}

export function SegBtn({ on, onClick, children }: { on: boolean; onClick: () => void; children: ReactNode }) {
  return <button aria-pressed={on} onClick={onClick}>{children}</button>;
}
