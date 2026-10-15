import { wordCount } from './dates';

export const QUESTIONS = [
  { type: 'Teamwork', q: 'Tell me about a time you worked in a team that disagreed. What did you do?' },
  { type: 'Data', q: 'Describe a time you used data to change someone’s mind.' },
  { type: 'Pressure', q: 'Tell me about a deadline you nearly missed. How did you handle it?' },
];

export interface StarAnswer { s: string; t: string; a: string; r: string }

export const EMPTY_STAR: StarAnswer = { s: '', t: '', a: '', r: '' };

export const EXAMPLE_ANSWER: StarAnswer = {
  s: 'In my MSc group project, four of us had to recommend a pricing strategy for a local café chain within three weeks.',
  t: 'Two teammates disagreed on whether to use survey data or sales data, and I was coordinating the report.',
  a: 'I set up a 30-minute call where each side showed one chart. I suggested we test both on last month’s sales, built a quick comparison in Excel, and shared it before the next meeting so everyone could see the numbers first.',
  r: 'We agreed in one meeting, submitted two days early and scored 72%, the highest mark in the cohort.',
};

export interface StarCheck { ok: boolean; good: string; bad: string }

export function starFeedback(v: StarAnswer): StarCheck[] {
  const wc = wordCount;
  return [
    { ok: wc(v.s) >= 10 && wc(v.s) <= 60, good: 'Situation sets the scene briefly', bad: wc(v.s) < 10 ? 'Add context: where, when, who was involved' : 'Situation is long. Trim it to two sentences' },
    { ok: wc(v.t) >= 8, good: 'Your responsibility is clear', bad: 'Say what you personally were responsible for' },
    { ok: wc(v.a) >= 30 && /\bI\b/.test(v.a), good: 'Action is the longest part and focuses on you', bad: wc(v.a) < 30 ? 'Expand the action. It should be the longest part' : 'Use “I” to show your own contribution' },
    { ok: /\d/.test(v.r), good: 'Result is measurable', bad: 'Add a number to the result: %, £, time saved, a grade' },
  ];
}

export const starSignature = (v: StarAnswer) =>
  [v.s, v.t, v.a, v.r].join('|').replace(/\s+/g, ' ').trim().toLowerCase();
