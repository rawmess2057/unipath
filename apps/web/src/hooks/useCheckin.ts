import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api-client';
import type { CheckinSummary, WeeklyCheckinInput } from '@unipath/shared';

export function useCheckin() {
  return useQuery<CheckinSummary>({
    queryKey: ['checkin'],
    queryFn: () => api.get<CheckinSummary>('/checkin'),
  });
}

export function useSubmitCheckin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: WeeklyCheckinInput) => api.post<CheckinSummary>('/checkin', input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checkin'] });
      queryClient.invalidateQueries({ queryKey: ['score'] });
      queryClient.invalidateQueries({ queryKey: ['score-history'] });
    },
  });
}