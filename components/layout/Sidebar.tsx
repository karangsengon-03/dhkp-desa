'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, ClipboardList, CheckSquare, History,
  FileSpreadsheet, Settings, X, Lock, Unlock, LogOut,
} from 'lucide-react';
import { useGlobalLock } from '@/hooks/useGlobalLock';
import { logout } from '@/lib/auth';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  userName: string;
}

const navItems = [
  { href: '/dashboard',     label: 'Beranda',          icon: LayoutDashboard },
  { href: '/data',          label: 'Data DHKP',          icon: ClipboardList   },
  { href: '/rekap',         label: 'Rekap Lunas',        icon: CheckSquare     },
  { href: '/riwayat',       label: 'Riwayat Perubahan',  icon: History         },
  { href: '/export-import', label: 'Export / Import',    icon: FileSpreadsheet },
  { href: '/pengaturan',    label: 'Pengaturan',         icon: Settings        },
];

export function Sidebar({ open, onClose, userName }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const lock = useGlobalLock();

  async function handleLogout() {
    await logout();
    router.replace('/login');
  }

  return (
    <>
      {/* Overlay backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 30,
          background: 'rgba(0,0,0,0.45)',
          backdropFilter: 'blur(2px)',
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
          transition: 'opacity 200ms ease',
        }}
      />

      {/* Sidebar panel */}
      <aside
        className="fixed top-0 left-0 z-40 h-full flex flex-col"
        style={{
          width: 'var(--sidebar-w)',
          background: 'var(--c-navy)',
          boxShadow: 'var(--sh-lg)',
          transform: open ? 'translateX(0)' : 'translateX(-100%)',
          transition: open
            ? 'transform 200ms ease-out'
            : 'transform 180ms ease-in',
        }}
      >
        {/* Header sidebar */}
        <div
          className="flex items-center justify-between flex-shrink-0"
          style={{
            padding: 'var(--s4)',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <div>
            <div style={{ fontSize: 'var(--t-lg)', fontWeight: 700, color: '#ffffff', lineHeight: 1.2 }}>
              DHKP
            </div>
            <div style={{ fontSize: 'var(--t-sm)', fontWeight: 400, color: 'rgba(255,255,255,0.65)', lineHeight: 1.4 }}>
              Desa Karang Sengon
            </div>
          </div>
          {/* Tombol X — 44×44px */}
          <button
            onClick={onClose}
            aria-label="Tutup sidebar"
            className="flex items-center justify-center rounded-md transition-colors"
            style={{ width: 'var(--touch)', height: 'var(--touch)', color: 'var(--c-inv)' }}
            onMouseOver={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
            onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav
          className="flex-1 overflow-y-auto flex flex-col"
          style={{ padding: 'var(--s3)', gap: 'var(--s1)' }}
        >
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + '/');
            return (
              <Link
                key={href}
                href={href}
                className={`nav-item ${active ? 'active' : ''}`}
                onClick={onClose}
              >
                <Icon size={18} />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Divider + lock status */}
        <div
          className="flex items-center flex-shrink-0"
          style={{
            borderTop: '1px solid rgba(255,255,255,0.1)',
            padding: 'var(--s3) var(--s4)',
            gap: 'var(--s2)',
          }}
        >
          {lock.isLocked ? (
            <>
              <Lock size={13} style={{ color: 'var(--c-err-soft)', flexShrink: 0 }} />
              <span
                className="truncate"
                style={{ fontSize: 'var(--t-xs)', color: 'var(--c-err-soft)' }}
              >
                Terkunci oleh {lock.lockedBy}
              </span>
            </>
          ) : (
            <>
              <Unlock size={13} style={{ color: 'var(--c-ok-soft)', flexShrink: 0 }} />
              <span style={{ fontSize: 'var(--t-xs)', color: 'var(--c-ok-soft)' }}>
                Data terbuka
              </span>
            </>
          )}
        </div>

        {/* Footer — nama user + logout */}
        <div
          className="flex-shrink-0"
          style={{ padding: '0 var(--s3) var(--s4)' }}
        >
          <div
            className="truncate"
            style={{
              fontSize: 'var(--t-xs)',
              fontWeight: 500,
              color: 'rgba(255,255,255,0.5)',
              padding: '0 var(--s4)',
              marginBottom: 'var(--s1)',
            }}
          >
            {userName}
          </div>
          <button
            onClick={handleLogout}
            className="nav-item w-full"
            style={{ color: 'var(--c-err-soft)' }}
          >
            <LogOut size={18} />
            <span>Keluar</span>
          </button>
        </div>
      </aside>
    </>
  );
}
