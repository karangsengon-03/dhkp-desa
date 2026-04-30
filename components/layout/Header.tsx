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
  pageTitle: string;
  userName: string;
}

export function Header({ onMenuClick, pageTitle, userName }: HeaderProps) {
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
        height: 'var(--header-height)',
        background: 'var(--color-surface)',
        borderBottom: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div className="flex items-center h-full px-3 gap-2">

        {/* Hamburger */}
        <button
          onClick={onMenuClick}
          className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
          style={{ color: 'var(--color-primary)' }}
          onMouseOver={e => (e.currentTarget.style.background = 'var(--color-primary-light)')}
          onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
          aria-label="Menu"
        >
          <Menu size={19} />
        </button>

        {/* Brand + subtitle */}
        <div className="flex-1 min-w-0 leading-tight">
          <div className="text-sm font-bold truncate" style={{ color: 'var(--color-primary)' }}>
            DHKP Karang Sengon
          </div>
          <div className="text-xs truncate" style={{ color: 'var(--color-text-secondary)' }}>
            {pageTitle}
          </div>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-1 flex-shrink-0">

          {/* Kunci Global */}
          <button
            onClick={handleToggleLock}
            disabled={lockLoading}
            title={lock.isLocked ? `Dikunci oleh ${lock.lockedBy} — klik untuk buka` : 'Data terbuka — klik untuk kunci'}
            className="flex items-center gap-1 px-2 h-7 rounded-lg text-xs font-semibold transition-all disabled:opacity-50"
            style={{
              background: lock.isLocked ? 'var(--color-danger-light)' : 'var(--color-success-light)',
              color:      lock.isLocked ? 'var(--color-danger)'       : 'var(--color-success)',
              border:     `1px solid ${lock.isLocked ? 'var(--color-danger)' : 'var(--color-success)'}`,
            }}
          >
            {lock.isLocked ? <Lock size={12} /> : <Unlock size={12} />}
            <span className="hidden xs:inline">
              {lock.isLocked ? 'Kunci' : 'Buka'}
            </span>
          </button>

          {/* Theme */}
          <button
            onClick={toggleTheme}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
            style={{ color: theme === 'dark' ? 'var(--color-gold)' : 'var(--color-text-secondary)' }}
            onMouseOver={e => (e.currentTarget.style.background = 'var(--color-primary-light)')}
            onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
            aria-label="Toggle tema"
          >
            {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
          </button>

          {/* Avatar */}
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 select-none"
            style={{ background: 'var(--color-primary)' }}
            title={userName}
          >
            {initial}
          </div>
        </div>
      </div>
    </header>
  );
}
