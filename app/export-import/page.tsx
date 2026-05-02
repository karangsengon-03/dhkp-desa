'use client';

import { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { AppShell } from '@/components/layout/AppShell';
import { LockBanner } from '@/components/dhkp/LockBanner';
import { ImportPreviewModal } from '@/components/dhkp/ImportPreviewModal';
import { useGlobalLock } from '@/hooks/useGlobalLock';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/Toast';
import { getDHKP, addRecord, getChangelog } from '@/lib/firestore';
import { DHKPRecord, ChangelogEntry } from '@/types';
import { formatTanggal } from '@/lib/format';
import {
  Download, Upload, FileSpreadsheet, History,
  AlertTriangle, CheckCircle,
} from 'lucide-react';

const CURRENT_YEAR = new Date().getFullYear();
const TAHUN_LIST = Array.from({ length: 5 }, (_, i) => CURRENT_YEAR - i);

export interface ImportRow {
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

// Helper: pick first non-empty value from multiple possible column name aliases
function pick(raw: Record<string, unknown>, ...keys: string[]): unknown {
  for (const k of keys) {
    if (raw[k] !== undefined && raw[k] !== '') return raw[k];
  }
  return undefined;
}

function validateImportRow(raw: Record<string, unknown>, idx: number): ImportRow {
  const errors: string[] = [];
  const nomor = parseNumber(pick(raw, 'No', 'nomor') ?? idx + 1);
  const nop = String(pick(raw, 'NOP', 'nop') ?? '').trim();
  const nomorInduk = String(pick(raw, 'Nomor Induk', 'No. Induk', 'nomorInduk') ?? '').trim();
  const namaWajibPajak = String(pick(raw, 'Nama WP', 'Nama Wajib Pajak', 'namaWajibPajak') ?? '').trim();
  const alamatObjekPajak = String(pick(raw, 'Alamat Objek Pajak', 'Alamat Objek Pajak / Wajib Pajak', 'alamatObjekPajak') ?? '').trim();
  const pajakTerhutang = parseNumber(pick(raw, 'Pajak Terhutang', 'pajakTerhutang') ?? 0);
  const perubahanPajak = parseNumber(pick(raw, 'Perubahan Pajak', 'perubahanPajak') ?? 0);
  const statusLunas = parseBoolean(pick(raw, 'Status Lunas', 'Lunas', 'statusLunas') ?? false);
  const tanggalBayar = String(pick(raw, 'Tanggal Bayar', 'Tgl Bayar', 'tanggalBayar') ?? '').trim();
  const luasTanah = parseNumber(pick(raw, 'Luas Tanah', 'Luas Tanah (m²)', 'luasTanah') ?? 0);
  const luasBangunan = parseNumber(pick(raw, 'Luas Bangunan', 'Luas Bangunan (m²)', 'luasBangunan') ?? 0);
  const dikelolaOleh = String(pick(raw, 'Dikelola Oleh', 'dikelolaOleh') ?? '').trim();

  if (!namaWajibPajak) errors.push('Nama WP kosong');
  if (!nop) errors.push('NOP kosong');

  return {
    row: { nomor, nop, nomorInduk, namaWajibPajak, alamatObjekPajak, pajakTerhutang, perubahanPajak, statusLunas, tanggalBayar, luasTanah, luasBangunan, dikelolaOleh },
    errors,
  };
}

function SectionCard({ icon, iconBg, title, sub, children }: {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  sub: string;
  children: React.ReactNode;
}) {
  return (
    <div className="card" style={{ padding: 'var(--sp-5)' }}>
      <div className="section-header">
        <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {icon}
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 'var(--text-base)', color: 'var(--c-text-1)' }}>{title}</div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--c-text-3)', marginTop: 2 }}>{sub}</div>
        </div>
      </div>
      {children}
    </div>
  );
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
  const [importProgress, setImportProgress] = useState<{ done: number; total: number } | null>(null);
  const [importRows, setImportRows] = useState<ImportRow[]>([]);
  const [previewOpen, setPreviewOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleExportData() {
    setExportLoading(true);
    try {
      const records: DHKPRecord[] = await getDHKP(tahunExport);
      if (records.length === 0) { showToast(`Tidak ada data tahun ${tahunExport}`, 'info'); return; }
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
      XLSX.writeFile(wb, 'Riwayat_Perubahan_DHKP.xlsx');
      showToast(`Berhasil export ${entries.length} riwayat`, 'success');
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
        // Auto-detect header row (supports files with title rows above header)
        const allRows: unknown[][] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' }) as unknown[][];
        let headerRowIdx = 0;
        for (let i = 0; i < Math.min(10, allRows.length); i++) {
          const rowStr = allRows[i].map(String).join('|').toLowerCase();
          if (rowStr.includes('nop') && (rowStr.includes('nama') || rowStr.includes('pajak'))) {
            headerRowIdx = i;
            break;
          }
        }
        const headers = (allRows[headerRowIdx] as string[]).map(h => String(h ?? '').trim());
        const dataRows = allRows.slice(headerRowIdx + 1).filter(r => (r as unknown[]).some(c => c !== '' && c !== null));
        const rawRows: Record<string, unknown>[] = dataRows.map(row =>
          Object.fromEntries(headers.map((h, i) => [h, (row as unknown[])[i] ?? '']))
        );
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
    if (lock.isLocked) { showToast('Data sedang dikunci.', 'danger'); return; }
    setImportLoading(true);
    const validRows = importRows.filter((r) => r.errors.length === 0);
    setImportProgress({ done: 0, total: validRows.length });
    let sukses = 0; let gagal = 0;
    try {
      for (let i = 0; i < validRows.length; i++) {
        try {
          await addRecord(tahunImport, { ...validRows[i].row, tahun: tahunImport } as Omit<DHKPRecord, 'id'>);
          sukses++;
        } catch { gagal++; }
        setImportProgress({ done: i + 1, total: validRows.length });
      }
      showToast(`Import selesai: ${sukses} sukses${gagal > 0 ? `, ${gagal} gagal` : ''}`, gagal > 0 ? 'warning' : 'success');
      setPreviewOpen(false);
      setImportRows([]);
    } catch { showToast('Import gagal', 'danger'); }
    finally { setImportLoading(false); setImportProgress(null); }
  }

  return (
    <AppShell pageTitle="Export & Import">
      <LockBanner lock={lock} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>

        {/* Export Data DHKP */}
        <SectionCard
          icon={<FileSpreadsheet size={18} style={{ color: "var(--c-text-inv)" }} />}
          iconBg="var(--c-navy)"
          title="Export Data DHKP"
          sub="Unduh semua data wajib pajak ke file Excel (.xlsx)"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-4)', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
              <span style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--c-text-3)', whiteSpace: 'nowrap' }}>Tahun:</span>
              <select className="input-field" value={tahunExport} onChange={(e) => setTahunExport(Number(e.target.value))} style={{ width: 110 }}>
                {TAHUN_LIST.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <button
              className="btn btn-primary"
              onClick={handleExportData}
              disabled={exportLoading}
              style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 'var(--text-sm)' }}
            >
              <Download size={14} />
              {exportLoading ? 'Mengexport...' : `Export DHKP ${tahunExport}`}
            </button>
          </div>
        </SectionCard>

        {/* Export Riwayat */}
        <SectionCard
          icon={<History size={18} style={{ color: "var(--c-text-inv)" }} />}
          iconBg="var(--c-gold)"
          title="Export Riwayat Perubahan"
          sub="Unduh seluruh log perubahan data ke file Excel (.xlsx)"
        >
          <button
            className="btn btn-secondary"
            onClick={handleExportChangelog}
            disabled={exportChangelogLoading}
            style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 'var(--text-sm)' }}
          >
            <Download size={14} />
            {exportChangelogLoading ? 'Mengexport...' : 'Export Riwayat Perubahan'}
          </button>
        </SectionCard>

        {/* Import Data */}
        <SectionCard
          icon={<Upload size={18} style={{ color: "var(--c-text-inv)" }} />}
          iconBg={lock.isLocked ? 'var(--c-text-4)' : 'var(--c-success)'}
          title="Import Data DHKP"
          sub="Upload file Excel untuk batch import data wajib pajak"
        >
          {lock.isLocked ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', padding: 'var(--sp-3) var(--sp-4)', borderRadius: 'var(--radius-md)', background: 'var(--c-danger-light)', border: '1px solid var(--c-danger)' }}>
              <AlertTriangle size={16} style={{ color: 'var(--c-danger)', flexShrink: 0 }} />
              <span style={{ fontSize: 'var(--text-sm)', color: 'var(--c-danger)', fontWeight: 500 }}>
                Data sedang dikunci. Import tidak dapat dilakukan.
              </span>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
              {/* Format info */}
              <div style={{ padding: 'var(--sp-3) var(--sp-4)', borderRadius: 'var(--radius-md)', background: 'var(--c-bg)', border: '1px solid var(--c-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 'var(--sp-2)' }}>
                  <CheckCircle size={13} style={{ color: 'var(--c-success)' }} />
                  <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--c-text-2)' }}>Format kolom yang diterima:</span>
                </div>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--c-text-3)', lineHeight: 1.7 }}>
                  <code style={{ background: 'var(--c-surface)', padding: '2px 6px', borderRadius: 'var(--radius-sm)', fontSize: 11 }}>
                    No · NOP · Nomor Induk · Nama WP · Alamat Objek Pajak · Pajak Terhutang · Perubahan Pajak · Status Lunas · Tanggal Bayar · Luas Tanah · Luas Bangunan · Dikelola Oleh
                  </code>
                </p>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--c-text-3)', marginTop: 'var(--sp-2)' }}>
                  Kolom <strong>NOP</strong> dan <strong>Nama WP</strong> wajib diisi. Status Lunas: <code>Lunas</code> / <code>Belum</code>.
                </p>
              </div>

              {/* Progress bar saat import */}
              {importProgress && (
                <div style={{ padding: 'var(--sp-3) var(--sp-4)', borderRadius: 'var(--radius-md)', background: 'var(--c-navy-light)', border: '1px solid var(--c-navy)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 'var(--text-xs)', color: 'var(--c-navy)', fontWeight: 600 }}>
                    <span>Mengimport data...</span>
                    <span>{importProgress.done} dari {importProgress.total} berhasil diimpor</span>
                  </div>
                  <div style={{ background: 'var(--c-border)', borderRadius: 'var(--radius-full)', height: 8, overflow: 'hidden' }}>
                    <div style={{ height: 8, background: 'var(--c-navy)', borderRadius: 'var(--radius-full)', transition: 'width 200ms ease', width: `${Math.round((importProgress.done / importProgress.total) * 100)}%` }} />
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-4)', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
                  <span style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--c-text-3)', whiteSpace: 'nowrap' }}>Tahun:</span>
                  <select className="input-field" value={tahunImport} onChange={(e) => setTahunImport(Number(e.target.value))} style={{ width: 110 }}>
                    {TAHUN_LIST.map((y) => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                <input ref={fileInputRef} type="file" accept=".xlsx,.xls" style={{ display: 'none' }} onChange={handleFileChange} />
                <button
                  className="btn btn-primary"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={importLoading}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 'var(--text-sm)' }}
                >
                  <Upload size={14} />
                  Pilih File XLSX
                </button>
              </div>
            </div>
          )}
        </SectionCard>
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
