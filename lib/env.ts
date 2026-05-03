/**
 * lib/env.ts
 * Validasi environment variables menggunakan Zod.
 * Gagal build jika ada env yang hilang atau tidak valid.
 */

import { z } from 'zod';

const envSchema = z.object({
  NEXT_PUBLIC_FIREBASE_API_KEY:            z.string().min(1, 'FIREBASE_API_KEY wajib diisi'),
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN:        z.string().min(1, 'FIREBASE_AUTH_DOMAIN wajib diisi'),
  NEXT_PUBLIC_FIREBASE_PROJECT_ID:         z.string().min(1, 'FIREBASE_PROJECT_ID wajib diisi'),
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET:     z.string().min(1, 'FIREBASE_STORAGE_BUCKET wajib diisi'),
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: z.string().min(1, 'FIREBASE_MESSAGING_SENDER_ID wajib diisi'),
  NEXT_PUBLIC_FIREBASE_APP_ID:             z.string().min(1, 'FIREBASE_APP_ID wajib diisi'),
});

function validateEnv() {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    const missing = result.error.errors
      .map((e) => `  • ${e.path.join('.')}: ${e.message}`)
      .join('\n');
    throw new Error(
      `\n[DHKP] Environment variables tidak valid:\n${missing}\n\n` +
      `Salin .env.example ke .env.local dan isi nilainya.\n`
    );
  }
  return result.data;
}

export const env = validateEnv();
