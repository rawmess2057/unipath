export const dkey = (d: Date) =>
  d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');

export const todayStr = () => dkey(new Date());

export const daysAgo = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return dkey(d);
};

/** "20 min", "1.5 hr", or a label such as "1 week" when the effort is not in minutes. */
export const fmtMins = (m: number | string) =>
  typeof m === 'string' ? m : m < 60 ? m + ' min' : m / 60 + ' hr';

export const dateLong = () =>
  new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });

export const monthShortYear = (d: Date = new Date()) =>
  d.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });

/** "14 Nov" */
export const dayMonth = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

/** "Closes 14 Nov" or "Rolling" when there is no deadline. */
export const closesLabel = (iso: string | null | undefined) => (iso ? 'Closes ' + dayMonth(iso) : 'Rolling');

/** "September 2027" from an ISO date; empty string when missing/invalid. */
export const monthYearLong = (iso: string | null | undefined) => {
  if (!iso) return '';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
};

/** "2027-09" from an ISO date, for <input type="month">. */
export const toMonthInput = (iso: string | null | undefined) => {
  if (!iso) return '';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 7);
};

export const longDate = (d: Date = new Date()) =>
  d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

export const wordCount = (s: string | undefined | null) => (s || '').trim().split(/\s+/).filter(Boolean).length;
