import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { StepBasics } from './steps/StepBasics';
import { StepIndustry } from './steps/StepIndustry';
import { StepVisaStatus } from './steps/StepVisaStatus';
import { StepSkills } from './steps/StepSkills';
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
    setStep(step + 1);
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
      toast.success('Profile saved! Redirecting to your dashboard...');
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err?.message ?? 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  if (saving) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center justify-center px-4 py-20 text-center">
        <div className="mb-6 h-16 w-16 animate-pulse rounded-full bg-brand-200" />
        <h2 className="text-xl font-bold text-slate-800">Building your personalised roadmap...</h2>
        <p className="mt-2 text-sm text-slate-500">
          Did you know? 70% of UK employers use ATS systems to filter CVs.
        </p>
        <div className="mt-8 flex w-full flex-col gap-3">
          <div className="h-4 w-full animate-pulse rounded bg-slate-200" />
          <div className="h-4 w-3/4 animate-pulse rounded bg-slate-200" />
          <div className="h-4 w-1/2 animate-pulse rounded bg-slate-200" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-8 flex items-center gap-1">
        {stepNames.map((name, i) => (
          <div key={name} className="flex flex-1 flex-col items-center gap-1">
            <div
              className={`h-1.5 w-full rounded-full transition-colors ${
                i <= step ? 'bg-brand-500' : 'bg-slate-200'
              }`}
            />
            <span className={`text-[10px] ${i === step ? 'font-medium text-brand-600' : 'text-slate-400'}`}>
              {name}
            </span>
          </div>
        ))}
      </div>

      {step === 0 && (
        <form onSubmit={handleSubmit(nextStep)} className="space-y-6">
          <StepBasics values={getValues()} errors={errors} register={register} setValue={setValue} />
          <div className="flex justify-between">
            <button type="button" onClick={() => navigate('/')} className="text-sm font-medium text-slate-600 hover:text-slate-900">
              Back
            </button>
            <button type="submit" className="rounded-lg bg-brand-500 px-6 py-2.5 text-sm font-medium text-white hover:bg-brand-600">
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
            <button type="button" onClick={() => setStep(0)} className="text-sm font-medium text-slate-600 hover:text-slate-900">Back</button>
            <button type="button" onClick={nextStep} className="rounded-lg bg-brand-500 px-6 py-2.5 text-sm font-medium text-white hover:bg-brand-600">Continue</button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6">
          <StepSkills industry={targetIndustry} values={skills} onChange={setSkills} />
          <div className="flex justify-between">
            <button type="button" onClick={() => setStep(1)} className="text-sm font-medium text-slate-600 hover:text-slate-900">Back</button>
            <button
              type="button"
              onClick={nextStep}
              disabled={skills.length < 3}
              className="rounded-lg bg-brand-500 px-6 py-2.5 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50"
            >
              Complete Setup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
