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

  const progressColor = persen >= 80
    ? 'var(--c-success)'
    : persen >= 50
    ? 'var(--c-warning)'
    : 'var(--c-danger)';

  const progressBg = persen >= 80
    ? 'var(--c-success-light)'
    : persen >= 50
    ? 'var(--c-warning-light)'
    : 'var(--c-danger-light)';

  return (
    <AppShell pageTitle="Beranda">
      {/* Page header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <h1
            className="font-bold"
            style={{ color: 'var(--c-text-1)', fontSize: 'var(--text-xl)' }}
          >
            Beranda
          </h1>
          <p
            className="mt-0.5"
            style={{ color: 'var(--c-text-3)', fontSize: 'var(--text-sm)' }}
          >
            Ringkasan data DHKP Desa Karang Sengon
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="font-medium"
            style={{ color: 'var(--c-text-3)', fontSize: 'var(--text-sm)' }}
          >
            Tahun:
          </span>
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
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg mb-4 font-medium border"
          style={{
            background: 'var(--c-danger-light)',
            color: 'var(--c-danger)',
            borderColor: 'var(--c-danger)',
            fontSize: 'var(--text-sm)',
          }}
        >
          <Lock size={15} />
          Data dikunci oleh: <strong>{lock.lockedBy}</strong>
        </div>
      )}

      {loading ? (
        <>
          {/* Skeleton stat cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="stat-card">
                <div className="w-9 h-9 rounded-lg skeleton mb-3" />
                <div className="w-12 h-6 rounded skeleton mb-1" />
                <div className="w-20 h-3 rounded skeleton" />
              </div>
            ))}
          </div>
          {/* Skeleton finance cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="card p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg skeleton flex-shrink-0" />
                <div className="flex-1">
                  <div className="w-28 h-3 rounded skeleton mb-2" />
                  <div className="w-20 h-5 rounded skeleton" />
                </div>
              </div>
            ))}
          </div>
          {/* Skeleton progress */}
          <div className="card p-4 mb-3">
            <div className="flex justify-between mb-3">
              <div className="w-40 h-4 rounded skeleton" />
              <div className="w-10 h-4 rounded skeleton" />
            </div>
            <div className="w-full h-2.5 rounded-full skeleton" />
          </div>
          {/* Skeleton lock status */}
          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded skeleton flex-shrink-0" />
              <div className="flex-1">
                <div className="w-32 h-4 rounded skeleton mb-1" />
                <div className="w-48 h-3 rounded skeleton" />
              </div>
              <div className="w-16 h-5 rounded skeleton" />
            </div>
          </div>
        </>
      ) : (
        <>
          {/* 6 stat cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
            <StatCard
              icon={<Users size={22} />}
              color="var(--c-navy)" bg="var(--c-navy-light)"
              label="Total Objek" value={total}
            />
            <StatCard
              icon={<CheckCircle size={22} />}
              color="var(--c-success)" bg="var(--c-success-light)"
              label="Sudah Lunas" value={lunas} sub={`${persen}%`}
            />
            <StatCard
              icon={<XCircle size={22} />}
              color="var(--c-danger)" bg="var(--c-danger-light)"
              label="Belum Lunas" value={belumLunas}
            />
            <StatCard
              icon={<TrendingUp size={22} />}
              color="var(--c-warning)" bg="var(--c-warning-light)"
              label="Persentase" value={`${persen}%`}
            />
            <StatCard
              icon={<LayoutGrid size={22} />}
              color="var(--c-navy)" bg="var(--c-navy-light)"
              label="Luas Tanah" value={luasTanah.toLocaleString('id-ID')} sub="m²"
            />
            <StatCard
              icon={<Building2 size={22} />}
              color="var(--c-navy)" bg="var(--c-navy-light)"
              label="Luas Bangunan" value={luasBgn.toLocaleString('id-ID')} sub="m²"
            />
          </div>

          {/* Finance cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            <FinCard
              icon={<Banknote size={20} />}
              color="var(--c-navy)" bg="var(--c-navy-light)"
              label="Total Pajak Terhutang"
              value={formatRupiah(totalPajak)}
            />
            <FinCard
              icon={<CheckCircle size={20} />}
              color="var(--c-success)" bg="var(--c-success-light)"
              label="Total Sudah Dibayar"
              value={formatRupiah(totalDibayar)}
            />
            <FinCard
              icon={<XCircle size={20} />}
              color="var(--c-danger)" bg="var(--c-danger-light)"
              label="Total Tunggakan"
              value={formatRupiah(tunggakan)}
            />
          </div>

          {/* Progress bar */}
          <div className="card p-4 mb-3">
            <div className="flex items-center justify-between mb-2">
              <span
                className="font-semibold"
                style={{ color: 'var(--c-text-1)', fontSize: 'var(--text-sm)' }}
              >
                Progres Pembayaran {tahun}
              </span>
              <span
                className="font-bold px-2 py-0.5 rounded-full"
                style={{
                  background: progressBg,
                  color: progressColor,
                  fontSize: 'var(--text-xs)',
                }}
              >
                {persen}%
              </span>
            </div>
            <div
              className="w-full h-2.5 rounded-full overflow-hidden"
              style={{ background: 'var(--c-border)' }}
            >
              <div
                className="h-2.5 rounded-full transition-all duration-700"
                style={{ width: `${persen}%`, background: progressColor }}
              />
            </div>
            <div
              className="flex justify-between mt-1.5"
              style={{ color: 'var(--c-text-3)', fontSize: 'var(--text-xs)' }}
            >
              <span>{lunas} lunas</span>
              <span>{belumLunas} belum lunas</span>
            </div>
          </div>

          {/* Status kunci */}
          <div className="card p-4">
            <div className="flex items-center gap-3">
              {lock.isLocked
                ? <Lock size={16} style={{ color: 'var(--c-danger)', flexShrink: 0 }} />
                : <Unlock size={16} style={{ color: 'var(--c-success)', flexShrink: 0 }} />
              }
              <div className="flex-1 min-w-0">
                <p
                  className="font-semibold"
                  style={{ color: 'var(--c-text-1)', fontSize: 'var(--text-sm)' }}
                >
                  Status Kunci Data
                </p>
                <p
                  className="mt-0.5"
                  style={{ color: 'var(--c-text-3)', fontSize: 'var(--text-xs)' }}
                >
                  {lock.isLocked ? `Dikunci oleh ${lock.lockedBy}` : 'Data terbuka untuk diedit'}
                </p>
              </div>
              <span
                className="badge"
                style={{
                  background: lock.isLocked ? 'var(--c-danger-light)' : 'var(--c-success-light)',
                  color:      lock.isLocked ? 'var(--c-danger)'       : 'var(--c-success)',
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
      <div className="stat-value">{value}</div>
      {sub && (
        <div
          className="font-semibold mb-0.5"
          style={{ color, fontSize: 'var(--text-xs)' }}
        >
          {sub}
        </div>
      )}
      <div className="stat-label">{label}</div>
    </div>
  );
}

function FinCard({ icon, color, bg, label, value }: {
  icon: React.ReactNode; color: string; bg: string; label: string; value: string;
}) {
  return (
    <div className="card p-4 flex items-center gap-3">
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: bg, color }}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <div style={{ color: 'var(--c-text-3)', fontSize: 'var(--text-xs)' }} className="mb-0.5">
          {label}
        </div>
        <div
          className="font-bold truncate"
          style={{ color, fontSize: 'var(--text-sm)' }}
        >
          {value}
        </div>
      </div>
    </div>
  );
}
