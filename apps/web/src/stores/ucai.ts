import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AnalysedCv } from '../lib/cv-analyser';
import type { StarAnswer, StarCheck } from '../lib/interview';
import { EMPTY_STAR } from '../lib/interview';
import { todayStr } from '../lib/dates';
import type { Role } from '../lib/industry';

export type Theme = 'light' | 'dim' | 'dark';
export type BadgeStyle = 'ink' | 'teal' | 'paper';
export type JobFilter = 'All' | 'Graduate scheme' | 'Internship' | 'Placement' | 'Saved' | 'Applied' | 'Sponsor';
export type JobSort = 'match' | 'close' | 'pay';

export interface CvVersion {
  analysisId: string | null;
  file: string;
  at: string;
  score: number;
  cats: { impact: number; clarity: number; uk: number };
  checks: Record<string, 'pass' | 'fail'>;
  words: number | null;
}

export interface WcState {
  swaps: Record<string, string>;
  cut: string[];
  spell: string[];
}

export interface IvLast { q: number; items: StarCheck[]; repeat: boolean }

export interface UcaiData {
  theme: Theme | null;
  premium: boolean;
  name: string;
  last: string;
  role: Role;
  days: string[];
  skip: number;
  unlocked: string[];
  regen: number;
  regenMonth: string;
  jobFilter: JobFilter;
  jobQ: string;
  jobSort: JobSort;
  badgeV: BadgeStyle;
  notif: { daily: boolean; jobs: boolean; weekly: boolean };
  cvAnalysisId: string | null;
  cvFile: string | null;
  cv: AnalysedCv | null;
  cvVersions: CvVersion[];
  cvAcks: string[];
  wc: WcState;
  ivQ: number;
  star: StarAnswer;
  ivLast: IvLast | null;
  ivSeen: string[];
  practised: number;
  start: { score: number; date: string } | null;
  onboarded: boolean;
  /** Set once the milestones already earned were recorded silently on first run. */
  milestonesSeeded: boolean;
}

interface UcaiActions {
  patch: (p: Partial<UcaiData>) => void;
  /** Records today as an active day. Returns true when today was not already counted. */
  markDayDone: () => boolean;
  /** Clears all local progress, keeping the theme. */
  resetProgress: () => void;
}

export type UcaiState = UcaiData & UcaiActions;

const thisMonth = () => todayStr().slice(0, 7);

export const DEFAULTS: UcaiData = {
  theme: 'light',
  premium: false,
  name: '',
  last: '',
  role: 'Business Analyst',
  days: [],
  skip: 0,
  unlocked: [],
  regen: 1,
  regenMonth: thisMonth(),
  jobFilter: 'All',
  jobQ: '',
  jobSort: 'match',
  badgeV: 'ink',
  notif: { daily: true, jobs: true, weekly: false },
  cvAnalysisId: null,
  cvFile: null,
  cv: null,
  cvVersions: [],
  cvAcks: [],
  wc: { swaps: {}, cut: [], spell: [] },
  ivQ: 0,
  star: { ...EMPTY_STAR },
  ivLast: null,
  ivSeen: [],
  practised: 0,
  start: null,
  onboarded: false,
  milestonesSeeded: false,
};

export const useUcai = create<UcaiState>()(
  persist(
    (set, get) => ({
      ...DEFAULTS,
      patch: (p) => set(p),
      markDayDone: () => {
        const t = todayStr();
        if (get().days.includes(t)) return false;
        set({ days: [...get().days, t].slice(-90) });
        return true;
      },
      resetProgress: () => set({ ...DEFAULTS, theme: get().theme, regenMonth: thisMonth() }),
    }),
    {
      name: 'ucai',
      version: 1,
      partialize: (s) => {
        const { patch: _p, markDayDone: _m, resetProgress: _r, ...data } = s;
        return data;
      },
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<UcaiData>;
        return {
          ...current,
          ...p,
          notif: { ...DEFAULTS.notif, ...(p.notif ?? {}) },
          star: { ...EMPTY_STAR, ...(p.star ?? {}) },
          wc: { swaps: {}, cut: [], spell: [], ...(p.wc ?? {}) },
          days: Array.isArray(p.days) ? p.days : [],
          unlocked: Array.isArray(p.unlocked) ? p.unlocked : [],
          cvVersions: Array.isArray(p.cvVersions) ? p.cvVersions : [],
          cvAcks: Array.isArray(p.cvAcks) ? p.cvAcks : [],
          ivSeen: Array.isArray(p.ivSeen) ? p.ivSeen : [],
        };
      },
    },
  ),
);

/** Free regenerations reset monthly. */
export function regenLeft(s: Pick<UcaiData, 'regen' | 'regenMonth' | 'premium'>) {
  if (s.premium) return Infinity;
  return s.regenMonth === thisMonth() ? s.regen : 1;
}
