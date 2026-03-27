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
      { '@type': 'Offer', name: 'STARTER', price: '228', priceCurrency: 'CHF', billingIncrement: 'P1Y' },
      { '@type': 'Offer', name: 'PROFESSIONAL', price: '468', priceCurrency: 'CHF', billingIncrement: 'P1Y' },
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

// KI-Transparenz nach EU AI Act Art. 50 — Schema.org WebPage + CreativeWork (100% Konfidenz)
export function KiTransparenzSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Dataquard — Website Compliance & AI-Trust Check',
    url: 'https://www.dataquard.ch',
    description: 'Dataquard prüft Schweizer KMU-Websites auf Compliance, Performance, Security und KI-Inhalte nach EU AI Act Art. 50.',
    about: {
      '@type': 'SoftwareApplication',
      name: 'Dataquard',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
    },
    mainEntity: {
      '@type': 'CreativeWork',
      name: 'Dataquard Website-Inhalte',
      // Beide Ersteller: Dataquard (menschlich) + Anthropic (KI-Werkzeug)
      creator: [
        {
          '@type': 'Organization',
          name: 'Dataquard',
          url: 'https://www.dataquard.ch',
        },
        {
          '@type': 'Organization',
          name: 'Anthropic',
          url: 'https://www.anthropic.com',
          description: 'KI-Technologie-Anbieter (Claude API) — eingesetzt für Textgenerierung und Analysen',
        },
      ],
      // Explizites KI-Werkzeug gemäss Schema.org CreativeWork
      tool: [
        {
          '@type': 'SoftwareApplication',
          name: 'Claude',
          url: 'https://www.anthropic.com/claude',
          applicationCategory: 'Artificial Intelligence',
          creator: {
            '@type': 'Organization',
            name: 'Anthropic',
            url: 'https://www.anthropic.com',
          },
          description: 'Grosssprachmodell (LLM) für Textgenerierung, Datenschutzerklärungen und Scan-Analysen',
        },
        {
          '@type': 'SoftwareApplication',
          name: 'Sightengine',
          url: 'https://sightengine.com',
          applicationCategory: 'Artificial Intelligence',
          description: 'KI-Bild-Erkennungs-API für Deepfake-Check nach EU AI Act Art. 50',
        },
      ],
      sdPublisher: {
        '@type': 'Organization',
        name: 'Dataquard',
        url: 'https://www.dataquard.ch',
      },
      // Explizite Beschreibung der KI-Nutzung (abstract = maschinenlesbares Summary)
      abstract: 'Teile dieser Website wurden mit Unterstützung von KI-Technologie (Claude von Anthropic) erstellt. Alle KI-generierten Inhalte wurden von menschlichen Redakteuren geprüft und freigegeben. Dies entspricht den Anforderungen des EU AI Act Art. 50 (Transparenzpflicht für KI-generierte Inhalte, gültig ab August 2026).',
      license: 'https://www.dataquard.ch/ki-transparenz',
      usageInfo: 'https://www.dataquard.ch/ki-transparenz',
      isAccessibleForFree: true,
      inLanguage: 'de',
      keywords: 'KI-Transparenz, EU AI Act Art. 50, KI-Kennzeichnung, Dataquard, Anthropic Claude, Sightengine',
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://www.dataquard.ch/scanner?url={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />;
}

export function WebSiteSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Dataquard',
    alternateName: 'Dataquard.ch',
    url: 'https://www.dataquard.ch',
    description: 'Der einzige Schweizer Website-Check mit 4-Säulen-Analyse: Compliance, Performance, Security und AI-Trust.',
    publisher: {
      '@type': 'Organization',
      name: 'Dataquard',
      url: 'https://www.dataquard.ch',
      logo: {
        '@type': 'ImageObject',
        url: 'https://www.dataquard.ch/logo-dataquard.png',
      },
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://www.dataquard.ch/scanner?url={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
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
