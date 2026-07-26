import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '../lib/api-client';

export function useUploadCv() {
  return useMutation({
    mutationFn: ({ file, targetIndustry, fieldOfStudy }: { file: File; targetIndustry: string; fieldOfStudy: string }) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('targetIndustry', targetIndustry);
      formData.append('fieldOfStudy', fieldOfStudy);
      return fetch('/api/cv/analyze', { method: 'POST', body: formData }).then((r) => r.json());
    },
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
