import { useRef } from 'react';
import { Icon } from '../../ui/Icon';
import { Chip } from '../../ui/Chip';
import { Btn } from '../../ui/Btn';
import { Medal } from '../../ui/Medal';
import { WeekDots } from '../../ui/WeekDots';
import { useStreak } from '../../hooks/useStreak';
import { useRoadmapView } from '../../hooks/useRoadmapView';
import { useCompleteTask } from '../../hooks/useCompleteTask';
import { useUcai } from '../../stores/ucai';
import { useUi } from '../../stores/ui';
import { fmtMins } from '../../lib/dates';

export function TodayCard() {
  const { streak, doneToday, days } = useStreak();
  const { today: t, pending, hasRoadmap } = useRoadmapView();
  const { complete, busy } = useCompleteTask();
  const skip = useUcai((s) => s.skip);
  const patch = useUcai((s) => s.patch);
  const setLayer = useUi((s) => s.setLayer);
  const btn = useRef<HTMLButtonElement>(null);

  const line = doneToday ? 'Today counted. See you tomorrow.' : streak ? `Complete a step today to make it ${streak + 1}.` : days.length ? 'Your streak reset. Start a new one today.' : 'Complete a step to start your streak.';
  const row = (
    <div className="streak-row">
      <div>
        <div className="streak-num"><Icon name="flame" /><span className="num">{streak}</span><small>day streak</small></div>
        <span className="small muted">{line} <button className="link" style={{ fontSize: 13 }} onClick={() => setLayer({ kind: 'checkin' })}>Log this week</button></span>
      </div>
      <WeekDots days={days} />
    </div>
  );

  if (pending && !hasRoadmap) {
    return (
      <div className="card today s5">
        <div className="today-top"><div className="bearing"><div className="bearing-ico"><Icon name="compass" /></div><div><p className="eyebrow" style={{ margin: 0 }}>Today’s bearing</p><span className="small muted">Plotting your route</span></div></div></div>
        <h2 className="task-title">Building your roadmap…</h2>
        <p className="task-why">Your four stages are being drawn up around your course and target role. This takes a few seconds.</p>
        <div className="bar"><i style={{ width: '60%' }} /></div>
        {row}
      </div>
    );
  }

  if (!t) {
    return (
      <div className="card today s5">
        <div className="all-done">
          <Medal id="m6" className="big-medal" />
          <h2 className="h2">{hasRoadmap ? 'Every step is done' : 'No roadmap yet'}</h2>
          <p className="muted" style={{ margin: 0 }}>{hasRoadmap ? 'Your roadmap is clear. Keep applying and practising.' : 'Generate your roadmap to get a daily step.'}</p>
          {!hasRoadmap && <Btn size="sm" to="/roadmap">Open roadmap</Btn>}
        </div>
        {row}
      </div>
    );
  }

  if (doneToday) {
    return (
      <div className="card today is-done s5">
        <div className="today-top"><div className="bearing"><div className="bearing-ico"><Icon name="check" /></div><div><p className="eyebrow" style={{ margin: 0 }}>Today’s bearing</p><span className="small muted">Done for today</span></div></div><Chip tone="good">Streak safe</Chip></div>
        <h2 className="task-title">Nice work. That’s today done.</h2>
        <p className="task-why">Tomorrow’s bearing: <b style={{ color: 'var(--fg)' }}>{t.name}</b></p>
        <div className="task-meta"><Chip tone="teal">+{t.pts} pts</Chip><Chip><Icon name="clock" sm />{fmtMins(t.mins)}</Chip></div>
        <div className="today-actions">
          <Btn ref={btn} disabled={busy} onClick={() => complete(t, btn.current)}>Get ahead: do it now</Btn>
          <Btn variant="ghost" to="/roadmap">See your roadmap</Btn>
        </div>
        {row}
      </div>
    );
  }

  return (
    <div className="card today s5">
      <div className="today-top"><div className="bearing"><div className="bearing-ico"><Icon name="compass" /></div><div><p className="eyebrow" style={{ margin: 0 }}>Today’s bearing</p><span className="small muted">One step, picked for you</span></div></div><Chip tone="teal">+{t.pts} pts</Chip></div>
      <h2 className="task-title">{t.name}</h2>
      <p className="task-why">{t.why || t.sub}</p>
      <div className="task-meta"><Chip><Icon name="clock" sm />{fmtMins(t.mins)}</Chip>{t.stage === 's1' && <Chip tone="indigo">Find your bearings</Chip>}</div>
      <div className="today-actions">
        <Btn ref={btn} variant="primary" disabled={busy} onClick={() => complete(t, btn.current)}><Icon name="check" />Mark as done</Btn>
        <Btn variant="ghost" onClick={() => patch({ skip: skip + 1 })}>Show another</Btn>
      </div>
      {row}
    </div>
  );
}
