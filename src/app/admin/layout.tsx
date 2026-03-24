import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin',
  description: 'Dataquard Admin-Dashboard.',
  robots: 'noindex, nofollow',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
