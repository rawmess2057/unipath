import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api-client';

export function useRoadmap() {
  return useQuery({
    queryKey: ['roadmap'],
    queryFn: () => api.get<any>('/roadmap'),
  });
}

export function useGenerateRoadmap() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.post('/roadmap/generate', {}),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['roadmap'] }),
  });
}

export function useToggleTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (taskId: string) => api.patch(`/roadmap/tasks/${taskId}/complete`, {}),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['roadmap'] });
      qc.invalidateQueries({ queryKey: ['score'] });
    },
  });
}
