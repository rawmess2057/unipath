import { useRef } from 'react';
import { PageHead } from '../ui/PageHead';
import { Btn } from '../ui/Btn';
import { Icon } from '../ui/Icon';
import { Chip } from '../ui/Chip';
import { useRoadmapView } from '../hooks/useRoadmapView';
import { useCompleteTask } from '../hooks/useCompleteTask';
import { useGenerateRoadmap } from '../hooks/useRoadmap';
import { useProfile } from '../hooks/useProfile';
import { useUcai, regenLeft } from '../stores/ucai';
import { useUi } from '../stores/ui';
import { monthYearLong, todayStr } from '../lib/dates';
import { toast } from '../lib/toast';
import type { Task } from '../lib/roadmap-stages';

function TaskRow({ t }: { t: Task }) {
  const { complete, uncomplete, busy } = useCompleteTask();
  const btn = useRef<HTMLButtonElement>(null);
  return (
    <div className={`task${t.done ? ' done' : ''}`}>
      <button ref={btn} className="tick" aria-pressed={t.done} disabled={busy} aria-label={`${t.done ? 'Mark not done' : 'Mark done'}: ${t.name}`} onClick={() => (t.done ? uncomplete(t) : complete(t, btn.current))}><Icon name="check" sm /></button>
      <div>
        <div className="t-name">{t.name}</div>
        <div className="t-sub">{t.sub}</div>
        {t.visa && <div className="small muted" style={{ marginTop: 6, paddingLeft: 10, borderLeft: '2px solid var(--line)', whiteSpace: 'pre-line' }}>{t.visa}</div>}
      </div>
      <span className="pts">+{t.pts}</span>
    </div>
  );
}

export function RoadmapPage() {
  const rv = useRoadmapView();
  const { data: profile } = useProfile();
  const gen = useGenerateRoadmap();
  const premium = useUcai((s) => s.premium);
  const regen = useUcai((s) => s.regen);
  const regenMonth = useUcai((s) => s.regenMonth);
  const role = useUcai((s) => s.role);
  const patch = useUcai((s) => s.patch);
  const setRegenPending = useUi((s) => s.setRegenPending);
  const left = regenLeft({ regen, regenMonth, premium });
  const grad = monthYearLong(profile?.graduationDate);
  const roadRef = useRef<HTMLDivElement>(null);

  const regenerate = async () => {
    if (left <= 0) return;
    if (!premium) patch({ regen: Math.max(0, (regenMonth === todayStr().slice(0, 7) ? regen : 1) - 1), regenMonth: todayStr().slice(0, 7) });
    roadRef.current?.querySelectorAll<HTMLElement>('.stage-card').forEach((c, i) => {
      c.style.transition = 'opacity .3s, transform .3s'; c.style.opacity = '.3'; c.style.transform = 'translateX(8px)';
      setTimeout(() => { c.style.opacity = ''; c.style.transform = ''; }, 300 + i * 120);
    });
    try {
      await gen.mutateAsync();
      setRegenPending(true);
      toast(`Roadmap being recalculated for ${role}`);
    } catch { toast('Couldn’t regenerate right now. Try again in a moment.'); }
  };

  const regenNote = premium ? 'Unlimited regenerations with Premium' : left > 0 ? `${left} free regeneration left this month` : 'Next free regeneration next month';
  let activeFound = false;

  return (
    <>
      <PageHead eyebrow="Grow" title="Your roadmap" lede={<>Four stages from now to offer{grad ? `, built around your graduation in ${grad}` : ''}. Each step moves your Employability Score.</>}
        right={<div style={{ display: 'grid', gap: 6, justifyItems: 'end' }}><Btn onClick={regenerate} disabled={left <= 0 || gen.isPending || rv.pending}><Icon name="refresh" />Regenerate roadmap</Btn><span className="small muted">{regenNote}</span></div>} />
      {rv.pending && !rv.hasRoadmap ? (
        <section className="card"><h2 className="h2" style={{ marginTop: 0 }}>Building your roadmap…</h2><p className="muted">Your four stages are being drawn up around your course, target role and visa route. This takes a few seconds.</p><div className="bar"><i style={{ width: '60%' }} /></div></section>
      ) : !rv.hasRoadmap ? (
        <section className="card"><h2 className="h2" style={{ marginTop: 0 }}>No roadmap yet</h2><p className="muted">Generate your personal four-stage plan from your profile.</p><Btn variant="primary" onClick={regenerate} style={{ marginTop: 14 }}><Icon name="route" />Generate my roadmap</Btn></section>
      ) : (
        <div className="road" ref={roadRef}>
          {rv.stages.map((s, i) => {
            const active = !s.complete && !activeFound && s.total > 0; if (active) activeFound = true;
            return (
              <div className={`stage${s.complete ? ' complete' : ''}${active ? ' active' : ''}`} key={s.id}>
                <div className="stage-rail"><div className="stage-dot">{s.complete ? <Icon name="check" /> : `0${i + 1}`}</div><div className="stage-line" /></div>
                <section className="card stage-card">
                  <div className="card-head"><div><p className="eyebrow" style={{ margin: 0 }}>{s.when}{active ? ' · You are here' : ''}</p><h2 className="h2">{s.name}</h2></div><Chip tone={s.complete ? 'good' : active ? 'teal' : ''} className="num">{s.done}/{s.total}</Chip></div>
                  {s.tasks.length ? s.tasks.map((t) => <TaskRow t={t} key={t.id} />) : <p className="small muted" style={{ margin: 0 }}>No steps in this stage of your roadmap yet.</p>}
                </section>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
