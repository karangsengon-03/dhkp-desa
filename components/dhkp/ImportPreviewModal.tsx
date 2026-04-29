'use client';

import { DHKPRecord } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { formatRupiah } from '@/lib/format';
import { AlertTriangle, CheckCircle, Upload } from 'lucide-react';

interface ImportRow {
  row: Partial<DHKPRecord>;
  errors: string[];
}

interface ImportPreviewModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  rows: ImportRow[];
  loading: boolean;
}

export function ImportPreviewModal({
  open,
  onClose,
  onConfirm,
  rows,
  loading,
}: ImportPreviewModalProps) {
  const validRows = rows.filter((r) => r.errors.length === 0);
  const errorRows = rows.filter((r) => r.errors.length > 0);

  return (
    <Modal open={open} onClose={onClose} title="Preview Import Data">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

        {/* Summary */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <div
            className="card p-3 flex items-center gap-3"
            style={{ borderLeft: '4px solid var(--color-success)' }}
          >
            <CheckCircle size={20} style={{ color: 'var(--color-success)', flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-success)' }}>
                {validRows.length}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                Baris valid
              </div>
            </div>
          </div>
          <div
            className="card p-3 flex items-center gap-3"
            style={{ borderLeft: '4px solid var(--color-danger)' }}
          >
            <AlertTriangle size={20} style={{ color: 'var(--color-danger)', flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-danger)' }}>
                {errorRows.length}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                Baris bermasalah
              </div>
            </div>
          </div>
        </div>

        {/* Error rows */}
        {errorRows.length > 0 && (
          <div>
            <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-danger)', marginBottom: '0.5rem' }}>
              Baris berikut tidak akan diimport:
            </p>
            <div
              style={{
                maxHeight: '140px',
                overflowY: 'auto',
                border: '1px solid var(--color-danger)',
                borderRadius: '8px',
                background: 'var(--color-danger-bg, #FFF5F5)',
              }}
            >
              {errorRows.map((r, i) => (
                <div
                  key={i}
                  style={{
                    padding: '0.5rem 0.75rem',
                    borderBottom: i < errorRows.length - 1 ? '1px solid var(--color-border)' : undefined,
                    fontSize: '0.8125rem',
                  }}
                >
                  <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                    Baris {i + 1} ({r.row.namaWajibPajak || '-'}):
                  </span>{' '}
                  <span style={{ color: 'var(--color-danger)' }}>{r.errors.join(', ')}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Valid rows preview */}
        {validRows.length > 0 && (
          <div>
            <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>
              Preview data valid ({validRows.length} baris):
            </p>
            <div className="table-wrapper" style={{ maxHeight: '220px', overflowY: 'auto' }}>
              <table className="dhkp-table" style={{ fontSize: '0.75rem' }}>
                <thead>
                  <tr>
                    <th>No</th>
                    <th>Nama Wajib Pajak</th>
                    <th>NOP</th>
                    <th>Pajak Terhutang</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {validRows.map((r, i) => (
                    <tr key={i}>
                      <td>{r.row.nomor ?? i + 1}</td>
                      <td>{r.row.namaWajibPajak || '-'}</td>
                      <td style={{ fontFamily: 'monospace' }}>{r.row.nop || '-'}</td>
                      <td>{formatRupiah(r.row.pajakTerhutang ?? 0)}</td>
                      <td>
                        <span
                          className={`badge ${r.row.statusLunas ? 'badge-success' : 'badge-danger'}`}
                        >
                          {r.row.statusLunas ? 'Lunas' : 'Belum'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {validRows.length === 0 && (
          <p style={{ textAlign: 'center', color: 'var(--color-danger)', fontSize: '0.875rem', padding: '1rem' }}>
            Tidak ada data valid yang dapat diimport. Periksa kembali file Anda.
          </p>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', paddingTop: '0.5rem' }}>
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Batal
          </Button>
          <Button
            variant="primary"
            onClick={onConfirm}
            disabled={validRows.length === 0 || loading}
          >
            <Upload size={16} />
            {loading ? 'Mengimport...' : `Import ${validRows.length} Data`}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
