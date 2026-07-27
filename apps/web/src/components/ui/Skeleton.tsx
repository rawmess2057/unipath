interface SkeletonProps {
  width?: string;
  height?: string;
  rounded?: string;
  className?: string;
}

export function Skeleton({ width = '100%', height = '1rem', rounded = 'rounded-lg', className = '' }: SkeletonProps) {
  return (
    <div
      className={`relative overflow-hidden bg-white/10 ${rounded} ${className}`}
      style={{ width, height }}
      aria-hidden="true"
    >
      <div
        className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent"
        style={{ animation: 'shimmer 1.5s infinite' }}
      />
    </div>
  );
}
