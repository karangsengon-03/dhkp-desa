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
  { href: '/dashboard',     label: 'Dashboard',          icon: LayoutDashboard },
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
          width: 'var(--sidebar-width)',
          background: 'var(--c-navy)',
          boxShadow: 'var(--shadow-lg)',
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
            padding: 'var(--sp-4)',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <div>
            <div style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: '#ffffff', lineHeight: 1.2 }}>
              DHKP
            </div>
            <div style={{ fontSize: 'var(--text-xs)', fontWeight: 400, color: 'rgba(255,255,255,0.6)', lineHeight: 1.4 }}>
              Desa
            </div>
          </div>
          {/* Tombol X — 44×44px */}
          <button
            onClick={onClose}
            aria-label="Tutup sidebar"
            className="flex items-center justify-center rounded-md transition-colors"
            style={{ width: 'var(--touch-min)', height: 'var(--touch-min)', color: 'var(--c-text-inv)' }}
            onMouseOver={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
            onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav
          className="flex-1 overflow-y-auto flex flex-col"
          style={{ padding: 'var(--sp-3)', gap: 'var(--sp-1)' }}
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
            padding: 'var(--sp-3) var(--sp-4)',
            gap: 'var(--sp-2)',
          }}
        >
          {lock.isLocked ? (
            <>
              <Lock size={13} style={{ color: 'var(--c-danger-light)', flexShrink: 0 }} />
              <span
                className="truncate"
                style={{ fontSize: 'var(--text-xs)', color: 'var(--c-danger-light)' }}
              >
                Terkunci oleh {lock.lockedBy}
              </span>
            </>
          ) : (
            <>
              <Unlock size={13} style={{ color: 'var(--c-success-light)', flexShrink: 0 }} />
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--c-success-light)' }}>
                Data terbuka
              </span>
            </>
          )}
        </div>

        {/* Footer — nama user + logout */}
        <div
          className="flex-shrink-0"
          style={{ padding: '0 var(--sp-3) var(--sp-4)' }}
        >
          <div
            className="truncate"
            style={{
              fontSize: 'var(--text-xs)',
              fontWeight: 500,
              color: 'rgba(255,255,255,0.5)',
              padding: '0 var(--sp-4)',
              marginBottom: 'var(--sp-1)',
            }}
          >
            {userName}
          </div>
          <button
            onClick={handleLogout}
            className="nav-item w-full"
            style={{ color: 'var(--c-danger-light)' }}
          >
            <LogOut size={18} />
            <span>Keluar</span>
          </button>
        </div>
      </aside>
    </>
  );
}
