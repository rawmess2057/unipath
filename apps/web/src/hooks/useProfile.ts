import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api-client';
import type { WorkExperience, Certification, ExtraLink } from '@unipath/shared';

export interface Profile {
  id: string;
  studentId: string;
  fieldOfStudy: string | null;
  university: string | null;
  graduationDate: string | null;
  targetIndustry: string | null;
  visaStatus: string | null;
  skills: string[];
  workExperiences: WorkExperience[] | null;
  certifications: Certification[] | null;
  avatarImageUrl: string | null;
  websiteUrl: string | null;
  portfolioUrl: string | null;
  githubUrl: string | null;
  linkedinUrl: string | null;
  extraLinks: ExtraLink[] | null;
  student?: { email: string } | null;
}

export function useProfile() {
  return useQuery<Profile | null>({
    queryKey: ['profile'],
    queryFn: () => api.get<Profile | null>('/profile'),
  });
}

export function useUpsertProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => api.post<Profile>('/profile', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['profile'] });
      qc.invalidateQueries({ queryKey: ['score'] });
      qc.invalidateQueries({ queryKey: ['opportunities'] });
    },
  });
}
