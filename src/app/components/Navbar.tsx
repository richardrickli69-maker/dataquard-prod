// src/app/components/Navbar.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';

const G = {
  green: '#22c55e',
  bg: '#f8f9fb',
  bgWhite: '#ffffff',
  border: '#e2e4ea',
  text: '#1a1a2e',
  textSec: '#555566',
};

export function Navbar() {
  return (
    <nav style={{ position: 'sticky', top: 0, zIndex: 50, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 28px', background: G.bgWhite, borderBottom: `1px solid ${G.border}`, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Image src="/logo.png" alt="Dataquard" width={256} height={256} style={{ height: 40, width: 'auto' }} />
        <span style={{ fontWeight: 800, fontSize: 20, letterSpacing: -0.5 }}>
          <span style={{ color: G.green }}>Data</span><span style={{ color: G.text }}>quard</span>
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
        {[
          { l: 'Scanner', h: '/scanner' },
          { l: 'Datenschutz', h: '/datenschutz-generator' },
          { l: 'Impressum', h: '/impressum-generator' },
          { l: 'Preise', h: '#preise' },
          { l: 'AGB', h: '/agb' },
        ].map(n => (
          <Link key={n.l} href={n.h} style={{ color: G.textSec, fontSize: 13, fontWeight: 500, textDecoration: 'none' }}>{n.l}</Link>
        ))}
        <Link href="/scanner" style={{ padding: '8px 20px', background: G.green, color: '#fff', fontWeight: 700, borderRadius: 8, fontSize: 12, textDecoration: 'none' }}>Jetzt scannen</Link>
      </div>
    </nav>
  );
}
