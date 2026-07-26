import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { StepBasics } from './steps/StepBasics';
import { StepIndustry } from './steps/StepIndustry';
import { StepVisaStatus } from './steps/StepVisaStatus';
import { StepExperience } from './steps/StepExperience';
import { StepSkills } from './steps/StepSkills';
import { StepCertifications } from './steps/StepCertifications';
import { StepCvUpload } from './steps/StepCvUpload';
import { useUpsertProfile } from '../../hooks/useProfile';

const onboardingSchema = z.object({
  fieldOfStudy: z.string().min(1, 'Field of study is required'),
  university: z.string().min(2, 'Enter a valid university name'),
  graduationDate: z.string().min(1, 'Graduation date is required'),
  targetIndustry: z.string().min(1, 'Select your target industry'),
  visaStatus: z.string().min(1, 'Select your visa status'),
});

const stepNames = ['Basics', 'Industry', 'Visa', 'Experience', 'Skills', 'Certs', 'Upload'];

export function OnboardingWizard() {
  const [step, setStep] = useState(0);
  const [experience, setExperience] = useState<any[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [certs, setCerts] = useState<any[]>([]);
  const [industry, setIndustry] = useState('Technology');
  const [visaStatus, setVisaStatus] = useState('');
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const upsertProfile = useUpsertProfile();

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
      targetIndustry: 'Technology',
      visaStatus: 'student_visa',
    },
  });

  const nextStep = async () => {
    if (step === 0) {
      const ok = await trigger(['fieldOfStudy', 'university', 'graduationDate']);
      if (!ok) return;
    }
    if (step === 1) {
      if (!industry) { toast.error('Select a target industry'); return; }
      setValue('targetIndustry', industry);
    }
    if (step === 2) {
      if (!visaStatus) { toast.error('Select your visa status'); return; }
      setValue('visaStatus', visaStatus);
      const ok = await trigger(['targetIndustry', 'visaStatus']);
      if (!ok) return;
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
        targetIndustry: data.targetIndustry,
        visaStatus: data.visaStatus,
        skills,
        workExperiences: experience,
        certifications: certs,
      } as any);
      toast.success('Profile saved! Generating your roadmap...');
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
        <h2 className="text-xl font-bold text-slate-800">Generating your personalized roadmap...</h2>
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
          <StepBasics values={getValues()} errors={errors} register={register} />
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
        <div className="space-y-6">
          <StepIndustry value={industry} onChange={setIndustry} />
          <div className="flex justify-between">
            <button type="button" onClick={() => setStep(0)} className="text-sm font-medium text-slate-600 hover:text-slate-900">Back</button>
            <button type="button" onClick={nextStep} className="rounded-lg bg-brand-500 px-6 py-2.5 text-sm font-medium text-white hover:bg-brand-600">Continue</button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6">
          <StepVisaStatus value={visaStatus} onChange={setVisaStatus} />
          <div className="flex justify-between">
            <button type="button" onClick={() => setStep(1)} className="text-sm font-medium text-slate-600 hover:text-slate-900">Back</button>
            <button type="button" onClick={nextStep} className="rounded-lg bg-brand-500 px-6 py-2.5 text-sm font-medium text-white hover:bg-brand-600">Continue</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-6">
          <StepExperience values={experience} onChange={setExperience} />
          <div className="flex justify-between">
            <button type="button" onClick={() => setStep(2)} className="text-sm font-medium text-slate-600 hover:text-slate-900">Back</button>
            <button type="button" onClick={nextStep} className="rounded-lg bg-brand-500 px-6 py-2.5 text-sm font-medium text-white hover:bg-brand-600">Continue</button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-6">
          <StepSkills industry={industry} values={skills} onChange={setSkills} />
          <div className="flex justify-between">
            <button type="button" onClick={() => setStep(3)} className="text-sm font-medium text-slate-600 hover:text-slate-900">Back</button>
            <button type="button" onClick={nextStep} className="rounded-lg bg-brand-500 px-6 py-2.5 text-sm font-medium text-white hover:bg-brand-600">Continue</button>
          </div>
        </div>
      )}

      {step === 5 && (
        <div className="space-y-6">
          <StepCertifications values={certs} onChange={setCerts} onSkip={nextStep} />
          <div className="flex justify-between">
            <button type="button" onClick={() => setStep(4)} className="text-sm font-medium text-slate-600 hover:text-slate-900">Back</button>
            <button type="button" onClick={nextStep} className="rounded-lg bg-brand-500 px-6 py-2.5 text-sm font-medium text-white hover:bg-brand-600">Continue</button>
          </div>
        </div>
      )}

      {step === 6 && (
        <div className="space-y-6">
          <StepCvUpload onComplete={saveAndFinish} onSkip={saveAndFinish} />
          <div className="flex justify-between">
            <button type="button" onClick={() => setStep(5)} className="text-sm font-medium text-slate-600 hover:text-slate-900">
              Back
            </button>
            <div />
          </div>
        </div>
      )}
    </div>
  );
}
