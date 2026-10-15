import { useState } from 'react';
import { PageHead } from '../ui/PageHead';
import { Btn } from '../ui/Btn';
import { Icon } from '../ui/Icon';
import { Chip } from '../ui/Chip';
import { useScore } from '../hooks/useScore';
import { useProfile } from '../hooks/useProfile';
import { useUserName } from '../hooks/useUserName';
import { useRoadmapView } from '../hooks/useRoadmapView';
import { useUcai, type BadgeStyle } from '../stores/ucai';
import { band } from '../lib/score';
import { monthShortYear } from '../lib/dates';
import { downloadBadge } from '../lib/badge-canvas';
import { toast } from '../lib/toast';

export function BadgePage() {
  const { data: score } = useScore();
  const { data: profile } = useProfile();
  const { full } = useUserName();
  const { today } = useRoadmapView();
  const role = useUcai((s) => s.role);
  const badgeV = useUcai((s) => s.badgeV);
  const patch = useUcai((s) => s.patch);
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);
  const sc = score?.totalScore ?? 0;
  const course = [profile?.fieldOfStudy, profile?.university].filter(Boolean).join(' · ');
  const post = `I’ve reached an Employability Score of ${sc}/100 (${band(sc)}) on Uni Compass AI while working towards ${role} roles in the UK.\n\nNext up: ${today ? today.name.toLowerCase() : 'more applications'}.\n\n#GraduateCareers #InternationalStudents #UniCompassAI`;

  const copy = () => {
    const done = () => { setCopied(true); toast('Post copied. Paste it into LinkedIn.'); setTimeout(() => setCopied(false), 2200); };
    try { navigator.clipboard.writeText(post).then(done, () => toast('Copy didn’t work here. Select the text and press Ctrl+C.')); } catch { toast('Copy didn’t work here. Select the text and press Ctrl+C.'); }
  };
  const download = async () => {
    setBusy(true);
    try { await downloadBadge({ style: badgeV, score: sc, name: full, course, role }); toast('Badge saved. Attach it to your LinkedIn post.'); }
    catch { toast('The badge couldn’t be created. Try again, or take a screenshot.'); }
    finally { setBusy(false); }
  };
  const sw = (v: BadgeStyle, label: string, bg: string) => <button key={v} className="sw" aria-pressed={badgeV === v} aria-label={label} style={{ background: bg }} onClick={() => patch({ badgeV: v })} />;

  return (
    <>
      <PageHead eyebrow="Share" title="Your score badge" lede="Show recruiters and classmates where you’re heading. The badge updates as your score climbs." />
      <div className="badge-stage">
        <div className="bcard" data-v={badgeV}>
          <div className="bc-top">
            <div className="bc-brand">
              <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeOpacity=".4" strokeWidth="1.4" /><path d="M12 3.5 14 12h-4z" fill={badgeV === 'paper' ? 'var(--teal)' : '#45EBD5'} transform={`rotate(${sc * 3.6} 12 12)`} /><circle cx="12" cy="12" r="1.6" fill="currentColor" /></svg>
              Uni Compass AI
            </div>
            <span className="bc-label">Self-reported · {monthShortYear()}</span>
          </div>
          <div><div className="bc-label">Employability Score</div><div className="bc-score num">{sc}</div><div className="bc-band">{band(sc)}</div></div>
          <div className="bc-foot"><div><b>{full || 'Your name'}</b>{course}</div><span>Heading: {role}</span></div>
        </div>
        <div style={{ display: 'grid', gap: 18, minWidth: 0 }}>
          <section className="card"><p className="eyebrow">Style</p><div className="swatches">{sw('ink', 'Midnight', 'var(--hero)')}{sw('teal', 'Teal', 'linear-gradient(150deg,#0A8A7E,#16195A)')}{sw('paper', 'Paper', 'var(--surface)')}</div></section>
          <section className="card">
            <div className="card-head"><h2 className="h3">Post for LinkedIn</h2><Chip>{post.length} chars</Chip></div>
            <div className="post">{post}</div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 14 }}>
              <Btn variant="primary" onClick={copy}>{copied ? <><Icon name="check" />Copied</> : <><Icon name="copy" />Copy post</>}</Btn>
              <Btn href="https://www.linkedin.com/feed/" target="_blank" rel="noopener">Open LinkedIn <Icon name="arrow" sm /></Btn>
            </div>
            <p className="small muted" style={{ margin: '10px 0 0' }}>Tip: download the badge below and attach it to your post.</p>
          </section>
          <section className="card">
            <div className="card-head" style={{ marginBottom: 8 }}><h2 className="h3">Download your badge</h2><Chip>PNG · 1200×1000</Chip></div>
            <p className="small muted" style={{ margin: '0 0 14px' }}>A high-quality image in the style you picked, ready to attach to your LinkedIn post.</p>
            <Btn variant="primary" onClick={download} disabled={busy}><Icon name="upload" />{busy ? 'Preparing…' : 'Download PNG'}</Btn>
          </section>
        </div>
      </div>
    </>
  );
}
