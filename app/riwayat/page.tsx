'use client';

import { useState, useEffect, useMemo } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { useGlobalLock } from '@/hooks/useGlobalLock';
import { LockBanner } from '@/components/dhkp/LockBanner';
import { getChangelog } from '@/lib/changelog';
import { ChangelogEntry } from '@/types';
import { History, RefreshCw, Search, ChevronDown } from 'lucide-react';

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = [0, ...Array.from({ length: 5 }, (_, i) => CURRENT_YEAR - i)];

const FIELD_LABELS: Record<string, string> = {
  statusLunas: 'Status Lunas',
  pajakTerhutang: 'Pajak Terhutang',
  perubahanPajak: 'Perubahan Pajak',
  tanggalBayar: 'Tanggal Bayar',
  namaWajibPajak: 'Nama Wajib Pajak',
  nop: 'NOP',
  nomorInduk: 'No. Induk',
  alamatObjekPajak: 'Alamat Objek',
  luasTanah: 'Luas Tanah',
  luasBangunan: 'Luas Bangunan',
  dikelolaOleh: 'Dikelola Oleh',
};

function formatVal(field: string, val: unknown): string {
  if (val === undefined || val === null || val === '') return '—';
  if (field === 'statusLunas') return val ? 'Lunas' : 'Belum Lunas';
  if (field === 'pajakTerhutang' || field === 'perubahanPajak') {
    const n = Number(val);
    if (isNaN(n)) return String(val);
    return n.toLocaleString('id-ID');
  }
  return String(val);
}

function formatTimestamp(ts: { seconds: number } | null | undefined): string {
  if (!ts?.seconds) return '—';
  const d = new Date(ts.seconds * 1000);
  return d.toLocaleString('id-ID', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export default function RiwayatPage() {
  const lock = useGlobalLock();
  const [entries, setEntries] = useState<ChangelogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [tahun, setTahun] = useState(0);
  const [search, setSearch] = useState('');

  function fetchData() {
    setLoading(true);
    getChangelog().then((data) => {
      setEntries(data);
      setLoading(false);
    });
  }

  useEffect(() => { fetchData(); }, []);

  const filtered = useMemo(() => {
    return entries
      .filter((e) => {
        if (tahun !== 0 && e.tahun !== tahun) return false;
        if (search) {
          const q = search.toLowerCase();
          return (
            (e.namaWajibPajak || '').toLowerCase().includes(q) ||
            (e.field || '').toLowerCase().includes(q) ||
            (e.editedBy || '').toLowerCase().includes(q)
          );
        }
        return true;
      })
      .sort((a, b) => {
        const ta = a.editedAt?.seconds ?? 0;
        const tb = b.editedAt?.seconds ?? 0;
        return tb - ta;
      });
  }, [entries, tahun, search]);

  return (
    <AppShell pageTitle="Riwayat">
      <LockBanner lock={lock} />

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
        <div>
          <h1 className="font-bold" style={{ fontSize: 'var(--text-xl)', color: 'var(--c-text-1)' }}>
            Riwayat Perubahan
          </h1>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--c-text-3)', marginTop: 2 }}>
            Log semua perubahan data DHKP
          </p>
        </div>
        <button
          className="btn btn-secondary"
          style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 'var(--text-sm)' }}
          onClick={fetchData}
          disabled={loading}
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div style={{ position: 'relative', flex: '1 1 220px', minWidth: 180 }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--c-text-4)', pointerEvents: 'none' }} />
          <input
            className="input-field"
            style={{ paddingLeft: 32, width: '100%' }}
            placeholder="Cari nama, field, petugas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div style={{ position: 'relative', minWidth: 130 }}>
          <select
            className="input-field"
            style={{ width: '100%', paddingRight: 32, appearance: 'none' }}
            value={tahun}
            onChange={(e) => setTahun(Number(e.target.value))}
          >
            <option value={0}>Semua Tahun</option>
            {YEAR_OPTIONS.filter((y) => y !== 0).map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <ChevronDown size={14} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--c-text-4)', pointerEvents: 'none' }} />
        </div>
      </div>

      {/* Count */}
      {!loading && (
        <div className="mb-3" style={{ fontSize: 'var(--text-xs)', color: 'var(--c-text-3)' }}>
          Menampilkan <strong>{filtered.length}</strong> dari <strong>{entries.length}</strong> riwayat
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center" style={{ padding: 'var(--sp-12) 0' }}>
          <RefreshCw size={28} className="animate-spin" style={{ color: 'var(--c-navy)' }} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="card flex flex-col items-center gap-3 text-center" style={{ padding: 'var(--sp-12)' }}>
          <History size={40} style={{ color: 'var(--c-text-4)' }} />
          <p style={{ fontWeight: 600, color: 'var(--c-text-3)', fontSize: 'var(--text-base)' }}>
            {entries.length === 0 ? 'Belum ada riwayat perubahan' : 'Tidak ada hasil sesuai filter'}
          </p>
        </div>
      ) : (
        <div className="card overflow-hidden" style={{ padding: 0 }}>
          <div className="table-wrapper" style={{ borderRadius: 0, border: 'none' }}>
            <table className="dhkp-table">
              <thead>
                <tr>
                  <th style={{ width: 40 }}>No</th>
                  <th style={{ minWidth: 130 }}>Waktu Edit</th>
                  <th style={{ minWidth: 90 }}>Tahun</th>
                  <th style={{ minWidth: 180 }}>Nama Wajib Pajak</th>
                  <th style={{ minWidth: 140 }}>Field</th>
                  <th style={{ minWidth: 150 }}>Nilai Lama</th>
                  <th style={{ minWidth: 150 }}>Nilai Baru</th>
                  <th style={{ minWidth: 120 }}>Diedit Oleh</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((e, i) => (
                  <tr key={e.id ?? i}>
                    <td style={{ textAlign: 'center', color: 'var(--c-text-4)' }}>{i + 1}</td>
                    <td style={{ fontSize: 'var(--text-xs)', color: 'var(--c-text-3)', whiteSpace: 'nowrap' }}>
                      {formatTimestamp(e.editedAt)}
                    </td>
                    <td>
                      <span className="badge badge-info">{e.tahun}</span>
                    </td>
                    <td style={{ fontWeight: 500 }}>{e.namaWajibPajak || '—'}</td>
                    <td>
                      <span className="badge badge-default">
                        {FIELD_LABELS[e.field] || e.field}
                      </span>
                    </td>
                    <td style={{ color: 'var(--c-danger)', fontSize: 'var(--text-xs)' }}>
                      {formatVal(e.field, e.nilaiLama)}
                    </td>
                    <td style={{ color: 'var(--c-success)', fontSize: 'var(--text-xs)', fontWeight: 600 }}>
                      {formatVal(e.field, e.nilaiBaru)}
                    </td>
                    <td style={{ fontSize: 'var(--text-xs)', color: 'var(--c-text-3)' }}>
                      {e.editedBy || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AppShell>
  );
}
