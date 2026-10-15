import type { HTMLAttributes, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from './Icon';

export type ChipTone = '' | 'teal' | 'indigo' | 'good' | 'bad' | 'amber';

export function Chip({ tone = '', className = '', children, ...rest }: { tone?: ChipTone; children: ReactNode } & HTMLAttributes<HTMLSpanElement>) {
  return <span className={['chip', tone, className].filter(Boolean).join(' ')} {...rest}>{children}</span>;
}

/** A locked Premium feature chip; opens the Plans page. */
export function LockChip({ children }: { children: ReactNode }) {
  const nav = useNavigate();
  return (
    <button className="chip lock" onClick={() => nav('/plans')}>
      <Icon name="lock" sm />{children}
    </button>
  );
}
