'use client';

import { Menu, Sun, Moon, Lock, Unlock } from 'lucide-react';
import { useState } from 'react';
import { useTheme } from '@/hooks/useTheme';
import { useGlobalLock } from '@/hooks/useGlobalLock';
import { useAuth } from '@/hooks/useAuth';
import { setGlobalLock } from '@/lib/firestore';
import { useToast } from '@/components/ui/Toast';

interface HeaderProps {
  onMenuClick: () => void;
  userName: string;
}

export function Header({ onMenuClick, userName }: HeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const lock = useGlobalLock();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [lockLoading, setLockLoading] = useState(false);

  async function handleToggleLock() {
    if (!user?.email) return;
    setLockLoading(true);
    try {
      const next = !lock.isLocked;
      await setGlobalLock(next, user.email);
      showToast(next ? 'Data berhasil dikunci' : 'Kunci data dibuka', 'success');
    } catch {
      showToast('Gagal mengubah status kunci', 'danger');
    } finally {
      setLockLoading(false);
    }
  }

  const initial = userName ? userName.charAt(0).toUpperCase() : 'A';

  return (
    <header
      className="fixed top-0 left-0 right-0 z-20 no-print"
      style={{
        height: 'var(--header-height-mobile)',
        background: 'var(--c-navy)',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        boxShadow: 'var(--shadow-md)',
      }}
    >
      <style jsx>{`
        @media (min-width: 640px) {
          header { height: var(--header-height-desktop) !important; }
        }
      `}</style>

      <div className="flex items-center h-full" style={{ padding: '0 var(--sp-4)', gap: 'var(--sp-3)' }}>

        {/* Hamburger */}
        <button
          onClick={onMenuClick}
          aria-label="Menu navigasi"
          className="flex items-center justify-center rounded-lg transition-colors flex-shrink-0"
          style={{ width: 'var(--touch-min)', height: 'var(--touch-min)', color: '#ffffff' }}
          onMouseOver={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.12)')}
          onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
        >
          <Menu size={22} />
        </button>

        {/* Brand */}
        <div className="flex-1 min-w-0 leading-tight">
          <div style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: '#ffffff', lineHeight: 1.2 }}>
            DHKP
          </div>
          <div style={{ fontSize: 'var(--text-xs)', fontWeight: 400, color: 'rgba(255,255,255,0.65)', lineHeight: 1.3 }}>
            Desa Karang Sengon
          </div>
        </div>

        {/* Right controls */}
        <div className="flex items-center flex-shrink-0" style={{ gap: 'var(--sp-2)' }}>

          {/* Kunci Global */}
          <button
            onClick={handleToggleLock}
            disabled={lockLoading}
            title={lock.isLocked
              ? `Dikunci oleh ${lock.lockedBy} — klik untuk buka`
              : 'Data terbuka — klik untuk kunci'}
            className="flex items-center rounded-lg font-semibold disabled:opacity-50"
            style={{
              gap: 'var(--sp-2)',
              padding: '0 var(--sp-3)',
              height: 40,
              fontSize: 'var(--text-sm)',
              fontWeight: 600,
              background: lock.isLocked ? 'rgba(239,83,80,0.2)' : 'rgba(76,175,80,0.2)',
              color: lock.isLocked ? '#FFCDD2' : '#C8E6C9',
              border: `1px solid ${lock.isLocked ? 'rgba(239,83,80,0.4)' : 'rgba(76,175,80,0.4)'}`,
              transition: 'all 150ms ease',
              whiteSpace: 'nowrap',
            }}
          >
            {lock.isLocked ? <Lock size={15} /> : <Unlock size={15} />}
            <span>{lock.isLocked ? 'Terkunci' : 'Terbuka'}</span>
          </button>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Ganti tema"
            className="flex items-center justify-center rounded-lg transition-colors"
            style={{
              width: 'var(--touch-min)',
              height: 'var(--touch-min)',
              color: theme === 'dark' ? '#FFD54F' : 'rgba(255,255,255,0.75)',
            }}
            onMouseOver={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.12)')}
            onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {/* Avatar */}
          <div
            className="flex items-center justify-center rounded-full select-none flex-shrink-0 font-bold"
            title={userName}
            style={{
              width: 36,
              height: 36,
              background: 'var(--c-gold)',
              color: '#1A1A1A',
              fontSize: 'var(--text-sm)',
              fontWeight: 700,
            }}
          >
            {initial}
          </div>
        </div>
      </div>
    </header>
  );
}
