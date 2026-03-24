import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kauf erfolgreich',
  description: 'Vielen Dank für Ihr Dataquard Abo. Ihr Account ist jetzt aktiv.',
};

export default function CheckoutSuccessLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
