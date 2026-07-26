import { X, Plus } from 'lucide-react';
import { useState } from 'react';

interface CertEntry {
  name: string;
  issuer: string;
  date: string;
}

interface StepCertificationsProps {
  values: CertEntry[];
  onChange: (entries: CertEntry[]) => void;
  onSkip: () => void;
}

export function StepCertifications({ values, onChange, onSkip }: StepCertificationsProps) {
  const entries = values ?? [];
  const [showForm, setShowForm] = useState(false);
  const [draft, setDraft] = useState<CertEntry>({ name: '', issuer: '', date: '' });

  const addEntry = () => {
    if (!draft.name) return;
    onChange([...entries, { ...draft }]);
    setDraft({ name: '', issuer: '', date: '' });
    setShowForm(false);
  };

  const removeEntry = (idx: number) => {
    onChange(entries.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-slate-800">Any certifications?</h2>
        <p className="mt-1 text-sm text-slate-500">Professional certifications, online courses, or licenses.</p>
      </div>

      {entries.length > 0 && (
        <div className="space-y-2">
          {entries.map((cert, idx) => (
            <div key={idx} className="relative rounded-lg bg-slate-50 p-4">
              <button type="button" onClick={() => removeEntry(idx)} className="absolute right-3 top-3 text-slate-400 hover:text-danger-500" aria-label="Remove certification">
                <X className="h-4 w-4" />
              </button>
              <p className="font-medium text-slate-800">{cert.name}</p>
              <p className="text-xs text-slate-500">{cert.issuer}</p>
              {cert.date && <p className="text-xs text-slate-400">Completed: {cert.date}</p>}
            </div>
          ))}
        </div>
      )}

      {showForm ? (
        <div className="space-y-3 rounded-lg border border-slate-200 bg-white p-4">
          <input placeholder="Certification name" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100" />
          <input placeholder="Issuing organization" value={draft.issuer} onChange={(e) => setDraft({ ...draft, issuer: e.target.value })}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100" />
          <div>
            <label className="text-xs text-slate-500">Completion date</label>
            <input type="date" value={draft.date} onChange={(e) => setDraft({ ...draft, date: e.target.value })}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100" />
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={addEntry} className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600">Add</button>
            <button type="button" onClick={() => setShowForm(false)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50">Cancel</button>
          </div>
        </div>
      ) : entries.length < 10 && (
        <button type="button" onClick={() => setShowForm(true)}
          className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-300 py-3 text-sm text-slate-500 hover:border-brand-300 hover:text-brand-600">
          <Plus className="h-4 w-4" /> Add another certification
        </button>
      )}

      <div className="flex items-center justify-between">
        <button type="button" onClick={onSkip} className="text-sm text-slate-400 hover:text-slate-600">
          Skip for now
        </button>
      </div>
    </div>
  );
}
