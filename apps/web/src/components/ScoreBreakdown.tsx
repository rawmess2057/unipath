interface ScoreBarProps {
  label: string;
  score: number;
  max: number;
  weight: number;
}

function ScoreBar({ label, score, max, weight }: ScoreBarProps) {
  const pct = Math.round((score / max) * 100);
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-700">{label}</span>
        <span className="font-medium text-gray-900">
          {score}/{max} ({Math.round(weight * 100)}%)
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
        <div
          className="h-full rounded-full bg-indigo-500 transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

interface ScoreBreakdownProps {
  components: {
    cvQuality: number;
    skillsMatch: number;
    workExperience: number;
    certifications: number;
    platformActivity: number;
  };
  weights: {
    cvQuality: number;
    skillsMatch: number;
    workExperience: number;
    certifications: number;
    platformActivity: number;
  };
}

export function ScoreBreakdown({ components, weights }: ScoreBreakdownProps) {
  const items = [
    { label: 'CV Quality', score: components.cvQuality, max: 100, weight: weights.cvQuality },
    { label: 'Skills Match', score: components.skillsMatch, max: 100, weight: weights.skillsMatch },
    { label: 'Work Experience', score: components.workExperience, max: 100, weight: weights.workExperience },
    { label: 'Certifications', score: components.certifications, max: 100, weight: weights.certifications },
    { label: 'Platform Activity', score: components.platformActivity, max: 100, weight: weights.platformActivity },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
        Score Breakdown
      </h3>
      {items.map((item) => (
        <ScoreBar key={item.label} {...item} />
      ))}
    </div>
  );
}
