import { z } from 'zod';

export const IndustrySkillSchema = z.object({
  name: z.string(),
  level: z.enum(['essential', 'preferred', 'advanced']),
});

export const IndustryCertificationSchema = z.object({
  name: z.string(),
  points: z.number().int().min(1).max(20),
});

export const IndustrySchema = z.object({
  skills: z.array(IndustrySkillSchema),
  certifications: z.array(IndustryCertificationSchema),
});

export const ExperienceMatrixSchema = z.object({
  relevant_per_month: z.number().min(0),
  transferable_per_month: z.number().min(0),
  irrelevant_per_month: z.number().min(0),
  max_experience_score: z.number().min(0).max(100),
});

export const ActivityPointsSchema = z.object({
  job_application: z.number().int().min(0),
  networking_event: z.number().int().min(0),
  interview: z.number().int().min(0),
  skill_practice: z.number().int().min(0),
});

export const ScoreRubricSchema = z.object({
  industries: z.record(IndustrySchema),
  experience_matrix: ExperienceMatrixSchema,
  activity_points: ActivityPointsSchema,
});

export type ScoreRubric = z.infer<typeof ScoreRubricSchema>;
export type IndustrySkill = z.infer<typeof IndustrySkillSchema>;
