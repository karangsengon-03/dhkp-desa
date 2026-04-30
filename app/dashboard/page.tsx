'use client';

import { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { useDHKP } from '@/hooks/useDHKP';
import { useGlobalLock } from '@/hooks/useGlobalLock';
import {
  Users, CheckCircle, XCircle, TrendingUp,
  Lock, Unlock, Banknote, LayoutGrid, Building2,
} from 'lucide-react';
import { formatRupiah } from '@/lib/format';

const CURRENT_YEAR = new Date().getFullYear();
const TAHUN_LIST = Array.from({ length: 5 }, (_, i) => CURRENT_YEAR - i);

export default function DashboardPage() {
  const [tahun, setTahun] = useState(CURRENT_YEAR);
  const { records, loading } = useDHKP(tahun);
  const lock = useGlobalLock();

  const total        = records.length;
  const lunas        = records.filter(r => r.statusLunas).length;
  const belumLunas   = total - lunas;
  const persen       = total > 0 ? Math.round((lunas / total) * 100) : 0;
  const totalPajak   = records.reduce((s, r) => s + r.pajakTerhutang, 0);
  const totalDibayar = records.filter(r => r.statusLunas).reduce((s, r) => s + r.pajakTerhutang, 0);
  const tunggakan    = totalPajak - totalDibayar;
  const luasTanah    = records.reduce((s, r) => s + (r.luasTanah || 0), 0);
  const luasBgn      = records.reduce((s, r) => s + (r.luasBangunan || 0), 0);

  return (
    <AppShell pageTitle="Dashboard">
      {/* Page header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <h1 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>
            Dashboard
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
            Ringkasan data DHKP Desa Karang Sengon
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>Tahun:</span>
          <select
            className="input-field"
            style={{ width: 100 }}
            value={tahun}
            onChange={e => setTahun(Number(e.target.value))}
          >
            {TAHUN_LIST.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {/* Lock banner */}
      {lock.isLocked && (
        <div
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl mb-4 text-sm font-medium"
          style={{ background: 'var(--color-danger-light)', color: 'var(--color-danger)', border: '1px solid var(--color-danger)' }}
        >
          <Lock size={15} />
          Data dikunci oleh: <strong>{lock.lockedBy}</strong>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="stat-card">
              <div className="w-9 h-9 rounded-lg skeleton" />
              <div className="w-12 h-5 rounded skeleton" />
              <div className="w-20 h-3 rounded skeleton" />
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* 6 stat cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
            <StatCard icon={<Users size={18} />} color="var(--color-primary)" bg="var(--color-primary-light)" label="Total Objek" value={total} />
            <StatCard icon={<CheckCircle size={18} />} color="var(--color-success)" bg="var(--color-success-light)" label="Sudah Lunas" value={lunas} sub={`${persen}%`} />
            <StatCard icon={<XCircle size={18} />} color="var(--color-danger)" bg="var(--color-danger-light)" label="Belum Lunas" value={belumLunas} />
            <StatCard icon={<TrendingUp size={18} />} color="var(--color-gold)" bg="var(--color-gold-light)" label="Persentase" value={`${persen}%`} />
            <StatCard icon={<LayoutGrid size={18} />} color="var(--color-primary)" bg="var(--color-primary-light)" label="Luas Tanah" value={`${luasTanah.toLocaleString('id-ID')}`} sub="m²" />
            <StatCard icon={<Building2 size={18} />} color="var(--color-gold)" bg="var(--color-gold-light)" label="Luas Bangunan" value={`${luasBgn.toLocaleString('id-ID')}`} sub="m²" />
          </div>

          {/* Finance cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            <FinCard icon={<Banknote size={17} />} color="var(--color-primary)" bg="var(--color-primary-light)" label="Total Pajak Terhutang" value={`Rp ${formatRupiah(totalPajak)}`} />
            <FinCard icon={<CheckCircle size={17} />} color="var(--color-success)" bg="var(--color-success-light)" label="Total Sudah Dibayar" value={`Rp ${formatRupiah(totalDibayar)}`} />
            <FinCard icon={<XCircle size={17} />} color="var(--color-danger)" bg="var(--color-danger-light)" label="Total Tunggakan" value={`Rp ${formatRupiah(tunggakan)}`} />
          </div>

          {/* Progress */}
          <div className="card p-4 mb-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                Progres Pembayaran {tahun}
              </span>
              <span
                className="text-xs font-bold px-2 py-0.5 rounded-full"
                style={{
                  background: persen >= 80 ? 'var(--color-success-light)' : persen >= 50 ? 'var(--color-warning-light)' : 'var(--color-danger-light)',
                  color:      persen >= 80 ? 'var(--color-success)'       : persen >= 50 ? 'var(--color-warning)'       : 'var(--color-danger)',
                }}
              >
                {persen}%
              </span>
            </div>
            <div className="w-full h-2.5 rounded-full" style={{ background: 'var(--color-border)' }}>
              <div
                className="h-2.5 rounded-full transition-all duration-700"
                style={{
                  width: `${persen}%`,
                  background: persen >= 80 ? 'var(--color-success)' : persen >= 50 ? 'var(--color-warning)' : 'var(--color-danger)',
                }}
              />
            </div>
            <div className="flex justify-between mt-1.5 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
              <span>{lunas} lunas</span>
              <span>{belumLunas} belum lunas</span>
            </div>
          </div>

          {/* Kunci status */}
          <div className="card p-4">
            <div className="flex items-center gap-3">
              {lock.isLocked
                ? <Lock size={16} style={{ color: 'var(--color-danger)' }} />
                : <Unlock size={16} style={{ color: 'var(--color-success)' }} />
              }
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                  Status Kunci Data
                </p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
                  {lock.isLocked ? `Dikunci oleh ${lock.lockedBy}` : 'Data terbuka untuk diedit'}
                </p>
              </div>
              <span
                className="badge"
                style={{
                  background: lock.isLocked ? 'var(--color-danger-light)' : 'var(--color-success-light)',
                  color:      lock.isLocked ? 'var(--color-danger)'       : 'var(--color-success)',
                }}
              >
                {lock.isLocked ? 'Terkunci' : 'Terbuka'}
              </span>
            </div>
          </div>
        </>
      )}
    </AppShell>
  );
}

function StatCard({ icon, color, bg, label, value, sub }: {
  icon: React.ReactNode; color: string; bg: string;
  label: string; value: string | number; sub?: string;
}) {
  return (
    <div className="stat-card">
      <div className="stat-icon" style={{ background: bg, color }}>{icon}</div>
      <div>
        <div className="stat-value">{value}</div>
        {sub && <div className="text-xs font-medium" style={{ color }}>{sub}</div>}
        <div className="stat-label">{label}</div>
      </div>
    </div>
  );
}

function FinCard({ icon, color, bg, label, value }: {
  icon: React.ReactNode; color: string; bg: string; label: string; value: string;
}) {
  return (
    <div className="fin-card">
      <div className="fin-card-left" style={{ background: bg, color }}>{icon}</div>
      <div className="min-w-0">
        <div className="text-xs mb-0.5" style={{ color: 'var(--color-text-secondary)' }}>{label}</div>
        <div className="text-sm font-bold truncate" style={{ color }}>{value}</div>
      </div>
    </div>
  );
}
