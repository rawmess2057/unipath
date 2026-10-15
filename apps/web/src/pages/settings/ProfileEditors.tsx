import { useState } from 'react';
import type { WorkExperience, Certification, ExtraLink } from '@unipath/shared';
import { Btn } from '../../ui/Btn';
import { Icon } from '../../ui/Icon';
import { Chip } from '../../ui/Chip';
import { Input } from '../../ui/Field';
import { api } from '../../lib/api-client';
import { toast } from '../../lib/toast';

const emptyExp = (): WorkExperience => ({ role: '', company: '', startDate: '', endDate: '', description: '', isRelevant: false, current: false });
const emptyCert = (): Certification => ({ name: '', issuer: '', dateObtained: '', credentialUrl: '', attachmentUrl: '', attachmentName: '' });

const fmt = (d?: string) => (d ? new Date(d).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }) : '');

/* ---------- Experience ---------- */
export function ExperienceEditor({ values, onChange }: { values: WorkExperience[]; onChange: (v: WorkExperience[]) => void }) {
  const [form, setForm] = useState<{ index: number | 'new'; d: WorkExperience } | null>(null);
  const save = () => {
    if (!form) return;
    const { index, d } = form;
    if (!d.role.trim() || !d.company.trim() || !d.startDate) { toast('Add the role, company and start date.'); return; }
    const clean = { ...d, endDate: d.current ? undefined : d.endDate || undefined, description: d.description || undefined };
    onChange(index === 'new' ? [...values, clean] : values.map((v, i) => (i === index ? clean : v)));
    setForm(null);
  };
  return (
    <div>
      {values.map((e, i) => (
        <div className="set-row" key={i}>
          <div><b>{e.role}</b><div className="small muted">{e.company} · {fmt(e.startDate)} – {e.current ? 'Present' : fmt(e.endDate) || '…'}{e.isRelevant ? ' · Relevant' : ''}</div></div>
          <div style={{ display: 'flex', gap: 6 }}><Btn size="sm" onClick={() => setForm({ index: i, d: { ...emptyExp(), ...e } })}>Edit</Btn><Btn size="sm" variant="ghost" className="danger" onClick={() => onChange(values.filter((_, k) => k !== i))}>Remove</Btn></div>
        </div>
      ))}
      {!form && values.length < 10 && <Btn size="sm" style={{ marginTop: 10 }} onClick={() => setForm({ index: 'new', d: emptyExp() })}><Icon name="check" sm />Add experience</Btn>}
      {form && (
        <div className="howto-body" style={{ marginTop: 12 }}>
          <div className="form-grid">
            <Input id="xp-role" label="Role" value={form.d.role} onChange={(e) => setForm({ ...form, d: { ...form.d, role: e.target.value } })} />
            <Input id="xp-co" label="Company" value={form.d.company} onChange={(e) => setForm({ ...form, d: { ...form.d, company: e.target.value } })} />
            <Input id="xp-start" label="Start date" type="date" value={form.d.startDate} onChange={(e) => setForm({ ...form, d: { ...form.d, startDate: e.target.value } })} />
            <Input id="xp-end" label="End date" type="date" value={form.d.endDate ?? ''} disabled={form.d.current} onChange={(e) => setForm({ ...form, d: { ...form.d, endDate: e.target.value } })} />
          </div>
          <div className="field"><label htmlFor="xp-desc">What you did</label><textarea id="xp-desc" rows={3} maxLength={1000} value={form.d.description ?? ''} onChange={(e) => setForm({ ...form, d: { ...form.d, description: e.target.value } })} /></div>
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            <label className="small" style={{ display: 'flex', gap: 8, alignItems: 'center' }}><input type="checkbox" checked={form.d.current} onChange={(e) => setForm({ ...form, d: { ...form.d, current: e.target.checked } })} /> I still work here</label>
            <label className="small" style={{ display: 'flex', gap: 8, alignItems: 'center' }}><input type="checkbox" checked={form.d.isRelevant} onChange={(e) => setForm({ ...form, d: { ...form.d, isRelevant: e.target.checked } })} /> Relevant to my target role</label>
          </div>
          <div style={{ display: 'flex', gap: 10 }}><Btn size="sm" variant="primary" onClick={save}>Save</Btn><Btn size="sm" variant="ghost" onClick={() => setForm(null)}>Cancel</Btn></div>
        </div>
      )}
    </div>
  );
}

