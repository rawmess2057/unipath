import { Children, cloneElement, isValidElement, type ReactNode } from 'react';

interface StaggerChildrenProps {
  children: ReactNode;
  className?: string;
  staggerMs?: number;
  baseDelayMs?: number;
}

export function StaggerChildren({ children, className = '', staggerMs = 100, baseDelayMs = 0 }: StaggerChildrenProps) {
  return (
    <div className={className}>
      {Children.map(children, (child, i) => {
        if (!isValidElement(child)) return child;
        const delay = baseDelayMs + i * staggerMs;
        const props = child.props as Record<string, unknown>;
        return cloneElement(child, {
          style: { ...(props.style as Record<string, string> || {}), animationDelay: `${delay}ms` },
        } as Record<string, unknown>);
      })}
    </div>
  );
}
