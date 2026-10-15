import { useCountUp } from '../hooks/useCountUp';

export function CountUp({ to, from = null, dur, className = 'num' }: { to: number; from?: number | null; dur?: number; className?: string }) {
  const v = useCountUp(to, from, dur);
  return <span className={className} data-count={to}>{v}</span>;
}
