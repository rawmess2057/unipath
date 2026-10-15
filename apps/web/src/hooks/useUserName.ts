import { useUser } from '@clerk/clerk-react';
import { useUcai } from '../stores/ucai';

const CLERK_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

export interface UserName { first: string; last: string; full: string; initials: string; clerkUser: { id: string; firstName: string | null; lastName: string | null; update?: (p: { firstName?: string; lastName?: string }) => Promise<unknown> } | null }

/** First/last name from Clerk when present, else the locally stored name. */
export function useUserName(): UserName {
  const name = useUcai((s) => s.name);
  const last = useUcai((s) => s.last);
  // CLERK_KEY is a build-time constant, so this branch never changes between renders.
  const clerk = CLERK_KEY ? useUser() : null; // eslint-disable-line react-hooks/rules-of-hooks
  const first = (clerk?.user?.firstName || name || '').trim();
  const lastName = (clerk?.user?.lastName || last || '').trim();
  const initials = ((first[0] || 'U') + (lastName[0] || first[1] || 'C')).toUpperCase();
  const u = clerk?.user ?? null;
  return { first, last: lastName, full: [first, lastName].filter(Boolean).join(' '), initials, clerkUser: u ? { id: u.id, firstName: u.firstName, lastName: u.lastName, update: (p) => u.update(p) } : null };
}
