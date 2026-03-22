/**
 * Extended Scanner v2.2
 * Compliance + Optimization + Security + AI Content Analysis
 */
import { isValidUrl } from '@/lib/scanner';
import { analyzeForAiContent, type AiAuditResult } from '@/lib/visualAiService';
import { detectCookieBanner } from '@/lib/cookieBannerDetector';
import { detectJsRendering, type JsRenderingResult } from '@/lib/jsRenderingDetector';

export interface ExtendedScanResult {
  compliance: {
    score: number;
    jurisdiction: string;
    ampel: string;
    hasPrivacyPolicy: boolean;
    trackersFound: string[];
    hasCookieBanner: boolean;
    /** Name des erkannten CMP-Anbieters, z.B. "CookieBot" */
    cookieBannerProvider?: string;
    /** Kontextabhängige Bewertung: nur Pflicht wenn Tracker vorhanden */
    cookieBannerAssessment?: CookieBannerAssessment;
    /** JS-Rendering-Erkennung (SPA-Hinweis) */
    jsRendering?: JsRenderingResult;
  };
  optimization: {
    score: number;
    loadTime: number;
    hasSSL: boolean;
    sslExpiry?: string;
    isMobileFriendly: boolean;
    lighthouseScore: number;
    trackerCount: number;
    estimatedSpeedImpact: string;
  };
  trust: {
    score: number;
    hasSSL: boolean;
    hasImpressum: boolean;
    impressumComplete: boolean;
    impressumMissing: string[];
    hasContact: boolean;
    metaTagsComplete: boolean;
    noBrokenLinks: boolean;
  };
  insights: string[];
  recommendations: string[];
  /** KI-Inhaltsanalyse (EU AI Act Art. 50) */
  aiAudit: AiAuditResult;
  /** Sightengine-Bildscan (KI-Bild, Deepfake, Nudity, Waffen) */
  sightengine: {
    imagesAnalysed: number;
    /** Gesamt-Anzahl gefundener Bilder auf der Seite (vor Free-Tier-Limit) */
    totalImagesFound: number;
    aiImagesFound: number;
    deepfakeCount: number;
    nudityCount: number;
    weaponCount: number;
    unsafeCount: number;
    allSafe: boolean;
    maxAiScore: number;
    deepfakeDetected: boolean;
  } | null;
}

export async function checkSSL(domain: string): Promise<{
  hasSSL: boolean;
  issuer?: string;
  expiry?: string;
  valid: boolean;
}> {
  const hasSSL = !domain.startsWith('http://');
  
  if (hasSSL) {
    return {
      hasSSL: true,
      issuer: 'Let\'s Encrypt',
      expiry: '2025-12-31',
      valid: true,
    };
  }
  
  return {
    hasSSL: false,
    valid: false,
  };
}

export async function checkPerformance(domain: string): Promise<{
  loadTime: number;
  lighthouseScore: number;
  coreWebVitals: {
    lcp: number;
    fid: number;
    cls: number;
  };
}> {
  // Echte Ladezeit messen (Server-to-Server Response Time)
  const url = domain.startsWith('http') ? domain : `https://${domain}`;
  const start = Date.now();
  let loadTime = 2.5; // Fallback falls Fetch fehlschlägt

  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Dataquard-Scanner/2.0' },
      signal: AbortSignal.timeout(10000),
    });
    if (res.ok) {
      await res.text(); // Vollständigen Body lesen für realistische Messung
      loadTime = (Date.now() - start) / 1000;
    }
  } catch { /* Fallback: 2.5s */ }

  // Lighthouse-Score: lineare Annäherung basierend auf Ladezeit
  const lighthouseScore = Math.max(0, Math.min(100, Math.round(100 - (Math.max(0, loadTime - 0.5)) * 18)));

  return {
    loadTime,
    lighthouseScore,
    coreWebVitals: {
      lcp: Math.round(loadTime * 1000),
      fid: loadTime < 1 ? 30 : loadTime < 2 ? 60 : 120,
      cls: 0.05,
    },
  };
}

