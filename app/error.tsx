'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
  console.error('[DHKP Error]', error);
  import('@sentry/nextjs')
    .then(({ captureException }) => captureException(error))
    .catch(() => {});
}, [error]);

  return (
    <div
      style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--sp-6)',
        background: 'var(--c-bg)',
        gap: 'var(--sp-5)',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          width: 72,
          height: 72,
          borderRadius: 'var(--radius-xl)',
          background: 'var(--c-danger-light)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <AlertTriangle size={36} style={{ color: 'var(--c-danger)' }} />
      </div>

      <div>
        <h1
          style={{
            fontSize: 'var(--text-xl)',
            fontWeight: 700,
            color: 'var(--c-text-1)',
            marginBottom: 'var(--sp-2)',
          }}
        >
          Terjadi Kesalahan
        </h1>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--c-text-3)', maxWidth: 360 }}>
          Halaman ini mengalami masalah. Silakan muat ulang atau kembali ke beranda.
        </p>
        {process.env.NODE_ENV === 'development' && error?.message && (
          <p
            style={{
              marginTop: 'var(--sp-3)',
              fontSize: 'var(--text-xs)',
              color: 'var(--c-danger)',
              fontFamily: 'monospace',
              background: 'var(--c-danger-light)',
              padding: 'var(--sp-2) var(--sp-3)',
              borderRadius: 'var(--radius-sm)',
              maxWidth: 420,
              wordBreak: 'break-all',
            }}
          >
            {error.message}
          </p>
        )}
      </div>

      <div style={{ display: 'flex', gap: 'var(--sp-3)', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button
          className="btn btn-primary"
          onClick={reset}
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <RefreshCw size={15} />
          Muat Ulang Halaman
        </button>
        <Link
          href="/dashboard"
          className="btn btn-secondary"
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <Home size={15} />
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}
