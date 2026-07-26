import { z } from 'zod';

export const RoadmapTaskSchema = z.object({
  id: z.string().uuid().describe('Generated UUID for this task'),
  phase: z.enum(['foundation', 'preparation', 'application']),
  order: z.number().int().min(0).max(20).describe('Display order within phase'),
  title: z.string().max(100).describe('Short, actionable task title'),
  description: z.string().max(300).describe('What to do and why it matters'),
  category: z
    .enum(['cv_quality', 'skills_match', 'work_experience', 'certifications', 'platform_activity'])
    .describe('Which Employability Score component this affects'),
  estimated_effort: z.enum(['1_hour', 'half_day', '1_day', '1_week', 'ongoing']),
  points_value: z.number().int().min(1).max(10).describe('Score points on completion'),
  is_visa_related: z
    .boolean()
    .default(false)
    .describe('True if task needs visa snippet injection'),
  prerequisites: z
    .array(z.string().uuid())
    .max(3)
    .optional()
    .describe('Task IDs that should be done first'),
  resources: z
    .array(
      z.object({
        title: z.string().max(100),
        url: z.string().url().optional(),
        type: z.enum(['article', 'video', 'tool', 'template']),
      }),
    )
    .max(3)
    .optional(),
});

export const RoadmapSchema = z.object({
  tasks: z
    .array(RoadmapTaskSchema)
    .min(8)
    .max(18)
    .describe('8-18 tasks across 3 phases. Foundation: 3-5, Preparation: 3-6, Application: 3-5'),
  generation_metadata: z.object({
    model_version: z.string(),
    generated_at: z.string().datetime(),
    profile_hash: z.string().describe('Hash of student profile for cache invalidation'),
    is_fallback: z.boolean().default(false).describe('True if using template fallback'),
  }),
});

export type RoadmapResult = z.infer<typeof RoadmapSchema>;
export type RoadmapTask = z.infer<typeof RoadmapTaskSchema>;
