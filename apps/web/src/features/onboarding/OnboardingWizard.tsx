import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Check } from 'lucide-react';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';
import { StepBasics } from './steps/StepBasics';
import { StepIndustry } from './steps/StepIndustry';
import { StepVisaStatus } from './steps/StepVisaStatus';
import { StepSkills } from './steps/StepSkills';
import { skillsForIndustry } from './skills-data';
import { PageTransition } from '../../components/animations/PageTransition';
import { useUpsertProfile } from '../../hooks/useProfile';
import { useGenerateRoadmap } from '../../hooks/useRoadmap';

const onboardingSchema = z.object({
  fieldOfStudy: z.string().min(1, 'Field of study is required'),
  university: z.string().min(2, 'Enter a valid university name'),
  graduationDate: z
    .string()
    .min(1, 'Graduation date is required')
    .refine((v) => {
      if (!v) return true;
      const d = new Date(`${v}T23:59:59`);
      return !Number.isNaN(d.getTime()) && d.getTime() > Date.now();
    }, 'Graduation date cannot be in the past'),
});

const stepNames = ['Basics', 'Goals', 'Skills'];

export function OnboardingWizard() {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState<'forward' | 'back'>('forward');
  const [targetIndustry, setTargetIndustry] = useState('Technology');
  const [visaStatus, setVisaStatus] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const upsertProfile = useUpsertProfile();
  const generateRoadmap = useGenerateRoadmap();

  const {
    register,
    handleSubmit,
    trigger,
    getValues,
    setValue,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      fieldOfStudy: '',
      university: '',
      graduationDate: '',
    },
  });

  const changeIndustry = (industry: string) => {
    setTargetIndustry(industry);
    if (skills.length > 0) {
      const allowed = new Set(skillsForIndustry(industry));
      const kept = skills.filter((s) => allowed.has(s));
      if (kept.length !== skills.length) {
        setSkills(kept);
        toast.info(`${skills.length - kept.length} custom skill(s) not relevant to ${industry} were removed.`);
      }
    }
  };

  const jumpTo = (next: number) => {
    if (next === step) return;
    setDirection(next > step ? 'forward' : 'back');
    setStep(next);
  };

  const nextStep = async () => {
    if (step === 0) {
      const ok = await trigger(['fieldOfStudy', 'university', 'graduationDate']);
      if (!ok) return;
    }
    if (step === 1) {
      if (!targetIndustry) { toast.error('Select your target industry'); return; }
      if (!visaStatus) { toast.error('Select your visa status'); return; }
    }
    if (step === 2) {
      if (skills.length < 3) { toast.error('Select at least 3 skills'); return; }
      await saveAndFinish();
      return;
    }
    setDirection('forward');
    setStep(step + 1);
  };

  const goBack = () => {
    setDirection('back');
    setStep(Math.max(0, step - 1));
  };

  const saveAndFinish = async () => {
    setSaving(true);
    try {
      const data = getValues();
      await upsertProfile.mutateAsync({
        fieldOfStudy: data.fieldOfStudy,
        university: data.university,
        graduationDate: data.graduationDate,
        targetIndustry,
        visaStatus,
        skills,
      } as any);
      await generateRoadmap.mutateAsync();
      confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
      toast.success('Profile saved! Redirecting to your dashboard...');
      setTimeout(() => navigate('/dashboard'), 500);
    } catch (err: any) {
      toast.error(err?.message ?? 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  if (saving) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-900 via-brand-800 to-brand-600">
        <PageTransition><div className="mx-auto flex max-w-2xl flex-col items-center justify-center px-4 py-20 text-center">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-white/10">
            <div className="h-8 w-8 animate-pulse rounded-full bg-brand-400" />
          </div>
          <h2 className="text-xl font-bold text-white">Building your personalised roadmap...</h2>
          <p className="mt-2 text-sm text-brand-200">
            Did you know? 70% of UK employers use ATS systems to filter CVs.
          </p>
          <div className="mt-8 flex w-full max-w-sm flex-col gap-3">
            <div className="relative h-4 w-full overflow-hidden rounded bg-white/10">
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent" style={{ animation: 'shimmer 1.5s infinite' }} />
            </div>
            <div className="relative h-4 w-3/4 overflow-hidden rounded bg-white/10">
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent" style={{ animation: 'shimmer 1.5s infinite 0.2s' }} />
            </div>
            <div className="relative h-4 w-1/2 overflow-hidden rounded bg-white/10">
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent" style={{ animation: 'shimmer 1.5s infinite 0.4s' }} />
            </div>
          </div>
        </div></PageTransition>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-900 via-brand-800 to-brand-600">
      <PageTransition><div className="mx-auto max-w-2xl px-4 py-8">
        <div className="mb-10">
          <div className="flex items-center justify-between">
            {stepNames.map((name, i) => (
              <button
                key={name}
                type="button"
                onClick={() => jumpTo(i)}
                aria-current={i === step ? 'step' : undefined}
                className="flex flex-1 cursor-pointer flex-col items-center text-left"
              >
                <div className="flex w-full items-center">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition-all duration-300 ${
                      i < step
                        ? 'bg-brand-500 text-white'
                        : i === step
                          ? 'bg-white/10 text-white ring-2 ring-brand-400'
                          : 'bg-white/10 text-brand-200/50 hover:bg-white/20'
                    }`}
                  >
                    {i < step ? <Check className="h-4 w-4" /> : i + 1}
                  </div>
                  {i < stepNames.length - 1 && (
                    <div
                      className={`mx-2 h-0.5 flex-1 transition-colors duration-300 ${
                        i < step ? 'bg-brand-400' : 'bg-white/15'
                      }`}
                    />
                  )}
                </div>
                <span
                  className={`mt-2 text-xs font-medium transition-colors duration-300 ${
                    i === step ? 'text-white' : i < step ? 'text-brand-200' : 'text-brand-200/50'
                  }`}
                >
                  {name}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-white/20 bg-white/10 p-6 shadow-2xl backdrop-blur">
          <div
            key={step}
            className={`${direction === 'forward' ? 'animate-slideInRight' : 'animate-slideInLeft'}`}
          >
            {step === 0 && (
              <form onSubmit={handleSubmit(nextStep)} className="space-y-6">
                <StepBasics errors={errors} register={register} setValue={setValue} control={control} />
                <div className="flex justify-between">
                  <button type="button" onClick={() => navigate('/')} className="rounded-lg border border-white/20 px-5 py-2.5 text-sm font-medium text-brand-100 transition-colors hover:bg-white/10">
                    Back
                  </button>
                  <button type="submit" className="rounded-lg bg-brand-500 px-6 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-brand-600 active:scale-[0.97]">
                    Continue
                  </button>
                </div>
              </form>
            )}

            {step === 1 && (
              <div className="space-y-8">
                <StepIndustry value={targetIndustry} onChange={changeIndustry} />
                <StepVisaStatus value={visaStatus} onChange={setVisaStatus} />
                <div className="flex justify-between">
                  <button type="button" onClick={goBack} className="rounded-lg border border-white/20 px-5 py-2.5 text-sm font-medium text-brand-100 transition-colors hover:bg-white/10">Back</button>
                  <button type="button" onClick={nextStep} className="rounded-lg bg-brand-500 px-6 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-brand-600 active:scale-[0.97]">Continue</button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <StepSkills industry={targetIndustry} values={skills} onChange={setSkills} />
                <div className="flex justify-between">
                  <button type="button" onClick={goBack} className="rounded-lg border border-white/20 px-5 py-2.5 text-sm font-medium text-brand-100 transition-colors hover:bg-white/10">Back</button>
                  <button
                    type="button"
                    onClick={nextStep}
                    disabled={skills.length < 3}
                    className="rounded-lg bg-brand-500 px-6 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-brand-600 active:scale-[0.97] disabled:opacity-50"
                  >
                    Complete Setup
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div></PageTransition>
    </div>
  );
}