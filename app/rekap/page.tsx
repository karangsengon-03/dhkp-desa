'use client';

import { useState, useMemo, useEffect } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { Card } from '@/components/ui/Card';
import { LockBanner } from '@/components/dhkp/LockBanner';
import { PrintRekapHeader } from '@/components/print/PrintRekapHeader';
import { PrintDHKP } from '@/components/print/PrintDHKP';
import { useGlobalLock } from '@/hooks/useGlobalLock';
import { getDHKP, getAppInfo } from '@/lib/firestore';
import { DHKPRecord, AppInfo } from '@/types';
import { formatRupiah } from '@/lib/format';
import {
  Users, CheckCircle, XCircle, Banknote, TrendingUp,
  AlertCircle, Printer, RefreshCw, BarChart3
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 5 }, (_, i) => CURRENT_YEAR - i);

interface PetugasRekap {
  nama: string;
  total: number;
  lunas: number;
  belum: number;
  persen: number;
}

function StatCard({
  icon, label, value, sub, color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  color: string;
}) {
  return (
    <div className="card p-5 flex items-start gap-4" style={{ borderTop: `4px solid ${color}` }}>
      <div className="rounded-xl p-3 flex-shrink-0" style={{ background: `${color}18` }}>
        <span style={{ color }}>{icon}</span>
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>{label}</p>
        <p className="text-xl font-bold leading-tight" style={{ color: 'var(--color-text-primary)' }}>{value}</p>
        {sub && <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>{sub}</p>}
      </div>
    </div>
  );
}

