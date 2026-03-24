import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Anmelden',
  description: 'Bei Dataquard anmelden oder registrieren. Ihr Schweizer Compliance-Dashboard wartet.',
  alternates: { canonical: 'https://www.dataquard.ch/auth' },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
