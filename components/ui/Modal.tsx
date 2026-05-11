'use client';

import React, { useEffect, useRef } from 'react';
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
  const scrollY = useRef(0);

  useEffect(() => {
    if (open) {
      // Simpan posisi scroll saat ini
      scrollY.current = window.scrollY;
      // Lock scroll body — metode yang kompatibel dengan iOS Safari
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY.current}px`;
      document.body.style.left = '0';
      document.body.style.right = '0';
      document.body.style.overflow = 'hidden';
    } else {
      // Restore scroll
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.overflow = '';
      window.scrollTo(0, scrollY.current);
    }
    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      style={{ padding: '0' }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{ background: 'rgba(0,0,0,0.50)', backdropFilter: 'blur(2px)' }}
        onClick={onClose}
      />

      {/* Dialog — di mobile: sheet dari bawah, di desktop: center */}
      <div
        className="relative w-full flex flex-col animate-modal-in"
        style={{
          maxWidth: sizeMaxWidth[size],
          // Di mobile, modal naik dari bawah — max 92vh agar tidak full screen
          maxHeight: '92dvh',
          background: 'var(--c-surface)',
          // Di mobile: rounded top saja (bottom sheet style)
          borderRadius: 'var(--r-lg) var(--r-lg) 0 0',
          boxShadow: 'var(--sh-lg)',
          // Di layar besar: rounded penuh
          // Override via media query tidak bisa inline, jadi pakai className
        }}
      >
        <style>{`
          @media (min-width: 640px) {
            .modal-dialog { border-radius: var(--r-lg) !important; margin: 16px; }
          }
        `}</style>

        {/* Drag handle — visual cue untuk bottom sheet di mobile */}
        <div style={{
          width: 40, height: 4, borderRadius: 2,
          background: 'var(--c-border)',
          margin: '12px auto 0',
          flexShrink: 0,
        }} />

        {/* Header */}
        {(title || !hideClose) && (
          <div
            className="flex items-center justify-between flex-shrink-0"
            style={{ padding: 'var(--s3) var(--s5)', borderBottom: '1px solid var(--c-border)' }}
          >
            {title && (
              <h3 style={{ fontSize: 'var(--t-lg)', fontWeight: 700, color: 'var(--c-t1)' }}>
                {title}
              </h3>
            )}
            {!hideClose && (
              <button
                onClick={onClose}
                aria-label="Tutup"
                style={{
                  width: 44, height: 44,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  borderRadius: 8, border: 'none', background: 'transparent',
                  color: 'var(--c-t3)', cursor: 'pointer',
                  marginRight: -8,
                }}
              >
                <X size={20} />
              </button>
            )}
          </div>
        )}

        {/* Content — scrollable */}
        <div
          className="flex-1 overflow-y-auto"
          style={{ padding: 'var(--s4) var(--s5)', overscrollBehavior: 'contain' }}
        >
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div
            className="flex items-center justify-end flex-shrink-0"
            style={{
              padding: 'var(--s3) var(--s5)',
              borderTop: '1px solid var(--c-border)',
              gap: 'var(--s2)',
            }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