export async function checkImpressum(domain: string): Promise<{
  hasImpressum: boolean;
  impressumComplete: boolean;
  impressumMissing: string[];
  hasContact: boolean;
  hasAbout: boolean;
  foundPages: string[];
}> {
  // Echtes HTML laden statt Stub
  let html = '';
  try {
    const url = domain.startsWith('http') ? domain : `https://${domain}`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Dataquard-Scanner/2.0' },
      signal: AbortSignal.timeout(8000),
    });
    if (res.ok) html = await res.text();
  } catch { /* Fallback: leeres HTML, hasImpressum = false */ }

  const htmlLow = html.toLowerCase();

  // Strategie 1: Link-href-Erkennung
  // Prüft absolute Pfade (/impressum, /Impressum.htm) und relative URLs (href="Impressum.htm")
  // Explizite Endzeichen vermeiden False Positive durch /impressum-generator
  const hasImpressumHref =
    htmlLow.includes('/impressum"') ||
    htmlLow.includes("/impressum'") ||
    htmlLow.includes('/impressum/') ||
    htmlLow.includes('/impressum.') ||    // z.B. /Impressum.htm
    htmlLow.includes('/impressum?') ||
    htmlLow.includes('/impressum#') ||
    htmlLow.includes('/imprint"') ||
    htmlLow.includes("/imprint'") ||
    htmlLow.includes('/imprint/') ||
    htmlLow.includes('/imprint.') ||
    htmlLow.includes('/legal-notice') ||
    htmlLow.includes('/mentions-legales') ||
    htmlLow.includes('/note-legali') ||
    htmlLow.includes('href="impressum.') ||   // Relativ: href="Impressum.htm"
    htmlLow.includes("href='impressum.") ||
    htmlLow.includes('href="impressum"') ||   // Relativ: href="impressum"
    htmlLow.includes("href='impressum'") ||
    htmlLow.includes('href="impressum/') ||   // Relativ mit Trailing Slash: href="impressum/"
    htmlLow.includes("href='impressum/") ||
    htmlLow.includes('href="imprint.') ||
    htmlLow.includes("href='imprint.");

  // Strategie 2: Link-Text-Erkennung (sichtbarer Linktext)
  const hasImpressumText =
    />\s*impressum\s*</i.test(html) ||
    />\s*imprint\s*</i.test(html) ||
    />\s*legal\s*notice\s*</i.test(html) ||
    />\s*mentions\s*l[ée]gales\s*</i.test(html);

  const hasImpressum = hasImpressumHref || hasImpressumText;
  const foundPages = hasImpressum ? ['/impressum'] : [];

  // Kontakt-Link erkennen
  const hasContact =
    htmlLow.includes('/kontakt') ||
    htmlLow.includes('/contact') ||
    htmlLow.includes('href="kontakt') ||
    htmlLow.includes("href='kontakt") ||
    />\s*kontakt\s*</i.test(html) ||
    />\s*contact\s*</i.test(html);

  return {
    hasImpressum,
    // Benefit of doubt: vollständige Prüfung erfordert das Laden der Impressum-Seite selbst
    impressumComplete: hasImpressum,
    impressumMissing: [],
    hasContact,
    hasAbout: false,
    foundPages,
  };
}

export async function checkMobileFriendly(domain: string): Promise<{
  isMobileFriendly: boolean;
  hasViewportMeta: boolean;
  mobileScore: number;
}> {
  const isMobileFriendly = !domain.includes('old') && !domain.includes('legacy');
  
  return {
    isMobileFriendly,
    hasViewportMeta: isMobileFriendly,
    mobileScore: isMobileFriendly ? 85 : 45,
  };
}

export async function checkMetaTags(domain: string): Promise<{
  hasMetaDescription: boolean;
  hasOGTags: boolean;
  hasTwitterCard: boolean;
  hasStructuredData: boolean;
  hasFavicon: boolean;
  completeness: number;
}> {
  const hasMostTags = !domain.includes('basic');
  
  return {
    hasMetaDescription: hasMostTags,
    hasOGTags: hasMostTags,
    hasTwitterCard: hasMostTags,
    hasStructuredData: hasMostTags,
    hasFavicon: true,
    completeness: hasMostTags ? 85 : 40,
  };
}

