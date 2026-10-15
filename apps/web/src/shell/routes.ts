import type { IconName } from '../ui/Icon';

export interface RouteDef {
  path: string;
  title: string;
  icon: IconName;
  group: 'Overview' | 'Your CV' | 'Grow' | 'Opportunities' | 'You';
  pro?: boolean;
  hidden?: boolean;
}

export const ROUTES: RouteDef[] = [
  { path: '/dashboard', title: 'Dashboard', icon: 'home', group: 'Overview' },
  { path: '/upload', title: 'Upload CV', icon: 'upload', group: 'Your CV' },
  { path: '/feedback', title: 'CV feedback', icon: 'file', group: 'Your CV' },
  { path: '/wordcheck', title: 'Word check', icon: 'book', group: 'Your CV' },
  { path: '/history', title: 'CV history', icon: 'history', group: 'Your CV', pro: true },
  { path: '/roadmap', title: 'Roadmap', icon: 'route', group: 'Grow' },
  { path: '/skills', title: 'Skills gap', icon: 'bars', group: 'Grow' },
  { path: '/interview', title: 'Mock interview', icon: 'mic', group: 'Grow', pro: true },
  { path: '/jobs', title: 'Job matching', icon: 'brief', group: 'Opportunities' },
  { path: '/badge', title: 'Share badge', icon: 'share', group: 'You' },
  { path: '/plans', title: 'Plans', icon: 'star', group: 'You' },
  { path: '/settings', title: 'Settings', icon: 'sliders', group: 'You' },
  { path: '/', title: 'About Uni Compass', icon: 'compass', group: 'You' },
  { path: '/onboarding', title: 'Welcome', icon: 'compass', group: 'You', hidden: true },
];

export const NAV_GROUPS = ['Overview', 'Your CV', 'Grow', 'Opportunities', 'You'] as const;

export const routeFor = (pathname: string) => ROUTES.find((r) => r.path === pathname);

/** The four bottom-nav destinations on phones. */
export const BOTTOM_NAV: { path: string; icon: IconName; label: string }[] = [
  { path: '/dashboard', icon: 'home', label: 'Home' },
  { path: '/feedback', icon: 'file', label: 'CV' },
  { path: '/roadmap', icon: 'route', label: 'Roadmap' },
  { path: '/jobs', icon: 'brief', label: 'Jobs' },
];
