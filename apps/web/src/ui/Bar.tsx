import type { CSSProperties } from 'react';

export function Bar({ value, tier = '', className = '', style }: { value: number; tier?: '' | 'lo' | 'mid' | 'hi'; className?: string; style?: CSSProperties }) {
  const w = Math.max(0, Math.min(100, value));
  return (
    <div className={['bar', tier, className].filter(Boolean).join(' ')} style={style}>
      <i style={{ width: `${w}%` }} />
    </div>
  );
}
