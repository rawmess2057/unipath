import { useCallback } from 'react';
import { useToggleTask } from './useRoadmap';
import { useScore } from './useScore';
import { useUcai } from '../stores/ucai';
import { useUi } from '../stores/ui';
import { streakOf } from './useStreak';
import { burstAt } from '../lib/fx';
import { toast } from '../lib/toast';
import type { Task } from '../lib/roadmap-stages';

/** Marks a roadmap task done with the prototype's fanfare (confetti, +pts toast, streak). */
export function useCompleteTask() {
  const toggle = useToggleTask();
  const { data: score } = useScore();
  const setPrev = useUi((s) => s.setPrevScore);

  const complete = useCallback(async (task: Task, el?: Element | null) => {
    if (task.done) return;
    setPrev(score?.totalScore ?? 0);
    try {
      await toggle.mutateAsync(task.id);
    } catch {
      setPrev(null);
      toast('That didn’t save. Check your connection and try again.');
      return;
    }
    const store = useUcai.getState();
    const bumped = store.markDayDone();
    const streak = streakOf(useUcai.getState().days);
    burstAt(el);
    toast(`${task.name.length > 34 ? 'Step complete' : task.name}${bumped ? ` · ${streak}-day streak` : ''}`, { pts: task.pts, key: 'done-' + task.id });
    window.setTimeout(() => useUi.getState().setPrevScore(null), 3000);
  }, [toggle, score?.totalScore, setPrev]);

  const uncomplete = useCallback(async (task: Task) => {
    if (!task.done) return;
    try { await toggle.mutateAsync(task.id); } catch { toast('That didn’t save. Try again.'); }
  }, [toggle]);

  return { complete, uncomplete, busy: toggle.isPending };
}
