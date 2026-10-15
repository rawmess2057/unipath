/** Target roles shown in the UI (from the prototype) and how they map onto the API's industry enum. */
export const ROLES = ['Business Analyst', 'Data Analyst', 'Marketing Executive', 'Project Coordinator'] as const;
export type Role = (typeof ROLES)[number];

export type Industry = 'tech' | 'finance' | 'consulting' | 'healthcare' | 'engineering' | 'marketing' | 'other';

export const ROLE_TO_INDUSTRY: Record<Role, Industry> = {
  'Business Analyst': 'consulting',
  'Data Analyst': 'tech',
  'Marketing Executive': 'marketing',
  'Project Coordinator': 'other',
};

/** Profile enum value → the value the Opportunity table uses for `industry`. */
export const INDUSTRY_TO_OPP: Record<Industry, string> = {
  tech: 'technology',
  finance: 'finance',
  consulting: 'consulting',
  healthcare: 'healthcare',
  engineering: 'engineering',
  marketing: 'marketing',
  other: 'other',
};

export const INDUSTRY_LABEL: Record<Industry, string> = {
  tech: 'Technology',
  finance: 'Finance',
  consulting: 'Consulting',
  healthcare: 'Healthcare',
  engineering: 'Engineering',
  marketing: 'Marketing',
  other: 'Other',
};

/** Older profiles stored labels such as "Technology"; coerce anything to the enum. */
export function normalizeIndustry(v: unknown): Industry {
  const s = String(v ?? '').trim().toLowerCase();
  if (!s) return 'other';
  if (s === 'tech' || s === 'technology' || s === 'it' || s === 'software') return 'tech';
  if (s === 'finance' || s === 'banking' || s === 'accounting') return 'finance';
  if (s === 'consulting') return 'consulting';
  if (s === 'healthcare' || s === 'health') return 'healthcare';
  if (s === 'engineering') return 'engineering';
  if (s === 'marketing' || s === 'media') return 'marketing';
  return 'other';
}

export const VISA_OPTIONS = [
  { value: 'student_visa', label: 'Student visa', hint: 'Currently studying' },
  { value: 'graduate_route', label: 'Graduate Route', hint: '2 years post-study' },
  { value: 'other', label: 'Other', hint: 'Settled, dependant, or another route' },
] as const;
export type VisaStatus = (typeof VISA_OPTIONS)[number]['value'];

export function normalizeVisa(v: unknown): VisaStatus {
  const s = String(v ?? '');
  return s === 'student_visa' || s === 'graduate_route' ? s : 'other';
}

export const EMPLOYMENT_LABEL: Record<string, string> = {
  graduate: 'Graduate scheme',
  internship: 'Internship',
  placement: 'Placement',
};
