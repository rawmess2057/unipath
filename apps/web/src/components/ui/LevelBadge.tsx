import { Trophy, Medal, Award, Sparkles } from 'lucide-react';

interface LevelInfo {
  label: string;
  icon: typeof Trophy;
  color: string;
  textColor: string;
  bgColor: string;
  minScore: number;
}

export function getNextLevel(score: number): { label: string; from: number; to: number; progress: number } | null {
  const next = [26, 51, 76].find(t => score < t);
  if (!next) return null;
  const prev = next === 26 ? 0 : next === 51 ? 26 : 51;
  const progress = ((score - prev) / (next - prev)) * 100;
  const labels: Record<number, string> = { 26: 'Silver', 51: 'Gold', 76: 'Platinum' };
  return { label: labels[next], from: prev, to: next, progress };
}

const levels: LevelInfo[] = [
  { label: 'Bronze', icon: Trophy, color: 'text-amber-700', textColor: 'text-amber-800', bgColor: 'bg-amber-100', minScore: 0 },
  { label: 'Silver', icon: Medal, color: 'text-slate-500', textColor: 'text-slate-700', bgColor: 'bg-slate-100', minScore: 26 },
  { label: 'Gold', icon: Award, color: 'text-amber-500', textColor: 'text-yellow-700', bgColor: 'bg-yellow-100', minScore: 51 },
  { label: 'Platinum', icon: Sparkles, color: 'text-brand-500', textColor: 'text-brand-700', bgColor: 'bg-brand-100', minScore: 76 },
];

function getLevel(score: number): LevelInfo {
  if (score >= 76) return levels[3];
  if (score >= 51) return levels[2];
  if (score >= 26) return levels[1];
  return levels[0];
}

interface LevelBadgeProps {
  score: number;
}

export function LevelBadge({ score }: LevelBadgeProps) {
  const level = getLevel(score);
  const Icon = level.icon;

  return (
    <div className={`inline-flex items-center gap-1.5 rounded-full ${level.bgColor} px-3 py-1`}>
      <Icon className={`h-3.5 w-3.5 ${level.color}`} />
      <span className={`text-xs font-semibold ${level.textColor}`}>{level.label}</span>
    </div>
  );
}
