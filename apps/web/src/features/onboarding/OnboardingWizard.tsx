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
import { PageTransition } from '../../components/animations/PageTransition';
import { useUpsertProfile } from '../../hooks/useProfile';
import { useGenerateRoadmap } from '../../hooks/useRoadmap';

const onboardingSchema = z.object({
  fieldOfStudy: z.string().min(1, 'Field of study is required'),
  university: z.string().min(2, 'Enter a valid university name'),
  graduationDate: z.string().min(1, 'Graduation date is required'),
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
    formState: { errors },
  } = useForm({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      fieldOfStudy: '',
      university: '',
      graduationDate: '',
    },
  });

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
    setStep(step - 1);
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
      <PageTransition><div className="mx-auto flex max-w-2xl flex-col items-center justify-center px-4 py-20 text-center">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-brand-100">
          <div className="h-8 w-8 animate-pulse rounded-full bg-brand-300" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Building your personalised roadmap...</h2>
        <p className="mt-2 text-sm text-slate-500">
          Did you know? 70% of UK employers use ATS systems to filter CVs.
        </p>
        <div className="mt-8 flex w-full max-w-sm flex-col gap-3">
          <div className="relative h-4 w-full overflow-hidden rounded bg-slate-200">
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent" style={{ animation: 'shimmer 1.5s infinite' }} />
          </div>
          <div className="relative h-4 w-3/4 overflow-hidden rounded bg-slate-200">
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent" style={{ animation: 'shimmer 1.5s infinite 0.2s' }} />
          </div>
          <div className="relative h-4 w-1/2 overflow-hidden rounded bg-slate-200">
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent" style={{ animation: 'shimmer 1.5s infinite 0.4s' }} />
          </div>
        </div>
      </div></PageTransition>
    );
  }

  return (
    <PageTransition><div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-10">
        <div className="flex items-center justify-between">
          {stepNames.map((name, i) => (
            <div key={name} className="flex flex-1 flex-col items-center">
              <div className="flex items-center w-full">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition-all duration-300 ${
                    i < step
                      ? 'bg-brand-500 text-white'
                      : i === step
                      ? 'bg-brand-100 text-brand-600 ring-2 ring-brand-500 ring-offset-2'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {i < step ? <Check className="h-4 w-4" /> : i + 1}
                </div>
                {i < stepNames.length - 1 && (
                  <div
                    className={`h-0.5 flex-1 mx-2 transition-colors duration-300 ${
                      i < step ? 'bg-brand-500' : 'bg-slate-200'
                    }`}
                  />
                )}
              </div>
              <span
                className={`mt-2 text-xs font-medium transition-colors duration-300 ${
                  i === step ? 'text-brand-600' : 'text-slate-400'
                }`}
              >
                {name}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div
        key={step}
        className={`${direction === 'forward' ? 'animate-slideInRight' : 'animate-slideInLeft'}`}
      >
        {step === 0 && (
          <form onSubmit={handleSubmit(nextStep)} className="space-y-6">
            <StepBasics values={getValues()} errors={errors} register={register} setValue={setValue} />
            <div className="flex justify-between">
              <button type="button" onClick={() => navigate('/')} className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50">
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
            <StepIndustry value={targetIndustry} onChange={setTargetIndustry} />
            <StepVisaStatus value={visaStatus} onChange={setVisaStatus} />
            <div className="flex justify-between">
              <button type="button" onClick={goBack} className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50">Back</button>
              <button type="button" onClick={nextStep} className="rounded-lg bg-brand-500 px-6 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-brand-600 active:scale-[0.97]">Continue</button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <StepSkills industry={targetIndustry} values={skills} onChange={setSkills} />
            <div className="flex justify-between">
              <button type="button" onClick={goBack} className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50">Back</button>
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
    </div></PageTransition>
  );
}
