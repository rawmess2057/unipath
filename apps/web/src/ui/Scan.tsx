import { useEffect, useRef, useState } from 'react';
import { Icon } from './Icon';

export const SCAN_STEPS = ['Reading your file', 'Checking impact and clarity', 'Comparing with UK recruiter norms', 'Scoring and picking your top fix'];

/**
 * The four-step "analysing" animation. It never finishes before `ready` is
 * true: once the steps have run it waits on a "Still reading…" bar, then
 * calls `onDone` exactly once.
 */
export function Scan({ name, ready, onDone, steps = SCAN_STEPS }: { name: string; ready: boolean; onDone: () => void; steps?: string[] }) {
  const n = steps.length;
  // i = number of ticks so far: rows 0..i-2 are done, row i-1 is running; at i = n+1 all rows are done.
  const [i, setI] = useState(0);
  const [animDone, setAnimDone] = useState(false);
  const fired = useRef(false);

  useEffect(() => {
    if (i <= n) { const t = setTimeout(() => setI(i + 1), 420); return () => clearTimeout(t); }
    const t = setTimeout(() => setAnimDone(true), 320);
    return () => clearTimeout(t);
  }, [i, n]);

  useEffect(() => {
    if (animDone && ready && !fired.current) { fired.current = true; onDone(); }
  }, [animDone, ready, onDone]);

  if (animDone && !ready) {
    return (
      <div className="scan">
        <p className="eyebrow" style={{ margin: 0 }}>Still reading {name}…</p>
        <div className="bar"><i style={{ width: '92%' }} /></div>
      </div>
    );
  }
  const okCount = Math.max(0, Math.min(n, i - 1));
  const onIndex = i - 1 < n ? i - 1 : -1;
  return (
    <div className="scan">
      <p className="eyebrow" style={{ margin: 0 }}>Analysing {name}</p>
      {steps.map((t, k) => (
        <div key={t} className={`scan-step${k < okCount ? ' ok' : k === onIndex ? ' on' : ''}`}>
          <i>{k < okCount ? <Icon name="check" sm /> : null}</i>{t}
        </div>
      ))}
      <div className="bar" style={{ marginTop: 6 }}><i style={{ width: `${(okCount / n) * 100}%` }} /></div>
    </div>
  );
}
