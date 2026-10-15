/* In-browser CV text analysis, ported verbatim from the prototype.
   It feeds Word check (weak verbs, words to cut, UK spelling) and the
   "unsure" notes. Nothing here leaves the browser. */

import { todayStr } from './dates';

export interface WeakVerb { id: string; pre: string; word: string; post: string; alts: string[] }
export interface Cut { id: string; kind: string; found: string; pre: string; word: string; post: string; after: string }
export interface Spelling { id: string; us: string; uk: string; pre: string; post: string }
export interface VerbOpeners { strong: number; weak: number; other: number; total: number; examples: string[] }

export interface AnalysedCv {
  text: string;
  src: 'docx' | 'txt' | 'paste' | 'pdf' | null;
  words: number;
  pages: number;
  bullets: number;
  quantified: number;
  skillsColumns: boolean | null;
  verbOpeners: VerbOpeners | null;
  chrono: { ok: boolean; years: number[] } | null;
  weak: WeakVerb[];
  cuts: Cut[];
  buzzwords: string[];
  usedUS: Spelling[];
  hasUKPhone: boolean;
  hasPhone: boolean;
  sections: string[];
  openerWords: number;
  at: string;
}

const WEAK_PATTERNS = [
  { re: /\bresponsible for\b/gi, word: 'Responsible for', alts: ['Led', 'Managed', 'Ran'] },
  { re: /\bworked with\b/gi, word: 'Worked with', alts: ['Liaised with', 'Advised', 'Partnered with'] },
  { re: /\bworked on\b/gi, word: 'Worked on', alts: ['Built', 'Delivered', 'Developed'] },
  { re: /\bassisted (?:with|in)\b/gi, word: 'Assisted with', alts: ['Co-ordinated', 'Delivered', 'Contributed to'] },
  { re: /\bhelped\b/gi, word: 'Helped', alts: ['Co-ordinated', 'Delivered', 'Organised'] },
  { re: /\bsupported\b/gi, word: 'Supported', alts: ['Facilitated', 'Co-ordinated', 'Influenced'] },
  { re: /\binvolved in\b/gi, word: 'Involved in', alts: ['Led', 'Delivered', 'Ran'] },
  { re: /\bparticipated in\b/gi, word: 'Participated in', alts: ['Contributed to', 'Ran', 'Delivered'] },
  { re: /\bduties included\b/gi, word: 'Duties included', alts: ['Delivered', 'Owned', 'Ran'] },
];

const BUZZWORDS = ['hard-working', 'hard working', 'team player', 'results-driven', 'results driven', 'go-getter',
  'detail-oriented', 'detail oriented', 'think outside the box', 'passionate', 'self-motivated', 'self motivated',
  'dynamic', 'synergy', 'proactive', 'go the extra mile', 'fast-paced', 'win-win'];

const US_SPELLINGS: [string, string][] = [['organize', 'organise'], ['organized', 'organised'], ['organization', 'organisation'],
  ['analyze', 'analyse'], ['analyzed', 'analysed'], ['analyzing', 'analysing'], ['center', 'centre'], ['color', 'colour'],
  ['favorite', 'favourite'], ['behavior', 'behaviour'], ['program ', 'programme '], ['specialize', 'specialise'],
  ['specialized', 'specialised'], ['recognize', 'recognise'], ['prioritize', 'prioritise'], ['optimize', 'optimise'],
  ['fulfill', 'fulfil'], ['traveled', 'travelled'], ['labor', 'labour'], ['defense', 'defence'], ['licensed', 'licenced']];

export const STRONG_VERBS = ('led directed oversaw mentored chaired delegated championed liaised presented negotiated advised authored '
  + 'persuaded briefed analysed modelled evaluated forecast investigated mapped benchmarked delivered implemented launched '
  + 'completed automated shipped streamlined reduced optimised redesigned accelerated simplified cut designed created '
  + 'prototyped illustrated storyboarded branded curated managed built developed ran founded established coordinated '
  + 'co-ordinated organised planned scheduled trained coached recruited negotiated secured won grew increased improved '
  + 'saved resolved fixed migrated integrated tested audited reviewed documented wrote published translated maintained '
  + 'monitored tracked reported forecasted budgeted procured onboarded facilitated hosted chaired drafted compiled '
  + 'collected processed cleaned validated visualised automated scripted programmed deployed configured'
).split(' ').filter(Boolean);

const SECTION_WORDS: Record<string, RegExp> = {
  experience: /\b(work experience|employment|professional experience|experience)\b/i,
  education: /\b(education|academic|qualifications)\b/i,
  skills: /\b(skills|technical skills|key skills)\b/i,
};

const lines = (t: string) => t.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

