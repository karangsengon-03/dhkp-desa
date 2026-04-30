'use client';

import { useState, useEffect, useRef } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { LockBanner } from '@/components/dhkp/LockBanner';
import { useGlobalLock } from '@/hooks/useGlobalLock';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/Toast';
import { getAppInfo, updateAppInfo, setGlobalLock, getDHKP } from '@/lib/firestore';
import { AppInfo } from '@/types';
import * as XLSX from 'xlsx';
import {
  Settings, Lock, Unlock, User, Building2,
  Image as ImageIcon, Save, RefreshCw, ShieldAlert,
  KeyRound, Download, Info,
} from 'lucide-react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';

const APP_VERSION = 'v1.0.0';
const CURRENT_YEAR = new Date().getFullYear();
const BACKUP_YEARS = Array.from({ length: 5 }, (_, i) => CURRENT_YEAR - i);

export default function PengaturanPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const lock = useGlobalLock();

  const [appInfo, setAppInfoState] = useState<AppInfo>({
    kecamatan: '',
    desaKelurahan: '',
    tempatPembayaran: '',
    propinsi: '',
    kotaKab: '',
    logoKiri: '',
    logoKanan: '',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lockLoading, setLockLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [backupLoading, setBackupLoading] = useState(false);

  const logoKiriRef = useRef<HTMLInputElement>(null);
  const logoKananRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getAppInfo()
      .then((info) => { if (info) setAppInfoState(info); })
      .catch(() => showToast('Gagal memuat pengaturan', 'danger'))
      .finally(() => setLoading(false));
  }, []);

  function handleChange(field: keyof AppInfo, value: string) {
    setAppInfoState((prev) => ({ ...prev, [field]: value }));
  }

  function handleLogoUpload(field: 'logoKiri' | 'logoKanan', e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 500 * 1024) { showToast('Ukuran logo maksimal 500 KB', 'warning'); return; }
    const reader = new FileReader();
    reader.onload = (ev) => handleChange(field, ev.target?.result as string);
    reader.readAsDataURL(file);
    e.target.value = '';
  }

  async function handleSave() {
    setSaving(true);
    try {
      await updateAppInfo(appInfo);
      showToast('Pengaturan berhasil disimpan', 'success');
    } catch {
      showToast('Gagal menyimpan pengaturan', 'danger');
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleLock() {
    if (!user?.email) return;
    setLockLoading(true);
    try {
      const newState = !lock.isLocked;
      await setGlobalLock(newState, user.email);
      showToast(newState ? 'Data berhasil dikunci' : 'Kunci data berhasil dibuka', 'success');
    } catch {
      showToast('Gagal mengubah status kunci', 'danger');
    } finally {
      setLockLoading(false);
    }
  }

  async function handleResetPassword() {
    if (!user?.email) return;
    setResetLoading(true);
    try {
      await sendPasswordResetEmail(auth, user.email);
      showToast(`Link reset password dikirim ke ${user.email}`, 'success');
    } catch {
      showToast('Gagal mengirim email reset password', 'danger');
    } finally {
      setResetLoading(false);
    }
  }

  async function handleBackupAll() {
    setBackupLoading(true);
    try {
      const wb = XLSX.utils.book_new();
      let total = 0;
      for (const tahun of BACKUP_YEARS) {
        const records = await getDHKP(tahun);
        if (records.length === 0) continue;
        total += records.length;
        const header = [
          'Nomor', 'NOP', 'No. Induk', 'Nama Wajib Pajak',
          'Alamat Objek Pajak', 'Pajak Terhutang', 'Perubahan Pajak',
          'Lunas', 'Tanggal Bayar', 'Luas Tanah (m²)', 'Luas Bangunan (m²)', 'Dikelola Oleh',
        ];
        const rows = records.map((r) => [
          r.nomor, r.nop, r.nomorInduk, r.namaWajibPajak,
          r.alamatObjekPajak, r.pajakTerhutang, r.perubahanPajak,
          r.statusLunas ? 'Ya' : 'Tidak', r.tanggalBayar || '',
          r.luasTanah || 0, r.luasBangunan || 0, r.dikelolaOleh || '',
        ]);
        const ws = XLSX.utils.aoa_to_sheet([header, ...rows]);
        XLSX.utils.book_append_sheet(wb, ws, `DHKP ${tahun}`);
      }
      if (total === 0) {
        showToast('Tidak ada data untuk di-backup', 'warning');
        return;
      }
      const fname = `BACKUP_DHKP_${new Date().toISOString().slice(0, 10)}.xlsx`;
      XLSX.writeFile(wb, fname);
      showToast(`Backup berhasil — ${total} record dari ${BACKUP_YEARS.length} tahun`, 'success');
    } catch {
      showToast('Gagal membuat backup', 'danger');
    } finally {
      setBackupLoading(false);
    }
  }

  if (loading) {
    return (
      <AppShell pageTitle="Pengaturan">
        <div className="flex justify-center items-center min-h-[200px] gap-3">
          <RefreshCw size={20} style={{ color: 'var(--color-primary)', animation: 'spin 1s linear infinite' }} />
          <span style={{ color: 'var(--color-text-secondary)' }}>Memuat pengaturan...</span>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell pageTitle="Pengaturan">
      <LockBanner lock={lock} />
      <div className="flex flex-col gap-5">

        {/* ── Akun & Keamanan ── */}
        <Card className="p-6">
          <SectionHeader icon={<User size={20} color="#fff" />} color="var(--color-primary)" title="Akun & Keamanan" sub="Informasi akun yang sedang login" />

          <div className="flex items-center gap-4 p-4 rounded-xl mb-4" style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-base flex-shrink-0" style={{ background: 'var(--color-primary)' }}>
              {(user?.displayName || user?.email || 'U').charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-sm" style={{ color: 'var(--color-text-primary)' }}>
                {user?.displayName || user?.email || 'Pengguna'}
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>{user?.email || '-'}</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 rounded-xl mb-4" style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
            <KeyRound size={18} style={{ color: 'var(--color-text-secondary)', marginTop: 2, flexShrink: 0 }} />
            <div className="flex-1">
              <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>Ganti Password</p>
              <p className="text-xs mt-0.5 mb-3" style={{ color: 'var(--color-text-secondary)' }}>
                Link reset password akan dikirim ke email <strong>{user?.email}</strong>. Cek kotak masuk atau folder spam.
              </p>
              <Button variant="secondary" size="sm" onClick={handleResetPassword} disabled={resetLoading}>
                <KeyRound size={14} />
                {resetLoading ? 'Mengirim...' : 'Kirim Link Reset Password'}
              </Button>
            </div>
          </div>
        </Card>

        {/* ── Informasi Desa ── */}
        <Card className="p-6">
          <SectionHeader icon={<Building2 size={20} color="#fff" />} color="var(--color-gold)" title="Informasi Desa" sub="Data yang tampil di header surat dan cetak" />

          <div className="grid gap-4 mb-5" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}>
            {([
              ['propinsi', 'Propinsi', 'Contoh: Jawa Timur'],
              ['kotaKab', 'Kota / Kabupaten', 'Contoh: Kabupaten Bondowoso'],
              ['kecamatan', 'Kecamatan', 'Contoh: Klabang'],
              ['desaKelurahan', 'Desa / Kelurahan', 'Contoh: Karang Sengon'],
              ['tempatPembayaran', 'Tempat Pembayaran', 'Contoh: Bank Jatim'],
            ] as [keyof AppInfo, string, string][]).map(([field, label, placeholder]) => (
              <Input
                key={field}
                label={label}
                value={appInfo[field] as string}
                onChange={(e) => handleChange(field, e.target.value)}
                placeholder={placeholder}
              />
            ))}
          </div>

          {/* Logo */}
          <div className="mb-5">
            <div className="flex items-center gap-2 mb-2">
              <ImageIcon size={14} style={{ color: 'var(--color-text-secondary)' }} />
              <span className="text-xs font-semibold" style={{ color: 'var(--color-text-secondary)' }}>Logo Header</span>
              <span className="text-xs" style={{ color: 'var(--color-text-disabled)' }}>PNG/SVG · maks 500 KB · 200×200px</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {(['logoKiri', 'logoKanan'] as const).map((field) => (
                <div key={field}>
                  <p className="text-xs font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                    Logo {field === 'logoKiri' ? 'Kiri' : 'Kanan'}
                  </p>
                  <div
                    onClick={() => (field === 'logoKiri' ? logoKiriRef : logoKananRef).current?.click()}
                    className="rounded-xl flex flex-col items-center justify-center cursor-pointer transition-colors"
                    style={{ border: '2px dashed var(--color-border)', minHeight: 96, padding: '1rem', gap: '0.5rem' }}
                  >
                    {appInfo[field] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={appInfo[field] as string} alt={field} style={{ maxHeight: 72, maxWidth: '100%', objectFit: 'contain' }} />
                    ) : (
                      <>
                        <ImageIcon size={28} style={{ color: 'var(--color-text-disabled)' }} />
                        <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Klik untuk upload</span>
                      </>
                    )}
                  </div>
                  <input
                    ref={field === 'logoKiri' ? logoKiriRef : logoKananRef}
                    type="file" accept="image/*" className="hidden"
                    onChange={(e) => handleLogoUpload(field, e)}
                  />
                  {appInfo[field] && (
                    <button
                      onClick={() => handleChange(field, '')}
                      className="mt-1 text-xs"
                      style={{ color: 'var(--color-danger)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                    >
                      Hapus logo
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <Button variant="primary" onClick={handleSave} disabled={saving}>
              <Save size={15} />
              {saving ? 'Menyimpan...' : 'Simpan Pengaturan'}
            </Button>
          </div>
        </Card>

        {/* ── Kunci Data Global ── */}
        <Card className="p-6">
          <SectionHeader
            icon={lock.isLocked ? <Lock size={20} color="#fff" /> : <Unlock size={20} color="#fff" />}
            color={lock.isLocked ? 'var(--color-danger)' : 'var(--color-success)'}
            title="Kunci Data Global"
            sub="Mencegah semua pengguna mengubah data ketika aktif"
          />

          <div
            className="flex items-center gap-3 p-4 rounded-xl mb-4"
            style={{
              border: `1px solid ${lock.isLocked ? 'var(--color-danger)' : 'var(--color-border)'}`,
              background: lock.isLocked ? 'rgba(198,40,40,0.05)' : 'var(--color-bg)',
            }}
          >
            {lock.isLocked
              ? <ShieldAlert size={20} style={{ color: 'var(--color-danger)', flexShrink: 0 }} />
              : <Unlock size={20} style={{ color: 'var(--color-success)', flexShrink: 0 }} />
            }
            <div>
              <p className="text-sm font-semibold" style={{ color: lock.isLocked ? 'var(--color-danger)' : 'var(--color-success)' }}>
                {lock.isLocked ? 'Data Sedang Dikunci' : 'Data Tidak Dikunci'}
              </p>
              {lock.isLocked && (
                <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
                  Dikunci oleh: <strong>{lock.lockedBy}</strong>
                  {lock.lockedAt && (
                    <> · {new Date(lock.lockedAt.seconds * 1000).toLocaleString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</>
                  )}
                </p>
              )}
            </div>
          </div>

          <Button variant={lock.isLocked ? 'danger' : 'primary'} onClick={handleToggleLock} disabled={lockLoading}>
            {lock.isLocked ? <Unlock size={15} /> : <Lock size={15} />}
            {lockLoading ? 'Memproses...' : lock.isLocked ? 'Buka Kunci Data' : 'Kunci Semua Data'}
          </Button>
        </Card>

        {/* ── Backup Data ── */}
        <Card className="p-6">
          <SectionHeader icon={<Download size={20} color="#fff" />} color="var(--color-primary)" title="Backup Data" sub="Unduh semua data DHKP ke file Excel (.xlsx)" />

          <div className="p-4 rounded-xl mb-4" style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
            <p className="text-sm font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>Backup Semua Tahun</p>
            <p className="text-xs mb-3" style={{ color: 'var(--color-text-secondary)' }}>
              Mengunduh data {BACKUP_YEARS.join(', ')} sekaligus dalam satu file Excel. Setiap tahun menjadi satu sheet tersendiri.
            </p>
            <Button variant="secondary" size="sm" onClick={handleBackupAll} disabled={backupLoading}>
              <Download size={14} />
              {backupLoading ? 'Memproses...' : 'Download Backup Semua Tahun'}
            </Button>
          </div>
        </Card>

        {/* ── Info Versi ── */}
        <Card className="p-6">
          <SectionHeader icon={<Info size={20} color="#fff" />} color="var(--color-text-secondary)" title="Informasi Aplikasi" sub="Versi dan detail teknis" />

          <div className="grid grid-cols-2 gap-3 text-sm">
            {[
              ['Nama Aplikasi', 'DHKP Desa Karang Sengon'],
              ['Versi', APP_VERSION],
              ['Platform', 'Next.js + Firebase'],
              ['Desa', 'Karang Sengon, Klabang, Bondowoso'],
            ].map(([k, v]) => (
              <div key={k} className="flex flex-col gap-0.5">
                <span className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>{k}</span>
                <span className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>{v}</span>
              </div>
            ))}
          </div>
        </Card>

      </div>
    </AppShell>
  );
}

function SectionHeader({ icon, color, title, sub }: { icon: React.ReactNode; color: string; title: string; sub: string }) {
  return (
    <div className="section-header">
      <div className="section-icon" style={{ background: color }}>{icon}</div>
      <div>
        <h2 className="font-bold text-sm" style={{ color: 'var(--color-text-primary)' }}>{title}</h2>
        <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>{sub}</p>
      </div>
    </div>
  );
}
