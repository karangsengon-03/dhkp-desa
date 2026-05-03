'use client';

import { useState, useEffect } from 'react';
import { Save, X } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { DHKPRecord } from '@/types';
import { recordFormSchema, RecordFormData } from '@/types/dhkp.schema';
import { RecordFormFields } from '@/components/dhkp/RecordFormFields';
import { addRecord, updateRecord } from '@/lib/firestore';
import { logChange } from '@/lib/changelog';
import { useToast } from '@/components/ui/Toast';

const EMPTY_FORM: RecordFormData = {
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
  const [form, setForm] = useState<RecordFormData>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof RecordFormData, string>>>({});
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

  function handleChange(field: keyof RecordFormData, value: string | boolean) {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  }

  async function handleSubmit() {
    const result = recordFormSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof RecordFormData, string>> = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0] as keyof RecordFormData;
        if (key && !fieldErrors[key]) {
          fieldErrors[key] = issue.message;
        }
      }
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    try {
      const data = result.data;
      const payload = {
        nomor: Number(data.nomor) || maxNomor + 1,
        nop: data.nop,
        nomorInduk: data.nomorInduk ?? '',
        namaWajibPajak: data.namaWajibPajak,
        alamatObjekPajak: data.alamatObjekPajak ?? '',
        pajakTerhutang: Number(data.pajakTerhutang) || 0,
        perubahanPajak: Number(data.perubahanPajak) || 0,
        statusLunas: data.statusLunas,
        tanggalBayar: data.tanggalBayar ?? '',
        luasTanah: Number(data.luasTanah) || 0,
        luasBangunan: Number(data.luasBangunan) || 0,
        dikelolaOleh: data.dikelolaOleh ?? '',
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
        showToast('Data berhasil diperbarui', 'success');
      } else {
        await addRecord(tahun, payload);
        showToast('Data berhasil ditambahkan', 'success');
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
      title={isEdit ? `Edit — ${editRecord?.namaWajibPajak}` : 'Tambah Data Baru'}
      size="xl"
    >
      <RecordFormFields form={form} errors={errors} onChange={handleChange} />

      {/* Actions */}
      <div
        className="flex gap-3 mt-5 pt-4 border-t"
        style={{ borderColor: 'var(--c-border)' }}
      >
        <Button variant="ghost" onClick={onClose} disabled={loading} className="flex-1">
          <X size={15} /> Batal
        </Button>
        <Button variant="primary" onClick={handleSubmit} loading={loading} className="flex-1">
          <Save size={15} /> {isEdit ? 'Simpan Perubahan' : 'Tambah Data'}
        </Button>
      </div>
    </Modal>
  );
}
