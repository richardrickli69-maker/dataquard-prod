// src/app/layout.tsx
import CookieBanner from "@/components/CookieBanner/CookieBanner";
import { Analytics } from '@vercel/analytics/react';
import type { Metadata } from 'next';
import { SoftwareApplicationSchema, OrganizationSchema, KiTransparenzSchema, WebSiteSchema } from '@/components/seo/SchemaOrg';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.dataquard.ch'),
  title: {
    default: 'Dataquard — Der Schweizer Website-Check für KMU | KI-Bilder, Compliance & Sicherheit',
    template: '%s | Dataquard',
  },
  description: 'Scannen Sie Ihre Website in 60 Sekunden: KI-Bilder erkennen, Datenschutz prüfen, Sicherheit checken. Schweizer Produkt, Daten in Zürich. Kostenlos starten.',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: 'Dataquard — Der Schweizer Website-Check für KMU | KI-Bilder, Compliance & Sicherheit',
    description: 'Scannen Sie Ihre Website in 60 Sekunden: KI-Bilder erkennen, Datenschutz prüfen, Sicherheit checken. Schweizer Produkt, Daten in Zürich. Kostenlos starten.',
    url: 'https://www.dataquard.ch',
    siteName: 'Dataquard',
    locale: 'de_CH',
    type: 'website',
    images: [{ url: 'https://www.dataquard.ch/opengraph-image', width: 1200, height: 630, alt: 'Dataquard — Der Schweizer Compliance-Scanner' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dataquard — Der Schweizer Website-Check für KMU | KI-Bilder, Compliance & Sicherheit',
    description: 'Scannen Sie Ihre Website in 60 Sekunden: KI-Bilder erkennen, Datenschutz prüfen, Sicherheit checken. Schweizer Produkt, Daten in Zürich.',
    images: ['https://www.dataquard.ch/opengraph-image'],
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
