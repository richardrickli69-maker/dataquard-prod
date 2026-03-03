/**
 * Dataquard – Website Scanner
 * Version 2.1 – Februar 2026
 *
 * Funktionsweise:
 * 1. HTML-Quellcode der Startseite laden (via API Route, nicht client-seitig)
 * 2. Unterseiten crawlen (/impressum, /kontakt, /karriere, /agb, /datenschutz)
 * 3. Pattern-Matching: RegEx auf HTML-Code
 * 4. Hosting ermitteln: HTTP-Header + DNS
 * 5. Module zuordnen
 */

import type { ActiveModules } from './modules';

// ---------------------------------------------------------------------------
// TYPEN
// ---------------------------------------------------------------------------

export interface DetectedService {
  name: string;
  category: string;
  country: string;
  modules: (keyof ActiveModules)[];
  pattern: string; // Welches Pattern hat getroffen
}

export interface HostingInfo {
  name: string;
  country: 'CH' | 'EU' | 'USA' | 'Unknown';
  serverLocation: 'CH' | 'EU' | 'USA';
  module: keyof ActiveModules | null;
}

export interface ScannerResult {
  url: string;
  domain: string;
  statusCode: number;
  title: string;
  language: string;
  // Erkannte Dienste
  detectedServices: DetectedService[];
  // Hosting
  hosting: HostingInfo;
  // Erkannte Websitfunktionen
  hasContactForm: boolean;
  hasNewsletter: boolean;
  hasShop: boolean;
  hasLogin: boolean;
  hasBlog: boolean;
  hasAppointmentBooking: boolean;
  hasJobListings: boolean;
  hasCookieBanner: boolean;
  hasPrivacyLink: boolean;
  hasImprint: boolean;
  // Automatisch abgeleitete Module
  suggestedModules: Partial<ActiveModules>;
  // Meta
  scannedAt: string;
  scanDurationMs: number;
  disclaimer: string;
}

// ---------------------------------------------------------------------------
// PATTERN-DEFINITIONEN
// (RegEx → Dienst → Module)
// ---------------------------------------------------------------------------

interface ServicePattern {
  name: string;
  category: string;
  country: string;
  patterns: RegExp[];
  modules: (keyof ActiveModules)[];
}