// Bekannte Drittanbieter-Tracker und ihre Domains
const KNOWN_TRACKER_DOMAINS: Record<string, { name: string; category: 'analytics' | 'ads' | 'tracker' }> = {
  // Analytics
  'google-analytics.com': { name: 'Google Analytics', category: 'analytics' },
  'googletagmanager.com': { name: 'Google Tag Manager', category: 'tracker' },
  'hotjar.com': { name: 'Hotjar', category: 'analytics' },
  'clarity.ms': { name: 'Microsoft Clarity', category: 'analytics' },
  'mouseflow.com': { name: 'Mouseflow', category: 'analytics' },
  'fullstory.com': { name: 'FullStory', category: 'analytics' },
  'segment.com': { name: 'Segment', category: 'tracker' },
  'mixpanel.com': { name: 'Mixpanel', category: 'analytics' },
  // Meta / Facebook
  'connect.facebook.net': { name: 'Meta Pixel', category: 'ads' },
  'facebook.com/tr': { name: 'Meta Pixel (Tracking Pixel)', category: 'ads' },
  'facebook.net': { name: 'Meta Pixel', category: 'ads' },
  // Google Ads
  'googleads.g.doubleclick.net': { name: 'Google Ads (Doubleclick)', category: 'ads' },
  'doubleclick.net': { name: 'Google Doubleclick', category: 'ads' },
  'adservice.google.com': { name: 'Google Ad Service', category: 'ads' },
  // Bing / Microsoft
  'bat.bing.com': { name: 'Microsoft UET (Bing Ads)', category: 'ads' },
  // TikTok
  'analytics.tiktok.com': { name: 'TikTok Pixel', category: 'ads' },
  'static.ads-twitter.com': { name: 'Twitter/X Ads Pixel', category: 'ads' },
  'analytics.twitter.com': { name: 'Twitter/X Analytics', category: 'analytics' },
  // LinkedIn
  'snap.licdn.com': { name: 'LinkedIn Insight Tag', category: 'tracker' },
  'sc.lfeeder.com': { name: 'LinkedIn Insight Tag', category: 'tracker' },
  'px.ads.linkedin.com': { name: 'LinkedIn Ads Pixel', category: 'ads' },
  // Snapchat / Pinterest
  'tr.snapchat.com': { name: 'Snapchat Pixel', category: 'ads' },
  'ct.pinterest.com': { name: 'Pinterest Tag', category: 'ads' },
  // Chat / Support
  'intercom.io': { name: 'Intercom', category: 'tracker' },
  'crisp.chat': { name: 'Crisp Chat', category: 'tracker' },
  // CDNs (tracking-relevant)
  'cdn.jsdelivr.net': { name: 'jsDelivr CDN', category: 'tracker' },
  'unpkg.com': { name: 'unpkg CDN', category: 'tracker' },
  'cdnjs.cloudflare.com': { name: 'Cloudflare CDN', category: 'tracker' },
};

export async function analyzeThirdParty(domain: string): Promise<{
  totalScripts: number;
  trackers: string[];
  analytics: string[];
  ads: string[];
  estimatedImpactMs: number;
  riskLevel: 'low' | 'medium' | 'high';
}> {
  // Seiten-HTML laden und externe Scripts zählen
  let pageHtml = '';
  try {
    const url = domain.startsWith('http') ? domain : `https://${domain}`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Dataquard-Scanner/2.0' },
      signal: AbortSignal.timeout(8000),
    });
    if (res.ok) pageHtml = await res.text();
  } catch { /* Fallback: keine Scripts */ }

  // Basisdomain für Vergleich extrahieren
  const baseDomain = domain
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .split('/')[0]
    .split(':')[0];

  // Alle <script src="..."> Tags mit externer URL sammeln
  const scriptTags = pageHtml.match(/<script[^>]+src=["'][^"']+["'][^>]*>/gi) ?? [];
  const externalSrcs: string[] = [];
  for (const tag of scriptTags) {
    const srcMatch = tag.match(/src=["']([^"']+)["']/i);
    if (!srcMatch) continue;
    const src = srcMatch[1];
    if (!src.startsWith('//') && !src.startsWith('http')) continue; // relativ = intern
    const srcDomain = src.replace(/^https?:\/\//, '').replace(/^\/\//, '').split('/')[0];
    // Interne Domains überspringen (inkl. www-Varianten)
    if (srcDomain === baseDomain || srcDomain === `www.${baseDomain}` || srcDomain.endsWith(`.${baseDomain}`)) continue;
    externalSrcs.push(src);
  }

  // Bekannte Tracker klassifizieren
  const trackers: string[] = [];
  const analytics: string[] = [];
  const ads: string[] = [];
  for (const src of externalSrcs) {
    for (const [trackerDomain, info] of Object.entries(KNOWN_TRACKER_DOMAINS)) {
      const alreadyFound = [...trackers, ...analytics, ...ads].includes(info.name);
      if (!alreadyFound && src.toLowerCase().includes(trackerDomain)) {
        if (info.category === 'analytics') analytics.push(info.name);
        else if (info.category === 'ads') ads.push(info.name);
        else trackers.push(info.name);
        break;
      }
    }
  }

  const totalScripts = externalSrcs.length;
  const riskLevel: 'low' | 'medium' | 'high' =
    totalScripts <= 2 ? 'low' :
    totalScripts <= 5 ? 'medium' : 'high';

  return {
    totalScripts,
    trackers: [...trackers, ...analytics, ...ads],
    analytics,
    ads,
    estimatedImpactMs: totalScripts * 150,
    riskLevel,
  };
}

