import type { ReactNode, HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  hover?: boolean;
  padding?: 'default' | 'large';
  variant?: 'solid' | 'glass';
}

export function Card({ children, hover = false, padding = 'default', variant = 'solid', className = '', ...props }: CardProps) {
  const base = variant === 'glass'
    ? 'rounded-xl border border-white/20 bg-white/10 shadow-2xl backdrop-blur-lg'
    : 'rounded-xl border border-slate-200 bg-white shadow-sm';
  const pad = padding === 'default' ? 'p-5' : 'p-6';
  const lift = hover ? 'transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 hover:border-slate-300' : '';

  return (
    <div
      className={`${base} ${pad} ${lift} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
