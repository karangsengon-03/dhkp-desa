/**
 * lib/__tests__/format.test.ts
 * Unit tests untuk semua fungsi di lib/format.ts
 */

import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  formatRupiah,
  formatTanggal,
  formatTanggalPendek,
  formatTanggalResmi,
  formatTahunBulan,
  formatTimestamp,
  formatWaktuRelatif,
  todayISO,
} from '../format';

// ─── formatRupiah ──────────────────────────────────────────────────────────

describe('formatRupiah', () => {
  it('format angka bulat', () => {
    expect(formatRupiah(1000000)).toBe('Rp 1.000.000');
  });

  it('format nol', () => {
    expect(formatRupiah(0)).toBe('Rp 0');
  });

  it('format angka kecil', () => {
    expect(formatRupiah(500)).toBe('Rp 500');
  });

  it('format angka besar', () => {
    expect(formatRupiah(1500000000)).toBe('Rp 1.500.000.000');
  });
});

// ─── formatTanggal ─────────────────────────────────────────────────────────

describe('formatTanggal', () => {
  it('format ISO standar', () => {
    expect(formatTanggal('2025-01-15')).toBe('15 Januari 2025');
  });

  it('hapus leading zero pada hari', () => {
    expect(formatTanggal('2025-03-05')).toBe('5 Maret 2025');
  });

  it('bulan Desember', () => {
    expect(formatTanggal('2024-12-31')).toBe('31 Desember 2024');
  });

  it('null → tanda hubung', () => {
    expect(formatTanggal(null)).toBe('-');
  });

  it('undefined → tanda hubung', () => {
    expect(formatTanggal(undefined)).toBe('-');
  });

  it('string kosong → tanda hubung', () => {
    expect(formatTanggal('')).toBe('-');
  });
});

// ─── formatTanggalPendek ───────────────────────────────────────────────────

describe('formatTanggalPendek', () => {
  it('format ke DD/MM/YY', () => {
    expect(formatTanggalPendek('2025-01-15')).toBe('15/01/25');
  });

  it('format tahun 2024', () => {
    expect(formatTanggalPendek('2024-12-31')).toBe('31/12/24');
  });

  it('null → tanda hubung', () => {
    expect(formatTanggalPendek(null)).toBe('-');
  });
});

// ─── formatTanggalResmi ───────────────────────────────────────────────────

describe('formatTanggalResmi', () => {
  it('sama dengan formatTanggal', () => {
    expect(formatTanggalResmi('2025-07-17')).toBe('17 Juli 2025');
  });
});

// ─── formatTahunBulan ─────────────────────────────────────────────────────

describe('formatTahunBulan', () => {
  it('format bulan dan tahun', () => {
    expect(formatTahunBulan('2025-06-01')).toBe('Juni 2025');
  });

  it('null → tanda hubung', () => {
    expect(formatTahunBulan(null)).toBe('-');
  });
});

// ─── formatTimestamp ──────────────────────────────────────────────────────

describe('formatTimestamp', () => {
  it('format Firestore timestamp ke bahasa Indonesia', () => {
    // 2025-01-15 09:30:00 UTC → bisa beda tergantung timezone, cek bulan saja
    const ts = { seconds: 1736933400, nanoseconds: 0 }; // ~15 Jan 2025
    const result = formatTimestamp(ts);
    expect(result).toMatch(/Januari 2025/);
    expect(result).toMatch(/:/); // ada waktu HH:MM
  });

  it('null → em dash', () => {
    expect(formatTimestamp(null)).toBe('—');
  });

  it('undefined → em dash', () => {
    expect(formatTimestamp(undefined)).toBe('—');
  });

  it('seconds=0 → em dash', () => {
    expect(formatTimestamp({ seconds: 0 })).toBe('—');
  });
});

// ─── formatWaktuRelatif ───────────────────────────────────────────────────

describe('formatWaktuRelatif', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  const nowSeconds = () => Math.floor(Date.now() / 1000);

  it('"Baru saja" untuk < 60 detik', () => {
    const ts = { seconds: nowSeconds() - 30 };
    expect(formatWaktuRelatif(ts)).toBe('Baru saja');
  });

  it('"N menit lalu" untuk < 1 jam', () => {
    const ts = { seconds: nowSeconds() - 300 }; // 5 menit
    expect(formatWaktuRelatif(ts)).toBe('5 menit lalu');
  });

  it('"N jam lalu" untuk < 1 hari', () => {
    const ts = { seconds: nowSeconds() - 7200 }; // 2 jam
    expect(formatWaktuRelatif(ts)).toBe('2 jam lalu');
  });

  it('"N hari lalu" untuk < 1 bulan', () => {
    const ts = { seconds: nowSeconds() - 86400 * 3 }; // 3 hari
    expect(formatWaktuRelatif(ts)).toBe('3 hari lalu');
  });

  it('null → em dash', () => {
    expect(formatWaktuRelatif(null)).toBe('—');
  });
});

// ─── todayISO ─────────────────────────────────────────────────────────────

describe('todayISO', () => {
  it('format YYYY-MM-DD', () => {
    const result = todayISO();
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('tahun sesuai tahun sekarang', () => {
    const year = new Date().getFullYear().toString();
    expect(todayISO().startsWith(year)).toBe(true);
  });
});
