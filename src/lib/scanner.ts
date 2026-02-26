/**
 * Website Scanner Logic
 * Fetches and analyzes website data
 */

export interface ScannerResult {
  url: string;
  domain: string;
  statusCode: number;
  title: string;
  description: string;
  language: string;
  hasImprint: boolean;
  impressumText: string;
  hasCookieBanner: boolean;
  hasPrivacyLink: boolean;
  metaTags: Record<string, string>;
  scanedAt: string;
}

/**
 * Scan a website and extract relevant data
 */
export async function scanWebsite(url: string): Promise<ScannerResult> {
  try {
    // Normalize URL
    const normalizedUrl = normalizeUrl(url);

    // Simulate website fetch (in Phase 3 we'll make REAL requests)
    const result = await simulateFetch(normalizedUrl);

    return result;
  } catch (error) {
    console.error('Scanner error:', error);
    throw new Error(`Failed to scan website: ${url}`);
  }
}

/**
 * Simulate fetching website data
 * In production (Phase 3+), this will make REAL HTTP requests
 */
async function simulateFetch(url: string): Promise<ScannerResult> {
  const domain = extractDomainFromUrl(url);

  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Mock data based on domain
  const mockData = generateMockData(domain);

  return mockData;
}

/**
 * Generate realistic mock data for testing
 */
function generateMockData(domain: string): ScannerResult {
  const isCH = domain.includes('.ch');
  const isDE = domain.includes('.de');

  return {
    url: domain,
    domain: domain,
    statusCode: 200,
    title: `${domain} - Website`,
    description: `Official website of ${domain}`,
    language: isCH ? 'de-CH' : isDE ? 'de-DE' : 'en',
    hasImprint: true,
    impressumText: generateImpressumText(domain),
    hasCookieBanner: Math.random() > 0.3,
    hasPrivacyLink: true,
    metaTags: {
      'og:title': `${domain}`,
      'og:description': `Learn more about ${domain}`,
      'charset': 'utf-8',
      'viewport': 'width=device-width, initial-scale=1',
      ...(isCH && { 'geo': 'Switzerland' }),
      ...(isDE && { 'geo': 'Germany' }),
    },
    scanedAt: new Date().toISOString(),
  };
}

/**
 * Generate realistic impressum text
 */
function generateImpressumText(domain: string): string {
  if (domain.includes('.ch')) {
    return `
      ${domain}
      Hauptstraße 123
      8001 Zürich
      Schweiz
      
      E-Mail: info@${domain}
      Tel: +41 44 123 4567
    `;
  } else if (domain.includes('.de')) {
    return `
      ${domain}
      Hauptstraße 123
      10115 Berlin
      Deutschland
      
      E-Mail: info@${domain}
      Tel: +49 30 12345678
    `;
  } else {
    return `
      ${domain}
      Street 123
      London
      United Kingdom
    `;
  }
}

/**
 * Extract domain from URL
 */
export function extractDomainFromUrl(url: string): string {
  try {
    const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
    return urlObj.hostname;
  } catch {
    return url;
  }
}

/**
 * Normalize URL to standard format
 */
export function normalizeUrl(url: string): string {
  // Remove whitespace
  url = url.trim();

  // Add protocol if missing
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = `https://${url}`;
  }

  // Remove trailing slash
  url = url.replace(/\/$/, '');

  return url;
}

/**
 * Validate URL format
 */
export function isValidUrl(url: string): boolean {
  try {
    const normalizedUrl = normalizeUrl(url);
    new URL(normalizedUrl);
    return true;
  } catch {
    return false;
  }
}

/**
 * Extract domain extension (.ch, .de, .com, etc)
 */
export function getDomainExtension(domain: string): string {
  const parts = domain.split('.');
  return parts[parts.length - 1];
}

/**
 * Guess country from domain
 */
export function guessCountryFromUrl(url: string): string {
  const domain = extractDomainFromUrl(url);
  const ext = getDomainExtension(domain).toUpperCase();

  const countryMap: Record<string, string> = {
    CH: 'Switzerland',
    DE: 'Germany',
    AT: 'Austria',
    FR: 'France',
    IT: 'Italy',
    ES: 'Spain',
    NL: 'Netherlands',
    BE: 'Belgium',
    SE: 'Sweden',
    DK: 'Denmark',
    NO: 'Norway',
    FI: 'Finland',
    PL: 'Poland',
    CZ: 'Czech Republic',
  };

  return countryMap[ext] || 'Unknown';
}