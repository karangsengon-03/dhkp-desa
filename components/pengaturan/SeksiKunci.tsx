'use client';

import { useState } from 'react';
import { Lock, Unlock, ShieldAlert, AlertTriangle, X } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { setGlobalLock } from '@/lib/firestore';
import { formatTimestamp } from '@/lib/format';
import { GlobalLock } from '@/types';
import { SectionHeader } from './SectionHeader';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

interface SeksiKunciProps {
  lock: GlobalLock & { lockedBy?: string; lockedAt?: { seconds: number; nanoseconds: number } };
  userEmail: string | null;
}

export function SeksiKunci({ lock, userEmail }: SeksiKunciProps) {
  const { showToast } = useToast();
  const [lockLoading, setLockLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  function handleClickToggle() {
    setConfirmOpen(true);
  }

  async function handleConfirm() {
    if (!userEmail) return;
    setConfirmOpen(false);
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
        onClick={handleClickToggle}
        disabled={lockLoading}
        style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 'var(--t-sm)' }}
      >
        {lock.isLocked ? <Unlock size={14} /> : <Lock size={14} />}
        {lockLoading ? 'Memproses...' : lock.isLocked ? 'Buka Kunci Data' : 'Kunci Semua Data'}
      </button>

      {/* Dialog konfirmasi */}
      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title={lock.isLocked ? 'Konfirmasi Buka Kunci' : 'Konfirmasi Kunci Data'}
        size="sm"
      >
        <div className="flex flex-col items-center gap-4 py-2 text-center">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center"
            style={{
              background: lock.isLocked ? 'var(--c-ok-soft)' : 'var(--c-err-soft)',
              color: lock.isLocked ? 'var(--c-ok)' : 'var(--c-err)',
            }}
          >
            <AlertTriangle size={26} />
          </div>
          <div>
            <p style={{ fontWeight: 700, fontSize: 'var(--t-base)', color: 'var(--c-t1)', marginBottom: 'var(--s2)' }}>
              {lock.isLocked ? 'Buka kunci semua data?' : 'Kunci semua data?'}
            </p>
            <p style={{ fontSize: 'var(--t-sm)', color: 'var(--c-t3)', maxWidth: 280, margin: '0 auto' }}>
              {lock.isLocked
                ? 'Semua pengguna akan dapat mengubah data kembali setelah kunci dibuka.'
                : 'Semua pengguna tidak dapat mengubah data selama kunci aktif.'}
            </p>
          </div>
          <div className="flex gap-3 w-full">
            <Button variant="ghost" className="flex-1" onClick={() => setConfirmOpen(false)}>
              <X size={15} /> Batal
            </Button>
            <Button
              variant={lock.isLocked ? 'primary' : 'danger'}
              className="flex-1"
              onClick={handleConfirm}
            >
              {lock.isLocked ? <Unlock size={15} /> : <Lock size={15} />}
              {lock.isLocked ? 'Ya, Buka Kunci' : 'Ya, Kunci Data'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