function ProgressBar({ persen }: { persen: number }) {
  const color = persen >= 75 ? 'var(--color-success)' : persen >= 40 ? 'var(--color-gold)' : 'var(--color-danger)';
  return (
    <div className="w-full rounded-full overflow-hidden" style={{ height: 8, background: 'var(--color-border)' }}>
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

  useEffect(() => {
    setLoading(true);
    Promise.all([getDHKP(tahun), getAppInfo()]).then(([recs, info]) => {
      setRecords(recs);
      setAppInfo(info);
      setLoading(false);
    });
  }, [tahun]);

  const stats = useMemo(() => {
    const total = records.length;
    const lunas = records.filter((r) => r.statusLunas).length;
    const belum = total - lunas;
    const persen = total > 0 ? Math.round((lunas / total) * 100) : 0;
    const totalPajak = records.reduce((s, r) => s + (r.pajakTerhutang || 0), 0);
    const totalBayar = records.filter((r) => r.statusLunas).reduce((s, r) => s + (r.pajakTerhutang || 0), 0);
    return { total, lunas, belum, persen, totalPajak, totalBayar, totalTunggakan: totalPajak - totalBayar };
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
      .map(([nama, v]) => ({ nama, total: v.total, lunas: v.lunas, belum: v.total - v.lunas, persen: v.total > 0 ? Math.round((v.lunas / v.total) * 100) : 0 }))
      .sort((a, b) => b.total - a.total);
  }, [records]);

  return (
    <AppShell pageTitle="Rekap & Statistik">
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; color: black !important; }
          .card { box-shadow: none !important; border: 1px solid #ddd !important; break-inside: avoid; }
          .dhkp-table thead tr { background: #1E3A5F !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      `}</style>

      <LockBanner lock={lock} />

      {/* Toolbar */}
      <div className="no-print flex items-center justify-between gap-4 mb-5 flex-wrap">
        <div className="flex items-center gap-3">
          <label className="text-sm font-semibold" style={{ color: 'var(--color-text-secondary)' }}>Tahun:</label>
          <select className="input-field" style={{ width: 120 }} value={tahun} onChange={(e) => setTahun(Number(e.target.value))}>
            {YEAR_OPTIONS.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
          {loading && <RefreshCw size={16} className="animate-spin" style={{ color: 'var(--color-primary)' }} />}
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => window.print()} disabled={loading}>
            <Printer size={15} /> Cetak Rekap
          </Button>
          <Button variant="primary" size="sm" onClick={() => window.print()} disabled={loading}>
            <Printer size={15} /> Cetak Data DHKP
          </Button>
        </div>

      {/* Print Header */}
      <PrintRekapHeader appInfo={appInfo} tahun={tahun} />
      <PrintDHKP records={records} appInfo={appInfo} tahun={tahun} />

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <RefreshCw size={32} className="animate-spin" style={{ color: 'var(--color-primary)' }} />
        </div>
      ) : records.length === 0 ? (
        <Card className="p-12 flex flex-col items-center gap-3 text-center">
          <BarChart3 size={48} style={{ color: 'var(--color-text-disabled)' }} />
          <p className="font-semibold" style={{ color: 'var(--color-text-secondary)' }}>Tidak ada data untuk tahun {tahun}</p>
        </Card>
      ) : (
        <>
          {/* Stat Cards WP */}
          <div className="grid gap-4 mb-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
            <StatCard icon={<Users size={22} />} label="Total Wajib Pajak" value={stats.total.toLocaleString('id-ID')} sub={`Tahun ${tahun}`} color="var(--color-primary)" />
            <StatCard icon={<CheckCircle size={22} />} label="Sudah Lunas" value={stats.lunas.toLocaleString('id-ID')} sub={`${stats.persen}% dari total WP`} color="var(--color-success)" />
            <StatCard icon={<XCircle size={22} />} label="Belum Lunas" value={stats.belum.toLocaleString('id-ID')} sub={`${100 - stats.persen}% dari total WP`} color="var(--color-danger)" />
            <StatCard icon={<TrendingUp size={22} />} label="Persentase Lunas" value={`${stats.persen}%`} sub={stats.persen >= 75 ? 'Target tercapai ✓' : 'Belum mencapai target'} color={stats.persen >= 75 ? 'var(--color-success)' : 'var(--color-gold)'} />
          </div>

          {/* Progress Bar */}
          <Card className="p-5 mb-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>Progress Pelunasan Tahun {tahun}</p>
              <span className="text-sm font-bold" style={{ color: stats.persen >= 75 ? 'var(--color-success)' : 'var(--color-gold)' }}>{stats.persen}%</span>
            </div>
            <ProgressBar persen={stats.persen} />
            <div className="flex justify-between mt-2 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
              <span>0%</span><span>Target: 100%</span>
            </div>
          </Card>

          {/* Kartu Finansial */}
          <div className="grid gap-4 mb-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
            <StatCard icon={<Banknote size={22} />} label="Total Pajak Terhutang" value={formatRupiah(stats.totalPajak)} color="var(--color-primary)" />
            <StatCard icon={<CheckCircle size={22} />} label="Total Sudah Dibayar" value={formatRupiah(stats.totalBayar)} sub={`${stats.persen}% dari total pajak`} color="var(--color-success)" />
            <StatCard icon={<AlertCircle size={22} />} label="Total Tunggakan" value={formatRupiah(stats.totalTunggakan)} sub={stats.totalTunggakan === 0 ? 'Semua lunas 🎉' : 'Masih perlu ditagih'} color="var(--color-danger)" />
          </div>

          {/* Tabel per Petugas */}
          <Card className="p-0 overflow-hidden">
            <div className="px-5 py-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
              <h3 className="text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>Rekap per Petugas</h3>
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
                    <th style={{ width: 160 }}>Progress</th>
                    <th style={{ textAlign: 'right', width: 80 }}>%</th>
                  </tr>
                </thead>
                <tbody>
                  {petugasList.map((p, i) => (
                    <tr key={p.nama}>
                      <td style={{ color: 'var(--color-text-secondary)', textAlign: 'center' }}>{i + 1}</td>
                      <td className="font-medium">{p.nama}</td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>{p.total}</td>
                      <td style={{ textAlign: 'right', color: 'var(--color-success)', fontWeight: 600 }}>{p.lunas}</td>
                      <td style={{ textAlign: 'right', color: 'var(--color-danger)', fontWeight: 600 }}>{p.belum}</td>
                      <td style={{ paddingTop: 14 }}><ProgressBar persen={p.persen} /></td>
                      <td style={{ textAlign: 'right', fontWeight: 700 }}>
                        <span style={{ color: p.persen >= 75 ? 'var(--color-success)' : p.persen >= 40 ? 'var(--color-gold)' : 'var(--color-danger)' }}>{p.persen}%</span>
                      </td>
                    </tr>
                  ))}
                  <tr style={{ background: 'var(--color-primary-light)', fontWeight: 700 }}>
                    <td /><td style={{ fontWeight: 700 }}>TOTAL</td>
                    <td style={{ textAlign: 'right', fontWeight: 700 }}>{stats.total}</td>
                    <td style={{ textAlign: 'right', color: 'var(--color-success)', fontWeight: 700 }}>{stats.lunas}</td>
                    <td style={{ textAlign: 'right', color: 'var(--color-danger)', fontWeight: 700 }}>{stats.belum}</td>
                    <td style={{ paddingTop: 14 }}><ProgressBar persen={stats.persen} /></td>
                    <td style={{ textAlign: 'right', fontWeight: 800, color: stats.persen >= 75 ? 'var(--color-success)' : 'var(--color-gold)' }}>{stats.persen}%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </AppShell>
  );
}
