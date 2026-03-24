import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Abo abschliessen',
  description: 'Dataquard Abo abschliessen — sicher via Stripe. Starter CHF 19.–/Mt. oder Professional CHF 39.–/Mt.',
  alternates: { canonical: 'https://www.dataquard.ch/checkout' },
};

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
