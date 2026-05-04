/**
 * lib/env.ts
 * Validasi environment variables menggunakan Zod.
 * Validasi ketat hanya di server — di client langsung pakai process.env
 * karena Next.js sudah embed NEXT_PUBLIC_ vars saat build time.
 */

import { z } from 'zod';

const envSchema = z.object({
  NEXT_PUBLIC_FIREBASE_API_KEY:             z.string().min(1),
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN:         z.string().min(1),
  NEXT_PUBLIC_FIREBASE_PROJECT_ID:          z.string().min(1),
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET:      z.string().min(1),
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_APP_ID:              z.string().min(1),
});

function validateEnv() {
  // Di server (build time / SSR): validasi ketat
  if (typeof window === 'undefined') {
    const result = envSchema.safeParse(process.env);
    if (!result.success) {
      const missing = result.error.errors
        .map((e) => `  • ${e.path.join('.')}: Required`)
        .join('\n');
      throw new Error(
        `\n[DHKP] Environment variables tidak valid:\n${missing}\n\n` +
        `Tambahkan variabel Firebase di Vercel → Settings → Environment Variables.\n`
      );
    }
    return result.data;
  }

  // Di client (browser): Next.js sudah embed NEXT_PUBLIC_ vars saat build
  return {
    NEXT_PUBLIC_FIREBASE_API_KEY:             process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? '',
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN:         process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? '',
    NEXT_PUBLIC_FIREBASE_PROJECT_ID:          process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? '',
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET:      process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? '',
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '',
    NEXT_PUBLIC_FIREBASE_APP_ID:              process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? '',
  };
}

export const env = validateEnv();
