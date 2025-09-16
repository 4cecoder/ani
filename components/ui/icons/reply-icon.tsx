import React from 'react';

interface ReplyIconProps {
  size?: number;
  className?: string;
}

export function ReplyIcon({ size = 24, className = '' }: ReplyIconProps) {
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
      <path
        d="M3 10h10a8 8 0 0 1 8 8v2M3 10l6 6m-6-6l6-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}