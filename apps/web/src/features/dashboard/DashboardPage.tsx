import { useNavigate } from 'react-router-dom';
import { AlertCircle, Upload, Map, User, ArrowRight, TrendingUp } from 'lucide-react';
import { useScore } from '../../hooks/useScore';
import { useProfile } from '../../hooks/useProfile';
import { useRoadmap } from '../../hooks/useRoadmap';
import { ScoreRing } from '../../components/ui/ScoreRing';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { ProgressBar } from '../../components/ui/ProgressBar';

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
    <div className="animate-fadeIn space-y-6">
      <div className="rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 p-6 text-white shadow-md" aria-live="polite" aria-atomic="true">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm text-brand-100">Your Employability Score</p>
            <p className="text-5xl font-bold">{scoreLoading ? '--' : totalScore}</p>
            {score && (
              <div className="inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-sm font-medium">
                <TrendingUp className="h-3.5 w-3.5 text-success-300" />
                <span className="text-success-200">+0 points this week</span>
              </div>
            )}
          </div>
          <ScoreRing value={scoreLoading ? 0 : totalScore} size="lg" />
        </div>
      </div>

      {isPartial && (
        <div className="rounded-xl border border-warning-200 bg-warning-50 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-warning-600" />
            <div className="flex-1">
              <p className="font-medium text-warning-800">Partial Score</p>
              <p className="mt-1 text-sm text-warning-600">
                {!profile
                  ? 'Complete your profile to unlock your full employability score.'
                  : 'Upload your CV and generate your roadmap for a complete assessment.'}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {!profile && (
                  <button onClick={() => navigate('/onboarding')}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-warning-300 bg-white px-3 py-1.5 text-sm font-medium text-warning-700 hover:bg-warning-50">
                    <User className="h-3.5 w-3.5" /> Complete Profile
                  </button>
                )}
                <button onClick={() => navigate('/cv-analysis')}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-warning-300 bg-white px-3 py-1.5 text-sm font-medium text-warning-700 hover:bg-warning-50">
                  <Upload className="h-3.5 w-3.5" /> Upload CV
                </button>
                <button onClick={() => navigate('/roadmap')}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-warning-300 bg-white px-3 py-1.5 text-sm font-medium text-warning-700 hover:bg-warning-50">
                  <Map className="h-3.5 w-3.5" /> View Roadmap
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Card>
        <h3 className="mb-4 font-semibold text-slate-800">Score Breakdown</h3>
        <div className="space-y-4">
          {components ? (
            Object.entries(categoryConfig).map(([key, cfg]) => {
              const val = (components as any)[key] ?? 0;
              const w = (weights as any)?.[key] ?? 0;
              const isAssessed = val > 0 || key === 'platformActivity';
              return (
                <div key={key} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-700">{cfg.label}</span>
                    <span className="text-sm font-medium text-slate-600">
                      {isAssessed ? `${Math.round(val)}/100` : 'Not assessed yet'}
                    </span>
                  </div>
                  <ProgressBar
                    value={isAssessed ? val : 0}
                    colorClass={isAssessed ? cfg.colorClass : 'bg-slate-200'}
                    size="sm"
                  />
                  {isAssessed && (
                    <p className="text-xs text-slate-400">
                      Weight: {Math.round(w * 100)}% &middot; Contribution: {Math.round(val * w)} pts
                    </p>
                  )}
                </div>
              );
            })
          ) : (
            <p className="py-4 text-center text-sm text-slate-400">
              {scoreLoading ? 'Loading...' : 'Submit your profile to see the breakdown.'}
            </p>
          )}
        </div>
      </Card>

      {topTasks.length > 0 && (
        <Card>
          <h3 className="mb-4 font-semibold text-slate-800">Top 3 Actions to Raise Your Score</h3>
          <div className="space-y-2">
            {topTasks.map((task: any, idx: number) => (
              <button
                key={task.id}
                onClick={() => navigate('/roadmap')}
                className="group flex w-full items-center gap-3 rounded-lg bg-slate-50 p-3 text-left transition-colors hover:bg-brand-50"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-600">
                  {idx + 1}
                </div>
                <div className="flex-1 truncate">
                  <p className="text-sm font-medium text-slate-800">{task.title}</p>
                  <span className="text-xs text-slate-500">{task.phase}</span>
                </div>
                <Badge variant="success">+{task.pointsValue} pts</Badge>
                <ArrowRight className="h-4 w-4 flex-shrink-0 text-slate-400 group-hover:text-brand-500" />
              </button>
            ))}
          </div>
        </Card>
      )}

      {!scoreLoading && topTasks.length === 0 && components && (
        <Card className="text-center py-8" aria-live="polite">
          <p className="mt-2 text-sm text-slate-500">All caught up! Great work.</p>
        </Card>
      )}
    </div>
  );
}
