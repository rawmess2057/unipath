import { Link, useNavigate } from 'react-router-dom';
import { PageHead } from '../ui/PageHead';
import { Icon } from '../ui/Icon';
import { Chip, LockChip } from '../ui/Chip';
import { Btn } from '../ui/Btn';
import { Ring } from '../ui/Ring';
import { Bar } from '../ui/Bar';
import { useJobsView } from '../hooks/useJobsView';
import { useOpportunityStatus } from '../hooks/useOpportunities';
import { useUcai, type JobFilter, type JobSort } from '../stores/ucai';
import { fitName, fitTier } from '../lib/score';
import type { Job } from '../lib/match';
import { toast } from '../lib/toast';
import { burstAt } from '../lib/fx';

const RING_VAR = { hi: 'var(--teal)', mid: 'var(--indigo)', lo: 'var(--amber-ink)' } as const;

function JobCard({ j }: { j: Job }) {
  const premium = useUcai((s) => s.premium);
  const status = useOpportunityStatus();
  const total = j.reqTotal || 1;
  const gap = j.gap.slice(0, 3);

  const save = async (el: HTMLButtonElement) => {
    try {
      await status.mutateAsync({ id: j.id, status: j.saved ? 'removed' : 'saved' });
      toast(j.saved ? 'Removed from saved' : 'Saved. Find it under Saved.', { key: 'save-' + j.id });
      if (!j.saved) burstAt(el, 20);
    } catch { toast('That didn’t save. Try again.'); }
  };
  const apply = async (el: HTMLButtonElement) => {
    try {
      await status.mutateAsync({ id: j.id, status: j.applied ? 'saved' : 'applied' });
      if (!j.applied) { const r = el.getBoundingClientRect(); burstAt({ getBoundingClientRect: () => ({ ...r, height: 0 }) } as Element, 30); }
      toast(j.applied ? 'Marked as not applied' : 'Application logged · it counts towards your Activity score', { key: 'apply-' + j.id });
    } catch { toast('That didn’t save. Try again.'); }
  };

  return (
    <article className="card job ring-host" style={{ '--ring': RING_VAR[fitTier(j.match)] } as React.CSSProperties}>
      <div className="job-head">
        <div className="co-logo" style={{ background: j.col }} aria-hidden="true">{j.ab}</div>
        <div className="job-main"><h2 className="job-title">{j.title}</h2><div className="small muted">{j.co}</div><span className="fit"><i />{fitName(j.match)}</span></div>
        <Ring pct={j.match} />
      </div>
      <div className="job-facts"><span><Icon name="pin" sm />{j.loc}</span><span><Icon name="pound" sm />{j.pay.replace(/^£/, '')}</span><span><Icon name="clock" sm />{j.close}</span></div>
      <div className="skills-line">
        {j.have.map((s) => <Chip tone="good" key={s}><Icon name="check" sm />{s}</Chip>)}
        {gap.map((s) => <Chip key={s}>{s} to learn</Chip>)}
      </div>
      <details className="why">
        <summary><Icon name="arrow" sm />Why {j.match}%?</summary>
        <div className="why-rows">
          <div className="why-row"><span>Skills</span><Bar value={(j.have.length / total) * 100} /><b>{j.have.length}/{j.reqTotal}</b></div>
          <div className="why-row"><span>Experience level</span><Bar value={j.levelLabel === 'Ideal' ? 100 : 80} /><b>{j.levelLabel}</b></div>
          <div className="why-row"><span>Location</span><Bar value={j.locLabel === 'Flexible' ? 100 : 70} /><b>{j.locLabel}</b></div>
          <p className="small muted" style={{ margin: 0 }}>{gap.length ? <>Learning {gap.slice(0, 2).join(' and ')} would push this above {Math.min(98, j.match + 6)}%. <Link className="link" to="/skills" style={{ fontSize: 13 }}>See skills gap</Link></> : 'You cover every skill this role asks for.'}</p>
        </div>
      </details>
      <div className="job-foot">
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {j.tags.map((t) => <Chip key={t}>{t}</Chip>)}
          {premium ? <Chip tone={j.sponsor ? 'teal' : 'bad'} title={j.sponsorNote ?? undefined}>{j.sponsor ? 'Licensed sponsor' : 'No sponsor licence listed'}</Chip> : <LockChip>Visa check</LockChip>}
        </div>
        <div className="job-actions">
          <button className="btn btn-sm apply-btn" aria-pressed={j.applied} disabled={status.isPending} onClick={(e) => apply(e.currentTarget)}>{j.applied ? <><Icon name="check" sm />Applied</> : 'I’ve applied'}</button>
          <button className="icon-btn save-btn" aria-pressed={j.saved} aria-label={`Save ${j.title}`} disabled={status.isPending} onClick={(e) => save(e.currentTarget)}><Icon name="bookmark" /></button>
        </div>
      </div>
    </article>
  );
}

