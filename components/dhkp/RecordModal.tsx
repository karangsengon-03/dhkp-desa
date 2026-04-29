'use client';

import { useState, useEffect } from 'react';
import { Save, X } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { DHKPRecord } from '@/types';
import { addRecord, updateRecord } from '@/lib/firestore';
import { logChange } from '@/lib/changelog';
import { useToast } from '@/components/ui/Toast';

type FormData = {
  nomor: string;
  nop: string;
  nomorInduk: string;
  namaWajibPajak: string;
  alamatObjekPajak: string;
  pajakTerhutang: string;
  perubahanPajak: string;
  statusLunas: boolean;
  tanggalBayar: string;
  luasTanah: string;
  luasBangunan: string;
  dikelolaOleh: string;
};

const EMPTY_FORM: FormData = {
  nomor: '',
  nop: '',
  nomorInduk: '',
  namaWajibPajak: '',
  alamatObjekPajak: '',
  pajakTerhutang: '',
  perubahanPajak: '0',
  statusLunas: false,
  tanggalBayar: '',
  luasTanah: '',
  luasBangunan: '',
  dikelolaOleh: '',
};

interface RecordModalProps {
  open: boolean;
  tahun: number;
  editRecord: DHKPRecord | null;
  maxNomor: number;
  currentUser: string;
  onClose: () => void;
  onSaved: () => void;
}

