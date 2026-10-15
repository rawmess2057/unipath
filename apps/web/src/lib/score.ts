export const band = (s: number) =>
  s >= 80 ? 'Job-ready' : s >= 60 ? 'Strong heading' : s >= 40 ? 'On course' : 'Getting your bearings';

export const nextBand = (s: number) => {
  const t = [40, 60, 80, 100].find((x) => x > s) || 100;
  const from = [0, 40, 60, 80].filter((x) => x <= s).pop() ?? 0;
  return { at: t, name: band(t === 100 ? 100 : t), from };
};

/** Progress (0-100) towards the next band. */
export const bandProgress = (s: number) => {
  if (s >= 80) return 100;
  const nb = nextBand(s);
  return Math.round(((s - nb.from) / (nb.at - nb.from)) * 100);
};

export const cvBand = (s: number) => (s >= 75 ? 'Strong' : s >= 60 ? 'Good · a few fixes away' : 'Needs work');

export const fitTier = (p: number): 'hi' | 'mid' | 'lo' => (p >= 85 ? 'hi' : p >= 72 ? 'mid' : 'lo');
export const fitName = (p: number) => (p >= 85 ? 'Strong fit' : p >= 72 ? 'Good fit' : 'Stretch role');

export const greet = () => {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
};

/** 'lo' | 'mid' | 'hi' for a score out of 10. */
export const tier10 = (v: number) => (v <= 4 ? 'lo' : v <= 7 ? 'mid' : 'hi');
/** 'lo' | 'mid' | 'hi' for a score out of 100. */
export const tier100 = (v: number) => (v < 50 ? 'lo' : v < 75 ? 'mid' : 'hi');

export const plural = (n: number, w: string) => n + ' ' + w + (n === 1 ? '' : 's');

export const clamp = (lo: number, hi: number, v: number) => Math.max(lo, Math.min(hi, v));
