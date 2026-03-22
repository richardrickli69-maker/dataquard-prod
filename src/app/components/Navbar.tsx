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
// Smart Header: versteckt beim Runterscrollen, erscheint beim Hochscrollen
'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';

export function Navbar() {
  // true = Header nach oben wegschieben
  const [hidden, setHidden] = useState(false);
  // Letzten Scroll-Y-Wert für Richtungsvergleich speichern
  const prevScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;

      if (currentY < 80) {
        // Ganz oben: Header immer sichtbar
        setHidden(false);
      } else if (currentY > prevScrollY.current) {
        // Runterscrollen: Header verstecken
        setHidden(true);
      } else {
        // Hochscrollen: Header zeigen
        setHidden(false);
      }

      prevScrollY.current = currentY;
    };

    // { passive: true } für bessere Scroll-Performance
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <style>{`
        /* ── Platzhalter: hält Platz für den fixed Header im Dokumentfluss ── */
        .dq-navbar-placeholder {
          height: 108px; /* Desktop: 80px Logo + 2×14px Padding */
        }

        /* ── Eigentliche Navbar: fixed, mit Slide-Transition ── */
        .dq-navbar {
          width: 100%;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 50;
          background: rgba(255,255,255,0.85);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-bottom: 1px solid #e2e4ea;
          /* Smooth Slide-Animation */
          transform: translateY(0);
          transition: transform 300ms ease;
        }

        /* Versteckter Zustand: Header nach oben schieben */
        .dq-navbar.dq-navbar--hidden {
          transform: translateY(-100%);
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
          .dq-navbar-placeholder {
            height: 88px; /* 64px Logo + 2×12px Padding */
          }
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
          .dq-navbar-placeholder {
            height: 72px; /* 52px Logo + 2×10px Padding */
          }
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

      {/* Platzhalter verhindert Content-Sprung beim Wechsel zu fixed */}
      <div className="dq-navbar-placeholder" aria-hidden="true" />

      <nav className={`dq-navbar${hidden ? ' dq-navbar--hidden' : ''}`}>
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
