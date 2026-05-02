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
          height: 'var(--header-height-mobile)',
          background: 'var(--c-surface)',
          borderBottom: '1px solid var(--c-border)',
          padding: '0 var(--sp-3)',
        }}
      >
        <div className="flex items-center" style={{ gap: 'var(--sp-3)' }}>
          <div className="skeleton" style={{ width: 'var(--touch-min)', height: 'var(--touch-min)', borderRadius: 'var(--radius-md)' }} />
          <div>
            <div className="skeleton" style={{ width: 60, height: 14, borderRadius: 'var(--radius-sm)', marginBottom: 6 }} />
            <div className="skeleton" style={{ width: 100, height: 11, borderRadius: 'var(--radius-sm)' }} />
          </div>
        </div>
        <div className="flex items-center" style={{ gap: 'var(--sp-2)' }}>
          <div className="skeleton" style={{ width: 72, height: 32, borderRadius: 'var(--radius-sm)' }} />
          <div className="skeleton" style={{ width: 'var(--touch-min)', height: 'var(--touch-min)', borderRadius: 'var(--radius-md)' }} />
          <div className="skeleton" style={{ width: 28, height: 28, borderRadius: 'var(--radius-full)' }} />
        </div>
      </div>

      {/* Content skeleton */}
      <main className="header-offset" style={{ minHeight: '100vh' }}>
        <div style={{ padding: 'var(--content-pad-mobile)' }}>
          {/* Page header skeleton */}
          <div style={{ marginBottom: 'var(--sp-6)' }}>
            <div className="skeleton" style={{ width: 200, height: 18, borderRadius: 'var(--radius-sm)', marginBottom: 'var(--sp-2)' }} />
            <div className="skeleton" style={{ width: 280, height: 13, borderRadius: 'var(--radius-sm)' }} />
          </div>
          {/* Cards skeleton */}
          <div className="grid grid-cols-2 gap-3 mb-4" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="card" style={{ padding: '14px' }}>
                <div className="skeleton" style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', marginBottom: 'var(--sp-3)' }} />
                <div className="skeleton" style={{ width: '60%', height: 18, borderRadius: 'var(--radius-sm)', marginBottom: 6 }} />
                <div className="skeleton" style={{ width: '80%', height: 12, borderRadius: 'var(--radius-sm)' }} />
              </div>
            ))}
          </div>
          {/* Table skeleton */}
          <div className="table-wrapper" style={{ padding: 'var(--sp-4)' }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex" style={{ gap: 'var(--sp-4)', marginBottom: 'var(--sp-3)' }}>
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
      <Header
        onMenuClick={() => setSidebarOpen(true)}
        userName={userName}
      />
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        userName={userName}
      />
      <main
        className="header-offset"
        style={{ minHeight: '100vh' }}
      >
        <div
          className="animate-fade-in"
          style={{ padding: 'var(--content-pad-mobile)' }}
        >
          {children}
        </div>
      </main>
    </div>
  );
}
