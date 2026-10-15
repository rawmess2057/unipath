import { PageHead } from '../ui/PageHead';
import { Icon } from '../ui/Icon';
import { Chip } from '../ui/Chip';
import { Gate } from '../ui/Gate';
import { useUcai } from '../stores/ucai';
import { useProfile } from '../hooks/useProfile';
import { ROLES, type Role } from '../lib/industry';
import { SKILLSETS, LEVELS, skillsetFor } from '../lib/skills-data';
import { toast } from '../lib/toast';

export function SkillsPage() {
  const role = useUcai((s) => s.role);
  const patch = useUcai((s) => s.patch);
  const { data: profile } = useProfile();
  const set = skillsetFor(role, profile?.skills ?? []);

  const guidance = (
    <section className="card">
      <div className="card-head"><h2 className="h2">Your learning plan</h2><Chip tone="indigo"><Icon name="spark" sm />Premium</Chip></div>
      <div className="res"><div className="res-ico"><Icon name="book" /></div><div><b>Power BI: from Working to Confident</b><div className="small muted">4 weeks · 3 hrs a week · ends with a portfolio dashboard</div></div></div>
      <div className="res"><div className="res-ico"><Icon name="book" /></div><div><b>Stakeholder interviews for analysts</b><div className="small muted">2 weeks · role-play with feedback</div></div></div>
      <div className="res"><div className="res-ico"><Icon name="book" /></div><div><b>SQL joins on real UK datasets</b><div className="small muted">3 weeks · ONS open data</div></div></div>
    </section>
  );

  return (
    <>
      <PageHead eyebrow="Grow" title="Skills gap" lede={`What ${role} job adverts ask for, against what your profile and coursework show today.`} />
      <div className="bento">
        <section className="card s8">
          <div className="card-head">
            <div className="role-chips">
              {(Object.keys(SKILLSETS) as Role[]).filter((r) => ROLES.includes(r)).map((r) => (
                <button key={r} className="f-btn" aria-pressed={role === r} onClick={() => { patch({ role: r }); toast('Skills gap updated for ' + r, { key: 'role' }); }}>{r}</button>
              ))}
            </div>
          </div>
          <div className="legend" style={{ marginBottom: 8 }}>
            <span><i style={{ background: 'var(--teal)' }} />You have</span>
            <span><i style={{ background: 'repeating-linear-gradient(135deg,var(--indigo-soft) 0 3px,var(--indigo) 3px 4px)' }} />Roles ask for</span>
          </div>
          {set.map(([n, h, t]) => {
            const gap = t - h;
            return (
              <div className="skill" key={n}>
                <div><b>{n}</b><div className="small muted">{LEVELS[h]} → {LEVELS[t]}</div></div>
                <div className="lvl" role="img" aria-label={`${n}: ${LEVELS[h]} now, ${LEVELS[t]} needed`}>{[1, 2, 3, 4].map((l) => <i key={l} className={l <= h ? 'have' : l <= t ? 'need' : ''} />)}</div>
                <Chip tone={gap <= 0 ? 'good' : gap >= 2 ? 'bad' : 'amber'}>{gap <= 0 ? 'Ready' : `${gap} level${gap > 1 ? 's' : ''} to go`}</Chip>
              </div>
            );
          })}
        </section>
        <div className="s4" style={{ display: 'grid', gap: 18, alignContent: 'start' }}>
          <section className="card">
            <p className="eyebrow">Free resources</p>
            <div className="res"><div className="res-ico"><Icon name="book" /></div><div><b>Microsoft Learn</b><div className="small muted">Free Power BI learning paths</div></div></div>
            <div className="res"><div className="res-ico"><Icon name="book" /></div><div><b>Your university careers service</b><div className="small muted">Workshops, CV reviews, employer events</div></div></div>
          </section>
          <Gate title="Personal learning plan" body="Week-by-week guidance for each gap, part of Premium.">{guidance}</Gate>
        </div>
      </div>
    </>
  );
}
