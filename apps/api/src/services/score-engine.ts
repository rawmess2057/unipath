import type { ScoreInput, EmployabilityScore } from '@unipath/shared';

const DEFAULT_WEIGHTS = {
  cvQuality: 0.25,
  skillsMatch: 0.20,
  workExperience: 0.20,
  certifications: 0.15,
  platformActivity: 0.20,
};

function rebalanceWeights(hasCv: boolean): typeof DEFAULT_WEIGHTS {
  if (hasCv) return DEFAULT_WEIGHTS;

  const remaining = Object.entries(DEFAULT_WEIGHTS).filter(([k]) => k !== 'cvQuality');
  const totalWeight = remaining.reduce((sum, [, w]) => sum + w, 0);

  const rebalanced: Record<string, number> = {};
  for (const [key, weight] of remaining) {
    rebalanced[key] = weight / totalWeight;
  }

  return {
    cvQuality: 0,
    skillsMatch: rebalanced.skillsMatch,
    workExperience: rebalanced.workExperience,
    certifications: rebalanced.certifications,
    platformActivity: rebalanced.platformActivity,
  };
}

function computeSkillsScore(input: ScoreInput['skillsMatch']): number {
  if (input.skills.length === 0) return 0;
  return Math.min(100, input.skills.length * 8);
}

function computeExperienceScore(input: ScoreInput['workExperience']): number {
  const relevantScore = input.totalRelevantMonths * 1.5;
  const transferableScore = input.totalTransferableMonths * 0.8;
  return Math.min(100, relevantScore + transferableScore);
}

function computeCertificationScore(input: ScoreInput['certifications']): number {
  const total = input.reduce((sum, c) => sum + c.points, 0);
  return Math.min(100, total);
}

function computeActivityScore(input: ScoreInput['platformActivity']): number {
  const points =
    input.applications * 1 +
    input.networkingEvents * 3 +
    input.interviews * 5 +
    input.skillPractice * 1;
  return Math.min(100, points * 5);
}

export function calculateScore(input: ScoreInput): EmployabilityScore {
  const hasCv = input.cvQualityScore !== null;
  const weights = rebalanceWeights(hasCv);

  const cvQuality = hasCv ? (input.cvQualityScore ?? 0) : 0;
  const skillsMatch = computeSkillsScore(input.skillsMatch);
  const workExperience = computeExperienceScore(input.workExperience);
  const certifications = computeCertificationScore(input.certifications);
  const platformActivity = computeActivityScore(input.platformActivity);

  const totalScore = Math.round(
    cvQuality * weights.cvQuality +
      skillsMatch * weights.skillsMatch +
      workExperience * weights.workExperience +
      certifications * weights.certifications +
      platformActivity * weights.platformActivity,
  );

  return {
    totalScore,
    components: {
      cvQuality,
      skillsMatch,
      workExperience,
      certifications,
      platformActivity,
    },
    weights,
  };
}
