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
  { href: '/dashboard',     label: 'Dashboard',         icon: LayoutDashboard },
  { href: '/data',          label: 'Data DHKP',         icon: ClipboardList },
  { href: '/rekap',         label: 'Rekap Lunas',       icon: CheckSquare },
  { href: '/riwayat',       label: 'Riwayat Perubahan', icon: History },
  { href: '/export-import', label: 'Export / Import',   icon: FileSpreadsheet },
  { href: '/pengaturan',    label: 'Pengaturan',        icon: Settings },
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
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className="fixed top-0 left-0 z-40 h-full flex flex-col transition-transform duration-300"
        style={{
          width: 'var(--sidebar-width)',
          background: 'var(--color-surface)',
          borderRight: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-lg)',
          transform: open ? 'translateX(0)' : 'translateX(-100%)',
        }}
      >
        {/* Logo / Brand */}
        <div
          className="flex items-center justify-between px-4 py-4 border-b"
          style={{
            borderColor: 'var(--color-border)',
            background: 'var(--color-primary)',
          }}
        >
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icons/icon-96.png" alt="DHKP" className="w-9 h-9 rounded-lg" />
            <div>
              <div className="text-white font-bold text-sm leading-tight">DHKP Desa</div>
              <div className="text-xs leading-tight" style={{ color: 'var(--color-gold)' }}>
                Karang Sengon
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors lg:hidden"
          >
            <X size={18} />
          </button>
        </div>

        {/* User info */}
        <div
          className="px-4 py-3 border-b"
          style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface-2)' }}
        >
          <div className="text-xs font-medium" style={{ color: 'var(--color-text-disabled)' }}>
            Login sebagai
          </div>
          <div className="text-sm font-semibold mt-0.5 truncate" style={{ color: 'var(--color-text-primary)' }}>
            {userName || '—'}
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto p-3 flex flex-col gap-1">
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

        {/* Lock status */}
        <div
          className="px-4 py-2 border-t flex items-center gap-2"
          style={{ borderColor: 'var(--color-border)' }}
        >
          {lock.isLocked ? (
            <>
              <Lock size={13} style={{ color: 'var(--color-danger)', flexShrink: 0 }} />
              <span className="text-xs truncate" style={{ color: 'var(--color-danger)' }}>
                Terkunci oleh {lock.lockedBy}
              </span>
            </>
          ) : (
            <>
              <Unlock size={13} style={{ color: 'var(--color-success)', flexShrink: 0 }} />
              <span className="text-xs" style={{ color: 'var(--color-success)' }}>
                Data terbuka
              </span>
            </>
          )}
        </div>

        {/* Logout */}
        <div className="px-3 pb-4">
          <button
            onClick={handleLogout}
            className="nav-item w-full"
            style={{ color: 'var(--color-danger)' }}
          >
            <LogOut size={16} />
            <span>Keluar</span>
          </button>
        </div>
      </aside>
    </>
  );
}
