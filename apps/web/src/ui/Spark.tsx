export function Spark({ vals }: { vals: number[] }) {
  if (vals.length < 2) return null;
  const w = 260, h = 56, min = Math.min(...vals) - 4, max = Math.max(...vals) + 2;
  const span = max - min || 1;
  const pts = vals.map((v, i) => [i * (w / (vals.length - 1)), h - 6 - ((v - min) / span) * (h - 14)]);
  const d = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
  const last = pts[pts.length - 1];
  return (
    <svg className="spark" viewBox={`-4 0 ${w + 8} ${h}`} preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id="sg" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="var(--needle)" stopOpacity=".35" />
          <stop offset="1" stopColor="var(--needle)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${d} L${w} ${h} L0 ${h}Z`} fill="url(#sg)" />
      <path d={d} fill="none" stroke="var(--needle)" strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
      <circle cx={last[0]} cy={last[1]} r="4" fill="var(--needle)" stroke="var(--hero)" strokeWidth="2" />
    </svg>
  );
}
