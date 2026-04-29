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

  const total = records.length;
  const jumlahLunas = records.filter((r) => r.statusLunas).length;
  const jumlahBelum = total - jumlahLunas;

  const filtered = useMemo(() => {
    let result = records;
    if (filterStatus === 'lunas') result = result.filter((r) => r.statusLunas);
    if (filterStatus === 'belum') result = result.filter((r) => !r.statusLunas);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (r) =>
          r.namaWajibPajak.toLowerCase().includes(q) ||
          r.nop.toLowerCase().includes(q) ||
          r.nomorInduk.toLowerCase().includes(q)
      );
    }
    return result;
  }, [records, filterStatus, search]);

  // Reset ke halaman 1 saat filter/search berubah
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);

  const pageRecords = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, safePage]);

  // Total pajak untuk halaman ini dan total keseluruhan
  const totalPajakPage = pageRecords.reduce((s, r) => s + r.pajakTerhutang, 0);
  const totalPajakAll = filtered.reduce((s, r) => s + r.pajakTerhutang, 0);

  const maxNomor = records.length > 0 ? Math.max(...records.map((r) => r.nomor || 0)) : 0;
  const currentUser = user?.email ?? 'Unknown';

  function handleFilterChange(f: FilterStatus) {
    setFilterStatus(f);
    setCurrentPage(1);
  }

  function handleSearchChange(v: string) {
    setSearch(v);
    setCurrentPage(1);
  }

  function handleTahunChange(y: number) {
    setTahun(y);
    setCurrentPage(1);
  }

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
      {/* Page Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
            Data DHKP
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
            Daftar Himpunan Ketetapan Pajak &amp; Pembayaran — Tahun {tahun}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
              Tahun:
            </label>
            <select
              className="input-field w-auto"
              value={tahun}
              onChange={(e) => handleTahunChange(Number(e.target.value))}
            >
              {TAHUN_LIST.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
          <Button variant="primary" size="sm" onClick={handleOpenAdd} disabled={isLocked}>
            <Plus size={15} /> Tambah Record
          </Button>
        </div>
      </div>

      {/* Lock Banner */}
      <LockBanner lock={lock} />

      {/* Badge Counters / Filter */}
      <div className="flex flex-wrap gap-2 mb-4">
        <CountBadge
          label="Total" value={total}
          icon={<Users size={13} />}
          color="var(--color-primary)" bg="var(--color-primary-light)"
          active={filterStatus === 'semua'} onClick={() => handleFilterChange('semua')}
        />
        <CountBadge
          label="Lunas" value={jumlahLunas}
          icon={<CheckCircle size={13} />}
          color="var(--color-success)" bg="var(--color-success-light)"
          active={filterStatus === 'lunas'} onClick={() => handleFilterChange('lunas')}
        />
        <CountBadge
          label="Belum Lunas" value={jumlahBelum}
          icon={<XCircle size={13} />}
          color="var(--color-danger)" bg="var(--color-danger-light)"
          active={filterStatus === 'belum'} onClick={() => handleFilterChange('belum')}
        />
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ color: 'var(--color-text-disabled)' }}
        />
        <input
          className="input-field pl-9"
          placeholder="Cari nama wajib pajak, NOP, atau nomor induk…"
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
        </div>
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
        <div className="flex items-center justify-between mt-4">
          <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
            Halaman {safePage} dari {totalPages} &bull; {filtered.length} record
          </p>
          <div className="flex items-center gap-1">
            <PaginBtn
              onClick={() => setCurrentPage(1)}
              disabled={safePage === 1}
              label="«"
            />
            <PaginBtn
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1}
              label={<ChevronLeft size={14} />}
            />
            {/* halaman sekitar current */}
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - safePage) <= 2)
              .reduce<(number | '...')[]>((acc, p, i, arr) => {
                if (i > 0 && (p as number) - (arr[i - 1] as number) > 1) acc.push('...');
                acc.push(p);
                return acc;
              }, [])
              .map((p, i) =>
                p === '...' ? (
                  <span key={`e${i}`} className="px-2 text-xs" style={{ color: 'var(--color-text-disabled)' }}>…</span>
                ) : (
                  <PaginBtn
                    key={p}
                    onClick={() => setCurrentPage(p as number)}
                    active={safePage === p}
                    label={String(p)}
                  />
                )
              )}
            <PaginBtn
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              label={<ChevronRight size={14} />}
            />
            <PaginBtn
              onClick={() => setCurrentPage(totalPages)}
              disabled={safePage === totalPages}
              label="»"
            />
          </div>
        </div>
      )}

      {/* Footer satu halaman */}
      {!loading && totalPages <= 1 && filtered.length > 0 && (
        <p className="text-xs mt-3 text-right" style={{ color: 'var(--color-text-disabled)' }}>
          Menampilkan {filtered.length} dari {total} record
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

function CountBadge({ label, value, icon, color, bg, active, onClick }: {
  label: string; value: number; icon: React.ReactNode;
  color: string; bg: string; active: boolean; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all"
      style={{ background: active ? color : bg, color: active ? '#fff' : color, borderColor: color }}
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
      className="w-7 h-7 rounded flex items-center justify-center text-xs font-semibold transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
      style={{
        background: active ? 'var(--color-primary)' : 'var(--color-surface-2)',
        color: active ? '#fff' : 'var(--color-text-primary)',
        border: `1px solid ${active ? 'var(--color-primary)' : 'var(--color-border)'}`,
      }}
    >
      {label}
    </button>
  );
}
