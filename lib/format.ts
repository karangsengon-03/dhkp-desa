/**
 * lib/format.ts
 * Semua fungsi format untuk DHKP Desa Karang Sengon.
 * Gunakan fungsi-fungsi ini secara konsisten di seluruh aplikasi.
 */

const BULAN = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

// ─── Rupiah ────────────────────────────────────────────────────────────────
export function formatRupiah(n: number): string {
  return 'Rp ' + n.toLocaleString('id-ID');
}

// ─── Tanggal dari ISO string (YYYY-MM-DD) ──────────────────────────────────

/** "15 Januari 2025" */
export function formatTanggal(isoStr: string | null | undefined): string {
  if (!isoStr) return '-';
  const [y, m, d] = isoStr.split('-');
  if (!y || !m || !d) return isoStr;
  const bulan = BULAN[parseInt(m, 10) - 1];
  if (!bulan) return isoStr;
  return `${parseInt(d, 10)} ${bulan} ${y}`;
}

/** "15/01/25" — untuk konteks cetak/tabel sempit */
export function formatTanggalPendek(isoStr: string | null | undefined): string {
  if (!isoStr) return '-';
  const [y, m, d] = isoStr.split('-');
  if (!y || !m || !d) return isoStr;
  const yy = String(y).slice(2);
  return `${d}/${m}/${yy}`;
}

/** "15 Januari 2025" (alias formatTanggal, digunakan untuk surat resmi) */
export function formatTanggalResmi(isoStr: string | null | undefined): string {
  return formatTanggal(isoStr);
}

/** "Januari 2025" */
export function formatTahunBulan(isoStr: string | null | undefined): string {
  if (!isoStr) return '-';
  const [y, m] = isoStr.split('-');
  if (!y || !m) return isoStr;
  const bulan = BULAN[parseInt(m, 10) - 1];
  if (!bulan) return isoStr;
  return `${bulan} ${y}`;
}

// ─── Timestamp Firestore ───────────────────────────────────────────────────

/** Dari objek {seconds, nanoseconds} Firestore → "15 Januari 2025, 09:30" */
export function formatTimestamp(
  ts: { seconds: number; nanoseconds?: number } | null | undefined
): string {
  if (!ts?.seconds) return '—';
  const d = new Date(ts.seconds * 1000);
  const tgl = d.getDate();
  const bulan = BULAN[d.getMonth()];
  const tahun = d.getFullYear();
  const jam = String(d.getHours()).padStart(2, '0');
  const menit = String(d.getMinutes()).padStart(2, '0');
  return `${tgl} ${bulan} ${tahun}, ${jam}:${menit}`;
}

/** Waktu relatif: "Baru saja", "5 menit lalu", "2 hari lalu", dll. */
export function formatWaktuRelatif(
  ts: { seconds: number } | null | undefined
): string {
  if (!ts?.seconds) return '—';
  const diffSec = Math.floor(Date.now() / 1000 - ts.seconds);
  if (diffSec < 60) return 'Baru saja';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)} menit lalu`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} jam lalu`;
  if (diffSec < 2592000) return `${Math.floor(diffSec / 86400)} hari lalu`;
  if (diffSec < 31536000) return `${Math.floor(diffSec / 2592000)} bulan lalu`;
  return `${Math.floor(diffSec / 31536000)} tahun lalu`;
}

// ─── Utilitas ──────────────────────────────────────────────────────────────

/** Tanggal hari ini dalam format ISO (YYYY-MM-DD) */
export function todayISO(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
