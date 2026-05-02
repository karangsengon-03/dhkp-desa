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
        background: 'var(--c-surface)',
        borderBottom: '1px solid var(--c-border)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <style jsx>{`
        @media (min-width: 640px) {
          header { height: var(--header-height-desktop) !important; }
        }
        @media (min-width: 480px) {
          .lock-label { display: inline !important; }
        }
      `}</style>

      <div className="flex items-center h-full" style={{ padding: '0 var(--sp-3)', gap: 'var(--sp-2)' }}>

        {/* Hamburger — 44×44px touch target */}
        <button
          onClick={onMenuClick}
          aria-label="Menu"
          className="flex items-center justify-center rounded-md transition-colors flex-shrink-0"
          style={{ width: 'var(--touch-min)', height: 'var(--touch-min)', color: 'var(--c-navy)' }}
          onMouseOver={e => (e.currentTarget.style.background = 'var(--c-navy-light)')}
          onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
        >
          <Menu size={18} />
        </button>

        {/* Brand */}
        <div className="flex-1 min-w-0 leading-tight">
          <div style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--c-navy)', lineHeight: 1.2 }}>
            DHKP
          </div>
          <div style={{ fontSize: 'var(--text-xs)', fontWeight: 500, color: 'var(--c-text-3)', lineHeight: 1.2 }}>
            Desa Karang Sengon
          </div>
        </div>

        {/* Right controls */}
        <div className="flex items-center flex-shrink-0" style={{ gap: 'var(--sp-1)' }}>

          {/* Kunci Global */}
          <button
            onClick={handleToggleLock}
            disabled={lockLoading}
            title={lock.isLocked
              ? `Dikunci oleh ${lock.lockedBy} — klik untuk buka`
              : 'Data terbuka — klik untuk kunci'}
            className="flex items-center rounded-md font-semibold disabled:opacity-50"
            style={{
              gap: 'var(--sp-1)',
              padding: '0 10px',
              height: 32,
              fontSize: 'var(--text-xs)',
              fontWeight: 600,
              background: lock.isLocked ? 'var(--c-danger-light)' : 'var(--c-success-light)',
              color:      lock.isLocked ? 'var(--c-danger)'       : 'var(--c-success)',
              border:     `1px solid ${lock.isLocked ? 'var(--c-danger)' : 'var(--c-success)'}`,
              borderRadius: 'var(--radius-sm)',
              transition: 'all 150ms ease',
            }}
          >
            {lock.isLocked
              ? <Lock size={14} />
              : <Unlock size={14} />
            }
            <span className="lock-label" style={{ display: 'none' }}>
              {lock.isLocked ? 'Terkunci' : 'Terbuka'}
            </span>
          </button>

          {/* Theme toggle — 44×44px */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle tema"
            className="flex items-center justify-center rounded-md transition-colors"
            style={{
              width: 'var(--touch-min)',
              height: 'var(--touch-min)',
              color: theme === 'dark' ? 'var(--c-gold)' : 'var(--c-text-3)',
            }}
            onMouseOver={e => (e.currentTarget.style.background = 'var(--c-navy-light)')}
            onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Avatar */}
          <div
            className="flex items-center justify-center rounded-full select-none flex-shrink-0"
            title={userName}
            style={{
              width: 28,
              height: 28,
              background: 'var(--c-navy)',
              color: 'var(--c-text-inv)',
              fontSize: 'var(--text-xs)',
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
