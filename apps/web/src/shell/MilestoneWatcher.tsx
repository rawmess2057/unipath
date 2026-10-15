import { useEffect } from 'react';
import { useScore } from '../hooks/useScore';
import { useRoadmapView } from '../hooks/useRoadmapView';
import { useStreak } from '../hooks/useStreak';
import { useUcai } from '../stores/ucai';
import { useUi } from '../stores/ui';
import { MILESTONES, type MilestoneCtx } from '../lib/milestones';
import { burst } from '../lib/fx';

/** Evaluates milestone tests against live data; unlocks silently on first run, with a modal afterwards. */
export function MilestoneWatcher() {
  const { data: score, isSuccess } = useScore();
  const { stages, done, loading } = useRoadmapView();
  const { streak } = useStreak();
  const unlocked = useUcai((s) => s.unlocked);
  const seeded = useUcai((s) => s.milestonesSeeded);
  const cvAnalysisId = useUcai((s) => s.cvAnalysisId);
  const patch = useUcai((s) => s.patch);
  const layer = useUi((s) => s.layer);
  const setLayer = useUi((s) => s.setLayer);

  useEffect(() => {
    if (!isSuccess || loading) return;
    const ctx: MilestoneCtx = {
      score: score?.totalScore ?? 0,
      cvQuality: score?.components.cvQuality ?? 0,
      hasCv: !!cvAnalysisId || (score?.weights.cvQuality ?? 0) > 0,
      streak,
      anyDone: done > 0,
      anyStageComplete: stages.some((s) => s.complete),
    };
    const fresh = MILESTONES.filter((m) => !unlocked.includes(m.id) && m.test(ctx)).map((m) => m.id);
    if (!seeded) { patch({ unlocked: [...unlocked, ...fresh], milestonesSeeded: true }); return; }
    if (!fresh.length || layer) return;
    patch({ unlocked: [...unlocked, ...fresh] });
    const t = setTimeout(() => {
      setLayer({ kind: 'milestone', id: fresh[0] });
      burst(window.innerWidth / 2, window.innerHeight / 2 - 60, 140);
    }, 1400);
    return () => clearTimeout(t);
  }, [isSuccess, loading, score, stages, done, streak, unlocked, seeded, cvAnalysisId, layer, patch, setLayer]);

  return null;
}
