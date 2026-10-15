import type { CSSProperties } from 'react';
import { fitTier } from '../lib/score';

/** Match ring: colour encodes fit, number + % centred, fills on load. */
export function Ring({ pct, size = 68 }: { pct: number; size?: number }) {
  const sm = size <= 52, sw = sm ? 4.5 : 6, r = (size - sw) / 2 - 1, c = 2 * Math.PI * r, h = size / 2;
  return (
    <div className={`ring ${fitTier(pct)}${sm ? ' sm' : ''}`} style={{ width: size, height: size }} role="img" aria-label={`${pct}% match`}>
      <svg viewBox={`0 0 ${size} ${size}`}>
        <circle className="rt" cx={h} cy={h} r={r.toFixed(2)} strokeWidth={sw} />
        <circle className="rv" cx={h} cy={h} r={r.toFixed(2)} strokeWidth={sw} strokeDasharray={c.toFixed(2)} strokeDashoffset={(c * (1 - pct / 100)).toFixed(2)} style={{ '--c': c.toFixed(2) } as CSSProperties} />
      </svg>
      <div className="ring-txt"><b>{pct}<small>%</small></b>{sm ? null : <span>match</span>}</div>
    </div>
  );
}
