import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'sonner';
import { ClerkProvider } from '@clerk/clerk-react';
import type { ReactNode } from 'react';
import { AuthSync } from '../components/AuthSync';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 1000 * 60 * 5, retry: 1 },
  },
});

const CLERK_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

export function Providers({ children }: { children: ReactNode }) {
  const wrapped = (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthSync />
        {children}
        <Toaster position="top-right" toastOptions={{ duration: 5000 }} />
      </QueryClientProvider>
    </BrowserRouter>
  );

  if (!CLERK_KEY) return wrapped;

  return (
    <ClerkProvider
      publishableKey={CLERK_KEY}
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      afterSignInUrl="/dashboard"
      afterSignUpUrl="/onboarding"
    >
      {wrapped}
    </ClerkProvider>
  );
}
