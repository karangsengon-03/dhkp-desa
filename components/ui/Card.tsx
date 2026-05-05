'use client';

import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: boolean;
  interactive?: boolean;
  onClick?: () => void;
}

export function Card({ children, className = '', padding = true, interactive = false, onClick }: CardProps) {
  return (
    <div
      className={`${interactive ? 'card-interactive' : 'card'} ${padding ? '' : ''} ${className}`}
      style={padding ? { padding: 'var(--s4)' } : undefined}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
