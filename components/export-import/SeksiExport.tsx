'use client';

import { useState } from 'react';
import * as XLSX from 'xlsx';
import { Download, FileSpreadsheet, History } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { getDHKP, getChangelog } from '@/lib/firestore';
import { DHKPRecord, ChangelogEntry } from '@/types';
import { formatTanggal, formatTimestamp } from '@/lib/format';

const CURRENT_YEAR = new Date().getFullYear();
const TAHUN_LIST = Array.from({ length: 5 }, (_, i) => CURRENT_YEAR - i);

interface SectionCardProps {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  sub: string;
  children: React.ReactNode;
}

function SectionCard({ icon, iconBg, title, sub, children }: SectionCardProps) {
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

export function SeksiExport() {
  const { showToast } = useToast();
  const [tahunExport, setTahunExport] = useState(CURRENT_YEAR);
  const [exportLoading, setExportLoading] = useState(false);
  const [exportChangelogLoading, setExportChangelogLoading] = useState(false);

  async function handleExportData() {
    setExportLoading(true);
    try {
      const records: DHKPRecord[] = await getDHKP(tahunExport);
      if (records.length === 0) {
        showToast(`Tidak ada data tahun ${tahunExport}`, 'info');
        return;
      }
      const wsData = [
        ['No', 'NOP', 'Nomor Induk', 'Nama WP', 'Alamat Objek Pajak', 'Pajak Terhutang', 'Perubahan Pajak', 'Status Lunas', 'Tanggal Bayar', 'Luas Tanah', 'Luas Bangunan', 'Dikelola Oleh'],
        ...records.map((r) => [
          r.nomor, r.nop, r.nomorInduk, r.namaWajibPajak, r.alamatObjekPajak,
          r.pajakTerhutang, r.perubahanPajak, r.statusLunas ? 'Lunas' : 'Belum',
          r.tanggalBayar ? formatTanggal(r.tanggalBayar) : '',
          r.luasTanah, r.luasBangunan, r.dikelolaOleh,
        ]),
      ];
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet(wsData);
      ws['!cols'] = [
        { wch: 5 }, { wch: 20 }, { wch: 15 }, { wch: 30 }, { wch: 35 },
        { wch: 18 }, { wch: 18 }, { wch: 12 }, { wch: 14 }, { wch: 12 }, { wch: 14 }, { wch: 20 },
      ];
      XLSX.utils.book_append_sheet(wb, ws, `DHKP ${tahunExport}`);
      XLSX.writeFile(wb, `DHKP_${tahunExport}.xlsx`);
      showToast(`Berhasil export ${records.length} data tahun ${tahunExport}`, 'success');
    } catch {
      showToast('Gagal export data', 'danger');
    } finally {
      setExportLoading(false);
    }
  }

  async function handleExportChangelog() {
    setExportChangelogLoading(true);
    try {
      const entries: ChangelogEntry[] = await getChangelog();
      if (entries.length === 0) {
        showToast('Tidak ada riwayat perubahan', 'info');
        return;
      }
      const wsData = [
        ['Tanggal Edit', 'Tahun', 'Nama WP', 'Field', 'Nilai Lama', 'Nilai Baru', 'Diedit Oleh'],
        ...entries.map((e) => {
          const tgl = e.editedAt ? formatTimestamp(e.editedAt) : '';
          return [tgl, e.tahun, e.namaWajibPajak, e.field, String(e.nilaiLama), String(e.nilaiBaru), e.editedBy];
        }),
      ];
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet(wsData);
      ws['!cols'] = [{ wch: 18 }, { wch: 8 }, { wch: 30 }, { wch: 20 }, { wch: 25 }, { wch: 25 }, { wch: 25 }];
      XLSX.utils.book_append_sheet(wb, ws, 'Riwayat Perubahan');
      XLSX.writeFile(wb, 'Riwayat_Perubahan_DHKP.xlsx');
      showToast(`Berhasil export ${entries.length} riwayat`, 'success');
    } catch {
      showToast('Gagal export riwayat', 'danger');
    } finally {
      setExportChangelogLoading(false);
    }
  }

  return (
    <>
      {/* Export Data DHKP */}
      <SectionCard
        icon={<FileSpreadsheet size={18} style={{ color: 'var(--c-text-inv)' }} />}
        iconBg="var(--c-navy)"
        title="Export Data DHKP"
        sub="Unduh semua data wajib pajak ke file Excel (.xlsx)"
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-4)', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
            <span style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--c-text-3)', whiteSpace: 'nowrap' }}>Tahun:</span>
            <select
              className="input-field"
              value={tahunExport}
              onChange={(e) => setTahunExport(Number(e.target.value))}
              style={{ width: 110 }}
            >
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
        icon={<History size={18} style={{ color: 'var(--c-text-inv)' }} />}
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
    </>
  );
}
