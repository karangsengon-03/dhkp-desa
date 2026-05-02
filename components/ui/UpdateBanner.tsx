'use client';

import { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';

export function UpdateBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    const handler = (event: MessageEvent) => {
      if (event.data?.type === 'SW_UPDATED') {
        setShow(true);
      }
    };

    navigator.serviceWorker.addEventListener('message', handler);
    return () => navigator.serviceWorker.removeEventListener('message', handler);
  }, []);

  if (!show) return null;

  function handleReload() {
    window.location.reload();
  }

  return (
    <div className="update-banner no-print">
      <div className="flex items-center" style={{ gap: 'var(--sp-2)' }}>
        <RefreshCw size={14} />
        <span>Versi baru tersedia</span>
      </div>
      <button
        onClick={handleReload}
        className="btn btn-sm"
        style={{
          background: 'var(--c-gold)',
          color: 'var(--c-text-inv)',
          border: 'none',
          flexShrink: 0,
        }}
      >
        Muat Ulang
      </button>
    </div>
  );
}
