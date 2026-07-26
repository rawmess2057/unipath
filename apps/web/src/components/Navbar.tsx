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
    <header className="sticky top-0 z-50 h-16 border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-full max-w-5xl items-center justify-between px-4">
        <NavLink to="/dashboard" className="text-xl font-bold text-brand-600">
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
                    ? 'bg-brand-50 text-brand-600'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-600 sm:flex">
            <span className="font-bold text-brand-600">--</span>
            <span className="text-slate-400">/ 100</span>
          </div>

          {CLERK_KEY && (
            <div className="hidden sm:block">
              <Suspense fallback={<div className="h-8 w-8 rounded-full bg-slate-200" />}>
                <ClerkUserButton />
              </Suspense>
            </div>
          )}

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex items-center justify-center rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden"
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-slate-200 bg-white md:hidden">
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
                      ? 'bg-brand-50 text-brand-600'
                      : 'text-slate-600 hover:bg-slate-50'
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
