'use client';

import { useState, useEffect } from 'react';
import { subscribeGlobalLock } from '@/lib/firestore';
import { GlobalLock } from '@/types';

export function useGlobalLock() {
  const [lock, setLock] = useState<GlobalLock>({ isLocked: false, lockedBy: '' });

  useEffect(() => {
    const unsub = subscribeGlobalLock(setLock);
    return unsub;
  }, []);

  return lock;
}
