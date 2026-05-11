'use client';

/**
 * app/global-error.tsx
 * Error boundary untuk root layout.
 * Menangkap error yang terjadi di layout.tsx atau provider level atas.
 * WAJIB: harus menyertakan <html> dan <body> sendiri karena root layout crash.
 *
 * CATATAN ARSITEKTUR — Hex hardcoded intentional:
 * File ini tidak bisa mengakses CSS custom properties (--c-navy, --c-err, dll.)
 * dari globals.css karena root layout (yang me-load globals.css) sudah crash.
 * Hex dipakai sebagai fallback aman yang selalu bekerja tanpa stylesheet apapun.
 */

import { RefreshCw } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="id">
      <body
        style={{
          margin: 0,
          fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
          background: '#F3F4F6',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px 16px',
          textAlign: 'center',
          gap: '20px',
          boxSizing: 'border-box',
        }}
      >
        {/* Ikon error */}
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: 16,
            background: '#FDECEA',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg
            width="36"
            height="36"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#B71C1C"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
            <path d="M12 9v4" />
            <path d="M12 17h.01" />
          </svg>
        </div>

        {/* Pesan */}
        <div>
          <h1
            style={{
              fontSize: 24,
              fontWeight: 700,
              color: '#111827',
              marginBottom: 8,
              margin: '0 0 8px 0',
            }}
          >
            Kesalahan Sistem
          </h1>
          <p
            style={{
              fontSize: 15,
              color: '#6B7280',
              maxWidth: 360,
              margin: '0 auto',
            }}
          >
            Terjadi kesalahan pada sistem yang tidak bisa dipulihkan secara otomatis.
            Silakan muat ulang halaman.
          </p>
          {process.env.NODE_ENV === 'development' && error?.message && (
            <p
              style={{
                marginTop: 12,
                fontSize: 13,
                color: '#B71C1C',
                fontFamily: 'monospace',
                background: '#FDECEA',
                padding: '8px 12px',
                borderRadius: 6,
                maxWidth: 420,
                wordBreak: 'break-all',
                margin: '12px auto 0',
              }}
            >
              {error.message}
            </p>
          )}
        </div>

        {/* Tombol */}
        <button
          onClick={reset}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            height: 48,
            padding: '0 24px',
            background: '#1E3A5F',
            color: '#ffffff',
            border: 'none',
            borderRadius: 8,
            fontSize: 15,
            fontWeight: 700,
            fontFamily: 'inherit',
            cursor: 'pointer',
          }}
        >
          <RefreshCw size={16} />
          Muat Ulang Halaman
        </button>

        <p style={{ fontSize: 13, color: '#9CA3AF' }}>
          DHKP · Desa Karang Sengon
        </p>
      </body>
    </html>
  );
}
