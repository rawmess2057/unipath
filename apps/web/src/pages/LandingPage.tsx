import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brand } from '../shell/Brand';
import { useTheme, THEME_ICON } from '../shell/ThemeProvider';
import { Icon } from '../ui/Icon';
import { Btn } from '../ui/Btn';
import { Dial } from '../ui/Dial';
import { Ring } from '../ui/Ring';
import { Bar } from '../ui/Bar';
import { Input, Select } from '../ui/Field';
import { DemoDial } from './landing/DemoDial';
import { FREE_FEATURES, PREM_FEATURES } from '../lib/plans';
import { useProfile } from '../hooks/useProfile';
import { useUcai } from '../stores/ucai';
import { reducedMotion, burst } from '../lib/fx';

const STAGES = [['Find your bearings', 'Oct', 100], ['Build proof', 'Nov – Dec', 45], ['Apply', 'Jan – Mar', 10], ['Interview', 'Mar – May', 0]] as const;

function scrollTo(id: string) {
  const t = document.getElementById(id);
  if (t) window.scrollTo({ top: t.getBoundingClientRect().top + window.scrollY - 76, behavior: reducedMotion() ? 'auto' : 'smooth' });
}

function InterestForm() {
  const nav = useNavigate();
  const [v, setV] = useState({ name: '', org: '', role: 'Careers or employability staff', email: '' });
  const [err, setErr] = useState('');
  const [done, setDone] = useState(false);
  const submit = (e: FormEvent) => {
    e.preventDefault();
    const missing = !v.name.trim() ? 'your name' : !v.org.trim() ? 'your university' : !/^\S+@\S+\.\S+$/.test(v.email) ? 'a valid email address' : '';
    if (missing) { setErr('Please add ' + missing + ' so we can reply.'); return; }
    setDone(true); burst(window.innerWidth / 2, window.innerHeight / 2, 60);
  };
  if (done) {
    return (
      <section className="card" id="uniForm">
        <div className="form-ok">
          <div className="gate-ico" style={{ background: 'var(--good-soft)', color: 'var(--good)' }}><Icon name="check" /></div>
          <h3 className="h2">Thanks, {v.name.split(' ')[0]}.</h3>
          <p className="muted" style={{ margin: 0 }}>We’ll be in touch about pilots and ambassador places at {v.org}.</p>
          <Btn onClick={() => nav('/onboarding')}>Try the student app <Icon name="arrow" /></Btn>
        </div>
      </section>
    );
  }
  return (
    <section className="card" id="uniForm">
      <h3 className="h2" style={{ marginBottom: 6 }}>Register interest</h3>
      <p className="muted small" style={{ margin: '0 0 16px' }}>We’ll get in touch about pilots and ambassador places.</p>
      <form onSubmit={submit} noValidate style={{ display: 'grid', gap: 14 }}>
        <Input id="u-name" label="Your name" required autoComplete="name" value={v.name} onChange={(e) => setV({ ...v, name: e.target.value })} />
        <Input id="u-org" label="University" required placeholder="e.g. University of Huddersfield" value={v.org} onChange={(e) => setV({ ...v, org: e.target.value })} />
        <Select id="u-role" label="I am a…" value={v.role} onChange={(e) => setV({ ...v, role: e.target.value })}><option>Careers or employability staff</option><option>Student who wants to be an ambassador</option><option>Academic or course leader</option><option>Something else</option></Select>
        <Input id="u-email" label="Email" type="email" required autoComplete="email" value={v.email} onChange={(e) => setV({ ...v, email: e.target.value })} />
        {err && <p className="small" style={{ color: 'var(--bad)', margin: 0 }}>{err}</p>}
        <Btn variant="primary" type="submit">Register interest</Btn>
      </form>
    </section>
  );
}

