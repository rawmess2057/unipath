import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';
import { Providers } from './providers';
import { Layout } from './components/Layout';
import { LandingPage } from './features/landing/LandingPage';
import { OnboardingWizard } from './features/onboarding/OnboardingWizard';
import { DashboardPage } from './features/dashboard/DashboardPage';
import { CvAnalysisPage } from './features/cv-analysis/CvAnalysisPage';
import { RoadmapPage } from './features/roadmap/RoadmapPage';
import { ProfilePage } from './features/profile/ProfilePage';
import { useProfile } from './hooks/useProfile';

const CLERK_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

function RequireAuth() {
  if (!CLERK_KEY) {
    return <Outlet />;
  }
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
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
      </div>
    );
  }

  if (!profile) {
    return <Navigate to="/onboarding" replace />;
  }

  return <Outlet />;
}

export function App() {
  return (
    <Providers>
      <Routes>
        <Route path="/" element={<LandingPage />} />

        <Route element={<RequireAuth />}>
          <Route path="/onboarding" element={<OnboardingWizard />} />
          <Route element={<RequireOnboarding />}>
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/roadmap" element={<RoadmapPage />} />
              <Route path="/cv-analysis" element={<CvAnalysisPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Providers>
  );
}
