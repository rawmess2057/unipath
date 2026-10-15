import { dkey } from '../lib/dates';

export function WeekDots({ days }: { days: string[] }) {
  const L = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const items: { key: string; on: boolean; today: boolean; label: string }[] = [];
  let count = 0;
  for (let ago = 6; ago >= 0; ago--) {
    const d = new Date(); d.setDate(d.getDate() - ago);
    const k = dkey(d), on = days.includes(k);
    if (on) count++;
    items.push({ key: k, on, today: ago === 0, label: L[d.getDay()] });
  }
  return (
    <div className="week" role="img" aria-label={`Active on ${count} of the last 7 days`}>
      {items.map((it) => (
        <div key={it.key} className={`day${it.on ? ' on' : ''}${it.today ? ' today' : ''}`}><i />{it.label}</div>
      ))}
    </div>
  );
}
