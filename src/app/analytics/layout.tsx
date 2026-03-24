import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Analytics',
  description: 'Dataquard Analytics — Echtzeit-Daten.',
  robots: 'noindex, nofollow',
};

export default function AnalyticsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
