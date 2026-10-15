import { useQuery, useMutation } from '@tanstack/react-query';
import type { CvUploadInput } from '../lib/api-client';
import { api } from '../lib/api-client';
import type { CvAnalysisResult } from '@unipath/shared';

/** What GET /cv/analysis/:id returns (the Prisma row minus the hidden quality score). */
export interface CvAnalysisRow {
  id: string;
  fileHash: string;
  originalFileName: string | null;
  extractedText: string | null;
  overallSummary: string | null;
  strengths: string[];
  priorityImprovements: string[];
  structureScore: number | null;
  keywordsScore: number | null;
  clarityScore: number | null;
  ukConventionsScore: number | null;
  confidence: string | null;
  complianceChecklist: CvAnalysisResult['uk_conventions']['compliance_checklist'] | null;
  rawResponse: CvAnalysisResult | null;
  isFallback: boolean;
  createdAt: string;
  status: 'completed' | 'processing';
}

export function useUploadCv() {
  return useMutation<{ id: string; cached?: boolean; status?: string }, Error, CvUploadInput>({
    mutationFn: ({ file, targetIndustry, fieldOfStudy }) =>
      api.upload('/cv/analyze', file, { targetIndustry, fieldOfStudy }),
  });
}

export function useCvAnalysis(id: string | null) {
  return useQuery<CvAnalysisRow>({
    queryKey: ['cv-analysis', id],
    queryFn: () => api.get<CvAnalysisRow>(`/cv/analysis/${id}`),
    enabled: !!id,
    refetchInterval: (query) => (query.state.data?.status === 'processing' ? 2000 : false),
  });
}

export function useLatestCvAnalysis(enabled: boolean) {
  return useQuery<CvAnalysisRow | null>({
    queryKey: ['cv-analysis', 'latest'],
    queryFn: () => api.get<CvAnalysisRow | null>('/cv/analysis/latest'),
    enabled,
  });
}
