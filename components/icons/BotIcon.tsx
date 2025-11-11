import React from 'react';

export const BotIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
  >
    <defs>
      <linearGradient id="logo-gradient" x1="0.5" y1="1" x2="0.5" y2="0">
        <stop offset="0%" stopColor="#3B82F6" />
        <stop offset="100%" stopColor="#22C55E" />
      </linearGradient>
    </defs>
    <path
      d="M12 21C12 21 4 15.63 4 10a8 8 0 1116 0c0 5.63-8 11-8 11z"
      stroke="url(#logo-gradient)"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <g fill="#F97316">
      <circle cx="12" cy="7.5" r="2.5" />
      <path d="M16.5 11.5 C16.5 12.5 15 13 15 14 L15 18 C15 19 9 19 9 18 L9 14 C9 13 7.5 12.5 7.5 11.5 C9.5 10 14.5 10 16.5 11.5 Z" />
    </g>
  </svg>
);