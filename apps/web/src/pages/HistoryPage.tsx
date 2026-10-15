import { PageHead } from '../ui/PageHead';
import { Btn } from '../ui/Btn';
import { Icon } from '../ui/Icon';
import { Chip } from '../ui/Chip';
import { Gate } from '../ui/Gate';
import { useUcai } from '../stores/ucai';
import { verDiff } from '../lib/cv-view';

export function HistoryPage() {
  const versions = useUcai((s) => s.cvVersions);
  const premium = useUcai((s) => s.premium);
  const vers = versions.slice().reverse();
  const head = <PageHead eyebrow="Your CV" title="CV history" lede="Every version you upload, with its score and exactly which checks moved." right={premium ? <Chip tone="indigo"><Icon name="spark" sm />Premium</Chip> : undefined} />;

  if (!vers.length) {
    return (
      <>
        {head}
        <section className="card">
          <h2 className="h2" style={{ marginTop: 0 }}>Nothing here yet</h2>
          <p className="muted">Upload your CV and this page starts keeping score. Upload a second version after you’ve made your edits, and it will tell you which specific checks your changes earned — not just that the number went up.</p>
          <Btn variant="primary" to="/upload" style={{ marginTop: 14 }}><Icon name="upload" />Upload your CV</Btn>
        </section>
      </>
    );
  }

  const content = (
    <>
      <section className="card">
        {vers.map((x, idx) => {
          const prev = vers[idx + 1], d = verDiff(x, prev);
          const delta = prev ? x.score - prev.score : null;
          return (
            <div className={`ver${idx === 0 ? ' current' : ''}`} key={x.analysisId ?? idx}>
              <div className="ver-badge">v{vers.length - idx}</div>
              <div style={{ minWidth: 0 }}>
                <b>{x.file}</b>{idx === 0 && <Chip tone="teal" style={{ marginLeft: 6 }}>Current</Chip>}
                <div className="small muted">{x.at}{x.words ? ` · ${x.words} words` : ''}</div>
                {d?.fixed.length ? <div className="vd-row"><Chip tone="good">You fixed</Chip><ul className="vd-list">{d.fixed.map((n) => <li key={n}>{n}</li>)}</ul></div> : null}
                {d?.slipped.length ? <div className="vd-row"><Chip tone="bad">Slipped back</Chip><ul className="vd-list">{d.slipped.map((n) => <li key={n}>{n}</li>)}</ul></div> : null}
                {!prev
                  ? <p className="small muted" style={{ margin: '8px 0 0' }}>Your first version — nothing to compare it with yet.</p>
                  : !d?.any && <p className="small muted" style={{ margin: '8px 0 0' }}>No check changed between these two versions.</p>}
              </div>
              <div className="ver-score num">{x.score}<small className={delta != null && delta > 0 ? 'up' : delta != null && delta < 0 ? 'down' : ''}>{delta === null ? '—' : delta > 0 ? `+${delta}` : delta < 0 ? `−${Math.abs(delta)}` : '±0'}</small></div>
            </div>
          );
        })}
      </section>
      <p className="small muted" style={{ margin: '14px 2px 0' }}>Scores come from the AI reader at the time of each upload. Fixes you mark on the feedback page count once the edited CV is uploaded.</p>
    </>
  );

  return (
    <>
      {head}
      <Gate title="Keep every version" body="CV version history is part of Premium. See which specific checks each edit moved, and roll back if a change didn’t help.">{content}</Gate>
    </>
  );
}
