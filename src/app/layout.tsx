// src/app/layout.task.tsx
// ÄNDERUNG: ChatBot (Assistant) entfernt
import CookieBanner from "@/components/CookieBanner/CookieBanner";
import type { Metadata } from 'next';
import { SoftwareApplicationSchema, OrganizationSchema } from '@/components/seo/SchemaOrg';

export const metadata: Metadata = {
  title: 'Dataquard – Website rechtssicher in 3 Minuten',
  description: 'Datenschutz-Generator für Schweizer KMUs – Datenschutzerklärung, Impressum & Compliance-Check. nDSG/DSGVO-konform.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <head>
        <meta name="cookie-consent-present" content="true" />
        <meta name="privacy-policy" content="/datenschutz" />
        <SoftwareApplicationSchema />
        <OrganizationSchema />
      </head>
      <body>
        {children}
        <CookieBanner />
      </body>
    </html>
  );
}
