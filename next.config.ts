import type { NextConfig } from 'next';

// BUILD_HASH di-inject via scripts/inject-sw-hash.js (prebuild)

// ── Security Headers — standar wajib apps pemerintahan ──────────────────────
// Catatan per-header:
// X-Frame-Options: cegah clickjacking (embed di iframe situs lain)
// X-Content-Type-Options: cegah MIME sniffing
// Referrer-Policy: batasi informasi referrer ke origin saja
// Permissions-Policy: nonaktifkan fitur browser yang tidak dipakai
// Strict-Transport-Security: paksa HTTPS (hanya aktif di production/HTTPS)
// Content-Security-Policy: whitelist sumber resource yang diizinkan
const securityHeaders = [
  { key: 'X-Frame-Options',            value: 'DENY' },
  { key: 'X-Content-Type-Options',     value: 'nosniff' },
  { key: 'Referrer-Policy',            value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy',         value: 'camera=(), microphone=(), geolocation=()' },
  { key: 'Strict-Transport-Security',  value: 'max-age=63072000; includeSubDomains; preload' },
  {
    key:   'Content-Security-Policy',
    // CSP disesuaikan untuk Firebase Auth + Firestore + Vercel Analytics
    // 'unsafe-eval' diperlukan oleh Next.js dev mode dan beberapa Firebase internals
    // 'unsafe-inline' diperlukan untuk style inline yang dipakai di komponen
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://apis.google.com https://www.gstatic.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' blob: data: https://firebasestorage.googleapis.com",
      "connect-src 'self' https://*.googleapis.com https://*.firebaseio.com wss://*.firebaseio.com https://vitals.vercel-insights.com https://va.vercel-scripts.com",
      "frame-src 'self' https://accounts.google.com",
      "worker-src 'self' blob:",
    ].join('; '),
  },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  turbopack: {},

  async headers() {
    return [
      // Security headers untuk semua route
      {
        source:  '/(.*)',
        headers: securityHeaders,
      },
      // Cache headers untuk service worker — selalu fresh
      {
        source:  '/sw.js',
        headers: [
          { key: 'Cache-Control',          value: 'no-cache, no-store, must-revalidate' },
          { key: 'Service-Worker-Allowed', value: '/' },
        ],
      },
      // Cache headers untuk manifest — fresh tiap request
      {
        source:  '/manifest.json',
        headers: [{ key: 'Cache-Control', value: 'no-cache' }],
      },
    ];
  },

  typescript: { ignoreBuildErrors: false },
  eslint:     { ignoreDuringBuilds: false },
};

export default nextConfig;
