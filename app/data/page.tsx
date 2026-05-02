'use client';

import { useState, useMemo } from 'react';
import { Plus, Search, Users, CheckCircle, XCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/Button';
import { useDHKP } from '@/hooks/useDHKP';
import { useGlobalLock } from '@/hooks/useGlobalLock';
import { useAuth } from '@/hooks/useAuth';
import { deleteRecord } from '@/lib/firestore';
import { DHKPRecord } from '@/types';
import { LockBanner } from '@/components/dhkp/LockBanner';
import { RecordTable } from '@/components/dhkp/RecordTable';
import { RecordModal } from '@/components/dhkp/RecordModal';
import { DeleteConfirmModal } from '@/components/dhkp/DeleteConfirmModal';
import { useToast } from '@/components/ui/Toast';

const CURRENT_YEAR = new Date().getFullYear();
const TAHUN_LIST = Array.from({ length: 5 }, (_, i) => CURRENT_YEAR - i);
const PAGE_SIZE = 20;

type FilterStatus = 'semua' | 'lunas' | 'belum';

export default function DataPage() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [tahun, setTahun] = useState(CURRENT_YEAR);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('semua');
  const [currentPage, setCurrentPage] = useState(1);

  const [modalOpen, setModalOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<DHKPRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DHKPRecord | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const { records, loading } = useDHKP(tahun);
  const lock = useGlobalLock();
  const isLocked = lock.isLocked;

  const total        = records.length;
  const jumlahLunas  = records.filter(r => r.statusLunas).length;
  const jumlahBelum  = total - jumlahLunas;

  const filtered = useMemo(() => {
    let result = records;
    if (filterStatus === 'lunas') result = result.filter(r => r.statusLunas);
    if (filterStatus === 'belum') result = result.filter(r => !r.statusLunas);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(r =>
        r.namaWajibPajak.toLowerCase().includes(q) ||
        r.nop.toLowerCase().includes(q) ||
        r.nomorInduk.toLowerCase().includes(q)
      );
    }
    return result;
  }, [records, filterStatus, search]);

  const totalPages  = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage    = Math.min(currentPage, totalPages);

  const pageRecords = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, safePage]);

  const totalPajakPage = pageRecords.reduce((s, r) => s + r.pajakTerhutang, 0);
  const totalPajakAll  = filtered.reduce((s, r) => s + r.pajakTerhutang, 0);

  const maxNomor    = records.length > 0 ? Math.max(...records.map(r => r.nomor || 0)) : 0;
  const currentUser = user?.email ?? 'Unknown';

  function handleFilterChange(f: FilterStatus) { setFilterStatus(f); setCurrentPage(1); }
  function handleSearchChange(v: string) { setSearch(v); setCurrentPage(1); }
  function handleTahunChange(y: number) { setTahun(y); setCurrentPage(1); }

  function handleOpenAdd() { setEditRecord(null); setModalOpen(true); }
  function handleOpenEdit(r: DHKPRecord) { setEditRecord(r); setModalOpen(true); }
  function handleOpenDelete(r: DHKPRecord) { setDeleteTarget(r); }

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deleteRecord(tahun, deleteTarget.id);
      showToast('Record berhasil dihapus', 'success');
      setDeleteTarget(null);
    } catch {
      showToast('Gagal menghapus record', 'danger');
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <AppShell pageTitle="Data DHKP">
      {/* Page header */}
      <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
        <div>
          <h1
            className="font-bold"
            style={{ color: 'var(--c-text-1)', fontSize: 'var(--text-xl)' }}
          >
            Data DHKP
          </h1>
          <p
            className="mt-0.5"
            style={{ color: 'var(--c-text-3)', fontSize: 'var(--text-sm)' }}
          >
            Daftar Himpunan Ketetapan Pajak &amp; Pembayaran — Tahun {tahun}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <label
              className="font-medium"
              style={{ color: 'var(--c-text-3)', fontSize: 'var(--text-sm)' }}
            >
              Tahun:
            </label>
            <select
              className="input-field w-auto"
              value={tahun}
              onChange={e => handleTahunChange(Number(e.target.value))}
            >
              {TAHUN_LIST.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <Button variant="primary" size="sm" onClick={handleOpenAdd} disabled={isLocked}>
            <Plus size={15} /> Tambah Record
          </Button>
        </div>
      </div>

      {/* Lock Banner */}
      <LockBanner lock={lock} />

      {/* Badge filter */}
      <div className="flex flex-wrap gap-2 mb-4">
        <FilterBadge
          label="Semua" value={total}
          icon={<Users size={13} />}
          color="var(--c-navy)" bg="var(--c-navy-light)"
          active={filterStatus === 'semua'} onClick={() => handleFilterChange('semua')}
        />
        <FilterBadge
          label="Lunas" value={jumlahLunas}
          icon={<CheckCircle size={13} />}
          color="var(--c-success)" bg="var(--c-success-light)"
          active={filterStatus === 'lunas'} onClick={() => handleFilterChange('lunas')}
        />
        <FilterBadge
          label="Belum Lunas" value={jumlahBelum}
          icon={<XCircle size={13} />}
          color="var(--c-danger)" bg="var(--c-danger-light)"
          active={filterStatus === 'belum'} onClick={() => handleFilterChange('belum')}
        />
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search
          size={15}
          className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ color: 'var(--c-text-4)' }}
        />
        <input
          className="input-field pl-9"
          placeholder="Cari nama wajib pajak, NOP, atau nomor induk…"
          value={search}
          onChange={e => handleSearchChange(e.target.value)}
        />
      </div>

      {/* Table atau skeleton */}
      {loading ? (
        <TableSkeleton />
      ) : filtered.length === 0 ? (
        <EmptyState tahun={tahun} isLocked={isLocked} onAdd={handleOpenAdd} />
      ) : (
        <RecordTable
          records={pageRecords}
          allRecords={filtered}
          tahun={tahun}
          lock={lock}
          currentUser={currentUser}
          onEdit={handleOpenEdit}
          onDelete={handleOpenDelete}
          currentPage={safePage}
          pageSize={PAGE_SIZE}
          totalPajakPage={totalPajakPage}
          totalPajakAll={totalPajakAll}
        />
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 flex-wrap gap-2">
          <p style={{ color: 'var(--c-text-3)', fontSize: 'var(--text-xs)' }}>
            Halaman {safePage} dari {totalPages} &bull; {filtered.length} record
          </p>
          <div className="flex items-center gap-1 flex-wrap">
            <PaginBtn onClick={() => setCurrentPage(1)} disabled={safePage === 1} label="«" />
            <PaginBtn onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={safePage === 1} label={<ChevronLeft size={14} />} />
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(p => p === 1 || p === totalPages || Math.abs(p - safePage) <= 2)
              .reduce<(number | '...')[]>((acc, p, i, arr) => {
                if (i > 0 && (p as number) - (arr[i - 1] as number) > 1) acc.push('...');
                acc.push(p);
                return acc;
              }, [])
              .map((p, i) =>
                p === '...' ? (
                  <span key={`e${i}`} className="px-2" style={{ color: 'var(--c-text-4)', fontSize: 'var(--text-xs)' }}>…</span>
                ) : (
                  <PaginBtn
                    key={p}
                    onClick={() => setCurrentPage(p as number)}
                    active={safePage === p}
                    label={String(p)}
                  />
                )
              )}
            <PaginBtn onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={safePage === totalPages} label={<ChevronRight size={14} />} />
            <PaginBtn onClick={() => setCurrentPage(totalPages)} disabled={safePage === totalPages} label="»" />
          </div>
        </div>
      )}

      {!loading && totalPages <= 1 && filtered.length > 0 && (
        <p className="mt-3 text-right" style={{ color: 'var(--c-text-4)', fontSize: 'var(--text-xs)' }}>
          {filtered.length} record
        </p>
      )}

      {/* Modals */}
      <RecordModal
        open={modalOpen}
        tahun={tahun}
        editRecord={editRecord}
        maxNomor={maxNomor}
        currentUser={currentUser}
        onClose={() => setModalOpen(false)}
        onSaved={() => {}}
      />
      <DeleteConfirmModal
        open={deleteTarget !== null}
        namaWajibPajak={deleteTarget?.namaWajibPajak ?? ''}
        loading={deleteLoading}
        onConfirm={handleConfirmDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </AppShell>
  );
}

