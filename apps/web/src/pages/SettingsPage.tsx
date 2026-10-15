import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useClerk } from '@clerk/clerk-react';
import { PageHead } from '../ui/PageHead';
import { Btn } from '../ui/Btn';
import { Icon } from '../ui/Icon';
import { Chip } from '../ui/Chip';
import { Toggle } from '../ui/Toggle';
import { Seg, SegBtn } from '../ui/Seg';
import { Input, Select } from '../ui/Field';
import { useProfile, useUpsertProfile, type Profile } from '../hooks/useProfile';
import { useUserName } from '../hooks/useUserName';
import { useUcai, type Theme } from '../stores/ucai';
import { setTheme } from '../shell/ThemeProvider';
import { ROLES, ROLE_TO_INDUSTRY, VISA_OPTIONS, normalizeVisa, type Role, type VisaStatus } from '../lib/industry';
import { UK_UNIVERSITIES } from '../lib/uk-universities';
import { toMonthInput } from '../lib/dates';
import { toast } from '../lib/toast';
import { api } from '../lib/api-client';
import { ExperienceEditor, CertificationEditor, LinksEditor, type Links } from './settings/ProfileEditors';
import type { WorkExperience, Certification } from '@unipath/shared';

const CLERK_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

interface Draft {
  first: string; last: string; course: string; uni: string; grad: string; role: Role; visa: VisaStatus;
  experiences: WorkExperience[]; certifications: Certification[]; links: Links; avatarImageUrl: string;
}

function draftFrom(p: Profile | null | undefined, first: string, last: string, role: Role): Draft {
  return {
    first, last, course: p?.fieldOfStudy ?? '', uni: p?.university ?? '', grad: toMonthInput(p?.graduationDate), role, visa: normalizeVisa(p?.visaStatus),
    experiences: p?.workExperiences ?? [], certifications: p?.certifications ?? [],
    links: { websiteUrl: p?.websiteUrl ?? '', portfolioUrl: p?.portfolioUrl ?? '', githubUrl: p?.githubUrl ?? '', linkedinUrl: p?.linkedinUrl ?? '', extraLinks: p?.extraLinks ?? [] },
    avatarImageUrl: p?.avatarImageUrl ?? '',
  };
}

function SignOut() {
  const { signOut } = useClerk();
  return <Btn size="sm" onClick={() => signOut({ redirectUrl: '/' })}>Sign out</Btn>;
}

