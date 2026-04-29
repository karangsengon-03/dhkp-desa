'use client';

import { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { AppShell } from '@/components/layout/AppShell';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LockBanner } from '@/components/dhkp/LockBanner';
import { ImportPreviewModal } from '@/components/dhkp/ImportPreviewModal';
import { useGlobalLock } from '@/hooks/useGlobalLock';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/Toast';
import { getDHKP, addRecord, getChangelog } from '@/lib/firestore';
import { DHKPRecord, ChangelogEntry } from '@/types';
import { formatRupiah, formatTanggal } from '@/lib/format';
import {
  Download, Upload, FileSpreadsheet, History,
  AlertTriangle, CheckCircle,
} from 'lucide-react';

const CURRENT_YEAR = new Date().getFullYear();
const TAHUN_LIST = Array.from({ length: 5 }, (_, i) => CURRENT_YEAR - i);

interface ImportRow {
  row: Partial<DHKPRecord>;
  errors: string[];
}

function parseBoolean(val: unknown): boolean {
  if (typeof val === 'boolean') return val;
  const s = String(val).toLowerCase().trim();
  return s === 'true' || s === 'ya' || s === '1' || s === 'lunas';
}

function parseNumber(val: unknown): number {
  const n = Number(String(val).replace(/[^0-9.-]/g, ''));
  return isNaN(n) ? 0 : n;
}

function validateImportRow(raw: Record<string, unknown>, idx: number): ImportRow {
  const errors: string[] = [];
  const nomor = parseNumber(raw['No'] ?? raw['nomor'] ?? idx + 1);
  const nop = String(raw['NOP'] ?? raw['nop'] ?? '').trim();
  const nomorInduk = String(raw['Nomor Induk'] ?? raw['nomorInduk'] ?? '').trim();
  const namaWajibPajak = String(raw['Nama WP'] ?? raw['namaWajibPajak'] ?? '').trim();
  const alamatObjekPajak = String(raw['Alamat Objek Pajak'] ?? raw['alamatObjekPajak'] ?? '').trim();
  const pajakTerhutang = parseNumber(raw['Pajak Terhutang'] ?? raw['pajakTerhutang'] ?? 0);
  const statusLunas = parseBoolean(raw['Status Lunas'] ?? raw['statusLunas'] ?? false);
  const tanggalBayar = String(raw['Tanggal Bayar'] ?? raw['tanggalBayar'] ?? '').trim();
  const luasTanah = parseNumber(raw['Luas Tanah'] ?? raw['luasTanah'] ?? 0);
  const luasBangunan = parseNumber(raw['Luas Bangunan'] ?? raw['luasBangunan'] ?? 0);
  const dikelolaOleh = String(raw['Dikelola Oleh'] ?? raw['dikelolaOleh'] ?? '').trim();
  const perubahanPajak = parseNumber(raw['Perubahan Pajak'] ?? raw['perubahanPajak'] ?? 0);

  if (!namaWajibPajak) errors.push('Nama WP kosong');
  if (!nop) errors.push('NOP kosong');

  return {
    row: { nomor, nop, nomorInduk, namaWajibPajak, alamatObjekPajak, pajakTerhutang, statusLunas, perubahanPajak, tanggalBayar, luasTanah, luasBangunan, dikelolaOleh },
    errors,
  };
}

