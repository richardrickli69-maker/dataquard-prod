// src/app/layout.task.tsx
// ÄNDERUNG: ChatBot (Assistant) entfernt
import CookieBanner from "@/components/CookieBanner/CookieBanner";
import type { Metadata } from 'next';
import { SoftwareApplicationSchema, OrganizationSchema } from '@/components/seo/SchemaOrg';

export const metadata: Metadata = {
  title: 'Dataquard – 4-Säulen-Analyse: Compliance, Performance, Security & AI-Trust',
  description: 'Der einzige Schweizer Website-Check mit 4-Säulen-Analyse: Compliance, Performance, Security und AI-Trust (KI-Bild-Erkennung & Deepfake-Check nach EU AI Act Art. 50). Datenschutzerklärung & Impressum für KMU – nDSG/DSGVO-konform.',
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
