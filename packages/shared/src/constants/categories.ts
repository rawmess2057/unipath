export const SCORE_CATEGORIES = [
  'cv_quality',
  'skills_match',
  'work_experience',
  'certifications',
  'platform_activity',
] as const;

export type ScoreCategory = (typeof SCORE_CATEGORIES)[number];

export const PHASES = ['foundation', 'preparation', 'application'] as const;
export type Phase = (typeof PHASES)[number];

export const EFFORT_LEVELS = ['1_hour', 'half_day', '1_day', '1_week', 'ongoing'] as const;
export type EffortLevel = (typeof EFFORT_LEVELS)[number];

export const SEVERITY_LEVELS = ['critical', 'important', 'minor'] as const;
export type SeverityLevel = (typeof SEVERITY_LEVELS)[number];
