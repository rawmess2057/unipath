/* Maps the API's 3-phase roadmap onto the prototype's 4-stage rail. */

export interface ApiTask {
  id: string;
  phase: 'foundation' | 'preparation' | 'application' | string;
  order: number;
  title: string;
  description: string;
  category: string;
  estimatedEffort: string;
  pointsValue: number;
  isVisaRelated: boolean;
  completed: boolean;
  completedAt?: string | null;
}

export interface ApiRoadmap {
  id: string;
  tasks: ApiTask[];
}

export interface Task {
  id: string;
  name: string;
  /** Short description (before the visa separator). */
  sub: string;
  /** Visa snippet, when the task is visa related. */
  visa: string | null;
  /** First sentence of the description, used for "why" on the Today card. */
  why: string;
  pts: number;
  /** Minutes, or a label when the effort is not in minutes. */
  mins: number | string;
  done: boolean;
  stage: string;
}

export interface Stage {
  id: 's1' | 's2' | 's3' | 's4';
  name: string;
  when: string;
  tasks: Task[];
  done: number;
  total: number;
  complete: boolean;
}

const STAGE_NAMES = { s1: 'Find your bearings', s2: 'Build proof', s3: 'Apply', s4: 'Interview' } as const;
const INTERVIEWISH = /interview|STAR|mock|assessment|follow[- ]up|thank-you|thank you/i;

const EFFORT_MINS: Record<string, number | string> = {
  '1_hour': 60, half_day: 240, '1_day': 480, '1_week': '1 week', ongoing: 'Ongoing',
};

const mon = (d: Date) => d.toLocaleDateString('en-GB', { month: 'short' });
const addMonths = (d: Date, n: number) => { const x = new Date(d); x.setMonth(x.getMonth() + n); return x; };

function whenLabels(graduation: string | null | undefined): Record<Stage['id'], string> {
  const now = new Date();
  const g = graduation ? new Date(graduation) : null;
  const valid = g && !Number.isNaN(g.getTime()) && g > now;
  const s1 = mon(now);
  const s2 = `${mon(addMonths(now, 1))} – ${mon(addMonths(now, 2))}`;
  if (!valid) return { s1, s2, s3: 'Then', s4: 'Before you graduate' };
  const s3a = addMonths(g!, -6), s3b = addMonths(g!, -3), s4a = addMonths(g!, -3);
  const s3 = s3a > addMonths(now, 2) ? `${mon(s3a)} – ${mon(s3b)}` : 'Now';
  const s4 = s4a > addMonths(now, 2) ? `${mon(s4a)} – ${mon(g!)}` : 'Before you graduate';
  return { s1, s2, s3, s4 };
}

export function toTask(t: ApiTask, stage: string): Task {
  const [desc, ...rest] = (t.description || '').split(/\n\s*---\s*\n/);
  const sub = desc.trim();
  const why = (sub.match(/^[^.!?]+[.!?]/) || [sub])[0].trim();
  return {
    id: t.id, name: t.title, sub, visa: rest.length ? rest.join('\n').trim() : null, why,
    pts: t.pointsValue, mins: EFFORT_MINS[t.estimatedEffort] ?? 60, done: !!t.completed, stage,
  };
}

export function buildStages(roadmap: ApiRoadmap | null | undefined, graduation?: string | null): Stage[] {
  const when = whenLabels(graduation);
  const buckets: Record<Stage['id'], Task[]> = { s1: [], s2: [], s3: [], s4: [] };
  const tasks = [...(roadmap?.tasks ?? [])].sort((a, b) => a.order - b.order);
  for (const t of tasks) {
    const id: Stage['id'] = t.phase === 'foundation' ? 's1' : t.phase === 'preparation' ? 's2' : INTERVIEWISH.test(t.title) ? 's4' : 's3';
    buckets[id].push(toTask(t, id));
  }
  return (['s1', 's2', 's3', 's4'] as const).map((id) => {
    const ts = buckets[id], done = ts.filter((x) => x.done).length;
    return { id, name: STAGE_NAMES[id], when: when[id], tasks: ts, done, total: ts.length, complete: ts.length > 0 && done === ts.length };
  });
}

export const allTasks = (stages: Stage[]) => stages.flatMap((s) => s.tasks);

/** Today's bearing: the open task picked by the skip counter. */
export function todayTask(stages: Stage[], skip: number): Task | null {
  const open = allTasks(stages).filter((t) => !t.done);
  return open.length ? open[skip % open.length] : null;
}
