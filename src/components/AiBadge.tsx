'use client';

/**
 * AiBadge – KI-Inhalts-Siegel (EU AI Act Art. 50)
 * Zeigt an, ob eine Website auf KI-generierte Inhalte geprüft wurde.
 */

import { useState } from 'react';

interface AiBadgeProps {
  /** Größe in Pixel (default: 48) */
  size?: number;
  /** Ergebnis: verified = geprüft + kein Risiko, warning = KI erkannt, unchecked = nicht geprüft */
  status?: 'verified' | 'warning' | 'unchecked';
  /** Positionierung: fixed bottom-right (default) oder inline */
  position?: 'fixed' | 'inline';
  /** Zusätzliche CSS-Klassen */
  className?: string;
}

const STATUS_CONFIG = {
  verified: {
    checkColor: '#22c55e',
    shieldStroke: '#22c55e',
    label: 'KI-Inhalt – Geprüft von Dataquard',
    ringColor: '#22c55e',
  },
  warning: {
    checkColor: '#f59e0b',
    shieldStroke: '#f59e0b',
    label: 'KI-Inhalt erkannt – Kennzeichnungspflicht geprüft (Art. 50 EU AI Act)',
    ringColor: '#f59e0b',
  },
  unchecked: {
    checkColor: '#94a3b8',
    shieldStroke: '#4A90E2',
    label: 'KI-Inhaltsanalyse – nicht geprüft',
    ringColor: '#94a3b8',
  },
};

export function AiBadge({
  size = 48,
  status = 'verified',
  position = 'fixed',
  className = '',
}: AiBadgeProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const config = STATUS_CONFIG[status];

  const positionStyle: React.CSSProperties =
    position === 'fixed'
      ? { position: 'fixed', bottom: 20, right: 20, zIndex: 9999 }
      : { position: 'relative', display: 'inline-flex' };

  return (
    <div
      style={positionStyle}
      className={className}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      onFocus={() => setShowTooltip(true)}
      onBlur={() => setShowTooltip(false)}
      role="img"
      aria-label={config.label}
      tabIndex={0}
    >
      {/* Tooltip */}
      {showTooltip && (
        <div
          style={{
            position: 'absolute',
            bottom: size + 8,
            right: 0,
            background: 'rgba(26,26,46,0.95)',
            backdropFilter: 'blur(8px)',
            color: '#ffffff',
            fontSize: 11,
            fontWeight: 600,
            padding: '6px 10px',
            borderRadius: 7,
            whiteSpace: 'nowrap',
            boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
            pointerEvents: 'none',
            letterSpacing: 0.2,
          }}
        >
          {config.label}
          <div
            style={{
              position: 'absolute',
              top: '100%',
              right: size / 2 - 4,
              width: 0,
              height: 0,
              borderLeft: '5px solid transparent',
              borderRight: '5px solid transparent',
              borderTop: '5px solid rgba(26,26,46,0.95)',
            }}
          />
        </div>
      )}

      {/* SVG Badge */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          cursor: 'pointer',
          opacity: 0.9,
          filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.18))',
          transition: 'opacity 0.2s, transform 0.2s',
        }}
        onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
        onMouseLeave={e => (e.currentTarget.style.opacity = '0.9')}
      >
        {/* Schild */}
        <path
          d="M60 10L95 25V55C95 80 77 100 60 108C43 100 25 80 25 55V25L60 10Z"
          stroke={config.shieldStroke}
          strokeWidth="3"
          fill="none"
          strokeLinejoin="round"
        />
        {/* AI-Verbindungslinien */}
        <path
          d="M45 40H60M60 40V55M60 55H75"
          stroke={config.shieldStroke}
          strokeWidth="2"
          strokeLinecap="round"
        />
        {/* Knotenpunkte */}
        <circle cx="45" cy="40" r="2" fill={config.shieldStroke} />
        <circle cx="60" cy="55" r="2" fill={config.shieldStroke} />
        <circle cx="75" cy="40" r="2" fill={config.shieldStroke} />
        {/* AI Text */}
        <text
          x="60"
          y="70"
          textAnchor="middle"
          fontFamily="Arial, sans-serif"
          fontSize="22"
          fontWeight="bold"
          fill={config.shieldStroke}
        >
          AI
        </text>
        {/* Check-Kreis */}
        <circle cx="88" cy="82" r="14" fill={config.checkColor} opacity="0.9" />
        <path
          d="M82 82L87 87L95 77"
          stroke="white"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Äusserer Ring */}
        <circle
          cx="60"
          cy="60"
          r="55"
          stroke={config.ringColor}
          strokeWidth="1"
          strokeDasharray="3 4"
          opacity="0.35"
        />
      </svg>
    </div>
  );
}
