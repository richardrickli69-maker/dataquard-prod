// src/app/components/PageWrapper.tsx
import Link from 'next/link';
import { Navbar } from './Navbar';

export function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fb', color: '#1a1a2e', fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      <Navbar />
      <main>{children}</main>
      <footer style={{ borderTop: '1px solid #e2e4ea', background: '#ffffff', padding: '20px 28px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginBottom: 14, fontSize: 11, color: '#888899', flexWrap: 'wrap' }}>
            <span>🇨🇭 Server in Zürich</span>
            <span>🔒 SSL-verschlüsselt</span>
            <span>⚖️ nDSG-konform</span>
            <span>🛡️ Keine Datenweitergabe</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <span style={{ fontSize: 12, color: '#888899' }}>
              <span style={{ fontWeight: 800 }}>
                <span style={{ color: '#22c55e' }}>Data</span>
                <span style={{ color: '#1a1a2e' }}>quard</span>
              </span>
              {' '}© 2026 · Basel, Schweiz
            </span>
            <div style={{ display: 'flex', gap: 16, alignItems: 'center', fontSize: 12, flexWrap: 'wrap' }}>
              {[
                { l: 'Scanner', h: '/scanner' },
                { l: 'Datenschutz', h: '/datenschutz' },
                { l: 'Impressum', h: '/impressum-generator' },
                { l: 'Preise', h: '/#preise' },
                { l: 'AGB', h: '/agb' },
              ].map(n => (
                <Link key={n.l} href={n.h} style={{ color: '#888899', textDecoration: 'none' }}>{n.l}</Link>
              ))}
              <Link href="/auth" style={{ padding: '5px 14px', border: '2px solid #22c55e', color: '#22c55e', borderRadius: 6, fontSize: 11, fontWeight: 600, textDecoration: 'none' }}>Anmelden</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
