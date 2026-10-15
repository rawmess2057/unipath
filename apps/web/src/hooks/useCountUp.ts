import { useEffect, useRef, useState } from 'react';
import { reducedMotion } from '../lib/fx';

/**
 * Animates a number from `from` to `to` (ease-out cubic, like the prototype's countUp).
 * When `from` is null the value is shown immediately.
 */
export function useCountUp(to: number, from: number | null, dur = 1300) {
  const [v, setV] = useState(from ?? to);
  const raf = useRef<number | null>(null);
  useEffect(() => {
    if (from == null || from === to || reducedMotion()) { setV(to); return; }
    const t0 = performance.now();
    const step = (t: number) => {
      const p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3);
      setV(Math.round(from + (to - from) * e));
      if (p < 1) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
  }, [to, from, dur]);
  return v;
}
