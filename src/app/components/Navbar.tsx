// src/app/components/Navbar.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';

export function Navbar() {
  return (
    <nav className="w-full sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">

        {/* Logo – ganz links */}
        <div className="flex items-center">
          <Link href="/" className="flex items-center gap-3" style={{ textDecoration: 'none' }}>
            <Image
              src="/logo.png"
              alt="Dataquard"
              width={256}
              height={256}
              style={{ height: 36, width: 'auto', objectFit: 'contain' }}
              priority
            />
            <span style={{ fontWeight: 800, fontSize: 20, letterSpacing: -0.5 }}>
              <span style={{ color: '#22c55e' }}>Data</span>
              <span style={{ color: '#1a1a2e' }}>quard</span>
            </span>
          </Link>
        </div>

        {/* Login – ganz rechts */}
        <div className="flex items-center">
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

      </div>
    </nav>
  );
}
