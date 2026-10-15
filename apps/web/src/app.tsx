import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';
import { Providers } from './providers';
import { ThemeProvider } from './shell/ThemeProvider';
import { AppShell } from './shell/AppShell';
import { FocusLayout } from './shell/FocusLayout';
import { useProfile } from './hooks/useProfile';
import { DashboardPage } from './pages/DashboardPage';
import { LandingPage } from './pages/LandingPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { UploadPage } from './pages/UploadPage';
import { FeedbackPage } from './pages/FeedbackPage';
import { WordCheckPage } from './pages/WordCheckPage';
import { HistoryPage } from './pages/HistoryPage';
import { RoadmapPage } from './pages/RoadmapPage';
import { SkillsPage } from './pages/SkillsPage';
import { InterviewPage } from './pages/InterviewPage';
import { JobsPage } from './pages/JobsPage';
import { BadgePage } from './pages/BadgePage';
import { PlansPage } from './pages/PlansPage';
import { SettingsPage } from './pages/SettingsPage';

const CLERK_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

function RequireAuth() {
  if (!CLERK_KEY) return <Outlet />;
  return (
    <>
      <SignedIn><Outlet /></SignedIn>
      <SignedOut><RedirectToSignIn /></SignedOut>
    </>
  );
}

function RequireOnboarding() {
  const { data: profile, isLoading } = useProfile();
  if (isLoading) {
    return (
      <div style={{ minHeight: '100dvh', display: 'grid', placeItems: 'center', padding: 16 }}>
        <div className="card" style={{ width: 'min(360px, 100%)', display: 'grid', gap: 12 }}>
          <p className="eyebrow" style={{ margin: 0 }}>Uni Compass AI</p>
          <h2 className="h2">Finding your heading…</h2>
          <div className="bar"><i style={{ width: '40%' }} /></div>
        </div>
      </div>
    );
  }
  if (!profile) return <Navigate to="/onboarding" replace />;
  return <Outlet />;
}

export function App() {
  return (
    <Providers>
      <ThemeProvider />
      <Routes>
        <Route element={<FocusLayout landing />}>
          <Route path="/" element={<LandingPage />} />
        </Route>

        <Route element={<RequireAuth />}>
          <Route element={<FocusLayout />}>
            <Route path="/onboarding" element={<OnboardingPage />} />
          </Route>
          <Route element={<RequireOnboarding />}>
            <Route element={<AppShell />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/upload" element={<UploadPage />} />
              <Route path="/feedback" element={<FeedbackPage />} />
              <Route path="/wordcheck" element={<WordCheckPage />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="/roadmap" element={<RoadmapPage />} />
              <Route path="/skills" element={<SkillsPage />} />
              <Route path="/interview" element={<InterviewPage />} />
              <Route path="/jobs" element={<JobsPage />} />
              <Route path="/badge" element={<BadgePage />} />
              <Route path="/plans" element={<PlansPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
          </Route>
        </Route>

        <Route path="/opportunities" element={<Navigate to="/jobs" replace />} />
        <Route path="/cv-analysis" element={<Navigate to="/upload" replace />} />
        <Route path="/profile" element={<Navigate to="/settings" replace />} />
        <Route path="/home" element={<Navigate to="/" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Providers>
  );
}
