export interface MilestoneCtx {
  score: number;
  cvQuality: number;
  hasCv: boolean;
  streak: number;
  anyDone: boolean;
  anyStageComplete: boolean;
}

export interface Milestone {
  id: string;
  name: string;
  desc: string;
  test: (c: MilestoneCtx) => boolean;
}

export const MILESTONES: Milestone[] = [
  { id: 'm1', name: 'First bearing', desc: 'Completed your first step', test: (c) => c.anyDone },
  { id: 'm2', name: 'Five-day streak', desc: 'Showed up five days running', test: (c) => c.streak >= 5 },
  { id: 'm3', name: 'CV sharpened', desc: 'Your CV quality reached 60', test: (c) => c.hasCv && c.cvQuality >= 60 },
  { id: 'm4', name: 'Seventy club', desc: 'Employability Score of 70', test: (c) => c.score >= 70 },
  { id: 'm5', name: 'Stage cleared', desc: 'Finished a roadmap stage', test: (c) => c.anyStageComplete },
  { id: 'm6', name: 'Job-ready', desc: 'Employability Score of 80', test: (c) => c.score >= 80 },
];

export const MEDAL_HUE: Record<string, string> = {
  m1: '#0A8A7E', m2: '#D07A0E', m3: '#3A3DB0', m4: '#0E7490', m5: '#7C3AED', m6: '#B45309',
};
