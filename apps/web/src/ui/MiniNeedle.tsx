/** The small compass used in the score chip and the ".tie" banners. */
export function MiniNeedle({ value, id, animate = true, className = 'mini-needle' }: { value: number; id?: string; animate?: boolean; className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="10" fill="none" stroke="rgba(255,255,255,.25)" strokeWidth="1.5" />
      <g id={id} style={{ transformOrigin: '12px 12px', transform: `rotate(${value * 3.6}deg)`, transition: animate ? 'transform 1.4s cubic-bezier(.34,1.5,.5,1)' : undefined }}>
        <path d="M12 3.5 14 12h-4z" fill="var(--needle)" />
        <path d="M12 20.5 10 12h4z" fill="rgba(255,255,255,.5)" />
      </g>
      <circle cx="12" cy="12" r="1.6" fill="#fff" />
    </svg>
  );
}

/** The brand compass mark (sidebar, landing nav, badge). */
export function BrandMark() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="9" fill="none" stroke="rgba(255,255,255,.35)" strokeWidth="1.4" />
      <path d="M12 4.5 14 12h-4z" fill="#45EBD5" />
      <path d="M12 19.5 10 12h4z" fill="rgba(255,255,255,.55)" />
      <circle cx="12" cy="12" r="1.6" fill="#fff" />
    </svg>
  );
}
