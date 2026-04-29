export interface DHKPRecord {
  id: string;
  nomor: number;
  nop: string;
  nomorInduk: string;
  namaWajibPajak: string;
  alamatObjekPajak: string;
  pajakTerhutang: number;
  statusLunas: boolean;
  perubahanPajak: number;
  tanggalBayar: string;
  luasTanah: number;
  luasBangunan: number;
  dikelolaOleh: string;
  tahun: number;
  createdAt?: { seconds: number; nanoseconds: number };
  updatedAt?: { seconds: number; nanoseconds: number };
}

export interface GlobalLock {
  isLocked: boolean;
  lockedBy: string;
  lockedAt?: { seconds: number; nanoseconds: number };
}

export interface AppInfo {
  kecamatan: string;
  desaKelurahan: string;
  tempatPembayaran: string;
  propinsi: string;
  kotaKab: string;
  logoKiri: string;
  logoKanan: string;
}

export interface ChangelogEntry {
  id: string;
  recordId: string;
  tahun: number;
  namaWajibPajak: string;
  editedBy: string;
  editedAt: { seconds: number; nanoseconds: number };
  field: string;
  nilaiLama: string | number | boolean;
  nilaiBaru: string | number | boolean;
}

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
}

export type ToastType = 'success' | 'danger' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
}