export function LandingPage() {
  const nav = useNavigate();
  const { eff, cycleTheme } = useTheme();
  const { data: profile } = useProfile();
  const onboarded = useUcai((s) => s.onboarded);
  const hasAccount = !!profile || onboarded;
  const sec = (id: string, n: string) => <button key={id} onClick={() => scrollTo(id)}>{n}</button>;

  return (
    <div className="lp">
      <header className="lp-nav"><div className="lp-wrap">
        <Brand tagline={false} link={false} />
        <nav className="lp-links" aria-label="Page sections">{sec('lp-how', 'How it works')}{sec('lp-features', 'Features')}{sec('lp-pricing', 'Pricing')}{sec('lp-unis', 'For universities')}{sec('lp-faq', 'FAQ')}</nav>
        <div className="lp-nav-cta">
          <button className="icon-btn" aria-label="Switch theme" onClick={cycleTheme}><Icon name={THEME_ICON[eff]} /></button>
          <Btn variant="ghost" to="/dashboard">{hasAccount ? 'Open the app' : 'Log in'}</Btn>
          <Btn variant="primary" to="/onboarding">Get started free</Btn>
        </div>
      </div></header>

      <section className="lp-hero"><div className="lp-wrap lp-hero-grid">
        <div>
          <span className="lp-kicker"><b>For international students</b>Built for UK graduate hiring</span>
          <h1 className="lp-h1">Your compass to a <em>UK graduate job.</em></h1>
          <p className="lp-sub">Uni Compass AI reads your CV like a UK recruiter, gives you one score to grow, and tells you the single next step to take, every day, until you land the offer.</p>
          <div className="lp-cta"><Btn variant="primary" size="lg" to="/onboarding">Get my free score <Icon name="arrow" /></Btn><Btn size="lg" onClick={() => scrollTo('lp-how')}>See how it works</Btn></div>
          <div className="lp-trust"><span><Icon name="check" sm />Free for every student</span><span><Icon name="check" sm />No card needed</span><span><Icon name="check" sm />CV feedback while you wait</span></div>
        </div>
        <DemoDial />
      </div></section>

      <section className="lp-sec alt"><div className="lp-wrap">
        <div className="lp-head"><p className="eyebrow">Sound familiar?</p><h2 className="lp-h2">Job hunting in a new country comes with rules nobody writes down.</h2></div>
        <div className="pains">
          <div className="pain"><div className="pain-ico"><Icon name="file" /></div><h3>“I don’t know what UK recruiters expect.”</h3><p>No photo? One page or two? What’s a personal statement? CV norms change from country to country.</p><div className="fix"><Icon name="check" />A CV check built on UK conventions, with one fix to make first.</div></div>
          <div className="pain"><div className="pain-ico"><Icon name="brief" /></div><h3>“I keep applying to jobs I can’t get.”</h3><p>Hours of applications go to roles that don’t fit your skills, your level or your visa route.</p><div className="fix"><Icon name="check" />Matches ranked by real fit, with visa-aware filtering on Premium.</div></div>
          <div className="pain"><div className="pain-ico"><Icon name="route" /></div><h3>“There’s so much advice. Where do I start?”</h3><p>Webinars, blogs and forums all say something different, and none of it is about you.</p><div className="fix"><Icon name="check" />A personal roadmap and one daily step, sized to fit around your studies.</div></div>
        </div>
      </div></section>

      <section className="lp-sec" id="lp-how"><div className="lp-wrap">
        <div className="lp-head center"><p className="eyebrow">How it works</p><h2 className="lp-h2">Three steps to your heading</h2><p>From upload to your first move in a few minutes.</p></div>
        <div className="steps">
          <div className="step"><div className="step-n">01</div><h3>Upload your CV</h3><p>PDF or Word. We check structure, impact, ATS readability and UK conventions.</p></div>
          <div className="step"><div className="step-n">02</div><h3>Get your score and roadmap</h3><p>Your Employability Score, your CV’s top fix and a four-stage plan to graduation.</p></div>
          <div className="step"><div className="step-n">03</div><h3>Take one step a day</h3><p>Each finished step moves your score. Keep a streak, unlock milestones, share your progress.</p></div>
        </div>
      </div></section>

      <section className="lp-sec alt" id="lp-features"><div className="lp-wrap">
        <div className="lp-head"><p className="eyebrow">Features</p><h2 className="lp-h2">Everything points the same way: to an offer.</h2></div>
        <div className="feat">
          <div className="card f3"><div className="mini"><div className="mini-row ok"><span className="mark"><Icon name="check" sm /></span>No photo or date of birth</div><div className="mini-row ok"><span className="mark"><Icon name="check" sm /></span>Two pages or fewer</div><div className="mini-row no"><span className="mark"><Icon name="x" sm /></span><b>Fix this first:</b>&nbsp;quantify your achievements</div></div><h3>CV feedback that tells you what to fix first</h3><p>A clear quality score, a pass/fail checklist and one priority, so you’re never staring at a wall of red.</p></div>
          <div className="card f3"><div className="mini">{STAGES.map(([n, w, p]) => <div key={n}><div className="mini-row" style={{ justifyContent: 'space-between' }}><span style={{ fontWeight: 600 }}>{n}</span><span className="small muted">{w}</span></div><Bar value={p} style={{ height: 6 }} /></div>)}</div><h3>A roadmap built around your graduation</h3><p>Four stages from first steps to interviews, each task worth points towards your score.</p></div>
          <div className="card f2"><div className="mini" style={{ justifyItems: 'center' }}><Ring pct={91} /><span className="small muted">Graduate Business Analyst</span></div><h3>Jobs ranked by fit</h3><p>See your match, the skills you have and the one to learn next.</p></div>
          <div className="card f2"><div className="mini"><div className="star-row"><span>S</span><span>T</span><span>A</span><span>R</span></div></div><h3>Mock interviews</h3><p>Practise competency questions with instant STAR feedback. Premium.</p></div>
          <div className="card f2"><div className="mini-badge"><div><span className="bc-label">Employability</span><br /><b>74</b></div><span style={{ fontWeight: 600, fontSize: 13 }}>Strong heading</span></div><h3>A badge worth sharing</h3><p>Post your score on LinkedIn and show recruiters you’re moving.</p></div>
        </div>
      </div></section>

      <section className="lp-sec" id="lp-pricing"><div className="lp-wrap">
        <div className="lp-head center"><p className="eyebrow">Pricing</p><h2 className="lp-h2">Free does the heavy lifting</h2><p>The core platform is free for every student. Premium adds deeper coaching when you’re ready to apply.</p></div>
        <div className="plans" style={{ margin: '0 auto' }}>
          <section className="card plan"><div><p className="eyebrow">Free</p><div className="price">£0</div><p className="muted small" style={{ margin: '6px 0 0' }}>For every student, for as long as you study</p></div><ul>{FREE_FEATURES.map((x) => <li key={x}><Icon name="check" />{x}</li>)}</ul><Btn variant="primary" to="/onboarding" style={{ marginTop: 'auto' }}>Start free</Btn></section>
          <section className="card plan premium"><div><p className="eyebrow" style={{ color: 'var(--hero-muted)' }}>Premium</p><div className="price">Coming soon</div><p className="muted small" style={{ margin: '6px 0 0' }}>Pricing announced at launch</p></div><p style={{ margin: 0, fontWeight: 600 }}>Everything in Free, plus</p><ul>{PREM_FEATURES.map((x) => <li key={x}><Icon name="spark" />{x}</li>)}</ul><Btn onClick={() => nav('/plans')} style={{ marginTop: 'auto', background: 'var(--needle)', color: '#032420', border: 0 }}>Preview Premium in the app</Btn></section>
        </div>
      </div></section>

      <section className="lp-sec alt" id="lp-unis"><div className="lp-wrap uni">
        <div><p className="eyebrow">For universities and careers teams</p><h2 className="lp-h2">Give every international student a careers coach in their pocket.</h2><p className="lede">We’re looking for UK universities and student ambassadors to pilot Uni Compass AI with.</p>
          <ul>
            <li><div className="res-ico"><Icon name="bars" /></div><div><b>Cohort-level insight</b><div className="small muted">See where students get stuck, without reading every CV.</div></div></li>
            <li><div className="res-ico"><Icon name="route" /></div><div><b>Works alongside your service</b><div className="small muted">Roadmaps nudge students to book careers appointments, not replace them.</div></div></li>
            <li><div className="res-ico"><Icon name="star" /></div><div><b>Campus ambassador programme</b><div className="small muted">Students who champion the platform earn experience for their own CVs.</div></div></li>
          </ul>
        </div>
        <InterestForm />
      </div></section>

      <section className="lp-sec" id="lp-faq"><div className="lp-wrap">
        <div className="lp-head center"><p className="eyebrow">Questions</p><h2 className="lp-h2">Good questions, straight answers</h2></div>
        <div className="faq">
          <details><summary>Is it really free?<Icon name="x" /></summary><p>Yes. CV feedback, your score, your roadmap, job matching, the skills gap view and your badge are free for every student. Premium adds mock interviews, deeper CV rewriting, version history and visa-aware matching.</p></details>
          <details><summary>Does it give immigration advice?<Icon name="x" /></summary><p>No. Visa-aware matching checks whether employers appear on the UK government’s published register of licensed sponsors. For advice about your own visa, speak to your university’s international student advice team.</p></details>
          <details><summary>What happens to my CV?<Icon name="x" /></summary><p>Your CV is used only to give you feedback and matches. You can delete it, and your account, at any time.</p></details>
          <details><summary>Which students is it for?<Icon name="x" /></summary><p>International students at UK universities, at any level, who want graduate or entry-level roles in the UK. Home students are welcome too.</p></details>
          <details><summary>How is the Employability Score worked out?<Icon name="x" /></summary><p>Your CV quality, skills match, work experience, certifications and platform activity are weighted into one number. Every roadmap step you finish adds to it, so the score reflects the work you put in.</p></details>
        </div>
      </div></section>

      <section className="lp-wrap"><div className="hero lp-final">
        <div style={{ width: 'min(150px,40vw)' }}><Dial value={74} /></div>
        <h2 className="lp-h2">Find out where you stand today.</h2>
        <p>Upload your CV and get your score, your top fix and your first step in a few minutes.</p>
        <Btn variant="primary" size="lg" to="/onboarding">Get my free score <Icon name="arrow" /></Btn>
      </div></section>

      <footer className="lp-foot"><div className="lp-wrap">
        <span>© 2026 Uni Compass AI</span>
        <nav aria-label="Footer">{sec('lp-how', 'How it works')}{sec('lp-pricing', 'Pricing')}{sec('lp-unis', 'Universities')}<button onClick={() => nav('/dashboard')}>Open the app</button></nav>
      </div></footer>
    </div>
  );
}