export function SettingsPage() {
  const nav = useNavigate();
  const qc = useQueryClient();
  const { data: profile } = useProfile();
  const upsert = useUpsertProfile();
  const { first, last, clerkUser } = useUserName();
  const role = useUcai((s) => s.role);
  const theme = useUcai((s) => s.theme);
  const notif = useUcai((s) => s.notif);
  const patch = useUcai((s) => s.patch);
  const resetProgress = useUcai((s) => s.resetProgress);
  const [d, setD] = useState<Draft>(() => draftFrom(profile, first, last, role));
  const [armed, setArmed] = useState(false);
  const [uploading, setUploading] = useState(false);
  useEffect(() => { setD(draftFrom(profile, first, last, role)); }, [profile]); // eslint-disable-line react-hooks/exhaustive-deps

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setD((x) => ({ ...x, [k]: v }));

  const save = async () => {
    if (!d.course.trim() || !d.uni.trim() || !d.grad) { toast('Course, university and graduation month are needed for your roadmap.'); return; }
    try {
      await upsert.mutateAsync({
        fieldOfStudy: d.course.trim(), university: d.uni.trim(), graduationDate: `${d.grad}-01`, targetIndustry: ROLE_TO_INDUSTRY[d.role], visaStatus: d.visa,
        skills: profile?.skills ?? [], workExperiences: d.experiences, certifications: d.certifications, avatarImageUrl: d.avatarImageUrl || undefined,
        websiteUrl: d.links.websiteUrl || undefined, portfolioUrl: d.links.portfolioUrl || undefined, githubUrl: d.links.githubUrl || undefined, linkedinUrl: d.links.linkedinUrl || undefined, extraLinks: d.links.extraLinks,
      });
      patch({ name: d.first.trim(), last: d.last.trim(), role: d.role });
      if (clerkUser?.update && (d.first !== clerkUser.firstName || d.last !== clerkUser.lastName)) { try { await clerkUser.update({ firstName: d.first.trim(), lastName: d.last.trim() }); } catch { /* name kept locally */ } }
      qc.invalidateQueries({ queryKey: ['roadmap'] });
      toast('Settings saved. Your roadmap, skills gap and matches use the new details.', { key: 'saved' });
    } catch { toast('Couldn’t save. Check your connection and try again.'); }
  };

  const avatar = async (file: File) => {
    setUploading(true);
    try { const r = await api.upload<{ url: string }>('/profile/upload', file, { type: 'avatar' }); set('avatarImageUrl', r.url); toast('Photo uploaded. Save to keep it.'); }
    catch { toast('Couldn’t upload that image.'); } finally { setUploading(false); }
  };

  const th = theme ?? 'system';
  const tb = (v: Theme | 'system', n: string, i?: 'sun' | 'dim' | 'moon') => <SegBtn key={v} on={th === v} onClick={() => setTheme(v === 'system' ? null : v)}>{i && <Icon name={i} sm />}{n}</SegBtn>;
  const tg = (k: keyof typeof notif, n: string, desc: string) => (
    <div className="set-row" key={k}><div><b>{n}</b><div className="small muted">{desc}</div></div><Toggle on={notif[k]} onChange={(v) => patch({ notif: { ...notif, [k]: v } })} label={n} /></div>
  );

  return (
    <>
      <PageHead eyebrow="You" title="Settings" lede="Your details shape your roadmap, skills gap and job matches." right={profile?.student?.email ? <Chip>{profile.student.email}</Chip> : undefined} />
      <div className="bento">
        <section className="card s7">
          <div className="card-head"><h2 className="h2">Profile</h2><Btn size="sm" variant="primary" onClick={save} disabled={upsert.isPending}><Icon name="check" sm />{upsert.isPending ? 'Saving…' : 'Save changes'}</Btn></div>
          <div className="form-grid">
            <Input id="f-name" label="First name" value={d.first} onChange={(e) => set('first', e.target.value)} autoComplete="given-name" />
            <Input id="f-last" label="Last name" value={d.last} onChange={(e) => set('last', e.target.value)} autoComplete="family-name" />
            <Input id="f-course" label="Course" value={d.course} onChange={(e) => set('course', e.target.value)} placeholder="e.g. MSc Business Analytics" />
            <Input id="f-uni" label="University" list="uk-unis" value={d.uni} onChange={(e) => set('uni', e.target.value)} placeholder="e.g. University of Huddersfield" />
            <datalist id="uk-unis">{UK_UNIVERSITIES.map((u) => <option value={u} key={u} />)}</datalist>
            <Input id="f-grad" label="Graduating" type="month" value={d.grad} onChange={(e) => set('grad', e.target.value)} />
            <Select id="f-role" label="Target role" value={d.role} onChange={(e) => set('role', e.target.value as Role)}>{ROLES.map((r) => <option key={r}>{r}</option>)}</Select>
          </div>
          <div className="field" style={{ marginTop: 14 }}>
            <label>Visa route</label>
            <Seg>{VISA_OPTIONS.map((o) => <SegBtn key={o.value} on={d.visa === o.value} onClick={() => set('visa', o.value)}>{o.label}</SegBtn>)}</Seg>
            <p className="small muted" style={{ margin: '8px 0 0' }}>{VISA_OPTIONS.find((o) => o.value === d.visa)?.hint}. Guidance only, not immigration advice.</p>
          </div>
          <div className="set-row" style={{ marginTop: 6 }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              {d.avatarImageUrl ? <img src={d.avatarImageUrl} alt="" style={{ width: 44, height: 44, borderRadius: 12, objectFit: 'cover' }} /> : <span className="avatar" aria-hidden="true">{(d.first[0] || 'U') + (d.last[0] || 'C')}</span>}
              <div><b>Photo</b><div className="small muted">Shown in the app only; UK CVs don’t carry one.</div></div>
            </div>
            <label className="btn btn-sm" style={{ cursor: 'pointer' }}>{uploading ? 'Uploading…' : 'Change'}<input type="file" className="sr-only" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) avatar(f); e.target.value = ''; }} /></label>
          </div>
        </section>

        <div className="s5" style={{ display: 'grid', gap: 18, alignContent: 'start' }}>
          <section className="card"><h2 className="h2" style={{ marginBottom: 4 }}>Appearance</h2><p className="small muted" style={{ margin: '0 0 12px' }}>Dim is a softer dark for evenings. System follows your device.</p><Seg>{tb('light', 'Light', 'sun')}{tb('dim', 'Dim', 'dim')}{tb('dark', 'Dark', 'moon')}{tb('system', 'System')}</Seg></section>
          <section className="card"><h2 className="h2" style={{ marginBottom: 4 }}>Nudges</h2>{tg('daily', 'Daily bearing', 'A morning reminder of today’s step')}{tg('jobs', 'New strong matches', 'When a role scores above 80%')}{tg('weekly', 'Weekly progress', 'Sunday summary of your score')}</section>
          <section className="card"><h2 className="h2" style={{ marginBottom: 4 }}>Account</h2>
            <div className="set-row"><div><b>Replay onboarding</b><div className="small muted">See the first-run flow again</div></div><Btn size="sm" onClick={() => nav('/onboarding?replay=1')}>Replay</Btn></div>
            <div className="set-row"><div><b>Reset local progress</b><div className="small muted">Clears streak, milestones, word-check decisions and Premium preview on this device</div></div><Btn size="sm" className="danger" onClick={() => { if (!armed) { setArmed(true); setTimeout(() => setArmed(false), 3000); return; } resetProgress(); setArmed(false); toast('Local progress reset'); }}>{armed ? 'Click again to reset' : 'Reset'}</Btn></div>
            {CLERK_KEY && <div className="set-row"><div><b>Sign out</b><div className="small muted">You can sign back in any time</div></div><SignOut /></div>}
          </section>
        </div>

        <section className="card s12">
          <div className="card-head"><div><h2 className="h2">Experience, certifications and links</h2><span className="small muted">These feed your Experience and Certifications scores. Save changes above when you’re done.</span></div></div>
          <h3 className="h3" style={{ margin: '6px 0 4px' }}>Work experience</h3>
          <ExperienceEditor values={d.experiences} onChange={(v) => set('experiences', v)} />
          <div className="divider" />
          <h3 className="h3" style={{ margin: '0 0 4px' }}>Certifications</h3>
          <CertificationEditor values={d.certifications} onChange={(v) => set('certifications', v)} />
          <div className="divider" />
          <h3 className="h3" style={{ margin: '0 0 10px' }}>Links</h3>
          <LinksEditor value={d.links} onChange={(v) => set('links', v)} />
          <div style={{ marginTop: 16 }}><Btn variant="primary" onClick={save} disabled={upsert.isPending}><Icon name="check" />{upsert.isPending ? 'Saving…' : 'Save changes'}</Btn></div>
        </section>
      </div>
    </>
  );
}
