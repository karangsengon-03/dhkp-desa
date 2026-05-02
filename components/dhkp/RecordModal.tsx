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
    setForm(f => ({ ...f, [field]: value }));
    setErrors(e => ({ ...e, [field]: undefined }));
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
            await logChange(editRecord.id, tahun, editRecord.namaWajibPajak, currentUser, label, oldVal, newVal);
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
      title={isEdit ? `Edit — ${editRecord?.namaWajibPajak}` : 'Tambah Record Baru'}
      size="xl"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        <Field label="Nomor Urut">
          <input
            className="input-field"
            type="number"
            value={form.nomor}
            onChange={e => set('nomor', e.target.value)}
            placeholder="Otomatis"
          />
        </Field>

        <Field label="NOP *" error={errors.nop}>
          <input
            className={`input-field${errors.nop ? ' input-error' : ''}`}
            value={form.nop}
            onChange={e => set('nop', e.target.value)}
            placeholder="Nomor Objek Pajak"
          />
        </Field>

        <Field label="Nomor Induk">
          <input
            className="input-field"
            value={form.nomorInduk}
            onChange={e => set('nomorInduk', e.target.value)}
            placeholder="Nomor Induk"
          />
        </Field>

        <Field label="Nama Wajib Pajak *" error={errors.namaWajibPajak}>
          <input
            className={`input-field${errors.namaWajibPajak ? ' input-error' : ''}`}
            value={form.namaWajibPajak}
            onChange={e => set('namaWajibPajak', e.target.value)}
            placeholder="Nama lengkap"
          />
        </Field>

        <Field label="Alamat Objek Pajak" className="md:col-span-2">
          <input
            className="input-field"
            value={form.alamatObjekPajak}
            onChange={e => set('alamatObjekPajak', e.target.value)}
            placeholder="Alamat objek pajak"
          />
        </Field>

        <Field label="Pajak Terhutang (Rp) *" error={errors.pajakTerhutang}>
          <input
            className={`input-field${errors.pajakTerhutang ? ' input-error' : ''}`}
            type="number"
            value={form.pajakTerhutang}
            onChange={e => set('pajakTerhutang', e.target.value)}
            placeholder="0"
          />
        </Field>

        <Field label="Perubahan Pajak (Rp)">
          <input
            className="input-field"
            type="number"
            value={form.perubahanPajak}
            onChange={e => set('perubahanPajak', e.target.value)}
            placeholder="0"
          />
        </Field>

        <Field label="Luas Tanah (m²)">
          <input
            className="input-field"
            type="number"
            value={form.luasTanah}
            onChange={e => set('luasTanah', e.target.value)}
            placeholder="0"
          />
        </Field>

        <Field label="Luas Bangunan (m²)">
          <input
            className="input-field"
            type="number"
            value={form.luasBangunan}
            onChange={e => set('luasBangunan', e.target.value)}
            placeholder="0"
          />
        </Field>

        <Field label="Dikelola Oleh">
          <input
            className="input-field"
            value={form.dikelolaOleh}
            onChange={e => set('dikelolaOleh', e.target.value)}
            placeholder="Nama petugas"
          />
        </Field>

        <Field label="Tanggal Bayar">
          <input
            className="input-field"
            type="date"
            value={form.tanggalBayar}
            onChange={e => set('tanggalBayar', e.target.value)}
          />
        </Field>

        {/* Status Lunas — full width */}
        <div className="md:col-span-2">
          <label
            className="flex items-center gap-3 cursor-pointer p-3 rounded-lg border transition-colors"
            style={{
              borderColor: form.statusLunas ? 'var(--c-success)' : 'var(--c-border)',
              background: form.statusLunas ? 'var(--c-success-light)' : 'var(--c-surface-2)',
            }}
          >
            {/* Toggle visual */}
            <div className="relative flex-shrink-0">
              <input
                type="checkbox"
                className="sr-only"
                checked={form.statusLunas}
                onChange={e => set('statusLunas', e.target.checked)}
              />
              <div
                className="w-11 h-6 rounded-full transition-colors duration-200"
                style={{ background: form.statusLunas ? 'var(--c-success)' : 'var(--c-text-4)' }}
              />
              <div
                className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200"
                style={{ transform: form.statusLunas ? 'translateX(20px)' : 'translateX(0)' }}
              />
            </div>
            <div>
              <div
                className="font-semibold"
                style={{ color: 'var(--c-text-1)', fontSize: 'var(--text-sm)' }}
              >
                Status Lunas
              </div>
              <div style={{ color: 'var(--c-text-3)', fontSize: 'var(--text-xs)' }}>
                {form.statusLunas ? 'Sudah lunas' : 'Belum lunas'}
              </div>
            </div>
          </label>
        </div>
      </div>

      {/* Actions */}
      <div
        className="flex gap-3 mt-5 pt-4 border-t"
        style={{ borderColor: 'var(--c-border)' }}
      >
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
  label, children, error, className = '',
}: {
  label: string; children: React.ReactNode; error?: string; className?: string;
}) {
  return (
    <div className={className}>
      <label
        className="block font-semibold mb-1.5"
        style={{ color: 'var(--c-text-3)', fontSize: 'var(--text-xs)' }}
      >
        {label}
      </label>
      {children}
      {error && (
        <p className="mt-1" style={{ color: 'var(--c-danger)', fontSize: 'var(--text-xs)' }}>
          {error}
        </p>
      )}
    </div>
  );
}
