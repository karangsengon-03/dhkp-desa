'use client';

import React from 'react';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  size?: 'sm' | 'md';
}

export function Toggle({ checked, onChange, disabled = false, label, size = 'md' }: ToggleProps) {
  const trackW = size === 'sm' ? 'w-9' : 'w-11';
  const trackH = size === 'sm' ? 'h-5' : 'h-6';
  const thumbSize = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4';
  const thumbTranslate = size === 'sm' ? 'translate-x-4' : 'translate-x-5';

  return (
    <label className={`flex items-center gap-2 ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
      <div className="relative">
        <input
          type="checkbox"
          className="sr-only"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange(e.target.checked)}
        />
        <div
          className={`${trackW} ${trackH} rounded-full transition-colors duration-200`}
          style={{
            backgroundColor: checked
              ? 'var(--color-success)'
              : 'var(--color-text-disabled)',
          }}
        />
        <div
          className={`absolute top-0.5 left-0.5 ${thumbSize} bg-white rounded-full shadow transition-transform duration-200 ${checked ? thumbTranslate : 'translate-x-0'}`}
        />
      </div>
      {label && (
        <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
          {label}
        </span>
      )}
    </label>
  );
}
