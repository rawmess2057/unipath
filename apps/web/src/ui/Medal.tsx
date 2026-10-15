import { MEDAL_HUE } from '../lib/milestones';

export function Medal({ id, className = '' }: { id: string; className?: string }) {
  const hue = MEDAL_HUE[id] || '#0A8A7E';
  const gid = `mg${id}${className.replace(/\s+/g, '')}`;
  return (
    <svg className={className} viewBox="0 0 64 64" aria-hidden="true">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={hue} /><stop offset="1" stopColor="#16195A" />
        </linearGradient>
      </defs>
      <path d="M32 3 57 17.5v29L32 61 7 46.5v-29z" fill={`url(#${gid})`} />
      <path d="M32 9 52 20.5v23L32 55 12 43.5v-23z" fill="none" stroke="rgba(255,255,255,.35)" strokeWidth="1.2" />
      <path d="M32 16 35 29 48 32 35 35 32 48 29 35 16 32 29 29z" fill="#fff" />
      <path d="M32 16 35 29 32 32z" fill="#45EBD5" />
      <circle cx="32" cy="32" r="2.2" fill="#16195A" />
    </svg>
  );
}
