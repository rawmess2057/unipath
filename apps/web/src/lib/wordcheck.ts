import type { AnalysedCv } from './cv-analyser';
import type { WcState } from '../stores/ucai';
import { longDate } from './dates';

export const WC_WHY = {
  verbs: 'UK recruiters skim for what <b>you</b> did. “Worked with” and “supported” hide your contribution behind the team, so a real achievement reads as a minor one. A stronger verb makes the same sentence yours.',
  cuts: 'In many countries a CV opens with words about character: hard-working, motivated, team player. UK recruiters read those as filler, because anyone can claim them. They want evidence instead. UK CVs also drop “I” and “my” entirely, and never say “references available on request” — it is assumed.',
};

export const VERB_BANK = [
  { g: 'Leadership', v: ['Led', 'Directed', 'Oversaw', 'Mentored', 'Chaired', 'Delegated', 'Championed'] },
  { g: 'Communication', v: ['Liaised', 'Presented', 'Negotiated', 'Advised', 'Authored', 'Persuaded', 'Briefed'] },
  { g: 'Analysis', v: ['Analysed', 'Modelled', 'Evaluated', 'Forecast', 'Investigated', 'Mapped', 'Benchmarked'] },
  { g: 'Delivery', v: ['Delivered', 'Implemented', 'Launched', 'Completed', 'Automated', 'Rolled out', 'Shipped'] },
  { g: 'Improvement', v: ['Streamlined', 'Reduced', 'Optimised', 'Redesigned', 'Accelerated', 'Simplified', 'Cut'] },
  { g: 'Creative', v: ['Designed', 'Created', 'Prototyped', 'Illustrated', 'Storyboarded', 'Branded', 'Curated'] },
];

export function wcProgress(cv: AnalysedCv | null, wc: WcState) {
  if (!cv) return { done: 0, total: 0, pct: 100 };
  const total = cv.weak.length + cv.cuts.length + cv.usedUS.length;
  const done = cv.weak.filter((w) => wc.swaps[w.id]).length
    + cv.cuts.filter((c) => wc.cut.includes(c.id)).length
    + cv.usedUS.filter((sp) => wc.spell.includes(sp.id)).length;
  return { done, total, pct: total ? Math.round((done / total) * 100) : 100 };
}

export interface WcEdit { do: 'Replace' | 'Delete' | 'Spelling'; find: string; put: string; line: string; why?: string }

export function wcEdits(cv: AnalysedCv | null, wc: WcState): WcEdit[] {
  if (!cv) return [];
  const out: WcEdit[] = [];
  cv.weak.forEach((w) => { const a = wc.swaps[w.id]; if (a) out.push({ do: 'Replace', find: w.word, put: a, line: (w.pre + w.word + w.post).trim() }); });
  cv.cuts.forEach((c) => { if (wc.cut.includes(c.id)) out.push({ do: 'Delete', find: c.word, put: '', line: (c.pre + c.word + c.post).trim(), why: c.after }); });
  cv.usedUS.forEach((sp) => { if (wc.spell.includes(sp.id)) out.push({ do: 'Spelling', find: sp.us, put: sp.uk, line: (sp.pre + sp.us + sp.post).trim(), why: 'UK spelling. Check every other place this word appears too.' }); });
  return out;
}

export function wcEditText(cv: AnalysedCv | null, wc: WcState, who: string, cvFile: string | null) {
  const ed = wcEdits(cv, wc);
  const head = ['YOUR CV EDIT LIST — Uni Compass AI', `${who || 'Your CV'} · ${cvFile || 'your CV'} · ${longDate()}`, '',
    `Make these ${ed.length} change${ed.length === 1 ? '' : 's'} in your own CV document.`, ''];
  const body = ed.map((e, i) => {
    const n = `${i + 1}. ${e.do.toUpperCase()}: “${e.find}”`;
    const rows = [e.put ? `   Use instead: “${e.put}”` : '   Take the line out.'];
    if (e.line && e.line !== e.find) rows.push(`   Your line: ${e.line}`);
    if (e.why) rows.push(`   Why: ${e.why}`);
    return [n].concat(rows).join('\n');
  });
  return head.concat(body).join('\n') + '\n\nThis list does not change your CV file. Open your CV and make these edits yourself.\n';
}

/** Which of the four word-check outcomes are currently satisfied. */
export function wcOutcomes(cv: AnalysedCv | null, wc: WcState) {
  if (!cv) return { w1: false, w2: false, w3: false, w4: false };
  const present = (id: string) => cv.cuts.some((c) => c.id === id);
  return {
    w1: cv.weak.length > 0 && cv.weak.every((w) => wc.swaps[w.id]),
    w2: !present('cu1') || wc.cut.includes('cu1'),
    w3: !present('cu2') || wc.cut.includes('cu2'),
    w4: !present('cu3') || wc.cut.includes('cu3'),
  };
}

/** Download a text file in the browser. */
export function downloadText(filename: string, text: string, type = 'text/plain') {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
