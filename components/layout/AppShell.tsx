'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface AppShellProps {
  children: React.ReactNode;
  pageTitle: string;
}

export function AppShell({ children, pageTitle }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-bg)' }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
          <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Memuat...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    router.replace('/login');
    return null;
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