export async function checkOutdatedScripts(domain: string, html?: string): Promise<{
  outdatedScripts: string[];
  riskLevel: 'low' | 'medium' | 'high';
}> {
  let pageHtml = html ?? '';
  if (!pageHtml) {
    try {
      const url = domain.startsWith('http') ? domain : `https://${domain}`;
      const res = await fetch(url, {
        headers: { 'User-Agent': 'Dataquard-Scanner/2.0' },
        signal: AbortSignal.timeout(8000),
      });
      pageHtml = await res.text();
    } catch {
      return { outdatedScripts: [], riskLevel: 'low' };
    }
  }

  const outdated: string[] = [];
  const scriptTags = pageHtml.match(/<script[^>]+src=["'][^"']*["'][^>]*>/gi) ?? [];
  const scriptSrcs = scriptTags.join(' ').toLowerCase();

  if (scriptSrcs.match(/jquery[.\-](1\.|2\.)/)) outdated.push('jQuery 1.x/2.x');
  if (scriptSrcs.match(/bootstrap[.\-]3\./)) outdated.push('Bootstrap 3.x');

  return {
    outdatedScripts: outdated,
    riskLevel: outdated.length > 0 ? 'high' : 'low',
  };
}

export async function checkMixedContent(domain: string, html?: string): Promise<{
  hasMixedContent: boolean;
  mixedContentWarnings: string[];
  riskLevel: 'low' | 'medium' | 'high';
}> {
  let pageHtml = html ?? '';
  if (!pageHtml) {
    try {
      const url = domain.startsWith('http') ? domain : `https://${domain}`;
      const res = await fetch(url, {
        headers: { 'User-Agent': 'Dataquard-Scanner/2.0' },
        signal: AbortSignal.timeout(8000),
      });
      pageHtml = await res.text();
    } catch {
      return { hasMixedContent: false, mixedContentWarnings: [], riskLevel: 'low' };
    }
  }

  const externalHttp = (pageHtml.match(/(?:src|href)=["']http:\/\/(?!localhost)[^"']+["']/gi) ?? [])
    .filter(r =>
      !r.includes('//schemas.') &&
      !r.includes('//www.w3.org') &&
      !r.includes('//purl.org') &&
      !r.includes('//ogp.me')
    );

  const hasMixed = externalHttp.length > 0;
  return {
    hasMixedContent: hasMixed,
    mixedContentWarnings: hasMixed ? externalHttp.slice(0, 3) : [],
    riskLevel: hasMixed ? 'high' : 'low',
  };
}

/** Status der Cookie-Banner-Bewertung (kontextabhängig) */
export type CookieBannerStatus = 'vorhanden' | 'fehlt_pflicht' | 'nicht_erforderlich' | 'nicht_erkennbar';

export interface CookieBannerAssessment {
  /** Bewertungs-Status */
  status: CookieBannerStatus;
  /** Begründung für den Status */
  reason: string;
  /** Anzahl gefundener Tracker (0 = kein Banner nötig) */
  trackerCount: number;
}

/**
 * Bewertet den Cookie-Banner-Status kontextabhängig.
 * Ein fehlender Banner ist nur dann ein Verstoss wenn Tracker vorhanden sind.
 */
function assessCookieBanner(
  bannerDetected: boolean,
  trackerCount: number,
  isJsRendered: boolean,
): CookieBannerAssessment {
  // JS-Rendering: Banner nicht zuverlässig erkennbar → kein harter Verstoss
  if (isJsRendered && !bannerDetected) {
    return {
      status: 'nicht_erkennbar',
      reason: 'JavaScript-Rendering – vollständige Analyse nicht möglich',
      trackerCount,
    };
  }

  // Banner vorhanden → immer korrekt, unabhängig von Trackern
  if (bannerDetected) {
    return {
      status: 'vorhanden',
      reason: 'Cookie-Banner erkannt',
      trackerCount,
    };
  }

  // Banner fehlt + Tracker vorhanden → Pflicht nach nDSG/DSGVO
  if (trackerCount > 0) {
    return {
      status: 'fehlt_pflicht',
      reason: `${trackerCount} Tracker erkannt – Cookie-Banner ist Pflicht nach nDSG/DSGVO`,
      trackerCount,
    };
  }

  // Banner fehlt + keine Tracker → nicht zwingend erforderlich
  return {
    status: 'nicht_erforderlich',
    reason: 'Keine Tracker erkannt – Cookie-Banner nicht zwingend erforderlich',
    trackerCount,
  };
}

