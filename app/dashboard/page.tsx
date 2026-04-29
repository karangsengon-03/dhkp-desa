'use client';

import { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useDHKP } from '@/hooks/useDHKP';
import { useGlobalLock } from '@/hooks/useGlobalLock';
import {
  Users, CheckCircle, XCircle, TrendingUp,
  Lock, Unlock, Banknote, LayoutGrid, Building2,
} from 'lucide-react';
import { formatRupiah } from '@/lib/format';

const CURRENT_YEAR = new Date().getFullYear();

export default function DashboardPage() {
  const [tahun, setTahun] = useState(CURRENT_YEAR);
  const { records, loading } = useDHKP(tahun);
  const lock = useGlobalLock();

  const total = records.length;
  const lunas = records.filter((r) => r.statusLunas).length;
  const belumLunas = total - lunas;
  const persenLunas = total > 0 ? Math.round((lunas / total) * 100) : 0;
  const totalPajak = records.reduce((s, r) => s + r.pajakTerhutang, 0);
  const totalDibayar = records.filter((r) => r.statusLunas).reduce((s, r) => s + r.pajakTerhutang, 0);
  const totalTunggakan = totalPajak - totalDibayar;
  const totalLuasTanah = records.reduce((s, r) => s + (r.luasTanah || 0), 0);
  const totalLuasBgn = records.reduce((s, r) => s + (r.luasBangunan || 0), 0);

  const tahunList = Array.from({ length: 5 }, (_, i) => CURRENT_YEAR - i);

  return (
    <AppShell pageTitle="Dashboard">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
            Dashboard
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
            Ringkasan data DHKP Desa Karang Sengon
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>Tahun:</label>
          <select
            className="input-field w-auto"
            value={tahun}
            onChange={(e) => setTahun(Number(e.target.value))}
          >
            {tahunList.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {/* Lock banner */}
      {lock.isLocked && (
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-xl mb-6 border"
          style={{ background: 'var(--color-danger-light)', borderColor: 'var(--color-danger)', color: 'var(--color-danger)' }}
        >
          <Lock size={18} />
          <span className="text-sm font-semibold">Data dikunci oleh: {lock.lockedBy}</span>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Baris 1: 6 stat cards sesuai blueprint */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-4">
            <StatCard label="Total Objek" value={total} icon={<Users size={20} />} color="var(--color-primary)" bg="var(--color-primary-light)" />
            <StatCard label="Sudah Lunas" value={lunas} icon={<CheckCircle size={20} />} color="var(--color-success)" bg="var(--color-success-light)" sub={`${persenLunas}%`} />
            <StatCard label="Belum Lunas" value={belumLunas} icon={<XCircle size={20} />} color="var(--color-danger)" bg="var(--color-danger-light)" />
            <StatCard label="Persentase" value={`${persenLunas}%`} icon={<TrendingUp size={20} />} color="var(--color-gold)" bg="var(--color-gold-light)" />
            <StatCard label="Luas Tanah" value={`${totalLuasTanah.toLocaleString('id-ID')} m²`} icon={<LayoutGrid size={20} />} color="var(--color-primary)" bg="var(--color-primary-light)" />
            <StatCard label="Luas Bangunan" value={`${totalLuasBgn.toLocaleString('id-ID')} m²`} icon={<Building2 size={20} />} color="var(--color-gold)" bg="var(--color-gold-light)" />
          </div>

          {/* Baris 2: Finance cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <FinCard label="Total Pajak Terhutang" value={formatRupiah(totalPajak)} color="var(--color-primary)" icon={<Banknote size={18} />} />
            <FinCard label="Total Sudah Dibayar" value={formatRupiah(totalDibayar)} color="var(--color-success)" icon={<CheckCircle size={18} />} />
            <FinCard label="Total Tunggakan" value={formatRupiah(totalTunggakan)} color="var(--color-danger)" icon={<XCircle size={18} />} />
          </div>

          {/* Progress bar */}
          <Card className="p-5 mb-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                Progres Pembayaran {tahun}
              </span>
              <Badge variant={persenLunas >= 80 ? 'success' : persenLunas >= 50 ? 'warning' : 'danger'}>
                {persenLunas}%
              </Badge>
            </div>
            <div className="w-full h-3 rounded-full" style={{ background: 'var(--color-border)' }}>
              <div
                className="h-3 rounded-full transition-all duration-500"
                style={{
                  width: `${persenLunas}%`,
                  background: persenLunas >= 80 ? 'var(--color-success)' : persenLunas >= 50 ? 'var(--color-warning)' : 'var(--color-danger)',
                }}
              />
            </div>
            <div className="flex justify-between mt-2 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
              <span>{lunas} lunas</span>
              <span>{belumLunas} belum</span>
            </div>
          </Card>

          {/* Lock status */}
          <Card className="p-4">
            <div className="flex items-center gap-3">
              {lock.isLocked
                ? <Lock size={18} style={{ color: 'var(--color-danger)' }} />
                : <Unlock size={18} style={{ color: 'var(--color-success)' }} />
              }
              <div>
                <div className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>Status Kunci Data</div>
                <div className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
                  {lock.isLocked ? `Dikunci oleh ${lock.lockedBy} — editing tidak tersedia` : 'Data terbuka untuk diedit'}
                </div>
              </div>
              <Badge variant={lock.isLocked ? 'danger' : 'success'} className="ml-auto">
                {lock.isLocked ? 'Terkunci' : 'Terbuka'}
              </Badge>
            </div>
          </Card>
        </>
      )}
    </AppShell>
  );
}

function StatCard({ label, value, icon, color, bg, sub }: {
  label: string; value: string | number; icon: React.ReactNode;
  color: string; bg: string; sub?: string;
}) {
  return (
    <Card className="p-4 flex flex-col gap-2">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: bg, color }}>
        {icon}
      </div>
      <div>
        <div className="text-xl font-bold leading-tight" style={{ color: 'var(--color-text-primary)' }}>{value}</div>
        <div className="text-xs font-medium mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>{label}</div>
        {sub && <div className="text-xs mt-0.5" style={{ color }}>{sub}</div>}
      </div>
    </Card>
  );
}

function FinCard({ label, value, color, icon }: { label: string; value: string; color: string; icon: React.ReactNode }) {
  return (
    <Card className="p-4 flex items-center gap-3">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${color}18`, color }}>
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-xs font-medium mb-0.5" style={{ color: 'var(--color-text-secondary)' }}>{label}</div>
        <div className="text-base font-bold truncate" style={{ color }}>{value}</div>
      </div>
    </Card>
  );
}
