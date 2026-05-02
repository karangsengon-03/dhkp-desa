'use client';

import { useState, useEffect, useRef } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { Input } from '@/components/ui/Input';
import { LockBanner } from '@/components/dhkp/LockBanner';
import { useGlobalLock } from '@/hooks/useGlobalLock';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/Toast';
import { getAppInfo, updateAppInfo, setGlobalLock, getDHKP } from '@/lib/firestore';
import { AppInfo } from '@/types';
import * as XLSX from 'xlsx';
import {
  Lock, Unlock, User, Building2, Image as ImageIcon,
  Save, RefreshCw, ShieldAlert, KeyRound, Download, Info,
} from 'lucide-react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';

const APP_VERSION = 'v1.0.0';
const CURRENT_YEAR = new Date().getFullYear();
const BACKUP_YEARS = Array.from({ length: 5 }, (_, i) => CURRENT_YEAR - i);

function SectionHeader({ icon, iconBg, title, sub }: {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  sub: string;
}) {
  return (
    <div className="section-header">
      <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {icon}
      </div>
      <div>
        <div style={{ fontWeight: 700, fontSize: 'var(--text-base)', color: 'var(--c-text-1)' }}>{title}</div>
        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--c-text-3)', marginTop: 2 }}>{sub}</div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <span style={{ fontSize: 'var(--text-xs)', fontWeight: 500, color: 'var(--c-text-3)' }}>{label}</span>
      <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--c-text-1)' }}>{value}</span>
    </div>
  );
}

