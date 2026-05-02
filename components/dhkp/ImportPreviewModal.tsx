'use client';

import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { ImportRow } from '@/app/export-import/page';

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
      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 760, maxHeight: '88vh', display: 'flex', flexDirection: 'column', background: 'var(--c-surface)', borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0', boxShadow: 'var(--shadow-lg)' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--sp-4) var(--sp-5)', borderBottom: '1px solid var(--c-border)', flexShrink: 0 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 'var(--text-lg)', color: 'var(--c-text-1)' }}>Preview Import</div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--c-text-3)', marginTop: 2 }}>
              {rows.length} baris terbaca dari file
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            style={{ width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--c-text-3)', borderRadius: 'var(--radius-md)' }}
          >
            <XCircle size={20} />
          </button>
        </div>

        {/* Stat Summary */}
        <div style={{ display: 'flex', gap: 'var(--sp-3)', padding: 'var(--sp-4) var(--sp-5)', borderBottom: '1px solid var(--c-border)', flexShrink: 0, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', padding: 'var(--sp-2) var(--sp-3)', borderRadius: 'var(--radius-md)', background: 'var(--c-success-light)', border: '1px solid var(--c-success)' }}>
            <CheckCircle size={14} style={{ color: 'var(--c-success)' }} />
            <span style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--c-success)' }}>{valid.length} valid</span>
          </div>
          {invalid.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', padding: 'var(--sp-2) var(--sp-3)', borderRadius: 'var(--radius-md)', background: 'var(--c-danger-light)', border: '1px solid var(--c-danger)' }}>
              <AlertTriangle size={14} style={{ color: 'var(--c-danger)' }} />
              <span style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--c-danger)' }}>{invalid.length} error</span>
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
                  <tr key={i} style={{ background: ok ? undefined : 'var(--c-danger-light)' }}>
                    <td style={{ textAlign: 'center', color: 'var(--c-text-4)' }}>{i + 1}</td>
                    <td style={{ fontWeight: ok ? 400 : 600, color: ok ? 'var(--c-text-2)' : 'var(--c-danger)' }}>
                      {item.row.namaWajibPajak || '—'}
                    </td>
                    <td style={{ fontSize: 'var(--text-xs)', color: 'var(--c-text-3)' }}>
                      {item.row.nop || '—'}
                    </td>
                    <td style={{ fontSize: 'var(--text-xs)', textAlign: 'right' }}>
                      {item.row.pajakTerhutang ? item.row.pajakTerhutang.toLocaleString('id-ID') : '0'}
                    </td>
                    <td>
                      {item.row.statusLunas
                        ? <span className="badge badge-success">Lunas</span>
                        : <span className="badge badge-default">Belum</span>
                      }
                    </td>
                    <td style={{ fontSize: 'var(--text-xs)', color: ok ? 'var(--c-success)' : 'var(--c-danger)' }}>
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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 'var(--sp-2)', padding: 'var(--sp-4) var(--sp-5)', borderTop: '1px solid var(--c-border)', flexShrink: 0 }}>
          <button
            className="btn btn-ghost"
            onClick={onClose}
            disabled={loading}
            style={{ fontSize: 'var(--text-sm)' }}
          >
            Batal
          </button>
          <button
            className="btn btn-primary"
            onClick={onConfirm}
            disabled={loading || valid.length === 0}
            style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 'var(--text-sm)' }}
          >
            <CheckCircle size={14} />
            {loading ? 'Mengimport...' : `Import ${valid.length} Data`}
          </button>
        </div>
      </div>
    </div>
  );
}
