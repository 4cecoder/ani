import React from 'react';

interface SurprisedIconProps {
  size?: number;
  className?: string;
}

export function SurprisedIcon({ size = 24, className = '' }: SurprisedIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="16" r="3" stroke="currentColor" strokeWidth="2" />
      <path d="M8 9h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M16 9h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}