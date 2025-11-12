import React from 'react';
import { cn } from '@/lib/utils';
type ChatArborIconProps = React.SVGProps<SVGSVGElement>;
export function ChatArborIcon({ className, ...props }: ChatArborIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("w-6 h-6", className)}
      {...props}
    >
      <defs>
        <linearGradient id="teardropGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: 'rgb(96, 165, 250)', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: 'rgb(52, 211, 153)', stopOpacity: 1 }} />
        </linearGradient>
      </defs>
      <path
        d="M12 22C7.5 17.5 4 13.34 4 9.5C4 5.36 7.58 2 12 2s8 3.36 8 7.5c0 3.84-3.5 8-8 12.5z"
        fill="url(#teardropGradient)"
        stroke="none"
      />
      <g stroke="rgb(249, 115, 22)" strokeWidth="1.5">
        {/* Head */}
        <circle cx="12" cy="10" r="2" fill="rgb(249, 115, 22)" />
        {/* Body */}
        <line x1="12" y1="12" x2="12" y2="16" />
        {/* Arms */}
        <line x1="9" y1="12" x2="12" y2="14" />
        <line x1="15" y1="12" x2="12" y2="14" />
        {/* Legs */}
        <line x1="12" y1="16" x2="10" y2="19" />
        <line x1="12" y1="16" x2="14" y2="19" />
      </g>
    </svg>
  );
}