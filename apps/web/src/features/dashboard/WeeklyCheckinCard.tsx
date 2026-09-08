import { useState } from 'react';
import { CalendarCheck, Flame, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';
import type { WeeklyCheckinInput } from '@unipath/shared';
import { useCheckin, useSubmitCheckin } from '../../hooks/useCheckin';
import { Card } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';

const EMPTY_FORM: WeeklyCheckinInput = {
  networkingEvents: 0,
  interviews: 0,
  skillsPracticed: 0,
  reflection: '',
};

function CountField({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-white/10 bg-white/5 p-3">
      <div>
        <p className="text-sm font-medium text-white">{label}</p>
        <p className="text-xs text-brand-200">{hint}</p>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onChange(Math.max(0, value - 1))}
          className="h-8 w-8 rounded-lg bg-white/10 text-lg font-bold text-brand-100 hover:bg-white/20"
          aria-label={`Decrease ${label}`}
        >
          −
        </button>
        <span className="w-8 text-center font-semibold text-white">{value}</span>
        <button
          type="button"
          onClick={() => onChange(Math.min(50, value + 1))}
          className="h-8 w-8 rounded-lg bg-white/10 text-lg font-bold text-brand-100 hover:bg-white/20"
          aria-label={`Increase ${label}`}
        >
          +
        </button>
      </div>
    </div>
  );
}

export function WeeklyCheckinCard() {
  const { data: summary, isLoading } = useCheckin();
  const submitMutation = useSubmitCheckin();

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<WeeklyCheckinInput>(EMPTY_FORM);

  const current = summary?.current ?? null;
  const streak = summary?.streak ?? 0;
  const isSubmitting = submitMutation.isPending;

  const openModal = () => {
    setForm(current ? {
      networkingEvents: (current.data.networkingEvents) ?? 0,
      interviews: (current.data.interviews) ?? 0,
      skillsPracticed: (current.data.skillsPracticed) ?? 0,
      reflection: (current.data.reflection) ?? '',
    } : EMPTY_FORM);
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const result = await submitMutation.mutateAsync(form);
      setModalOpen(false);
      toast.success(`Check-in saved — earned ${result.current?.pointsEarned ?? 0} activity points`);
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    } catch {
      toast.error('Failed to save check-in');
    }
  };

  if (isLoading) {
    return <Card variant="glass" className="flex items-center justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-brand-400" /></Card>;
  }

  return (
    <Card variant="glass">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl ${current ? 'bg-success-500/20' : 'bg-warning-500/20'}`}>
            <CalendarCheck className={`h-5 w-5 ${current ? 'text-success-300' : 'text-warning-300'}`} />
          </div>
          <div>
            <h3 className="font-semibold text-white">
              {current ? 'Weekly check-in complete' : 'Complete your weekly check-in'}
            </h3>
            <p className="mt-0.5 text-sm text-brand-200">
              {current
                ? `Earned ${current.pointsEarned} activity points this week.`
                : 'Tell us what you achieved this week for activity points.'}
            </p>
          </div>
        </div>

        {streak > 0 && (
          <div className="flex items-center gap-1.5 rounded-full bg-warning-500/15 px-3 py-1 text-sm font-semibold text-warning-300" title="Weekly check-in streak">
            <Flame className="h-4 w-4" />
            {streak} week{streak > 1 ? 's' : ''}
          </div>
        )}
      </div>

      <div className="mt-4">
        {current ? (
          <div className="flex flex-wrap gap-2">
            {current.data.networkingEvents > 0 && (
              <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-brand-100">Networking × {current.data.networkingEvents}</span>
            )}
            {current.data.interviews > 0 && (
              <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-brand-100">Interviews × {current.data.interviews}</span>
            )}
            {current.data.skillsPracticed > 0 && (
              <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-brand-100">Skill practice × {current.data.skillsPracticed}</span>
            )}
            {!current.data.networkingEvents && !current.data.interviews && !current.data.skillsPracticed && (
              <span className="text-xs text-brand-200/60">No activity recorded this week.</span>
            )}
            <button onClick={openModal} className="ml-auto text-sm font-medium text-brand-300 hover:text-brand-100">
              Update
            </button>
          </div>
        ) : (
          <button
            onClick={openModal}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-brand-800 hover:bg-brand-50"
          >
            <CalendarCheck className="h-4 w-4" /> Start check-in
          </button>
        )}
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        header={current ? 'Update this week’s check-in' : 'Weekly check-in'}
        body={
          <div className="space-y-3">
            <p className="text-xs text-brand-200">
              Self-report what you accomplished this week — these feed your Platform Activity score (networking ×3, interviews ×5, skill practice ×1).
            </p>
            <CountField
              label="Networking events"
              hint="Career fairs, societies, events"
              value={form.networkingEvents}
              onChange={(v) => setForm({ ...form, networkingEvents: v })}
            />
            <CountField
              label="Interviews"
              hint="Interview stages completed"
              value={form.interviews}
              onChange={(v) => setForm({ ...form, interviews: v })}
            />
            <CountField
              label="Skill practice"
              hint="Hours of deliberate skill practice"
              value={form.skillsPracticed}
              onChange={(v) => setForm({ ...form, skillsPracticed: v })}
            />
            <Input
              label="Reflection (optional)"
              placeholder="What went well this week?"
              value={form.reflection}
              maxLength={500}
              onChange={(e) => setForm({ ...form, reflection: e.target.value })}
            />
          </div>
        }
        footer={
          <>
            <button
              onClick={() => setModalOpen(false)}
              className="rounded-lg px-4 py-2 text-sm font-medium text-brand-200 hover:bg-white/10"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-brand-800 hover:bg-brand-50 disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CalendarCheck className="h-4 w-4" />}
              {current ? 'Save changes' : 'Save check-in'}
            </button>
          </>
        }
      />
    </Card>
  );
}