/* ── Sub-components ─────────────────────────────────────────────── */

function FilterBadge({ label, value, icon, color, bg, active, onClick }: {
  label: string; value: number; icon: React.ReactNode;
  color: string; bg: string; active: boolean; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full font-semibold border transition-all"
      style={{
        background: active ? color : bg,
        color: active ? 'var(--c-text-inv)' : color,
        borderColor: color,
        fontSize: 'var(--text-xs)',
        minHeight: 32,
      }}
    >
      {icon}{label}: {value}
    </button>
  );
}

function PaginBtn({ onClick, disabled, active, label }: {
  onClick: () => void; disabled?: boolean; active?: boolean; label: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-7 h-7 rounded flex items-center justify-center font-semibold transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
      style={{
        background: active ? 'var(--c-navy)' : 'var(--c-surface-2)',
        color: active ? 'var(--c-text-inv)' : 'var(--c-text-1)',
        border: `1px solid ${active ? 'var(--c-navy)' : 'var(--c-border)'}`,
        fontSize: 'var(--text-xs)',
      }}
    >
      {label}
    </button>
  );
}

function TableSkeleton() {
  return (
    <div className="card overflow-hidden">
      {/* header row */}
      <div
        className="flex gap-3 px-4 py-3"
        style={{ background: 'var(--c-navy)' }}
      >
        {[40, 100, 80, 160, 120, 90, 70, 60, 80, 70, 60, 80, 60].map((w, i) => (
          <div key={i} className="h-3 rounded skeleton flex-shrink-0" style={{ width: w, opacity: 0.3 }} />
        ))}
      </div>
      {/* body rows */}
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="flex gap-3 px-4 py-3 border-b"
          style={{
            borderColor: 'var(--c-border)',
            background: i % 2 === 0 ? 'var(--c-surface)' : 'var(--c-surface-2)',
          }}
        >
          {[40, 100, 80, 160, 120, 90, 70, 60, 80, 70, 60, 80, 60].map((w, j) => (
            <div key={j} className="h-3 rounded skeleton flex-shrink-0" style={{ width: w }} />
          ))}
        </div>
      ))}
    </div>
  );
}

function EmptyState({ tahun, isLocked, onAdd }: {
  tahun: number; isLocked: boolean; onAdd: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center"
        style={{ background: 'var(--c-navy-light)', color: 'var(--c-navy)' }}
      >
        <Users size={28} />
      </div>
      <div className="text-center">
        <p className="font-semibold" style={{ color: 'var(--c-text-1)', fontSize: 'var(--text-base)' }}>
          Belum ada data
        </p>
        <p className="mt-1" style={{ color: 'var(--c-text-3)', fontSize: 'var(--text-sm)' }}>
          Belum ada data DHKP untuk tahun {tahun}.
        </p>
      </div>
      {!isLocked && (
        <Button variant="primary" size="sm" onClick={onAdd}>
          <Plus size={15} /> Tambah Record Pertama
        </Button>
      )}
    </div>
  );
}
