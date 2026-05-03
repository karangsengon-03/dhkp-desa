'use client';

import { WifiOff, RefreshCw } from 'lucide-react';

export default function OfflinePage() {
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
          background: 'var(--c-warning-light, #FFF3CD)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <WifiOff size={36} style={{ color: 'var(--c-warning, #B45309)' }} />
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
          Tidak Ada Koneksi
        </h1>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--c-text-3)', maxWidth: 360 }}>
          Aplikasi DHKP memerlukan koneksi internet untuk mengakses data Firestore.
          Periksa koneksi Anda lalu coba lagi.
        </p>
      </div>

      <button
        className="btn btn-primary"
        onClick={() => window.location.reload()}
        style={{ display: 'flex', alignItems: 'center', gap: 6 }}
      >
        <RefreshCw size={15} />
        Coba Lagi
      </button>
    </div>
  );
}
