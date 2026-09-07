export interface ExperienceDraft {
  role: string;
  company: string;
  startDate: string;
  endDate: string;
  current: boolean;
  isRelevant: boolean;
  description: string;
}

export interface CertDraft {
  name: string;
  issuer: string;
  dateObtained: string;
  credentialUrl: string;
  attachmentUrl: string;
  attachmentName: string;
}

export interface ExtraLinkDraft {
  label: string;
  url: string;
}

export interface ProfileDraft {
  fieldOfStudy: string;
  university: string;
  graduationDate: string;
  targetIndustry: string;
  avatarImageUrl: string;
  websiteUrl: string;
  portfolioUrl: string;
  githubUrl: string;
  linkedinUrl: string;
  extraLinks: ExtraLinkDraft[];
  skills: string[];
  workExperiences: ExperienceDraft[];
  certifications: CertDraft[];
}

export const emptyExperience = (): ExperienceDraft => ({
  role: '',
  company: '',
  startDate: '',
  endDate: '',
  current: false,
  isRelevant: false,
  description: '',
});

export const emptyCert = (): CertDraft => ({
  name: '',
  issuer: '',
  dateObtained: '',
  credentialUrl: '',
  attachmentUrl: '',
  attachmentName: '',
});

export const emptyDraft = (): ProfileDraft => ({
  fieldOfStudy: '',
  university: '',
  graduationDate: '',
  targetIndustry: '',
  avatarImageUrl: '',
  websiteUrl: '',
  portfolioUrl: '',
  githubUrl: '',
  linkedinUrl: '',
  extraLinks: [],
  skills: [],
  workExperiences: [],
  certifications: [],
});

export function draftFromProfile(profile: any): ProfileDraft {
  const normDate = (v: unknown) => (v ? String(v).slice(0, 10) : '');

  const experiences = (Array.isArray(profile?.workExperiences) ? profile.workExperiences : []).map(
    (entry: any) => ({
      role: entry?.role ?? '',
      company: entry?.company ?? '',
      startDate: normDate(entry?.startDate),
      endDate: normDate(entry?.endDate),
      current: entry?.current ?? false,
      isRelevant: entry?.isRelevant ?? false,
      description: entry?.description ?? '',
    }),
  );

  const certifications = (Array.isArray(profile?.certifications) ? profile.certifications : []).map(
    (entry: any) => ({
      name: entry?.name ?? '',
      issuer: entry?.issuer ?? '',
      dateObtained: normDate(entry?.dateObtained),
      credentialUrl: entry?.credentialUrl ?? '',
      attachmentUrl: entry?.attachmentUrl ?? '',
      attachmentName: entry?.attachmentName ?? '',
    }),
  );

  return {
    fieldOfStudy: profile?.fieldOfStudy ?? '',
    university: profile?.university ?? '',
    graduationDate: normDate(profile?.graduationDate),
    targetIndustry: profile?.targetIndustry ?? '',
    avatarImageUrl: profile?.avatarImageUrl ?? '',
    websiteUrl: profile?.websiteUrl ?? '',
    portfolioUrl: profile?.portfolioUrl ?? '',
    githubUrl: profile?.githubUrl ?? '',
    linkedinUrl: profile?.linkedinUrl ?? '',
    extraLinks: Array.isArray(profile?.extraLinks) ? profile.extraLinks : [],
    skills: Array.isArray(profile?.skills) ? profile.skills : [],
    workExperiences: experiences,
    certifications,
  };
}