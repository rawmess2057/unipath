import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Dial } from '../ui/Dial';
import { Btn } from '../ui/Btn';
import { Icon } from '../ui/Icon';
import { Input } from '../ui/Field';
import { Drop } from '../ui/Drop';
import { Scan } from '../ui/Scan';
import { useProfile, useUpsertProfile } from '../hooks/useProfile';
import { useGenerateRoadmap, useRoadmap } from '../hooks/useRoadmap';
import { useScore } from '../hooks/useScore';
import { useUploadCv, useCvAnalysis } from '../hooks/useCvAnalysis';
import { useUserName } from '../hooks/useUserName';
import { useUcai } from '../stores/ucai';
import { useUi } from '../stores/ui';
import { ROLES, ROLE_TO_INDUSTRY, VISA_OPTIONS, INDUSTRY_LABEL, normalizeVisa, type Role, type VisaStatus } from '../lib/industry';
import { skillsForIndustry } from '../lib/skills-data';
import { UK_UNIVERSITIES } from '../lib/uk-universities';
import { band } from '../lib/score';
import { toMonthInput, todayStr } from '../lib/dates';
import { analyseText } from '../lib/cv-analyser';
import { readCV, READ_ERRORS, withTimeout } from '../lib/read-cv';
import { toast } from '../lib/toast';
import { buildStages, allTasks } from '../lib/roadmap-stages';

const DIAL = [10, 24, 40, 52];

