'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import {
  LayoutDashboard, ClipboardList, CheckSquare, History,
  FileSpreadsheet, Settings, X, Lock, Unlock, LogOut,
} from 'lucide-react';
import { useGlobalLock } from '@/hooks/useGlobalLock';
import { logout } from '@/lib/auth';
import { ROUTES } from '@/lib/routes';
import { useAuth } from '@/hooks/useAuth';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  onOpen: () => void;
  userName: string;
}

const NAV = [
  { href: ROUTES.dashboard,    label: 'Beranda',           icon: LayoutDashboard },
  { href: ROUTES.data,         label: 'Data DHKP',          icon: ClipboardList   },
  { href: ROUTES.rekap,        label: 'Rekap Lunas',        icon: CheckSquare     },
  { href: ROUTES.riwayat,      label: 'Riwayat Perubahan',  icon: History         },
  { href: ROUTES.exportImport, label: 'Ekspor / Impor',     icon: FileSpreadsheet },
  { href: ROUTES.pengaturan,   label: 'Pengaturan',         icon: Settings        },
];

const S = {
  bg:        '#1E3A5F',
  border:    'rgba(255,255,255,0.10)',
  text:      '#ffffff',
  textSub:   'rgba(255,255,255,0.60)',
  textFaint: 'rgba(255,255,255,0.40)',
  active:    'rgba(255,255,255,0.16)',
  gold:      '#C9A227',
  danger:    '#FCA5A5',
  logout:    'rgba(255,190,190,0.85)',
};

export function Sidebar({ open, onClose, onOpen, userName }: SidebarProps) {
  const pathname = usePathname();
  const router   = useRouter();
  const lock     = useGlobalLock();
  const { user } = useAuth();

  // Dengarkan event dari avatar header untuk buka sidebar
  useEffect(() => {
    function handleOpenSidebar() { onOpen(); }
    window.addEventListener('dhkp:open-sidebar', handleOpenSidebar);
    return () => window.removeEventListener('dhkp:open-sidebar', handleOpenSidebar);
  }, [onOpen]);

  async function handleLogout() {
    onClose();
    await logout();
    router.replace(ROUTES.login);
  }

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 30,
          background: 'rgba(0,0,0,0.50)',
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
          transition: 'opacity 200ms ease',
        }}
      />

      {/* Panel */}
      <aside style={{
        position: 'fixed', top: 0, left: 0, zIndex: 40,
        height: '100%', width: 280,
        display: 'flex', flexDirection: 'column',
        background: S.bg,
        boxShadow: '4px 0 24px rgba(0,0,0,0.40)',
        transform: open ? 'translateX(0)' : 'translateX(-100%)',
        transition: open ? 'transform 200ms ease-out' : 'transform 180ms ease-in',
      }}>

        {/* Header sidebar */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 16px 16px 20px',
          borderBottom: `1px solid ${S.border}`,
          flexShrink: 0,
        }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, color: S.text, lineHeight: 1.2 }}>DHKP</div>
            <div style={{ fontSize: 12, color: S.textSub, marginTop: 2 }}>Desa Karang Sengon</div>
          </div>
          <button
            onClick={onClose}
            aria-label="Tutup menu"
            style={{
              width: 40, height: 40, borderRadius: 8,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(255,255,255,0.08)',
              border: `1px solid ${S.border}`,
              color: S.text, cursor: 'pointer', flexShrink: 0,
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Info user di atas nav — jelas siapa yang login */}
        <div style={{
          padding: '12px 20px 10px',
          borderBottom: `1px solid ${S.border}`,
          flexShrink: 0,
        }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: S.text, lineHeight: 1.3 }}>
            {userName}
          </div>
          {user?.email && (
            <div style={{ fontSize: 11, color: S.textFaint, marginTop: 2, wordBreak: 'break-all' }}>
              {user.email}
            </div>
          )}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, overflowY: 'auto', padding: '10px 12px' }}>
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + '/');
            return (
              <Link key={href} href={href} onClick={onClose} style={{
                display: 'flex', alignItems: 'center', gap: 14,
                height: 52, padding: '0 16px',
                borderRadius: 8, marginBottom: 2,
                textDecoration: 'none',
                fontSize: 15, fontWeight: active ? 700 : 500,
                color: active ? S.text : S.textSub,
                background: active ? S.active : 'transparent',
                borderLeft: `3px solid ${active ? S.gold : 'transparent'}`,
                transition: 'all 120ms ease',
              }}>
                <Icon size={18} color={active ? S.gold : 'currentColor'} />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Lock status */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '10px 20px',
          borderTop: `1px solid ${S.border}`,
          flexShrink: 0,
        }}>
          {lock.isLocked
            ? <><Lock size={13} color={S.danger} /><span style={{ fontSize: 12, color: S.danger }}>Terkunci · {lock.lockedBy}</span></>
            : <><Unlock size={13} color={S.textSub} /><span style={{ fontSize: 12, color: S.textSub }}>Data terbuka</span></>
          }
        </div>

        {/* Tombol Keluar */}
        <div style={{ padding: '8px 12px 20px', flexShrink: 0, borderTop: `1px solid ${S.border}` }}>
          <button
            onClick={handleLogout}
            style={{
              display: 'flex', alignItems: 'center', gap: 14,
              width: '100%', height: 52, padding: '0 16px',
              borderRadius: 8, border: 'none',
              background: 'rgba(255,80,80,0.10)', cursor: 'pointer',
              fontSize: 15, fontWeight: 600, color: S.logout,
              textAlign: 'left',
            }}
          >
            <LogOut size={18} />
            <div>
              <div>Keluar</div>
              <div style={{ fontSize: 11, color: S.textFaint, fontWeight: 400, marginTop: 1 }}>
                Sesi akan diakhiri
              </div>
            </div>
          </button>
        </div>
      </aside>
    </>
  );
}
