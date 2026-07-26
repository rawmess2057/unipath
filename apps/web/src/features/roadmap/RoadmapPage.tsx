import { Target, Compass, Rocket, Circle, CheckCircle2, Shield, Clock, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useRoadmap, useGenerateRoadmap, useToggleTask } from '../../hooks/useRoadmap';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Modal } from '../../components/ui/Modal';
import { toast } from 'sonner';
import { useState } from 'react';

const phaseConfig = {
  foundation: { label: 'Foundation', icon: Target, bg: 'bg-blue-50', text: 'text-blue-700', iconBg: 'bg-blue-500', barColor: 'bg-blue-500' },
  preparation: { label: 'Preparation', icon: Compass, bg: 'bg-amber-50', text: 'text-amber-700', iconBg: 'bg-amber-500', barColor: 'bg-amber-500' },
  application: { label: 'Application', icon: Rocket, bg: 'bg-emerald-50', text: 'text-emerald-700', iconBg: 'bg-emerald-500', barColor: 'bg-emerald-500' },
};

export function RoadmapPage() {
  const { data: roadmap, isLoading } = useRoadmap();
  const generateMutation = useGenerateRoadmap();
  const toggleTask = useToggleTask();
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-slate-800">Your Career Roadmap</h1>
        <p className="text-sm text-slate-500">Tick off tasks to improve your score.</p>
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-40 animate-pulse rounded-xl bg-slate-200" />
        ))}
      </div>
    );
  }

  if (!roadmap) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <h1 className="text-2xl font-bold text-slate-800">Your Career Roadmap</h1>
        <p className="mt-2 text-sm text-slate-500">Complete your onboarding to generate a personalized roadmap.</p>
      </div>
    );
  }

  const tasks: any[] = (roadmap as any).tasks ?? [];
  const phases = ['foundation', 'preparation', 'application'] as const;
  const completedCount = tasks.filter((t: any) => t.completed).length;

  const handleToggle = (task: any) => {
    toggleTask.mutate(task.id);
    if (!task.completed) {
      toast.success(`+${task.pointsValue} points!`, { description: `Completed: ${task.title}` });
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
    }
  };

  return (
    <div className="animate-fadeIn space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Your Career Roadmap</h1>
          <p className="mt-1 text-sm text-slate-500">Tick off tasks to improve your score.</p>
        </div>
        <div className="text-right text-sm text-slate-500">
          <span className="font-semibold text-slate-900">{completedCount}/{tasks.length}</span> tasks done
        </div>
      </div>

      {phases.map((phase) => {
        const cfg = phaseConfig[phase];
        const phaseTasks = tasks.filter((t: any) => t.phase === phase);
        const done = phaseTasks.filter((t: any) => t.completed).length;
        const Icon = cfg.icon;

        return (
          <div key={phase} className="space-y-2">
            <div className={`flex items-center gap-3 rounded-xl ${cfg.bg} p-3`}>
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${cfg.iconBg} text-white`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className={`font-semibold ${cfg.text}`}>{cfg.label}</h3>
                <p className="text-sm text-slate-500">{done}/{phaseTasks.length} tasks</p>
              </div>
              <div className="w-24">
                <ProgressBar value={done} max={phaseTasks.length} colorClass={cfg.barColor} size="sm" />
              </div>
            </div>

            <div className="space-y-2 pl-1">
              {phaseTasks.map((task: any) => (
                <button
                  key={task.id}
                  onClick={() => handleToggle(task)}
                  className={`group flex w-full items-start gap-3 rounded-xl border p-4 text-left transition-all ${
                    task.completed
                      ? 'border-slate-200 bg-slate-50'
                      : 'border-slate-200 bg-white hover:border-brand-300 hover:shadow-sm'
                  }`}
                >
                  <div className="mt-0.5 flex-shrink-0">
                    {task.completed ? (
                      <CheckCircle2 className="h-5 w-5 text-success-500" />
                    ) : (
                      <Circle className="h-5 w-5 text-slate-300 group-hover:text-brand-400" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <span className={`text-sm font-medium ${
                        task.completed ? 'text-slate-400 line-through' : 'text-slate-800'
                      }`}>
                        {task.title}
                      </span>
                      <Badge variant="success">+{task.pointsValue}</Badge>
                    </div>
                    {task.description && (
                      <p className={`mt-1 text-xs ${task.completed ? 'text-slate-400' : 'text-slate-500'}`}>
                        {task.description.split('\n---')[0]}
                      </p>
                    )}

                    {task.isVisaRelated && (
                      <div className="mt-2 rounded-lg border border-visa-200 bg-visa-50 p-2.5">
                        <div className="flex items-start gap-2">
                          <Shield className="mt-0.5 h-4 w-4 flex-shrink-0 text-visa-500" />
                          <p className="text-xs text-visa-700 whitespace-pre-line">
                            {task.description.includes('---') ? task.description.split('---')[1]?.trim() : 'Visa-related guidance.'}
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="mt-2 flex items-center gap-3 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {task.estimatedEffort?.replace('_', ' ') ?? 'Ongoing'}
                      </span>
                      <span>{task.category?.replace('_', ' ') ?? ''}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );
      })}

      <button
        onClick={() => setConfirmOpen(true)}
        className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 py-3 text-sm font-medium text-slate-500 transition-colors hover:border-brand-300 hover:text-brand-600"
      >
        <RefreshCw className="h-4 w-4" />
        Regenerate Roadmap
      </button>

      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        header="Regenerate Roadmap?"
        body={<p className="text-sm text-slate-600">This will replace uncompleted AI tasks. Completed tasks are preserved.</p>}
        footer={
          <>
            <button onClick={() => setConfirmOpen(false)}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50">Cancel</button>
            <button onClick={() => { setConfirmOpen(false); generateMutation.mutate(); }}
              className="rounded-lg bg-brand-500 px-4 py-2 text-sm text-white hover:bg-brand-600">
              {generateMutation.isPending ? 'Generating...' : 'Regenerate'}
            </button>
          </>
        }
      />
    </div>
  );
}
