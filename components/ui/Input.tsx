'use client';

import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  wrapperClass?: string;
}

export function Input({ label, error, wrapperClass = '', className = '', id, ...props }: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s/g, '-');

  return (
    <div className={`flex flex-col gap-1 ${wrapperClass}`}>
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`input-field ${error ? 'border-[var(--color-danger)]' : ''} ${className}`}
        {...props}
      />
      {error && (
        <span className="text-xs" style={{ color: 'var(--color-danger)' }}>
          {error}
        </span>
      )}
    </div>
  );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  wrapperClass?: string;
}

export function Textarea({ label, error, wrapperClass = '', className = '', id, ...props }: TextareaProps) {
  const inputId = id || label?.toLowerCase().replace(/\s/g, '-');

  return (
    <div className={`flex flex-col gap-1 ${wrapperClass}`}>
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        className={`input-field resize-none ${error ? 'border-[var(--color-danger)]' : ''} ${className}`}
        rows={3}
        {...props}
      />
      {error && (
        <span className="text-xs" style={{ color: 'var(--color-danger)' }}>
          {error}
        </span>
      )}
    </div>
  );
}
