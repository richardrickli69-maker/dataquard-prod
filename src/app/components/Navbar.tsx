/*
 * ══════════════════════════════════════════
 * DATAQUARD DESIGN TOKENS
 * ══════════════════════════════════════════
 *
 * FARBEN:
 *   Primär (CTA/Akzent):    #22c55e (Electric Green)
 *   Primär Hover:            #16a34a (Dunkleres Grün)
 *   Hintergrund:             #ffffff (Weiss)
 *   Text Dunkel:             #1a1a2e
 *   Text Mittel:             #555566
 *   Text Hell:               #888899
 *   Border:                  #e2e4ea
 *   Card-BG:                 #f1f2f6
 *
 * TYPOGRAFIE:
 *   H1:            fontSize 46, fontWeight 900
 *   H2:            fontSize 24–30, fontWeight 800
 *   H3:            fontSize 18–20, fontWeight 700
 *   Section-Label: fontSize 12, fontWeight 700, uppercase
 *   Body:          fontSize 16
 *   Small:         fontSize 14
 *   Micro:         fontSize 12
 *
 * ICONS:
 *   Inline/Badges:  20–24px
 *   Checkmarks:     16px
 *   Card-Icons:     36–48px
 *   Section-Header: 40px
 *   Tabellen:       24px
 *
 * BUTTONS:
 *   Primär:    bg #22c55e, color white, padding '13px 32px', borderRadius 12, hover #16a34a
 *   Sekundär:  border '2px solid #22c55e', color #22c55e, padding '13px 32px', borderRadius 12
 *   Font:      fontWeight 700, fontSize 16
 *
 * LOGOS (Navbar):
 *   Desktop: shield 80px, text 48px
 *   Tablet:  shield 64px, text 36px
 *   Mobile:  shield 52px, text 28px
 * ══════════════════════════════════════════
 */

// src/app/components/Navbar.tsx
'use client';

import Link from 'next/link';

export function Navbar() {
  return (
    <>
      <style>{`
        .dq-navbar {
          width: 100%;
          position: sticky;
          top: 0;
          z-index: 50;
          background: rgba(255,255,255,0.85);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-bottom: 1px solid #e2e4ea;
        }
        .dq-navbar-inner {
          max-width: 860px;
          margin: 0 auto;
          padding: 14px 24px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .dq-logo-link {
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .dq-logo-shield {
          height: 80px;
          width: auto;
          object-fit: contain;
          flex-shrink: 0;
        }
        .dq-logo-text {
          height: 48px;
          width: auto;
          object-fit: contain;
          flex-shrink: 0;
        }

        /* Tablet */
        @media (max-width: 768px) {
          .dq-navbar-inner {
            padding: 12px 20px;
          }
          .dq-logo-shield {
            height: 64px;
          }
          .dq-logo-text {
            height: 36px;
          }
        }

        /* Mobile klein */
        @media (max-width: 480px) {
          .dq-navbar-inner {
            padding: 10px 16px;
          }
          .dq-logo-link {
            gap: 8px;
          }
          .dq-logo-shield {
            height: 52px;
          }
          .dq-logo-text {
            height: 28px;
          }
        }
      `}</style>

      <nav className="dq-navbar">
        <div className="dq-navbar-inner">
          <Link href="/" className="dq-logo-link">
            <img
              src="/logo-dataquard.png"
              alt="Dataquard Logo"
              className="dq-logo-shield"
            />
            <img
              src="/schriftzug-dataquard.png"
              alt="Dataquard"
              className="dq-logo-text"
            />
          </Link>
        </div>
      </nav>
    </>
  );
}