const sentenceAround = (text: string, idx: number, len: number) => {
  let a = idx, b = idx + len;
  while (a > 0 && !/[\n.!?]/.test(text[a - 1])) a--;
  while (b < text.length && !/[\n.!?]/.test(text[b])) b++;
  return { pre: text.slice(a, idx).replace(/^\s+/, ''), post: text.slice(idx + len, b + 1).replace(/\s+$/, '') };
};

const HEAD = /^(profile|personal statement|personal profile|summary|professional summary|objective|career objective|about me|about)\b[:\s]*$/i;
const ANYHEAD = /^(profile|personal statement|personal profile|summary|professional summary|objective|career objective|about me|about|work experience|employment|professional experience|experience|education|academic|qualifications|skills|technical skills|key skills|projects|interests|hobbies|references|achievements|awards|volunteering)\b[:\s]*$/i;
const DATED = /\b(?:19|20)\d{2}\b|\b(?:present|current|to date|ongoing)\b/i;

const escapeRe = (s: string) => s.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');

export function analyseText(text: string, src: AnalysedCv['src'] = null): AnalysedCv {
  const t = text.replace(/ /g, ' ');
  const ls = lines(t);
  const words = t.split(/\s+/).filter(Boolean).length;
  const low = t.toLowerCase();

  // weak verbs — real lines from their CV
  const weak: WeakVerb[] = [];
  WEAK_PATTERNS.forEach((p) => {
    p.re.lastIndex = 0;
    let m: RegExpExecArray | null, taken = 0;
    while ((m = p.re.exec(t)) && taken < 2) {
      const { pre, post } = sentenceAround(t, m.index, m[0].length);
      if ((pre + post).trim().length < 12) continue;
      weak.push({ id: 'wv' + weak.length, pre, word: m[0], post, alts: p.alts });
      taken++;
    }
  });

  // things to cut
  const cuts: Cut[] = [];
  const found = BUZZWORDS.filter((b) => new RegExp('\\b' + escapeRe(b), 'i').test(t));
  if (found.length) {
    const i = low.indexOf(found[0]);
    const { pre, post } = sentenceAround(t, i, found[0].length);
    cuts.push({ id: 'cu1', kind: 'Buzzwords', found: found.slice(0, 4).join(' · '), pre, word: t.substr(i, found[0].length), post,
      after: 'Replace the claim with the evidence behind it: what you did, and the number that proves it.' });
  }
  // match position, not a string search: "I" also lives inside names like PRIYA,
  // and an all-caps run is a heading or a name, never a pronoun.
  const pre2 = /\b(I|I'm|my)\b/g;
  let pm: string | null = null, pmi = -1, m2: RegExpExecArray | null;
  while ((m2 = pre2.exec(t))) {
    const around = t.slice(Math.max(0, m2.index - 2), m2.index + m2[0].length + 2);
    if (/^[A-Z\s]+$/.test(around)) continue;
    pm = m2[0]; pmi = m2.index; break;
  }
  if (pm) {
    const { pre, post } = sentenceAround(t, pmi, pm.length);
    const n = [...t.matchAll(/\b(I|my)\b/g)].filter((x) => !/^[A-Z\s]+$/.test(t.slice(Math.max(0, x.index! - 2), x.index! + x[0].length + 2))).length;
    cuts.push({ id: 'cu2', kind: 'Personal pronouns', found: `${n} found`, pre, word: pm, post,
      after: 'Rewrite without “I” or “my”. UK CVs drop them entirely.' });
  }
  const rm = t.match(/references\s+(?:are\s+)?available\s+(?:up)?on\s+request\.?/i);
  if (rm) {
    cuts.push({ id: 'cu3', kind: 'Unnecessary line', found: 'References line', pre: '', word: rm[0], post: '',
      after: 'Delete the line. The space goes to your achievements.' });
  }

  // numbers in bullets. If the CV uses real bullet markers, those ARE the bullets.
  // Only a CV written in paragraphs falls back to "long line" (never a header or a dated role line).
  const marked = ls.filter((l) => /^[-•·*●]|^\d+[.)]\s/.test(l));
  const bulletLines = marked.length ? marked
    : ls.filter((l) => l.length > 40 && l.length < 300 && !/:$/.test(l) && !DATED.test(l) && !ANYHEAD.test(l));
  const dateish = (l: string) => l
    .replace(/\b(19|20)\d{2}\b/g, ' ')
    .replace(/\b\d{1,2}[/.-]\d{1,2}([/.-]\d{2,4})?\b/g, ' ')
    .replace(/\b(jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)\w*\s+\d{1,4}\b/gi, ' ');
  const quantified = bulletLines.filter((l) => /\d|%|£|\$|€/.test(dateish(l))).length;

  const usedUS: Spelling[] = [];
  US_SPELLINGS.forEach(([us, uk]) => {
    const re = new RegExp('\\b' + us.trim() + '\\w*', 'gi');
    let m: RegExpExecArray | null;
    while ((m = re.exec(t)) && usedUS.length < 8) {
      if (/^[A-Z\s.&'-]+$/.test(m[0]) && m[0].length > 3) continue;
      const stem = us.trim(), tail = m[0].slice(stem.length);
      const { pre, post } = sentenceAround(t, m.index, m[0].length);
      if (!usedUS.some((x) => x.us.toLowerCase() === m![0].toLowerCase())) usedUS.push({ id: 'sp' + usedUS.length, us: m[0], uk: uk.trim() + tail, pre, post });
      break; /* one example per spelling is enough */
    }
  });

  // do bullets OPEN with a strong verb?
  const strongSet = new Set(STRONG_VERBS);
  const weakOpen = /^(responsible for|worked (?:with|on)|assisted (?:with|in)|helped|supported|involved in|participated in|duties included|tasked with|in charge of)\b/i;
  let bOpenStrong = 0, bOpenWeak = 0, bOpenOther = 0;
  const weakOpeners: string[] = [];
  bulletLines.forEach((l) => {
    const body = l.replace(/^[-•·*●\s]+/, '').replace(/^\d+[.)]\s*/, '');
    if (!body) return;
    const wm = body.match(weakOpen);
    if (wm) { bOpenWeak++; if (weakOpeners.length < 3) weakOpeners.push(wm[0]); return; }
    const first = (body.split(/\s+/)[0] || '').toLowerCase().replace(/[^a-z-]/g, '');
    if (strongSet.has(first) || (/(?:ed|ted|led|ned)$/.test(first) && first.length > 4)) bOpenStrong++;
    else bOpenOther++;
  });
  const bKnown = bOpenStrong + bOpenWeak;
  const verbOpeners: VerbOpeners | null = (bulletLines.length < 3 || bKnown / bulletLines.length < 0.5)
    ? null
    : { strong: bOpenStrong, weak: bOpenWeak, other: bOpenOther, total: bulletLines.length, examples: weakOpeners };

  // is the experience section newest-first?
  const chrono = (() => {
    const start = ls.findIndex((l) => /^(work experience|employment|professional experience|experience)\b[:\s]*$/i.test(l));
    if (start < 0) return null;
    const yrs: number[] = [];
    for (let i = start + 1; i < ls.length; i++) {
      const l = ls[i];
      if (/^(education|academic|qualifications|skills|technical skills|key skills|projects|interests|hobbies|references|achievements|awards|volunteering)\b[:\s]*$/i.test(l)) break;
      if (/^[-•·*●]/.test(l)) continue;
      if (/\b(present|current|to date|ongoing)\b/i.test(l)) { yrs.push(9999); continue; }
      const fy = (l.match(/\b(?:19|20)\d{2}\b/g) || []).map(Number).filter((y) => y >= 1990 && y <= 2035);
      if (fy.length) yrs.push(Math.max(...fy));
    }
    if (yrs.length < 2) return null;
    let ok = true;
    for (let i = 1; i < yrs.length; i++) if (yrs[i] > yrs[i - 1]) ok = false;
    return { ok, years: yrs };
  })();

  const hasUKPhone = /\+44|\b0[17]\d{3}\s?\d{6}\b/.test(t);
  const hasPhone = /\+?\d[\d\s()-]{8,}/.test(t);
  const sections = Object.entries(SECTION_WORDS).filter(([, re]) => re.test(t)).map(([k]) => k);
  const si = ls.findIndex((l) => /^skills?\b|^technical skills|^key skills/i.test(l));
  const skillLines = si >= 0 ? ls.slice(si + 1, si + 7) : [];
  const skillsColumns = skillLines.length ? skillLines.some((l) => /\t|\s{3,}/.test(l)) : null;
  // A4 at 11pt holds roughly 500 words, or about 46 lines once bullets break.
  const pages = Math.max(1, Math.ceil(Math.max(words / 500, ls.length / 46) * 2) / 2);
  let openerWords = 0;
  const hi = ls.findIndex((l) => HEAD.test(l));
  if (hi >= 0) {
    let w = 0;
    for (let i = hi + 1; i < ls.length; i++) { if (ANYHEAD.test(ls[i])) break; w += ls[i].split(/\s+/).filter(Boolean).length; }
    openerWords = w;
  } else {
    const opener = ls.slice(0, 12).find((l) => l.split(/\s+/).length > 25);
    openerWords = opener ? opener.split(/\s+/).length : 0;
  }

  return {
    text: t, src, words, pages, bullets: bulletLines.length, quantified, skillsColumns, verbOpeners, chrono,
    weak, cuts, buzzwords: found, usedUS, hasUKPhone, hasPhone, sections, openerWords,
    at: todayStr(),
  };
}
