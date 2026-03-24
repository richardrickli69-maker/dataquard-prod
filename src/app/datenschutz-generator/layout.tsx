import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Datenschutzerklärung erstellen',
  description: 'Erstellen Sie Ihre nDSG/DSGVO-konforme Datenschutzerklärung in Minuten — automatisch basierend auf Ihrer Website.',
  alternates: { canonical: 'https://www.dataquard.ch/datenschutz-generator' },
};

export default function DatenschutzGeneratorLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
