'use client';

import { Pencil, Trash2, FileX } from 'lucide-react';
import { DHKPRecord, GlobalLock } from '@/types';
import { Toggle } from '@/components/ui/Toggle';
import { formatRupiah, formatTanggal, todayISO } from '@/lib/format';
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
        checked
          ? `${record.namaWajibPajak} ditandai lunas`
          : `${record.namaWajibPajak} ditandai belum lunas`,
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
          style={{ background: 'var(--c-navy-light)', color: 'var(--c-navy)' }}
        >
          <FileX size={28} />
        </div>
        <div className="text-center">
          <p className="font-semibold" style={{ color: 'var(--c-text-1)', fontSize: 'var(--text-base)' }}>
            Tidak ada hasil
          </p>
          <p className="mt-1" style={{ color: 'var(--c-text-3)', fontSize: 'var(--text-sm)' }}>
            Coba ubah filter atau kata kunci pencarian.
          </p>
        </div>
      </div>
    );
  }

  // Nomor urut global (lintas halaman)
  const startIdx = (currentPage - 1) * pageSize;

  // Hitung total pajak s.d. halaman ini (kumulatif dari allRecords[0...(safePage*pageSize)])
  // allRecords sudah difilter, totalPajakAll dikirim dari parent
  void allRecords; // suppress unused warning — allRecords dipakai parent untuk totalPajakAll

  return (
    <div className="table-wrapper">
      <table className="dhkp-table">
        <thead>
          <tr>
            <th className="col-sticky-left text-center" style={{ width: 44 }}>No</th>
            <th>NOP</th>
            <th>No. Induk</th>
            <th>Nama Wajib Pajak</th>
            <th>Alamat Objek</th>
            <th className="col-number">Pajak Terhutang</th>
            <th className="col-number">Perubahan</th>
            <th className="text-center">Lunas</th>
            <th>Tgl Bayar</th>
            <th className="col-number">Luas Tanah</th>
            <th className="col-number">Luas Bgn</th>
            <th>Dikelola</th>
            <th className="col-sticky-right text-center" style={{ width: 76 }}>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {records.map((record, idx) => (
            <tr
              key={record.id}
              className={record.statusLunas ? 'row-lunas' : ''}
            >
              {/* No urut */}
              <td className="col-sticky-left text-center font-medium" style={{ color: 'var(--c-text-3)', fontSize: 'var(--text-xs)' }}>
                {startIdx + idx + 1}
              </td>

              <td className="font-mono" style={{ fontSize: 'var(--text-xs)' }}>
                {record.nop || '-'}
              </td>

              <td style={{ fontSize: 'var(--text-xs)' }}>
                {record.nomorInduk || '-'}
              </td>

              <td>
                <span className="font-semibold" style={{ color: 'var(--c-text-1)', fontSize: 'var(--text-xs)' }}>
                  {record.namaWajibPajak}
                </span>
              </td>

              <td>
                <span
                  className="block max-w-[150px] truncate"
                  title={record.alamatObjekPajak}
                  style={{ color: 'var(--c-text-3)', fontSize: 'var(--text-xs)' }}
                >
                  {record.alamatObjekPajak || '-'}
                </span>
              </td>

              <td className="col-number">
                <span className="font-semibold" style={{ color: 'var(--c-navy)', fontSize: 'var(--text-xs)' }}>
                  {formatRupiah(record.pajakTerhutang)}
                </span>
              </td>

              <td className="col-number">
                <span
                  style={{
                    fontSize: 'var(--text-xs)',
                    fontWeight: 500,
                    color: record.perubahanPajak > 0
                      ? 'var(--c-success)'
                      : record.perubahanPajak < 0
                      ? 'var(--c-danger)'
                      : 'var(--c-text-3)',
                  }}
                >
                  {record.perubahanPajak !== 0 ? formatRupiah(record.perubahanPajak) : '-'}
                </span>
              </td>

              <td className="text-center">
                <Toggle
                  checked={record.statusLunas}
                  onChange={v => handleToggleLunas(record, v)}
                  disabled={isLocked}
                />
              </td>

              <td style={{ color: 'var(--c-text-3)', fontSize: 'var(--text-xs)', whiteSpace: 'nowrap' }}>
                {formatTanggal(record.tanggalBayar)}
              </td>

              <td className="col-number" style={{ fontSize: 'var(--text-xs)' }}>
                {record.luasTanah ? `${record.luasTanah} m²` : '-'}
              </td>

              <td className="col-number" style={{ fontSize: 'var(--text-xs)' }}>
                {record.luasBangunan ? `${record.luasBangunan} m²` : '-'}
              </td>

              <td style={{ color: 'var(--c-text-3)', fontSize: 'var(--text-xs)' }}>
                {record.dikelolaOleh || '-'}
              </td>

              {/* Aksi — sticky kanan */}
              <td className="col-sticky-right">
                <div className="flex items-center justify-center gap-1">
                  <button
                    onClick={() => onEdit(record)}
                    disabled={isLocked}
                    title="Edit"
                    className="w-7 h-7 rounded-md flex items-center justify-center transition-opacity disabled:opacity-30 disabled:cursor-not-allowed"
                    style={{ background: 'var(--c-navy-light)', color: 'var(--c-navy)' }}
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    onClick={() => onDelete(record)}
                    disabled={isLocked}
                    title="Hapus"
                    className="w-7 h-7 rounded-md flex items-center justify-center transition-opacity disabled:opacity-30 disabled:cursor-not-allowed"
                    style={{ background: 'var(--c-danger-light)', color: 'var(--c-danger)' }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>

        {/* Footer totals */}
        <tfoot>
          <tr style={{ background: 'var(--c-surface-2)' }}>
            <td
              colSpan={5}
              className="text-right py-2 px-3 font-semibold"
              style={{ color: 'var(--c-text-3)', fontSize: 'var(--text-xs)' }}
            >
              Total Halaman Ini
            </td>
            <td
              className="col-number py-2 px-3 font-bold"
              style={{ color: 'var(--c-navy)', fontSize: 'var(--text-xs)' }}
            >
              {formatRupiah(totalPajakPage)}
            </td>
            <td colSpan={7} />
          </tr>
          <tr style={{ background: 'var(--c-navy-light)' }}>
            <td
              colSpan={5}
              className="text-right py-2 px-3 font-bold"
              style={{ color: 'var(--c-navy)', fontSize: 'var(--text-xs)' }}
            >
              Total Sampai Dengan Halaman Ini
            </td>
            <td
              className="col-number py-2 px-3 font-bold"
              style={{ color: 'var(--c-navy)', fontSize: 'var(--text-xs)' }}
            >
              {formatRupiah(totalPajakAll)}
            </td>
            <td colSpan={7} />
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
