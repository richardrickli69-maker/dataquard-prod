import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Impressum erstellen',
  description: 'Erstellen Sie Ihr rechtssicheres Impressum für die Schweiz — kostenlos, nDSG-konform, sofort einsetzbar.',
  alternates: { canonical: 'https://www.dataquard.ch/impressum-generator' },
};

export default function ImpressumGeneratorLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
