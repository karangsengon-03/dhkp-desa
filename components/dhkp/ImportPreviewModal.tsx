'use client';

import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { ImportRow } from '@/app/export-import/page';
import { maskNOP } from '@/lib/masking';

interface ImportPreviewModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  rows: ImportRow[];
  loading: boolean;
}

export function ImportPreviewModal({ open, onClose, onConfirm, rows, loading }: ImportPreviewModalProps) {
  if (!open) return null;

  const valid = rows.filter((r) => r.errors.length === 0);
  const invalid = rows.filter((r) => r.errors.length > 0);

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
      {/* Backdrop */}
      <div
        onClick={!loading ? onClose : undefined}
        style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(2px)' }}
      />

      {/* Modal */}
      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 760, maxHeight: '88vh', display: 'flex', flexDirection: 'column', background: 'var(--c-surface)', borderRadius: 'var(--r-lg) var(--r-lg) 0 0', boxShadow: 'var(--sh-lg)' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--s4) var(--s5)', borderBottom: '1px solid var(--c-border)', flexShrink: 0 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 'var(--t-lg)', color: 'var(--c-t1)' }}>Preview Import</div>
            <div style={{ fontSize: 'var(--t-xs)', color: 'var(--c-t3)', marginTop: 2 }}>
              {rows.length} baris terbaca dari file
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            style={{ width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--c-t3)', borderRadius: 'var(--r-md)' }}
          >
            <XCircle size={20} />
          </button>
        </div>

        {/* Stat Summary */}
        <div style={{ display: 'flex', gap: 'var(--s3)', padding: 'var(--s4) var(--s5)', borderBottom: '1px solid var(--c-border)', flexShrink: 0, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s2)', padding: 'var(--s2) var(--s3)', borderRadius: 'var(--r-md)', background: 'var(--c-ok-soft)', border: '1px solid var(--c-ok)' }}>
            <CheckCircle size={14} style={{ color: 'var(--c-ok)' }} />
            <span style={{ fontSize: 'var(--t-sm)', fontWeight: 700, color: 'var(--c-ok)' }}>{valid.length} valid</span>
          </div>
          {invalid.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s2)', padding: 'var(--s2) var(--s3)', borderRadius: 'var(--r-md)', background: 'var(--c-err-soft)', border: '1px solid var(--c-err)' }}>
              <AlertTriangle size={14} style={{ color: 'var(--c-err)' }} />
              <span style={{ fontSize: 'var(--t-sm)', fontWeight: 700, color: 'var(--c-err)' }}>{invalid.length} error</span>
            </div>
          )}
        </div>

        {/* Table */}
        <div style={{ flex: 1, overflowY: 'auto', overflowX: 'auto' }}>
          <table className="dhkp-table" style={{ minWidth: 600 }}>
            <thead>
              <tr>
                <th style={{ width: 44 }}>No</th>
                <th style={{ minWidth: 160 }}>Nama WP</th>
                <th style={{ minWidth: 140 }}>NOP</th>
                <th style={{ minWidth: 100 }}>Pajak</th>
                <th style={{ minWidth: 70 }}>Status</th>
                <th style={{ minWidth: 160 }}>Keterangan</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((item, i) => {
                const ok = item.errors.length === 0;
                return (
                  <tr key={i} style={{ background: ok ? undefined : 'var(--c-err-soft)' }}>
                    <td style={{ textAlign: 'center', color: 'var(--c-t4)' }}>{i + 1}</td>
                    <td style={{ fontWeight: ok ? 400 : 600, color: ok ? 'var(--c-t2)' : 'var(--c-err)' }}>
                      {item.row.namaWajibPajak || '—'}
                    </td>
                    <td style={{ fontSize: 'var(--t-xs)', color: 'var(--c-t3)' }}>
                      {maskNOP(item.row.nop)}
                    </td>
                    <td style={{ fontSize: 'var(--t-xs)', textAlign: 'right' }}>
                      {item.row.pajakTerhutang ? item.row.pajakTerhutang.toLocaleString('id-ID') : '0'}
                    </td>
                    <td>
                      {item.row.statusLunas
                        ? <span className="badge badge-ok">Lunas</span>
                        : <span className="badge badge-default">Belum</span>
                      }
                    </td>
                    <td style={{ fontSize: 'var(--t-xs)', color: ok ? 'var(--c-ok)' : 'var(--c-err)' }}>
                      {ok
                        ? <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><CheckCircle size={12} /> Siap diimport</span>
                        : item.errors.join(' · ')
                      }
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 'var(--s2)', padding: 'var(--s4) var(--s5)', borderTop: '1px solid var(--c-border)', flexShrink: 0 }}>
          <button
            className="btn btn-ghost"
            onClick={onClose}
            disabled={loading}
            style={{ fontSize: 'var(--t-sm)' }}
          >
            Batal
          </button>
          <button
            className="btn btn-primary"
            onClick={onConfirm}
            disabled={loading || valid.length === 0}
            style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 'var(--t-sm)' }}
          >
            <CheckCircle size={14} />
            {loading ? 'Mengimport...' : `Import ${valid.length} Data`}
          </button>
        </div>
      </div>
    </div>
  );
}
