'use client';

/**
 * hooks/useNetworkStatus.ts
 * Deteksi status koneksi internet dan tampilkan toast kepada user.
 * Harus diintegrasikan di AppShell.
 */

import { useEffect, useRef } from 'react';
import { useToast } from '@/components/ui/Toast';

export function useNetworkStatus() {
  const { showToast } = useToast();
  // Ref untuk mencegah toast muncul saat pertama kali mount
  const isFirstMount = useRef(true);

  useEffect(() => {
    // Tandai bahwa mount awal sudah lewat setelah satu tick
    const timer = setTimeout(() => {
      isFirstMount.current = false;
    }, 500);

    function handleOffline() {
      if (!isFirstMount.current) {
        showToast('Koneksi internet terputus. Data tidak bisa disimpan.', 'warning');
      }
    }

    function handleOnline() {
      if (!isFirstMount.current) {
        showToast('Koneksi internet pulih.', 'success');
      }
    }

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
