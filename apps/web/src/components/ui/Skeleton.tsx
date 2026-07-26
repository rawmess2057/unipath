interface SkeletonProps {
  width?: string;
  height?: string;
  rounded?: string;
  className?: string;
}

export function Skeleton({ width = '100%', height = '1rem', rounded = 'rounded', className = '' }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-slate-200 ${rounded} ${className}`}
      style={{ width, height }}
    />
  );
}
