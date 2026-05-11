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
          borderRadius: 'var(--r-xl)',
          background: 'var(--c-warn-soft)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <WifiOff size={36} style={{ color: 'var(--c-warn)' }} />
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
          Tidak Ada Koneksi
        </h1>
        <p style={{ fontSize: 'var(--t-sm)', color: 'var(--c-t3)', maxWidth: 360 }}>
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
