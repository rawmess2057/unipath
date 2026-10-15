import { useEffect, useRef, useState } from 'react';
import { PageHead } from '../ui/PageHead';
import { Btn } from '../ui/Btn';
import { Icon } from '../ui/Icon';
import { Chip } from '../ui/Chip';
import { Gate } from '../ui/Gate';
import { Bar } from '../ui/Bar';
import { useUcai } from '../stores/ucai';
import { useRoadmapView } from '../hooks/useRoadmapView';
import { useCompleteTask } from '../hooks/useCompleteTask';
import { QUESTIONS, EXAMPLE_ANSWER, EMPTY_STAR, starFeedback, starSignature, type StarAnswer } from '../lib/interview';
import { wordCount } from '../lib/dates';
import { toast } from '../lib/toast';
import { burst } from '../lib/fx';

function useTimer() {
  const [left, setLeft] = useState(120);
  const [running, setRunning] = useState(false);
  const id = useRef<number | null>(null);
  const stop = () => { if (id.current) window.clearInterval(id.current); id.current = null; setRunning(false); };
  const start = () => {
    setLeft(120); setRunning(true);
    id.current = window.setInterval(() => setLeft((l) => {
      if (l <= 1) { stop(); toast('Time’s up. Wrap up your result.'); return 0; }
      return l - 1;
    }), 1000);
  };
  useEffect(() => () => stop(), []);
  return { left, running, start, stop };
}

export function InterviewPage() {
  const ivQ = useUcai((s) => s.ivQ);
  const star = useUcai((s) => s.star);
  const ivLast = useUcai((s) => s.ivLast);
  const ivSeen = useUcai((s) => s.ivSeen);
  const practised = useUcai((s) => s.practised);
  const premium = useUcai((s) => s.premium);
  const patch = useUcai((s) => s.patch);
  const { tasks } = useRoadmapView();
  const { complete } = useCompleteTask();
  const timer = useTimer();
  const q = QUESTIONS[ivQ] ?? QUESTIONS[0];
  const n = Math.min(practised, 5);

  const setStar = (k: keyof StarAnswer, v: string) => patch({ star: { ...star, [k]: v } });

  const feedback = (el: HTMLButtonElement) => {
    const items = starFeedback(star), ok = items.filter((x) => x.ok).length;
    const sig = starSignature(star);
    const fresh = ok === 4 && !ivSeen.includes(sig);
    const practisedNext = fresh ? practised + 1 : practised;
    patch({ ivLast: { q: ivQ, items, repeat: ok === 4 && !fresh }, ivSeen: fresh ? [...ivSeen, sig] : ivSeen, practised: practisedNext });
    if (fresh) {
      useUcai.getState().markDayDone();
      const t = tasks.find((x) => !x.done && /STAR|interview/i.test(x.name));
      if (practisedNext >= 5 && t) { void complete(t, el); return; }
      const r = el.getBoundingClientRect(); burst(r.left + 60, r.top, 50);
      toast(`Answer ${Math.min(practisedNext, 5)} of 5 practised`, { key: 'practised' });
    }
  };

  const field = (k: keyof StarAnswer, L: string, label: string, hint: string) => (
    <div>
      <label htmlFor={`iv-${k}`}><span><i className="star-letter">{L}</i>{label}</span><span>{wordCount(star[k])} words</span></label>
      <textarea id={`iv-${k}`} placeholder={hint} value={star[k]} onChange={(e) => setStar(k, e.target.value)} />
    </div>
  );

  const fb = () => {
    const L = ivLast;
    if (!L || L.q !== ivQ) return <><p className="eyebrow">Feedback</p><h2 className="h2">Write your answer, then ask for feedback</h2><p className="muted small" style={{ margin: '8px 0 0' }}>We check STAR structure, balance and whether your result is measurable.</p></>;
    const ok = L.items.filter((x) => x.ok).length;
    return (
      <>
        <div className="card-head" style={{ marginBottom: 12 }}><p className="eyebrow" style={{ margin: 0 }}>Feedback</p><Chip tone={ok === 4 ? 'good' : ok >= 2 ? 'amber' : 'bad'} className="num">{ok}/4</Chip></div>
        <h2 className="h2" style={{ marginBottom: 14 }}>{ok === 4 ? 'Strong STAR answer.' : ok >= 2 ? 'Good bones. A couple of tweaks to go.' : 'Let’s build this out.'}</h2>
        <div className="fb-list">{L.items.map((x, i) => <div className={`fb-item ${x.ok ? 'ok' : 'no'}`} key={i}><span className="mark"><Icon name={x.ok ? 'check' : 'x'} sm /></span><span>{x.ok ? x.good : x.bad}</span></div>)}</div>
        {L.repeat && <p className="small" style={{ margin: '14px 0 0', color: 'var(--amber-ink)' }}>This answer already counts towards your 5. Try a different story to add another.</p>}
        <p className="small muted" style={{ margin: '14px 0 0' }}>Feedback uses structural checks. The full product reviews content too.</p>
      </>
    );
  };

  const content = (
    <div className="iv-grid">
      <div style={{ minWidth: 0 }}>
        <div className="q-tabs">{QUESTIONS.map((x, i) => <button key={x.type} className="f-btn" aria-pressed={ivQ === i} onClick={() => { patch({ ivQ: i }); timer.stop(); }}>{x.type}</button>)}</div>
        <section className="q-card">
          <p className="eyebrow">Question {ivQ + 1} of {QUESTIONS.length} · Competency</p>
          <h2>{q.q}</h2>
          <div className="timer"><b>{Math.floor(timer.left / 60)}:{String(timer.left % 60).padStart(2, '0')}</b><Btn size="sm" onClick={() => (timer.running ? timer.stop() : timer.start())}>{timer.running ? <><Icon name="x" sm />Stop</> : <><Icon name="timer" sm />Start 2-minute timer</>}</Btn></div>
        </section>
        <div className="star">
          {field('s', 'S', 'Situation', 'Set the scene in one or two sentences')}
          {field('t', 'T', 'Task', 'What were you responsible for?')}
          {field('a', 'A', 'Action', 'What did you do? Use “I”, not “we”')}
          {field('r', 'R', 'Result', 'What happened? Include a number')}
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 16 }}>
          <Btn variant="primary" onClick={(e) => feedback(e.currentTarget)}><Icon name="spark" />Get feedback</Btn>
          <Btn onClick={() => patch({ star: { ...EXAMPLE_ANSWER } })}>Load example answer</Btn>
          <Btn variant="ghost" onClick={() => patch({ star: { ...EMPTY_STAR }, ivLast: null })}>Clear</Btn>
        </div>
      </div>
      <div style={{ display: 'grid', gap: 18, alignContent: 'start', minWidth: 0 }}>
        <section className="card">{fb()}</section>
        <section className="card">
          <div className="card-head" style={{ marginBottom: 10 }}><h2 className="h3">Practice towards your roadmap</h2><Chip tone="teal" className="num">{n}/5</Chip></div>
          <Bar value={n * 20} />
          <p className="small muted" style={{ margin: '10px 0 0' }}>Five different answers with full marks completes your STAR practice roadmap step.</p>
        </section>
      </div>
    </div>
  );

  return (
    <>
      <PageHead eyebrow="Grow" title="Mock interview" lede="Practise competency questions UK graduate employers ask, using the STAR method." right={premium ? <Chip tone="indigo"><Icon name="spark" sm />Premium</Chip> : undefined} />
      <Gate title="Practise with an AI interviewer" body="Mock interviews are part of Premium: timed questions, STAR feedback and progress that counts towards your roadmap.">{content}</Gate>
    </>
  );
}
