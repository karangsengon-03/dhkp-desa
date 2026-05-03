/**
 * lib/masking.ts — Fungsi masking data sensitif untuk tampilan publik
 * NOP (Nomor Objek Pajak) dan Nomor Induk tidak boleh tampil penuh di tabel.
 */

/**
 * Mask NOP: tampilkan 6 karakter pertama + '***' + 2 karakter terakhir.
 * Contoh: "32.71.020.001.001-0001.0" → "32.71.0***1.0"
 */
export function maskNOP(nop: string | null | undefined): string {
  if (!nop) return '-';
  const s = nop.trim();
  if (s.length <= 8) return s; // terlalu pendek, jangan di-mask
  return s.slice(0, 6) + '***' + s.slice(-2);
}

/**
 * Mask Nomor Induk (NIK/KTP): tampilkan 3 karakter pertama + '*****' + 2 karakter terakhir.
 * Contoh: "3309010203040001" → "330*****01"
 */
export function maskNomorInduk(nim: string | null | undefined): string {
  if (!nim) return '-';
  const s = nim.trim();
  if (s.length <= 5) return s; // terlalu pendek, jangan di-mask
  return s.slice(0, 3) + '*****' + s.slice(-2);
}
