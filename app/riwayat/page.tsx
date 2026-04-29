'use client';

import { useState, useEffect, useMemo } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { Card } from '@/components/ui/Card';
import { useGlobalLock } from '@/hooks/useGlobalLock';
import { LockBanner } from '@/components/dhkp/LockBanner';
import { getChangelog } from '@/lib/changelog';
import { ChangelogEntry } from '@/types';
import { History, RefreshCw, Search, Filter } from 'lucide-react';

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = [0, ...Array.from({ length: 5 }, (_, i) => CURRENT_YEAR - i)];

const FIELD_LABELS: Record<string, string> = {
  statusLunas: 'Status Lunas',
  pajakTerhutang: 'Pajak Terhutang',
  perubahanPajak: 'Perubahan Pajak',
  tanggalBayar: 'Tanggal Bayar',
  namaWajibPajak: 'Nama Wajib Pajak',
  alamatObjekPajak: 'Alamat Objek Pajak',
  nop: 'NOP',
  nomorInduk: 'Nomor Induk',
  luasTanah: 'Luas Tanah',
  luasBangunan: 'Luas Bangunan',
  dikelolaOleh: 'Dikelola Oleh',
};

function formatTimestamp(ts: { seconds: number } | undefined): string {
  if (!ts) return '-';
  const d = new Date(ts.seconds * 1000);
  return d.toLocaleString('id-ID', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function formatValue(field: string, val: string | number | boolean | null | undefined): React.ReactNode {
  if (val === null || val === undefined || val === '') return <span style={{ color: 'var(--color-text-disabled)' }}>—</span>;
  if (field === 'statusLunas') {
    return val === true || val === 'true'
      ? <span className="badge badge-success">Lunas</span>
      : <span className="badge badge-danger">Belum Lunas</span>;
  }
  if (field === 'pajakTerhutang' || field === 'perubahanPajak') {
    const num = Number(val);
    return isNaN(num) ? String(val) : `Rp ${num.toLocaleString('id-ID')}`;
  }
  return String(val);
}

export default function RiwayatPage() {
  const lock = useGlobalLock();
  const [entries, setEntries] = useState<ChangelogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchNama, setSearchNama] = useState('');
  const [filterTahun, setFilterTahun] = useState(0);
  const [filterField, setFilterField] = useState('');

  useEffect(() => {
    setLoading(true);
    getChangelog().then((data) => {
      setEntries(data);
      setLoading(false);
    });
  }, []);

  const allFields = useMemo(() => {
    const set = new Set(entries.map((e) => e.field));
    return Array.from(set).sort();
  }, [entries]);

  const filtered = useMemo(() => {
    return entries.filter((e) => {
      if (filterTahun && e.tahun !== filterTahun) return false;
      if (filterField && e.field !== filterField) return false;
      if (searchNama && !e.namaWajibPajak.toLowerCase().includes(searchNama.toLowerCase())) return false;
      return true;
    });
  }, [entries, filterTahun, filterField, searchNama]);

  return (
    <AppShell pageTitle="Riwayat Perubahan">
      <LockBanner lock={lock} />

      {/* Toolbar Filter */}
      <div className="card p-4 mb-5 flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2 flex-1" style={{ minWidth: 200 }}>
          <Search size={15} style={{ color: 'var(--color-text-secondary)', flexShrink: 0 }} />
          <input
            className="input-field"
            placeholder="Cari nama wajib pajak..."
            value={searchNama}
            onChange={(e) => setSearchNama(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter size={15} style={{ color: 'var(--color-text-secondary)', flexShrink: 0 }} />
          <select className="input-field" style={{ width: 120 }} value={filterTahun} onChange={(e) => setFilterTahun(Number(e.target.value))}>
            <option value={0}>Semua Tahun</option>
            {YEAR_OPTIONS.filter((y) => y !== 0).map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>

        <div>
          <select className="input-field" style={{ width: 180 }} value={filterField} onChange={(e) => setFilterField(e.target.value)}>
            <option value="">Semua Field</option>
            {allFields.map((f) => (
              <option key={f} value={f}>{FIELD_LABELS[f] || f}</option>
            ))}
          </select>
        </div>

        {loading && <RefreshCw size={16} className="animate-spin" style={{ color: 'var(--color-primary)' }} />}
        {!loading && (
          <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
            {filtered.length} entri
          </span>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <RefreshCw size={32} className="animate-spin" style={{ color: 'var(--color-primary)' }} />
        </div>
      ) : filtered.length === 0 ? (
        <Card className="p-12 flex flex-col items-center gap-3 text-center">
          <History size={48} style={{ color: 'var(--color-text-disabled)' }} />
          <p className="font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
            {entries.length === 0 ? 'Belum ada riwayat perubahan' : 'Tidak ada data yang cocok dengan filter'}
          </p>
        </Card>
      ) : (
        <Card className="p-0 overflow-hidden">
          <div className="table-wrapper" style={{ borderRadius: 12, border: 'none' }}>
            <table className="dhkp-table">
              <thead>
                <tr>
                  <th style={{ width: 40 }}>No</th>
                  <th style={{ minWidth: 130 }}>Tanggal & Jam</th>
                  <th style={{ minWidth: 160 }}>Nama Wajib Pajak</th>
                  <th>Tahun</th>
                  <th style={{ minWidth: 130 }}>Field Diubah</th>
                  <th style={{ minWidth: 130 }}>Nilai Lama</th>
                  <th style={{ minWidth: 130 }}>Nilai Baru</th>
                  <th style={{ minWidth: 120 }}>Diubah Oleh</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((e, i) => (
                  <tr key={e.id}>
                    <td style={{ color: 'var(--color-text-secondary)', textAlign: 'center' }}>{i + 1}</td>
                    <td style={{ fontSize: 12, color: 'var(--color-text-secondary)', whiteSpace: 'nowrap' }}>
                      {formatTimestamp(e.editedAt)}
                    </td>
                    <td className="font-medium">{e.namaWajibPajak}</td>
                    <td style={{ textAlign: 'center' }}>
                      <span className="badge badge-info">{e.tahun}</span>
                    </td>
                    <td>
                      <span className="badge badge-default">
                        {FIELD_LABELS[e.field] || e.field}
                      </span>
                    </td>
                    <td style={{ fontSize: 13 }}>{formatValue(e.field, e.nilaiLama)}</td>
                    <td style={{ fontSize: 13 }}>{formatValue(e.field, e.nilaiBaru)}</td>
                    <td style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{e.editedBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </AppShell>
  );
}
