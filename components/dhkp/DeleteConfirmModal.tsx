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
          style={{ background: 'var(--c-err-soft)', color: 'var(--c-err)' }}
        >
          <Trash2 size={26} />
        </div>
        <div>
          <p style={{ color: 'var(--c-t2)', fontSize: 'var(--t-sm)' }}>
            Hapus data atas nama:
          </p>
          <p
            className="font-bold mt-1"
            style={{ color: 'var(--c-err)', fontSize: 'var(--t-base)' }}
          >
            {namaWajibPajak}
          </p>
          <p
            className="mt-2"
            style={{ color: 'var(--c-t3)', fontSize: 'var(--t-xs)' }}
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
