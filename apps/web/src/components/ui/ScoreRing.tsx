import { useEffect, useState } from 'react';

interface ScoreRingProps {
  value: number;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
}

const sizes = {
  sm: { radius: 48, stroke: 6, fontSize: 'text-lg' },
  md: { radius: 72, stroke: 8, fontSize: 'text-2xl' },
  lg: { radius: 96, stroke: 12, fontSize: 'text-4xl' },
};

function getColor(score: number): string {
  if (score >= 70) return '#22c55e';
  if (score >= 50) return '#f59e0b';
  return '#ef4444';
}

export function ScoreRing({ value, size = 'md', animated = true }: ScoreRingProps) {
  const { radius, stroke, fontSize } = sizes[size];
  const prefersReduced =
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false;
  const shouldAnimate = animated && !prefersReduced;
  const [displayValue, setDisplayValue] = useState(shouldAnimate ? 0 : value);

  useEffect(() => {
    if (!shouldAnimate) {
      setDisplayValue(value);
      return;
    }

    const duration = 1000;
    const start = performance.now();

    let rafId: number;
    const step = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.round(eased * value));
      if (progress < 1) {
        rafId = requestAnimationFrame(step);
      }
    };

    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [value, shouldAnimate]);

  const normalizedRadius = radius - stroke;
  const circumference = normalizedRadius * 2 * Math.PI;
  const offset = circumference - (displayValue / 100) * circumference;
  const color = getColor(displayValue);

  return (
    <svg
      width={radius * 2}
      height={radius * 2}
      className="drop-shadow-sm"
      role="img"
      aria-label={`Employability score: ${value} out of 100`}
    >
      <circle
        stroke="rgba(255,255,255,0.15)"
        fill="none"
        strokeWidth={stroke}
        r={normalizedRadius}
        cx={radius}
        cy={radius}
      />
      <circle
        stroke={color}
        fill="none"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={`${circumference} ${circumference}`}
        strokeDashoffset={offset}
        r={normalizedRadius}
        cx={radius}
        cy={radius}
        style={{ transition: prefersReduced ? 'none' : 'stroke-dashoffset 1s ease-out' }}
        transform={`rotate(-90 ${radius} ${radius})`}
      />
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="central"
        className={`${fontSize} font-bold`}
        fill={color}
      >
        {displayValue}
      </text>
    </svg>
  );
}
