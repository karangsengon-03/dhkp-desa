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
      className="flex items-center gap-3 px-4 py-3 rounded-xl mb-5 border"
      style={{
        background: 'var(--color-danger-light)',
        borderColor: 'var(--color-danger)',
        color: 'var(--color-danger)',
      }}
    >
      <Lock size={18} />
      <span className="text-sm font-semibold">
        Data dikunci oleh: <strong>{lock.lockedBy}</strong> — edit, tambah, dan hapus tidak tersedia.
      </span>
    </div>
  );
}
