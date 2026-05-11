'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
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

/* Semua warna sidebar hardcode — intentional, tidak ikut tema, selalu navy gelap.
   Nilai-nilai ini adalah mirror dari CSS tokens untuk konteks dark-nav:
   bg = --c-navy, text = --c-inv, gold = --c-gold, danger = light red di atas navy */
const S = {
  bg:       '#1E3A5F', /* mirror: --c-navy */
  border:   'rgba(255,255,255,0.10)',
  text:     '#ffffff', /* mirror: --c-inv */
  textSub:  'rgba(255,255,255,0.60)',
  textFaint:'rgba(255,255,255,0.40)',
  hover:    'rgba(255,255,255,0.09)',
  active:   'rgba(255,255,255,0.16)',
  gold:     '#C9A227', /* mirror: --c-gold */
  danger:   '#FCA5A5', /* light red — kontras di atas navy */
  logout:   'rgba(255,190,190,0.85)',
};

export function Sidebar({ open, onClose, userName }: SidebarProps) {
  const pathname = usePathname();
  const router   = useRouter();
  const lock     = useGlobalLock();
  const { user } = useAuth();

  async function handleLogout() {
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

        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 16px 16px 20px',
          borderBottom: `1px solid ${S.border}`,
          flexShrink: 0,
        }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, color: S.text, lineHeight: 1.2 }}>DHKP</div>
            <div style={{ fontSize: 'var(--t-xs)', color: S.textSub, marginTop: 2 }}>Desa Karang Sengon</div>
          </div>
          <button
            onClick={onClose}
            aria-label="Tutup menu"
            style={{
              width: 40, height: 40, borderRadius: 8,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(255,255,255,0.08)',
              border: `1px solid ${S.border}`,
              color: S.text, cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, overflowY: 'auto', padding: '12px 12px' }}>
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
          padding: '12px 20px',
          borderTop: `1px solid ${S.border}`,
          flexShrink: 0,
        }}>
          {lock.isLocked
            ? <><Lock size={13} color={S.danger} /><span style={{ fontSize: 13, color: S.danger }}>Terkunci · {lock.lockedBy}</span></>
            : <><Unlock size={13} color={S.textSub} /><span style={{ fontSize: 13, color: S.textSub }}>Data terbuka</span></>
          }
        </div>

        {/* Footer */}
        <div style={{ padding: '0 12px 20px', flexShrink: 0 }}>
          <div style={{ padding: '0 16px', marginBottom: 6 }}>
            <div style={{ fontSize: 'var(--t-xs)', color: S.textSub, fontWeight: 600, lineHeight: 1.3 }}>
              {userName}
            </div>
            {user?.email && (
              <div style={{ fontSize: 'var(--t-xs)', color: S.textFaint, marginTop: 2, lineHeight: 1.3, wordBreak: 'break-all' }}>
                {user.email}
              </div>
            )}
          </div>
          <button
            onClick={handleLogout}
            style={{
              display: 'flex', alignItems: 'center', gap: 14,
              width: '100%', height: 48, padding: '0 16px',
              borderRadius: 8, border: 'none',
              background: 'transparent', cursor: 'pointer',
              fontSize: 15, fontWeight: 500, color: S.logout,
              textAlign: 'left',
            }}
          >
            <LogOut size={18} />
            <span>Keluar</span>
          </button>
        </div>
      </aside>
    </>
  );
}
