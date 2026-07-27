import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Pencil, Trash2, Plus, X } from 'lucide-react';
import { toast } from 'sonner';
import { PageTransition } from '../../components/animations/PageTransition';
import { useProfile, useUpsertProfile } from '../../hooks/useProfile';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export function ProfilePage() {
  const { data: profile, isLoading } = useProfile();
  const upsertProfile = useUpsertProfile();
  const [editing, setEditing] = useState(false);
  const [skills, setSkills] = useState<string[]>((profile as any)?.skills ?? []);
  const [newSkill, setNewSkill] = useState('');
  const [experiences, setExperiences] = useState<any[]>((profile as any)?.workExperiences ?? []);
  const [certs, setCerts] = useState<any[]>((profile as any)?.certifications ?? []);

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      fieldOfStudy: (profile as any)?.fieldOfStudy ?? '',
      university: (profile as any)?.university ?? '',
      graduationDate: (profile as any)?.graduationDate?.split('T')[0] ?? '',
      targetIndustry: (profile as any)?.targetIndustry ?? '',
    },
  });

  const onSubmit = async (data: any) => {
    try {
      await upsertProfile.mutateAsync({ ...data, skills, workExperiences: experiences, certifications: certs } as any);
      toast.success('Profile updated. Score recalculated.');
      setEditing(false);
    } catch {
      toast.error('Failed to save profile');
    }
  };

  if (isLoading) {
    return (
      <PageTransition><div className="mx-auto max-w-2xl space-y-4">
        {[1, 2, 3].map((i) => <div key={i} className="h-32 animate-pulse rounded-xl bg-white/10" />)}
      </div></PageTransition>
    );
  }

  return (
    <PageTransition><div className="mx-auto max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Your Profile</h1>
          <p className="mt-1 text-sm text-brand-200">Update your details to keep your score accurate.</p>
        </div>
        <Button variant={editing ? 'secondary' : 'primary'} onClick={() => setEditing(!editing)}>
          {editing ? 'Cancel' : 'Edit Profile'}
        </Button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
        <Card variant="glass">
          <h3 className="mb-4 font-semibold text-white">Personal Information</h3>
          <div className="space-y-3">
            <Input label="Email" value={(profile as any)?.student?.email ?? ''} disabled />
          </div>
        </Card>

        <Card variant="glass">
          <h3 className="mb-4 font-semibold text-white">Academic Information</h3>
          <div className="space-y-3">
            <Input
              label="Field of Study"
              disabled={!editing}
              error={errors.fieldOfStudy?.message as string}
              {...register('fieldOfStudy')}
            />
            <Input
              label="University"
              disabled={!editing}
              {...register('university')}
            />
            <Input
              label="Graduation Date"
              type="date"
              disabled={!editing}
              {...register('graduationDate')}
            />
            <Input
              label="Target Industry"
              disabled={!editing}
              {...register('targetIndustry')}
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
          {experiences.length > 0 && (
            <div className="mb-3 space-y-2">
              {experiences.map((exp, i) => (
                <div key={i} className="relative rounded-lg bg-white/5 p-4">
                  <p className="font-medium text-white">{exp.role}</p>
                  <p className="text-xs text-brand-200">{exp.company}</p>
                  <p className="text-xs text-brand-200/60">
                    {exp.startDate} – {exp.current ? 'Present' : exp.endDate} {exp.isRelevant ? '· Relevant ✓' : ''}
                  </p>
                  {editing && (
                    <div className="absolute right-3 top-3 flex gap-1">
                      <button type="button" onClick={() => setExperiences(experiences.filter((_, j) => j !== i))}
                        className="rounded p-1 text-brand-200/60 hover:text-danger-400"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          {editing && (
            <button type="button"
              onClick={() => { const r = prompt('Enter experience: Company, Role, Start, End'); if (r) setExperiences([...experiences, { company: r, role: '', startDate: '', endDate: '', current: false, isRelevant: false }]); }}
              className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-white/20 py-2 text-sm text-brand-200 hover:border-brand-400 hover:text-brand-300">
              <Plus className="h-4 w-4" /> Add Experience
            </button>
          )}
        </Card>

        <Card variant="glass">
          <h3 className="mb-4 font-semibold text-white">Skills</h3>
          <div className="mb-3 flex flex-wrap gap-2">
            {skills.map((s: string) => (
              <span key={s} className="inline-flex items-center gap-1 rounded-full bg-brand-500/20 px-3 py-1 text-sm text-brand-300">
                {s}
                {editing && (
                  <button type="button" onClick={() => setSkills(skills.filter((x) => x !== s))}
                    className="hover:text-white"><X className="h-3 w-3" /></button>
                )}
              </span>
            ))}
          </div>
          {editing && (
            <div className="flex gap-2">
              <input value={newSkill} onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); if (newSkill.trim() && !skills.includes(newSkill.trim())) { setSkills([...skills, newSkill.trim()]); setNewSkill(''); } }}}
                placeholder="Add a skill"
                className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-brand-200/60 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30" />
              <button type="button" onClick={() => { if (newSkill.trim() && !skills.includes(newSkill.trim())) { setSkills([...skills, newSkill.trim()]); setNewSkill(''); }}}
                className="rounded-lg bg-brand-500 px-4 py-2 text-sm text-white hover:bg-brand-600">Add</button>
            </div>
          )}
        </Card>

        <Card variant="glass">
          <h3 className="mb-4 font-semibold text-white">Certifications</h3>
          {certs.length > 0 && (
            <div className="mb-3 space-y-2">
              {certs.map((cert, i) => (
                <div key={i} className="relative rounded-lg bg-white/5 p-4">
                  <p className="font-medium text-white">{cert.name}</p>
                  <p className="text-xs text-brand-200">{cert.issuer}</p>
                  {cert.date && <p className="text-xs text-brand-200/60">Completed: {cert.date}</p>}
                  {editing && (
                    <button type="button" onClick={() => setCerts(certs.filter((_, j) => j !== i))}
                      className="absolute right-3 top-3 text-brand-200/60 hover:text-danger-400"><Trash2 className="h-4 w-4" /></button>
                  )}
                </div>
              ))}
            </div>
          )}
          {editing && (
            <button type="button"
              onClick={() => setCerts([...certs, { name: 'New Certification', issuer: '', date: '' }])}
              className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-white/20 py-2 text-sm text-brand-200 hover:border-brand-400 hover:text-brand-300">
              <Plus className="h-4 w-4" /> Add Certification
            </button>
          )}
        </Card>

        {editing && (
          <div className="flex justify-end gap-3">
            <Button variant="secondary" type="button" onClick={() => setEditing(false)}>Cancel</Button>
            <Button type="submit" loading={upsertProfile.isPending}>Save Changes</Button>
          </div>
        )}
      </form>

      {!profile && !isLoading && (
        <Card variant="glass" className="mt-6 text-center py-8">
          <p className="text-brand-200">No profile yet. Complete the onboarding to get started.</p>
        </Card>
      )}
    </div></PageTransition>
  );
}
