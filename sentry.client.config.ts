/**
 * sentry.client.config.ts
 * Konfigurasi Sentry untuk sisi klien (browser).
 * Hanya aktif jika NEXT_PUBLIC_SENTRY_DSN diisi.
 */

import * as Sentry from '@sentry/nextjs';

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,

    // Rekam 10% dari session untuk Session Replay (hemat kuota)
    replaysSessionSampleRate: 0.1,
    // Rekam 100% session yang mengalami error
    replaysOnErrorSampleRate: 1.0,

    integrations: [
      Sentry.replayIntegration({
        // Sembunyikan input sensitif dari rekaman replay
        maskAllInputs: true,
        blockAllMedia: false,
      }),
    ],

    // Hanya kirim error ke Sentry di production
    enabled: process.env.NODE_ENV === 'production',

    // Tambahkan konteks nama aplikasi
    initialScope: {
      tags: {
        app: 'dhkp-desa',
        desa: 'Karang Sengon',
      },
    },
  });
}
