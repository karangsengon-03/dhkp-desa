'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface AppShellProps {
  children: React.ReactNode;
  pageTitle: string;
}

function SkeletonShell({ pageTitle }: { pageTitle: string }) {
  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg)' }}>
      {/* Header skeleton */}
      <div
        className="fixed top-0 left-0 right-0 z-20 flex items-center justify-between px-4"
        style={{
          height: 'var(--header-height)',
          background: 'var(--color-surface)',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg skeleton" />
          <div>
            <div className="w-40 h-3.5 rounded skeleton mb-1.5" />
            <div className="w-24 h-2.5 rounded skeleton" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-20 h-7 rounded-lg skeleton hidden sm:block" />
          <div className="w-8 h-8 rounded-lg skeleton" />
          <div className="w-24 h-8 rounded-lg skeleton hidden sm:block" />
        </div>
      </div>
      {/* Content skeleton */}
      <main className="pt-[var(--header-height)] min-h-screen">
        <div className="p-4 md:p-6">
          <div className="mb-6">
            <div className="w-48 h-6 rounded skeleton mb-2" />
            <div className="w-72 h-4 rounded skeleton" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="card p-4">
                <div className="w-9 h-9 rounded-xl skeleton mb-3" />
                <div className="w-16 h-6 rounded skeleton mb-1.5" />
                <div className="w-24 h-3 rounded skeleton" />
              </div>
            ))}
          </div>
          <div className="card p-4 mb-4">
            <div className="w-full h-3 rounded-full skeleton" />
          </div>
          <div className="table-wrapper">
            <div className="p-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex gap-4 mb-3">
                  <div className="w-8 h-4 rounded skeleton flex-shrink-0" />
                  <div className="w-28 h-4 rounded skeleton" />
                  <div className="flex-1 h-4 rounded skeleton" />
                  <div className="w-24 h-4 rounded skeleton" />
                  <div className="w-20 h-4 rounded skeleton" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export function AppShell({ children, pageTitle }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return <SkeletonShell pageTitle={pageTitle} />;
  }

  const userName = user.displayName || user.email?.split('@')[0] || 'Pengguna';

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg)' }}>
      <Header
        onMenuClick={() => setSidebarOpen(true)}
        pageTitle={pageTitle}
        userName={userName}
      />
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        userName={userName}
      />
      <main
        className="pt-[var(--header-height)] min-h-screen"
        style={{ paddingLeft: 0 }}
      >
        <div className="p-4 md:p-6 animate-fade-in">
          {children}
        </div>
      </main>
    </div>
  );
}

