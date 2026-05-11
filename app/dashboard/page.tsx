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
    ? 'var(--c-ok)'
    : persen >= 50
    ? 'var(--c-warn)'
    : 'var(--c-err)';

  const progressBg = persen >= 80
    ? 'var(--c-ok-soft)'
    : persen >= 50
    ? 'var(--c-warn-soft)'
    : 'var(--c-err-soft)';

  return (
    <AppShell pageTitle="Beranda">
      {/* Page header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1
            className="font-bold"
            style={{ color: 'var(--c-t1)', fontSize: 'var(--t-xl)' }}
          >
            Beranda
          </h1>
          <p
            className="mt-0.5"
            style={{ color: 'var(--c-t3)', fontSize: 'var(--t-sm)' }}
          >
            Ringkasan data DHKP Desa Karang Sengon
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="font-medium"
            style={{ color: 'var(--c-t3)', fontSize: 'var(--t-sm)' }}
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
            background: 'var(--c-err-soft)',
            color: 'var(--c-err)',
            borderColor: 'var(--c-err)',
            fontSize: 'var(--t-sm)',
          }}
        >
          <Lock size={15} />
          Data dikunci oleh: <strong>{lock.lockedBy}</strong>
        </div>
      )}

      {loading ? (
        <>
          {/* Skeleton stat cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-5 mb-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="stat-card">
                <div className="w-9 h-9 rounded-lg skeleton mb-3" />
                <div className="w-12 h-6 rounded skeleton mb-1" />
                <div className="w-20 h-3 rounded skeleton" />
              </div>
            ))}
          </div>
          {/* Skeleton finance cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="card p-5 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg skeleton flex-shrink-0" />
                <div className="flex-1">
                  <div className="w-28 h-3 rounded skeleton mb-2" />
                  <div className="w-20 h-5 rounded skeleton" />
                </div>
              </div>
            ))}
          </div>
          {/* Skeleton progress */}
          <div className="card p-5 mb-3">
            <div className="flex justify-between mb-3">
              <div className="w-40 h-4 rounded skeleton" />
              <div className="w-10 h-4 rounded skeleton" />
            </div>
            <div className="w-full h-2.5 rounded-full skeleton" />
          </div>
          {/* Skeleton lock status */}
          <div className="card p-5">
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
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-5 mb-6">
            <StatCard icon={<Users size={22} />}
              iconBg="var(--c-navy-soft)" iconColor="var(--c-navy)"
              label="Total Objek" value={total} />
            <StatCard icon={<CheckCircle size={22} />}
              iconBg="var(--c-ok-soft)" iconColor="var(--c-ok)"
              label="Sudah Lunas" value={lunas} sub={`${persen}%`} subColor="var(--c-ok)" />
            <StatCard icon={<XCircle size={22} />}
              iconBg="var(--c-err-soft)" iconColor="var(--c-err)"
              label="Belum Lunas" value={belumLunas} />
            <StatCard icon={<TrendingUp size={22} />}
              iconBg="var(--c-navy-soft)" iconColor="var(--c-navy)"
              label="Persentase" value={`${persen}%`} />
            <StatCard icon={<LayoutGrid size={22} />}
              iconBg="var(--c-navy-soft)" iconColor="var(--c-navy)"
              label="Luas Tanah" value={luasTanah.toLocaleString('id-ID')} sub="m²" />
            <StatCard icon={<Building2 size={22} />}
              iconBg="var(--c-navy-soft)" iconColor="var(--c-navy)"
              label="Luas Bangunan" value={luasBgn.toLocaleString('id-ID')} sub="m²" />
          </div>

          {/* Finance cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-6">
            <FinCard icon={<Banknote size={20} />}
              iconBg="var(--c-navy-soft)" iconColor="var(--c-navy)"
              label="Total Pajak Terhutang" value={formatRupiah(totalPajak)} valueColor="var(--c-navy)" />
            <FinCard icon={<CheckCircle size={20} />}
              iconBg="var(--c-ok-soft)" iconColor="var(--c-ok)"
              label="Total Sudah Dibayar" value={formatRupiah(totalDibayar)} valueColor="var(--c-ok)" />
            <FinCard icon={<XCircle size={20} />}
              iconBg="var(--c-err-soft)" iconColor="var(--c-err)"
              label="Total Tunggakan" value={formatRupiah(tunggakan)} valueColor="var(--c-err)" />
          </div>

          {/* Progress bar */}
          <div className="card p-5 mb-3">
            <div className="flex items-center justify-between mb-2">
              <span
                className="font-semibold"
                style={{ color: 'var(--c-t1)', fontSize: 'var(--t-sm)' }}
              >
                Progres Pembayaran {tahun}
              </span>
              <span
                className="font-bold px-2 py-0.5 rounded-full"
                style={{
                  background: progressBg,
                  color: progressColor,
                  fontSize: 'var(--t-xs)',
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
              style={{ color: 'var(--c-t3)', fontSize: 'var(--t-xs)' }}
            >
              <span>{lunas} lunas</span>
              <span>{belumLunas} belum lunas</span>
            </div>
          </div>

          {/* Status kunci */}
          <div className="card p-5">
            <div className="flex items-center gap-3">
              {lock.isLocked
                ? <Lock size={16} style={{ color: 'var(--c-err)', flexShrink: 0 }} />
                : <Unlock size={16} style={{ color: 'var(--c-ok)', flexShrink: 0 }} />
              }
              <div className="flex-1 min-w-0">
                <p
                  className="font-semibold"
                  style={{ color: 'var(--c-t1)', fontSize: 'var(--t-sm)' }}
                >
                  Status Kunci Data
                </p>
                <p
                  className="mt-0.5"
                  style={{ color: 'var(--c-t3)', fontSize: 'var(--t-xs)' }}
                >
                  {lock.isLocked ? `Dikunci oleh ${lock.lockedBy}` : 'Data terbuka untuk diedit'}
                </p>
              </div>
              <span
                className="badge"
                style={{
                  background: lock.isLocked ? 'var(--c-err-soft)' : 'var(--c-ok-soft)',
                  color:      lock.isLocked ? 'var(--c-err)'       : 'var(--c-ok)',
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

function StatCard({ icon, iconBg, iconColor, label, value, sub, subColor }: {
  icon: React.ReactNode; iconBg: string; iconColor: string;
  label: string; value: string | number; sub?: string; subColor?: string;
}) {
  return (
    <div className="stat-card">
      <div className="stat-icon" style={{ background: iconBg, color: iconColor }}>{icon}</div>
      <div className="stat-value">{value}</div>
      {sub && (
        <div style={{ fontSize: 'var(--t-sm)', fontWeight: 600, color: subColor || 'var(--c-t3)', marginBottom: 2 }}>
          {sub}
        </div>
      )}
      <div className="stat-label">{label}</div>
    </div>
  );
}

function FinCard({ icon, iconBg, iconColor, label, value, valueColor }: {
  icon: React.ReactNode; iconBg: string; iconColor: string;
  label: string; value: string; valueColor: string;
}) {
  return (
    <div className="card p-5 flex items-center gap-3">
      <div style={{
        width: 44, height: 44, borderRadius: 'var(--r-sm)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: iconBg, color: iconColor, flexShrink: 0,
      }}>
        {icon}
      </div>
      <div className="min-w-0">
        <div style={{ color: 'var(--c-t3)', fontSize: 'var(--t-sm)', marginBottom: 2 }}>{label}</div>
        <div style={{ color: valueColor, fontSize: 'var(--t-base)', fontWeight: 700 }}>{value}</div>
      </div>
    </div>
  );
}
