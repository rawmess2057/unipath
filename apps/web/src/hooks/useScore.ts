import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api-client';

export interface ScoreData {
  totalScore: number;
  components: {
    cvQuality: number;
    skillsMatch: number;
    workExperience: number;
    certifications: number;
    platformActivity: number;
  };
  weights: {
    cvQuality: number;
    skillsMatch: number;
    workExperience: number;
    certifications: number;
    platformActivity: number;
  };
}

export function useScore() {
  return useQuery<ScoreData>({
    queryKey: ['score'],
    queryFn: () => api.get<ScoreData>('/score'),
    refetchInterval: 30_000,
  });
}
