import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Dial } from '../ui/Dial';
import { Spark } from '../ui/Spark';
import { Ring } from '../ui/Ring';
import { Medal } from '../ui/Medal';
import { Icon } from '../ui/Icon';
import { Chip } from '../ui/Chip';
import { Btn } from '../ui/Btn';
import { Bar } from '../ui/Bar';
import { CountUp } from '../ui/CountUp';
import { TodayCard } from './dashboard/TodayCard';
import { useScore } from '../hooks/useScore';
import { useScoreHistory } from '../hooks/useScoreHistory';
import { useRoadmapView } from '../hooks/useRoadmapView';
import { useAllJobs } from '../hooks/useJobsView';
import { useUserName } from '../hooks/useUserName';
import { useCvLatest } from '../hooks/useCvLatest';
import { useUcai } from '../stores/ucai';
import { useUi } from '../stores/ui';
import { band, nextBand, bandProgress, cvBand, greet } from '../lib/score';
import { dateLong } from '../lib/dates';
import { MILESTONES } from '../lib/milestones';

let firstPaint = true;

export function DashboardPage() {
  const { data: score } = useScore();
  const { data: history } = useScoreHistory();
  const rv = useRoadmapView();
  const { jobs } = useAllJobs();
  const { first } = useUserName();
  const { analysis } = useCvLatest();
  const role = useUcai((s) => s.role);
  const start = useUcai((s) => s.start);
  const unlocked = useUcai((s) => s.unlocked);
  const cvFile = useUcai((s) => s.cvFile);
  const prevScore = useUi((s) => s.prevScore);
  const [from] = useState<number | null>(() => (firstPaint ? 0 : null));
  useEffect(() => { firstPaint = false; }, []);

  const sc = score?.totalScore ?? 0;
  const nb = nextBand(sc);
  const animateFrom = prevScore ?? from;
  const points = (history?.points ?? []).map((p) => p.totalScore);
  const sparkVals = points.length >= 2 ? (points[points.length - 1] === sc ? points : [...points, sc]) : null;
  const sinceStart = start ? sc - start.score : null;
  const delta = sparkVals ? (history?.weekDelta ?? 0) : (sinceStart ?? 0);
  const deltaLabel = sparkVals ? 'This week' : 'Since you started';
  const deltaTxt = (delta > 0 ? '+' : delta < 0 ? '−' : '') + Math.abs(delta);
  const hasCv = (score?.weights.cvQuality ?? 0) > 0 || !!analysis;
  const cvQ = Math.round(score?.components.cvQuality ?? 0);
  const topMatch = jobs[0]?.match;
  const top = jobs.slice(0, 3);

  return (
    <>
      <section className="greet">
        <div>
          <p className="eyebrow">{dateLong()}</p>
          <h1 className="h1">{greet()}, {first || 'there'}.</h1>
          <p className="lede">You’re heading for <b style={{ color: 'var(--fg)' }}>{role}</b> roles. {rv.today ? 'One small step today keeps the needle moving.' : rv.hasRoadmap ? 'Every step is done.' : 'Your roadmap is on its way.'}</p>
        </div>
      </section>
      <div className="bento">
        <section className="hero s7" aria-label="Employability Score">
          <div className="hero-grid">
            <Dial value={sc} animateFrom={animateFrom} />
            <div style={{ minWidth: 0 }}>
              <p className="eyebrow">Employability Score</p>
              <div className="big-score"><CountUp to={sc} from={animateFrom} className="" /><small>/100</small></div>
              <div className="band-pill"><i />{band(sc)}</div>
              <div className="next-band">
                <Bar value={bandProgress(sc)} />
                <p>{sc >= 80 ? 'You’re Job-ready. Every extra step strengthens your applications.' : <><b className="num" style={{ color: 'var(--hero-fg)' }}>{nb.at - sc}</b> points to <b style={{ color: 'var(--hero-fg)' }}>{nb.name}</b></>}</p>
              </div>
            </div>
          </div>
          {sparkVals ? <Spark vals={sparkVals} /> : (
            <p style={{ margin: '16px 0 0', color: 'var(--hero-muted)', fontSize: 13.5 }}>Starting point: <b style={{ color: 'var(--hero-fg)' }}>{start ? start.score : sc}</b>. Every step you finish moves the needle.</p>
          )}
          <div className="hero-meta">
            <div><span>{deltaLabel}</span><b className={delta > 0 ? 'up' : ''}>{deltaTxt}</b></div>
            <div><span>CV quality</span><b>{hasCv ? cvQ : '—'}</b></div>
            <div><span>Roadmap</span><b>{rv.hasRoadmap ? `${rv.done}/${rv.total} steps` : 'Building…'}</b></div>
            <div><span>Top match</span><b>{topMatch != null ? `${topMatch}%` : '—'}</b></div>
          </div>
          <div className="hero-actions">
            <Btn variant="primary" to="/roadmap">See what moves it <Icon name="arrow" /></Btn>
            <Btn to="/badge"><Icon name="share" />Share badge</Btn>
          </div>
        </section>

        <TodayCard />

        <section className="card s7">
          <div className="card-head">
            <div><h2 className="h2">Your roadmap</h2><span className="small muted">{role}</span></div>
            <Link className="link" to="/roadmap">Open <Icon name="arrow" sm /></Link>
          </div>
          <div className="stages-mini">
            {rv.stages.map((s) => (
              <div className="stage-mini" key={s.id}>
                <b>{s.name}</b>
                <Bar value={s.total ? (s.done / s.total) * 100 : 0} />
                <span>{s.when} · {s.done}/{s.total}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="card s5">
          <div className="card-head"><h2 className="h2">CV quality</h2><Link className="link" to={hasCv ? '/feedback' : '/upload'}>{hasCv ? 'Feedback' : 'Upload'} <Icon name="arrow" sm /></Link></div>
          <div className="cv-mini">
            <div className="score-sq num">{hasCv ? cvQ : '—'}</div>
            <div style={{ minWidth: 0 }}>
              {hasCv ? <Chip tone={cvQ >= 75 ? 'good' : 'amber'}>{cvBand(cvQ)}</Chip> : <Chip>No CV yet</Chip>}
              <p style={{ margin: '8px 0 0', fontWeight: 600 }}>{hasCv ? (analysis?.priorityImprovements?.[0] ? `Fix this first: ${analysis.priorityImprovements[0]}` : 'See your feedback') : 'Upload your CV to get a score and your first fix.'}</p>
              <span className="small muted">{cvFile || analysis?.originalFileName || 'No CV uploaded yet'}</span>
            </div>
          </div>
        </section>

        <section className="card s7">
          <div className="card-head"><h2 className="h2">Best matches this week</h2><Link className="link" to="/jobs">All jobs <Icon name="arrow" sm /></Link></div>
          {top.length ? top.map((j) => (
            <div className="job-row" key={j.id}>
              <Ring pct={j.match} size={48} />
              <div className="jr-main"><b>{j.title}</b><span>{j.co} · {j.loc} · {j.pay}</span></div>
              <Chip>{j.close}</Chip>
            </div>
          )) : <p className="muted small" style={{ margin: 0 }}>No roles listed yet. Check back soon.</p>}
        </section>

        <section className="card s5">
          <div className="card-head"><h2 className="h2">Milestones</h2><span className="small muted num">{unlocked.length}/{MILESTONES.length}</span></div>
          <div className="medals">
            {MILESTONES.map((m) => {
              const on = unlocked.includes(m.id);
              return <div key={m.id} className={`medal${on ? '' : ' locked'}`} title={m.desc}><Medal id={m.id} /><b>{m.name}</b><span>{on ? 'Unlocked' : m.desc}</span></div>;
            })}
          </div>
        </section>
      </div>
    </>
  );
}
