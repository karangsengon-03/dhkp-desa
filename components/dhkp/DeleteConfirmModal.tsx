'use client';

import { Trash2, X } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

interface DeleteConfirmModalProps {
  open: boolean;
  namaWajibPajak: string;
  loading: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function DeleteConfirmModal({
  open,
  namaWajibPajak,
  loading,
  onConfirm,
  onClose,
}: DeleteConfirmModalProps) {
  return (
    <Modal open={open} onClose={onClose} title="Konfirmasi Hapus" size="sm">
      <div className="flex flex-col items-center gap-4 py-2 text-center">
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center"
          style={{ background: 'var(--c-danger-light)', color: 'var(--c-danger)' }}
        >
          <Trash2 size={26} />
        </div>
        <div>
          <p style={{ color: 'var(--c-text-2)', fontSize: 'var(--text-sm)' }}>
            Hapus data atas nama:
          </p>
          <p
            className="font-bold mt-1"
            style={{ color: 'var(--c-danger)', fontSize: 'var(--text-base)' }}
          >
            {namaWajibPajak}
          </p>
          <p
            className="mt-2"
            style={{ color: 'var(--c-text-3)', fontSize: 'var(--text-xs)' }}
          >
            Tindakan ini tidak dapat dibatalkan.
          </p>
        </div>
        <div className="flex gap-3 w-full">
          <Button variant="ghost" className="flex-1" onClick={onClose} disabled={loading}>
            <X size={15} /> Batal
          </Button>
          <Button variant="danger" className="flex-1" onClick={onConfirm} loading={loading}>
            <Trash2 size={15} /> {loading ? 'Menghapus...' : 'Ya, Hapus Data Ini'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
