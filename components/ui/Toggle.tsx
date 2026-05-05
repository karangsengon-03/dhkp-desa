'use client';

import React from 'react';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
}

export function Toggle({ checked, onChange, disabled = false, label }: ToggleProps) {
  return (
    <label
      className="flex items-center gap-2"
      style={{ cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.45 : 1 }}
    >
      {/* Touch target wrapper — min 44×44px */}
      <div className="relative flex items-center justify-center" style={{ width: 'var(--touch)', height: 'var(--touch)' }}>
        <input
          type="checkbox"
          className="sr-only"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange(e.target.checked)}
        />
        {/* Track */}
        <div
          style={{
            width: 40,
            height: 24,
            borderRadius: 'var(--r-full)',
            backgroundColor: checked ? 'var(--c-navy)' : 'var(--c-border-md)',
            transition: 'background-color 200ms ease',
            position: 'relative',
            flexShrink: 0,
          }}
        >
          {/* Thumb */}
          <div
            style={{
              position: 'absolute',
              top: 4,
              left: 4,
              width: 16,
              height: 16,
              borderRadius: 'var(--r-full)',
              background: 'var(--c-inv)',
              boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
              transition: 'transform 200ms ease',
              transform: checked ? 'translateX(16px)' : 'translateX(0)',
            }}
          />
        </div>
      </div>
      {label && (
        <span style={{ fontSize: 'var(--t-base)', fontWeight: 500, color: 'var(--c-t2)' }}>
          {label}
        </span>
      )}
    </label>
  );
}
