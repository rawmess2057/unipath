interface ProgressBarProps {
  value: number;
  max?: number;
  colorClass?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function ProgressBar({ value, max = 100, colorClass = 'bg-brand-500', size = 'md' }: ProgressBarProps) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const sizeClass = size === 'sm' ? 'h-1.5' : size === 'lg' ? 'h-4' : 'h-2.5';

  return (
    <div
      className={`w-full overflow-hidden rounded-full bg-white/10 ${sizeClass}`}
      role="progressbar"
      aria-valuenow={Math.round(value)}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-label={`${Math.round(pct)}% complete`}
    >
      <div
        className={`rounded-full transition-all duration-500 ease-out ${colorClass} ${sizeClass}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
