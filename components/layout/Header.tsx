'use client';

import { Menu, Sun, Moon, Lock, Unlock, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { useTheme } from '@/hooks/useTheme';
import { useGlobalLock } from '@/hooks/useGlobalLock';
import { useAuth } from '@/hooks/useAuth';
import { setGlobalLock } from '@/lib/firestore';
import { useToast } from '@/components/ui/Toast';

const CURRENT_YEAR = new Date().getFullYear();
const TAHUN_LIST = Array.from({ length: 5 }, (_, i) => CURRENT_YEAR - i);

interface HeaderProps {
  onMenuClick: () => void;
  pageTitle: string;
  userName: string;
  tahun?: number;
  onTahunChange?: (t: number) => void;
  showTahun?: boolean;
}

export function Header({
  onMenuClick,
  pageTitle,
  userName,
  tahun,
  onTahunChange,
  showTahun = false,
}: HeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const lock = useGlobalLock();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [lockLoading, setLockLoading] = useState(false);

  async function handleToggleLock() {
    if (!user?.email) return;
    setLockLoading(true);
    try {
      const newState = !lock.isLocked;
      await setGlobalLock(newState, user.email);
      showToast(
        newState ? 'Data berhasil dikunci' : 'Kunci data berhasil dibuka',
        'success'
      );
    } catch {
      showToast('Gagal mengubah status kunci', 'danger');
    } finally {
      setLockLoading(false);
    }
  }

  return (
    <header
      className="fixed top-0 left-0 right-0 z-20 flex items-center justify-between px-4 no-print"
      style={{
        height: 'var(--header-height)',
        background: 'var(--color-surface)',
        borderBottom: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      {/* Left */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="p-2 rounded-lg transition-colors hover:bg-[var(--color-primary-light)]"
          aria-label="Toggle menu"
        >
          <Menu size={20} style={{ color: 'var(--color-primary)' }} />
        </button>
        <div>
          <div className="text-sm font-bold" style={{ color: 'var(--color-primary)' }}>
            DHKP Desa Karang Sengon
          </div>
          <div className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
            {pageTitle}
          </div>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-1 sm:gap-2">

        {/* Dropdown Tahun — hanya tampil jika showTahun=true */}
        {showTahun && onTahunChange && (
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-medium hidden sm:block" style={{ color: 'var(--color-text-secondary)' }}>
              Tahun:
            </span>
            <select
              className="input-field w-auto text-xs py-1 px-2"
              style={{ minWidth: 72, height: 32 }}
              value={tahun ?? CURRENT_YEAR}
              onChange={(e) => onTahunChange(Number(e.target.value))}
            >
              {TAHUN_LIST.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        )}

        {/* Kunci Global toggle */}
        <button
          onClick={handleToggleLock}
          disabled={lockLoading}
          title={lock.isLocked ? `Dikunci oleh ${lock.lockedBy} — klik untuk buka` : 'Data terbuka — klik untuk kunci'}
          className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg transition-colors disabled:opacity-50"
          style={{
            background: lock.isLocked ? 'var(--color-danger-light)' : 'var(--color-success-light)',
            color: lock.isLocked ? 'var(--color-danger)' : 'var(--color-success)',
          }}
        >
          {lock.isLocked
            ? <Lock size={15} />
            : <Unlock size={15} />
          }
          <span className="text-xs font-semibold hidden sm:block">
            {lock.isLocked ? 'Terkunci' : 'Terbuka'}
          </span>
        </button>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg transition-colors hover:bg-[var(--color-primary-light)]"
          aria-label="Toggle tema"
        >
          {theme === 'dark'
            ? <Sun size={18} style={{ color: 'var(--color-gold)' }} />
            : <Moon size={18} style={{ color: 'var(--color-text-secondary)' }} />
          }
        </button>

        {/* User chip */}
        <div
          className="flex items-center gap-1.5 px-2 py-1 rounded-lg"
          style={{ background: 'var(--color-primary-light)' }}
        >
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
            style={{ background: 'var(--color-primary)' }}
          >
            {userName.charAt(0).toUpperCase()}
          </div>
          <span className="text-xs font-medium hidden sm:block" style={{ color: 'var(--color-primary)' }}>
            {userName}
          </span>
          <ChevronDown size={12} style={{ color: 'var(--color-primary)', opacity: 0.6 }} />
        </div>
      </div>
    </header>
  );
}
