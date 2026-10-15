import { useEffect, useMemo } from 'react';
import { useRoadmap } from './useRoadmap';
import { useProfile } from './useProfile';
import { useUcai } from '../stores/ucai';
import { useUi } from '../stores/ui';
import { buildStages, allTasks, todayTask, type Stage, type Task } from '../lib/roadmap-stages';

export interface RoadmapView {
  stages: Stage[];
  tasks: Task[];
  done: number;
  total: number;
  today: Task | null;
  /** True while the first load or a regeneration is in flight. */
  pending: boolean;
  loading: boolean;
  hasRoadmap: boolean;
}

export function useRoadmapView(): RoadmapView {
  const regenPending = useUi((s) => s.regenPending);
  const setRegenPending = useUi((s) => s.setRegenPending);
  const { data, isLoading } = useRoadmap({ refetchInterval: regenPending ? 2000 : false });
  const { data: profile } = useProfile();
  const skip = useUcai((s) => s.skip);

  useEffect(() => {
    if (regenPending && data) setRegenPending(false);
  }, [regenPending, data, setRegenPending]);

  return useMemo(() => {
    const stages = buildStages(data ?? null, profile?.graduationDate ?? null);
    const tasks = allTasks(stages);
    return {
      stages, tasks,
      done: tasks.filter((t) => t.done).length,
      total: tasks.length,
      today: todayTask(stages, skip),
      pending: isLoading || (regenPending && !data),
      loading: isLoading,
      hasRoadmap: !!data,
    };
  }, [data, profile?.graduationDate, skip, isLoading, regenPending]);
}
