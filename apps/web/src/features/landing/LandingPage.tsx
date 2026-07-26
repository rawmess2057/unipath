import { useEffect, useState, useRef, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight, ChevronDown, Clock, CreditCard, ShieldCheck, XCircle,
  UserCircle, Target, FileCheck, BarChart3, Map, FileSearch, Shield,
  CheckCircle2, Quote, Menu, X,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';

const CLERK_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const signInPath = CLERK_KEY ? '/sign-in' : '/onboarding';
const signUpPath = CLERK_KEY ? '/sign-up' : '/onboarding';

function FloatingNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (id: string) => {
    setMobileOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 h-[72px] transition-all duration-300 ${
        scrolled
          ? 'border-b border-white/10 bg-brand-900/95 backdrop-blur-md'
          : 'bg-transparent'
      }`}
    >
      <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-4 md:px-8">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className={`text-xl font-bold transition-colors ${
            'text-white'
          }`}
        >
          Employability
        </button>

        <nav className="hidden items-center gap-6 lg:flex" aria-label="Marketing navigation">
          {[
            { label: 'How it Works', target: 'how-it-works' },
            { label: 'Features', target: 'features' },
          ].map((item) => (
            <button
              key={item.target}
              onClick={() => scrollTo(item.target)}
              className={`text-sm font-medium transition-colors hover:opacity-80 ${
                'text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <button
            onClick={() => navigate(signInPath)}
            className={`text-sm font-medium transition-colors hover:opacity-80 ${
              'text-white'
            }`}
          >
            Sign In
          </button>
          <Button
            size="sm"
            className="bg-brand-500 text-white hover:bg-brand-600"
            onClick={() => navigate(signUpPath)}
          >
            Get Started
          </Button>
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className={`flex items-center justify-center rounded-lg p-2 lg:hidden ${
            'text-white'
          }`}
          aria-label="Toggle navigation menu"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-slate-200 bg-white lg:hidden">
          <nav className="flex flex-col px-4 py-4 space-y-2" aria-label="Mobile marketing navigation">
            {[
              { label: 'How it Works', target: 'how-it-works' },
              { label: 'Features', target: 'features' },
            ].map((item) => (
              <button
                key={item.target}
                onClick={() => scrollTo(item.target)}
                className="rounded-lg px-4 py-3 text-left text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                {item.label}
              </button>
            ))}
            <hr className="my-2 border-slate-100" />
            <button
              onClick={() => navigate(signInPath)}
              className="rounded-lg px-4 py-3 text-left text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Sign In
            </button>
            <Button
              className="w-full"
              onClick={() => navigate(signUpPath)}
            >
              Get Started
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
}

function ScoreCardMockup() {
  const [score, setScore] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const target = 68;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const start = performance.now();
          const duration = 2000;
          const raf = (now: number) => {
            const t = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - t, 3);
            setScore(Math.round(eased * target));
            if (t < 1) requestAnimationFrame(raf);
          };
          requestAnimationFrame(raf);
          observer.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="w-full max-w-xs rounded-2xl bg-white/10 backdrop-blur-lg border border-white/20 p-6 shadow-2xl"
      style={{ animation: 'float 6s ease-in-out infinite' }}
    >
      <p className="text-sm font-medium text-white/70">Your Employability Score</p>
      <div className="mt-2 flex items-baseline gap-1">
        <span className="text-5xl font-bold text-white">{score}</span>
        <span className="text-lg text-white/50">/ 100</span>
      </div>
      <div className="mt-4 space-y-2">
        {[
          { label: 'CV Quality', pct: 60, color: 'bg-slate-400' },
          { label: 'Skills Match', pct: 75, color: 'bg-green-400' },
          { label: 'Work Experience', pct: 45, color: 'bg-blue-400' },
          { label: 'Platform Activity', pct: 80, color: 'bg-amber-400' },
        ].map((bar) => (
          <div key={bar.label}>
            <div className="flex justify-between text-xs text-white/60">
              <span>{bar.label}</span>
              <span>{bar.pct}%</span>
            </div>
            <div className="mt-0.5 h-1.5 w-full overflow-hidden rounded-full bg-white/20">
              <div
                className={`h-full rounded-full ${bar.color} transition-all duration-1000`}
                style={{ width: score > 0 ? `${bar.pct}%` : '0%' }}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-green-500/30 px-3 py-1 text-xs font-medium text-green-200">
        +3 points this week
      </div>
    </div>
  );
}

function HeroSection() {
  const navigate = useNavigate();
  const prefersReduced =
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false;

  return (
    <section className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-brand-900 via-brand-800 to-brand-600" />
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 25px 25px, white 1px, transparent 0)',
          backgroundSize: '50px 50px',
        }}
      />
      <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-4 pb-16 pt-[72px] md:flex-row md:px-8 md:pb-0 lg:px-16">
        <div className="flex-1 text-center md:text-left">
          <p className="mb-4 text-sm font-semibold uppercase tracking-wider text-brand-300">
            For International Students in the UK
          </p>
          <h1 className="text-4xl font-extrabold leading-tight text-white md:text-5xl lg:text-6xl">
            Land Your Dream Job in the UK
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-brand-100 md:mx-0 md:text-xl">
            Get your Employability Score, a personalised roadmap, and AI-powered CV
            feedback — built specifically for international students navigating the
            UK job market.
          </p>
          <div className="mt-8 flex flex-col items-center gap-4 md:flex-row md:items-start">
            <Button
              size="lg"
              className="rounded-xl bg-brand-500 px-8 py-4 text-lg font-semibold text-white shadow-lg hover:bg-brand-600 hover:shadow-xl hover:scale-[1.02] transition-all"
              onClick={() => navigate(signUpPath)}
            >
              Get Started &mdash; It&apos;s Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
          <div className="mt-3 flex items-center justify-center gap-4 text-sm text-brand-200 md:justify-start">
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" /> Takes 5 minutes
            </span>
            <span className="flex items-center gap-1">
              <CreditCard className="h-4 w-4" /> No credit card
            </span>
          </div>
          <div className="mt-8 flex flex-col items-center gap-3 md:items-start">
            <p className="text-sm text-brand-200">Join 1,000+ students from leading UK universities</p>
            <div className="flex flex-wrap items-center justify-center gap-6 md:justify-start">
              {['Oxford', 'Cambridge', 'Imperial', 'UCL', 'LSE', 'Manchester', 'Edinburgh'].map((u) => (
                <span key={u} className="text-sm font-semibold tracking-wide text-white/50">
                  {u}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className={`mt-12 flex-1 md:mt-0 md:pl-12 ${prefersReduced ? '' : ''}`}>
          <div className="flex justify-center md:justify-end">
            <ScoreCardMockup />
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
        <span className="text-xs text-brand-300">Scroll to explore</span>
        <ChevronDown
          className={`h-5 w-5 text-brand-300 ${prefersReduced ? '' : 'animate-bounce'}`}
        />
      </div>
    </section>
  );
}

function TrustBar() {
  return (
    <div className="border-b border-white/10 py-8">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-8 px-4 md:px-8">
        <span className="text-sm font-medium text-brand-200">Trusted by students from</span>
        {['Oxford', 'Cambridge', 'Imperial', 'UCL', 'LSE', 'Manchester', 'Edinburgh'].map((u) => (
          <span key={u} className="text-lg font-semibold text-white/50">
            {u}
          </span>
        ))}
      </div>
    </div>
  );
}

function ScrollReveal({ children, className = '' }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) { setVisible(true); return; }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-600 ${
        visible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
      } ${className}`}
    >
      {children}
    </div>
  );
}

const steps = [
  {
    num: '01',
    icon: UserCircle,
    bg: 'bg-brand-100',
    text: 'text-brand-600',
    title: 'Build Your Profile',
    desc: 'Tell us about your degree, target industry, visa status, and experience. Takes 5 minutes.',
  },
  {
    num: '02',
    icon: Target,
    bg: 'bg-success-100',
    text: 'text-success-600',
    title: 'Get Your Score & Roadmap',
    desc: 'Our AI analyses your profile and generates a personalised checklist — from CV fixes to interview prep.',
  },
  {
    num: '03',
    icon: FileCheck,
    bg: 'bg-purple-100',
    text: 'text-purple-600',
    title: 'Analyse & Apply',
    desc: 'Upload your CV for AI feedback, tick off tasks, and watch your employability score climb.',
  },
];

function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-20">
      <div className="mx-auto max-w-6xl px-4 md:px-8">
        <ScrollReveal>
          <p className="text-center text-sm font-semibold uppercase tracking-wider text-brand-300">
            How It Works
          </p>
          <h2 className="mt-3 text-center text-3xl font-bold text-white md:text-4xl">
            Your Path to a UK Job in 3 Steps
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-lg text-brand-100">
            From your first assessment to your first offer &mdash; we&apos;ve mapped it out.
          </p>
        </ScrollReveal>

        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {steps.map((step, i) => (
            <ScrollReveal key={step.num} className="h-full">
              <div className="group h-full rounded-2xl border border-white/20 bg-white/10 p-8 shadow-2xl backdrop-blur-lg transition-shadow hover:shadow-xl">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-full ${step.bg} ${step.text} text-xl font-bold`}
                >
                  {step.num}
                </div>
                <step.icon className={`mt-4 h-8 w-8 ${step.text}`} />
                <h3 className="mt-4 text-xl font-bold text-white">{step.title}</h3>
                <p className="mt-2 leading-relaxed text-white/60">{step.desc}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

const features = [
  {
    icon: BarChart3,
    title: 'Your Employability Score',
    desc: 'One number (0-100) that tells you exactly where you stand. Broken down into 5 components so you know what to fix first.',
  },
  {
    icon: Map,
    title: 'AI Career Roadmap',
    desc: 'A living checklist organised into 3 phases: Foundation, Preparation, and Application. Tick tasks off and watch your score grow.',
  },
  {
    icon: FileSearch,
    title: 'AI CV Analysis',
    desc: 'Upload your CV and get structured feedback on Structure, Keywords, Clarity, and UK Conventions. Know exactly what is holding you back.',
  },
  {
    icon: Shield,
    title: 'Visa-Aware Guidance',
    desc: 'Curated, up-to-date guidance tailored to your visa status. Know your timelines and priorities — no legal jargon, no guesswork.',
  },
];

function FeaturesSection() {
  return (
    <section id="features" className="py-20">
      <div className="mx-auto max-w-6xl px-4 md:px-8">
        <ScrollReveal>
          <p className="text-center text-sm font-semibold uppercase tracking-wider text-brand-300">
            Features
          </p>
          <h2 className="mt-3 text-center text-3xl font-bold text-white md:text-4xl">
            Everything You Need to Get Hired
          </h2>
        </ScrollReveal>

        <div className="mt-12 grid gap-8 md:grid-cols-2">
          {features.map((f) => (
            <ScrollReveal key={f.title}>
              <div className="group rounded-2xl border border-white/20 bg-white/10 p-8 shadow-2xl backdrop-blur-lg transition-all duration-300 hover:border-white/30 hover:bg-white/15 hover:shadow-xl">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/10">
                  <f.icon className="h-7 w-7 text-white" />
                </div>
                <h3 className="mt-4 text-xl font-bold text-white">{f.title}</h3>
                <p className="mt-2 leading-relaxed text-white/60">{f.desc}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function DemoSection() {
  const navigate = useNavigate();
  const [score, setScore] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const target = 68;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) { setScore(target); return; }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const start = performance.now();
          const duration = 2000;
          const raf = (now: number) => {
            const t = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - t, 3);
            setScore(Math.round(eased * target));
            if (t < 1) requestAnimationFrame(raf);
          };
          requestAnimationFrame(raf);
          observer.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const bars = [
    { label: 'CV Quality', pct: 60, color: 'bg-slate-500' },
    { label: 'Skills Match', pct: 75, color: 'bg-success-500' },
    { label: 'Work Experience', pct: 45, color: 'bg-brand-500' },
    { label: 'Certifications', pct: 0, color: 'bg-purple-500' },
    { label: 'Platform Activity', pct: 80, color: 'bg-amber-500' },
  ];

  return (
    <section className="py-20">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-12 px-4 md:flex-row md:items-start md:px-8">
        <div className="flex-1">
          <h2 className="text-3xl font-bold text-white md:text-4xl">See Your Score in Real Time</h2>
          <p className="mt-4 max-w-lg text-lg text-brand-100">
            Every task you complete, every skill you add, every CV improvement — your
            score updates instantly. No waiting, no guessing.
          </p>
          <div className="mt-6 space-y-3">
            {[
              'Dynamic weighting — works even without a CV',
              'Instant feedback when you tick a task',
              'Track progress over time',
            ].map((item) => (
              <div key={item} className="flex items-center gap-3 text-brand-100">
                <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-green-400" />
                <span>{item}</span>
              </div>
            ))}
          </div>
          <div className="mt-8">
            <Button
              className="bg-brand-500 text-white hover:bg-brand-600"
              onClick={() => navigate(signUpPath)}
            >
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>

        <div ref={ref} className="w-full max-w-sm flex-shrink-0">
          <Card className="p-6">
            <p className="text-sm font-medium text-slate-500">Your Employability Score</p>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-5xl font-bold text-slate-900">{score}</span>
              <span className="text-lg text-slate-400">/ 100</span>
            </div>
            <div className="mt-6 space-y-3">
              {bars.map((bar) => (
                <div key={bar.label}>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">{bar.label}</span>
                    <span className="font-medium text-slate-500">
                      {bar.pct > 0 ? `${bar.pct}/100` : 'Not assessed'}
                    </span>
                  </div>
                  <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full ${bar.color} transition-all duration-1000`}
                      style={{ width: score > 0 ? `${bar.pct}%` : '0%' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}

const testimonials = [
  {
    quote:
      'I had no idea my CV was missing UK-specific keywords. The AI analysis caught it in seconds. I rewrote my CV, and within 2 weeks I had 3 interviews.',
    name: 'Priya K.',
    detail: 'MSc Computer Science, Imperial College',
    initials: 'PK',
    bg: 'bg-brand-100',
    text: 'text-brand-600',
  },
  {
    quote:
      'The roadmap kept me focused. Instead of panicking about everything at once, I just followed the checklist. It made the whole process manageable.',
    name: 'Ahmed R.',
    detail: 'BSc Finance, LSE',
    initials: 'AR',
    bg: 'bg-success-100',
    text: 'text-success-600',
  },
  {
    quote:
      'As an international student, the visa timing guidance was a lifesaver. I knew exactly when to start applying and what to prioritise.',
    name: 'Li Wei',
    detail: 'MBA, University of Manchester',
    initials: 'LW',
    bg: 'bg-purple-100',
    text: 'text-purple-600',
  },
];

function TestimonialsSection() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-6xl px-4 md:px-8">
        <ScrollReveal>
          <p className="text-center text-sm font-semibold uppercase tracking-wider text-brand-300">
            Student Stories
          </p>
          <h2 className="mt-3 text-center text-3xl font-bold text-white md:text-4xl">
            What Students Say
          </h2>
        </ScrollReveal>

        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <ScrollReveal key={i}>
              <div className="flex h-full flex-col rounded-2xl border border-white/20 bg-white/10 p-8 shadow-2xl backdrop-blur-lg">
                <Quote className="mb-4 h-8 w-8 text-white/30" />
                <p className="flex-1 text-sm leading-relaxed text-white/80">&ldquo;{t.quote}&rdquo;</p>
                <div className="mt-6 flex items-center gap-3">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-full ${t.bg} ${t.text} text-sm font-bold`}
                  >
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{t.name}</p>
                    <p className="text-xs text-white/50">{t.detail}</p>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function CtaSection() {
  const navigate = useNavigate();

  return (
    <section className="border-t border-white/10 py-20">
      <div className="mx-auto max-w-2xl px-4 text-center">
        <h2 className="text-3xl font-bold text-white md:text-4xl">
          Ready to Check Your Employability?
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-lg text-brand-100">
          Join thousands of international students who&apos;ve improved their UK job prospects.
        </p>
        <Button
          className="mx-auto mt-8 block rounded-xl bg-brand-500 px-10 py-5 text-xl font-semibold text-white shadow-lg transition-all hover:bg-brand-600 hover:shadow-xl hover:scale-105"
          onClick={() => navigate(signUpPath)}
        >
          Get Started &mdash; It&apos;s Free
          <ArrowRight className="ml-2 h-6 w-6" />
        </Button>
        <div className="mt-4 flex items-center justify-center gap-4 text-sm text-brand-200">
          <span className="flex items-center gap-1">
            <ShieldCheck className="h-4 w-4" /> No credit card
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" /> Takes 5 minutes
          </span>
          <span className="flex items-center gap-1">
            <XCircle className="h-4 w-4" /> Cancel anytime
          </span>
        </div>
      </div>
    </section>
  );
}

function MarketingFooter() {
  return (
    <footer className="bg-slate-900 py-12 text-slate-400">
      <div className="mx-auto max-w-6xl px-4 md:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <span className="text-xl font-bold text-white">Employability</span>
          <div className="flex gap-4">
            {[
              { label: 'LinkedIn', href: '#' },
              { label: 'X', href: '#' },
              { label: 'Instagram', href: '#' },
            ].map((s) => (
              <a
                key={s.label}
                href={s.href}
                className="text-sm text-slate-400 transition-colors hover:text-white"
              >
                {s.label}
              </a>
            ))}
          </div>
        </div>

        <hr className="my-8 border-slate-700" />

        <div className="grid gap-8 md:grid-cols-4">
          {[
            {
              title: 'Product',
              links: ['Dashboard', 'Roadmap', 'CV Analysis', 'Profile'],
            },
            {
              title: 'Resources',
              links: ['Blog', 'Guides', 'FAQ', 'Support'],
            },
            {
              title: 'Company',
              links: ['About', 'Careers', 'Contact', 'Press'],
            },
            {
              title: 'Legal',
              links: ['Privacy Policy', 'Terms of Service', 'Cookie Policy'],
            },
          ].map((col) => (
            <div key={col.title}>
              <p className="mb-3 text-sm font-semibold text-white">{col.title}</p>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-sm transition-colors hover:text-white">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <hr className="my-8 border-slate-700" />

        <div className="flex flex-col items-center justify-between gap-2 text-sm text-slate-500 md:flex-row">
          <p>&copy; 2026 Employability. All rights reserved.</p>
          <p>Built for international students in the UK.</p>
        </div>
      </div>
    </footer>
  );
}

export function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-900 via-brand-800 to-brand-600">
      <FloatingNavbar />
      <HeroSection />
      <TrustBar />
      <HowItWorksSection />
      <FeaturesSection />
      <DemoSection />
      <TestimonialsSection />
      <CtaSection />
      <MarketingFooter />
    </div>
  );
}
