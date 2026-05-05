'use client';

import { useState, useEffect } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { LockBanner } from '@/components/dhkp/LockBanner';
import { useGlobalLock } from '@/hooks/useGlobalLock';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/Toast';
import { getAppInfo, getDHKP } from '@/lib/firestore';
import { AppInfo } from '@/types';
import { SeksiAkun } from '@/components/pengaturan/SeksiAkun';
import { SeksiInfoDesa } from '@/components/pengaturan/SeksiInfoDesa';
import { SeksiKunci } from '@/components/pengaturan/SeksiKunci';
import { RefreshCw, Download, Info } from 'lucide-react';
import * as XLSX from 'xlsx';

const APP_VERSION = 'v1.0.0';
const CURRENT_YEAR = new Date().getFullYear();
const BACKUP_YEARS = Array.from({ length: 5 }, (_, i) => CURRENT_YEAR - i);

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <span style={{ fontSize: 'var(--t-xs)', fontWeight: 500, color: 'var(--c-t3)' }}>{label}</span>
      <span style={{ fontSize: 'var(--t-sm)', fontWeight: 600, color: 'var(--c-t1)' }}>{value}</span>
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
  const [backupLoading, setBackupLoading] = useState(false);

  useEffect(() => {
    getAppInfo()
      .then((info) => { if (info) setAppInfoState(info); })
      .catch(() => showToast('Gagal memuat pengaturan', 'danger'))
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleChange(field: keyof AppInfo, value: string) {
    setAppInfoState((prev) => ({ ...prev, [field]: value }));
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
      if (total === 0) { showToast('Tidak ada data untuk dicadangkan', 'warning'); return; }
      XLSX.writeFile(wb, `BACKUP_DHKP_${new Date().toISOString().slice(0, 10)}.xlsx`);
      showToast(`Cadangan berhasil — ${total} data`, 'success');
    } catch {
      showToast('Gagal membuat cadangan', 'danger');
    } finally {
      setBackupLoading(false);
    }
  }

  if (loading) {
    return (
      <AppShell pageTitle="Pengaturan">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 'var(--s12) 0', gap: 'var(--s3)' }}>
          <RefreshCw size={20} className="animate-spin" style={{ color: 'var(--c-navy)' }} />
          <span style={{ color: 'var(--c-t3)', fontSize: 'var(--t-sm)' }}>Memuat pengaturan...</span>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell pageTitle="Pengaturan">
      <LockBanner lock={lock} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s4)' }}>

        {/* Akun & Keamanan */}
        <SeksiAkun
          userEmail={user?.email ?? null}
          userDisplayName={user?.displayName ?? null}
        />

        {/* Informasi Desa */}
        <SeksiInfoDesa
          appInfo={appInfo}
          saving={saving}
          onSaving={setSaving}
          onChange={handleChange}
        />

        {/* Kunci Data Global */}
        <SeksiKunci lock={lock} userEmail={user?.email ?? null} />

        {/* Cadangan Data */}
        <div className="card" style={{ padding: 'var(--s5)' }}>
          <div className="section-header">
            <div style={{ width: 36, height: 36, borderRadius: 'var(--r-md)', background: 'var(--c-navy)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Download size={18} style={{ color: 'var(--c-inv)' }} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 'var(--t-base)', color: 'var(--c-t1)' }}>Cadangan Data</div>
              <div style={{ fontSize: 'var(--t-xs)', color: 'var(--c-t3)', marginTop: 2 }}>Unduh semua data DHKP ke file Excel (.xlsx)</div>
            </div>
          </div>

          <div style={{ padding: 'var(--s4)', borderRadius: 'var(--r-md)', background: 'var(--c-bg)', border: '1px solid var(--c-border)', marginBottom: 'var(--s4)' }}>
            <div style={{ fontWeight: 600, fontSize: 'var(--t-sm)', color: 'var(--c-t1)', marginBottom: 4 }}>Cadangan Semua Tahun</div>
            <div style={{ fontSize: 'var(--t-xs)', color: 'var(--c-t3)', marginBottom: 'var(--s3)' }}>
              Mengunduh data {BACKUP_YEARS.join(', ')} dalam satu file Excel. Setiap tahun menjadi satu sheet.
            </div>
            <button
              className="btn btn-secondary btn-sm"
              onClick={handleBackupAll}
              disabled={backupLoading}
              style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 'var(--t-xs)' }}
            >
              <Download size={13} />
              {backupLoading ? 'Memproses...' : 'Unduh Cadangan Semua Tahun'}
            </button>
          </div>
        </div>

        {/* Info Aplikasi */}
        <div className="card" style={{ padding: 'var(--s5)' }}>
          <div className="section-header">
            <div style={{ width: 36, height: 36, borderRadius: 'var(--r-md)', background: 'var(--c-t3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Info size={18} style={{ color: 'var(--c-inv)' }} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 'var(--t-base)', color: 'var(--c-t1)' }}>Informasi Aplikasi</div>
              <div style={{ fontSize: 'var(--t-xs)', color: 'var(--c-t3)', marginTop: 2 }}>Versi dan detail teknis</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 'var(--s4)' }}>
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
