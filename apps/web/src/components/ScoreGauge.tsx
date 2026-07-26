interface ScoreGaugeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
}

export function ScoreGauge({ score, size = 'md' }: ScoreGaugeProps) {
  const radius = size === 'sm' ? 40 : size === 'lg' ? 80 : 60;
  const strokeWidth = size === 'sm' ? 6 : size === 'lg' ? 12 : 8;
  const normalizedRadius = radius - strokeWidth;
  const circumference = normalizedRadius * 2 * Math.PI;
  const offset = circumference - (score / 100) * circumference;

  const getColor = (s: number) => {
    if (s < 40) return '#ef4444';
    if (s < 65) return '#f59e0b';
    return '#22c55e';
  };

  const color = getColor(score);

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={radius * 2} height={radius * 2}>
        <circle
          stroke="#e5e7eb"
          fill="transparent"
          strokeWidth={strokeWidth}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <circle
          stroke={color}
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={offset}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          style={{ transition: 'stroke-dashoffset 0.5s ease' }}
          transform={`rotate(-90 ${radius} ${radius})`}
        />
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dominantBaseline="central"
          className={`font-bold ${size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-4xl' : 'text-2xl'}`}
          fill={color}
        >
          {score}
        </text>
      </svg>
      <span className="text-sm font-medium text-gray-500">Employability Score</span>
    </div>
  );
}
