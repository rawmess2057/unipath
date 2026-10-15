import type { ReactNode } from 'react';

export function PageHead({ eyebrow, title, lede, right }: { eyebrow: ReactNode; title: ReactNode; lede?: ReactNode; right?: ReactNode }) {
  return (
    <div className="page-head">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="h1">{title}</h1>
        {lede && <p className="lede">{lede}</p>}
      </div>
      {right}
    </div>
  );
}