export function RecordModal({
  open,
  tahun,
  editRecord,
  maxNomor,
  currentUser,
  onClose,
  onSaved,
}: RecordModalProps) {
  const { showToast } = useToast();
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [loading, setLoading] = useState(false);

  const isEdit = editRecord !== null;

  // Populate form when editing
  useEffect(() => {
    if (open) {
      if (editRecord) {
        setForm({
          nomor: String(editRecord.nomor),
          nop: editRecord.nop,
          nomorInduk: editRecord.nomorInduk,
          namaWajibPajak: editRecord.namaWajibPajak,
          alamatObjekPajak: editRecord.alamatObjekPajak,
          pajakTerhutang: String(editRecord.pajakTerhutang),
          perubahanPajak: String(editRecord.perubahanPajak ?? 0),
          statusLunas: editRecord.statusLunas,
          tanggalBayar: editRecord.tanggalBayar ?? '',
          luasTanah: String(editRecord.luasTanah),
          luasBangunan: String(editRecord.luasBangunan),
          dikelolaOleh: editRecord.dikelolaOleh,
        });
      } else {
        setForm({ ...EMPTY_FORM, nomor: String(maxNomor + 1) });
      }
      setErrors({});
    }
  }, [open, editRecord, maxNomor]);

  function set(field: keyof FormData, value: string | boolean) {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  }

  function validate(): boolean {
    const errs: Partial<Record<keyof FormData, string>> = {};
    if (!form.namaWajibPajak.trim()) errs.namaWajibPajak = 'Nama wajib diisi';
    if (!form.nop.trim()) errs.nop = 'NOP wajib diisi';
    if (!form.pajakTerhutang || isNaN(Number(form.pajakTerhutang))) {
      errs.pajakTerhutang = 'Pajak terhutang harus berupa angka';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setLoading(true);
    try {
      const payload = {
        nomor: Number(form.nomor) || maxNomor + 1,
        nop: form.nop.trim(),
        nomorInduk: form.nomorInduk.trim(),
        namaWajibPajak: form.namaWajibPajak.trim(),
        alamatObjekPajak: form.alamatObjekPajak.trim(),
        pajakTerhutang: Number(form.pajakTerhutang) || 0,
        perubahanPajak: Number(form.perubahanPajak) || 0,
        statusLunas: form.statusLunas,
        tanggalBayar: form.tanggalBayar,
        luasTanah: Number(form.luasTanah) || 0,
        luasBangunan: Number(form.luasBangunan) || 0,
        dikelolaOleh: form.dikelolaOleh.trim(),
        tahun,
      };

      if (isEdit && editRecord) {
        await updateRecord(tahun, editRecord.id, payload);
        // Log changes for each modified field
        const fieldsToLog: Array<{ key: keyof typeof payload; label: string }> = [
          { key: 'namaWajibPajak', label: 'Nama Wajib Pajak' },
          { key: 'nop', label: 'NOP' },
          { key: 'nomorInduk', label: 'Nomor Induk' },
          { key: 'alamatObjekPajak', label: 'Alamat Objek Pajak' },
          { key: 'pajakTerhutang', label: 'Pajak Terhutang' },
          { key: 'perubahanPajak', label: 'Perubahan Pajak' },
          { key: 'statusLunas', label: 'Status Lunas' },
          { key: 'tanggalBayar', label: 'Tanggal Bayar' },
          { key: 'luasTanah', label: 'Luas Tanah' },
          { key: 'luasBangunan', label: 'Luas Bangunan' },
          { key: 'dikelolaOleh', label: 'Dikelola Oleh' },
        ];
        for (const { key, label } of fieldsToLog) {
          const oldVal = editRecord[key as keyof DHKPRecord] as string | number | boolean;
          const newVal = payload[key] as string | number | boolean;
          if (String(oldVal) !== String(newVal)) {
            await logChange(
              editRecord.id,
              tahun,
              editRecord.namaWajibPajak,
              currentUser,
              label,
              oldVal,
              newVal
            );
          }
        }
        showToast('Record berhasil diperbarui', 'success');
      } else {
        await addRecord(tahun, payload);
        showToast('Record berhasil ditambahkan', 'success');
      }
      onSaved();
      onClose();
    } catch {
      showToast('Terjadi kesalahan. Coba lagi.', 'danger');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? `Edit Record — ${editRecord?.namaWajibPajak}` : 'Tambah Record Baru'}
      size="xl"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Nomor */}
        <Field label="Nomor Urut">
          <input
            className="input-field"
            type="number"
            value={form.nomor}
            onChange={(e) => set('nomor', e.target.value)}
            placeholder="Otomatis"
          />
        </Field>

        {/* NOP */}
        <Field label="NOP *" error={errors.nop}>
          <input
            className="input-field"
            value={form.nop}
            onChange={(e) => set('nop', e.target.value)}
            placeholder="Nomor Objek Pajak"
          />
        </Field>

        {/* Nomor Induk */}
        <Field label="Nomor Induk">
          <input
            className="input-field"
            value={form.nomorInduk}
            onChange={(e) => set('nomorInduk', e.target.value)}
            placeholder="Nomor Induk"
          />
        </Field>

        {/* Nama Wajib Pajak */}
        <Field label="Nama Wajib Pajak *" error={errors.namaWajibPajak}>
          <input
            className="input-field"
            value={form.namaWajibPajak}
            onChange={(e) => set('namaWajibPajak', e.target.value)}
            placeholder="Nama lengkap"
          />
        </Field>

        {/* Alamat — full width */}
        <Field label="Alamat Objek Pajak" className="md:col-span-2">
          <input
            className="input-field"
            value={form.alamatObjekPajak}
            onChange={(e) => set('alamatObjekPajak', e.target.value)}
            placeholder="Alamat objek pajak"
          />
        </Field>

        {/* Pajak Terhutang */}
        <Field label="Pajak Terhutang (Rp) *" error={errors.pajakTerhutang}>
          <input
            className="input-field"
            type="number"
            value={form.pajakTerhutang}
            onChange={(e) => set('pajakTerhutang', e.target.value)}
            placeholder="0"
          />
        </Field>

        {/* Perubahan Pajak */}
        <Field label="Perubahan Pajak (Rp)">
          <input
            className="input-field"
            type="number"
            value={form.perubahanPajak}
            onChange={(e) => set('perubahanPajak', e.target.value)}
            placeholder="0"
          />
        </Field>

        {/* Luas Tanah */}
        <Field label="Luas Tanah (m²)">
          <input
            className="input-field"
            type="number"
            value={form.luasTanah}
            onChange={(e) => set('luasTanah', e.target.value)}
            placeholder="0"
          />
        </Field>

        {/* Luas Bangunan */}
        <Field label="Luas Bangunan (m²)">
          <input
            className="input-field"
            type="number"
            value={form.luasBangunan}
            onChange={(e) => set('luasBangunan', e.target.value)}
            placeholder="0"
          />
        </Field>

        {/* Dikelola Oleh */}
        <Field label="Dikelola Oleh">
          <input
            className="input-field"
            value={form.dikelolaOleh}
            onChange={(e) => set('dikelolaOleh', e.target.value)}
            placeholder="Nama petugas"
          />
        </Field>

        {/* Tanggal Bayar */}
        <Field label="Tanggal Bayar">
          <input
            className="input-field"
            type="date"
            value={form.tanggalBayar}
            onChange={(e) => set('tanggalBayar', e.target.value)}
          />
        </Field>

        {/* Status Lunas — full width */}
        <div className="md:col-span-2">
          <label
            className="flex items-center gap-3 cursor-pointer p-3 rounded-lg border"
            style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface-2)' }}
          >
            <div className="relative flex-shrink-0">
              <input
                type="checkbox"
                className="sr-only"
                checked={form.statusLunas}
                onChange={(e) => set('statusLunas', e.target.checked)}
              />
              <div
                className="w-11 h-6 rounded-full transition-colors duration-200"
                style={{ backgroundColor: form.statusLunas ? 'var(--color-success)' : 'var(--color-text-disabled)' }}
              />
              <div
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${form.statusLunas ? 'translate-x-5' : 'translate-x-0'}`}
              />
            </div>
            <div>
              <div className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                Status Lunas
              </div>
              <div className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                {form.statusLunas ? 'Sudah lunas' : 'Belum lunas'}
              </div>
            </div>
          </label>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 mt-5 pt-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
        <Button variant="ghost" onClick={onClose} disabled={loading} className="flex-1">
          <X size={15} /> Batal
        </Button>
        <Button variant="primary" onClick={handleSubmit} loading={loading} className="flex-1">
          <Save size={15} /> {isEdit ? 'Simpan Perubahan' : 'Tambah Record'}
        </Button>
      </div>
    </Modal>
  );
}

function Field({
  label,
  children,
  error,
  className = '',
}: {
  label: string;
  children: React.ReactNode;
  error?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
        {label}
      </label>
      {children}
      {error && (
        <p className="text-xs mt-1" style={{ color: 'var(--color-danger)' }}>
          {error}
        </p>
      )}
    </div>
  );
}
