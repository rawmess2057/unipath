import { useState } from 'react';
import { Dropzone } from '../../../components/ui/Dropzone';

interface StepCvUploadProps {
  onComplete: () => void;
  onSkip: () => void;
}

export function StepCvUpload({ onComplete, onSkip }: StepCvUploadProps) {
  const [file, setFile] = useState<File | null>(null);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-slate-800">Upload your CV (optional)</h2>
        <p className="mt-1 text-sm text-slate-500">Upload a text-based PDF to unlock your full employability score.</p>
      </div>

      <Dropzone onFile={(f) => setFile(f)} />

      <div className="flex justify-between gap-3 pt-4">
        <button
          type="button"
          onClick={onSkip}
          className="rounded-lg border border-slate-200 bg-white px-6 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
        >
          Skip for now
        </button>
        <button
          type="button"
          onClick={onComplete}
          className="rounded-lg bg-brand-500 px-6 py-2.5 text-sm font-medium text-white hover:bg-brand-600"
        >
          {file ? 'Upload & Complete' : 'Complete setup'}
        </button>
      </div>
    </div>
  );
}