/* ---------- Certifications ---------- */
export function CertificationEditor({ values, onChange }: { values: Certification[]; onChange: (v: Certification[]) => void }) {
  const [form, setForm] = useState<{ index: number | 'new'; d: Certification } | null>(null);
  const [uploading, setUploading] = useState(false);
  const save = () => {
    if (!form) return;
    if (!form.d.name.trim()) { toast('Add the certification name.'); return; }
    const clean = Object.fromEntries(Object.entries(form.d).map(([k, v]) => [k, v || undefined])) as Certification;
    onChange(form.index === 'new' ? [...values, clean] : values.map((v, i) => (i === form.index ? clean : v)));
    setForm(null);
  };
  const attach = async (file: File) => {
    if (!form) return;
    setUploading(true);
    try {
      const res = await api.upload<{ url: string; fileName: string }>('/profile/upload', file, { type: 'certificate' });
      setForm({ ...form, d: { ...form.d, attachmentUrl: res.url, attachmentName: res.fileName } });
    } catch { toast('Couldn’t upload that file. Try an image or PDF under 10 MB.'); }
    finally { setUploading(false); }
  };
  return (
    <div>
      {values.map((c, i) => (
        <div className="set-row" key={i}>
          <div><b>{c.name}</b><div className="small muted">{[c.issuer, fmt(c.dateObtained)].filter(Boolean).join(' · ')}{c.attachmentUrl && <> · <a href={c.attachmentUrl} target="_blank" rel="noreferrer" className="link" style={{ fontSize: 13 }}>{c.attachmentName || 'Attachment'}</a></>}{c.credentialUrl && <> · <a href={c.credentialUrl} target="_blank" rel="noreferrer" className="link" style={{ fontSize: 13 }}>Credential</a></>}</div></div>
          <div style={{ display: 'flex', gap: 6 }}><Btn size="sm" onClick={() => setForm({ index: i, d: { ...emptyCert(), ...c } })}>Edit</Btn><Btn size="sm" variant="ghost" className="danger" onClick={() => onChange(values.filter((_, k) => k !== i))}>Remove</Btn></div>
        </div>
      ))}
      {!form && values.length < 10 && <Btn size="sm" style={{ marginTop: 10 }} onClick={() => setForm({ index: 'new', d: emptyCert() })}><Icon name="check" sm />Add certification</Btn>}
      {form && (
        <div className="howto-body" style={{ marginTop: 12 }}>
          <div className="form-grid">
            <Input id="ct-name" label="Name" value={form.d.name} onChange={(e) => setForm({ ...form, d: { ...form.d, name: e.target.value } })} />
            <Input id="ct-iss" label="Issuer" value={form.d.issuer ?? ''} onChange={(e) => setForm({ ...form, d: { ...form.d, issuer: e.target.value } })} />
            <Input id="ct-date" label="Date obtained" type="date" value={form.d.dateObtained ?? ''} onChange={(e) => setForm({ ...form, d: { ...form.d, dateObtained: e.target.value } })} />
            <Input id="ct-url" label="Credential URL" type="url" placeholder="https://" value={form.d.credentialUrl ?? ''} onChange={(e) => setForm({ ...form, d: { ...form.d, credentialUrl: e.target.value } })} />
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            {form.d.attachmentUrl ? <Chip tone="good"><Icon name="check" sm />{form.d.attachmentName || 'Attached'}</Chip> : null}
            <label className="btn btn-sm" style={{ cursor: 'pointer' }}>{uploading ? 'Uploading…' : form.d.attachmentUrl ? 'Replace attachment' : 'Attach certificate'}<input type="file" className="sr-only" accept="image/*,.pdf" onChange={(e) => { const f = e.target.files?.[0]; if (f) attach(f); e.target.value = ''; }} /></label>
            {form.d.attachmentUrl && <Btn size="sm" variant="ghost" onClick={() => setForm({ ...form, d: { ...form.d, attachmentUrl: '', attachmentName: '' } })}>Remove attachment</Btn>}
          </div>
          <div style={{ display: 'flex', gap: 10 }}><Btn size="sm" variant="primary" onClick={save}>Save</Btn><Btn size="sm" variant="ghost" onClick={() => setForm(null)}>Cancel</Btn></div>
        </div>
      )}
    </div>
  );
}

/* ---------- Links ---------- */
export interface Links { websiteUrl: string; portfolioUrl: string; githubUrl: string; linkedinUrl: string; extraLinks: ExtraLink[] }

export function LinksEditor({ value, onChange }: { value: Links; onChange: (v: Links) => void }) {
  const set = (k: keyof Links, v: string) => onChange({ ...value, [k]: v });
  const [extra, setExtra] = useState<ExtraLink>({ label: '', url: '' });
  return (
    <div style={{ display: 'grid', gap: 14 }}>
      <div className="form-grid">
        <Input id="ln-li" label="LinkedIn" type="url" placeholder="https://linkedin.com/in/…" value={value.linkedinUrl} onChange={(e) => set('linkedinUrl', e.target.value)} />
        <Input id="ln-gh" label="GitHub" type="url" placeholder="https://github.com/…" value={value.githubUrl} onChange={(e) => set('githubUrl', e.target.value)} />
        <Input id="ln-pf" label="Portfolio" type="url" placeholder="https://" value={value.portfolioUrl} onChange={(e) => set('portfolioUrl', e.target.value)} />
        <Input id="ln-web" label="Website" type="url" placeholder="https://" value={value.websiteUrl} onChange={(e) => set('websiteUrl', e.target.value)} />
      </div>
      {value.extraLinks.map((l, i) => (
        <div className="set-row" key={i} style={{ padding: '8px 0' }}>
          <div><b>{l.label}</b><div className="small muted"><a href={l.url} target="_blank" rel="noreferrer" className="link" style={{ fontSize: 13 }}>{l.url}</a></div></div>
          <Btn size="sm" variant="ghost" className="danger" onClick={() => onChange({ ...value, extraLinks: value.extraLinks.filter((_, k) => k !== i) })}>Remove</Btn>
        </div>
      ))}
      {value.extraLinks.length < 10 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,2fr) auto', gap: 10, alignItems: 'end' }}>
          <Input id="ln-xl" label="Other link" placeholder="Label" value={extra.label} onChange={(e) => setExtra({ ...extra, label: e.target.value })} />
          <Input id="ln-xu" label="URL" type="url" placeholder="https://" value={extra.url} onChange={(e) => setExtra({ ...extra, url: e.target.value })} />
          <Btn size="sm" onClick={() => { if (!extra.label.trim() || !/^https?:\/\//.test(extra.url)) { toast('Add a label and a full URL starting with https://'); return; } onChange({ ...value, extraLinks: [...value.extraLinks, { label: extra.label.trim(), url: extra.url.trim() }] }); setExtra({ label: '', url: '' }); }}>Add</Btn>
        </div>
      )}
    </div>
  );
}