export function OnboardingPage() {
  const nav = useNavigate();
  const qc = useQueryClient();
  const [params] = useSearchParams();
  const replay = params.get('replay') === '1';
  const { data: profile } = useProfile();
  const { first: cFirst, last: cLast } = useUserName();
  const upsert = useUpsertProfile();
  const generate = useGenerateRoadmap();
  const upload = useUploadCv();
  const { data: score, refetch: refetchScore } = useScore();
  const setRegenPending = useUi((s) => s.setRegenPending);
  const regenPending = useUi((s) => s.regenPending);
  const { data: roadmap } = useRoadmap({ refetchInterval: regenPending ? 2000 : false });
  const storeRole = useUcai((s) => s.role);
  const patch = useUcai((s) => s.patch);

  const [step, setStep] = useState(0);
  const [err, setErr] = useState('');
  const [f, setF] = useState({ name: cFirst, last: cLast, course: '', uni: '', grad: '', role: storeRole as Role, visa: 'student_visa' as VisaStatus, skills: [] as string[] });
  const [custom, setCustom] = useState('');
  const [cv, setCv] = useState<{ name: string; id?: string; done?: boolean } | null>(null);
  const { data: analysis } = useCvAnalysis(cv?.id ?? null);
  const generated = useRef(false);
  const prefilled = useRef(false);

  useEffect(() => {
    if (prefilled.current || !profile) return;
    prefilled.current = true;
    setF((x) => ({
      ...x, course: profile.fieldOfStudy ?? '', uni: profile.university ?? '', grad: toMonthInput(profile.graduationDate), visa: normalizeVisa(profile.visaStatus),
      skills: profile.skills ?? [],
    }));
  }, [profile]);
  useEffect(() => { setF((x) => ({ ...x, name: x.name || cFirst, last: x.last || cLast })); }, [cFirst, cLast]);

  const industry = ROLE_TO_INDUSTRY[f.role];
  const suggested = useMemo(() => skillsForIndustry(INDUSTRY_LABEL[industry]), [industry]);
  const toggleSkill = (s: string) => setF((x) => ({ ...x, skills: x.skills.includes(s) ? x.skills.filter((k) => k !== s) : x.skills.length < 30 ? [...x.skills, s] : x.skills }));

  const next = async () => {
    setErr('');
    if (step === 0 && !f.name.trim()) { setErr('Add your first name so we know what to call you.'); return; }
    if (step === 1 && (!f.course.trim() || !f.uni.trim() || !f.grad)) { setErr('Add your course, university and graduation month.'); return; }
    if (step === 2) {
      if (f.skills.length < 3) { setErr('Pick at least three skills. They drive your skills gap and job matches.'); return; }
      try {
        await upsert.mutateAsync({ fieldOfStudy: f.course.trim(), university: f.uni.trim(), graduationDate: `${f.grad}-01`, targetIndustry: industry, visaStatus: f.visa, skills: f.skills, workExperiences: profile?.workExperiences ?? [], certifications: profile?.certifications ?? [] });
        patch({ name: f.name.trim(), last: f.last.trim(), role: f.role });
      } catch { setErr('Couldn’t save your profile. Check your connection and try again.'); return; }
    }
    setStep(Math.min(3, step + 1));
  };

  const reveal = async () => {
    if (!generated.current) {
      generated.current = true;
      try { await generate.mutateAsync(); setRegenPending(true); } catch { /* roadmap can be generated later */ }
    }
    await refetchScore();
    setStep(4);
  };

  const onFile = async (file: File) => {
    const name = file.name || 'your CV';
    if (/\.pdf$/i.test(name) || file.type === 'application/pdf') {
      try {
        const r = await upload.mutateAsync({ file, targetIndustry: industry, fieldOfStudy: f.course });
        patch({ cvAnalysisId: r.id, cvFile: name, cvAcks: [] });
        setCv({ name, id: r.id });
      } catch (e) { toast((e as Error).message || READ_ERRORS.unknown); }
      return;
    }
    try {
      const { text, src } = await withTimeout(readCV(file), 15000);
      patch({ cv: analyseText(text, src), wc: { swaps: {}, cut: [], spell: [] } });
      setCv({ name });
    } catch (e) { toast(READ_ERRORS[(e as Error).message] ?? READ_ERRORS.unknown); }
  };

  const finish = () => {
    const sc = score?.totalScore ?? 0;
    patch({ onboarded: true, start: { score: sc, date: todayStr() }, days: [...new Set([...useUcai.getState().days, todayStr()])].slice(-90), skip: 0 });
    qc.invalidateQueries({ queryKey: ['profile'] });
    nav('/dashboard');
    setTimeout(() => toast(<><Icon name="compass" sm />Welcome aboard, {f.name.trim()}. Day 1 of your streak.</>, { key: 'welcome' }), 700);
  };

  const sc = score?.totalScore ?? 0;
  const firstTask = roadmap ? allTasks(buildStages(roadmap, `${f.grad}-01`)).find((t) => !t.done) : null;
  const prog = <div className="ob-progress" role="img" aria-label={`Step ${step + 1} of 5`}>{[0, 1, 2, 3, 4].map((i) => <i key={i} className={i <= step ? 'on' : ''} />)}</div>;
  const later = <Btn variant="ghost" onClick={() => nav(profile || replay ? '/dashboard' : '/')}>Finish later</Btn>;
  const back = <Btn onClick={() => setStep(Math.max(0, step - 1))}>Back</Btn>;
  const cont = <Btn variant="primary" onClick={next} disabled={upsert.isPending}>{upsert.isPending ? 'Saving…' : 'Continue'} <Icon name="arrow" /></Btn>;
  const onEnter = (e: React.KeyboardEvent) => { if (e.key === 'Enter' && step < 2) { e.preventDefault(); void next(); } };

  return (
    <div className="ob" onKeyDown={onEnter}>
      <div className="ob-art"><Dial value={step === 4 ? sc : DIAL[step]} animateFrom={step === 4 ? DIAL[3] : null} /></div>
      <div className="ob-panel">
        {prog}
        {step === 0 && (
          <>
            <p className="eyebrow">Welcome to Uni Compass AI</p>
            <h1 className="h1">Find your heading to a UK graduate job.</h1>
            <p className="lede" style={{ margin: 0 }}>Built for international students. Five quick steps and you’ll have a score, a roadmap and today’s first move.</p>
            <div className="form-grid">
              <Input id="ob-name" label="First name" value={f.name} autoFocus autoComplete="given-name" onChange={(e) => setF({ ...f, name: e.target.value })} />
              <Input id="ob-last" label={<>Last name <span className="muted" style={{ fontWeight: 400 }}>(optional)</span></>} value={f.last} autoComplete="family-name" onChange={(e) => setF({ ...f, last: e.target.value })} />
            </div>
          </>
        )}
        {step === 1 && (
          <>
            <p className="eyebrow">Step 2 of 5</p>
            <h1 className="h1">What are you studying?</h1>
            <Input id="ob-course" label="Course" value={f.course} autoFocus placeholder="e.g. MSc Business Analytics" onChange={(e) => setF({ ...f, course: e.target.value })} />
            <Input id="ob-uni" label="University" list="ob-unis" value={f.uni} placeholder="e.g. University of Huddersfield" onChange={(e) => setF({ ...f, uni: e.target.value })} />
            <datalist id="ob-unis">{UK_UNIVERSITIES.map((u) => <option value={u} key={u} />)}</datalist>
            <Input id="ob-grad" label="When do you graduate?" type="month" value={f.grad} onChange={(e) => setF({ ...f, grad: e.target.value })} />
          </>
        )}
        {step === 2 && (
          <>
            <p className="eyebrow">Step 3 of 5</p>
            <h1 className="h1">Where are you heading?</h1>
            <p className="lede" style={{ margin: 0 }}>Pick the role you’d most like after graduating. You can change it any time.</p>
            <div className="choice">{ROLES.map((r) => <button key={r} aria-pressed={f.role === r} onClick={() => setF({ ...f, role: r })}>{r}</button>)}</div>
            <div className="field"><label>Your visa route</label><div className="choice">{VISA_OPTIONS.map((o) => <button key={o.value} aria-pressed={f.visa === o.value} onClick={() => setF({ ...f, visa: o.value })}>{o.label}</button>)}</div></div>
            <div className="field">
              <label>Skills you already have <span className="muted" style={{ fontWeight: 400 }}>(pick at least 3 · {f.skills.length} chosen)</span></label>
              <div className="choice">{[...new Set([...f.skills, ...suggested])].map((s) => <button key={s} className="btn-sm" style={{ height: 36 }} aria-pressed={f.skills.includes(s)} onClick={() => toggleSkill(s)}>{s}</button>)}</div>
              <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                <input className="input" placeholder="Add another skill" value={custom} aria-label="Add a skill" onChange={(e) => setCustom(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); if (custom.trim()) { toggleSkill(custom.trim()); setCustom(''); } } }} />
                <Btn onClick={() => { if (custom.trim()) { toggleSkill(custom.trim()); setCustom(''); } }}>Add</Btn>
              </div>
            </div>
          </>
        )}
        {step === 3 && (
          <>
            <p className="eyebrow">Step 4 of 5</p>
            <h1 className="h1">Add your CV</h1>
            <p className="lede" style={{ margin: 0 }}>We read it like a UK recruiter would and find the one fix that matters most.</p>
            <div className="ob-cv">
              {cv ? (
                <div className="card">{cv.done
                  ? <div className="fixed-stamp"><Icon name="check" />{cv.name} is in. {cv.id ? 'Your full feedback is waiting on the dashboard.' : 'Word check is ready; upload a PDF later for full AI feedback.'}</div>
                  : <Scan name={cv.name} ready={!cv.id || analysis?.status === 'completed'} onDone={() => setCv({ ...cv, done: true })} />}</div>
              ) : (
                <Drop accept=".pdf,.docx,.txt" onFile={onFile} btnSm><b>Drop your CV here, or browse</b><div className="small muted">PDF for full AI feedback, or Word</div></Drop>
              )}
              {!cv && <Btn variant="ghost" style={{ justifySelf: 'start' }} onClick={reveal}>No CV to hand? Skip for now</Btn>}
            </div>
          </>
        )}
        {step === 4 && (
          <>
            <p className="eyebrow">Your starting bearing</p>
            <h1 className="h1">{f.name ? `${f.name.trim()}, your` : 'Your'} score is {sc}.</h1>
            <p className="lede" style={{ margin: 0 }}>That’s <b style={{ color: 'var(--fg)' }}>{band(sc).toLowerCase()}</b> for {f.role} roles. Small daily steps move it from here.</p>
            <div className="fix-first ob-reveal">
              <p className="eyebrow"><Icon name="compass" sm />Your first step today</p>
              <h2 className="h2">{firstTask ? firstTask.name : cv ? 'See your CV’s top fix' : 'Upload your CV'}</h2>
              <p className="muted" style={{ margin: 0 }}>{firstTask ? `Worth +${firstTask.pts} points on your roadmap.` : regenPending ? 'Your roadmap is being built. It will be on your dashboard in a moment.' : 'Your CV feedback is the fastest way to move the needle.'}</p>
            </div>
          </>
        )}
        {err && <p className="ob-err" role="alert">{err}</p>}
        <div className="ob-nav" style={{ flexWrap: 'wrap' }}>
          {step === 0 && <>{cont}{later}</>}
          {(step === 1 || step === 2) && <>{back}{cont}{later}</>}
          {step === 3 && <>{back}{cv?.done && <Btn variant="primary" onClick={reveal} disabled={generate.isPending}>See my score <Icon name="arrow" /></Btn>}{later}</>}
          {step === 4 && <Btn variant="primary" size="lg" onClick={finish}>Open my dashboard <Icon name="arrow" /></Btn>}
        </div>
      </div>
    </div>
  );
}
