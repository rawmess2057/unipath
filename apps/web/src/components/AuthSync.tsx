import { useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { setAuthHeaders } from '../lib/api-client';

const CLERK_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const DEV_USER_ID_KEY = 'unipath_dev_user_id';

function getOrCreateDevId(): string {
  let id = localStorage.getItem(DEV_USER_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(DEV_USER_ID_KEY, id);
  }
  return id;
}

function DevAuthSync() {
  useEffect(() => {
    const devId = getOrCreateDevId();
    setAuthHeaders({
      'x-clerk-user-id': devId,
      'x-clerk-email': 'dev@unipath.local',
    });
  }, []);
  return null;
}

function ClerkAuthSync() {
  const { user } = useUser();

  useEffect(() => {
    if (user) {
      setAuthHeaders({
        'x-clerk-user-id': user.id,
        'x-clerk-email': user.primaryEmailAddress?.emailAddress ?? '',
      });
    }
  }, [user]);

  return null;
}

export function AuthSync() {
  if (!CLERK_KEY) {
    return <DevAuthSync />;
  }
  return <ClerkAuthSync />;
}
