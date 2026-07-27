import type { ReactNode } from 'react';

type Variant = 'default' | 'success' | 'warning' | 'danger' | 'slate';

interface BadgeProps {
  variant?: Variant;
  children: ReactNode;
}

const variantStyles: Record<Variant, string> = {
  default: 'bg-brand-500/20 text-brand-300',
  success: 'bg-success-500/20 text-success-300',
  warning: 'bg-warning-500/20 text-warning-300',
  danger: 'bg-danger-500/20 text-danger-300',
  slate: 'bg-white/10 text-brand-200',
};

export function Badge({ variant = 'default', children }: BadgeProps) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${variantStyles[variant]}`}>
      {children}
    </span>
  );
}
