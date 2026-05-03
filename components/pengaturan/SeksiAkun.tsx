'use client';

import { useState } from 'react';
import { KeyRound, User } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { SectionHeader } from './SectionHeader';

interface SeksiAkunProps {
  userEmail: string | null;
  userDisplayName: string | null;
}

export function SeksiAkun({ userEmail, userDisplayName }: SeksiAkunProps) {
  const { showToast } = useToast();
  const [resetLoading, setResetLoading] = useState(false);

  async function handleResetPassword() {
    if (!userEmail) return;
    setResetLoading(true);
    try {
      await sendPasswordResetEmail(auth, userEmail);
      showToast(`Link reset dikirim ke ${userEmail}`, 'success');
    } catch {
      showToast('Gagal mengirim email reset', 'danger');
    } finally {
      setResetLoading(false);
    }
  }

  return (
    <div className="card" style={{ padding: 'var(--sp-5)' }}>
      <SectionHeader
        icon={<User size={18} style={{ color: 'var(--c-text-inv)' }} />}
        iconBg="var(--c-navy)"
        title="Akun & Keamanan"
        sub="Informasi akun yang sedang login"
      />

      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-4)', padding: 'var(--sp-4)', borderRadius: 'var(--radius-md)', background: 'var(--c-bg)', border: '1px solid var(--c-border)', marginBottom: 'var(--sp-3)' }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--c-navy)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--c-text-inv)', fontWeight: 700, fontSize: 'var(--text-base)', flexShrink: 0 }}>
          {(userDisplayName || userEmail || 'U').charAt(0).toUpperCase()}
        </div>
        <div>
          <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--c-text-1)' }}>
            {userDisplayName || userEmail || 'Pengguna'}
          </div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--c-text-3)', marginTop: 2 }}>{userEmail || '—'}</div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--sp-3)', padding: 'var(--sp-4)', borderRadius: 'var(--radius-md)', background: 'var(--c-bg)', border: '1px solid var(--c-border)' }}>
        <KeyRound size={16} style={{ color: 'var(--c-text-3)', marginTop: 2, flexShrink: 0 }} />
        <div>
          <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--c-text-1)' }}>Ganti Password</div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--c-text-3)', margin: '4px 0 12px' }}>
            Link reset password akan dikirim ke <strong>{userEmail}</strong>.
          </div>
          <button
            className="btn btn-secondary btn-sm"
            onClick={handleResetPassword}
            disabled={resetLoading}
            style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 'var(--text-xs)' }}
          >
            <KeyRound size={13} />
            {resetLoading ? 'Mengirim...' : 'Kirim Link Reset Password'}
          </button>
        </div>
      </div>
    </div>
  );
}
