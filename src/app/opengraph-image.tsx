// src/app/opengraph-image.tsx
// Generiert das Open Graph Preview-Bild für Social-Media-Shares (WhatsApp, LinkedIn, Slack etc.)
import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Dataquard — Der Schweizer Compliance-Scanner';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#0a0f1e',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        {/* Logo-Icon */}
        <img
          src="https://www.dataquard.ch/logo-dataquard.png"
          width={140}
          height={140}
          style={{ marginBottom: 24 }}
        />

        {/* Untertitel */}
        <div
          style={{
            color: '#94a3b8',
            fontSize: 30,
            fontWeight: 400,
            marginBottom: 48,
            display: 'flex',
          }}
        >
          Der Schweizer Compliance-Scanner
        </div>

        {/* 4 Säulen */}
        <div
          style={{
            display: 'flex',
            gap: 36,
          }}
        >
          {['Compliance', 'Performance', 'Security', 'KI-Sicherheit'].map((pillar) => (
            <div
              key={pillar}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <div
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  background: '#22c55e',
                  flexShrink: 0,
                }}
              />
              <span style={{ color: '#e2e8f0', fontSize: 22 }}>{pillar}</span>
            </div>
          ))}
        </div>

        {/* URL unten */}
        <div
          style={{
            position: 'absolute',
            bottom: 32,
            color: '#4b5563',
            fontSize: 18,
            display: 'flex',
          }}
        >
          www.dataquard.ch
        </div>
      </div>
    ),
    { ...size }
  );
}
