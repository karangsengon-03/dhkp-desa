export function formatRupiah(n: number): string {
  return 'Rp ' + n.toLocaleString('id-ID');
}

export function formatTanggal(str: string): string {
  if (!str) return '-';
  const [y, m, d] = str.split('-');
  if (!y || !m || !d) return str;
  return `${d}/${m}/${y}`;
}

export function todayISO(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
