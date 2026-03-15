import React from 'react';

export function SoftwareApplicationSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Dataquard',
    url: 'https://www.dataquard.ch',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    offers: [
      { '@type': 'Offer', name: 'FREE', price: '0', priceCurrency: 'CHF' },
      { '@type': 'Offer', name: 'STARTER', price: '79', priceCurrency: 'CHF', billingIncrement: 'P1Y' },
      { '@type': 'Offer', name: 'PROFESSIONAL', price: '199', priceCurrency: 'CHF', billingIncrement: 'P1Y' },
    ],
    featureList: [
      'Compliance-Check (nDSG/DSGVO)',
      'Performance-Scan (Ladezeit, Scripts, Mobile)',
      'Security-Check (SSL, Impressum, HTTPS)',
      'AI-Trust (KI-Bild-Erkennung, Deepfake-Check, EU AI Act Art. 50)',
      'KI-generierte Datenschutzerklärung',
      'EU AI Act Art. 50 Klausel (automatisch)',
      'Ampel-Risikobewertung (4-Säulen)',
      'Schweizer Datenresidenz (Supabase Zürich)',
    ],
    description: 'Dataquard ist die einzige Schweizer Compliance-Plattform mit 4-Säulen-Analyse: Compliance, Performance, Security und AI-Trust. Automatischer Website-Scan auf nDSG/DSGVO-Konformität, KI-Bild-Erkennung und Deepfake-Check nach EU AI Act Art. 50.',
    softwareVersion: '2.0',
    datePublished: '2026-02-01',
    inLanguage: ['de', 'fr', 'it', 'en'],
    provider: {
      '@type': 'Organization',
      name: 'Dataquard',
      url: 'https://www.dataquard.ch',
      areaServed: ['CH', 'DE', 'AT'],
    },
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />;
}

export function OrganizationSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Dataquard',
    url: 'https://www.dataquard.ch',
    logo: 'https://www.dataquard.ch/logo-dataquard.png',
    foundingDate: '2026',
    foundingLocation: { '@type': 'Place', addressLocality: 'Reinach BL', addressCountry: 'CH' },
    areaServed: [
      { '@type': 'Country', name: 'Schweiz' },
      { '@type': 'Country', name: 'Deutschland' },
    ],
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />;
}

export function FaqPageSchema({ faqs }: { faqs: { question: string; answer: string }[] }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />;
}
