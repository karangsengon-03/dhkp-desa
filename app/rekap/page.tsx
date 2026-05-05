'use client';

import { useState, useMemo, useEffect } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { LockBanner } from '@/components/dhkp/LockBanner';
import { PrintRekapHeader } from '@/components/print/PrintRekapHeader';
import { PrintDHKP } from '@/components/print/PrintDHKP';
import { useGlobalLock } from '@/hooks/useGlobalLock';
import { getDHKP, getAppInfo } from '@/lib/firestore';
import { DHKPRecord, AppInfo } from '@/types';
import { formatRupiah } from '@/lib/format';
import {
  Users, CheckCircle, XCircle, Banknote, TrendingUp,
  AlertCircle, Printer, RefreshCw, FileText,
} from 'lucide-react';

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 5 }, (_, i) => CURRENT_YEAR - i);

interface PetugasRekap {
  nama: string;
  total: number;
  lunas: number;
  belum: number;
  persen: number;
}

function ProgressBar({ persen }: { persen: number }) {
  const color = persen >= 75 ? 'var(--c-ok)' : persen >= 40 ? 'var(--c-warn)' : 'var(--c-err)';
  return (
    <div className="w-full rounded-full overflow-hidden" style={{ height: 8, background: 'var(--c-border)' }}>
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${Math.min(100, persen)}%`, background: color }}
      />
    </div>
  );
}

export default function RekapPage() {
  const lock = useGlobalLock();
  const [tahun, setTahun] = useState(CURRENT_YEAR);
  const [records, setRecords] = useState<DHKPRecord[]>([]);
  const [appInfo, setAppInfo] = useState<AppInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [printMode, setPrintMode] = useState<'rekap' | 'dhkp' | null>(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([getDHKP(tahun), getAppInfo()]).then(([recs, info]) => {
      setRecords(recs);
      setAppInfo(info);
      setLoading(false);
    });
  }, [tahun]);

  // Setelah set printMode, tunggu render selesai lalu print
  useEffect(() => {
    if (printMode === null) return;
    const t = setTimeout(() => {
      window.print();
      // Reset setelah print dialog
      const onAfter = () => { setPrintMode(null); window.removeEventListener('afterprint', onAfter); };
      window.addEventListener('afterprint', onAfter);
    }, 80);
    return () => clearTimeout(t);
  }, [printMode]);

  const stats = useMemo(() => {
    const total = records.length;
    const lunas = records.filter((r) => r.statusLunas).length;
    const belum = total - lunas;
    const persen = total > 0 ? Math.round((lunas / total) * 100) : 0;
    const totalPajak = records.reduce((s, r) => s + (r.pajakTerhutang || 0), 0);
    const totalBayar = records.filter((r) => r.statusLunas).reduce((s, r) => s + (r.pajakTerhutang || 0), 0);
    return { total, lunas, belum, persen, totalPajak, totalBayar, tunggakan: totalPajak - totalBayar };
  }, [records]);

  const petugasList: PetugasRekap[] = useMemo(() => {
    const map: Record<string, { lunas: number; total: number }> = {};
    records.forEach((r) => {
      const nama = r.dikelolaOleh || '(Tidak diketahui)';
      if (!map[nama]) map[nama] = { lunas: 0, total: 0 };
      map[nama].total++;
      if (r.statusLunas) map[nama].lunas++;
    });
    return Object.entries(map)
      .map(([nama, v]) => ({
        nama, total: v.total, lunas: v.lunas,
        belum: v.total - v.lunas,
        persen: v.total > 0 ? Math.round((v.lunas / v.total) * 100) : 0,
      }))
      .sort((a, b) => b.total - a.total);
  }, [records]);

  const pColor = stats.persen >= 75 ? 'var(--c-ok)' : stats.persen >= 40 ? 'var(--c-warn)' : 'var(--c-err)';

  const isDhkpPrint = printMode === 'dhkp';

  return (
    <AppShell pageTitle="Rekap Lunas">
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          .card { box-shadow: none !important; border: 1px solid var(--c-border) !important; break-inside: avoid; }
          .dhkp-table thead tr { background: var(--c-navy) !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      `}</style>

      {/* Mode cetak DHKP: hanya tampilkan PrintDHKP */}
      {isDhkpPrint ? (
        <PrintDHKP records={records} appInfo={appInfo} tahun={tahun} />
      ) : (
        <>
          <LockBanner lock={lock} />

          {/* Toolbar */}
          <div className="no-print flex items-center justify-between gap-4 mb-5 flex-wrap">
            <div>
              <h1 className="font-bold" style={{ fontSize: 'var(--t-xl)', color: 'var(--c-t1)' }}>
                Rekap Lunas
              </h1>
              <p style={{ fontSize: 'var(--t-sm)', color: 'var(--c-t3)', marginTop: 2 }}>
                Statistik pembayaran PBB per tahun
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span style={{ fontSize: 'var(--t-sm)', color: 'var(--c-t3)', fontWeight: 500 }}>Tahun:</span>
              <select
                className="input-field"
                style={{ width: 110 }}
                value={tahun}
                onChange={(e) => setTahun(Number(e.target.value))}
              >
                {YEAR_OPTIONS.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
              {loading && <RefreshCw size={16} className="animate-spin" style={{ color: 'var(--c-navy)' }} />}
              <button
                className="btn btn-secondary"
                style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 'var(--t-sm)' }}
                onClick={() => setPrintMode('rekap')}
                disabled={loading || records.length === 0}
              >
                <Printer size={14} /> Cetak Rekap
              </button>
              <button
                className="btn btn-primary"
                style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 'var(--t-sm)' }}
                onClick={() => setPrintMode('dhkp')}
                disabled={loading || records.length === 0}
              >
                <FileText size={14} /> Cetak Data DHKP
              </button>
            </div>
          </div>

          {/* Print Header untuk cetak rekap */}
          <PrintRekapHeader appInfo={appInfo} tahun={tahun} />

          {loading ? (
            <div className="flex justify-center items-center" style={{ padding: 'var(--s12) 0' }}>
              <RefreshCw size={28} className="animate-spin" style={{ color: 'var(--c-navy)' }} />
            </div>
          ) : records.length === 0 ? (
            <div className="card flex flex-col items-center gap-3 text-center" style={{ padding: 'var(--s12)' }}>
              <Users size={40} style={{ color: 'var(--c-t4)' }} />
              <p style={{ fontWeight: 600, color: 'var(--c-t3)', fontSize: 'var(--t-base)' }}>
                Tidak ada data untuk tahun {tahun}
              </p>
            </div>
          ) : (
            <>
              {/* Stat Cards */}
              <div className="grid gap-4 mb-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}>
                {[
                  { icon: <Users size={20} />, label: 'Total Wajib Pajak', value: stats.total, sub: `Tahun ${tahun}`, color: 'var(--c-navy)', bg: 'var(--c-navy-soft)' },
                  { icon: <CheckCircle size={20} />, label: 'Sudah Lunas', value: stats.lunas, sub: `${stats.persen}% dari total`, color: 'var(--c-ok)', bg: 'var(--c-ok-soft)' },
                  { icon: <XCircle size={20} />, label: 'Belum Lunas', value: stats.belum, sub: `${100 - stats.persen}% dari total`, color: 'var(--c-err)', bg: 'var(--c-err-soft)' },
                  { icon: <TrendingUp size={20} />, label: 'Persentase Lunas', value: `${stats.persen}%`, sub: stats.persen >= 75 ? 'Target tercapai' : 'Belum mencapai target', color: pColor, bg: stats.persen >= 75 ? 'var(--c-ok-soft)' : stats.persen >= 40 ? 'var(--c-warn-soft)' : 'var(--c-err-soft)' },
                ].map(({ icon, label, value, sub, color, bg }) => (
                  <div key={label} className="stat-card">
                    <div className="stat-icon" style={{ background: bg, color }}>{icon}</div>
                    <div className="stat-value">{value}</div>
                    {sub && <div style={{ fontSize: 'var(--t-xs)', color, fontWeight: 600, marginBottom: 2 }}>{sub}</div>}
                    <div className="stat-label">{label}</div>
                  </div>
                ))}
              </div>

              {/* Progress Bar */}
              <div className="card mb-4" style={{ padding: 'var(--s4)' }}>
                <div className="flex items-center justify-between mb-2">
                  <span style={{ fontSize: 'var(--t-sm)', fontWeight: 600, color: 'var(--c-t1)' }}>
                    Progress Pelunasan Tahun {tahun}
                  </span>
                  <span style={{ fontSize: 'var(--t-xs)', fontWeight: 700, color: pColor }}>
                    {stats.persen}%
                  </span>
                </div>
                <ProgressBar persen={stats.persen} />
                <div className="flex justify-between mt-1.5" style={{ fontSize: 'var(--t-xs)', color: 'var(--c-t3)' }}>
                  <span>{stats.lunas} lunas</span>
                  <span>{stats.belum} belum lunas</span>
                </div>
              </div>

              {/* Finance Cards */}
              <div className="grid gap-4 mb-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                {[
                  { icon: <Banknote size={18} />, label: 'Total Pajak Terhutang', value: formatRupiah(stats.totalPajak), color: 'var(--c-navy)', bg: 'var(--c-navy-soft)' },
                  { icon: <CheckCircle size={18} />, label: 'Total Sudah Dibayar', value: formatRupiah(stats.totalBayar), color: 'var(--c-ok)', bg: 'var(--c-ok-soft)' },
                  { icon: <AlertCircle size={18} />, label: 'Total Tunggakan', value: formatRupiah(stats.tunggakan), color: 'var(--c-err)', bg: 'var(--c-err-soft)' },
                ].map(({ icon, label, value, color, bg }) => (
                  <div key={label} className="card flex items-center gap-3" style={{ padding: 'var(--s4)' }}>
                    <div style={{ width: 40, height: 40, borderRadius: 'var(--r-md)', background: bg, color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {icon}
                    </div>
                    <div className="min-w-0">
                      <div style={{ fontSize: 'var(--t-xs)', color: 'var(--c-t3)', marginBottom: 2 }}>{label}</div>
                      <div style={{ fontSize: 'var(--t-sm)', fontWeight: 700, color, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Tabel per Petugas */}
              <div className="card overflow-hidden" style={{ padding: 0 }}>
                <div className="flex items-center justify-between" style={{ padding: 'var(--s3) var(--s4)', borderBottom: '1px solid var(--c-border)' }}>
                  <span style={{ fontSize: 'var(--t-sm)', fontWeight: 700, color: 'var(--c-t1)' }}>
                    Rekap per Petugas
                  </span>
                </div>
                <div className="table-wrapper" style={{ borderRadius: 0, border: 'none' }}>
                  <table className="dhkp-table">
                    <thead>
                      <tr>
                        <th style={{ width: 40 }}>No</th>
                        <th>Nama Petugas</th>
                        <th style={{ textAlign: 'right' }}>Total WP</th>
                        <th style={{ textAlign: 'right' }}>Lunas</th>
                        <th style={{ textAlign: 'right' }}>Belum</th>
                        <th className="no-print" style={{ width: 160 }}>Progress</th>
                        <th style={{ textAlign: 'right', width: 60 }}>%</th>
                      </tr>
                    </thead>
                    <tbody>
                      {petugasList.map((p, i) => {
                        const pc = p.persen >= 75 ? 'var(--c-ok)' : p.persen >= 40 ? 'var(--c-warn)' : 'var(--c-err)';
                        return (
                          <tr key={p.nama}>
                            <td style={{ color: 'var(--c-t3)', textAlign: 'center' }}>{i + 1}</td>
                            <td style={{ fontWeight: 500 }}>{p.nama}</td>
                            <td style={{ textAlign: 'right', fontWeight: 600 }}>{p.total}</td>
                            <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--c-ok)' }}>{p.lunas}</td>
                            <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--c-err)' }}>{p.belum}</td>
                            <td className="no-print" style={{ paddingTop: 14 }}><ProgressBar persen={p.persen} /></td>
                            <td style={{ textAlign: 'right', fontWeight: 700 }}>
                              <span style={{ color: pc }}>{p.persen}%</span>
                            </td>
                          </tr>
                        );
                      })}
                      <tr style={{ background: 'var(--c-navy-soft)', fontWeight: 700 }}>
                        <td />
                        <td style={{ color: 'var(--c-navy)' }}>TOTAL</td>
                        <td style={{ textAlign: 'right', color: 'var(--c-navy)' }}>{stats.total}</td>
                        <td style={{ textAlign: 'right', color: 'var(--c-ok)' }}>{stats.lunas}</td>
                        <td style={{ textAlign: 'right', color: 'var(--c-err)' }}>{stats.belum}</td>
                        <td className="no-print" style={{ paddingTop: 14 }}><ProgressBar persen={stats.persen} /></td>
                        <td style={{ textAlign: 'right', fontWeight: 800, color: pColor }}>{stats.persen}%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </AppShell>
  );
}
