import type { ReactNode, HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  hover?: boolean;
  padding?: 'default' | 'large';
}

export function Card({ children, hover = false, padding = 'default', className = '', ...props }: CardProps) {
  return (
    <div
      className={`rounded-xl border border-slate-200 bg-white shadow-sm ${
        padding === 'default' ? 'p-5' : 'p-6'
      } ${hover ? 'transition-shadow hover:shadow-md hover:border-slate-300' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
