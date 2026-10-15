import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api-client';
import type { ApiRoadmap } from '../lib/roadmap-stages';

export function useRoadmap(opts: { refetchInterval?: number | false } = {}) {
  return useQuery<ApiRoadmap | null>({
    queryKey: ['roadmap'],
    queryFn: () => api.get<ApiRoadmap | null>('/roadmap'),
    refetchInterval: opts.refetchInterval ?? false,
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
      qc.invalidateQueries({ queryKey: ['score-history'] });
    },
  });
}
