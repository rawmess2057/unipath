/* Maps the API's Claude analysis (rawResponse) onto the prototype's three
   categories (Impact / Clarity / UK fit) with pass/fail check rows. */

import type { CvAnalysisRow } from '../hooks/useCvAnalysis';
import type { CvVersion } from '../stores/ucai';
import { todayStr } from './dates';

export type CatId = 'impact' | 'clarity' | 'uk';

export interface Check {
  key: string;
  cat: CatId;
  n: string;
  pass: boolean;
  /** Score out of 10 for this row. */
  pts: number;
  bad: string;
  good: string;
  how?: string;
  before?: string;
  after?: string;
  ukStandard?: string;
  /** Route that fixes this (Word check). */
  to?: string;
  /** The student marked this fixed locally; the API score does not know yet. */
  acked: boolean;
  severity?: 'critical' | 'important' | 'minor';
}

export interface Cat { id: CatId; name: string; hint: string; score: number; items: Check[] }

export interface CvView {
  analysisId: string;
  file: string;
  score: number;
  cats: Cat[];
  all: Check[];
  fixFirst: Check | null;
  wins: { n: string; sub: string }[];
  passCount: number;
  summary: string;
  strengths: string[];
  priority: string[];
  ackCount: number;
}

const SEV_PTS = { critical: 2, important: 4, minor: 6 } as const;
const ACK_PTS = 9;

const CHECKLIST: [keyof NonNullable<CvAnalysisRow['complianceChecklist']>, string, string, string][] = [
  ['no_photo', 'No photo', 'Matches UK norms', 'Remove the photo. UK employers don’t expect one, and some screen them out to avoid bias.'],
  ['no_age_or_dob', 'No age or date of birth', 'Matches UK norms', 'Delete your age and date of birth. They are never asked for on a UK CV.'],
  ['no_marital_status', 'No marital status', 'Matches UK norms', 'Remove marital status, nationality and similar personal details.'],
  ['uk_date_format', 'UK date format', 'Dates read as a UK recruiter expects', 'Write dates as Sep 2025 – Jun 2027 or 12/03/2025, never month-first.'],
  ['appropriate_length', 'Two pages or fewer', 'Within 2 pages', 'UK graduate recruiters expect one or two pages and stop reading at three.'],
  ['clear_contact_info', 'Clear contact details', 'Email and phone are easy to find', 'Put your email and a +44 phone number at the top, on one line.'],
];

const listOf = (arr: string[], n: number) => arr.slice(0, n).join(', ') + (arr.length > n ? ` and ${arr.length - n} more` : '');

