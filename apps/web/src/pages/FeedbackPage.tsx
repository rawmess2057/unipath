import { useNavigate } from 'react-router-dom';
import { PageHead } from '../ui/PageHead';
import { Btn } from '../ui/Btn';
import { Icon } from '../ui/Icon';
import { Chip } from '../ui/Chip';
import { Bar } from '../ui/Bar';
import { CountUp } from '../ui/CountUp';
import { MiniNeedle } from '../ui/MiniNeedle';
import { useCvView } from '../hooks/useCvView';
import { useUcai } from '../stores/ucai';
import { cvBand, tier10, tier100 } from '../lib/score';
import type { Check, CvView } from '../lib/cv-view';
import { toast } from '../lib/toast';
import { burstAt } from '../lib/fx';

function useAck() {
  const acks = useUcai((s) => s.cvAcks);
  const patch = useUcai((s) => s.patch);
  return (x: Check, el: Element | null) => {
    if (acks.includes(x.key)) return;
    patch({ cvAcks: [...acks, x.key] });
    useUcai.getState().markDayDone();
    burstAt(el, 40);
    toast('Noted. Upload the updated CV to lock in the new score.', { key: 'ack' });
  };
}

function HowTo({ x, label, onDone }: { x: Check; label: string; onDone: (el: HTMLButtonElement) => void }) {
  return (
    <details className="howto">
      <summary><Icon name="arrow" sm />{label}</summary>
      <div className="howto-body">
        <p>{x.how || x.bad}</p>
        {x.ukStandard && <p className="small muted">UK standard: {x.ukStandard}</p>}
        {x.before && <div className="ba"><div className="before"><span>Before · from your CV</span>{x.before}</div><div className="after"><span>After</span>{x.after}</div></div>}
        <Btn size="sm" variant="primary" onClick={(e) => onDone(e.currentTarget)}><Icon name="check" sm />I’ve made this change</Btn>
      </div>
    </details>
  );
}

function CheckCard({ cat, onAck }: { cat: CvView['cats'][number]; onAck: (x: Check, el: Element | null) => void }) {
  const nav = useNavigate();
  const rows = cat.items.slice().sort((a, b) => a.pts - b.pts);
  const p = rows.filter((x) => x.pass).length;
  return (
    <section className="card">
      <div className="cat-head"><div><h2 className="h3">{cat.name}</h2><span className="small muted">{cat.hint}</span></div><Chip tone={p === rows.length ? 'good' : 'amber'} className="num">{p}/{rows.length} pass</Chip></div>
      {rows.map((x) => (
        <div className={`check ${x.pass ? 'pass' : 'fail'}`} key={x.key}>
          <span className="mark" aria-label={x.pass ? 'Pass' : 'Fail'}><Icon name={x.pass ? 'check' : 'x'} sm /></span>
          <div>
            <b>{x.n}</b>
            <p>{x.pass ? (x.acked ? 'You’ve marked this done.' : x.good) : x.bad}</p>
            {!x.pass && (x.to
              ? <Btn size="sm" variant="primary" style={{ marginTop: 10 }} onClick={() => nav(x.to!)}><Icon name="book" sm />Fix these in Word check</Btn>
              : <HowTo x={x} label="Show me how to fix it" onDone={(el) => onAck(x, el)} />)}
          </div>
          <span className={`pts ${tier10(x.pts)} num`} title="Score out of 10">{x.pts}/10</span>
        </div>
      ))}
    </section>
  );
}