export function JobsPage() {
  const nav = useNavigate();
  const { list, isLoading, total, savedCount, appliedCount, filtered } = useJobsView();
  const f = useUcai((s) => s.jobFilter);
  const q = useUcai((s) => s.jobQ);
  const sort = useUcai((s) => s.jobSort);
  const premium = useUcai((s) => s.premium);
  const role = useUcai((s) => s.role);
  const patch = useUcai((s) => s.patch);
  const fb = (k: JobFilter, label: React.ReactNode) => <button key={k} className="f-btn" aria-pressed={f === k} onClick={() => patch({ jobFilter: k })}>{label}</button>;
  const sortName = { match: 'best match', close: 'closing soonest', pay: 'highest salary' }[sort];
  const na = Math.min(appliedCount, 5);

  return (
    <>
      <PageHead eyebrow="Opportunities" title="Job matching" lede={`Graduate and entry-level roles ranked by how well your profile and skills fit ${role} roles.`} />
      <div className="job-tools">
        <label className="job-search"><Icon name="search" /><input placeholder="Search by title, company, city or skill" value={q} aria-label="Search jobs" onChange={(e) => patch({ jobQ: e.target.value })} /></label>
        <select className="sort" aria-label="Sort jobs" value={sort} onChange={(e) => patch({ jobSort: e.target.value as JobSort })}>
          <option value="match">Sort: Best match</option><option value="close">Sort: Closing soonest</option><option value="pay">Sort: Highest salary</option>
        </select>
      </div>
      <div className="filters">
        {fb('All', 'All roles')}{fb('Graduate scheme', 'Graduate schemes')}{fb('Internship', 'Internships')}{fb('Placement', 'Placements')}
        {fb('Saved', <><Icon name="bookmark" sm />Saved ({savedCount})</>)}{fb('Applied', <><Icon name="check" sm />Applied ({appliedCount})</>)}
        {premium ? fb('Sponsor', <><Icon name="spark" sm />Visa-aware</>) : <button className="f-btn" style={{ color: 'var(--indigo)' }} onClick={() => nav('/plans')}><Icon name="lock" sm />Visa-aware · Premium</button>}
      </div>
      <div className="apply-prog"><span className="small"><b className="num">{appliedCount}</b> applied</span><Bar value={na * 20} /><span className="small muted">{na >= 5 ? 'Five applications logged. Each one lifts your Activity score.' : `${5 - na} more to reach five tailored applications`}</span></div>
      <div className="results"><span><b className="num">{list.length}</b> of {total} roles · sorted by {sortName}</span>{filtered && <Btn size="sm" variant="ghost" onClick={() => patch({ jobFilter: 'All', jobQ: '' })}><Icon name="x" sm />Clear filters</Btn>}</div>
      <div className="jobs">
        {isLoading && <div className="card" style={{ gridColumn: '1/-1' }}><div className="bar"><i style={{ width: '50%' }} /></div></div>}
        {!isLoading && list.map((j) => <JobCard j={j} key={j.id} />)}
        {!isLoading && !list.length && (
          <div className="card" style={{ gridColumn: '1/-1', textAlign: 'center', padding: 40 }}>
            <h2 className="h2">No roles match that</h2>
            <p className="muted">{total ? `Try a different word, or clear your filters to see all ${total} roles.` : 'No roles are listed yet. Check back soon.'}</p>
            {total > 0 && <Btn onClick={() => patch({ jobFilter: 'All', jobQ: '' })}>Clear filters</Btn>}
          </div>
        )}
      </div>
    </>
  );
}
