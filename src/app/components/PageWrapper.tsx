// src/app/components/PageWrapper.tsx
// Footer v2: 3-Spalten-Layout (Produkt, Rechtliches, Support) + KI-Transparenz-Hinweis
import Link from 'next/link';
import { Navbar } from './Navbar';

export function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fb', color: '#1a1a2e', fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      <Navbar />
      <main>{children}</main>
      <footer style={{ background: '#1a1a2e', color: '#aaaabc', borderTop: '1px solid #2a2a44' }}>
        <style>{`
          @media (max-width: 640px) {
            .dq-footer-grid { grid-template-columns: 1fr !important; gap: 28px !important; }
          }
        `}</style>
        <div className="dq-footer-grid" style={{ maxWidth: 1000, margin: '0 auto', padding: '48px 24px 32px', display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 48 }}>

          {/* Spalte 1: Produkt */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#555570', marginBottom: 16 }}>Produkt</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { l: 'Scanner', h: '/scanner' },
                { l: 'Tools', h: '/tools' },
                { l: 'KI-Sicherheit', h: '/ki-sicherheit' },
                { l: 'Preise', h: '/preise' },
              ].map(n => (
                <Link key={n.l} href={n.h} style={{ color: '#aaaabc', textDecoration: 'none', fontSize: 14 }}>{n.l}</Link>
              ))}
            </div>
          </div>

          {/* Spalte 2: Rechtliches */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#555570', marginBottom: 16 }}>Rechtliches</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { l: 'AGB', h: '/agb' },
                { l: 'Datenschutz', h: '/datenschutz' },
                { l: 'Impressum', h: '/impressum' },
              ].map(n => (
                <Link key={n.l} href={n.h} style={{ color: '#aaaabc', textDecoration: 'none', fontSize: 14 }}>{n.l}</Link>
              ))}
            </div>
          </div>

          {/* Spalte 3: Support */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#555570', marginBottom: 16 }}>Support</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Link href="/faq" style={{ color: '#aaaabc', textDecoration: 'none', fontSize: 14 }}>FAQ</Link>
              <a href="mailto:info@dataquard.ch" style={{ color: '#aaaabc', textDecoration: 'none', fontSize: 14 }}>info@dataquard.ch</a>
              <a href="mailto:support@dataquard.ch" style={{ color: '#aaaabc', textDecoration: 'none', fontSize: 14 }}>support@dataquard.ch</a>
            </div>
          </div>
        </div>

        {/* Footer Bottom: Copyright + KI-Transparenz */}
        <div style={{ borderTop: '1px solid #2a2a44', padding: '20px 24px' }}>
          <div style={{ maxWidth: 1000, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <span style={{ fontSize: 12, color: '#555570' }}>© 2026 Dataquard · Reinach BL · Schweiz</span>
            <span style={{ fontSize: 11, color: '#444458', display: 'flex', alignItems: 'center', gap: 6 }}>
              <img src="/energie.png" alt="" width={13} height={13} style={{ flexShrink: 0 }} />
              KI-Transparenz gemäss EU AI Act Art. 50{' '}
              <Link href="/ki-transparenz" style={{ color: '#22c55e', textDecoration: 'none' }}>→</Link>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
