import { useState } from 'react';
import { Plus, Pencil, Trash2, Link2, FileText, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { api } from '../../lib/api-client';
import { emptyCert, type CertDraft } from './profile-types';

interface CertificationEditorProps {
  values: CertDraft[];
  onChange: (values: CertDraft[]) => void;
  editing: boolean;
}

interface FormState {
  index: number | 'new';
  draft: CertDraft;
}

const labelClass = 'text-sm font-medium text-brand-100';

export function CertificationEditor({ values, onChange, editing }: CertificationEditorProps) {
  const [form, setForm] = useState<FormState | null>(null);
  const [uploading, setUploading] = useState(false);

  const startForm = (index: number | 'new', draft: CertDraft) => setForm({ index, draft });

  const save = () => {
    if (!form) return;
    const { index, draft } = form;
    if (!draft.name.trim()) return;
    const next = index === 'new'
      ? [...values, { ...draft }]
      : values.map((v, i) => (i === index ? { ...draft } : v));
    onChange(next);
    setForm(null);
  };

  const remove = (index: number) => onChange(values.filter((_, i) => i !== index));

  const attachFile = async (file: File) => {
    if (!form) return;
    if (!file.name.toLowerCase().endsWith('.pdf') && !file.type.startsWith('image/')) {
      toast.error('Attach a PDF or image');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File must be under 10MB');
      return;
    }
    setUploading(true);
    try {
      const res = await api.upload<{ url: string; fileName: string }>(
        '/profile/upload',
        file,
        { type: 'certificate' },
      );
      setForm({
        ...form,
        draft: { ...form.draft, attachmentUrl: res.url, attachmentName: res.fileName },
      });
      toast.success('Certificate attached');
    } catch {
      toast.error('Failed to attach file');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      {values.length > 0 && (
        <div className="space-y-2">
          {values.map((cert, idx) => (
            <div key={idx} className="relative rounded-lg bg-white/5 p-4 pr-20">
              <p className="font-medium text-white">{cert.name || 'Untitled certification'}</p>
              <p className="text-xs text-brand-200">{cert.issuer}</p>
              <div className="mt-1 flex flex-wrap gap-3 text-xs text-brand-200/60">
                {cert.dateObtained && <span>Completed: {cert.dateObtained}</span>}
                {cert.credentialUrl && (
                  <a href={cert.credentialUrl} target="_blank" rel="noreferrer"
                    className="inline-flex items-center gap-1 text-brand-300 hover:underline">
                    <Link2 className="h-3 w-3" /> Credential
                  </a>
                )}
                {cert.attachmentUrl && (
                  <a href={cert.attachmentUrl} target="_blank" rel="noreferrer"
                    className="inline-flex items-center gap-1 text-brand-300 hover:underline">
                    <FileText className="h-3 w-3" /> {cert.attachmentName || 'Attachment'}
                  </a>
                )}
              </div>
              {editing && (
                <div className="absolute right-3 top-3 flex gap-1">
                  <button type="button" onClick={() => startForm(idx, cert)} className="rounded p-1 text-brand-200/60 hover:text-white">
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
          onClick={() => startForm('new', emptyCert())}
          className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-white/20 py-2 text-sm text-brand-200 hover:border-brand-400 hover:text-brand-300"
        >
          <Plus className="h-4 w-4" /> Add Certification
        </button>
      )}

      {editing && form && (
        <div className="space-y-3 rounded-lg border border-white/10 bg-white/5 p-4">
          <Input label="Certification name" value={form.draft.name}
            onChange={(e) => setForm({ ...form, draft: { ...form.draft, name: e.target.value } })} />
          <div className="grid gap-3 sm:grid-cols-2">
            <Input label="Issuing organization" value={form.draft.issuer}
              onChange={(e) => setForm({ ...form, draft: { ...form.draft, issuer: e.target.value } })} />
            <div className="space-y-1.5">
              <label className={labelClass}>Completion date</label>
              <Input type="date" value={form.draft.dateObtained}
                onChange={(e) => setForm({ ...form, draft: { ...form.draft, dateObtained: e.target.value } })} />
            </div>
          </div>
          <Input label="Credential URL" placeholder="https://..." value={form.draft.credentialUrl}
            onChange={(e) => setForm({ ...form, draft: { ...form.draft, credentialUrl: e.target.value } })} />

          <div className="space-y-1.5">
            <label className={labelClass}>Attach certificate</label>
            {form.draft.attachmentUrl ? (
              <div className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2">
                <FileText className="h-4 w-4 text-brand-300" />
                <a href={form.draft.attachmentUrl} target="_blank" rel="noreferrer"
                  className="flex-1 truncate text-sm text-brand-200 hover:text-brand-300 hover:underline">
                  {form.draft.attachmentName || 'View attachment'}
                </a>
                <button type="button" onClick={() => setForm({ ...form, draft: { ...form.draft, attachmentUrl: '', attachmentName: '' } })}
                  className="text-brand-200/60 hover:text-danger-400" aria-label="Remove attachment">
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div>
                <input
                  type="file"
                  accept=".pdf,image/*"
                  className="hidden"
                  id="cert-attachment"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) void attachFile(f); }}
                />
                <label htmlFor="cert-attachment" className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-white/20 px-3 py-2 text-sm text-brand-100 hover:bg-white/10">
                  {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  {uploading ? 'Uploading...' : 'Attach file'}
                </label>
                <p className="mt-1 text-xs text-brand-200/60">PDF or image. Max 10MB.</p>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Button type="button" size="sm" onClick={save} disabled={!form.draft.name.trim()}>
              {form.index === 'new' ? 'Add' : 'Save'}
            </Button>
            <Button type="button" variant="secondary" size="sm" onClick={() => setForm(null)}>Cancel</Button>
          </div>
        </div>
      )}
    </div>
  );
}