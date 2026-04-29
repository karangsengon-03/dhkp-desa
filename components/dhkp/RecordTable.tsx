'use client';

import { Pencil, Trash2, FileX } from 'lucide-react';
import { DHKPRecord, GlobalLock } from '@/types';
import { Toggle } from '@/components/ui/Toggle';
import { formatRupiah, formatTanggal, todayISO } from '@/lib/format';
import { updateRecord } from '@/lib/firestore';
import { logChange } from '@/lib/changelog';
import { useToast } from '@/components/ui/Toast';

interface RecordTableProps {
  records: DHKPRecord[];          // hanya record halaman ini
  allRecords: DHKPRecord[];       // seluruh filtered (untuk total kumulatif)
  tahun: number;
  lock: GlobalLock;
  currentUser: string;
  onEdit: (record: DHKPRecord) => void;
  onDelete: (record: DHKPRecord) => void;
  currentPage: number;
  pageSize: number;
  totalPajakPage: number;         // total pajak halaman ini
  totalPajakAll: number;          // total pajak s.d. halaman ini (akumulatif)
}

export function RecordTable({
  records,
  allRecords,
  tahun,
  lock,
  currentUser,
  onEdit,
  onDelete,
  currentPage,
  pageSize,
  totalPajakPage,
  totalPajakAll,
}: RecordTableProps) {
  const { showToast } = useToast();
  const isLocked = lock.isLocked;

  async function handleToggleLunas(record: DHKPRecord, checked: boolean) {
    if (isLocked) return;
    try {
      const tanggalBayar = checked ? todayISO() : '';
      await updateRecord(tahun, record.id, { statusLunas: checked, tanggalBayar });
      await logChange(record.id, tahun, record.namaWajibPajak, currentUser, 'Status Lunas', record.statusLunas, checked);
      if (checked) {
        await logChange(record.id, tahun, record.namaWajibPajak, currentUser, 'Tanggal Bayar', record.tanggalBayar ?? '', tanggalBayar);
      }
      showToast(
        checked ? `${record.namaWajibPajak} ditandai lunas` : `${record.namaWajibPajak} ditandai belum lunas`,
        'success'
      );
    } catch {
      showToast('Gagal memperbarui status', 'danger');
    }
  }

  if (records.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center"
          style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)' }}
        >
          <FileX size={30} />
        </div>
        <div className="text-center">
          <p className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            Belum ada data
          </p>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
            Belum ada data untuk tahun {tahun}. Tambah record atau ubah filter.
          </p>
        </div>
      </div>
    );
  }

  // Nomor urut dimulai dari offset halaman
  const startIdx = (currentPage - 1) * pageSize;

  return (
    <div className="table-wrapper">
      <table className="dhkp-table">
        <thead>
          <tr>
            <th className="text-center" style={{ width: 40 }}>No</th>
            <th>NOP</th>
            <th>No. Induk</th>
            <th>Nama Wajib Pajak</th>
            <th>Alamat Objek</th>
            <th className="text-right">Pajak Terhutang</th>
            <th className="text-right">Perubahan</th>
            <th className="text-center">Lunas</th>
            <th>Tgl Bayar</th>
            <th className="text-right">Luas Tanah</th>
            <th className="text-right">Luas Bgn</th>
            <th>Dikelola</th>
            <th className="text-center" style={{ width: 80 }}>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {records.map((record, idx) => (
            <tr key={record.id} className={record.statusLunas ? 'lunas-row' : ''}>
              {/* No urut global (lintas halaman) */}
              <td className="text-center text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                {startIdx + idx + 1}
              </td>

              <td className="font-mono text-xs">{record.nop || '-'}</td>
              <td className="text-xs">{record.nomorInduk || '-'}</td>

              <td>
                <span className="font-semibold text-xs" style={{ color: 'var(--color-text-primary)' }}>
                  {record.namaWajibPajak}
                </span>
              </td>

              <td>
                <span
                  className="text-xs block max-w-[160px] truncate"
                  title={record.alamatObjekPajak}
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  {record.alamatObjekPajak || '-'}
                </span>
              </td>

              <td className="text-right">
                <span className="text-xs font-semibold" style={{ color: 'var(--color-primary)' }}>
                  {formatRupiah(record.pajakTerhutang)}
                </span>
              </td>

              <td className="text-right">
                <span
                  className="text-xs font-medium"
                  style={{
                    color: record.perubahanPajak > 0
                      ? 'var(--color-success)'
                      : record.perubahanPajak < 0
                      ? 'var(--color-danger)'
                      : 'var(--color-text-secondary)',
                  }}
                >
                  {record.perubahanPajak !== 0 ? formatRupiah(record.perubahanPajak) : '-'}
                </span>
              </td>

              {/* Toggle Lunas */}
              <td className="text-center">
                <Toggle
                  checked={record.statusLunas}
                  onChange={(v) => handleToggleLunas(record, v)}
                  disabled={isLocked}
                  size="sm"
                />
              </td>

              <td className="text-xs" style={{ color: 'var(--color-text-secondary)', whiteSpace: 'nowrap' }}>
                {formatTanggal(record.tanggalBayar)}
              </td>

              <td className="text-right text-xs">{record.luasTanah ? `${record.luasTanah} m²` : '-'}</td>
              <td className="text-right text-xs">{record.luasBangunan ? `${record.luasBangunan} m²` : '-'}</td>

              <td className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                {record.dikelolaOleh || '-'}
              </td>

              {/* Aksi */}
              <td>
                <div className="flex items-center justify-center gap-1.5">
                  <button
                    onClick={() => onEdit(record)}
                    disabled={isLocked}
                    title="Edit"
                    className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)' }}
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    onClick={() => onDelete(record)}
                    disabled={isLocked}
                    title="Hapus"
                    className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{ background: 'var(--color-danger-light)', color: 'var(--color-danger)' }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>

        {/* Footer mirip dokumen DHKP asli */}
        <tfoot>
          <tr style={{ background: 'var(--color-surface-2)', fontWeight: 600 }}>
            <td colSpan={5} className="text-right text-xs py-2 px-3" style={{ color: 'var(--color-text-secondary)' }}>
              Total Halaman Ini
            </td>
            <td className="text-right text-xs font-bold py-2 px-3" style={{ color: 'var(--color-primary)' }}>
              {formatRupiah(totalPajakPage)}
            </td>
            <td colSpan={7} />
          </tr>
          <tr style={{ background: 'var(--color-primary-light)', fontWeight: 700 }}>
            <td colSpan={5} className="text-right text-xs py-2 px-3" style={{ color: 'var(--color-primary)' }}>
              Total Sampai Dengan Halaman Ini
            </td>
            <td className="text-right text-xs font-bold py-2 px-3" style={{ color: 'var(--color-primary)' }}>
              {formatRupiah(totalPajakAll)}
            </td>
            <td colSpan={7} />
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
