'use client';

import { RecordFormData } from '@/types/dhkp.schema';

/** Props untuk field tunggal di form */
interface FieldProps {
  label: string;
  children: React.ReactNode;
  error?: string;
  className?: string;
}

export function Field({ label, children, error, className = '' }: FieldProps) {
  return (
    <div className={className}>
      <label
        className="block font-semibold mb-1.5"
        style={{ color: 'var(--c-t3)', fontSize: 'var(--t-xs)' }}
      >
        {label}
      </label>
      {children}
      {error && (
        <p className="mt-1" style={{ color: 'var(--c-err)', fontSize: 'var(--t-xs)' }}>
          {error}
        </p>
      )}
    </div>
  );
}

interface RecordFormFieldsProps {
  form: RecordFormData;
  errors: Partial<Record<keyof RecordFormData, string>>;
  onChange: (field: keyof RecordFormData, value: string | boolean) => void;
}

/**
 * RecordFormFields
 * Semua field input untuk form tambah/edit data DHKP.
 * Dipisahkan dari RecordModal agar masing-masing file lebih ringkas.
 */
export function RecordFormFields({ form, errors, onChange }: RecordFormFieldsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

      <Field label="Nomor Urut">
        <input
          className="input-field"
          type="number"
          value={form.nomor ?? ''}
          onChange={(e) => onChange('nomor', e.target.value)}
          placeholder="Otomatis"
        />
      </Field>

      <Field label="NOP *" error={errors.nop}>
        <input
          className={`input-field${errors.nop ? ' input-error' : ''}`}
          value={form.nop}
          onChange={(e) => onChange('nop', e.target.value)}
          placeholder="Nomor Objek Pajak"
        />
      </Field>

      <Field label="Nomor Induk">
        <input
          className="input-field"
          value={form.nomorInduk ?? ''}
          onChange={(e) => onChange('nomorInduk', e.target.value)}
          placeholder="Nomor Induk"
        />
      </Field>

      <Field label="Nama Wajib Pajak *" error={errors.namaWajibPajak}>
        <input
          className={`input-field${errors.namaWajibPajak ? ' input-error' : ''}`}
          value={form.namaWajibPajak}
          onChange={(e) => onChange('namaWajibPajak', e.target.value)}
          placeholder="Nama lengkap"
        />
      </Field>

      <Field label="Alamat Objek Pajak" className="md:col-span-2">
        <input
          className="input-field"
          value={form.alamatObjekPajak ?? ''}
          onChange={(e) => onChange('alamatObjekPajak', e.target.value)}
          placeholder="Alamat objek pajak"
        />
      </Field>

      <Field label="Pajak Terhutang (Rp) *" error={errors.pajakTerhutang}>
        <input
          className={`input-field${errors.pajakTerhutang ? ' input-error' : ''}`}
          type="number"
          value={form.pajakTerhutang}
          onChange={(e) => onChange('pajakTerhutang', e.target.value)}
          placeholder="0"
        />
      </Field>

      <Field label="Perubahan Pajak (Rp)" error={errors.perubahanPajak}>
        <input
          className={`input-field${errors.perubahanPajak ? ' input-error' : ''}`}
          type="number"
          value={form.perubahanPajak ?? ''}
          onChange={(e) => onChange('perubahanPajak', e.target.value)}
          placeholder="0"
        />
      </Field>

      <Field label="Luas Tanah (m²)" error={errors.luasTanah}>
        <input
          className={`input-field${errors.luasTanah ? ' input-error' : ''}`}
          type="number"
          value={form.luasTanah ?? ''}
          onChange={(e) => onChange('luasTanah', e.target.value)}
          placeholder="0"
        />
      </Field>

      <Field label="Luas Bangunan (m²)" error={errors.luasBangunan}>
        <input
          className={`input-field${errors.luasBangunan ? ' input-error' : ''}`}
          type="number"
          value={form.luasBangunan ?? ''}
          onChange={(e) => onChange('luasBangunan', e.target.value)}
          placeholder="0"
        />
      </Field>

      <Field label="Dikelola Oleh">
        <input
          className="input-field"
          value={form.dikelolaOleh ?? ''}
          onChange={(e) => onChange('dikelolaOleh', e.target.value)}
          placeholder="Nama petugas"
        />
      </Field>

      <Field label="Tanggal Bayar">
        <input
          className="input-field"
          type="date"
          value={form.tanggalBayar ?? ''}
          onChange={(e) => onChange('tanggalBayar', e.target.value)}
        />
      </Field>

      {/* Status Lunas — full width */}
      <div className="md:col-span-2">
        <label
          className="flex items-center gap-3 cursor-pointer p-3 rounded-lg border transition-colors"
          style={{
            borderColor: form.statusLunas ? 'var(--c-ok)' : 'var(--c-border)',
            background: form.statusLunas ? 'var(--c-ok-soft)' : 'var(--c-surface-2)',
          }}
        >
          {/* Toggle visual */}
          <div className="relative flex-shrink-0">
            <input
              type="checkbox"
              className="sr-only"
              checked={form.statusLunas}
              onChange={(e) => onChange('statusLunas', e.target.checked)}
            />
            <div
              className="w-11 h-6 rounded-full transition-colors duration-200"
              style={{ background: form.statusLunas ? 'var(--c-ok)' : 'var(--c-t4)' }}
            />
            <div
              className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200"
              style={{ transform: form.statusLunas ? 'translateX(20px)' : 'translateX(0)' }}
            />
          </div>
          <div>
            <div
              className="font-semibold"
              style={{ color: 'var(--c-t1)', fontSize: 'var(--t-sm)' }}
            >
              Status Lunas
            </div>
            <div style={{ color: 'var(--c-t3)', fontSize: 'var(--t-xs)' }}>
              {form.statusLunas ? 'Sudah lunas' : 'Belum lunas'}
            </div>
          </div>
        </label>
      </div>
    </div>
  );
}
