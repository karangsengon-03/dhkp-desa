'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { ToastMessage, ToastType } from '@/types';

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue>({ showToast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

const icons: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle size={18} />,
  danger:  <XCircle size={18} />,
  warning: <AlertTriangle size={18} />,
  info:    <Info size={18} />,
};

type ColorConfig = { border: string; icon: string };
const colors: Record<ToastType, ColorConfig> = {
  success: { border: 'var(--c-success)', icon: 'var(--c-success)' },
  danger:  { border: 'var(--c-danger)',  icon: 'var(--c-danger)'  },
  warning: { border: 'var(--c-warning)', icon: 'var(--c-warning)' },
  info:    { border: 'var(--c-navy)',    icon: 'var(--c-navy)'    },
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  }, []);

  const remove = (id: string) => setToasts(prev => prev.filter(t => t.id !== id));

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast container — pojok kanan bawah */}
      <div
        className="fixed z-[100] flex flex-col pointer-events-none"
        style={{ bottom: 'var(--sp-4)', right: 'var(--sp-4)', gap: 'var(--sp-2)', minWidth: 240, maxWidth: 360 }}
      >
        {toasts.map(toast => {
          const c = colors[toast.type];
          return (
            <div
              key={toast.id}
              className="pointer-events-auto flex items-start animate-toast-in"
              style={{
                gap: 'var(--sp-3)',
                padding: 'var(--sp-3) var(--sp-4)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-md)',
                background: 'var(--c-surface)',
                borderLeft: `3px solid ${c.border}`,
                border: `1px solid var(--c-border)`,
                borderLeftWidth: 3,
                borderLeftColor: c.border,
              }}
            >
              <span style={{ color: c.icon, marginTop: 1, flexShrink: 0 }}>
                {icons[toast.type]}
              </span>
              <span
                className="flex-1"
                style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--c-text-1)' }}
              >
                {toast.message}
              </span>
              <button
                onClick={() => remove(toast.id)}
                className="flex-shrink-0 transition-opacity"
                style={{ opacity: 0.5, color: 'var(--c-text-3)' }}
                onMouseOver={e => (e.currentTarget.style.opacity = '1')}
                onMouseOut={e => (e.currentTarget.style.opacity = '0.5')}
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
