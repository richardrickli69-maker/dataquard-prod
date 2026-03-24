import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Website scannen',
  description: 'Scannen Sie Ihre Website kostenlos auf nDSG/DSGVO-Compliance, Performance, Security und KI-Bilder. Ergebnis in 60 Sekunden.',
  alternates: { canonical: 'https://www.dataquard.ch/scanner' },
};

export default function ScannerLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
