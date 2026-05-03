/**
 * sentry.server.config.ts
 * Konfigurasi Sentry untuk sisi server (Node.js runtime).
 * Hanya aktif jika NEXT_PUBLIC_SENTRY_DSN diisi.
 */

import * as Sentry from '@sentry/nextjs';

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    enabled: process.env.NODE_ENV === 'production',
    initialScope: {
      tags: {
        app: 'dhkp-desa',
        desa: 'Karang Sengon',
      },
    },
  });
}
