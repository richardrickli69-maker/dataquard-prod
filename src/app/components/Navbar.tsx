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
// Navigation: Tools | AI-Trust | Preise | FAQ | Mein Konto | [Kostenlos scannen]
'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { createBrowserClient } from '@supabase/ssr';

export function Navbar() {
  // true = Header nach oben wegschieben
  const [hidden, setHidden] = useState(false);
  // Letzten Scroll-Y-Wert für Richtungsvergleich speichern
  const prevScrollY = useRef(0);
  // Hamburger-Menü auf Mobile
  const [mobileOpen, setMobileOpen] = useState(false);
  // Eingeloggt-Status für "Mein Konto" Link
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Supabase Auth-Status prüfen
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    supabase.auth.getSession().then(({ data }) => {
      setIsLoggedIn(!!data.session);
    });

    // Auth-Änderungen live verfolgen (Login/Logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

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

  // Mobile-Menü schliessen wenn geklickt
  const closeMobile = () => setMobileOpen(false);

  return (
    <>
      <style>{`
        /* ── Platzhalter: hält Platz für den fixed Header im Dokumentfluss ── */
        .dq-navbar-placeholder {
          height: 72px;
        }

        /* ── Eigentliche Navbar: fixed, mit Slide-Transition ── */
        .dq-navbar {
          width: 100%;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 50;
          background: rgba(255,255,255,0.95);
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
          max-width: 1100px;
          margin: 0 auto;
          padding: 0 24px;
          height: 72px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
        }

        /* Logo */
        .dq-logo-link {
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 10px;
          flex-shrink: 0;
        }
        .dq-logo-shield {
          height: 52px;
          width: auto;
          object-fit: contain;
          flex-shrink: 0;
        }
        .dq-logo-text {
          height: 32px;
          width: auto;
          object-fit: contain;
          flex-shrink: 0;
        }

        /* Desktop Nav Links */
        .dq-nav-links {
          display: flex;
          align-items: center;
          gap: 4px;
          flex: 1;
          justify-content: center;
        }
        .dq-nav-link {
          padding: 8px 12px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          color: #555566;
          text-decoration: none;
          transition: color 0.15s, background 0.15s;
          white-space: nowrap;
        }
        .dq-nav-link:hover {
          color: #1a1a2e;
          background: #f1f2f6;
        }

        /* Rechts: Mein Konto + CTA-Button */
        .dq-nav-right {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
        }
        .dq-nav-account {
          font-size: 13px;
          font-weight: 500;
          color: #888899;
          text-decoration: none;
          padding: 8px 10px;
          border-radius: 8px;
          transition: color 0.15s;
          white-space: nowrap;
        }
        .dq-nav-account:hover {
          color: #1a1a2e;
        }
        .dq-nav-cta {
          display: inline-flex;
          align-items: center;
          padding: 8px 16px;
          background: #22c55e;
          color: #fff !important;
          font-size: 13px;
          font-weight: 700;
          border-radius: 10px;
          text-decoration: none;
          transition: background 0.15s;
          white-space: nowrap;
          border: none;
          cursor: pointer;
        }
        .dq-nav-cta:hover {
          background: #16a34a;
        }

        /* Hamburger Button (nur Mobile) */
        .dq-hamburger {
          display: none;
          flex-direction: column;
          justify-content: center;
          gap: 5px;
          width: 36px;
          height: 36px;
          background: transparent;
          border: none;
          cursor: pointer;
          padding: 4px;
          flex-shrink: 0;
        }
        .dq-hamburger span {
          display: block;
          height: 2px;
          background: #1a1a2e;
          border-radius: 2px;
          transition: transform 0.2s, opacity 0.2s;
        }

        /* Mobile Overlay-Menü */
        .dq-mobile-menu {
          display: none;
          position: fixed;
          top: 72px;
          left: 0;
          right: 0;
          background: #fff;
          border-bottom: 1px solid #e2e4ea;
          z-index: 49;
          padding: 16px 24px 24px;
          flex-direction: column;
          gap: 4px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.08);
        }
        .dq-mobile-menu.dq-mobile-open {
          display: flex;
        }
        .dq-mobile-link {
          display: block;
          padding: 12px 14px;
          font-size: 15px;
          font-weight: 500;
          color: #555566;
          text-decoration: none;
          border-radius: 8px;
          transition: background 0.15s;
        }
        .dq-mobile-link:hover {
          background: #f1f2f6;
          color: #1a1a2e;
        }
        .dq-mobile-divider {
          height: 1px;
          background: #e2e4ea;
          margin: 8px 0;
        }
        .dq-mobile-cta {
          display: block;
          text-align: center;
          padding: 13px;
          background: #22c55e;
          color: #fff;
          font-weight: 700;
          font-size: 15px;
          border-radius: 10px;
          text-decoration: none;
          margin-top: 8px;
          transition: background 0.15s;
        }
        .dq-mobile-cta:hover {
          background: #16a34a;
        }
        .dq-mobile-account {
          display: block;
          text-align: center;
          padding: 10px;
          color: #888899;
          font-size: 14px;
          font-weight: 500;
          text-decoration: none;
          border: 1px solid #e2e4ea;
          border-radius: 8px;
          margin-top: 4px;
          transition: color 0.15s;
        }
        .dq-mobile-account:hover {
          color: #1a1a2e;
        }

        /* Responsive: Tablet und kleiner */
        @media (max-width: 860px) {
          .dq-nav-links {
            display: none;
          }
          .dq-nav-right {
            display: none;
          }
          .dq-hamburger {
            display: flex;
          }
        }

        /* Kleines Mobile */
        @media (max-width: 480px) {
          .dq-navbar-placeholder {
            height: 64px;
          }
          .dq-navbar-inner {
            height: 64px;
            padding: 0 16px;
          }
          .dq-mobile-menu {
            top: 64px;
          }
          .dq-logo-shield {
            height: 44px;
          }
          .dq-logo-text {
            height: 26px;
          }
        }
      `}</style>

      {/* Platzhalter verhindert Content-Sprung beim Wechsel zu fixed */}
      <div className="dq-navbar-placeholder" aria-hidden="true" />

      <nav className={`dq-navbar${hidden ? ' dq-navbar--hidden' : ''}`}>
        <div className="dq-navbar-inner">

          {/* Logo */}
          <Link href="/" className="dq-logo-link" onClick={closeMobile}>
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

          {/* Desktop: Nav Links zentriert */}
          <div className="dq-nav-links">
            <Link href="/tools" className="dq-nav-link">Tools</Link>
            <Link href="/ai-trust" className="dq-nav-link">AI-Trust</Link>
            <Link href="/preise" className="dq-nav-link">Preise</Link>
            <Link href="/faq" className="dq-nav-link">FAQ</Link>
          </div>

          {/* Desktop: Mein Konto + CTA */}
          <div className="dq-nav-right">
            <Link
              href={isLoggedIn ? '/dashboard' : '/auth'}
              className="dq-nav-account"
            >
              Mein Konto
            </Link>
            <Link href="/scanner" className="dq-nav-cta">
              Kostenlos scannen →
            </Link>
          </div>

          {/* Mobile: Hamburger Button */}
          <button
            className="dq-hamburger"
            onClick={() => setMobileOpen(o => !o)}
            aria-label={mobileOpen ? 'Menü schliessen' : 'Menü öffnen'}
          >
            <span style={{ transform: mobileOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none' }} />
            <span style={{ opacity: mobileOpen ? 0 : 1 }} />
            <span style={{ transform: mobileOpen ? 'rotate(-45deg) translate(5px, -5px)' : 'none' }} />
          </button>
        </div>
      </nav>

      {/* Mobile Overlay-Menü */}
      <div className={`dq-mobile-menu${mobileOpen ? ' dq-mobile-open' : ''}`}>
        <Link href="/tools" className="dq-mobile-link" onClick={closeMobile}>Tools</Link>
        <Link href="/ai-trust" className="dq-mobile-link" onClick={closeMobile}>AI-Trust</Link>
        <Link href="/preise" className="dq-mobile-link" onClick={closeMobile}>Preise</Link>
        <Link href="/faq" className="dq-mobile-link" onClick={closeMobile}>FAQ</Link>
        <div className="dq-mobile-divider" />
        <Link
          href={isLoggedIn ? '/dashboard' : '/auth'}
          className="dq-mobile-account"
          onClick={closeMobile}
        >
          Mein Konto
        </Link>
        <Link href="/scanner" className="dq-mobile-cta" onClick={closeMobile}>
          Kostenlos scannen →
        </Link>
      </div>
    </>
  );
}