const SERVICE_PATTERNS: ServicePattern[] = [
  // --- Analyse & Tracking ---
  {
    name: 'Google Analytics',
    category: 'Analyse & Tracking',
    country: 'USA',
    patterns: [
      /googletagmanager\.com\/gtag\/js/i,
      /google-analytics\.com\/analytics\.js/i,
      /UA-\d{4,12}-\d{1,4}/,
      /G-[A-Z0-9]{8,12}/,
    ],
    modules: ['D1', 'C3', 'T2'],
  },
  {
    name: 'Google Tag Manager',
    category: 'Analyse & Tracking',
    country: 'USA',
    patterns: [
      /googletagmanager\.com\/gtm\.js/i,
      /GTM-[A-Z0-9]{5,8}/,
    ],
    modules: ['D1', 'T2'],
  },
  {
    name: 'Hotjar',
    category: 'Analyse & Tracking',
    country: 'USA',
    patterns: [
      /static\.hotjar\.com/i,
      /hj\s*\(\s*['"]init['"]/i,
      /hjid\s*:/i,
    ],
    modules: ['D9', 'C3', 'T2'],
  },
  {
    name: 'Matomo / Piwik',
    category: 'Analyse & Tracking',
    country: 'CH/EU',
    patterns: [
      /matomo\.js/i,
      /piwik\.js/i,
      /_paq\.push/i,
    ],
    modules: ['C3'],
  },

  // --- Werbung & Marketing ---
  {
    name: 'Meta Pixel',
    category: 'Werbung & Marketing',
    country: 'USA',
    patterns: [
      /fbq\s*\(\s*['"]init['"]/i,
      /facebook\.net\/en_US\/fbevents\.js/i,
      /connect\.facebook\.net/i,
    ],
    modules: ['D3', 'C4', 'T2'],
  },
  {
    name: 'Google Ads',
    category: 'Werbung & Marketing',
    country: 'USA',
    patterns: [
      /googleadservices\.com/i,
      /googlesyndication\.com/i,
      /AW-\d{8,12}/,
    ],
    modules: ['D2', 'C4', 'T2'],
  },
  {
    name: 'LinkedIn Insight Tag',
    category: 'Werbung & Marketing',
    country: 'USA',
    patterns: [
      /snap\.licdn\.com/i,
      /_linkedin_partner_id/i,
      /linkedin\.com\/li\.lms-analytics/i,
    ],
    modules: ['D4', 'C4', 'T2'],
  },

  // --- Eingebettete Inhalte ---
  {
    name: 'YouTube',
    category: 'Eingebettete Inhalte',
    country: 'USA',
    patterns: [
      /youtube\.com\/embed/i,
      /youtube-nocookie\.com/i,
      /youtu\.be\//i,
    ],
    modules: ['D5', 'C3', 'T2'],
  },
  {
    name: 'Vimeo',
    category: 'Eingebettete Inhalte',
    country: 'USA',
    patterns: [
      /player\.vimeo\.com\/video/i,
      /vimeo\.com\/video/i,
    ],
    modules: ['D8', 'T2'],
  },
  {
    name: 'Google Maps',
    category: 'Eingebettete Inhalte',
    country: 'USA',
    patterns: [
      /maps\.googleapis\.com/i,
      /google\.com\/maps\/embed/i,
      /maps\.google\.com/i,
    ],
    modules: ['D6', 'T2'],
  },

  // --- Design & Schriften ---
  {
    name: 'Google Fonts',
    category: 'Design & Schriften',
    country: 'USA',
    patterns: [
      /fonts\.googleapis\.com/i,
      /fonts\.gstatic\.com/i,
    ],
    modules: ['D7', 'T2'],
  },
  {
    name: 'Adobe Fonts',
    category: 'Design & Schriften',
    country: 'USA',
    patterns: [
      /use\.typekit\.net/i,
    ],
    modules: ['T2'],
  },

  // --- Kommunikation & CRM ---
  {
    name: 'Mailchimp',
    category: 'Kommunikation & CRM',
    country: 'USA',
    patterns: [
      /mailchimp\.com/i,
      /list-manage\.com/i,
      /chimpstatic\.com/i,
    ],
    modules: ['D10', 'W4', 'T2'],
  },
  {
    name: 'HubSpot',
    category: 'Kommunikation & CRM',
    country: 'USA',
    patterns: [
      /js\.hs-scripts\.com/i,
      /js\.hsforms\.net/i,
      /hubspot\.com/i,
    ],
    modules: ['D11', 'T2'],
  },
  {
    name: 'Calendly',
    category: 'Kommunikation & CRM',
    country: 'USA',
    patterns: [
      /assets\.calendly\.com/i,
      /calendly\.com/i,
    ],
    modules: ['D12', 'W8', 'T2'],
  },

  // --- Zahlung & E-Commerce ---
  {
    name: 'Stripe',
    category: 'Zahlung & E-Commerce',
    country: 'USA',
    patterns: [
      /js\.stripe\.com/i,
      /checkout\.stripe\.com/i,
    ],
    modules: ['Z1', 'T2'],
  },
  {
    name: 'PayPal',
    category: 'Zahlung & E-Commerce',
    country: 'USA',
    patterns: [
      /paypal\.com\/sdk/i,
      /paypalobjects\.com/i,
    ],
    modules: ['Z2', 'T2'],
  },
  {
    name: 'WooCommerce',
    category: 'Zahlung & E-Commerce',
    country: '—',
    patterns: [
      /woocommerce/i,
      /wc-add-to-cart/i,
      /\/wp-content\/plugins\/woocommerce/i,
    ],
    modules: ['W5'],
  },
  {
    name: 'Shopify',
    category: 'Zahlung & E-Commerce',
    country: 'CA',
    patterns: [
      /cdn\.shopify\.com/i,
      /myshopify\.com/i,
    ],
    modules: ['W5', 'T2'],
  },

  // --- Sicherheit & Infrastruktur ---
  {
    name: 'Google reCAPTCHA',
    category: 'Sicherheit & Infrastruktur',
    country: 'USA',
    patterns: [
      /google\.com\/recaptcha/i,
      /grecaptcha/i,
    ],
    modules: ['T2'],
  },
  {
    name: 'Cloudflare',
    category: 'Sicherheit & Infrastruktur',
    country: 'USA',
    patterns: [
      /cdnjs\.cloudflare\.com/i,
    ],
    modules: ['T2'],
  },
];

// ---------------------------------------------------------------------------
// HOSTING-ERKENNUNG
// ---------------------------------------------------------------------------

interface HostingPattern {
  name: string;
  country: 'CH' | 'EU' | 'USA' | 'Unknown';
  serverLocation: 'CH' | 'EU' | 'USA';
  ort: string;
  module: keyof ActiveModules | null;
  patterns: RegExp[];
}

const HOSTING_PATTERNS: HostingPattern[] = [
  {
    name: 'Hostpoint',
    country: 'CH',
    serverLocation: 'CH',
    ort: 'Rapperswil-Jona, Schweiz',
    module: 'W1',
    patterns: [/hostpoint/i],
  },
  {
    name: 'Infomaniak',
    country: 'CH',
    serverLocation: 'CH',
    ort: 'Genf, Schweiz',
    module: 'W1',
    patterns: [/infomaniak/i],
  },
  {
    name: 'cyon',
    country: 'CH',
    serverLocation: 'CH',
    ort: 'Basel, Schweiz',
    module: 'W1',
    patterns: [/cyon/i],
  },
  {
    name: 'Metanet',
    country: 'CH',
    serverLocation: 'CH',
    ort: 'Zürich, Schweiz',
    module: 'W1',
    patterns: [/metanet/i],
  },
  {
    name: 'Hetzner',
    country: 'EU',
    serverLocation: 'EU',
    ort: 'Nürnberg, Deutschland',
    module: 'W1',
    patterns: [/hetzner/i],
  },
  {
    name: 'Amazon Web Services (AWS)',
    country: 'USA',
    serverLocation: 'USA',
    ort: 'USA (oder EU-Region)',
    module: 'W1',
    patterns: [/amazonaws\.com/i, /aws/i],
  },
  {
    name: 'Vercel',
    country: 'USA',
    serverLocation: 'USA',
    ort: 'San Francisco, USA',
    module: 'W1',
    patterns: [/vercel/i],
  },
  {
    name: 'Netlify',
    country: 'USA',
    serverLocation: 'USA',
    ort: 'San Francisco, USA',
    module: 'W1',
    patterns: [/netlify/i],
  },
];

// ---------------------------------------------------------------------------
// WEBSITE-FUNKTION-PATTERN
// ---------------------------------------------------------------------------

function detectWebsiteFunctions(html: string): {
  hasContactForm: boolean;
  hasNewsletter: boolean;
  hasShop: boolean;
  hasLogin: boolean;
  hasBlog: boolean;
  hasAppointmentBooking: boolean;
  hasJobListings: boolean;
} {
  const lower = html.toLowerCase();
  return {
    hasContactForm:
      /type=["']email["']/.test(html) ||
      /<form[^>]*(contact|kontakt)/i.test(html),
    hasNewsletter:
      /newsletter/i.test(html) ||
      /subscribe/i.test(html) ||
      /abonnieren/i.test(html),
    hasShop:
      /woocommerce/i.test(html) ||
      /add-to-cart/i.test(html) ||
      /shopify/i.test(html) ||
      /warenkorb/i.test(html) ||
      /online-shop/i.test(html),
    hasLogin:
      /type=["']password["']/.test(html) ||
      /login/i.test(lower) ||
      /anmelden/i.test(lower) ||
      /mein konto/i.test(lower),
    hasBlog:
      /comment-form/i.test(html) ||
      /disqus/i.test(html) ||
      /\/blog\//i.test(html),
    hasAppointmentBooking:
      /calendly/i.test(html) ||
      /terminbuchung/i.test(lower) ||
      /termin buchen/i.test(lower) ||
      /appointment/i.test(lower),
    hasJobListings:
      /\/karriere/i.test(html) ||
      /\/jobs/i.test(html) ||
      /\/stellenangebote/i.test(html) ||
      /bewerbung/i.test(lower) ||
      /offene stellen/i.test(lower),
  };
}

// ---------------------------------------------------------------------------
// PATTERN-MATCHING CORE
// ---------------------------------------------------------------------------

function runPatternMatching(html: string, serverHeader: string): DetectedService[] {
  const detected: DetectedService[] = [];
  const htmlAndHeader = html + '\n' + serverHeader;

  for (const service of SERVICE_PATTERNS) {
    const matchedPattern = service.patterns.find((pattern) => pattern.test(htmlAndHeader));
    if (matchedPattern) {
      detected.push({
        name: service.name,
        category: service.category,
        country: service.country,
        modules: service.modules,
        pattern: matchedPattern.toString(),
      });
    }
  }

  return detected;
}

function detectHosting(serverHeader: string, url: string): HostingInfo {
  const combined = serverHeader + '\n' + url;

  for (const h of HOSTING_PATTERNS) {
    if (h.patterns.some((p) => p.test(combined))) {
      return {
        name: h.name,
        country: h.country,
        serverLocation: h.serverLocation,
        module: h.module,
      };
    }
  }

  return {
    name: 'Unbekannt',
    country: 'Unknown',
    serverLocation: 'USA', // Worst-case für Datenschutz
    module: 'W1',
  };
}

// ---------------------------------------------------------------------------
// MODULE AUS ERKANNTEN DIENSTEN ABLEITEN
// ---------------------------------------------------------------------------

function buildSuggestedModules(
  services: DetectedService[],
  functions: ReturnType<typeof detectWebsiteFunctions>
): Partial<ActiveModules> {
  const mods: Partial<ActiveModules> = {};

  // Aus Services
  for (const service of services) {
    for (const mod of service.modules) {
      (mods as Record<string, boolean>)[mod] = true;
    }
  }

  // Aus Websitfunktionen
  if (functions.hasContactForm) mods.W3 = true;
  if (functions.hasNewsletter)  mods.W4 = true;
  if (functions.hasShop)        mods.W5 = true;
  if (functions.hasLogin)       mods.W6 = true;
  if (functions.hasBlog)        mods.W7 = true;
  if (functions.hasAppointmentBooking) mods.W8 = true;
  if (functions.hasJobListings) { mods.HR1 = true; mods.HR2 = true; }

  return mods;
}

// ---------------------------------------------------------------------------
// ÖFFENTLICHE API
// ---------------------------------------------------------------------------

/**
 * Haupt-Scanner-Funktion.
 * MUSS server-seitig aufgerufen werden (Next.js API Route),
 * da direkte HTTP-Requests vom Browser durch CORS blockiert werden.
 *
 * In Phase 3+ ersetzt `fetchHtml` den Simulator durch echte HTTP-Requests.
 */
export async function scanWebsite(
  url: string,
  fetchHtml?: (url: string) => Promise<{ html: string; serverHeader: string; statusCode: number }>
): Promise<ScannerResult> {
  const startTime = Date.now();
  const normalizedUrl = normalizeUrl(url);
  const domain = extractDomainFromUrl(normalizedUrl);

  let html = '';
  let serverHeader = '';
  let statusCode = 200;
  let title = '';

  if (fetchHtml) {
    // PRODUKTION: Echter HTTP-Request via Server
    const result = await fetchHtml(normalizedUrl);
    html = result.html;
    serverHeader = result.serverHeader;
    statusCode = result.statusCode;
    title = extractTitle(html);
  } else {
    // ENTWICKLUNG: Simulated HTML mit realistischen Patterns für Tests
    const sim = simulateHtml(domain);
    html = sim.html;
    serverHeader = sim.serverHeader;
    statusCode = 200;
    title = `${domain} – Website`;
  }

  // Pattern-Matching
  const detectedServices = runPatternMatching(html, serverHeader);
  const hosting = detectHosting(serverHeader, normalizedUrl);
  const functions = detectWebsiteFunctions(html);

  // Module ableiten
  const suggestedModules = buildSuggestedModules(detectedServices, functions);

  return {
    url: normalizedUrl,
    domain,
    statusCode,
    title,
    language: detectLanguage(html, domain),
    detectedServices,
    hosting,
    hasContactForm: functions.hasContactForm,
    hasNewsletter: functions.hasNewsletter,
    hasShop: functions.hasShop,
    hasLogin: functions.hasLogin,
    hasBlog: functions.hasBlog,
    hasAppointmentBooking: functions.hasAppointmentBooking,
    hasJobListings: functions.hasJobListings,
    hasCookieBanner: /cookiebot|consent|cookie-banner|cookie_consent/i.test(html),
    hasPrivacyLink: /datenschutz|privacy|dsgvo/i.test(html),
    hasImprint: /impressum|imprint/i.test(html),
    suggestedModules,
    scannedAt: new Date().toISOString(),
    scanDurationMs: Date.now() - startTime,
    disclaimer:
      'Der Scanner erkennt nur Dienste, die im HTML-Quellcode sichtbar sind. ' +
      'Scripts, die erst nach Cookie-Consent laden, werden ggf. nicht erkannt (~10% der Fälle). ' +
      'Bitte prüfen Sie die Ergebnisse und ergänzen Sie fehlende Dienste manuell.',
  };
}

// ---------------------------------------------------------------------------
// HILFSFUNKTIONEN
// ---------------------------------------------------------------------------

export function normalizeUrl(url: string): string {
  url = url.trim();
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = `https://${url}`;
  }
  return url.replace(/\/$/, '');
}

export function extractDomainFromUrl(url: string): string {
  try {
    return new URL(url.startsWith('http') ? url : `https://${url}`).hostname;
  } catch {
    return url;
  }
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(normalizeUrl(url));
    return true;
  } catch {
    return false;
  }
}

export function guessCountryFromUrl(url: string): string {
  const ext = extractDomainFromUrl(url).split('.').pop()?.toUpperCase() ?? '';
  const map: Record<string, string> = {
    CH: 'Schweiz', DE: 'Deutschland', AT: 'Österreich',
    FR: 'Frankreich', IT: 'Italien', NL: 'Niederlande',
  };
  return map[ext] ?? 'Unbekannt';
}

function extractTitle(html: string): string {
  const match = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  return match ? match[1].trim() : '';
}

function detectLanguage(html: string, domain: string): string {
  if (domain.includes('.ch')) return 'de-CH';
  if (domain.includes('.de')) return 'de-DE';
  if (domain.includes('.at')) return 'de-AT';
  const match = html.match(/<html[^>]+lang=["']([^"']+)["']/i);
  return match ? match[1] : 'de-CH';
}

// ---------------------------------------------------------------------------
// SIMULATED HTML (nur für Entwicklung/Tests)
// ---------------------------------------------------------------------------

function simulateHtml(domain: string): { html: string; serverHeader: string } {
  const isCH = domain.endsWith('.ch');

  return {
    html: `
      <html lang="${isCH ? 'de-CH' : 'de'}">
      <head>
        <title>${domain}</title>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter">
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
        <script>window.dataLayer=[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-XXXXXXXXXX');</script>
      </head>
      <body>
        <nav><a href="/">Home</a><a href="/kontakt">Kontakt</a><a href="/datenschutz">Datenschutz</a><a href="/impressum">Impressum</a></nav>
        <h1>${domain}</h1>
        <form action="/kontakt" method="post"><input type="email" name="email" /><input type="text" name="message" /></form>
        <footer><a href="/datenschutz">Datenschutzerklärung</a> | <a href="/impressum">Impressum</a></footer>
      </body>
      </html>
    `,
    serverHeader: isCH ? 'hostpoint' : 'nginx',
  };
}