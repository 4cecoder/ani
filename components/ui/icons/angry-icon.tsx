import React from 'react';

interface AngryIconProps {
  size?: number;
  className?: string;
}

export function AngryIcon({ size = 24, className = '' }: AngryIconProps) {
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
      <path
        d="M8 14s1.5 2 4 2 4-2 4-2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M9 9h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M15 9h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M8 9l2 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 9l-2 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}