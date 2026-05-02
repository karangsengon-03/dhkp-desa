'use client';

import { Lock } from 'lucide-react';
import { GlobalLock } from '@/types';

interface LockBannerProps {
  lock: GlobalLock;
}

export function LockBanner({ lock }: LockBannerProps) {
  if (!lock.isLocked) return null;

  return (
    <div
      className="flex items-center gap-3 px-4 py-3 rounded-lg mb-5 border"
      style={{
        background: 'var(--c-danger-light)',
        borderColor: 'var(--c-danger)',
        color: 'var(--c-danger)',
      }}
    >
      <Lock size={16} style={{ flexShrink: 0 }} />
      <span className="font-semibold" style={{ fontSize: 'var(--text-sm)' }}>
        Data dikunci oleh:{' '}
        <strong>{lock.lockedBy}</strong>
        {' '}— edit, tambah, dan hapus tidak tersedia.
      </span>
    </div>
  );
}
