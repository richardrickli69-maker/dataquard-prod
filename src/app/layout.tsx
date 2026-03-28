// src/app/layout.tsx
import CookieBanner from "@/components/CookieBanner/CookieBanner";
import { Analytics } from '@vercel/analytics/react';
import type { Metadata } from 'next';
import { SoftwareApplicationSchema, OrganizationSchema, KiTransparenzSchema, WebSiteSchema } from '@/components/seo/SchemaOrg';

export const metadata: Metadata = {
  title: {
    default: 'Dataquard – Der Schweizer Website-Check für Compliance, Performance, Security & AI-Trust',
    template: '%s | Dataquard',
  },
  description: 'Der einzige Schweizer Website-Check mit 4-Säulen-Analyse: Compliance, Performance, Security und AI-Trust — gleichzeitig geprüft, direkt behoben. Erkennt automatisch KI-generierte Bilder und Deepfakes nach EU AI Act Art. 50.',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: 'Dataquard – Der Schweizer Website-Check für Compliance, Performance, Security & AI-Trust',
    description: 'Der einzige Schweizer Website-Check mit 4-Säulen-Analyse: Compliance, Performance, Security und AI-Trust — gleichzeitig geprüft, direkt behoben. Erkennt automatisch KI-generierte Bilder und Deepfakes nach EU AI Act Art. 50.',
    url: 'https://www.dataquard.ch',
    siteName: 'Dataquard',
    locale: 'de_CH',
    type: 'website',
    images: [{ url: 'https://www.dataquard.ch/logo-dataquard.png', width: 512, height: 512, alt: 'Dataquard Logo' }],
  },
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
        <WebSiteSchema />
        <SoftwareApplicationSchema />
        <OrganizationSchema />
        <KiTransparenzSchema />
      </head>
      <body>
        {children}
        <CookieBanner />
        <Analytics />
      </body>
    </html>
  );
}
