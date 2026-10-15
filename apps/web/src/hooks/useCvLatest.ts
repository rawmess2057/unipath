import { useEffect } from 'react';
import { useCvAnalysis, useLatestCvAnalysis, type CvAnalysisRow } from './useCvAnalysis';
import { useUcai } from '../stores/ucai';
import { analyseText } from '../lib/cv-analyser';

/**
 * The student's current CV analysis: the one recorded locally after an upload,
 * else the newest on the server. Keeps the local store (id, file name, text
 * analysis for Word check) in step with it.
 */
export function useCvLatest(): { analysis: CvAnalysisRow | null; isLoading: boolean } {
  const id = useUcai((s) => s.cvAnalysisId);
  const cv = useUcai((s) => s.cv);
  const patch = useUcai((s) => s.patch);
  const byId = useCvAnalysis(id);
  const latest = useLatestCvAnalysis(!id);
  const analysis = (id ? byId.data : latest.data) ?? null;

  useEffect(() => {
    if (!id && latest.data?.id) patch({ cvAnalysisId: latest.data.id, cvFile: latest.data.originalFileName ?? 'your CV' });
  }, [id, latest.data, patch]);

  useEffect(() => {
    if (analysis?.extractedText && !cv) patch({ cv: analyseText(analysis.extractedText, 'pdf') });
  }, [analysis, cv, patch]);

  // A stale local id (deleted on the server) falls back to the latest.
  useEffect(() => {
    if (id && byId.isError) patch({ cvAnalysisId: null });
  }, [id, byId.isError, patch]);

  return { analysis, isLoading: id ? byId.isLoading : latest.isLoading };
}
