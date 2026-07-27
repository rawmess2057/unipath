import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Map, FileText, User, Menu, X } from 'lucide-react';
import { lazy, Suspense, useState } from 'react';

const CLERK_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

const ClerkUserButton = lazy(() =>
  import('@clerk/clerk-react').then((m) => ({ default: m.UserButton })),
);

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/roadmap', label: 'Roadmap', icon: Map },
  { to: '/cv-analysis', label: 'CV Analysis', icon: FileText },
  { to: '/profile', label: 'Profile', icon: User },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 h-16 border-b border-white/10 bg-brand-900/95 backdrop-blur-md">
      <div className="mx-auto flex h-full max-w-5xl items-center justify-between px-4">
        <NavLink to="/dashboard" className="text-xl font-bold text-white">
          Employability
        </NavLink>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Main navigation">
          {navItems.map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-white/10 text-white'
                    : 'text-brand-200 hover:bg-white/10 hover:text-white'
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-sm font-medium text-brand-200 sm:flex">
            <span className="font-bold text-white">--</span>
            <span className="text-brand-200/60">/ 100</span>
          </div>

          {CLERK_KEY && (
            <div className="hidden sm:block">
              <Suspense fallback={<div className="h-8 w-8 rounded-full bg-white/10" />}>
                <ClerkUserButton />
              </Suspense>
            </div>
          )}

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex items-center justify-center rounded-lg p-2 text-brand-200 hover:bg-white/10 md:hidden"
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-white/10 bg-brand-800 md:hidden">
          <nav className="flex flex-col px-2 py-2" aria-label="Mobile navigation">
            {navItems.map((item) => {
              const isActive = location.pathname === item.to;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium ${
                    isActive
                      ? 'bg-white/10 text-white'
                      : 'text-brand-200 hover:bg-white/10'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
