'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  hideClose?: boolean;
  footer?: React.ReactNode;
}

const sizeMaxWidth: Record<string, string> = {
  sm:   '384px',
  md:   '480px',
  lg:   '560px',
  xl:   '672px',
  full: '900px',
};

export function Modal({ open, onClose, title, children, size = 'md', hideClose = false, footer }: ModalProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ padding: 'var(--sp-4)' }}>
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(2px)' }}
        onClick={onClose}
      />

      {/* Dialog */}
      <div
        className="relative w-full flex flex-col animate-modal-in"
        style={{
          maxWidth: sizeMaxWidth[size],
          maxHeight: '90vh',
          background: 'var(--c-surface)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        {/* Header */}
        {(title || !hideClose) && (
          <div
            className="flex items-center justify-between flex-shrink-0"
            style={{
              padding: 'var(--sp-4) var(--sp-6)',
              borderBottom: '1px solid var(--c-border)',
            }}
          >
            {title && (
              <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--c-text-1)' }}>
                {title}
              </h3>
            )}
            {!hideClose && (
              <button
                onClick={onClose}
                aria-label="Tutup"
                className="flex items-center justify-center rounded-md transition-colors"
                style={{
                  width: 'var(--touch-min)',
                  height: 'var(--touch-min)',
                  color: 'var(--c-text-3)',
                  marginRight: 'calc(var(--sp-2) * -1)',
                }}
                onMouseOver={e => (e.currentTarget.style.background = 'var(--c-navy-light)')}
                onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
              >
                <X size={18} />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div
          className="flex-1 overflow-y-auto"
          style={{ padding: 'var(--sp-4) var(--sp-6)' }}
        >
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div
            className="flex items-center justify-end flex-shrink-0"
            style={{
              padding: 'var(--sp-4) var(--sp-6)',
              borderTop: '1px solid var(--c-border)',
              gap: 'var(--sp-2)',
            }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
