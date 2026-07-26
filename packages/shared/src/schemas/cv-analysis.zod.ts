import { z } from 'zod';

export const CvAnalysisSchema = z.object({
  overall_assessment: z.object({
    summary: z.string().max(300).describe('2-3 sentence high-level assessment'),
    strengths: z
      .array(z.string().max(150))
      .length(2)
      .describe('Exactly 2 key strengths'),
    priority_improvements: z
      .array(z.string().max(150))
      .length(3)
      .describe('Exactly 3 highest-impact improvements'),
  }),

  structure: z.object({
    score: z.number().int().min(0).max(25).describe('0-25 sub-score'),
    feedback: z
      .array(
        z.object({
          issue: z.string().max(200),
          severity: z.enum(['critical', 'important', 'minor']),
          suggestion: z.string().max(250),
        }),
      )
      .max(5),
    good_practices_observed: z.array(z.string().max(150)).max(3).optional(),
  }),

  keywords: z.object({
    score: z.number().int().min(0).max(25),
    missing_keywords: z
      .array(z.string().max(50))
      .max(10)
      .describe('Industry terms not found in CV'),
    keywords_present: z
      .array(z.string().max(50))
      .max(10)
      .describe('Good keywords found'),
    feedback: z
      .array(
        z.object({
          issue: z.string().max(200),
          severity: z.enum(['critical', 'important', 'minor']),
          suggestion: z.string().max(250),
        }),
      )
      .max(5),
  }),

  clarity: z.object({
    score: z.number().int().min(0).max(25),
    feedback: z
      .array(
        z.object({
          issue: z.string().max(200),
          severity: z.enum(['critical', 'important', 'minor']),
          suggestion: z.string().max(250),
          example_from_cv: z
            .string()
            .max(200)
            .optional()
            .describe('Direct quote from CV if applicable'),
        }),
      )
      .max(5),
    action_verbs_used: z.array(z.string().max(30)).max(10).optional(),
    action_verbs_missing: z.array(z.string().max(30)).max(10).optional(),
  }),

  uk_conventions: z.object({
    score: z.number().int().min(0).max(25),
    feedback: z
      .array(
        z.object({
          issue: z.string().max(200),
          severity: z.enum(['critical', 'important', 'minor']),
          suggestion: z.string().max(250),
          uk_standard: z.string().max(150).describe('What the UK standard is'),
        }),
      )
      .max(5),
    compliance_checklist: z.object({
      no_photo: z.boolean(),
      no_age_or_dob: z.boolean(),
      no_marital_status: z.boolean(),
      uk_date_format: z.boolean(),
      appropriate_length: z.boolean(),
      clear_contact_info: z.boolean(),
    }),
  }),

  cv_quality_score: z
    .number()
    .int()
    .min(0)
    .max(100)
    .describe(
      'Overall CV quality score (0-100). NEVER shown to student. ' +
        'Calculated from: Structure(25%) + Keywords(25%) + Clarity(25%) + UK Conventions(25%)',
    ),

  confidence: z
    .enum(['high', 'medium', 'low'])
    .describe(
      'high = clear text, complete CV | medium = some formatting issues | low = text extraction may have missed content',
    ),
});

export type CvAnalysisResult = z.infer<typeof CvAnalysisSchema>;
