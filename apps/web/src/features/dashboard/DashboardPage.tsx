import { useNavigate } from 'react-router-dom';
import { AlertCircle, Upload, Map, User, ArrowRight, TrendingUp, Flame } from 'lucide-react';
import { useScore } from '../../hooks/useScore';
import { useProfile } from '../../hooks/useProfile';
import { useRoadmap } from '../../hooks/useRoadmap';
import { PageTransition } from '../../components/animations/PageTransition';
import { ScoreRing } from '../../components/ui/ScoreRing';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { LevelBadge, getNextLevel } from '../../components/ui/LevelBadge';

export function DashboardPage() {
  const navigate = useNavigate();
  const { data: score, isLoading: scoreLoading } = useScore();
  const { data: profile } = useProfile();
  const { data: roadmap } = useRoadmap();

  const tasks = (roadmap as any)?.tasks ?? [];
  const completedTasks = tasks.filter((t: any) => t.completed).length;
  const topTasks = tasks.filter((t: any) => !t.completed).slice(0, 3);

  const isPartial = !profile || !roadmap;
  const totalScore = score?.totalScore ?? 0;
  const components = score?.components;
  const weights = score?.weights;

  const categoryConfig: Record<string, { label: string; colorClass: string }> = {
    cvQuality: { label: 'CV Quality', colorClass: 'bg-slate-400' },
    skillsMatch: { label: 'Skills Match', colorClass: 'bg-success-500' },
    workExperience: { label: 'Work Experience', colorClass: 'bg-brand-500' },
    certifications: { label: 'Certifications', colorClass: 'bg-visa-500' },
    platformActivity: { label: 'Platform Activity', colorClass: 'bg-warning-500' },
  };

  return (
    <PageTransition><div className="space-y-6">
      <div className="animate-scaleIn rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 p-6 text-white shadow-2xl" aria-live="polite" aria-atomic="true">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm text-brand-100">Your Employability Score</p>
            <div className="flex items-center gap-2">
              <p className="text-5xl font-bold">{scoreLoading ? '--' : totalScore}</p>
              {score && <LevelBadge score={totalScore} />}
            </div>
            {score && (
              <>
                <div className="inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-sm font-medium">
                  <TrendingUp className="h-3.5 w-3.5 text-success-300" />
                  <span className="text-success-200">+0 points this week</span>
                </div>
                {(() => {
                  const next = getNextLevel(totalScore);
                  if (!next) return null;
                  return (
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-brand-200">
                        <span>Next: {next.label}</span>
                        <span>{Math.round(next.progress)}%</span>
                      </div>
                      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-white/20">
                        <div
                          className="h-full rounded-full bg-white/60 transition-all duration-1000"
                          style={{ width: `${next.progress}%` }}
                        />
                      </div>
                    </div>
                  );
                })()}
              </>
            )}
          </div>
          <div className="flex flex-col items-center gap-2">
            <ScoreRing value={scoreLoading ? 0 : totalScore} size="lg" />
          </div>
        </div>
      </div>

      {isPartial && (
        <div className="rounded-xl border border-warning-500/30 bg-warning-500/10 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-warning-400" />
            <div className="flex-1">
              <p className="font-medium text-warning-300">Partial Score</p>
              <p className="mt-1 text-sm text-warning-200">
                {!profile
                  ? 'Complete your profile to unlock your full employability score.'
                  : 'Upload your CV and generate your roadmap for a complete assessment.'}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {!profile && (
                  <button onClick={() => navigate('/onboarding')}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-warning-500/30 bg-transparent px-3 py-1.5 text-sm font-medium text-warning-300 hover:bg-warning-500/20">
                    <User className="h-3.5 w-3.5" /> Complete Profile
                  </button>
                )}
                <button onClick={() => navigate('/cv-analysis')}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-warning-500/30 bg-transparent px-3 py-1.5 text-sm font-medium text-warning-300 hover:bg-warning-500/20">
                  <Upload className="h-3.5 w-3.5" /> Upload CV
                </button>
                <button onClick={() => navigate('/roadmap')}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-warning-500/30 bg-transparent px-3 py-1.5 text-sm font-medium text-warning-300 hover:bg-warning-500/20">
                  <Map className="h-3.5 w-3.5" /> View Roadmap
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="animate-slideUp" style={{ animationDelay: '100ms' }}>
        <Card variant="glass">
          <h3 className="mb-4 font-semibold text-white">Score Breakdown</h3>
          <div className="space-y-4">
            {components ? (
              Object.entries(categoryConfig).map(([key, cfg], idx) => {
                const val = (components as any)[key] ?? 0;
                const w = (weights as any)?.[key] ?? 0;
                const isAssessed = val > 0 || key === 'platformActivity';
                return (
                  <div key={key} className="space-y-1.5" style={{ animationDelay: `${200 + idx * 100}ms` }}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-brand-100">{cfg.label}</span>
                      <span className="text-sm font-medium text-white/70">
                        {isAssessed ? `${Math.round(val)}/100` : 'Not assessed yet'}
                      </span>
                    </div>
                    <ProgressBar
                      value={isAssessed ? val : 0}
                      colorClass={isAssessed ? cfg.colorClass : 'bg-white/10'}
                      size="sm"
                    />
                    {isAssessed && (
                      <p className="text-xs text-brand-200/60">
                        Weight: {Math.round(w * 100)}% &middot; Contribution: {Math.round(val * w)} pts
                      </p>
                    )}
                  </div>
                );
              })
            ) : (
              <p className="py-4 text-center text-sm text-brand-200/60">
                {scoreLoading ? 'Loading...' : 'Submit your profile to see the breakdown.'}
              </p>
            )}
          </div>
        </Card>
      </div>

      {topTasks.length > 0 && (
        <div className="animate-slideUp" style={{ animationDelay: '300ms' }}>
          <Card variant="glass">
            <h3 className="mb-4 font-semibold text-white">Top 3 Actions to Raise Your Score</h3>
            <div className="space-y-2">
              {topTasks.map((task: any, idx: number) => (
                <button
                  key={task.id}
                  onClick={() => navigate('/roadmap')}
                  className="group flex w-full items-center gap-3 rounded-lg bg-white/5 p-3 text-left transition-all duration-200 hover:bg-white/10 hover:-translate-y-0.5"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-500/20 text-sm font-bold text-brand-300">
                    {idx + 1}
                  </div>
                  <div className="flex-1 truncate">
                    <p className="text-sm font-medium text-white">{task.title}</p>
                    <span className="text-xs text-brand-200">{task.phase}</span>
                  </div>
                  <Badge variant="success">+{task.pointsValue} pts</Badge>
                  <ArrowRight className="h-4 w-4 flex-shrink-0 text-brand-200/60 group-hover:text-brand-300 group-hover:translate-x-0.5 transition-transform" />
                </button>
              ))}
            </div>
          </Card>
        </div>
      )}

      {!scoreLoading && topTasks.length === 0 && components && (
        <Card variant="glass" className="text-center py-8" aria-live="polite">
          <p className="mt-2 text-sm text-brand-200">All caught up! Great work.</p>
        </Card>
      )}
    </div></PageTransition>
  );
}
