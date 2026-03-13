// src/app/components/Navbar.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';

export function Navbar() {
  return (
    <nav className="w-full sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-28 flex justify-between items-center">

        {/* Links: Logo + Schriftzug nebeneinander */}
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 14 }}>
          <Image
            src="/logo-dataquard.png"
            alt="Dataquard Logo"
            width={220}
            height={176}
            style={{ height: 110, width: 'auto', objectFit: 'contain' }}
            priority
          />
          <Image
            src="/schriftzug-dataquard.png"
            alt="Dataquard"
            width={400}
            height={80}
            style={{ height: 34, width: 'auto', objectFit: 'contain' }}
            priority
          />
        </Link>

        {/* Rechts: Anmelden */}
        <Link
          href="/auth"
          style={{
            padding: '8px 22px',
            border: '2px solid #22c55e',
            color: '#22c55e',
            fontWeight: 700,
            borderRadius: 8,
            fontSize: 13,
            textDecoration: 'none',
            whiteSpace: 'nowrap',
            display: 'inline-flex',
            alignItems: 'center',
            minHeight: 40,
          }}
        >
          Anmelden
        </Link>

      </div>
    </nav>
  );
}
