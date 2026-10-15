import { useRef, useState } from 'react';
import { PageHead } from '../ui/PageHead';
import { Btn } from '../ui/Btn';
import { Icon } from '../ui/Icon';
import { Chip } from '../ui/Chip';
import { MiniNeedle } from '../ui/MiniNeedle';
import { useUcai } from '../stores/ucai';
import { useUserName } from '../hooks/useUserName';
import { useScore } from '../hooks/useScore';
import { wcProgress, wcEdits, wcEditText, VERB_BANK, WC_WHY, downloadText } from '../lib/wordcheck';
import { toast } from '../lib/toast';
import { burstAt, reducedMotion } from '../lib/fx';

export function WordCheckPage() {
  const cv = useUcai((s) => s.cv);
  const wc = useUcai((s) => s.wc);
  const cvFile = useUcai((s) => s.cvFile);
  const patch = useUcai((s) => s.patch);
  const { full } = useUserName();
  const { data: score } = useScore();
  const [copied, setCopied] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  const decide = (next: typeof wc, el: Element | null, msg?: string) => {
    patch({ wc: next });
    useUcai.getState().markDayDone();
    if (msg) { burstAt(el, 24); toast(msg, { key: msg }); }
  };

  if (!cv) {
    return (
      <>
        <PageHead eyebrow="Your CV" title="Word check" lede="Every word on your CV, read the way a UK recruiter reads it. Swap or cut, then make the same change in your own document." right={<Btn to="/feedback"><Icon name="file" />Back to feedback</Btn>} />
        <section className="card">
          <h2 className="h2" style={{ marginTop: 0 }}>No CV text to read yet</h2>
          <p className="muted">Upload your CV, or paste its text, and this page lists every weak verb, buzzword and American spelling with a UK alternative to pick.</p>
          <Btn variant="primary" to="/upload" style={{ marginTop: 14 }}><Icon name="upload" />Upload or paste your CV</Btn>
        </section>
      </>
    );
  }

  const p = wcProgress(cv, wc);
  const edits = wcEdits(cv, wc);
  const sc = score?.totalScore ?? 0;
  const file = cvFile || (cv.src === 'paste' ? 'Pasted CV text' : 'your CV');

  const copyAll = () => {
    const txt = wcEditText(cv, wc, full, file), n = edits.length;
    const done = () => { setCopied(true); toast(`${n} change${n === 1 ? '' : 's'} copied. Paste them beside your CV.`); setTimeout(() => setCopied(false), 2200); };
    try { navigator.clipboard.writeText(txt).then(done, () => toast('Copy didn’t work here. Use the download button instead.')); } catch { toast('Copy didn’t work here. Use the download button instead.'); }
  };
  const copyVerb = (v: string) => {
    try { navigator.clipboard.writeText(v).then(() => toast(`“${v}” copied`, { key: 'verb' }), () => toast(`Use “${v}”`)); } catch { toast(`Use “${v}”`); }
  };
  const first = () => {
    const t = listRef.current?.querySelector('.wc-item:not(.done)') as HTMLElement | null;
    if (!t) { toast('All decided — your edit list is ready below.'); return; }
    t.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth', block: 'center' });
    t.classList.add('flash'); setTimeout(() => t.classList.remove('flash'), 1400);
  };

  const Why = ({ html }: { html: string }) => (
    <div className="explain"><Icon name="compass" /><div><p className="eyebrow">Why UK recruiters care</p><p dangerouslySetInnerHTML={{ __html: html }} /></div></div>
  );

  return (
    <>
      <PageHead eyebrow={`Your CV · ${file}`} title="Word check" lede="Every word on your CV, read the way a UK recruiter reads it. Swap or cut, then make the same change in your own document." right={<Btn to="/feedback"><Icon name="file" />Back to feedback</Btn>} />
      <div className="wc-top">
        <b className="num">{p.done}/{p.total}</b><span className="small muted" style={{ flex: 'none' }}>decided</span>
        <span className="bar"><i style={{ width: `${p.pct}%` }} /></span>
        <Chip tone={p.done === p.total ? 'good' : 'teal'}>{p.done === p.total ? 'All decided' : `${p.total - p.done} to go`}</Chip>
        <p className="wc-note"><Icon name="file" sm />This page doesn’t change your CV file. Decide here, then make the same edits in your own document.</p>
      </div>

      <div ref={listRef}>
        <section className="wc-sec">
          <div className="cat-head"><div><h2 className="h2">Weak verbs</h2><span className="small muted">{cv.weak.filter((w) => !wc.swaps[w.id]).length} still to swap</span></div><Chip>Impact</Chip></div>
          <Why html={WC_WHY.verbs} />
          <div className="wc-list">
            {cv.weak.length === 0 && <div className="wc-item done"><p className="wc-line">No weak openers like “responsible for” or “helped”. Nice.</p></div>}
            {cv.weak.map((w) => {
              const chosen = wc.swaps[w.id];
              return (
                <div className={`wc-item${chosen ? ' done' : ''}`} key={w.id}>
                  <p className="wc-line">{w.pre}<mark>{chosen || w.word}</mark>{w.post}</p>
                  {chosen
                    ? <div className="wc-done-row"><Icon name="check" />Use “{chosen}” in your CV<Btn size="sm" variant="ghost" onClick={() => { const { [w.id]: _x, ...rest } = wc.swaps; patch({ wc: { ...wc, swaps: rest } }); }}>Change my mind</Btn></div>
                    : <div className="wc-alts"><span className="lbl">Use instead:</span>{w.alts.map((a) => <button className="alt" key={a} onClick={(e) => decide({ ...wc, swaps: { ...wc.swaps, [w.id]: a } }, e.currentTarget, `Noted · use “${a}” in your CV`)}>{a}</button>)}</div>}
                </div>
              );
            })}
          </div>
        </section>

        <section className="wc-sec">
          <div className="cat-head"><div><h2 className="h2">Words to cut</h2><span className="small muted">{cv.cuts.filter((c) => !wc.cut.includes(c.id)).length} still on your CV</span></div><Chip>Clarity · UK fit</Chip></div>
          <Why html={WC_WHY.cuts} />
          <div className="wc-list">
            {cv.cuts.length === 0 && <div className="wc-item done"><p className="wc-line">No buzzwords, pronouns or references line found.</p></div>}
            {cv.cuts.map((c) => {
              const gone = wc.cut.includes(c.id);
              return (
                <div className={`wc-item${gone ? ' done' : ''}`} key={c.id}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', marginBottom: 10 }}><Chip tone={gone ? 'good' : 'bad'}>{c.kind}</Chip><span className="small muted">{c.found}</span></div>
                  <p className={`wc-line${gone ? ' cut' : ''}`}>{c.pre}<mark>{c.word}</mark>{c.post}</p>
                  {gone
                    ? <><p className="wc-after"><b>In your CV:</b> {c.after}</p><div className="wc-done-row"><Icon name="check" />Noted<Btn size="sm" variant="ghost" onClick={() => patch({ wc: { ...wc, cut: wc.cut.filter((x) => x !== c.id) } })}>Change my mind</Btn></div></>
                    : <div className="wc-alts"><Btn size="sm" variant="primary" onClick={(e) => decide({ ...wc, cut: [...wc.cut, c.id] }, e.currentTarget, 'Noted · make this change in your CV')}><Icon name="check" sm />Use this instead</Btn><span className="lbl">{c.after}</span></div>}
                </div>
              );
            })}
          </div>
        </section>

        {cv.usedUS.length > 0 && (
          <section className="wc-sec">
            <div className="cat-head"><div><h2 className="h2">UK spelling</h2><span className="small muted">{cv.usedUS.filter((sp) => !wc.spell.includes(sp.id)).length} still American</span></div><Chip>UK fit</Chip></div>
            <Why html="American spelling on a UK CV reads as a copy-paste from an old application. It is the cheapest fix on this page and it is the one most international students miss." />
            <div className="wc-list">
              {cv.usedUS.map((sp) => {
                const ok = wc.spell.includes(sp.id);
                return (
                  <div className={`wc-item${ok ? ' done' : ''}`} key={sp.id}>
                    <p className="wc-line">{sp.pre}<mark>{ok ? sp.uk : sp.us}</mark>{sp.post}</p>
                    {ok
                      ? <div className="wc-done-row"><Icon name="check" />Use “{sp.uk}” in your CV<Btn size="sm" variant="ghost" onClick={() => patch({ wc: { ...wc, spell: wc.spell.filter((x) => x !== sp.id) } })}>Change my mind</Btn></div>
                      : <div className="wc-alts"><span className="lbl">UK spelling:</span><button className="alt" onClick={(e) => decide({ ...wc, spell: [...wc.spell, sp.id] }, e.currentTarget, `Noted · “${sp.uk}”`)}>{sp.uk}</button></div>}
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </div>

      <section className="wc-sec">
        <div className="cat-head"><div><h2 className="h2">Your edit list</h2><span className="small muted">{p.done === 0 ? 'Fills up as you decide' : `${p.done} change${p.done === 1 ? '' : 's'} to make in your own CV`}</span></div><Chip tone={p.done ? 'good' : ''}>Take this with you</Chip></div>
        {p.done === 0 ? (
          <div className="card"><p className="small muted" style={{ margin: '0 0 12px' }}>Nothing decided yet. Swap a verb or accept a cut above, and the exact wording lands here — ready to copy into your own document.</p><Btn size="sm" variant="primary" onClick={first}><Icon name="check" sm />Take me to the first one</Btn></div>
        ) : (
          <div className="card">
            <ol className="edit-list">
              {edits.map((e, i) => (
                <li key={i}>
                  <p className="el-do"><Chip tone={e.do === 'Delete' ? 'bad' : 'teal'}>{e.do}</Chip> “{e.find}”{e.put ? <> → <b>“{e.put}”</b></> : null}</p>
                  {e.line && e.line !== e.find && <p className="el-line">{e.line}</p>}
                  {e.why && <p className="small muted" style={{ margin: '4px 0 0' }}>{e.why}</p>}
                </li>
              ))}
            </ol>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 16 }}>
              <Btn variant="primary" onClick={copyAll}>{copied ? <><Icon name="check" />Copied</> : <><Icon name="copy" />Copy all {p.done} changes</>}</Btn>
              <Btn onClick={() => { downloadText('My-CV-edit-list.txt', wcEditText(cv, wc, full, file)); toast('Saved. Open it beside your CV and work down the list.'); }}><Icon name="upload" />Download as a text file</Btn>
            </div>
            <p className="small muted" style={{ margin: '12px 0 0' }}>Paste this beside your CV, work down the list, then upload the new version to see your score move.</p>
          </div>
        )}
      </section>

      <section className="wc-sec">
        <div className="cat-head"><div><h2 className="h2">Verb bank</h2><span className="small muted">Strong UK-spelling verbs, grouped by what you want to show</span></div></div>
        {VERB_BANK.map((b) => (
          <section className="card" style={{ marginBottom: 12 }} key={b.g}>
            <div className="cat-head" style={{ marginBottom: 10 }}><h3 className="h3">{b.g}</h3><span className="small muted">Tap to copy</span></div>
            <div className="bank-verbs">{b.v.map((v) => <button className="verb" key={v} onClick={() => copyVerb(v)}>{v}</button>)}</div>
          </section>
        ))}
      </section>

      <div className="tie"><MiniNeedle value={sc} animate={false} /><p>These fixes move your <b>Impact</b>, <b>Clarity</b> and <b>UK fit</b> scores on the CV feedback screen.</p><Btn size="sm" to="/feedback">See your CV score</Btn></div>
    </>
  );
}
