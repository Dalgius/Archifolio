'use client';

import * as React from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { getFirebaseAuth } from '@/lib/firebase';

// Tracks the Firebase Auth user. `user` is undefined while the session is being restored.
export function useAuth() {
  const [user, setUser] = React.useState<User | null | undefined>(undefined);

  React.useEffect(() => onAuthStateChanged(getFirebaseAuth(), setUser), []);

  return { user, isLoading: user === undefined };
}
