'use client';

import { useState } from 'react';
import { Pencil, Trash2, FileX, Eye, EyeOff } from 'lucide-react';
import { DHKPRecord, GlobalLock } from '@/types';
import { Toggle } from '@/components/ui/Toggle';
import { formatRupiah, formatTanggal, todayISO } from '@/lib/format';
import { maskNOP, maskNomorInduk } from '@/lib/masking';
import { updateRecord } from '@/lib/firestore';
import { logChange } from '@/lib/changelog';
import { useToast } from '@/components/ui/Toast';

interface RecordTableProps {
  records: DHKPRecord[];
  allRecords: DHKPRecord[];
  tahun: number;
  lock: GlobalLock;
  currentUser: string;
  onEdit: (record: DHKPRecord) => void;
  onDelete: (record: DHKPRecord) => void;
  currentPage: number;
  pageSize: number;
  totalPajakPage: number;
  totalPajakAll: number;
}

export function RecordTable({
  records, allRecords, tahun, lock, currentUser,
  onEdit, onDelete, currentPage, pageSize, totalPajakPage, totalPajakAll,
}: RecordTableProps) {
  const { showToast } = useToast();
  const isLocked = lock.isLocked;
  const [revealedIds, setRevealedIds] = useState<Set<string>>(new Set());

  function toggleReveal(id: string) {
    setRevealedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  async function handleToggleLunas(record: DHKPRecord, checked: boolean) {
    if (isLocked) return;
    try {
      const tanggalBayar = checked ? todayISO() : '';
      await updateRecord(tahun, record.id, { statusLunas: checked, tanggalBayar });
      await logChange(record.id, tahun, record.namaWajibPajak, currentUser, 'Status Lunas', record.statusLunas, checked);
      if (checked) {
        await logChange(record.id, tahun, record.namaWajibPajak, currentUser, 'Tanggal Bayar', record.tanggalBayar ?? '', tanggalBayar);
      }
      showToast(checked ? `${record.namaWajibPajak} ditandai lunas` : `${record.namaWajibPajak} ditandai belum lunas`, 'success');
    } catch {
      showToast('Gagal memperbarui status', 'danger');
    }
  }

  if (records.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: 'var(--c-navy-soft)', color: 'var(--c-navy)' }}>
          <FileX size={28} />
        </div>
        <div className="text-center">
          <p className="font-semibold" style={{ color: 'var(--c-t1)', fontSize: 'var(--t-base)' }}>Tidak ada hasil</p>
          <p className="mt-1" style={{ color: 'var(--c-t3)', fontSize: 'var(--t-sm)' }}>Coba ubah filter atau kata kunci pencarian.</p>
        </div>
      </div>
    );
  }

  const startIdx = (currentPage - 1) * pageSize;
  void allRecords;

  return (
    <div className="table-wrapper">
      <table className="dhkp-table">
        <thead>
          <tr>
            <th className="col-sticky-left text-center" style={{ width: 48, minWidth: 48 }}>No</th>
            <th style={{ minWidth: 160 }}>NOP</th>
            <th style={{ minWidth: 130 }}>No. Induk</th>
            <th style={{ minWidth: 200 }}>Nama Wajib Pajak</th>
            <th style={{ minWidth: 180 }}>Alamat Objek</th>
            <th className="col-number" style={{ minWidth: 150 }}>Pajak Terhutang</th>
            <th className="col-number" style={{ minWidth: 120 }}>Perubahan</th>
            <th className="text-center" style={{ minWidth: 72 }}>Lunas</th>
            <th style={{ minWidth: 120 }}>Tgl Bayar</th>
            <th className="col-number" style={{ minWidth: 110 }}>Luas Tanah</th>
            <th className="col-number" style={{ minWidth: 110 }}>Luas Bgn</th>
            <th style={{ minWidth: 110 }}>Dikelola</th>
            <th className="col-sticky-right text-center" style={{ width: 104, minWidth: 104 }}>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {records.map((record, idx) => {
            const isRevealed = revealedIds.has(record.id);
            return (
              <tr key={record.id} className={record.statusLunas ? 'row-lunas' : ''}>

                <td className="col-sticky-left text-center font-medium" style={{ color: 'var(--c-t3)', fontSize: 'var(--t-sm)' }}>
                  {startIdx + idx + 1}
                </td>

                <td style={{ fontSize: 'var(--t-sm)', fontFamily: 'monospace' }}>
                  <div className="flex items-center gap-1.5">
                    <span style={{ whiteSpace: 'nowrap' }}>{isRevealed ? (record.nop || '-') : maskNOP(record.nop)}</span>
                    {record.nop && (
                      <button type="button" onClick={() => toggleReveal(record.id)}
                        aria-label={isRevealed ? 'Sembunyikan NOP' : 'Tampilkan NOP lengkap'}
                        className="flex-shrink-0 flex items-center justify-center rounded hover:opacity-70"
                        style={{ width: 24, height: 24, color: 'var(--c-t4)' }}>
                        {isRevealed ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    )}
                  </div>
                </td>

                <td style={{ fontSize: 'var(--t-sm)', whiteSpace: 'nowrap' }}>
                  {isRevealed ? (record.nomorInduk || '-') : maskNomorInduk(record.nomorInduk)}
                </td>

                <td>
                  <span className="font-semibold" style={{ color: 'var(--c-t1)', fontSize: 'var(--t-sm)', whiteSpace: 'nowrap' }}>
                    {record.namaWajibPajak}
                  </span>
                </td>

                <td>
                  <span className="block truncate" style={{ color: 'var(--c-t3)', fontSize: 'var(--t-sm)', maxWidth: 180 }} title={record.alamatObjekPajak}>
                    {record.alamatObjekPajak || '-'}
                  </span>
                </td>

                <td className="col-number">
                  <span className="font-semibold" style={{ color: 'var(--c-navy)', fontSize: 'var(--t-sm)', whiteSpace: 'nowrap' }}>
                    {formatRupiah(record.pajakTerhutang)}
                  </span>
                </td>

                <td className="col-number">
                  <span style={{
                    fontSize: 'var(--t-sm)', fontWeight: 500, whiteSpace: 'nowrap',
                    color: record.perubahanPajak > 0 ? 'var(--c-ok)' : record.perubahanPajak < 0 ? 'var(--c-err)' : 'var(--c-t3)',
                  }}>
                    {record.perubahanPajak !== 0 ? formatRupiah(record.perubahanPajak) : '-'}
                  </span>
                </td>

                <td className="text-center">
                  <Toggle checked={record.statusLunas} onChange={v => handleToggleLunas(record, v)} disabled={isLocked} />
                </td>

                <td style={{ color: 'var(--c-t3)', fontSize: 'var(--t-sm)', whiteSpace: 'nowrap' }}>
                  {formatTanggal(record.tanggalBayar)}
                </td>

                <td className="col-number" style={{ fontSize: 'var(--t-sm)', whiteSpace: 'nowrap' }}>
                  {record.luasTanah ? `${record.luasTanah.toLocaleString('id-ID')} m²` : '-'}
                </td>

                <td className="col-number" style={{ fontSize: 'var(--t-sm)', whiteSpace: 'nowrap' }}>
                  {record.luasBangunan ? `${record.luasBangunan.toLocaleString('id-ID')} m²` : '-'}
                </td>

                <td style={{ color: 'var(--c-t3)', fontSize: 'var(--t-sm)', whiteSpace: 'nowrap' }}>
                  {record.dikelolaOleh || '-'}
                </td>

                <td className="col-sticky-right">
                  <div className="flex items-center justify-center gap-2">
                    <button onClick={() => onEdit(record)} disabled={isLocked} title="Edit data" aria-label="Edit data"
                      className="flex items-center justify-center rounded-md transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                      style={{ width: 40, height: 40, background: 'var(--c-navy-soft)', color: 'var(--c-navy)' }}>
                      <Pencil size={16} />
                    </button>
                    <button onClick={() => onDelete(record)} disabled={isLocked} title="Hapus data" aria-label="Hapus data"
                      className="flex items-center justify-center rounded-md transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                      style={{ width: 40, height: 40, background: 'var(--c-err-soft)', color: 'var(--c-err)' }}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>

        <tfoot>
          <tr style={{ background: 'var(--c-surface-2)' }}>
            <td colSpan={5} className="text-right py-3 px-3 font-semibold" style={{ color: 'var(--c-t3)', fontSize: 'var(--t-sm)' }}>
              Total Halaman Ini
            </td>
            <td className="col-number py-3 px-3 font-bold" style={{ color: 'var(--c-navy)', fontSize: 'var(--t-sm)', whiteSpace: 'nowrap' }}>
              {formatRupiah(totalPajakPage)}
            </td>
            <td colSpan={7} />
          </tr>
          <tr style={{ background: 'var(--c-navy-soft)' }}>
            <td colSpan={5} className="text-right py-3 px-3 font-bold" style={{ color: 'var(--c-navy)', fontSize: 'var(--t-sm)' }}>
              Total Sampai Dengan Halaman Ini
            </td>
            <td className="col-number py-3 px-3 font-bold" style={{ color: 'var(--c-navy)', fontSize: 'var(--t-sm)', whiteSpace: 'nowrap' }}>
              {formatRupiah(totalPajakAll)}
            </td>
            <td colSpan={7} />
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
