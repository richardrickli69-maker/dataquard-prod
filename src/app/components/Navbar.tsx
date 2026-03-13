// src/app/components/Navbar.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';

export function Navbar() {
  return (
    <nav className="w-full sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-28 flex items-center">

        {/* Logo + Schriftzug */}
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

      </div>
    </nav>
  );
}
