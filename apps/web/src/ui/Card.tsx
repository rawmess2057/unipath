import type { HTMLAttributes, ReactNode } from 'react';

export function Card({ className = '', children, ...rest }: { children: ReactNode } & HTMLAttributes<HTMLElement>) {
  return <section className={['card', className].filter(Boolean).join(' ')} {...rest}>{children}</section>;
}

export function CardHead({ className = '', children, ...rest }: { children: ReactNode } & HTMLAttributes<HTMLDivElement>) {
  return <div className={['card-head', className].filter(Boolean).join(' ')} {...rest}>{children}</div>;
}
