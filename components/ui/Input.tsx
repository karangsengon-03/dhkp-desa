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
    <div className={`flex flex-col ${wrapperClass}`} style={{ gap: '6px' }}>
      {label && (
        <label htmlFor={inputId} className="input-label">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`input-field ${error ? 'input-error' : ''} ${className}`}
        {...props}
      />
      {error && (
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--c-danger)' }}>
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
    <div className={`flex flex-col ${wrapperClass}`} style={{ gap: '6px' }}>
      {label && (
        <label htmlFor={inputId} className="input-label">
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        className={`input-field resize-none ${error ? 'input-error' : ''} ${className}`}
        style={{ height: 'auto', paddingTop: 'var(--sp-2)', paddingBottom: 'var(--sp-2)' }}
        rows={3}
        {...props}
      />
      {error && (
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--c-danger)' }}>
          {error}
        </span>
      )}
    </div>
  );
}
