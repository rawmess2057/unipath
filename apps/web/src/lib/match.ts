import type { Opportunity } from '@unipath/shared';
import { INDUSTRY_TO_OPP, EMPLOYMENT_LABEL, normalizeIndustry } from './industry';
import { clamp } from './score';
import { closesLabel } from './dates';

const LOGO_COLOURS = ['#3A3DB0', '#0A8A7E', '#C2410C', '#0F766E', '#1D4ED8', '#A16207'];

export interface Job {
  id: string;
  title: string;
  co: string;
  ab: string;
  col: string;
  loc: string;
  pay: string;
  payNum: number;
  close: string;
  closeIso: string | null;
  match: number;
  tags: string[];
  type: string;
  sponsor: boolean;
  sponsorNote: string | null;
  have: string[];
  gap: string[];
  reqTotal: number;
  levelLabel: 'Ideal' | 'Good';
  locLabel: 'Flexible' | 'Commutable';
  saved: boolean;
  applied: boolean;
  url: string | null;
  description: string;
}

const hash = (s: string) => [...s].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);

const initials = (co: string) =>
  co.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase() || 'CO';

export interface MatchProfile { skills: string[]; targetIndustry: unknown }

export function scoreJob(o: Opportunity, profile: MatchProfile | null | undefined): Job {
  const reqs = (o.requirements ?? []).map((r) => String(r));
  const skills = (profile?.skills ?? []).map((s) => s.toLowerCase().trim()).filter(Boolean);
  const have: string[] = [];
  const gap: string[] = [];
  for (const r of reqs) {
    const rl = r.toLowerCase();
    const hit = skills.find((s) => rl.includes(s) || (s.length > 3 && s.includes(rl)));
    if (hit) have.push(r); else gap.push(r);
  }
  const skillsPart = reqs.length ? have.length / reqs.length : 0.7;
  const industryPart = INDUSTRY_TO_OPP[normalizeIndustry(profile?.targetIndustry)] === o.industry ? 1 : 0.6;
  const levelPart = o.employmentType === 'graduate' ? 1 : 0.85;
  const visaPart = o.visaSuitable ? 1 : 0.7;
  const match = clamp(40, 98, Math.round(100 * (0.5 * skillsPart + 0.25 * industryPart + 0.15 * levelPart + 0.1 * visaPart)));
  const payNum = Number((o.salaryRange ?? '').replace(/,/g, '').match(/\d{4,6}/)?.[0] ?? 0);
  const typeLabel = EMPLOYMENT_LABEL[o.employmentType] ?? o.employmentType;
  return {
    id: o.id, title: o.title, co: o.company, ab: initials(o.company), col: LOGO_COLOURS[hash(o.company) % LOGO_COLOURS.length],
    loc: o.location, pay: o.salaryRange ?? 'Salary not listed', payNum,
    close: closesLabel(o.deadline), closeIso: o.deadline, match,
    tags: [typeLabel, ...(o.visaSuitable ? ['Visa suitable'] : [])], type: o.employmentType,
    sponsor: o.visaSuitable, sponsorNote: o.sponsorshipNote,
    have, gap, reqTotal: reqs.length,
    levelLabel: o.employmentType === 'graduate' ? 'Ideal' : 'Good',
    locLabel: /remote|hybrid/i.test(o.location) ? 'Flexible' : 'Commutable',
    saved: o.status !== null && o.status !== 'removed',
    applied: o.status === 'applied',
    url: o.applicationUrl, description: o.description,
  };
}
