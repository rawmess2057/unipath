import { z } from 'zod';

export const OPPORTUNITY_STATUSES = [
  'saved',
  'applied',
  'interviewing',
  'offered',
  'rejected',
  'removed',
] as const;

export const OPPORTUNITY_EMPLOYMENT_TYPES = [
  'internship',
  'graduate',
  'placement',
] as const;

export const OpportunityStatusSchema = z.enum(OPPORTUNITY_STATUSES);
export const OpportunityEmploymentTypeSchema = z.enum(OPPORTUNITY_EMPLOYMENT_TYPES);

export const OpportunitySchema = z.object({
  id: z.string(),
  title: z.string(),
  company: z.string(),
  location: z.string(),
  employmentType: OpportunityEmploymentTypeSchema,
  industry: z.string(),
  salaryRange: z.string().nullable(),
  description: z.string(),
  requirements: z.array(z.string()).nullable(),
  applicationUrl: z.string().nullable(),
  deadline: z.string().nullable(),
  visaSuitable: z.boolean(),
  sponsorshipNote: z.string().nullable(),
  status: OpportunityStatusSchema.nullable(),
});

export const OpportunityFiltersSchema = z.object({
  industry: z.string().optional(),
  employmentType: OpportunityEmploymentTypeSchema.optional(),
  visaSuitable: z.string().optional(),
  saved: z.string().optional(),
});

export type Opportunity = z.infer<typeof OpportunitySchema>;
export type OpportunityStatus = z.infer<typeof OpportunityStatusSchema>;
export type OpportunityEmploymentType = z.infer<typeof OpportunityEmploymentTypeSchema>;
export type OpportunityFilters = z.infer<typeof OpportunityFiltersSchema>;