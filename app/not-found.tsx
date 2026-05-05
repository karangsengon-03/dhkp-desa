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
          background: 'var(--c-navy-soft)',
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
            marginBottom: 'var(--s2)',
          }}
        >
          404
        </p>
        <h1
          style={{
            fontSize: 'var(--t-xl)',
            fontWeight: 700,
            color: 'var(--c-t1)',
            marginBottom: 'var(--s2)',
          }}
        >
          Halaman Tidak Ditemukan
        </h1>
        <p style={{ fontSize: 'var(--t-sm)', color: 'var(--c-t3)', maxWidth: 360 }}>
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
