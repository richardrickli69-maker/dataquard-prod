// src/app/components/Navbar.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';

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
          height: 52px;
          width: auto;
          object-fit: contain;
          flex-shrink: 0;
        }
        .dq-logo-text {
          height: 22px;
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
            height: 44px;
          }
          .dq-logo-text {
            height: 18px;
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
            height: 36px;
          }
          .dq-logo-text {
            height: 15px;
          }
        }
      `}</style>

      <nav className="dq-navbar">
        <div className="dq-navbar-inner">
          <Link href="/" className="dq-logo-link">
            <Image
              src="/logo-dataquard.png"
              alt="Dataquard Logo"
              width={220}
              height={176}
              className="dq-logo-shield"
              priority
            />
            <Image
              src="/schriftzug-dataquard.png"
              alt="Dataquard"
              width={400}
              height={80}
              className="dq-logo-text"
              priority
            />
          </Link>
        </div>
      </nav>
    </>
  );
}