export default function ExportImportPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const lock = useGlobalLock();

  const [tahunExport, setTahunExport] = useState(CURRENT_YEAR);
  const [tahunImport, setTahunImport] = useState(CURRENT_YEAR);
  const [exportLoading, setExportLoading] = useState(false);
  const [exportChangelogLoading, setExportChangelogLoading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [importRows, setImportRows] = useState<ImportRow[]>([]);
  const [previewOpen, setPreviewOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleExportData() {
    setExportLoading(true);
    try {
      const records: DHKPRecord[] = await getDHKP(tahunExport);
      if (records.length === 0) { showToast(`Tidak ada data untuk tahun ${tahunExport}`, 'info'); return; }
      const wsData = [
        ['No', 'NOP', 'Nomor Induk', 'Nama WP', 'Alamat Objek Pajak', 'Pajak Terhutang', 'Perubahan Pajak', 'Status Lunas', 'Tanggal Bayar', 'Luas Tanah', 'Luas Bangunan', 'Dikelola Oleh'],
        ...records.map((r) => [r.nomor, r.nop, r.nomorInduk, r.namaWajibPajak, r.alamatObjekPajak, r.pajakTerhutang, r.perubahanPajak, r.statusLunas ? 'Lunas' : 'Belum', r.tanggalBayar ? formatTanggal(r.tanggalBayar) : '', r.luasTanah, r.luasBangunan, r.dikelolaOleh]),
      ];
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet(wsData);
      ws['!cols'] = [{ wch: 5 }, { wch: 20 }, { wch: 15 }, { wch: 30 }, { wch: 35 }, { wch: 18 }, { wch: 18 }, { wch: 12 }, { wch: 14 }, { wch: 12 }, { wch: 14 }, { wch: 20 }];
      XLSX.utils.book_append_sheet(wb, ws, `DHKP ${tahunExport}`);
      XLSX.writeFile(wb, `DHKP_${tahunExport}.xlsx`);
      showToast(`Berhasil export ${records.length} data tahun ${tahunExport}`, 'success');
    } catch { showToast('Gagal export data', 'danger'); }
    finally { setExportLoading(false); }
  }

  async function handleExportChangelog() {
    setExportChangelogLoading(true);
    try {
      const entries: ChangelogEntry[] = await getChangelog();
      if (entries.length === 0) { showToast('Tidak ada riwayat perubahan', 'info'); return; }
      const wsData = [
        ['Tanggal Edit', 'Tahun', 'Nama WP', 'Field', 'Nilai Lama', 'Nilai Baru', 'Diedit Oleh'],
        ...entries.map((e) => {
          const tgl = e.editedAt ? new Date(e.editedAt.seconds * 1000).toLocaleString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '';
          return [tgl, e.tahun, e.namaWajibPajak, e.field, String(e.nilaiLama), String(e.nilaiBaru), e.editedBy];
        }),
      ];
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet(wsData);
      ws['!cols'] = [{ wch: 18 }, { wch: 8 }, { wch: 30 }, { wch: 20 }, { wch: 25 }, { wch: 25 }, { wch: 25 }];
      XLSX.utils.book_append_sheet(wb, ws, 'Riwayat Perubahan');
      XLSX.writeFile(wb, `Riwayat_Perubahan_DHKP.xlsx`);
      showToast(`Berhasil export ${entries.length} riwayat perubahan`, 'success');
    } catch { showToast('Gagal export riwayat', 'danger'); }
    finally { setExportChangelogLoading(false); }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = new Uint8Array(ev.target?.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: 'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rawRows: Record<string, unknown>[] = XLSX.utils.sheet_to_json(ws, { defval: '' });
        if (rawRows.length === 0) { showToast('File kosong atau format tidak dikenali', 'danger'); return; }
        const parsed = rawRows.map((r, i) => validateImportRow(r, i));
        const nopSeen = new Map<string, number>();
        parsed.forEach((item, i) => {
          const nop = item.row.nop || '';
          if (nop) {
            if (nopSeen.has(nop)) { item.errors.push(`Duplikat NOP dengan baris ${(nopSeen.get(nop) ?? 0) + 1}`); }
            else { nopSeen.set(nop, i); }
          }
        });
        setImportRows(parsed);
        setPreviewOpen(true);
      } catch { showToast('Gagal membaca file. Pastikan format XLSX valid.', 'danger'); }
    };
    reader.readAsArrayBuffer(file);
    e.target.value = '';
  }

  async function handleConfirmImport() {
    if (lock.isLocked) { showToast('Data sedang dikunci. Import tidak dapat dilakukan.', 'danger'); return; }
    setImportLoading(true);
    const validRows = importRows.filter((r) => r.errors.length === 0);
    let sukses = 0; let gagal = 0;
    try {
      for (const item of validRows) {
        try { await addRecord(tahunImport, { ...item.row, tahun: tahunImport } as Omit<DHKPRecord, 'id'>); sukses++; }
        catch { gagal++; }
      }
      showToast(`Import selesai: ${sukses} sukses${gagal > 0 ? `, ${gagal} gagal` : ''}`, gagal > 0 ? 'warning' : 'success');
      setPreviewOpen(false);
      setImportRows([]);
    } catch { showToast('Import gagal', 'danger'); }
    finally { setImportLoading(false); }
  }

  return (
    <AppShell pageTitle="Export & Import">
      <LockBanner lock={lock} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

        {/* Export Data DHKP */}
        <Card className="p-6">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <div style={{ background: 'var(--color-primary)', borderRadius: '10px', padding: '0.5rem', display: 'flex' }}>
              <FileSpreadsheet size={20} color="#fff" />
            </div>
            <div>
              <h2 style={{ fontWeight: 700, color: 'var(--color-text-primary)', fontSize: '1rem' }}>Export Data DHKP</h2>
              <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>Unduh semua data wajib pajak ke file Excel (.xlsx)</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text-secondary)', whiteSpace: 'nowrap' }}>Tahun:</label>
              <select className="input-field" value={tahunExport} onChange={(e) => setTahunExport(Number(e.target.value))} style={{ width: '110px' }}>
                {TAHUN_LIST.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <Button variant="primary" onClick={handleExportData} disabled={exportLoading}>
              <Download size={16} />
              {exportLoading ? 'Mengexport...' : `Export DHKP ${tahunExport}`}
            </Button>
          </div>
        </Card>

        {/* Export Riwayat */}
        <Card className="p-6">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <div style={{ background: 'var(--color-gold)', borderRadius: '10px', padding: '0.5rem', display: 'flex' }}>
              <History size={20} color="#fff" />
            </div>
            <div>
              <h2 style={{ fontWeight: 700, color: 'var(--color-text-primary)', fontSize: '1rem' }}>Export Riwayat Perubahan</h2>
              <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>Unduh seluruh log perubahan data ke file Excel (.xlsx)</p>
            </div>
          </div>
          <Button variant="secondary" onClick={handleExportChangelog} disabled={exportChangelogLoading}>
            <Download size={16} />
            {exportChangelogLoading ? 'Mengexport...' : 'Export Riwayat Perubahan'}
          </Button>
        </Card>

        {/* Import Data */}
        <Card className="p-6">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <div style={{ background: lock.isLocked ? 'var(--color-text-disabled)' : 'var(--color-success)', borderRadius: '10px', padding: '0.5rem', display: 'flex' }}>
              <Upload size={20} color="#fff" />
            </div>
            <div>
              <h2 style={{ fontWeight: 700, color: 'var(--color-text-primary)', fontSize: '1rem' }}>Import Data DHKP</h2>
              <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>Upload file Excel untuk batch import data wajib pajak</p>
            </div>
          </div>

          {lock.isLocked ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.875rem 1rem', borderRadius: '10px', background: 'rgba(198,40,40,0.07)', border: '1px solid var(--color-danger)' }}>
              <AlertTriangle size={18} style={{ color: 'var(--color-danger)', flexShrink: 0 }} />
              <p style={{ fontSize: '0.875rem', color: 'var(--color-danger)', fontWeight: 500 }}>Data sedang dikunci. Import tidak dapat dilakukan saat ini.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ padding: '0.875rem 1rem', borderRadius: '10px', background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <CheckCircle size={15} style={{ color: 'var(--color-success)' }} />
                  <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Format kolom yang diterima:</span>
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', lineHeight: 1.7 }}>
                  <code style={{ background: 'var(--color-surface)', padding: '2px 6px', borderRadius: 4, fontSize: '0.7rem' }}>
                    No · NOP · Nomor Induk · Nama WP · Alamat Objek Pajak · Pajak Terhutang · Perubahan Pajak · Status Lunas · Tanggal Bayar · Luas Tanah · Luas Bangunan · Dikelola Oleh
                  </code>
                </p>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '0.5rem' }}>
                  Kolom <strong>NOP</strong> dan <strong>Nama WP</strong> wajib diisi. Status Lunas: <code>Lunas</code> / <code>Belum</code> / <code>true</code> / <code>false</code>.
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text-secondary)', whiteSpace: 'nowrap' }}>Tahun:</label>
                  <select className="input-field" value={tahunImport} onChange={(e) => setTahunImport(Number(e.target.value))} style={{ width: '110px' }}>
                    {TAHUN_LIST.map((y) => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                <input ref={fileInputRef} type="file" accept=".xlsx,.xls" style={{ display: 'none' }} onChange={handleFileChange} />
                <Button variant="primary" onClick={() => fileInputRef.current?.click()} disabled={importLoading}>
                  <Upload size={16} />
                  Pilih File XLSX
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>

      <ImportPreviewModal
        open={previewOpen}
        onClose={() => { setPreviewOpen(false); setImportRows([]); }}
        onConfirm={handleConfirmImport}
        rows={importRows}
        loading={importLoading}
      />
    </AppShell>
  );
}
