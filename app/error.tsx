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
        padding: 'var(--s6)',
        background: 'var(--c-bg)',
        gap: 'var(--s5)',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          width: 72,
          height: 72,
          borderRadius: 'var(--radius-xl)',
          background: 'var(--c-err-soft)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <AlertTriangle size={36} style={{ color: 'var(--c-err)' }} />
      </div>

      <div>
        <h1
          style={{
            fontSize: 'var(--t-xl)',
            fontWeight: 700,
            color: 'var(--c-t1)',
            marginBottom: 'var(--s2)',
          }}
        >
          Terjadi Kesalahan
        </h1>
        <p style={{ fontSize: 'var(--t-sm)', color: 'var(--c-t3)', maxWidth: 360 }}>
          Halaman ini mengalami masalah. Silakan muat ulang atau kembali ke beranda.
        </p>
        {process.env.NODE_ENV === 'development' && error?.message && (
          <p
            style={{
              marginTop: 'var(--s3)',
              fontSize: 'var(--t-xs)',
              color: 'var(--c-err)',
              fontFamily: 'monospace',
              background: 'var(--c-err-soft)',
              padding: 'var(--s2) var(--s3)',
              borderRadius: 'var(--r-sm)',
              maxWidth: 420,
              wordBreak: 'break-all',
            }}
          >
            {error.message}
          </p>
        )}
      </div>

      <div style={{ display: 'flex', gap: 'var(--s3)', flexWrap: 'wrap', justifyContent: 'center' }}>
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
