import { FileQuestion, Home } from 'lucide-react';
import Link from 'next/link';

export default function NotFound() {
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
          background: 'var(--c-navy-light)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <FileQuestion size={36} style={{ color: 'var(--c-navy)' }} />
      </div>

      <div>
        <p
          style={{
            fontSize: '3rem',
            fontWeight: 800,
            color: 'var(--c-navy)',
            lineHeight: 1,
            marginBottom: 'var(--sp-2)',
          }}
        >
          404
        </p>
        <h1
          style={{
            fontSize: 'var(--text-xl)',
            fontWeight: 700,
            color: 'var(--c-text-1)',
            marginBottom: 'var(--sp-2)',
          }}
        >
          Halaman Tidak Ditemukan
        </h1>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--c-text-3)', maxWidth: 360 }}>
          Halaman yang Anda cari tidak ada atau telah dipindahkan.
        </p>
      </div>

      <Link
        href="/dashboard"
        className="btn btn-primary"
        style={{ display: 'flex', alignItems: 'center', gap: 6 }}
      >
        <Home size={15} />
        Kembali ke Beranda
      </Link>
    </div>
  );
}
