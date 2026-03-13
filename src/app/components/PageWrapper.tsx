// src/app/components/PageWrapper.task.tsx
// ÄNDERUNGEN: Footer-Top: nur Login + Homebutton. Footer-Bottom: Scanner entfernt, nur Rechtliches.
import Link from 'next/link';
import { Navbar } from './Navbar';

export function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fb', color: '#1a1a2e', fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      <Navbar />
      <main>{children}</main>
      <footer style={{ borderTop: '1px solid #e2e4ea', background: '#ffffff', padding: '20px 28px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>

          {/* Oben: Startseite links, Anmelden rechts */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
            <Link href="/" style={{ padding: '6px 20px', border: '1px solid #e2e4ea', color: '#555566', borderRadius: 7, fontSize: 12, fontWeight: 600, textDecoration: 'none', background: '#f8f9fb' }}>
              🏠 Startseite
            </Link>
            <Link href="/auth" style={{ padding: '6px 20px', border: '2px solid #22c55e', color: '#22c55e', borderRadius: 7, fontSize: 12, fontWeight: 700, textDecoration: 'none' }}>
              Anmelden
            </Link>
          </div>

          {/* Unten: Copyright + Rechtliches (Scanner entfernt) */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, paddingTop: 14, borderTop: '1px solid #e2e4ea' }}>
            <span style={{ fontSize: 12, color: '#888899' }}>
              <span style={{ fontWeight: 800 }}>
                <span style={{ color: '#22c55e' }}>Data</span>
                <span style={{ color: '#1a1a2e' }}>quard</span>
              </span>
              {' '}© 2026 · Basel, Schweiz
            </span>
            <div style={{ display: 'flex', gap: 16, alignItems: 'center', fontSize: 12, flexWrap: 'wrap' }}>
              {[
                { l: 'Datenschutz', h: '/datenschutz' },
                { l: 'Impressum', h: '/impressum' },
                { l: 'AGB', h: '/agb' },
              ].map(n => (
                <Link key={n.l} href={n.h} style={{ color: '#888899', textDecoration: 'none' }}>{n.l}</Link>
              ))}
            </div>
          </div>

        </div>
      </footer>
    </div>
  );
}
