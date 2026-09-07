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

export const DateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?)?$/);

const urlString = z.string().trim().url().max(500).optional().or(z.literal(''));

export const WorkExperienceSchema = z.object({
  role: z.string().max(200),
  company: z.string().max(200),
  startDate: DateString,
  endDate: DateString.optional(),
  description: z.string().max(1000).optional(),
  isRelevant: z.boolean().default(false),
  current: z.boolean().default(false),
});

export const CertificationSchema = z.object({
  name: z.string().max(200),
  issuer: z.string().max(200).optional(),
  dateObtained: DateString.optional(),
  credentialUrl: urlString.optional(),
  attachmentUrl: urlString.optional(),
  attachmentName: z.string().max(200).optional(),
});

export const ExtraLinkSchema = z.object({
  label: z.string().max(50),
  url: z.string().trim().url().max(500),
});

export const StudentProfileSchema = z.object({
  fieldOfStudy: z.string().min(1).max(200),
  university: z.string().min(1).max(200),
  graduationDate: DateString,
  targetIndustry: TargetIndustryEnum,
  visaStatus: VisaStatusEnum,
  skills: z.array(z.string()).max(30),
  workExperiences: z.array(WorkExperienceSchema).max(10),
  certifications: z.array(CertificationSchema).max(10),
  avatarImageUrl: urlString.optional(),
  websiteUrl: urlString.optional(),
  portfolioUrl: urlString.optional(),
  githubUrl: urlString.optional(),
  linkedinUrl: urlString.optional(),
  extraLinks: z.array(ExtraLinkSchema).max(10).optional(),
});

export type StudentProfile = z.infer<typeof StudentProfileSchema>;
export type StudentProfileData = z.input<typeof StudentProfileSchema>;
export type WorkExperience = z.infer<typeof WorkExperienceSchema>;
export type Certification = z.infer<typeof CertificationSchema>;
export type ExtraLink = z.infer<typeof ExtraLinkSchema>;
export type VisaStatus = z.infer<typeof VisaStatusEnum>;
export type TargetIndustry = z.infer<typeof TargetIndustryEnum>;
