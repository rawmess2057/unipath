import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { emptyExperience, type ExperienceDraft } from './profile-types';

interface ExperienceEditorProps {
  values: ExperienceDraft[];
  onChange: (values: ExperienceDraft[]) => void;
  editing: boolean;
}

interface FormState {
  index: number | 'new';
  draft: ExperienceDraft;
}

const labelClass = 'text-sm font-medium text-brand-100';

export function ExperienceEditor({ values, onChange, editing }: ExperienceEditorProps) {
  const [form, setForm] = useState<FormState | null>(null);

  const startForm = (index: number | 'new', draft: ExperienceDraft) => setForm({ index, draft });

  const save = () => {
    if (!form) return;
    const { index, draft } = form;
    if (!draft.company.trim() || !draft.role.trim() || !draft.startDate) return;
    const next = index === 'new'
      ? [...values, { ...draft }]
      : values.map((v, i) => (i === index ? { ...draft } : v));
    onChange(next);
    setForm(null);
  };

  const remove = (index: number) => onChange(values.filter((_, i) => i !== index));

  return (
    <div className="space-y-3">
      {values.length > 0 && (
        <div className="space-y-2">
          {values.map((exp, idx) => (
            <div key={idx} className="relative rounded-lg bg-white/5 p-4 pr-20">
              <p className="font-medium text-white">{exp.role || 'Untitled role'}</p>
              <p className="text-xs text-brand-200">{exp.company}</p>
              <p className="text-xs text-brand-200/60">
                {exp.startDate ? `${exp.startDate} – ${exp.current ? 'Present' : exp.endDate || ''}` : 'No dates'}
                {exp.isRelevant ? ' · Relevant ✓' : ''}
              </p>
              {exp.description && (
                <p className="mt-1 line-clamp-2 text-xs text-brand-200/70">{exp.description}</p>
              )}
              {editing && (
                <div className="absolute right-3 top-3 flex gap-1">
                  <button type="button" onClick={() => startForm(idx, exp)} className="rounded p-1 text-brand-200/60 hover:text-white">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button type="button" onClick={() => remove(idx)} className="rounded p-1 text-brand-200/60 hover:text-danger-400">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {editing && !form && values.length < 10 && (
        <button
          type="button"
          onClick={() => startForm('new', emptyExperience())}
          className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-white/20 py-2 text-sm text-brand-200 hover:border-brand-400 hover:text-brand-300"
        >
          <Plus className="h-4 w-4" /> Add Experience
        </button>
      )}

      {editing && form && (
        <div className="space-y-3 rounded-lg border border-white/10 bg-white/5 p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <Input label="Company" value={form.draft.company}
              onChange={(e) => setForm({ ...form, draft: { ...form.draft, company: e.target.value } })} />
            <Input label="Role / Title" value={form.draft.role}
              onChange={(e) => setForm({ ...form, draft: { ...form.draft, role: e.target.value } })} />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className={labelClass}>Start date</label>
              <Input type="date" value={form.draft.startDate}
                onChange={(e) => setForm({ ...form, draft: { ...form.draft, startDate: e.target.value } })} />
            </div>
            <div className="space-y-1.5">
              <label className={labelClass}>End date</label>
              <Input type="date" disabled={form.draft.current} value={form.draft.endDate}
                onChange={(e) => setForm({ ...form, draft: { ...form.draft, endDate: e.target.value } })} />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-brand-100">
              <input type="checkbox" checked={form.draft.current}
                onChange={(e) => setForm({ ...form, draft: { ...form.draft, current: e.target.checked } })} />
              Current position
            </label>
            <label className="flex items-center gap-2 text-sm text-brand-100">
              <input type="checkbox" checked={form.draft.isRelevant}
                onChange={(e) => setForm({ ...form, draft: { ...form.draft, isRelevant: e.target.checked } })} />
              Relevant to target industry
            </label>
          </div>
          <div className="space-y-1.5">
            <label className={labelClass}>Description</label>
            <textarea
              rows={3}
              value={form.draft.description}
              onChange={(e) => setForm({ ...form, draft: { ...form.draft, description: e.target.value } })}
              placeholder="Key responsibilities, achievements, or projects"
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-brand-200/60 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
            />
          </div>
          <div className="flex gap-2">
            <Button type="button" size="sm" onClick={save} disabled={!form.draft.company.trim() || !form.draft.role.trim() || !form.draft.startDate}>
              {form.index === 'new' ? 'Add' : 'Save'}
            </Button>
            <Button type="button" variant="secondary" size="sm" onClick={() => setForm(null)}>Cancel</Button>
          </div>
        </div>
      )}
    </div>
  );
}