import { useQuery, useMutation } from '@tanstack/react-query';
import type { CvUploadInput } from '../lib/api-client';
import { api } from '../lib/api-client';

export function useUploadCv() {
  return useMutation<{ id: string }, Error, CvUploadInput>({
    mutationFn: ({ file, targetIndustry, fieldOfStudy }) =>
      api.upload('/cv/analyze', file, { targetIndustry, fieldOfStudy }),
  });
}

export function useCvAnalysis(id: string | null) {
  return useQuery({
    queryKey: ['cv-analysis', id],
    queryFn: () => api.get<any>(`/cv/analysis/${id}`),
    enabled: !!id,
    refetchInterval: (query) =>
      query.state.data?.status === 'processing' ? 2000 : false,
  });
}
