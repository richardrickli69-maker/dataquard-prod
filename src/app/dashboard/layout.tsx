import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Ihr Dataquard Dashboard — Scans, Compliance-Dokumente, Abo-Verwaltung.',
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
