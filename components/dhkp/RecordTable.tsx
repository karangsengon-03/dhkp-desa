'use client';

import React, { useState } from 'react';
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

/** Style helper untuk TH — didefinisikan di luar komponen agar tidak jadi "component during render" */
function thStyle(right?: boolean): React.CSSProperties {
  return {
    background: 'var(--c-navy)', color: 'var(--c-inv)',
    fontSize: 'var(--t-xs)', fontWeight: 700,
    textTransform: 'uppercase', letterSpacing: '0.05em',
    height: 44, padding: '0 12px',
    textAlign: right ? 'right' : 'left',
    whiteSpace: 'nowrap',
    borderRight: '1px solid rgba(255,255,255,0.08)',
  };
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

  return (
    <div className="table-wrapper">
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            {/* NO — selalu tampil */}
            <th style={thStyle()}><span style={{ display: 'flex', justifyContent: 'center' }}>No</span></th>
            {show('nop')              && <th style={thStyle()}>NOP</th>}
            {show('nomorInduk')       && <th style={thStyle()}>No. Induk</th>}
            {show('namaWajibPajak')   && <th style={thStyle()}>Nama Wajib Pajak</th>}
            {show('alamatObjekPajak') && <th style={thStyle()}>Alamat Objek</th>}
            {show('pajakTerhutang')   && <th style={thStyle(true)}>Pajak Terhutang</th>}
            {show('perubahanPajak')   && <th style={thStyle(true)}>Perubahan</th>}
            {show('statusLunas')      && <th style={thStyle()}><span style={{ display: 'flex', justifyContent: 'center' }}>Lunas</span></th>}
            {show('tanggalBayar')     && <th style={thStyle()}>Tgl Bayar</th>}
            {show('luasTanah')        && <th style={thStyle(true)}>Luas Tanah</th>}
            {show('luasBangunan')     && <th style={thStyle(true)}>Luas Bgn</th>}
            {show('dikelolaOleh')     && <th style={thStyle()}>Dikelola</th>}
            {/* AKSI — selalu tampil */}
            <th style={{
              background: 'var(--c-navy)', color: 'var(--c-inv)',
              fontSize: 'var(--t-xs)', fontWeight: 700, textTransform: 'uppercase',
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
            const rowBg = isLunas ? 'var(--c-ok-soft)' : (idx % 2 === 0 ? 'var(--c-surface)' : 'var(--c-surface-2)');

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
                          aria-label={rev ? 'Sembunyikan NOP' : 'Tampilkan NOP'}
                          style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--c-t4)', borderRadius: 4 }}>
                          {rev ? <EyeOff size={14} /> : <Eye size={14} />}
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
                    <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--c-navy)' }}>{formatRupiah(record.pajakTerhutang)}</span>
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
                  padding: '0 8px', height: 52,
                  position: 'sticky', right: 0,
                  background: isLunas ? 'var(--c-ok-soft)' : rowBg,
                  borderLeft: '1px solid var(--c-border)',
                  minWidth: 108,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                    <button
                      onClick={() => onEdit(record)}
                      disabled={isLocked}
                      aria-label={`Edit data ${record.namaWajibPajak}`}
                      style={{ width: 44, height: 44, borderRadius: 6, border: 'none', cursor: isLocked ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--c-navy-soft)', color: 'var(--c-navy)', opacity: isLocked ? 0.35 : 1 }}
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => onDelete(record)}
                      disabled={isLocked}
                      aria-label={`Hapus data ${record.namaWajibPajak}`}
                      style={{ width: 44, height: 44, borderRadius: 6, border: 'none', cursor: isLocked ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--c-err-soft)', color: 'var(--c-err)', opacity: isLocked ? 0.35 : 1 }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>

        <tfoot>
          {/* Baris 1 — Total halaman ini */}
          <tr style={{ background: 'var(--c-navy-soft)', borderTop: '2px solid var(--c-border-md)' }}>
            <td
              colSpan={
                1 +
                (show('nop') ? 1 : 0) +
                (show('nomorInduk') ? 1 : 0) +
                (show('namaWajibPajak') ? 1 : 0) +
                (show('alamatObjekPajak') ? 1 : 0)
              }
              style={{ padding: '10px 12px', fontSize: 'var(--t-xs)', fontWeight: 600, color: 'var(--c-t3)', textAlign: 'right' }}
            >
              Total Halaman Ini
            </td>
            {show('pajakTerhutang') && (
              <td style={{ padding: '10px 12px', textAlign: 'right', fontSize: 14, fontWeight: 700, color: 'var(--c-navy)', whiteSpace: 'nowrap' }}>
                {formatRupiah(totalPajakPage)}
              </td>
            )}
            <td
              colSpan={
                (show('perubahanPajak') ? 1 : 0) +
                (show('statusLunas') ? 1 : 0) +
                (show('tanggalBayar') ? 1 : 0) +
                (show('luasTanah') ? 1 : 0) +
                (show('luasBangunan') ? 1 : 0) +
                (show('dikelolaOleh') ? 1 : 0) +
                1 /* kolom Aksi selalu ada */
              }
            />
          </tr>
          {/* Baris 2 — Total kumulatif s.d. halaman ini (dari halaman 1 sampai halaman saat ini) */}
          <tr style={{ background: 'var(--c-navy)', borderTop: '1px solid var(--c-border-md)' }}>
            <td
              colSpan={
                1 +
                (show('nop') ? 1 : 0) +
                (show('nomorInduk') ? 1 : 0) +
                (show('namaWajibPajak') ? 1 : 0) +
                (show('alamatObjekPajak') ? 1 : 0)
              }
              style={{ padding: '10px 12px', fontSize: 'var(--t-xs)', fontWeight: 700, color: 'var(--c-inv)', textAlign: 'right' }}
            >
              Total s.d. Halaman Ini
            </td>
            {show('pajakTerhutang') && (
              <td style={{ padding: '10px 12px', textAlign: 'right', fontSize: 14, fontWeight: 800, color: 'var(--c-gold)', whiteSpace: 'nowrap' }}>
                {formatRupiah(totalPajakAll)}
              </td>
            )}
            <td
              colSpan={
                (show('perubahanPajak') ? 1 : 0) +
                (show('statusLunas') ? 1 : 0) +
                (show('tanggalBayar') ? 1 : 0) +
                (show('luasTanah') ? 1 : 0) +
                (show('luasBangunan') ? 1 : 0) +
                (show('dikelolaOleh') ? 1 : 0) +
                1 /* kolom Aksi selalu ada */
              }
            />
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
