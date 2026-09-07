import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { toast } from 'sonner';
import { PageTransition } from '../../components/animations/PageTransition';
import { useProfile, useUpsertProfile } from '../../hooks/useProfile';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { AvatarUpload } from './AvatarUpload';
import { ExperienceEditor } from './ExperienceEditor';
import { CertificationEditor } from './CertificationEditor';
import { SocialLinksEditor } from './SocialLinksEditor';
import { emptyDraft, draftFromProfile, type ProfileDraft } from './profile-types';

export function ProfilePage() {
  const { data: profile, isLoading } = useProfile();
  const upsertProfile = useUpsertProfile();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<ProfileDraft>(emptyDraft);
  const [ready, setReady] = useState(false);
  const [newSkill, setNewSkill] = useState('');

  useEffect(() => {
    if (profile && !ready) {
      setDraft(draftFromProfile(profile));
      setReady(true);
    }
  }, [profile, ready]);

  if (isLoading || !ready) {
    return (
      <PageTransition>
        <div className="mx-auto max-w-2xl space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-xl bg-white/10" />
          ))}
        </div>
      </PageTransition>
    );
  }

  const email = (profile as any)?.student?.email ?? '';

  const setField = (patch: Partial<ProfileDraft>) => setDraft((d) => ({ ...d, ...patch }));

  const addSkill = () => {
    const skill = newSkill.trim();
    if (skill && !draft.skills.includes(skill)) {
      setField({ skills: [...draft.skills, skill] });
      setNewSkill('');
    }
  };

  const removeSkill = (skill: string) => {
    setField({ skills: draft.skills.filter((s) => s !== skill) });
  };

  const onSubmit = async () => {
    try {
      await upsertProfile.mutateAsync({ ...draft } as unknown as Record<string, unknown>);
      toast.success('Profile updated. Score recalculated.');
      setEditing(false);
    } catch {
      toast.error('Failed to save profile');
    }
  };

  const onCancel = () => {
    setDraft(draftFromProfile(profile));
    setEditing(false);
  };

  return (
    <PageTransition>
      <div className="mx-auto max-w-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Your Profile</h1>
            <p className="mt-1 text-sm text-brand-200">Update your details to keep your score accurate.</p>
          </div>
          <Button variant={editing ? 'secondary' : 'primary'} onClick={() => (editing ? onCancel() : setEditing(true))}>
            {editing ? 'Cancel' : 'Edit Profile'}
          </Button>
        </div>

        <div className="mt-6 space-y-4">
          <Card variant="glass">
            <h3 className="mb-4 font-semibold text-white">Profile Photo</h3>
            <AvatarUpload value={draft.avatarImageUrl} onChange={(avatarImageUrl) => setField({ avatarImageUrl })} disabled={!editing} />
          </Card>

          <Card variant="glass">
            <h3 className="mb-4 font-semibold text-white">Personal Information</h3>
            <div className="space-y-3">
              <Input label="Email" value={email} disabled />
            </div>
          </Card>

          <Card variant="glass">
            <h3 className="mb-4 font-semibold text-white">Academic Information</h3>
            <div className="space-y-3">
              <Input
                label="Field of Study"
                disabled={!editing}
                value={draft.fieldOfStudy}
                onChange={(e) => setField({ fieldOfStudy: e.target.value })}
              />
              <Input
                label="University"
                disabled={!editing}
                value={draft.university}
                onChange={(e) => setField({ university: e.target.value })}
              />
              <Input
                label="Graduation Date"
                type="date"
                disabled={!editing}
                value={draft.graduationDate}
                onChange={(e) => setField({ graduationDate: e.target.value })}
              />
              <Input
                label="Target Industry"
                disabled={!editing}
                value={draft.targetIndustry}
                onChange={(e) => setField({ targetIndustry: e.target.value })}
              />
              <Input
                label="Visa Status"
                value={(profile as any)?.visaStatus ?? ''}
                disabled
              />
            </div>
          </Card>

          <Card variant="glass">
            <h3 className="mb-4 font-semibold text-white">Work Experience</h3>
            <ExperienceEditor
              values={draft.workExperiences}
              onChange={(workExperiences) => setField({ workExperiences })}
              editing={editing}
            />
          </Card>

          <Card variant="glass">
            <h3 className="mb-4 font-semibold text-white">Skills</h3>
            <div className="mb-3 flex flex-wrap gap-2">
              {draft.skills.map((s: string) => (
                <span
                  key={s}
                  className="inline-flex items-center gap-1 rounded-full bg-brand-500/20 px-3 py-1 text-sm text-brand-300"
                >
                  {s}
                  {editing && (
                    <button type="button" onClick={() => removeSkill(s)} className="hover:text-white" aria-label={`Remove ${s}`}>
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </span>
              ))}
              {draft.skills.length === 0 && (
                <p className="text-sm text-brand-200/60">No skills added yet.</p>
              )}
            </div>
            {editing && (
              <div className="flex gap-2">
                <input
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addSkill();
                    }
                  }}
                  placeholder="Add a skill"
                  className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-brand-200/60 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                />
                <Button type="button" variant="secondary" size="sm" onClick={addSkill}>Add</Button>
              </div>
            )}
          </Card>

          <Card variant="glass">
            <h3 className="mb-4 font-semibold text-white">Certifications</h3>
            <CertificationEditor
              values={draft.certifications}
              onChange={(certifications) => setField({ certifications })}
              editing={editing}
            />
          </Card>

          <Card variant="glass">
            <h3 className="mb-4 font-semibold text-white">Links &amp; Socials</h3>
            <SocialLinksEditor
              draft={draft}
              onChange={setField}
              editing={editing}
            />
          </Card>

          {editing && (
            <div className="flex justify-end gap-3">
              <Button variant="secondary" type="button" onClick={onCancel}>Cancel</Button>
              <Button type="submit" onClick={() => void onSubmit()} loading={upsertProfile.isPending}>Save Changes</Button>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}