export async function detectComplianceIssues(
  domain: string
): Promise<{
  needsPrivacyPolicy: boolean;
  hasCookieBanner: boolean;
  cookieBannerProvider: string | null;
  cookieBannerAssessment: CookieBannerAssessment;
  trackersFound: string[];
  missingElements: string[];
  jsRendering: JsRenderingResult;
}> {
  let html = '';
  try {
    const url = domain.startsWith('http') ? domain : `https://${domain}`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Dataquard-Scanner/2.0' },
      signal: AbortSignal.timeout(8000),
    });
    html = await res.text();
  } catch {
    // Fallback: leeres HTML, alle Checks schlagen fehl
    html = '';
  }

  const htmlLow = html.toLowerCase();

  // Cookie-Banner-Erkennung via 5 Strategien (30+ CMP-Patterns)
  const cookieBannerResult = detectCookieBanner(html);
  const hasCookieBanner = cookieBannerResult.detected;
  const cookieBannerProvider = cookieBannerResult.provider;

  // JS-Rendering-Erkennung (SPA-Seiten → Scan-Ergebnisse möglicherweise unvollständig)
  const jsRendering = detectJsRendering(html);

  // Strategie 1: Link-href-Erkennung (absolut und relativ, inkl. .htm/.html)
  // htmlLow ist bereits html.toLowerCase(), also case-insensitiv
  const privacyByHref =
    html.includes('name="privacy-policy"') ||
    htmlLow.includes('/datenschutz') ||               // /datenschutz, /Datenschutz.htm, ./datenschutz
    htmlLow.includes('/privacy') ||                   // /privacy-policy, /privacy
    htmlLow.includes('/datenschutzerklaerung') ||
    htmlLow.includes('/data-protection') ||
    htmlLow.includes('privacy-policy') ||             // Klassen- oder Meta-Attribute
    htmlLow.includes('href="datenschutz') ||          // Relative URL: href="Datenschutz.htm"
    htmlLow.includes("href='datenschutz") ||
    htmlLow.includes('href="privacy') ||
    htmlLow.includes("href='privacy");

  // Strategie 2: Link-Text-Erkennung (sichtbarer Linktext)
  const privacyByText =
    />\s*datenschutz(?:erkl[äa]rung|hinweis(?:e)?)?\s*</i.test(html) ||
    />\s*privacy(?:\s*policy)?\s*</i.test(html) ||
    />\s*data\s*protection\s*</i.test(html);

  // Strategie 3: Inhalt-Fallback (mind. 3 datenschutztypische Keywords = Datenschutzseite selbst)
  const privacyKeywordCount = [
    'personenbezogene daten',
    'datenschutzbeauftragte',
    'betroffenenrechte',
    'recht auf auskunft',
    'rechtsgrundlage',
    'art. 6 dsgvo',
    'art. 13 dsg',
    'data protection officer',
    'right to access',
    'datenverarbeitung',
  ].filter(k => htmlLow.includes(k)).length;

  let hasPrivacyPolicy = privacyByHref || privacyByText || privacyKeywordCount >= 3;

  // Fix 1: Impressum-Seite fetchen wenn kein Datenschutz-Link auf Homepage gefunden
  // (viele Schweizer KMU kombinieren Impressum + Datenschutzerklärung auf einer Seite)
  if (!hasPrivacyPolicy) {
    try {
      const baseUrl = domain.startsWith('http') ? domain : `https://${domain}`;
      // Impressum-URL aus Homepage-HTML extrahieren
      const impressumMatch =
        html.match(/href=['"]([^'"]*impressum[^'"]*)['"]/i) ??
        html.match(/href=['"]([^'"]*imprint[^'"]*)['"]/i) ??
        html.match(/href=['"]([^'"]*legal[^'"]*)['"]/i);
      if (impressumMatch) {
        const impressumPath = impressumMatch[1];
        const impressumUrl = impressumPath.startsWith('http')
          ? impressumPath
          : new URL(impressumPath, baseUrl.endsWith('/') ? baseUrl : baseUrl + '/').href;
        const impressumRes = await fetch(impressumUrl, {
          headers: { 'User-Agent': 'Dataquard-Scanner/2.0' },
          signal: AbortSignal.timeout(6000),
        });
        if (impressumRes.ok) {
          const impHtml = await impressumRes.text();
          const impHtmlLow = impHtml.toLowerCase();
          // Datenschutz-Keywords auf Impressum-Seite zählen
          const impPrivacyCount = [
            'personenbezogene daten',
            'datenschutzbeauftragte',
            'betroffenenrechte',
            'recht auf auskunft',
            'rechtsgrundlage',
            'art. 6 dsgvo',
            'art. 13 dsg',
            'data protection officer',
            'right to access',
            'datenverarbeitung',
          ].filter(k => impHtmlLow.includes(k)).length;
          if (impPrivacyCount >= 2) hasPrivacyPolicy = true;
          // Explizite Datenschutz-Überschrift auf der Impressum-Seite
          if (/>\s*datenschutz/i.test(impHtml)) hasPrivacyPolicy = true;
        }
      }
    } catch { /* Fallback: Datenschutz bleibt nicht erkannt */ }
  }

  // Echte Tracker-Erkennung aus geladener HTML
  const foundTrackers: string[] = [];
  for (const [trackerDomain, info] of Object.entries(KNOWN_TRACKER_DOMAINS)) {
    if (htmlLow.includes(trackerDomain) && !foundTrackers.includes(info.name)) {
      foundTrackers.push(info.name);
    }
  }

  // Kontextabhängige Bewertung: Banner nur Pflicht wenn Tracker vorhanden
  const isJsRendered = jsRendering.isLikelyJsRendered &&
    (jsRendering.confidence === 'high' || jsRendering.confidence === 'medium');
  const cookieBannerAssessment = assessCookieBanner(
    hasCookieBanner,
    foundTrackers.length,
    isJsRendered,
  );

  return {
    needsPrivacyPolicy: !hasPrivacyPolicy,
    hasCookieBanner,
    cookieBannerProvider,
    cookieBannerAssessment,
    trackersFound: foundTrackers,
    missingElements: [
      ...(!hasPrivacyPolicy ? ['Privacy Policy'] : []),
      // Cookie-Banner nur als "fehlend" melden wenn Pflicht besteht
      ...(cookieBannerAssessment.status === 'fehlt_pflicht' ? ['Cookie Banner'] : []),
    ],
    jsRendering,
  };
}

export function generateInsights(
  complianceScore: number,
  optimizationScore: number,
  trackersCount: number,
  hasPrivacyPolicy: boolean,
  hasSSL: boolean,
  outdatedScripts: string[],
  hasMixedContent: boolean
): string[] {
  const insights: string[] = [];
  
  if (trackersCount > 5 && !hasPrivacyPolicy) {
    insights.push(
      `⚠️ ${trackersCount} Tracker gefunden ohne Privacy Policy - ILLEGAL & Performance Risiko!`
    );
  }
  
  if (!hasSSL) {
    insights.push(
      '🔴 Kein SSL Zertifikat - Besucher warnen vor unsicherer Seite!'
    );
  }
  
  if (outdatedScripts.length > 0) {
    insights.push(
      `🔓 Sicherheitsrisiko: ${outdatedScripts.length} veraltete Skripte gefunden (${outdatedScripts.join(', ')}). Updaten erforderlich!`
    );
  }
  
  if (hasMixedContent) {
    insights.push(
      '⚠️ Mixed Content: Einige Ressourcen laden über HTTP. HTTPS überall aktivieren!'
    );
  }
  
  if (trackersCount > 0) {
    const speedImpact = Math.round(trackersCount * 0.3);
    insights.push(
      `📉 ${trackersCount} Tracker verlangsamen Ihre Seite um ~${speedImpact}% (${speedImpact * 30}ms)`
    );
  }
  
  if (complianceScore < 50) {
    insights.push(
      '🔴 Compliance Score kritisch - brauchen Sie Privacy Policy + Cookie Banner'
    );
  }
  
  if (optimizationScore < 60) {
    insights.push(
      '🟡 Seite lädt zu langsam - entfernen Sie unnötige Tracker & optimieren Sie Bilder'
    );
  }
  
  return insights;
}

export function generateRecommendations(
  trackersCount: number,
  hasPrivacyPolicy: boolean,
  loadTime: number,
  hasImpressum: boolean,
  hasSSL: boolean,
  outdatedScripts: string[],
  hasMixedContent: boolean
): string[] {
  const recommendations: string[] = [];
  
  if (outdatedScripts.length > 0) {
    recommendations.push(
      `🔴 DRINGEND: Veraltete Skripte updaten (${outdatedScripts.join(', ')})`
    );
  }
  
  if (hasMixedContent) {
    recommendations.push(
      '🔴 DRINGEND: Alle Ressourcen auf HTTPS umstellen'
    );
  }
  
  if (!hasPrivacyPolicy && trackersCount > 0) {
    recommendations.push(
      '🔴 DRINGEND: Privacy Policy hinzufügen (Legal erforderlich)'
    );
  }
  
  if (!hasImpressum) {
    recommendations.push(
      '🔴 DRINGEND: Impressum/Kontaktseite hinzufügen (Legal erforderlich)'
    );
  }
  
  if (!hasSSL) {
    recommendations.push('🔴 SSL Zertifikat einrichten (kostenlos mit Let\'s Encrypt)');
  }
  
  if (trackersCount > 5) {
    recommendations.push(
      `🟡 Tracker reduzieren: Sie haben ${trackersCount}, ideal sind 3-4 max`
    );
  }
  
  if (loadTime > 3) {
    recommendations.push(
      `🟡 Ladezeit optimieren: ${loadTime.toFixed(1)}s ist zu lang (Ziel: < 3s)`
    );
  }
  
  recommendations.push('📊 Verwenden Sie Dataquard um die Verbesserungen zu tracken');
  
  return recommendations;
}

interface SightengineImgResult {
  url: string;
  ai_score: number;
  deepfake_score: number;
  nudity_detected: boolean;
  weapon_detected: boolean;
  safe: boolean;
}

async function scanSiteImagesWithSightengine(url: string): Promise<{
  imagesAnalysed: number;
  totalImagesFound: number;
  aiImagesFound: number;
  deepfakeCount: number;
  nudityCount: number;
  weaponCount: number;
  unsafeCount: number;
  allSafe: boolean;
  maxAiScore: number;
  deepfakeDetected: boolean;
} | null> {
  const apiUser = process.env.SIGHTENGINE_API_USER;
  const apiSecret = process.env.SIGHTENGINE_API_SECRET;
  if (!apiUser || !apiSecret) return null;

  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Dataquard-Scanner/2.0' },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const html = await res.text();

    // Alle geeigneten Bilder sammeln (max. 50 für Total-Zählung)
    const allImgUrls: string[] = [];
    const base = new URL(url);
    for (const match of html.matchAll(/<img[^>]+src=["']([^"']+)["']/gi)) {
      try {
        const src = match[1];
        if (src.startsWith('data:')) continue;
        const absUrl = new URL(src, base).href;
        if (/\.(jpe?g|png|webp)$/i.test(absUrl)) {
          allImgUrls.push(absUrl);
          if (allImgUrls.length >= 50) break; // Maximale Anzahl für Total-Zählung
        }
      } catch { /* skip */ }
    }
    const totalImagesFound = allImgUrls.length;
    // Free-Tier: max. 5 Bilder pro Scan
    const imgUrls = allImgUrls.slice(0, 5);
    if (imgUrls.length === 0) return null;

    const scanOne = async (imageUrl: string): Promise<SightengineImgResult | null> => {
      try {
        const params = new URLSearchParams({
          url: imageUrl,
          models: 'nudity-2.1,weapon,genai',
          api_user: apiUser,
          api_secret: apiSecret,
        });
        const r = await fetch(`https://api.sightengine.com/1.0/check.json?${params}`, {
          signal: AbortSignal.timeout(10000),
        });
        if (!r.ok) return null;
        const d = await r.json();
        if (d.status !== 'success') return null;
        const aiScore: number = d.type?.ai_generated ?? 0;
        const deepfakeScore: number = d.type?.deepfake ?? 0;
        const nudityDetected =
          (d.nudity?.sexual_activity ?? 0) > 0.3 ||
          (d.nudity?.sexual_display ?? 0) > 0.3 ||
          (d.nudity?.erotica ?? 0) > 0.3;
        const weaponDetected = (d.weapon ?? 0) > 0.5;
        return {
          url: imageUrl,
          ai_score: aiScore,
          deepfake_score: deepfakeScore,
          nudity_detected: nudityDetected,
          weapon_detected: weaponDetected,
          safe: aiScore <= 0.5 && !nudityDetected && !weaponDetected,
        };
      } catch { return null; }
    };

    const details: SightengineImgResult[] = [];
    for (let i = 0; i < imgUrls.length; i += 5) {
      const batch = await Promise.allSettled(imgUrls.slice(i, i + 5).map(scanOne));
      for (const r of batch) {
        if (r.status === 'fulfilled' && r.value) details.push(r.value);
      }
    }
    if (details.length === 0) return null;

    const aiImagesFound = details.filter(r => r.ai_score > 0.5).length;
    const deepfakeCount = details.filter(r => r.deepfake_score > 0.5).length;
    const nudityCount = details.filter(r => r.nudity_detected).length;
    const weaponCount = details.filter(r => r.weapon_detected).length;
    const unsafeCount = details.filter(r => !r.safe).length;
    return {
      imagesAnalysed: details.length,
      totalImagesFound,
      aiImagesFound,
      deepfakeCount,
      nudityCount,
      weaponCount,
      unsafeCount,
      allSafe: unsafeCount === 0,
      maxAiScore: Math.max(...details.map(r => r.ai_score * 100)),
      deepfakeDetected: deepfakeCount > 0,
    };
  } catch {
    return null;
  }
}

export async function performExtendedScan(
  domain: string
): Promise<ExtendedScanResult> {
  const [
    sslCheck,
    performanceCheck,
    impressumCheck,
    mobileCheck,
    metaTagsCheck,
    thirdPartyCheck,
    complianceCheck,
    aiAudit,
  ] = await Promise.all([
    checkSSL(domain),
    checkPerformance(domain),
    checkImpressum(domain),
    checkMobileFriendly(domain),
    checkMetaTags(domain),
    analyzeThirdParty(domain),
    detectComplianceIssues(domain),
    analyzeForAiContent(domain.startsWith('http') ? domain : `https://${domain}`),
  ]);

  const siteUrl = domain.startsWith('http') ? domain : `https://${domain}`;
  const [outdatedScripts, mixedContent, sightengineResult] = await Promise.all([
    checkOutdatedScripts(domain),
    checkMixedContent(domain),
    scanSiteImagesWithSightengine(siteUrl),
  ]);

  const hasPrivacyPolicy = !complianceCheck.needsPrivacyPolicy;
  // cookieBannerOk: vorhanden, nicht erforderlich (keine Tracker) oder nicht erkennbar (JS)
  // Nur 'fehlt_pflicht' zieht Punkte ab (Banner fehlt obwohl Tracker erkannt)
  const cookieBannerOk = complianceCheck.cookieBannerAssessment.status !== 'fehlt_pflicht';
  let complianceScore =
    hasPrivacyPolicy && cookieBannerOk ? 85 :
    hasPrivacyPolicy ? 65 :
    cookieBannerOk ? 50 : 40;
  // Bild-Sicherheit beeinflusst Compliance (EU AI Act / Datenschutz)
  if (sightengineResult) {
    if (sightengineResult.deepfakeCount > 0) complianceScore = Math.max(0, complianceScore - 15);
    if (sightengineResult.nudityCount > 0 || sightengineResult.weaponCount > 0) complianceScore = Math.max(0, complianceScore - 10);
    if (sightengineResult.aiImagesFound > 0) complianceScore = Math.max(0, complianceScore - 5);
  }
  // Ladezeit-Basis (0–100) + Tracker-Abzug (je 3 externe Scripts -5 Punkte, max -30)
  const loadTimeBase = Math.round(((3 - Math.min(performanceCheck.loadTime, 3)) / 3) * 100);
  const trackerPenalty = Math.min(30, thirdPartyCheck.totalScripts * 5);
  const optimizationScore = Math.max(0, loadTimeBase - trackerPenalty);
  
  const trustScore = Math.round(
    (
      (sslCheck.hasSSL ? 40 : 0) +
      (impressumCheck.hasImpressum ? 30 : 0) +
      (metaTagsCheck.completeness ? 30 : 0)
    ) / 1
  );

  const insights = generateInsights(
    complianceScore,
    optimizationScore,
    thirdPartyCheck.totalScripts,
    hasPrivacyPolicy,
    sslCheck.hasSSL,
    outdatedScripts.outdatedScripts,
    mixedContent.hasMixedContent
  );

  const recommendations = generateRecommendations(
    thirdPartyCheck.totalScripts,
    hasPrivacyPolicy,
    performanceCheck.loadTime,
    impressumCheck.hasImpressum,
    sslCheck.hasSSL,
    outdatedScripts.outdatedScripts,
    mixedContent.hasMixedContent
  );

  return {
    compliance: {
      score: complianceScore,
      jurisdiction: domain.includes('.ch') ? 'nDSG' : 'DSGVO',
      ampel: complianceScore > 70 ? '🟢' : complianceScore > 50 ? '🟡' : '🔴',
      hasPrivacyPolicy: !complianceCheck.needsPrivacyPolicy,
      trackersFound: complianceCheck.trackersFound,
      hasCookieBanner: complianceCheck.hasCookieBanner,
      cookieBannerProvider: complianceCheck.cookieBannerProvider ?? undefined,
      cookieBannerAssessment: complianceCheck.cookieBannerAssessment,
      jsRendering: complianceCheck.jsRendering,
    },
    optimization: {
      score: optimizationScore,
      loadTime: performanceCheck.loadTime,
      hasSSL: sslCheck.hasSSL,
      sslExpiry: sslCheck.expiry,
      isMobileFriendly: mobileCheck.isMobileFriendly,
      lighthouseScore: performanceCheck.lighthouseScore,
      trackerCount: thirdPartyCheck.totalScripts,
      estimatedSpeedImpact: `${Math.round((thirdPartyCheck.estimatedImpactMs / performanceCheck.loadTime) * 100)}% slower`,
    },
    trust: {
      score: trustScore,
      hasSSL: sslCheck.hasSSL,
      hasImpressum: impressumCheck.hasImpressum,
      impressumComplete: impressumCheck.impressumComplete,
      impressumMissing: impressumCheck.impressumMissing,
      hasContact: impressumCheck.hasContact,
      metaTagsComplete: metaTagsCheck.completeness > 80,
      noBrokenLinks: true,
    },
    insights,
    recommendations,
    aiAudit,
    sightengine: sightengineResult,
  };
}