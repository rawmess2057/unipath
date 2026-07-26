import { z } from 'zod';

export const VisaStatusEnum = z.enum(['student_visa', 'graduate_route', 'other']);

export const TargetIndustryEnum = z.enum([
  'tech',
  'finance',
  'consulting',
  'healthcare',
  'engineering',
  'marketing',
  'other',
]);

export const StudentProfileSchema = z.object({
  fieldOfStudy: z.string().min(1).max(200),
  university: z.string().min(1).max(200),
  graduationDate: z.string().datetime(),
  targetIndustry: TargetIndustryEnum,
  visaStatus: VisaStatusEnum,
  skills: z.array(z.string()).max(30),
  workExperiences: z
    .array(
      z.object({
        role: z.string().max(200),
        company: z.string().max(200),
        startDate: z.string().datetime(),
        endDate: z.string().datetime().optional(),
        description: z.string().max(1000).optional(),
        isRelevant: z.boolean().default(false),
      }),
    )
    .max(10),
  certifications: z
    .array(
      z.object({
        name: z.string().max(200),
        issuer: z.string().max(200).optional(),
        dateObtained: z.string().datetime().optional(),
      }),
    )
    .max(10),
});

export type StudentProfile = z.infer<typeof StudentProfileSchema>;
export type VisaStatus = z.infer<typeof VisaStatusEnum>;
export type TargetIndustry = z.infer<typeof TargetIndustryEnum>;
