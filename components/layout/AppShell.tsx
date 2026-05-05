'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface AppShellProps {
  children: React.ReactNode;
  pageTitle?: string;
}

function SkeletonShell() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--c-bg)' }}>
      {/* Header skeleton */}
      <div
        className="fixed top-0 left-0 right-0 z-20 flex items-center justify-between"
        style={{
          height: 'var(--header-h)',
          background: 'var(--c-surface)',
          borderBottom: '1px solid var(--c-border)',
          padding: '0 var(--s3)',
        }}
      >
        <div className="flex items-center" style={{ gap: 'var(--s3)' }}>
          <div className="skeleton" style={{ width: 'var(--touch)', height: 'var(--touch)', borderRadius: 'var(--r-md)' }} />
          <div>
            <div className="skeleton" style={{ width: 60, height: 14, borderRadius: 'var(--r-sm)', marginBottom: 6 }} />
            <div className="skeleton" style={{ width: 100, height: 11, borderRadius: 'var(--r-sm)' }} />
          </div>
        </div>
        <div className="flex items-center" style={{ gap: 'var(--s2)' }}>
          <div className="skeleton" style={{ width: 72, height: 32, borderRadius: 'var(--r-sm)' }} />
          <div className="skeleton" style={{ width: 'var(--touch)', height: 'var(--touch)', borderRadius: 'var(--r-md)' }} />
          <div className="skeleton" style={{ width: 28, height: 28, borderRadius: 'var(--r-full)' }} />
        </div>
      </div>

      {/* Content skeleton */}
      <main className="header-offset" style={{ minHeight: '100vh' }}>
        <div style={{ padding: 'var(--pad-page)' }}>
          {/* Page header skeleton */}
          <div style={{ marginBottom: 'var(--s6)' }}>
            <div className="skeleton" style={{ width: 200, height: 18, borderRadius: 'var(--r-sm)', marginBottom: 'var(--s2)' }} />
            <div className="skeleton" style={{ width: 280, height: 13, borderRadius: 'var(--r-sm)' }} />
          </div>
          {/* Cards skeleton */}
          <div className="grid grid-cols-2 gap-4 mb-6" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="card" style={{ padding: '14px' }}>
                <div className="skeleton" style={{ width: 36, height: 36, borderRadius: 'var(--r-md)', marginBottom: 'var(--s3)' }} />
                <div className="skeleton" style={{ width: '60%', height: 18, borderRadius: 'var(--r-sm)', marginBottom: 6 }} />
                <div className="skeleton" style={{ width: '80%', height: 12, borderRadius: 'var(--r-sm)' }} />
              </div>
            ))}
          </div>
          {/* Table skeleton */}
          <div className="table-wrapper" style={{ padding: 'var(--s4)' }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex" style={{ gap: 'var(--s4)', marginBottom: 'var(--s3)' }}>
                <div className="skeleton" style={{ width: 24, height: 14, borderRadius: 'var(--radius-xs)', flexShrink: 0 }} />
                <div className="skeleton" style={{ width: 120, height: 14, borderRadius: 'var(--radius-xs)' }} />
                <div className="skeleton" style={{ flex: 1, height: 14, borderRadius: 'var(--radius-xs)' }} />
                <div className="skeleton" style={{ width: 80, height: 14, borderRadius: 'var(--radius-xs)' }} />
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

export function AppShell({ children }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return <SkeletonShell />;
  }

  const userName = user.displayName || user.email?.split('@')[0] || 'Pengguna';

  return (
    <div style={{ minHeight: '100vh', background: 'var(--c-bg)' }}>
      <Header onMenuClick={() => setSidebarOpen(true)} userName={userName} />
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} userName={userName} />
      <main className="header-offset" style={{ minHeight: '100vh' }}>
        <div
          className="animate-fade-in"
          style={{ padding: '24px 20px', maxWidth: 1280, margin: '0 auto' }}
        >
          {children}
        </div>
      </main>
    </div>
  );
}