export function FeedbackPage() {
  const nav = useNavigate();
  const { view: v, isLoading, processing, hasAnalysis } = useCvView();
  const versions = useUcai((s) => s.cvVersions);
  const role = useUcai((s) => s.role);
  const ack = useAck();
  const r = 56, c = 2 * Math.PI * r;

  if (!v) {
    return (
      <>
        <PageHead eyebrow="Your CV" title="CV feedback" lede={`Analysed against UK graduate recruiter norms for ${role} roles.`} />
        <section className="card">
          <h2 className="h2" style={{ marginTop: 0 }}>{isLoading ? 'Loading your feedback…' : processing ? 'Still analysing your CV' : hasAnalysis ? 'Your last analysis couldn’t be read' : 'No CV yet'}</h2>
          <p className="muted">{processing ? 'The AI reader is going through it now. This page refreshes itself.' : 'Upload your CV and this page fills with a quality score, your top fix and every check we run.'}</p>
          {processing ? <div className="bar"><i style={{ width: '70%' }} /></div> : <Btn variant="primary" to="/upload" style={{ marginTop: 14 }}><Icon name="upload" />Upload your CV</Btn>}
        </section>
      </>
    );
  }

  const cs = v.score;
  const worst = v.fixFirst;
  const cur = versions[versions.length - 1], prev = versions[versions.length - 2];
  const diff = cur && prev ? cur.score - prev.score : 0;
  const unsaved = v.ackCount;

  const fixFirst = !worst ? (
    <>
      <div className="fixed-stamp"><Icon name="check" />Every check passes.</div>
      <p className="muted" style={{ margin: 0 }}>Nothing here needs your attention. Upload a new version whenever you change the CV, and spend the time on applications instead.</p>
      <Btn size="sm" to="/jobs" style={{ marginTop: 12 }}><Icon name="brief" sm />See your job matches</Btn>
    </>
  ) : (
    <>
      <h2 className="h2">{worst.n}</h2>
      <p className="muted" style={{ margin: 0 }}>{worst.bad}</p>
      {worst.ukStandard && <p className="muted small" style={{ margin: 0 }}>UK standard: {worst.ukStandard}</p>}
      {worst.before && <div className="ba"><div className="before"><span>Before · from your CV</span>{worst.before}</div><div className="after"><span>After · the shape to aim for</span>{worst.after}</div></div>}
      <div>{worst.to
        ? <Btn variant="indigo" onClick={() => nav(worst.to!)}><Icon name="book" />Fix these in Word check</Btn>
        : <Btn variant="indigo" onClick={(e) => ack(worst, e.currentTarget)}><Icon name="check" />I’ve fixed this</Btn>}</div>
    </>
  );

  return (
    <>
      <PageHead eyebrow={`Your CV · ${v.file}`} title="CV feedback" lede={`Analysed against UK graduate recruiter norms for ${role} roles.`}
        right={<div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}><Btn to="/wordcheck"><Icon name="book" />Word check</Btn><Btn to="/history"><Icon name="history" />Versions</Btn><Btn variant="primary" to="/upload"><Icon name="upload" />Upload new version</Btn></div>} />

      {unsaved > 0 && (
        <div className="cv-pending" role="status"><Icon name="upload" /><p>You’ve marked <b>{unsaved}</b> fix{unsaved === 1 ? '' : 'es'} as done since your last upload. Upload your updated CV to lock in the new score.</p><Btn size="sm" variant="primary" to="/upload">Upload new version</Btn></div>
      )}
      {cur && prev && (
        <section className="card cv-delta" aria-label="CV score change since your last version">
          <div className="nums"><span className="from num">{prev.score}</span><span className="arrow">→</span><span className="to num">{cur.score}</span><Chip tone={diff > 0 ? 'good' : diff < 0 ? 'bad' : ''} className="num">{diff > 0 ? '+' : diff < 0 ? '−' : '±'}{Math.abs(diff)}</Chip></div>
          <div className="bars"><div><span>Previous</span><span className="bar old"><i style={{ width: `${prev.score}%` }} /></span></div><div><span>Latest</span><span className="bar"><i style={{ width: `${cur.score}%` }} /></span></div></div>
          <div className="small muted" style={{ textAlign: 'right' }}>{diff > 0 ? 'Your CV improved' : diff < 0 ? 'Score went down' : 'No change'}<br />{prev.file} → {cur.file}</div>
        </section>
      )}

      <div className="fb-top">
        <section className="card cv-score-card">
          <div className="cv-gauge">
            <svg viewBox="0 0 132 132"><circle className="rt" cx="66" cy="66" r={r} /><circle className="rv" cx="66" cy="66" r={r} strokeDasharray={c.toFixed(2)} strokeDashoffset={(c * (1 - cs / 100)).toFixed(2)} /></svg>
            <div><b className="num"><CountUp to={cs} from={Math.max(0, cs - 8)} className="" /></b><small>CV QUALITY</small></div>
          </div>
          <div style={{ minWidth: 0 }}>
            <Chip tone={cs >= 75 ? 'good' : 'amber'}>{cvBand(cs)}</Chip>
            <h2 className="h2" style={{ marginTop: 10 }}>{unsaved > 0 ? 'Fixes marked here count once the new CV is uploaded.' : cs >= 75 ? 'Your CV is in strong shape.' : 'A solid base with clear wins.'}</h2>
            <p className="muted small" style={{ margin: '6px 0 0' }}>{v.passCount} of {v.all.length} checks pass. {v.summary}</p>
          </div>
          <div className="cats" aria-label="Category scores">
            {v.cats.map((cat) => <div className="cat-row" key={cat.id}><b>{cat.name}</b><Bar value={cat.score} tier={tier100(cat.score)} /><span className="num">{cat.score}</span></div>)}
            <p className="no100">You don’t need 100. Use the advice that fits your target role and skip what doesn’t.</p>
          </div>
        </section>
        <section className="fix-first">
          <p className="eyebrow"><Icon name="compass" sm />Fix this first</p>
          {fixFirst}
        </section>
      </div>

      <div className="tie">
        <MiniNeedle value={cs} animate={false} />
        <p>Every CV fix moves your <b>Employability Score</b>. {worst ? <>Start with “{worst.n}”.</> : 'Nothing left to fix here — your next points come from applications and skills.'}</p>
        <Btn size="sm" to="/dashboard">See your score</Btn>
      </div>

      <section className="wins" aria-label="What you did well">
        <p className="eyebrow"><Icon name="star" sm /> What you did well</p>
        <ul>{v.wins.map((w) => <li key={w.n}><Icon name="check" sm /><span><b>{w.n}</b><br /><span className="small muted">{w.sub}</span></span></li>)}</ul>
      </section>

      <div className="cat-head" style={{ margin: '6px 0 12px' }}><h2 className="h2">All checks</h2><span className="small muted">Weakest first in each group · scored out of 10</span></div>
      <div className="checks">{v.cats.map((cat) => <CheckCard key={cat.id} cat={cat} onAck={ack} />)}</div>
    </>
  );
}

