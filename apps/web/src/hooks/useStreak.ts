import { useUcai } from '../stores/ucai';
import { daysAgo, todayStr } from '../lib/dates';

export const doneTodayOf = (days: string[]) => days.includes(todayStr());

export const streakOf = (days: string[]) => {
  const off = doneTodayOf(days) ? 0 : 1;
  let n = 0;
  while (days.includes(daysAgo(off + n))) n++;
  return n;
};

export function useStreak() {
  const days = useUcai((s) => s.days);
  const markDayDone = useUcai((s) => s.markDayDone);
  return { days, streak: streakOf(days), doneToday: doneTodayOf(days), markDayDone };
}
