'use client';

import { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { Upload, AlertTriangle, CheckCircle } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { addRecord } from '@/lib/firestore';
import { DHKPRecord } from '@/types';
import { ImportPreviewModal } from '@/components/dhkp/ImportPreviewModal';
import { ImportRow } from '@/app/export-import/page';

const CURRENT_YEAR = new Date().getFullYear();
const TAHUN_LIST = Array.from({ length: 5 }, (_, i) => CURRENT_YEAR - i);

function parseBoolean(val: unknown): boolean {
  if (typeof val === 'boolean') return val;
  const s = String(val).toLowerCase().trim();
  return s === 'true' || s === 'ya' || s === '1' || s === 'lunas';
}

function parseNumber(val: unknown): number {
  const n = Number(String(val).replace(/[^0-9.-]/g, ''));
  return isNaN(n) ? 0 : n;
}

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

interface SeksiImportProps {
  isLocked: boolean;
}

export function SeksiImport({ isLocked }: SeksiImportProps) {
  const { showToast } = useToast();
  const [tahunImport, setTahunImport] = useState(CURRENT_YEAR);
  const [importLoading, setImportLoading] = useState(false);
  const [importProgress, setImportProgress] = useState<{ done: number; total: number } | null>(null);
  const [importRows, setImportRows] = useState<ImportRow[]>([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = new Uint8Array(ev.target?.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: 'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const allRows: unknown[][] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' }) as unknown[][];
        let headerRowIdx = 0;
        for (let i = 0; i < Math.min(10, allRows.length); i++) {
          const rowStr = allRows[i].map(String).join('|').toLowerCase();
          if (rowStr.includes('nop') && (rowStr.includes('nama') || rowStr.includes('pajak'))) {
            headerRowIdx = i;
            break;
          }
        }
        const headers = (allRows[headerRowIdx] as string[]).map((h) => String(h ?? '').trim());
        const dataRows = allRows.slice(headerRowIdx + 1).filter((r) => (r as unknown[]).some((c) => c !== '' && c !== null));
        const rawRows: Record<string, unknown>[] = dataRows.map((row) =>
          Object.fromEntries(headers.map((h, i) => [h, (row as unknown[])[i] ?? '']))
        );
        if (rawRows.length === 0) {
          showToast('File kosong atau format tidak dikenali', 'danger');
          return;
        }
        const parsed = rawRows.map((r, i) => validateImportRow(r, i));
        const nopSeen = new Map<string, number>();
        parsed.forEach((item, i) => {
          const nop = item.row.nop || '';
          if (nop) {
            if (nopSeen.has(nop)) {
              item.errors.push(`Duplikat NOP dengan baris ${(nopSeen.get(nop) ?? 0) + 1}`);
            } else {
              nopSeen.set(nop, i);
            }
          }
        });
        setImportRows(parsed);
        setPreviewOpen(true);
      } catch {
        showToast('Gagal membaca file. Pastikan format XLSX valid.', 'danger');
      }
    };
    reader.readAsArrayBuffer(file);
    e.target.value = '';
  }

  async function handleConfirmImport() {
    if (isLocked) { showToast('Data sedang dikunci.', 'danger'); return; }
    setImportLoading(true);
    const validRows = importRows.filter((r) => r.errors.length === 0);
    setImportProgress({ done: 0, total: validRows.length });
    let sukses = 0;
    let gagal = 0;
    try {
      for (let i = 0; i < validRows.length; i++) {
        try {
          await addRecord(tahunImport, { ...validRows[i].row, tahun: tahunImport } as Omit<DHKPRecord, 'id'>);
          sukses++;
        } catch {
          gagal++;
        }
        setImportProgress({ done: i + 1, total: validRows.length });
      }
      showToast(
        `Import selesai: ${sukses} sukses${gagal > 0 ? `, ${gagal} gagal` : ''}`,
        gagal > 0 ? 'warning' : 'success',
      );
      setPreviewOpen(false);
      setImportRows([]);
    } catch {
      showToast('Import gagal', 'danger');
    } finally {
      setImportLoading(false);
      setImportProgress(null);
    }
  }

  return (
    <>
      <div className="card" style={{ padding: 'var(--s5)' }}>
        <div className="section-header">
          <div style={{ width: 36, height: 36, borderRadius: 'var(--r-md)', background: isLocked ? 'var(--c-t4)' : 'var(--c-ok)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Upload size={18} style={{ color: 'var(--c-inv)' }} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 'var(--t-base)', color: 'var(--c-t1)' }}>Import Data DHKP</div>
            <div style={{ fontSize: 'var(--t-xs)', color: 'var(--c-t3)', marginTop: 2 }}>Unggah file Excel untuk batch import data wajib pajak</div>
          </div>
        </div>

        {isLocked ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s3)', padding: 'var(--s3) var(--s4)', borderRadius: 'var(--r-md)', background: 'var(--c-err-soft)', border: '1px solid var(--c-err)' }}>
            <AlertTriangle size={16} style={{ color: 'var(--c-err)', flexShrink: 0 }} />
            <span style={{ fontSize: 'var(--t-sm)', color: 'var(--c-err)', fontWeight: 500 }}>
              Data sedang dikunci. Import tidak dapat dilakukan.
            </span>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s4)' }}>
            {/* Format info */}
            <div style={{ padding: 'var(--s3) var(--s4)', borderRadius: 'var(--r-md)', background: 'var(--c-bg)', border: '1px solid var(--c-border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 'var(--s2)' }}>
                <CheckCircle size={13} style={{ color: 'var(--c-ok)' }} />
                <span style={{ fontSize: 'var(--t-xs)', fontWeight: 600, color: 'var(--c-t2)' }}>Format kolom yang diterima:</span>
              </div>
              <p style={{ fontSize: 'var(--t-xs)', color: 'var(--c-t3)', lineHeight: 1.7 }}>
                <code style={{ background: 'var(--c-surface)', padding: '2px 6px', borderRadius: 'var(--r-sm)', fontSize: 11 }}>
                  No · NOP · Nomor Induk · Nama WP · Alamat Objek Pajak · Pajak Terhutang · Perubahan Pajak · Status Lunas · Tanggal Bayar · Luas Tanah · Luas Bangunan · Dikelola Oleh
                </code>
              </p>
              <p style={{ fontSize: 'var(--t-xs)', color: 'var(--c-t3)', marginTop: 'var(--s2)' }}>
                Kolom <strong>NOP</strong> dan <strong>Nama WP</strong> wajib diisi. Status Lunas: <code>Lunas</code> / <code>Belum</code>.
              </p>
            </div>

            {/* Progress bar */}
            {importProgress && (
              <div style={{ padding: 'var(--s3) var(--s4)', borderRadius: 'var(--r-md)', background: 'var(--c-navy-soft)', border: '1px solid var(--c-navy)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 'var(--t-xs)', color: 'var(--c-navy)', fontWeight: 600 }}>
                  <span>Mengimport data...</span>
                  <span>{importProgress.done} dari {importProgress.total} berhasil diimpor</span>
                </div>
                <div style={{ background: 'var(--c-border)', borderRadius: 'var(--r-full)', height: 8, overflow: 'hidden' }}>
                  <div style={{ height: 8, background: 'var(--c-navy)', borderRadius: 'var(--r-full)', transition: 'width 200ms ease', width: `${Math.round((importProgress.done / importProgress.total) * 100)}%` }} />
                </div>
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s4)', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s2)' }}>
                <span style={{ fontSize: 'var(--t-sm)', fontWeight: 500, color: 'var(--c-t3)', whiteSpace: 'nowrap' }}>Tahun:</span>
                <select
                  className="input-field"
                  value={tahunImport}
                  onChange={(e) => setTahunImport(Number(e.target.value))}
                  style={{ width: 110 }}
                >
                  {TAHUN_LIST.map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              <input ref={fileInputRef} type="file" accept=".xlsx,.xls" style={{ display: 'none' }} onChange={handleFileChange} />
              <button
                className="btn btn-primary"
                onClick={() => fileInputRef.current?.click()}
                disabled={importLoading}
                style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 'var(--t-sm)' }}
              >
                <Upload size={14} />
                Pilih File XLSX
              </button>
            </div>
          </div>
        )}
      </div>

      <ImportPreviewModal
        open={previewOpen}
        onClose={() => { setPreviewOpen(false); setImportRows([]); }}
        onConfirm={handleConfirmImport}
        rows={importRows}
        loading={importLoading}
      />
    </>
  );
}
