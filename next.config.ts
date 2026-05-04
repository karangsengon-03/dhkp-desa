import type { NextConfig } from 'next';
import { withSentryConfig } from '@sentry/nextjs';

// BUILD_HASH di-inject via scripts/inject-sw-hash.js (prebuild)

const nextConfig: NextConfig = {
  reactStrictMode: true,
  turbopack: {},

  // Headers: no-cache untuk sw.js dan manifest
  async headers() {
    return [
      {
        source: '/sw.js',
        headers: [
          { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
          { key: 'Service-Worker-Allowed', value: '/' },
        ],
      },
      {
        source: '/manifest.json',
        headers: [{ key: 'Cache-Control', value: 'no-cache' }],
      },
    ];
  },
};

// Ekspor dengan Sentry wrapper jika DSN tersedia
// Jika tidak ada DSN, withSentryConfig tetap aman — tidak menambahkan overhead
export default withSentryConfig(nextConfig, {
  // Hapus source map dari bundle publik setelah upload ke Sentry
  sourcemaps: {
    filesToDeleteAfterUpload: ['.next/static/**/*.map'],
  },
  // Upload source maps lebih luas (termasuk lazy-loaded chunks)
  widenClientFileUpload: true,
  // Matikan Sentry CLI output saat build
  silent: true,
  // Disable telemetry
  telemetry: false,
});
