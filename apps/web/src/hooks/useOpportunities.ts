import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api-client';
import type { Opportunity, OpportunityStatus, OpportunityEmploymentType } from '@unipath/shared';

export interface OpportunityFilters {
  industry?: string;
  employmentType?: OpportunityEmploymentType;
  visaSuitable?: boolean;
  saved?: boolean;
}

export function useOpportunities(filters: OpportunityFilters = {}) {
  const params = new URLSearchParams();
  if (filters.industry) params.set('industry', filters.industry);
  if (filters.employmentType) params.set('employmentType', filters.employmentType);
  if (filters.visaSuitable) params.set('visaSuitable', '1');
  if (filters.saved) params.set('saved', '1');
  const qs = params.toString();

  return useQuery<Opportunity[]>({
    queryKey: ['opportunities', qs],
    queryFn: () => api.get<Opportunity[]>(qs ? `/opportunities?${qs}` : '/opportunities'),
  });
}

export function useOpportunityStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: OpportunityStatus }) =>
      api.patch<{ id: string; status: OpportunityStatus }>(`/opportunities/${id}/status`, { status }),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
      if (vars.status === 'applied') {
        queryClient.invalidateQueries({ queryKey: ['score'] });
      }
    },
  });
}