export default function PengaturanPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const lock = useGlobalLock();

  const [appInfo, setAppInfoState] = useState<AppInfo>({
    kecamatan: '', desaKelurahan: '', tempatPembayaran: '',
    propinsi: '', kotaKab: '', logoKiri: '', logoKanan: '',
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
    } catch { showToast('Gagal menyimpan pengaturan', 'danger'); }
    finally { setSaving(false); }
  }

  async function handleToggleLock() {
    if (!user?.email) return;
    setLockLoading(true);
    try {
      const newState = !lock.isLocked;
      await setGlobalLock(newState, user.email);
      showToast(newState ? 'Data berhasil dikunci' : 'Kunci data berhasil dibuka', 'success');
    } catch { showToast('Gagal mengubah status kunci', 'danger'); }
    finally { setLockLoading(false); }
  }

  async function handleResetPassword() {
    if (!user?.email) return;
    setResetLoading(true);
    try {
      await sendPasswordResetEmail(auth, user.email);
      showToast(`Link reset dikirim ke ${user.email}`, 'success');
    } catch { showToast('Gagal mengirim email reset', 'danger'); }
    finally { setResetLoading(false); }
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
        const header = ['Nomor', 'NOP', 'No. Induk', 'Nama Wajib Pajak', 'Alamat Objek Pajak', 'Pajak Terhutang', 'Perubahan Pajak', 'Lunas', 'Tanggal Bayar', 'Luas Tanah (m²)', 'Luas Bangunan (m²)', 'Dikelola Oleh'];
        const rows = records.map((r) => [r.nomor, r.nop, r.nomorInduk, r.namaWajibPajak, r.alamatObjekPajak, r.pajakTerhutang, r.perubahanPajak, r.statusLunas ? 'Ya' : 'Tidak', r.tanggalBayar || '', r.luasTanah || 0, r.luasBangunan || 0, r.dikelolaOleh || '']);
        const ws = XLSX.utils.aoa_to_sheet([header, ...rows]);
        XLSX.utils.book_append_sheet(wb, ws, `DHKP ${tahun}`);
      }
      if (total === 0) { showToast('Tidak ada data untuk di-backup', 'warning'); return; }
      XLSX.writeFile(wb, `BACKUP_DHKP_${new Date().toISOString().slice(0, 10)}.xlsx`);
      showToast(`Backup berhasil — ${total} record`, 'success');
    } catch { showToast('Gagal membuat backup', 'danger'); }
    finally { setBackupLoading(false); }
  }

  if (loading) {
    return (
      <AppShell pageTitle="Pengaturan">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 'var(--sp-12) 0', gap: 'var(--sp-3)' }}>
          <RefreshCw size={20} className="animate-spin" style={{ color: 'var(--c-navy)' }} />
          <span style={{ color: 'var(--c-text-3)', fontSize: 'var(--text-sm)' }}>Memuat pengaturan...</span>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell pageTitle="Pengaturan">
      <LockBanner lock={lock} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>

        {/* ── Akun & Keamanan ── */}
        <div className="card" style={{ padding: 'var(--sp-5)' }}>
          <SectionHeader icon={<User size={18} style={{ color: "var(--c-text-inv)" }} />} iconBg="var(--c-navy)" title="Akun & Keamanan" sub="Informasi akun yang sedang login" />

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-4)', padding: 'var(--sp-4)', borderRadius: 'var(--radius-md)', background: 'var(--c-bg)', border: '1px solid var(--c-border)', marginBottom: 'var(--sp-3)' }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--c-navy)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--c-text-inv)', fontWeight: 700, fontSize: 'var(--text-base)', flexShrink: 0 }}>
              {(user?.displayName || user?.email || 'U').charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--c-text-1)' }}>
                {user?.displayName || user?.email || 'Pengguna'}
              </div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--c-text-3)', marginTop: 2 }}>{user?.email || '—'}</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--sp-3)', padding: 'var(--sp-4)', borderRadius: 'var(--radius-md)', background: 'var(--c-bg)', border: '1px solid var(--c-border)' }}>
            <KeyRound size={16} style={{ color: 'var(--c-text-3)', marginTop: 2, flexShrink: 0 }} />
            <div>
              <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--c-text-1)' }}>Ganti Password</div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--c-text-3)', margin: '4px 0 12px' }}>
                Link reset password akan dikirim ke <strong>{user?.email}</strong>.
              </div>
              <button
                className="btn btn-secondary btn-sm"
                onClick={handleResetPassword}
                disabled={resetLoading}
                style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 'var(--text-xs)' }}
              >
                <KeyRound size={13} />
                {resetLoading ? 'Mengirim...' : 'Kirim Link Reset Password'}
              </button>
            </div>
          </div>
        </div>

        {/* ── Informasi Desa ── */}
        <div className="card" style={{ padding: 'var(--sp-5)' }}>
          <SectionHeader icon={<Building2 size={18} style={{ color: "var(--c-text-inv)" }} />} iconBg="var(--c-gold)" title="Informasi Desa" sub="Data yang tampil di header cetak dan rekap" />

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 'var(--sp-4)', marginBottom: 'var(--sp-5)' }}>
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

          {/* Logo Upload */}
          <div style={{ marginBottom: 'var(--sp-5)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', marginBottom: 'var(--sp-2)' }}>
              <ImageIcon size={13} style={{ color: 'var(--c-text-3)' }} />
              <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--c-text-3)' }}>Logo Header</span>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--c-text-4)' }}>PNG/SVG · maks 500 KB</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-4)' }}>
              {(['logoKiri', 'logoKanan'] as const).map((field) => (
                <div key={field}>
                  <div style={{ fontSize: 'var(--text-xs)', fontWeight: 500, color: 'var(--c-text-3)', marginBottom: 6 }}>
                    Logo {field === 'logoKiri' ? 'Kiri' : 'Kanan'}
                  </div>
                  <div
                    onClick={() => (field === 'logoKiri' ? logoKiriRef : logoKananRef).current?.click()}
                    style={{ border: '2px dashed var(--c-border)', borderRadius: 'var(--radius-md)', minHeight: 90, padding: 'var(--sp-4)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', gap: 6, transition: 'border-color 150ms' }}
                  >
                    {appInfo[field] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={appInfo[field] as string} alt={field} style={{ maxHeight: 68, maxWidth: '100%', objectFit: 'contain' }} />
                    ) : (
                      <>
                        <ImageIcon size={26} style={{ color: 'var(--c-text-4)' }} />
                        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--c-text-3)' }}>Klik untuk upload</span>
                      </>
                    )}
                  </div>
                  <input ref={field === 'logoKiri' ? logoKiriRef : logoKananRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleLogoUpload(field, e)} />
                  {appInfo[field] && (
                    <button
                      onClick={() => handleChange(field, '')}
                      style={{ marginTop: 4, fontSize: 'var(--text-xs)', color: 'var(--c-danger)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                    >
                      Hapus logo
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              className="btn btn-primary"
              onClick={handleSave}
              disabled={saving}
              style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 'var(--text-sm)' }}
            >
              <Save size={14} />
              {saving ? 'Menyimpan...' : 'Simpan Pengaturan'}
            </button>
          </div>
        </div>

        {/* ── Kunci Data Global ── */}
        <div className="card" style={{ padding: 'var(--sp-5)' }}>
          <SectionHeader
            icon={lock.isLocked ? <Lock size={18} style={{ color: "var(--c-text-inv)" }} /> : <Unlock size={18} style={{ color: "var(--c-text-inv)" }} />}
            iconBg={lock.isLocked ? 'var(--c-danger)' : 'var(--c-success)'}
            title="Kunci Data Global"
            sub="Mencegah semua pengguna mengubah data ketika aktif"
          />

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', padding: 'var(--sp-4)', borderRadius: 'var(--radius-md)', border: `1px solid ${lock.isLocked ? 'var(--c-danger)' : 'var(--c-border)'}`, background: lock.isLocked ? 'var(--c-danger-light)' : 'var(--c-bg)', marginBottom: 'var(--sp-4)' }}>
            {lock.isLocked
              ? <ShieldAlert size={18} style={{ color: 'var(--c-danger)', flexShrink: 0 }} />
              : <Unlock size={18} style={{ color: 'var(--c-success)', flexShrink: 0 }} />
            }
            <div>
              <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: lock.isLocked ? 'var(--c-danger)' : 'var(--c-success)' }}>
                {lock.isLocked ? 'Data Sedang Dikunci' : 'Data Tidak Dikunci'}
              </div>
              {lock.isLocked && lock.lockedBy && (
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--c-text-3)', marginTop: 2 }}>
                  Dikunci oleh: <strong>{lock.lockedBy}</strong>
                  {lock.lockedAt && (
                    <> · {new Date(lock.lockedAt.seconds * 1000).toLocaleString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</>
                  )}
                </div>
              )}
            </div>
          </div>

          <button
            className={`btn ${lock.isLocked ? 'btn-danger' : 'btn-primary'}`}
            onClick={handleToggleLock}
            disabled={lockLoading}
            style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 'var(--text-sm)' }}
          >
            {lock.isLocked ? <Unlock size={14} /> : <Lock size={14} />}
            {lockLoading ? 'Memproses...' : lock.isLocked ? 'Buka Kunci Data' : 'Kunci Semua Data'}
          </button>
        </div>

        {/* ── Backup Data ── */}
        <div className="card" style={{ padding: 'var(--sp-5)' }}>
          <SectionHeader icon={<Download size={18} style={{ color: "var(--c-text-inv)" }} />} iconBg="var(--c-navy)" title="Backup Data" sub="Unduh semua data DHKP ke file Excel (.xlsx)" />

          <div style={{ padding: 'var(--sp-4)', borderRadius: 'var(--radius-md)', background: 'var(--c-bg)', border: '1px solid var(--c-border)', marginBottom: 'var(--sp-4)' }}>
            <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--c-text-1)', marginBottom: 4 }}>Backup Semua Tahun</div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--c-text-3)', marginBottom: 'var(--sp-3)' }}>
              Mengunduh data {BACKUP_YEARS.join(', ')} dalam satu file Excel. Setiap tahun menjadi satu sheet.
            </div>
            <button
              className="btn btn-secondary btn-sm"
              onClick={handleBackupAll}
              disabled={backupLoading}
              style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 'var(--text-xs)' }}
            >
              <Download size={13} />
              {backupLoading ? 'Memproses...' : 'Download Backup Semua Tahun'}
            </button>
          </div>
        </div>

        {/* ── Info Aplikasi ── */}
        <div className="card" style={{ padding: 'var(--sp-5)' }}>
          <SectionHeader icon={<Info size={18} style={{ color: "var(--c-text-inv)" }} />} iconBg="var(--c-text-3)" title="Informasi Aplikasi" sub="Versi dan detail teknis" />

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 'var(--sp-4)' }}>
            <InfoRow label="Nama Aplikasi" value="DHKP Desa Karang Sengon" />
            <InfoRow label="Versi" value={APP_VERSION} />
            <InfoRow label="Platform" value="Next.js + Firebase" />
            <InfoRow label="Desa" value="Karang Sengon, Klabang, Bondowoso" />
          </div>
        </div>

      </div>
    </AppShell>
  );
}
