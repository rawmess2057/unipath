import { X, Plus } from 'lucide-react';
import { useState } from 'react';

interface ExperienceEntry {
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  current: boolean;
  isRelevant: boolean;
}

interface StepExperienceProps {
  values: ExperienceEntry[];
  onChange: (entries: ExperienceEntry[]) => void;
}

export function StepExperience({ values, onChange }: StepExperienceProps) {
  const entries = values ?? [];
  const [showForm, setShowForm] = useState(false);
  const [draft, setDraft] = useState<ExperienceEntry>({
    company: '', role: '', startDate: '', endDate: '', current: false, isRelevant: false,
  });

  const addEntry = () => {
    if (!draft.company || !draft.role || !draft.startDate) return;
    onChange([...entries, { ...draft }]);
    setDraft({ company: '', role: '', startDate: '', endDate: '', current: false, isRelevant: false });
    setShowForm(false);
  };

  const removeEntry = (idx: number) => {
    onChange(entries.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-slate-800">Add your work experience</h2>
        <p className="mt-1 text-sm text-slate-500">Include internships, part-time jobs, and relevant projects.</p>
      </div>

      {entries.map((entry, idx) => (
        <div key={idx} className="relative rounded-lg bg-slate-50 p-4">
          <button
            type="button"
            onClick={() => removeEntry(idx)}
            className="absolute right-3 top-3 text-slate-400 hover:text-danger-500"
            aria-label="Remove experience"
          >
            <X className="h-4 w-4" />
          </button>
          <p className="font-medium text-slate-800">{entry.role}</p>
          <p className="text-xs text-slate-500">{entry.company}</p>
          <p className="mt-1 text-xs text-slate-400">
            {entry.startDate} – {entry.current ? 'Present' : entry.endDate}
            {entry.isRelevant ? ' · Relevant ✓' : ''}
          </p>
        </div>
      ))}

      {showForm ? (
        <div className="space-y-3 rounded-lg border border-slate-200 bg-white p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <input placeholder="Company name" value={draft.company} onChange={(e) => setDraft({ ...draft, company: e.target.value })}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100" />
            <input placeholder="Role / Title" value={draft.role} onChange={(e) => setDraft({ ...draft, role: e.target.value })}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100" />
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <label className="text-xs text-slate-500">Start date</label>
              <input type="date" value={draft.startDate} onChange={(e) => setDraft({ ...draft, startDate: e.target.value })}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100" />
            </div>
            <div className="flex-1">
              <label className="text-xs text-slate-500">End date</label>
              <input type="date" value={draft.endDate} disabled={draft.current} onChange={(e) => setDraft({ ...draft, endDate: e.target.value })}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100 disabled:bg-slate-50 disabled:text-slate-400" />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input type="checkbox" checked={draft.current} onChange={(e) => setDraft({ ...draft, current: e.target.checked })} />
              Current position
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input type="checkbox" checked={draft.isRelevant} onChange={(e) => setDraft({ ...draft, isRelevant: e.target.checked })} />
              Relevant to target industry
            </label>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={addEntry} className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600">Add</button>
            <button type="button" onClick={() => setShowForm(false)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50">Cancel</button>
          </div>
        </div>
      ) : entries.length < 10 && (
        <button type="button" onClick={() => setShowForm(true)}
          className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-300 py-3 text-sm text-slate-500 hover:border-brand-300 hover:text-brand-600">
          <Plus className="h-4 w-4" /> Add another experience
        </button>
      )}
    </div>
  );
}
