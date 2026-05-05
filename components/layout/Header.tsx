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
    <header className="no-print" style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 20,
      height: 'var(--header-h)',
      background: '#1E3A5F',  /* hardcode — selalu navy gelap di light & dark */
      borderBottom: '1px solid rgba(255,255,255,0.08)',
      boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
    }}>
      <style>{`
        .hdr-btn {
          display: flex; align-items: center; justify-content: center;
          background: transparent; border: none; cursor: pointer;
          border-radius: 8px; color: #ffffff;
          transition: background 150ms ease;
          flex-shrink: 0;
        }
        .hdr-btn:hover { background: rgba(255,255,255,0.12) !important; }
        .hdr-btn:active { background: rgba(255,255,255,0.20) !important; }
      `}</style>

      <div style={{
        display: 'flex', alignItems: 'center', height: '100%',
        padding: '0 16px', gap: '12px',
      }}>

        {/* Hamburger */}
        <button
          className="hdr-btn"
          onClick={onMenuClick}
          aria-label="Buka menu navigasi"
          style={{ width: 48, height: 48 }}
        >
          <Menu size={22} />
        </button>

        {/* Brand */}
        <div style={{ flex: 1, minWidth: 0, lineHeight: 1 }}>
          <div style={{ fontSize: 19, fontWeight: 700, color: '#ffffff', whiteSpace: 'nowrap' }}>
            DHKP
          </div>
          <div style={{ fontSize: 12, fontWeight: 400, color: 'rgba(255,255,255,0.60)', whiteSpace: 'nowrap', marginTop: 2 }}>
            Desa Karang Sengon
          </div>
        </div>

        {/* Controls kanan */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>

          {/* Status kunci */}
          <button
            className="hdr-btn"
            onClick={handleToggleLock}
            disabled={lockLoading}
            title={lock.isLocked ? `Dikunci oleh ${lock.lockedBy}` : 'Data terbuka — klik untuk kunci'}
            style={{
              gap: 6, padding: '0 10px', height: 36,
              fontSize: 12, fontWeight: 600,
              background: lock.isLocked
                ? 'rgba(239,68,68,0.25)'
                : 'rgba(34,197,94,0.20)',
              color: lock.isLocked ? '#FCA5A5' : '#86EFAC',
              border: `1px solid ${lock.isLocked ? 'rgba(239,68,68,0.40)' : 'rgba(34,197,94,0.35)'}`,
              borderRadius: 8, whiteSpace: 'nowrap',
              opacity: lockLoading ? 0.5 : 1,
              cursor: lockLoading ? 'not-allowed' : 'pointer',
              width: 'auto',
            }}
          >
            {lock.isLocked ? <Lock size={13} /> : <Unlock size={13} />}
            <span style={{ marginLeft: 4 }}>{lock.isLocked ? 'Terkunci' : 'Terbuka'}</span>
          </button>

          {/* Dark/Light toggle */}
          <button
            className="hdr-btn"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Ganti ke mode terang' : 'Ganti ke mode gelap'}
            style={{ width: 48, height: 48 }}
          >
            {theme === 'dark'
              ? <Sun size={20} color="#FFD54F" />
              : <Moon size={20} color="rgba(255,255,255,0.80)" />
            }
          </button>

          {/* Avatar */}
          <div
            title={userName}
            style={{
              width: 36, height: 36, borderRadius: '50%',
              background: '#C9A227', color: '#1A1000',
              fontSize: 14, fontWeight: 800,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, userSelect: 'none',
            }}
          >
            {initial}
          </div>
        </div>
      </div>
    </header>
  );
}
