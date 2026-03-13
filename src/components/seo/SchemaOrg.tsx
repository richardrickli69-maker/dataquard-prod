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
      'Automatischer Website-Compliance-Scan (nDSG/DSGVO)',
      'KI-generierte Datenschutzerklärung',
      'Deepfake-Check und KI-Realitäts-Analyse',
      'EU AI Act Art. 50 Klausel (automatisch)',
      'Ampel-Risikobewertung',
      'Schweizer Datenresidenz (Supabase Zürich)',
    ],
    description: 'Dataquard ist die Schweizer Compliance-Plattform für KMUs. Automatischer Website-Scan auf nDSG/DSGVO-Konformität, KI-generierte Datenschutzerklärungen und Deepfake-Erkennung nach EU AI Act Art. 50.',
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
    foundingLocation: { '@type': 'Place', addressLocality: 'Basel', addressCountry: 'CH' },
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
