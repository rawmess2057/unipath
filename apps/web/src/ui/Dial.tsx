import { useLayoutEffect, useMemo, useRef } from 'react';
import { reducedMotion } from '../lib/fx';

export const DIAL_C = 2 * Math.PI * 84;

function ticks() {
  const out: { x1: string; y1: string; x2: string; y2: string; cls: string }[] = [];
  for (let i = 0; i < 72; i++) {
    const a = i * 5, major = i % 18 === 0, mid = i % 6 === 0;
    const r1 = major ? 70 : mid ? 74 : 77, r2 = 80, rad = ((a - 90) * Math.PI) / 180;
    out.push({
      x1: (100 + r1 * Math.cos(rad)).toFixed(2), y1: (100 + r1 * Math.sin(rad)).toFixed(2),
      x2: (100 + r2 * Math.cos(rad)).toFixed(2), y2: (100 + r2 * Math.sin(rad)).toFixed(2),
      cls: major || mid ? 'tk-maj' : 'tk',
    });
  }
  return out;
}

/**
 * The compass dial. `animateFrom` sweeps the needle and arc from that value
 * to `value` (used on first paint and after a completion).
 */
export function Dial({ value, animateFrom = null, onLight = false, className = '' }: { value: number; animateFrom?: number | null; onLight?: boolean; className?: string }) {
  const needle = useRef<SVGGElement>(null);
  const arc = useRef<SVGCircleElement>(null);
  const tk = useMemo(ticks, []);
  const s = Math.max(0, Math.min(100, value));

  useLayoutEffect(() => {
    if (animateFrom == null || animateFrom === s || reducedMotion()) return;
    const n = needle.current, a = arc.current;
    if (!n || !a) return;
    n.style.transition = 'none'; a.style.transition = 'none';
    n.style.transform = `rotate(${animateFrom * 3.6}deg)`; a.style.strokeDashoffset = String(DIAL_C * (1 - animateFrom / 100));
    void n.getBoundingClientRect();
    let id2 = 0;
    const id = requestAnimationFrame(() => {
      id2 = requestAnimationFrame(() => {
        n.style.transition = ''; a.style.transition = '';
        n.style.transform = `rotate(${s * 3.6}deg)`; a.style.strokeDashoffset = String(DIAL_C * (1 - s / 100));
      });
    });
    return () => { cancelAnimationFrame(id); cancelAnimationFrame(id2); };
  }, [animateFrom, s]);

  return (
    <svg className={`dial${onLight ? ' on-light' : ''}${className ? ' ' + className : ''}`} viewBox="-6 -6 212 212" data-s={s} role="img" aria-label={`Employability Score ${s} out of 100`}>
      <circle cx="100" cy="100" r="84" className="dial-track" />
      <circle ref={arc} cx="100" cy="100" r="84" className="dial-arc" strokeDasharray={DIAL_C.toFixed(2)} style={{ strokeDashoffset: (DIAL_C * (1 - s / 100)).toFixed(2) }} transform="rotate(-90 100 100)" />
      {tk.map((t, i) => <line key={i} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} className={t.cls} />)}
      <text x="100" y="58" className="dial-n n">N</text><text x="142" y="100" className="dial-n">E</text><text x="100" y="142" className="dial-n">S</text><text x="58" y="100" className="dial-n">W</text>
      <g ref={needle} className="needle" style={{ transform: `rotate(${s * 3.6}deg)` }}>
        <g className="needle-wob"><path d="M100 30 L106.5 100 L93.5 100Z" className="nd-tip" /><path d="M93.5 100 L106.5 100 L100 152Z" className="nd-tail" /></g>
      </g>
      <circle cx="100" cy="100" r="8" className="hub" /><circle cx="100" cy="100" r="2.6" className="hub-dot" />
    </svg>
  );
}
