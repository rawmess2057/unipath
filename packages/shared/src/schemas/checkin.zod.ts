import { z } from 'zod';

export const WeeklyCheckinDataSchema = z.object({
  networkingEvents: z.number().int().min(0).max(20),
  interviews: z.number().int().min(0).max(20),
  skillsPracticed: z.number().int().min(0).max(50),
  reflection: z.string().max(500).optional(),
});

export const WeeklyCheckinInputSchema = WeeklyCheckinDataSchema;

export const WeeklyCheckinSchema = z.object({
  id: z.string(),
  weekStart: z.string(),
  data: WeeklyCheckinDataSchema,
  pointsEarned: z.number().int().min(0),
  updatedAt: z.string(),
});

export const CheckinSummarySchema = z.object({
  current: WeeklyCheckinSchema.nullable(),
  streak: z.number().int().min(0),
});

export type WeeklyCheckinData = z.infer<typeof WeeklyCheckinDataSchema>;
export type WeeklyCheckinInput = z.infer<typeof WeeklyCheckinInputSchema>;
export type WeeklyCheckin = z.infer<typeof WeeklyCheckinSchema>;
export type CheckinSummary = z.infer<typeof CheckinSummarySchema>;