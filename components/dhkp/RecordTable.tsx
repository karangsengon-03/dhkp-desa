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
import { ColKey } from './ColumnToggle';

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
  visible: Set<ColKey>;
}

export function RecordTable({
  records, allRecords, tahun, lock, currentUser,
  onEdit, onDelete, currentPage, pageSize,
  totalPajakPage, totalPajakAll, visible,
}: RecordTableProps) {
  const { showToast } = useToast();
  const isLocked = lock.isLocked;
  const [revealedIds, setRevealedIds] = useState<Set<string>>(new Set());
  void allRecords;

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
      if (checked) await logChange(record.id, tahun, record.namaWajibPajak, currentUser, 'Tanggal Bayar', record.tanggalBayar ?? '', tanggalBayar);
      showToast(checked ? `${record.namaWajibPajak} ditandai lunas` : `${record.namaWajibPajak} ditandai belum lunas`, 'success');
    } catch {
      showToast('Gagal memperbarui status', 'danger');
    }
  }

  const show = (col: ColKey) => visible.has(col);
  const startIdx = (currentPage - 1) * pageSize;

  if (records.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '64px 16px', gap: 16 }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--c-navy-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--c-navy)' }}>
          <FileX size={28} />
        </div>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontWeight: 600, color: 'var(--c-t1)', fontSize: 'var(--t-base)' }}>Tidak ada hasil</p>
          <p style={{ color: 'var(--c-t3)', fontSize: 'var(--t-sm)', marginTop: 4 }}>Coba ubah filter atau kata kunci pencarian.</p>
        </div>
      </div>
    );
  }

  const TH = ({ children, right }: { children: React.ReactNode; right?: boolean }) => (
    <th style={{
      background: '#1E3A5F', color: '#ffffff',
      fontSize: 12, fontWeight: 700,
      textTransform: 'uppercase', letterSpacing: '0.05em',
      height: 44, padding: '0 12px',
      textAlign: right ? 'right' : 'left',
      whiteSpace: 'nowrap',
      borderRight: '1px solid rgba(255,255,255,0.08)',
    }}>
      {children}
    </th>
  );

  return (
    <div className="table-wrapper">
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            {/* NO — selalu tampil */}
            <TH><span style={{ display: 'flex', justifyContent: 'center' }}>No</span></TH>
            {show('nop')              && <TH>NOP</TH>}
            {show('nomorInduk')       && <TH>No. Induk</TH>}
            {show('namaWajibPajak')   && <TH>Nama Wajib Pajak</TH>}
            {show('alamatObjekPajak') && <TH>Alamat Objek</TH>}
            {show('pajakTerhutang')   && <TH right>Pajak Terhutang</TH>}
            {show('perubahanPajak')   && <TH right>Perubahan</TH>}
            {show('statusLunas')      && <TH><span style={{ display: 'flex', justifyContent: 'center' }}>Lunas</span></TH>}
            {show('tanggalBayar')     && <TH>Tgl Bayar</TH>}
            {show('luasTanah')        && <TH right>Luas Tanah</TH>}
            {show('luasBangunan')     && <TH right>Luas Bgn</TH>}
            {show('dikelolaOleh')     && <TH>Dikelola</TH>}
            {/* AKSI — selalu tampil */}
            <th style={{
              background: '#1E3A5F', color: '#fff',
              fontSize: 12, fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '0.05em', height: 44, padding: '0 12px',
              textAlign: 'center', whiteSpace: 'nowrap',
              position: 'sticky', right: 0, zIndex: 3,
            }}>
              Aksi
            </th>
          </tr>
        </thead>

        <tbody>
          {records.map((record, idx) => {
            const rev = revealedIds.has(record.id);
            const isLunas = record.statusLunas;
            const rowBg = isLunas ? '#F0FDF4' : (idx % 2 === 0 ? 'var(--c-surface)' : 'var(--c-surface-2)');

            return (
              <tr key={record.id} style={{ background: rowBg, borderBottom: '1px solid var(--c-border)' }}>

                {/* No */}
                <td style={{ padding: '0 12px', height: 52, textAlign: 'center', fontSize: 14, color: 'var(--c-t3)', fontWeight: 500, whiteSpace: 'nowrap', minWidth: 48 }}>
                  {startIdx + idx + 1}
                </td>

                {/* NOP */}
                {show('nop') && (
                  <td style={{ padding: '0 12px', height: 52, fontSize: 13, fontFamily: 'monospace', whiteSpace: 'nowrap', minWidth: 160 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span>{rev ? (record.nop || '-') : maskNOP(record.nop)}</span>
                      {record.nop && (
                        <button type="button" onClick={() => toggleReveal(record.id)}
                          style={{ width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--c-t4)', borderRadius: 4 }}>
                          {rev ? <EyeOff size={13} /> : <Eye size={13} />}
                        </button>
                      )}
                    </div>
                  </td>
                )}

                {/* No Induk */}
                {show('nomorInduk') && (
                  <td style={{ padding: '0 12px', height: 52, fontSize: 14, whiteSpace: 'nowrap', color: 'var(--c-t2)', minWidth: 130 }}>
                    {rev ? (record.nomorInduk || '-') : maskNomorInduk(record.nomorInduk)}
                  </td>
                )}

                {/* Nama */}
                {show('namaWajibPajak') && (
                  <td style={{ padding: '0 12px', height: 52, whiteSpace: 'nowrap', minWidth: 180 }}>
                    <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--c-t1)' }}>{record.namaWajibPajak}</span>
                  </td>
                )}

                {/* Alamat */}
                {show('alamatObjekPajak') && (
                  <td style={{ padding: '0 12px', height: 52, maxWidth: 180, minWidth: 140 }}>
                    <span style={{ fontSize: 14, color: 'var(--c-t3)', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={record.alamatObjekPajak}>
                      {record.alamatObjekPajak || '-'}
                    </span>
                  </td>
                )}

                {/* Pajak */}
                {show('pajakTerhutang') && (
                  <td style={{ padding: '0 12px', height: 52, textAlign: 'right', whiteSpace: 'nowrap', minWidth: 140 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#1E3A5F' }}>{formatRupiah(record.pajakTerhutang)}</span>
                  </td>
                )}

                {/* Perubahan */}
                {show('perubahanPajak') && (
                  <td style={{ padding: '0 12px', height: 52, textAlign: 'right', whiteSpace: 'nowrap', minWidth: 120 }}>
                    <span style={{ fontSize: 14, fontWeight: 500, color: record.perubahanPajak > 0 ? 'var(--c-ok)' : record.perubahanPajak < 0 ? 'var(--c-err)' : 'var(--c-t4)' }}>
                      {record.perubahanPajak !== 0 ? formatRupiah(record.perubahanPajak) : '-'}
                    </span>
                  </td>
                )}

                {/* Toggle Lunas */}
                {show('statusLunas') && (
                  <td style={{ padding: '0 12px', height: 52, textAlign: 'center', minWidth: 72 }}>
                    <Toggle checked={record.statusLunas} onChange={v => handleToggleLunas(record, v)} disabled={isLocked} />
                  </td>
                )}

                {/* Tanggal Bayar */}
                {show('tanggalBayar') && (
                  <td style={{ padding: '0 12px', height: 52, fontSize: 14, color: 'var(--c-t3)', whiteSpace: 'nowrap', minWidth: 110 }}>
                    {formatTanggal(record.tanggalBayar)}
                  </td>
                )}

                {/* Luas Tanah */}
                {show('luasTanah') && (
                  <td style={{ padding: '0 12px', height: 52, textAlign: 'right', fontSize: 14, color: 'var(--c-t2)', whiteSpace: 'nowrap', minWidth: 100 }}>
                    {record.luasTanah ? `${record.luasTanah.toLocaleString('id-ID')} m²` : '-'}
                  </td>
                )}

                {/* Luas Bangunan */}
                {show('luasBangunan') && (
                  <td style={{ padding: '0 12px', height: 52, textAlign: 'right', fontSize: 14, color: 'var(--c-t2)', whiteSpace: 'nowrap', minWidth: 100 }}>
                    {record.luasBangunan ? `${record.luasBangunan.toLocaleString('id-ID')} m²` : '-'}
                  </td>
                )}

                {/* Dikelola */}
                {show('dikelolaOleh') && (
                  <td style={{ padding: '0 12px', height: 52, fontSize: 14, color: 'var(--c-t3)', whiteSpace: 'nowrap', minWidth: 110 }}>
                    {record.dikelolaOleh || '-'}
                  </td>
                )}

                {/* Aksi */}
                <td style={{
                  padding: '0 12px', height: 52,
                  position: 'sticky', right: 0,
                  background: isLunas ? '#F0FDF4' : rowBg,
                  borderLeft: '1px solid var(--c-border)',
                  minWidth: 100,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    <button onClick={() => onEdit(record)} disabled={isLocked}
                      style={{ width: 36, height: 36, borderRadius: 6, border: 'none', cursor: isLocked ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--c-navy-soft)', color: 'var(--c-navy)', opacity: isLocked ? 0.35 : 1 }}>
                      <Pencil size={15} />
                    </button>
                    <button onClick={() => onDelete(record)} disabled={isLocked}
                      style={{ width: 36, height: 36, borderRadius: 6, border: 'none', cursor: isLocked ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--c-err-soft)', color: 'var(--c-err)', opacity: isLocked ? 0.35 : 1 }}>
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>

        <tfoot>
          <tr style={{ background: 'var(--c-navy-soft)', borderTop: '2px solid var(--c-border-md)' }}>
            <td colSpan={3} style={{ padding: '10px 12px', fontSize: 13, fontWeight: 600, color: 'var(--c-t3)', textAlign: 'right' }}>
              Total Halaman Ini
            </td>
            {show('nop') && <td />}
            {show('nomorInduk') && <td />}
            {show('namaWajibPajak') && <td />}
            {show('alamatObjekPajak') && <td />}
            {show('pajakTerhutang') && (
              <td style={{ padding: '10px 12px', textAlign: 'right', fontSize: 14, fontWeight: 700, color: '#1E3A5F', whiteSpace: 'nowrap' }}>
                {formatRupiah(totalPajakPage)}
              </td>
            )}
            <td colSpan={20} />
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