export function buildCvView(a: CvAnalysisRow | null, cvQuality: number, acks: string[]): CvView | null {
  if (!a || a.status !== 'completed' || !a.rawResponse) return null;
  const r = a.rawResponse;
  const key = (cat: CatId, n: string) => `${cat}:${n}`;
  const mk = (cat: CatId, partial: Omit<Check, 'key' | 'cat' | 'acked'> ): Check => {
    const k = key(cat, partial.n);
    const acked = !partial.pass && acks.includes(k);
    return { ...partial, key: k, cat, acked, pass: partial.pass || acked, pts: acked ? ACK_PTS : partial.pts };
  };
  const fromFeedback = (cat: CatId, items: { issue: string; severity: 'critical' | 'important' | 'minor'; suggestion: string; example_from_cv?: string; uk_standard?: string }[]) =>
    items.map((f) => mk(cat, {
      n: f.issue, pass: false, pts: SEV_PTS[f.severity], bad: f.suggestion, good: 'You’ve marked this done.',
      how: f.suggestion, before: f.example_from_cv, after: f.example_from_cv ? f.suggestion : undefined, ukStandard: f.uk_standard, severity: f.severity,
    }));

  const impact: Check[] = [
    ...fromFeedback('impact', r.keywords.feedback),
    ...(r.keywords.keywords_present.length ? [mk('impact', { n: 'Industry keywords present', pass: true, pts: 9, bad: '', good: `Found: ${listOf(r.keywords.keywords_present, 4)}` })] : []),
    ...(r.keywords.missing_keywords.length && !r.keywords.feedback.some((f) => /keyword/i.test(f.issue))
      ? [mk('impact', { n: 'Industry keywords to add', pass: false, pts: 5, bad: `Missing: ${listOf(r.keywords.missing_keywords, 4)}`, good: 'Keywords added', how: `Add these where you genuinely used them: ${listOf(r.keywords.missing_keywords, 6)}.`, severity: 'important' })]
      : []),
  ];
  const verbsMissing = r.clarity.action_verbs_missing ?? [];
  const verbsUsed = r.clarity.action_verbs_used ?? [];
  const clarity: Check[] = [
    ...fromFeedback('clarity', r.structure.feedback),
    ...fromFeedback('clarity', r.clarity.feedback),
    ...(r.structure.good_practices_observed ?? []).map((g) => mk('clarity', { n: g, pass: true, pts: 9, bad: '', good: 'Seen in your CV' })),
    ...(verbsUsed.length || verbsMissing.length
      ? [verbsMissing.length > 3
        ? mk('clarity', { n: 'Bullets open with strong action verbs', pass: false, pts: 5, bad: `Try verbs such as ${listOf(verbsMissing, 3)}`, good: 'Strong, varied verbs', to: '/wordcheck', severity: 'important' })
        : mk('clarity', { n: 'Bullets open with strong action verbs', pass: true, pts: 8, bad: '', good: verbsUsed.length ? `${listOf(verbsUsed, 3)}: good variety` : 'Good variety' })]
      : []),
  ];
  const cl = r.uk_conventions.compliance_checklist;
  const uk: Check[] = [
    ...fromFeedback('uk', r.uk_conventions.feedback),
    ...CHECKLIST.map(([k, n, good, how]) => mk('uk', { n, pass: !!cl[k], pts: cl[k] ? 10 : 5, bad: how, good, how, severity: 'important' })),
  ];

  const cats: Cat[] = [
    { id: 'impact', name: 'Impact', hint: 'Evidence of results', score: Math.round((r.keywords.score ?? 0) * 4), items: impact },
    { id: 'clarity', name: 'Clarity', hint: 'Easy for people and software to read', score: Math.round(((r.structure.score ?? 0) + (r.clarity.score ?? 0)) * 2), items: clarity },
    { id: 'uk', name: 'UK fit', hint: 'Matches what UK recruiters expect', score: Math.round((r.uk_conventions.score ?? 0) * 4), items: uk },
  ];
  const all = cats.flatMap((c) => c.items);
  const failing = all.filter((x) => !x.pass);
  const fixFirst = failing.find((x) => x.severity === 'critical') ?? failing.slice().sort((a, b) => a.pts - b.pts || a.n.localeCompare(b.n))[0] ?? null;
  const wins = [
    ...r.overall_assessment.strengths.map((s) => ({ n: s, sub: 'Seen in your CV' })),
    ...all.filter((x) => x.pass && !x.acked).sort((a, b) => b.pts - a.pts).slice(0, 1).map((x) => ({ n: x.n, sub: x.good })),
  ].slice(0, 3);

  return {
    analysisId: a.id, file: a.originalFileName ?? 'your CV', score: Math.round(cvQuality), cats, all, fixFirst, wins,
    passCount: all.filter((x) => x.pass).length, summary: r.overall_assessment.summary,
    strengths: r.overall_assessment.strengths, priority: r.overall_assessment.priority_improvements,
    ackCount: all.filter((x) => x.acked).length,
  };
}

/** A version record: the per-check verdicts at the moment of upload. */
export function snapshotVersion(v: CvView, words: number | null): CvVersion {
  const checks: Record<string, 'pass' | 'fail'> = {};
  v.all.forEach((x) => { checks[x.n] = x.pass && !x.acked ? 'pass' : 'fail'; });
  return {
    analysisId: v.analysisId, file: v.file, at: todayStr(), score: v.score,
    cats: { impact: v.cats[0].score, clarity: v.cats[1].score, uk: v.cats[2].score }, checks, words,
  };
}

export interface VerDiff { fixed: string[]; slipped: string[]; any: number }

export function verDiff(now: CvVersion, prev: CvVersion | undefined): VerDiff | null {
  if (!prev) return null;
  const d: VerDiff = { fixed: [], slipped: [], any: 0 };
  Object.keys(now.checks).forEach((n) => {
    const a = prev.checks[n], b = now.checks[n];
    if (a === undefined || a === b) return;
    if (a === 'fail' && b === 'pass') d.fixed.push(n);
    else if (a === 'pass' && b === 'fail') d.slipped.push(n);
  });
  d.any = d.fixed.length + d.slipped.length;
  return d;
}
