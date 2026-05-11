/**
 * lib/__tests__/masking.test.ts
 * Unit tests untuk semua fungsi di lib/masking.ts
 */

import { describe, it, expect } from 'vitest';
import { maskNOP, maskNomorInduk } from '@/lib/masking';

// ─── maskNOP ──────────────────────────────────────────────────────────────

describe('maskNOP', () => {
  it('mask NOP format standar panjang', () => {
    const result = maskNOP('32.71.020.001.001-0001.0');
    // 6 karakter pertama + *** + 2 terakhir
    expect(result).toBe('32.71.***.0');
  });

  it('mask NOP pendek (>8 karakter)', () => {
    const result = maskNOP('123456789');
    expect(result).toBe('123456***89');
  });

  it('NOP terlalu pendek (≤8 karakter) → tidak di-mask', () => {
    expect(maskNOP('12345678')).toBe('12345678');
  });

  it('NOP 8 karakter persis → tidak di-mask', () => {
    expect(maskNOP('ABCDEFGH')).toBe('ABCDEFGH');
  });

  it('null → tanda hubung', () => {
    expect(maskNOP(null)).toBe('-');
  });

  it('undefined → tanda hubung', () => {
    expect(maskNOP(undefined)).toBe('-');
  });

  it('string kosong → tanda hubung', () => {
    expect(maskNOP('')).toBe('-');
  });

  it('trim spasi sebelum masking', () => {
    const result = maskNOP('  32.71.020.001.001-0001.0  ');
    expect(result).toBe('32.71.***.0');
  });
});

// ─── maskNomorInduk ───────────────────────────────────────────────────────

describe('maskNomorInduk', () => {
  it('mask NIK 16 digit', () => {
    const result = maskNomorInduk('3309010203040001');
    // 3 karakter pertama + ***** + 2 terakhir
    expect(result).toBe('330*****01');
  });

  it('mask nomor induk 10 digit', () => {
    const result = maskNomorInduk('1234567890');
    expect(result).toBe('123*****90');
  });

  it('nomor terlalu pendek (≤5 karakter) → tidak di-mask', () => {
    expect(maskNomorInduk('12345')).toBe('12345');
  });

  it('null → tanda hubung', () => {
    expect(maskNomorInduk(null)).toBe('-');
  });

  it('undefined → tanda hubung', () => {
    expect(maskNomorInduk(undefined)).toBe('-');
  });

  it('string kosong → tanda hubung', () => {
    expect(maskNomorInduk('')).toBe('-');
  });

  it('trim spasi sebelum masking', () => {
    const result = maskNomorInduk('  3309010203040001  ');
    expect(result).toBe('330*****01');
  });
});
