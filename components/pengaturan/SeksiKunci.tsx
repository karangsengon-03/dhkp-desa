'use client';

import { useState } from 'react';
import { Lock, Unlock, ShieldAlert } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { setGlobalLock } from '@/lib/firestore';
import { formatTimestamp } from '@/lib/format';
import { GlobalLock } from '@/types';
import { SectionHeader } from './SectionHeader';

interface SeksiKunciProps {
  lock: GlobalLock & { lockedBy?: string; lockedAt?: { seconds: number; nanoseconds: number } };
  userEmail: string | null;
}

export function SeksiKunci({ lock, userEmail }: SeksiKunciProps) {
  const { showToast } = useToast();
  const [lockLoading, setLockLoading] = useState(false);

  async function handleToggleLock() {
    if (!userEmail) return;
    setLockLoading(true);
    try {
      const newState = !lock.isLocked;
      await setGlobalLock(newState, userEmail);
      showToast(newState ? 'Data berhasil dikunci' : 'Kunci data berhasil dibuka', 'success');
    } catch {
      showToast('Gagal mengubah status kunci', 'danger');
    } finally {
      setLockLoading(false);
    }
  }

  return (
    <div className="card" style={{ padding: 'var(--s5)' }}>
      <SectionHeader
        icon={
          lock.isLocked
            ? <Lock size={18} style={{ color: 'var(--c-inv)' }} />
            : <Unlock size={18} style={{ color: 'var(--c-inv)' }} />
        }
        iconBg={lock.isLocked ? 'var(--c-err)' : 'var(--c-ok)'}
        title="Kunci Data Global"
        sub="Mencegah semua pengguna mengubah data ketika aktif"
      />

      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s3)', padding: 'var(--s4)', borderRadius: 'var(--r-md)', border: `1px solid ${lock.isLocked ? 'var(--c-err)' : 'var(--c-border)'}`, background: lock.isLocked ? 'var(--c-err-soft)' : 'var(--c-bg)', marginBottom: 'var(--s4)' }}>
        {lock.isLocked
          ? <ShieldAlert size={18} style={{ color: 'var(--c-err)', flexShrink: 0 }} />
          : <Unlock size={18} style={{ color: 'var(--c-ok)', flexShrink: 0 }} />
        }
        <div>
          <div style={{ fontWeight: 600, fontSize: 'var(--t-sm)', color: lock.isLocked ? 'var(--c-err)' : 'var(--c-ok)' }}>
            {lock.isLocked ? 'Data Sedang Dikunci' : 'Data Tidak Dikunci'}
          </div>
          {lock.isLocked && lock.lockedBy && (
            <div style={{ fontSize: 'var(--t-xs)', color: 'var(--c-t3)', marginTop: 2 }}>
              Dikunci oleh: <strong>{lock.lockedBy}</strong>
              {lock.lockedAt && (
                <> · {formatTimestamp(lock.lockedAt)}</>
              )}
            </div>
          )}
        </div>
      </div>

      <button
        className={`btn ${lock.isLocked ? 'btn-danger' : 'btn-primary'}`}
        onClick={handleToggleLock}
        disabled={lockLoading}
        style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 'var(--t-sm)' }}
      >
        {lock.isLocked ? <Unlock size={14} /> : <Lock size={14} />}
        {lockLoading ? 'Memproses...' : lock.isLocked ? 'Buka Kunci Data' : 'Kunci Semua Data'}
      </button>
    </div>
  );
}
