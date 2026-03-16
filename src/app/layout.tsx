// src/app/layout.tsx
import CookieBanner from "@/components/CookieBanner/CookieBanner";
import type { Metadata } from 'next';
import { SoftwareApplicationSchema, OrganizationSchema, KiTransparenzSchema } from '@/components/seo/SchemaOrg';

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
        {/* KI-Transparenz-Meta-Tags gemäss EU AI Act Art. 50 (5 Tags für maximale Konfidenz) */}
        <meta name="ai-content-declaration" content="Teile dieser Website wurden mit KI-Unterstützung (Anthropic Claude) erstellt. Alle Inhalte wurden manuell geprüft." />
        <meta name="ai-policy" content="https://www.dataquard.ch/ki-transparenz" />
        <meta name="ai-tools-used" content="Anthropic Claude (Textgenerierung), Sightengine (KI-Bild-Erkennung)" />
        <meta name="ai-content-percentage" content="partial" />
        <meta name="ai-human-oversight" content="all-content-reviewed" />
        <SoftwareApplicationSchema />
        <OrganizationSchema />
        <KiTransparenzSchema />
      </head>
      <body>
        {children}
        <CookieBanner />
      </body>
    </html>
  );
}
