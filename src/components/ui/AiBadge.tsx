'use client';
import React, { useState } from 'react';

interface AiBadgeProps {
  size?: number;
  tooltipText?: string;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'inline';
  className?: string;
  onClick?: () => void;
}

const POSITION_CLASSES: Record<NonNullable<AiBadgeProps['position']>, string> = {
  'bottom-right': 'absolute bottom-3 right-3',
  'bottom-left':  'absolute bottom-3 left-3',
  'top-right':    'absolute top-3 right-3',
  'top-left':     'absolute top-3 left-3',
  'inline':       'relative',
};

export default function AiBadge({
  size = 56,
  tooltipText = 'KI-Inhalt – Geprüft von Dataquard',
  position = 'bottom-right',
  className = '',
  onClick,
}: AiBadgeProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const isClickable = !!onClick;

  return (
    <div
      className={`${POSITION_CLASSES[position]} z-10 ${className}`}
      style={{ width: size, height: size }}
    >
      <div
        className={`relative flex items-center justify-center rounded-full bg-white/10 backdrop-blur-sm transition-all duration-200 ${isClickable ? 'cursor-pointer hover:scale-110 hover:bg-white/20' : ''}`}
        style={{ width: size, height: size, opacity: 0.85 }}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onClick={onClick}
        role={isClickable ? 'button' : undefined}
        tabIndex={isClickable ? 0 : undefined}
        aria-label={tooltipText}
      >
        <svg
          width={size}
          height={size}
          viewBox="0 0 120 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path d="M60 10L95 25V55C95 80 77 100 60 108C43 100 25 80 25 55V25L60 10Z" stroke="#4A90E2" strokeWidth="3" fill="none" strokeLinejoin="round"/>
          <path d="M45 40H60M60 40V55M60 55H75" stroke="#4A90E2" strokeWidth="2" strokeLinecap="round"/>
          <circle cx="45" cy="40" r="2" fill="#4A90E2"/>
          <circle cx="60" cy="55" r="2" fill="#4A90E2"/>
          <circle cx="75" cy="40" r="2" fill="#4A90E2"/>
          <text x="60" y="70" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="22" fontWeight="bold" fill="#4A90E2">AI</text>
          <circle cx="88" cy="82" r="14" fill="#6FBF73" opacity="0.9"/>
          <path d="M82 82L87 87L95 77" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="60" cy="60" r="55" stroke="#6FBF73" strokeWidth="1" strokeDasharray="3 4" opacity="0.35"/>
        </svg>
      </div>

      {showTooltip && (
        <div
          className="absolute z-20 bottom-full mb-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-900/90 px-3 py-1.5 text-xs font-medium text-white shadow-lg pointer-events-none"
          role="tooltip"
        >
          {tooltipText}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900/90"/>
        </div>
      )}
    </div>
  );
}
