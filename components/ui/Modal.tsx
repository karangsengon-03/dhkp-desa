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
}

const sizeClass = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
  full: 'max-w-4xl',
};

export function Modal({ open, onClose, title, children, size = 'md', hideClose = false }: ModalProps) {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Dialog */}
      <div
        className={`relative w-full ${sizeClass[size]} card max-h-[90vh] flex flex-col`}
        style={{ background: 'var(--color-surface)' }}
      >
        {/* Header */}
        {(title || !hideClose) && (
          <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
            {title && (
              <h3 className="text-base font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                {title}
              </h3>
            )}
            {!hideClose && (
              <button
                onClick={onClose}
                className="p-1 rounded-lg transition-colors hover:bg-[var(--color-primary-light)]"
                aria-label="Tutup"
              >
                <X size={20} style={{ color: 'var(--color-text-secondary)' }} />
              </button>
            )}
          </div>
        )}
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {children}
        </div>
      </div>
    </div>
  );
}
