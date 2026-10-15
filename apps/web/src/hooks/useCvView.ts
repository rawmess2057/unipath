import { useEffect, useMemo } from 'react';
import { useCvLatest } from './useCvLatest';
import { useScore } from './useScore';
import { useUcai } from '../stores/ucai';
import { buildCvView, snapshotVersion, type CvView } from '../lib/cv-view';

/** The feedback view for the current CV, plus version bookkeeping. */
export function useCvView(): { view: CvView | null; isLoading: boolean; processing: boolean; hasAnalysis: boolean } {
  const { analysis, isLoading } = useCvLatest();
  const { data: score } = useScore();
  const acks = useUcai((s) => s.cvAcks);
  const versions = useUcai((s) => s.cvVersions);
  const cv = useUcai((s) => s.cv);
  const patch = useUcai((s) => s.patch);
  const cvQuality = score?.components.cvQuality ?? 0;

  const view = useMemo(() => buildCvView(analysis, cvQuality, acks), [analysis, cvQuality, acks]);

  // Record a version the first time a completed analysis is seen.
  useEffect(() => {
    if (!view || !score) return;
    if (versions.some((v) => v.analysisId === view.analysisId)) return;
    const clean = buildCvView(analysis, cvQuality, []);
    if (!clean) return;
    patch({ cvVersions: [...versions, snapshotVersion(clean, cv?.words ?? null)].slice(-12), cvAcks: [] });
  }, [view, score, versions, analysis, cvQuality, cv?.words, patch]);

  return { view, isLoading, processing: analysis?.status === 'processing', hasAnalysis: !!analysis };
}
