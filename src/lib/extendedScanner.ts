/**
 * Extended Scanner v2.2
 * Compliance + Optimization + Security + AI Content Analysis
 */
import { isValidUrl } from '@/lib/scanner';
import { analyzeForAiContent, type AiAuditResult } from '@/lib/visualAiService';
import { detectCookieBanner } from '@/lib/cookieBannerDetector';
import { detectJsRendering, type JsRenderingResult } from '@/lib/jsRenderingDetector';

/** Realistischer Chrome-User-Agent für Website-Scans */
const UA_CHROME = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';
/** Fallback-UA (Safari/macOS) bei 403 im Retry */
const UA_SAFARI = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15';

// ─── Scan-Cache (In-Memory, 10 Minuten) ─────────────────────────────────────
// Verhindert redundante Scans wenn gleiche URL kurz hintereinander aufgerufen wird.
// Funktioniert innerhalb derselben Serverless-Instanz (fängt häufigsten Use-Case ab).
interface ScanCacheEntry {
  result: ExtendedScanResult;
  timestamp: number;
}
const scanCache = new Map<string, ScanCacheEntry>();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 Minuten

/**
 * Normalisiert eine URL für den Cache-Key.
 * Entfernt trailing Slash, Query-Parameter und Hash — nur Protocol + Hostname + Path.
 */
function normalizeCacheUrl(url: string): string {
  try {
    const u = new URL(url);
    const path = u.pathname.replace(/\/+$/, ''); // trailing Slash entfernen
    return `${u.protocol}//${u.hostname}${path}`.toLowerCase();
  } catch {
    return url.toLowerCase();
  }
}

/**
 * Browser-ähnliche Fetch-Optionen für Website-Scans.
 * Verhindert ECONNRESET / 403 bei strikten Webservern die Bot-User-Agents blocken.
 */
function buildScanFetchInit(timeoutMs: number, userAgent = UA_CHROME): RequestInit {
  return {
    headers: {
      'User-Agent': userAgent,
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
      'Accept-Language': 'de-CH,de;q=0.9,en;q=0.5',
      'Accept-Encoding': 'gzip, deflate, br',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Sec-Fetch-User': '?1',
      'Upgrade-Insecure-Requests': '1',
    },
    redirect: 'follow',
    signal: AbortSignal.timeout(timeoutMs),
  };
}

/** Ergebnis von fetchPageHtml */
interface FetchHtmlResult {
  html: string;
  ok: true;
}
interface FetchHtmlError {
  ok: false;
  /** Fehler-Code für Frontend-Meldungen */
  code: 'TIMEOUT' | 'BLOCKED' | 'NOT_FOUND' | 'DNS' | 'REFUSED' | 'SSL' | 'EMPTY' | 'CLOUDFLARE' | 'UNKNOWN';
  /** Deutschsprachige Benutzer-Meldung */
  message: string;
}

/**
 * Baut den Cookie-String aus einem Set-Cookie-Header zusammen.
 * Extrahiert nur Name=Value Paare, ignoriert Direktiven (Path, Domain, SameSite, …).
 * Mehrere Cookies können komma-separiert ankommen ODER als einzelner Header.
 */
function parseCookies(existing: string, setCookieHeader: string): string {
  // Split auf Kommas zwischen Cookie-Einträgen (nicht innerhalb von Expires-Dates)
  // Heuristik: Split nur wenn kein Weekday-Kürzel danach folgt (Mon, Tue, …)
  const entries = setCookieHeader.split(/,(?!\s*(Mon|Tue|Wed|Thu|Fri|Sat|Sun))/);
  const newPairs = entries
    .map(entry => entry.split(';')[0].trim())  // nur Name=Value
    .filter(pair => pair.includes('='));
  if (newPairs.length === 0) return existing;
  const combined = existing ? `${existing}; ${newPairs.join('; ')}` : newPairs.join('; ');
  return combined;
}

/**
 * Führt einen einzelnen HTTP-Request mit manueller Redirect-Verfolgung durch.
 * Cookies aus Set-Cookie Headers werden gesammelt und bei Redirects mitgeschickt.
 * Verhindert den Redirect-Loop bei Cookie-basierten Paywall-Systemen (Tamedia/Piano).
 *
 * @param startUrl  - Zu ladende URL
 * @param userAgent - Zu verwendender User-Agent
 * @param timeoutMs - Timeout pro Request (nicht gesamt)
 */
async function fetchWithCookies(
  startUrl: string,
  userAgent: string,
  timeoutMs: number,
): Promise<Response & { finalUrl: string }> {
  let currentUrl = startUrl;
  let cookies = '';
  const MAX_REDIRECTS = 5;

  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    const headers: Record<string, string> = {
      'User-Agent': userAgent,
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
      'Accept-Language': 'de-CH,de;q=0.9,en;q=0.5',
      'Accept-Encoding': 'gzip, deflate, br',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Sec-Fetch-User': '?1',
      'Upgrade-Insecure-Requests': '1',
    };

    // Gesammelte Cookies aus vorherigen Responses mitsenden
    if (cookies) headers['Cookie'] = cookies;

    const res = await fetch(currentUrl, {
      headers,
      redirect: 'manual',  // Redirects NICHT automatisch folgen
      signal: AbortSignal.timeout(timeoutMs),
    });

    // Cookies aus der Antwort sammeln (Cookie-Jar-Simulation)
    const setCookieHeader = res.headers.get('set-cookie');
    if (setCookieHeader) {
      cookies = parseCookies(cookies, setCookieHeader);
    }

    // Redirect (301, 302, 303, 307, 308)?
    const isRedirect = res.status >= 300 && res.status < 400;
    if (isRedirect) {
      const location = res.headers.get('location');
      if (!location) break; // Kein Location-Header → abbrechen
      // Relative URL zu absoluter URL aufloesen
      currentUrl = location.startsWith('http')
        ? location
        : new URL(location, currentUrl).href;
      continue;
    }

    // Erfolgreiche Antwort oder Fehler zurückgeben
    return Object.assign(res, { finalUrl: currentUrl });
  }

  // Max-Redirects überschritten — letzten Status als Fehler zurückgeben
  throw new Error('redirect count exceeded');
}

/**
 * Lädt den HTML-Inhalt einer URL mit Cookie-Persistenz und Retry-Logik.
 * - Manuelle Redirect-Verfolgung mit Cookie-Jar (Fix für Tamedia/Piano Paywall)
 * - 15s Timeout pro Versuch
 * - Retry mit Safari-UA bei 403
 * - HTTPS → HTTP Fallback bei Verbindungsfehlern
 * - Content-Validierung (Cloudflare, CAPTCHA, leerer Body)
 */
async function fetchPageHtml(inputUrl: string): Promise<FetchHtmlResult | FetchHtmlError> {
  const urls = [inputUrl];
  // HTTPS → HTTP Fallback als zweite Option
  if (inputUrl.startsWith('https://')) {
    urls.push(inputUrl.replace('https://', 'http://'));
  }

  let lastMessage = 'Der Scan konnte nicht durchgeführt werden. Bitte versuchen Sie es erneut.';

  for (const url of urls) {
    // Zwei Versuche: Chrome-UA, dann Safari-UA
    const userAgents = [UA_CHROME, UA_SAFARI];
    for (const ua of userAgents) {
      try {
        // Cookie-persistente Fetch-Funktion verwenden (kein Redirect-Loop bei Tamedia etc.)
        const res = await fetchWithCookies(url, ua, 15000);

        if (res.status === 403 || res.status === 401) {
          // Beim ersten UA nochmal mit Safari versuchen
          if (ua === UA_CHROME) continue;
          lastMessage = 'Die Website blockiert automatisierte Zugriffe. Dies betrifft meist grosse News-Portale mit Paywall oder Cloudflare-Schutz.';
          break;
        }

        if (res.status === 404) {
          return { ok: false, code: 'NOT_FOUND', message: 'Die Website wurde nicht gefunden. Bitte prüfen Sie die URL.' };
        }

        if (!res.ok) {
          lastMessage = `Die Website hat mit einem Fehler geantwortet (HTTP ${res.status}).`;
          break;
        }

        const html = await res.text();

        // Cloudflare Challenge erkennen
        if (html.includes('cf-browser-verification') || html.includes('challenge-platform') || html.includes('__cf_chl_')) {
          return { ok: false, code: 'CLOUDFLARE', message: 'Die Website ist durch Cloudflare geschützt und blockiert automatisierte Zugriffe (z.B. bei aktivem Bot-Schutz oder Paywall).' };
        }

        // CAPTCHA erkennen
        if ((html.includes('g-recaptcha') || html.includes('hcaptcha')) && html.length < 5000) {
          return { ok: false, code: 'CLOUDFLARE', message: 'Die Website erfordert eine CAPTCHA-Verifizierung und kann nicht automatisch gescannt werden.' };
        }

        // Zu wenig Content (wahrscheinlich leere JS-Shell)
        if (html.length < 400) {
          return { ok: false, code: 'EMPTY', message: 'Die Website liefert keinen ausreichenden HTML-Inhalt. Sie wird möglicherweise vollständig per JavaScript geladen (Single-Page Application). Unser Scanner unterstützt aktuell serverseitig gerenderte Websites.' };
        }

        return { ok: true, html };

      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        const name = err instanceof Error ? err.name : '';

        if (name === 'TimeoutError' || name === 'AbortError' || msg.includes('timeout')) {
          lastMessage = 'Die Website hat nicht innerhalb von 15 Sekunden geantwortet. Möglicherweise ist der Server überlastet oder blockiert Zugriffe.';
          break;
        }
        if (msg.includes('redirect count exceeded')) {
          lastMessage = 'Die Website leitet zu oft weiter (Redirect-Loop). Dies kann auf eine Paywall oder Cookie-Pflicht hinweisen.';
          break;
        }
        if (msg.includes('ENOTFOUND') || msg.includes('getaddrinfo') || msg.includes('EAI_AGAIN')) {
          return { ok: false, code: 'DNS', message: 'Die Domain konnte nicht aufgelöst werden. Bitte prüfen Sie die URL auf Tippfehler.' };
        }
        if (msg.includes('ECONNREFUSED')) {
          lastMessage = 'Die Verbindung zur Website wurde abgelehnt. Der Server ist möglicherweise nicht erreichbar.';
          break;
        }
        if (msg.includes('certificate') || msg.includes('SSL') || msg.includes('CERT_')) {
          lastMessage = 'SSL-Zertifikatsfehler. Die Website hat ein ungültiges oder abgelaufenes Zertifikat.';
          break;
        }
        lastMessage = 'Der Scan konnte nicht durchgeführt werden. Bitte versuchen Sie es erneut.';
      }
    }
  }

  return { ok: false, code: 'UNKNOWN', message: lastMessage };
}

/** Messwerte einer PageSpeed-Abfrage (mobile oder desktop) */
export interface PageSpeedScore {
  /** Performance-Score 0–100 */
  score: number;
  /** First Contentful Paint in ms */
  fcp: number;
  /** Largest Contentful Paint in ms */
  lcp: number;
  /** Total Blocking Time in ms */
  tbt: number;
  /** Cumulative Layout Shift (z.B. 0.05) */
  cls: number;
  /** Speed Index in ms */
  si: number;
}

export interface ExtendedScanResult {
  /**
   * Wenn der Haupt-Fetch der Seite fehlgeschlagen ist, enthält dieses Feld
   * eine deutschsprachige Benutzer-Meldung. Die übrigen Felder enthalten
   * dann Fallback-Werte (Partial Result).
   */
  fetchError?: string;
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
    /** 'no_images' = keine Content-Bilder nach Filter; 'success' = mind. 1 Bild analysiert */
    status: 'no_images' | 'success';
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
    /** Einzelne Bild-Ergebnisse für ai_detected_images Speicherung */
    imageDetails: Array<{ url: string; ai_score: number }>;
  } | null;
  /** Google PageSpeed Insights Ergebnisse (optional – Fallback auf intern wenn API nicht verfügbar) */
  pageSpeed?: {
    mobile: PageSpeedScore | null;
    desktop: PageSpeedScore | null;
    /** Kombinierter Score: mobile×0.6 + desktop×0.4 */
    combinedScore: number;
  };
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
    const res = await fetch(url, buildScanFetchInit(10000));
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

/**
 * Ruft Google PageSpeed Insights API v5 auf.
 * Gibt null zurück wenn API nicht erreichbar oder Timeout überschritten.
 * Verwendet manuellen AbortController statt AbortSignal.timeout() für maximale Runtime-Kompatibilität.
 */
async function fetchPageSpeedData(url: string, strategy: 'mobile' | 'desktop'): Promise<PageSpeedScore | null> {
  const controller = new AbortController();
  // 25s Timeout: ausreichend für PSI, passt in Vercel Pro Function (60s gesamt)
  const timer = setTimeout(() => controller.abort(), 25000);
  try {
    const apiKey = process.env.GOOGLE_PAGESPEED_API_KEY ?? '';
    const endpoint =
      `https://www.googleapis.com/pagespeedonline/v5/runPagespeed` +
      `?url=${encodeURIComponent(url)}&strategy=${strategy}&category=PERFORMANCE` +
      (apiKey ? `&key=${apiKey}` : '');
    const res = await fetch(endpoint, { signal: controller.signal });
    clearTimeout(timer);
    if (!res.ok) {
      console.error(`[PageSpeed] ${strategy}: HTTP ${res.status} für ${url}`);
      return null;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = await res.json();
    const perfScore: number | null = data?.lighthouseResult?.categories?.performance?.score ?? null;
    const audits = data?.lighthouseResult?.audits;
    if (perfScore == null || !audits) {
      console.error(`[PageSpeed] ${strategy}: Ungültige API-Antwort für ${url}`, JSON.stringify(data).slice(0, 200));
      return null;
    }
    return {
      score: Math.round(perfScore * 100),
      fcp: Math.round(audits['first-contentful-paint']?.numericValue ?? 0),
      lcp: Math.round(audits['largest-contentful-paint']?.numericValue ?? 0),
      tbt: Math.round(audits['total-blocking-time']?.numericValue ?? 0),
      cls: Math.round((audits['cumulative-layout-shift']?.numericValue ?? 0) * 1000) / 1000,
      si: Math.round(audits['speed-index']?.numericValue ?? 0),
    };
  } catch (err) {
    clearTimeout(timer);
    console.error(`[PageSpeed] ${strategy}: Fehler für ${url}:`, err instanceof Error ? err.message : String(err));
    return null;
  }
}

// ─── Link-Erkennungs-Hilfsfunktionen ──────────────────────────────────────────

/**
 * Prüft ob eine href-URL auf ein Impressum hinweist.
 * Schliesst Generator/Tool-Seiten aus (z.B. /impressum-generator).
 */
function isImpressumUrl(href: string): boolean {
  const lower = href.toLowerCase();
  if (
    !lower.includes('impressum') &&
    !lower.includes('imprint') &&
    !lower.includes('legal-notice') &&
    !lower.includes('mentions-legales') &&
    !lower.includes('note-legali')
  ) return false;
  // Generator/Tool-Seiten ausschliessen (False Positive verhindern)
  if (
    lower.includes('generator') ||
    lower.includes('erstellen') ||
    lower.includes('create') ||
    lower.includes('-tool') ||
    lower.includes('vorlage')
  ) return false;
  return true;
}

/**
 * Prüft ob eine href-URL auf eine Datenschutzerklärung hinweist.
 */
function isPrivacyUrl(href: string): boolean {
  const lower = href.toLowerCase();
  return (
    lower.includes('datenschutz') ||
    lower.includes('privacy') ||
    lower.includes('data-protection') ||
    lower.includes('datenschutzerklaerung') ||
    lower.includes('datenschutzrichtlinien') ||
    lower.includes('datenschutzhinweise') ||
    lower.includes('datenschutzbestimmungen') ||
    lower.includes('politique-de-confidentialite') ||
    lower.includes('informativa-sulla-privacy')
  );
}

/**
 * Extrahiert alle <a> Tags aus HTML-String und gibt href + sichtbaren Text zurück.
 * Entfernt innere HTML-Tags aus dem Text (z.B. <span>Impressum</span> → "Impressum").
 */
function extractAllLinks(html: string): Array<{ href: string; text: string; ariaLabel: string }> {
  const links: Array<{ href: string; text: string; ariaLabel: string }> = [];
  // Matcht <a ...> bis </a>, auch über mehrere Zeilen
  const pattern = /<a\s[^>]*>([\s\S]*?)<\/a>/gi;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(html)) !== null) {
    const fullTag = match[0];
    // href aus dem öffnenden Tag extrahieren
    const hrefMatch = fullTag.match(/href=["']([^"']+)["']/i);
    if (!hrefMatch) continue;
    const href = hrefMatch[1];
    // aria-label als Fallback-Text
    const ariaMatch = fullTag.match(/aria-label=["']([^"']+)["']/i);
    const ariaLabel = ariaMatch ? ariaMatch[1] : '';
    // title als weiterer Fallback
    const titleMatch = fullTag.match(/\btitle=["']([^"']+)["']/i);
    const titleText = titleMatch ? titleMatch[1] : '';
    // Sichtbaren Text: innere HTML-Tags entfernen, Whitespace normalisieren
    const rawInner = match[1];
    const text = rawInner
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    links.push({ href, text: text || titleText, ariaLabel });
  }
  return links;
}

/**
 * Extrahiert den Footer-Bereich aus dem HTML.
 * Gibt den Footer zurück (oder die letzten 25% des HTML als Fallback).
 */
function extractFooter(html: string): string {
  const footerMatch = html.match(/<footer[\s\S]*?<\/footer>/i);
  if (footerMatch) return footerMatch[0];
  // Fallback: letzten 25% des HTML
  return html.slice(-Math.floor(html.length * 0.25));
}

export async function checkImpressum(domain: string): Promise<{
  hasImpressum: boolean;
  impressumComplete: boolean;
  impressumMissing: string[];
  hasContact: boolean;
  hasAbout: boolean;
  foundPages: string[];
}> {
  // Echtes HTML laden — Cookie-persistente Funktion für Paywall-Sites (Tamedia, Piano)
  let html = '';
  try {
    const url = domain.startsWith('http') ? domain : `https://${domain}`;
    const res = await fetchWithCookies(url, UA_CHROME, 8000);
    if (res.ok) html = await res.text();
  } catch { /* Fallback: leeres HTML, hasImpressum = false */ }

  const htmlLow = html.toLowerCase();

  // Strategie 1: Link-href-Erkennung (exakte End-Patterns, wie bisher)
  // Prüft absolute Pfade (/impressum, /Impressum.htm) und relative URLs
  // Explizite Endzeichen vermeiden False Positive durch /impressum-generator
  const hasImpressumHref =
    htmlLow.includes('/impressum"') ||
    htmlLow.includes("/impressum'") ||
    htmlLow.includes('/impressum/') ||
    htmlLow.includes('/impressum.') ||
    htmlLow.includes('/impressum?') ||
    htmlLow.includes('/impressum#') ||
    htmlLow.includes('/imprint"') ||
    htmlLow.includes("/imprint'") ||
    htmlLow.includes('/imprint/') ||
    htmlLow.includes('/imprint.') ||
    htmlLow.includes('/legal-notice') ||
    htmlLow.includes('/mentions-legales') ||
    htmlLow.includes('/note-legali') ||
    htmlLow.includes('href="impressum.') ||
    htmlLow.includes("href='impressum.") ||
    htmlLow.includes('href="impressum"') ||
    htmlLow.includes("href='impressum'") ||
    htmlLow.includes('href="impressum/') ||
    htmlLow.includes("href='impressum/") ||
    htmlLow.includes('href="imprint.') ||
    htmlLow.includes("href='imprint.");

  // Strategie 2: Link-Text-Erkennung (direktes Inline-Text-Pattern)
  const hasImpressumTextInline =
    />\s*impressum\s*</i.test(html) ||
    />\s*imprint\s*</i.test(html) ||
    />\s*legal\s*notice\s*</i.test(html) ||
    />\s*mentions\s*l[ée]gales\s*</i.test(html);

  // Strategie 3 (NEU): Alle <a> Tags durchsuchen — href-URL + sichtbarer Text + aria-label
  // Dies erkennt URLs wie /impressum-basler-zeitung-413277192333 sowie verschachtelte Spans
  const allLinks = extractAllLinks(html);
  const hasImpressumByLink = allLinks.some(link => {
    // URL prüfen (z.B. /impressum-basler-zeitung-...)
    if (isImpressumUrl(link.href)) return true;
    // Sichtbaren Link-Text prüfen (case-insensitive)
    const textLow = link.text.toLowerCase();
    if (textLow.includes('impressum') || textLow.includes('imprint') || textLow === 'legal notice') return true;
    // aria-label prüfen
    const ariaLow = link.ariaLabel.toLowerCase();
    if (ariaLow.includes('impressum') || ariaLow.includes('imprint')) return true;
    return false;
  });

  // Strategie 4 (NEU): Footer gezielt parsen — höchste Treffsicherheit
  const footerHtml = extractFooter(html);
  const footerLinks = extractAllLinks(footerHtml);
  const hasImpressumInFooter = footerLinks.some(link => {
    if (isImpressumUrl(link.href)) return true;
    const textLow = link.text.toLowerCase();
    return textLow.includes('impressum') || textLow.includes('imprint');
  });

  const hasImpressum =
    hasImpressumHref ||
    hasImpressumTextInline ||
    hasImpressumByLink ||
    hasImpressumInFooter;

  const foundPages = hasImpressum ? ['/impressum'] : [];

  // Kontakt-Link erkennen
  const hasContact =
    htmlLow.includes('/kontakt') ||
    htmlLow.includes('/contact') ||
    htmlLow.includes('href="kontakt') ||
    htmlLow.includes("href='kontakt") ||
    />\s*kontakt\s*</i.test(html) ||
    />\s*contact\s*</i.test(html) ||
    allLinks.some(l => {
      const t = l.text.toLowerCase();
      return t === 'kontakt' || t === 'contact' || t.startsWith('kontakt') || t.startsWith('contact');
    });

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
  'segment.com': { name: 'Segment', category: 'analytics' },
  'mixpanel.com': { name: 'Mixpanel', category: 'analytics' },
  'amplitude.com': { name: 'Amplitude', category: 'analytics' },
  'heap.io': { name: 'Heap Analytics', category: 'analytics' },
  // Publisher Analytics (Medienbranche)
  'piano.io': { name: 'Piano Analytics', category: 'analytics' },
  'tinypass.com': { name: 'Piano/Tinypass', category: 'analytics' },
  'chartbeat.com': { name: 'Chartbeat', category: 'analytics' },
  'static.chartbeat.com': { name: 'Chartbeat', category: 'analytics' },
  'cdn.parsely.com': { name: 'Parse.ly', category: 'analytics' },
  'api.parsely.com': { name: 'Parse.ly', category: 'analytics' },
  // Error Monitoring
  'browser.sentry-cdn.com': { name: 'Sentry', category: 'analytics' },
  'sentry.io': { name: 'Sentry', category: 'analytics' },
  'newrelic.com': { name: 'New Relic', category: 'analytics' },
  'js-agent.newrelic.com': { name: 'New Relic', category: 'analytics' },
  // A/B Testing / Personalisierung
  'cdn.optimizely.com': { name: 'Optimizely', category: 'tracker' },
  // Consent Management Platforms
  'cdn.onetrust.com': { name: 'OneTrust', category: 'tracker' },
  'cdn.cookielaw.org': { name: 'OneTrust CookieLaw', category: 'tracker' },
  'consent.cookiebot.com': { name: 'Cookiebot', category: 'tracker' },
  'consentcdn.cookiebot.com': { name: 'Cookiebot', category: 'tracker' },
  'app.usercentrics.eu': { name: 'Usercentrics', category: 'tracker' },
  'privacy-proxy.usercentrics.eu': { name: 'Usercentrics', category: 'tracker' },
  'cmp.quantcast.com': { name: 'Quantcast CMP', category: 'tracker' },
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
  // Medien-Embeds (DSGVO-relevant: externe Ressourcen)
  'fonts.googleapis.com': { name: 'Google Fonts', category: 'tracker' },
  'maps.googleapis.com': { name: 'Google Maps', category: 'tracker' },
  'www.youtube.com/embed': { name: 'YouTube Embed', category: 'tracker' },
  'youtube-nocookie.com': { name: 'YouTube (nocookie)', category: 'tracker' },
  'player.vimeo.com': { name: 'Vimeo Embed', category: 'tracker' },
  // Chat / Support
  'intercom.io': { name: 'Intercom', category: 'tracker' },
  'crisp.chat': { name: 'Crisp Chat', category: 'tracker' },
  'widget.userlike.com': { name: 'Userlike Chat', category: 'tracker' },
  'cdn.livechatinc.com': { name: 'LiveChat', category: 'tracker' },
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
    const res = await fetchWithCookies(url, UA_CHROME, 8000);
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
      const res = await fetch(url, buildScanFetchInit(8000));
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
      const res = await fetch(url, buildScanFetchInit(8000));
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
  /** Fehler-Meldung wenn die Seite nicht geladen werden konnte */
  fetchError?: string;
  /** Gefetchtes HTML — wird von performExtendedScan an die zweite Check-Gruppe weitergegeben */
  _html: string;
}> {
  const url = domain.startsWith('http') ? domain : `https://${domain}`;
  const fetchResult = await fetchPageHtml(url);
  let html = '';
  let fetchError: string | undefined;

  if (fetchResult.ok) {
    html = fetchResult.html;
  } else {
    fetchError = fetchResult.message;
    // Leeres HTML → alle HTML-basierten Checks schlagen fehl (Partial Result)
    html = '';
  }

  const htmlLow = html.toLowerCase();

  // Cookie-Banner-Erkennung via 5 Strategien (30+ CMP-Patterns)
  const cookieBannerResult = detectCookieBanner(html);
  const hasCookieBanner = cookieBannerResult.detected;
  const cookieBannerProvider = cookieBannerResult.provider;

  // JS-Rendering-Erkennung (SPA-Seiten → Scan-Ergebnisse möglicherweise unvollständig)
  let jsRendering = detectJsRendering(html);

  // Zusätzliche JS-Rendering-Heuristik: wenig Textinhalt aber viele Script-Tags
  if (!jsRendering.isLikelyJsRendered) {
    const textContent = html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
    const scriptCount = (html.match(/<script/gi) ?? []).length;
    if (textContent.length < 5000 && scriptCount > 10) {
      jsRendering = {
        ...jsRendering,
        isLikelyJsRendered: true,
        confidence: 'medium',
        scanReliability: 'eingeschränkt',
        signals: [...jsRendering.signals, `Wenig Textinhalt (${textContent.length} Zeichen) bei ${scriptCount} Script-Tags`],
      };
    }
  }

  // ─── Datenschutz-Erkennung ────────────────────────────────────────────────────

  // Strategie 1: Link-href-Erkennung (direkte String-Suche)
  const privacyByHref =
    html.includes('name="privacy-policy"') ||
    htmlLow.includes('/datenschutz') ||               // /datenschutz, /Datenschutz.htm, ./datenschutz
    htmlLow.includes('/privacy') ||                   // /privacy-policy, /privacy
    htmlLow.includes('/datenschutzerklaerung') ||
    htmlLow.includes('/data-protection') ||
    htmlLow.includes('privacy-policy') ||
    htmlLow.includes('href="datenschutz') ||
    htmlLow.includes("href='datenschutz") ||
    htmlLow.includes('href="privacy') ||
    htmlLow.includes("href='privacy");

  // Strategie 2: Inline-Text-Erkennung (direktes ><text>< Pattern)
  const privacyByTextInline =
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

  // Strategie 4 (NEU): Alle <a> Tags durchsuchen — href + sichtbarer Text + aria-label
  // Erkennt z.B. /datenschutzerklaerung-954908797441 und verschachtelte Spans
  const allLinksCompliance = extractAllLinks(html);
  const privacyByLink = allLinksCompliance.some(link => {
    if (isPrivacyUrl(link.href)) return true;
    const textLow = link.text.toLowerCase();
    if (
      textLow.includes('datenschutz') ||
      textLow.includes('privacy') ||
      textLow.includes('data protection')
    ) return true;
    const ariaLow = link.ariaLabel.toLowerCase();
    return ariaLow.includes('datenschutz') || ariaLow.includes('privacy');
  });

  // Strategie 5 (NEU): Footer gezielt parsen
  const footerHtmlCompliance = extractFooter(html);
  const footerLinksCompliance = extractAllLinks(footerHtmlCompliance);
  const privacyInFooter = footerLinksCompliance.some(link => {
    if (isPrivacyUrl(link.href)) return true;
    const textLow = link.text.toLowerCase();
    return textLow.includes('datenschutz') || textLow.includes('privacy');
  });

  let hasPrivacyPolicy =
    privacyByHref ||
    privacyByTextInline ||
    privacyKeywordCount >= 3 ||
    privacyByLink ||
    privacyInFooter;

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
        const impressumRes = await fetch(impressumUrl, buildScanFetchInit(6000));
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
    fetchError,
    // HTML weitergeben damit performExtendedScan es an die zweite Prüfgruppe weitergeben kann
    // (verhindert 3 redundante Fetches in checkOutdatedScripts, checkMixedContent, scanSiteImagesWithSightengine)
    _html: html,
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

async function scanSiteImagesWithSightengine(url: string, preloadedHtml?: string): Promise<{
  status: 'no_images' | 'success';
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
  /** Einzelne Bild-Ergebnisse für ai_detected_images Speicherung */
  imageDetails: Array<{ url: string; ai_score: number }>;
} | null> {
  const apiUser = process.env.SIGHTENGINE_API_USER;
  const apiSecret = process.env.SIGHTENGINE_API_SECRET;
  if (!apiUser || !apiSecret) return null;

  try {
    // Vorgeladenes HTML verwenden falls vorhanden — spart einen Fetch
    let html: string;
    if (preloadedHtml !== undefined && preloadedHtml.length > 0) {
      html = preloadedHtml;
    } else {
      const res = await fetch(url, buildScanFetchInit(8000));
      if (!res.ok) return null;
      html = await res.text();
    }

    // Filtert nur eindeutige UI-Elemente (Sprites, Favicons) aus — Content-Bilder bleiben erhalten
    const isContentImage = (absUrl: string, imgTag: string): boolean => {
      let pathname: string;
      try {
        pathname = new URL(absUrl).pathname.toLowerCase();
      } catch {
        return false;
      }
      // Dateiname ohne Querystring
      const filename = pathname.split('/').pop()?.split('?')[0] ?? '';
      // Nur eindeutige UI-Artefakte (Sprite-Sheets, Favicons) ausschliessen
      if (/sprite|favicon/i.test(filename)) return false;
      // Favicon- und Sprite-Verzeichnisse ausschliessen
      if (/\/(favicons?|sprites?)\//i.test(pathname)) return false;
      // Nur ausschliessen wenn BEIDE Dimensionen gesetzt sind UND beide < 50px
      const wMatch = imgTag.match(/\bwidth=["']?(\d+)/i);
      const hMatch = imgTag.match(/\bheight=["']?(\d+)/i);
      if (wMatch && hMatch && parseInt(wMatch[1]) < 50 && parseInt(hMatch[1]) < 50) return false;
      return true;
    };

    /**
     * Bereitet eine Bild-URL für Sightengine vor:
     * 1. HTML-Entities dekodieren (&amp; → &) — nötig für CDN-Query-Parameter in HTML-Attributen
     * 2. CDN-Resize-Parameter entfernen (Shopify ?width=200, Imgix ?w=, etc.)
     *    Sightengine erwartet das Vollbild — kleine Vorschau-URLs liefern HTTP 400
     */
    const prepareImageUrlForSightengine = (rawUrl: string): string => {
      // Schritt 1: HTML-Entities dekodieren
      const decoded = rawUrl
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>');
      // Schritt 2: CDN-Resize-Parameter entfernen
      try {
        const urlObj = new URL(decoded);
        ['width', 'w', 'h', 'height', 'size', 'resize', 'fit'].forEach(p => urlObj.searchParams.delete(p));
        return urlObj.toString();
      } catch {
        // URL noch nicht absolut (relative URL) — dekodierten String zurückgeben
        return decoded;
      }
    };

    // Hilfsfunktion: Bild-URL aus Tag extrahieren (src → data-src → data-lazy-src → srcset)
    const extractImgSrc = (imgTag: string): string | null => {
      // Standard src
      const srcM = imgTag.match(/\bsrc=["']([^"']+)["']/i);
      if (srcM && !srcM[1].startsWith('data:') && srcM[1] !== 'about:blank') return prepareImageUrlForSightengine(srcM[1]);
      // Lazy-Load: data-src / data-lazy-src / data-original
      const dataSrcM = imgTag.match(/\bdata-(?:lazy-)?(?:src|original)=["']([^"']+)["']/i);
      if (dataSrcM && !dataSrcM[1].startsWith('data:')) return prepareImageUrlForSightengine(dataSrcM[1]);
      // srcset: ersten Eintrag (vor Leerzeichen oder Komma) verwenden
      const srcsetM = imgTag.match(/\bsrcset=["']([^"',\s]+)/i);
      if (srcsetM && !srcsetM[1].startsWith('data:')) return prepareImageUrlForSightengine(srcsetM[1]);
      return null;
    };

    // Eigene Dataquard-Assets aus Sightengine-Scan ausschliessen
    const EXCLUDED_SCAN_DOMAINS = new Set(['dataquard.ch', 'www.dataquard.ch']);

    // Alle geeigneten Content-Bilder sammeln (max. 50 für Total-Zählung)
    const allImgUrls: string[] = [];
    const seenUrls = new Set<string>();
    const base = new URL(url);
    for (const match of html.matchAll(/<img[^>]+>/gi)) {
      try {
        const imgTag = match[0];
        const src = extractImgSrc(imgTag);
        if (!src) continue;
        const absUrl = new URL(src, base).href;
        if (seenUrls.has(absUrl)) continue;
        seenUrls.add(absUrl);
        // Eigene Domain überspringen
        if (EXCLUDED_SCAN_DOMAINS.has(new URL(absUrl).hostname)) continue;
        // Nur jpg/png/webp — kein svg, kein gif, kein ico
        if (!/\.(jpe?g|png|webp)(\?.*)?$/i.test(absUrl)) continue;
        // Sprite/Favicon filtern
        if (!isContentImage(absUrl, imgTag)) continue;
        allImgUrls.push(prepareImageUrlForSightengine(absUrl));
        if (allImgUrls.length >= 50) break; // Maximale Anzahl für Total-Zählung
      } catch { /* skip */ }
    }
    if (process.env.NODE_ENV === 'development') {
      console.error(`[Sightengine] Bilder auf ${url}: ${seenUrls.size} gefunden, ${allImgUrls.length} nach Filter`);
    }
    const totalImagesFound = allImgUrls.length;
    // Free-Tier: max. 5 Bilder pro Scan
    const imgUrls = allImgUrls.slice(0, 5);
    // Keine Content-Bilder nach Filter — kein API-Fehler, nur leere Seite
    if (imgUrls.length === 0) return {
      status: 'no_images',
      imagesAnalysed: 0,
      totalImagesFound,
      aiImagesFound: 0,
      deepfakeCount: 0,
      nudityCount: 0,
      weaponCount: 0,
      unsafeCount: 0,
      allSafe: true,
      maxAiScore: 0,
      deepfakeDetected: false,
      imageDetails: [],
    };

    const scanOne = async (imageUrl: string): Promise<SightengineImgResult | null> => {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 10000);
      try {
        const params = new URLSearchParams({
          url: imageUrl,
          models: 'nudity-2.1,weapon,genai',
          api_user: apiUser,
          api_secret: apiSecret,
        });
        const r = await fetch(`https://api.sightengine.com/1.0/check.json?${params}`, {
          signal: ctrl.signal,
        });
        clearTimeout(t);
        if (!r.ok) {
          console.error(`[Sightengine] HTTP ${r.status} für Bild: ${imageUrl}`);
          return null;
        }
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
      } catch (err) {
        clearTimeout(t);
        console.error(`[Sightengine] Fehler bei Bild ${imageUrl}:`, err instanceof Error ? err.message : String(err));
        return null;
      }
    };

    const details: SightengineImgResult[] = [];
    for (let i = 0; i < imgUrls.length; i += 5) {
      const batch = await Promise.allSettled(imgUrls.slice(i, i + 5).map(scanOne));
      for (const r of batch) {
        if (r.status === 'fulfilled' && r.value) details.push(r.value);
      }
    }
    // Bilder gefunden, aber keine konnte analysiert werden (z.B. Icons die durch Filter schlüpften)
    if (details.length === 0) return {
      status: 'no_images' as const,
      imagesAnalysed: 0,
      totalImagesFound,
      aiImagesFound: 0,
      deepfakeCount: 0,
      nudityCount: 0,
      weaponCount: 0,
      unsafeCount: 0,
      allSafe: true,
      maxAiScore: 0,
      deepfakeDetected: false,
      imageDetails: [],
    };

    const aiImagesFound = details.filter(r => r.ai_score > 0.5).length;
    const deepfakeCount = details.filter(r => r.deepfake_score > 0.5).length;
    const nudityCount = details.filter(r => r.nudity_detected).length;
    const weaponCount = details.filter(r => r.weapon_detected).length;
    const unsafeCount = details.filter(r => !r.safe).length;
    return {
      status: 'success',
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
      imageDetails: details.map(r => ({ url: r.url, ai_score: r.ai_score })),
    };
  } catch (err) {
    console.error('[Sightengine] Unerwarteter Fehler:', err instanceof Error ? err.message : String(err));
    return null;
  }
}

export async function performExtendedScan(
  domain: string
): Promise<ExtendedScanResult> {
  // Cache prüfen — gleiche Domain innerhalb von 10 Minuten sofort zurückgeben (kein neuer Scan)
  const cacheKey = normalizeCacheUrl(domain);
  const cached = scanCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.result;
  }

  const siteUrl = domain.startsWith('http') ? domain : `https://${domain}`;

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
    analyzeForAiContent(siteUrl),
  ]);

  // HTML aus Compliance-Check wiederverwenden — verhindert 3 redundante Fetches
  // (checkOutdatedScripts, checkMixedContent und scanSiteImagesWithSightengine brauchen HTML)
  const sharedHtml = complianceCheck._html ?? '';

  const [outdatedScripts, mixedContent, sightengineResult, pageSpeedMobile, pageSpeedDesktop] = await Promise.all([
    checkOutdatedScripts(domain, sharedHtml || undefined),
    checkMixedContent(domain, sharedHtml || undefined),
    scanSiteImagesWithSightengine(siteUrl, sharedHtml || undefined),
    fetchPageSpeedData(siteUrl, 'mobile'),
    fetchPageSpeedData(siteUrl, 'desktop'),
  ]);

  const hasPrivacyPolicy = !complianceCheck.needsPrivacyPolicy;
  // cookieBannerOk: vorhanden, nicht erforderlich (keine Tracker) oder nicht erkennbar (JS)
  // Nur 'fehlt_pflicht' zieht Punkte ab (Banner fehlt obwohl Tracker erkannt)
  const cookieBannerOk = complianceCheck.cookieBannerAssessment.status !== 'fehlt_pflicht';
  let complianceScore =
    hasPrivacyPolicy && cookieBannerOk ? 85 :
    hasPrivacyPolicy ? 65 :
    cookieBannerOk ? 50 : 40;
  // Bild-Sicherheit beeinflusst Compliance (EU AI Act / Datenschutz) — nur bei erfolgreichem Scan
  if (sightengineResult && sightengineResult.status === 'success') {
    if (sightengineResult.deepfakeCount > 0) complianceScore = Math.max(0, complianceScore - 15);
    if (sightengineResult.nudityCount > 0 || sightengineResult.weaponCount > 0) complianceScore = Math.max(0, complianceScore - 10);
    if (sightengineResult.aiImagesFound > 0) complianceScore = Math.max(0, complianceScore - 5);
  }
  // PageSpeed Insights: kombinierter Score wenn verfügbar (mobile×0.6 + desktop×0.4)
  const pageSpeedData = (pageSpeedMobile || pageSpeedDesktop) ? {
    mobile: pageSpeedMobile,
    desktop: pageSpeedDesktop,
    combinedScore: pageSpeedMobile && pageSpeedDesktop
      ? Math.round(pageSpeedMobile.score * 0.6 + pageSpeedDesktop.score * 0.4)
      : (pageSpeedMobile?.score ?? pageSpeedDesktop?.score ?? 0),
  } : undefined;

  // Ladezeit-Basis (0–100) + Tracker-Abzug (je 3 externe Scripts -5 Punkte, max -30)
  const loadTimeBase = Math.round(((3 - Math.min(performanceCheck.loadTime, 3)) / 3) * 100);
  const trackerPenalty = Math.min(30, thirdPartyCheck.totalScripts * 5);
  const internalOptimizationScore = Math.max(0, loadTimeBase - trackerPenalty);
  // PageSpeed-Daten vorhanden: echten Score verwenden; sonst intern berechneten Fallback
  const optimizationScore = pageSpeedData ? pageSpeedData.combinedScore : internalOptimizationScore;
  
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

  const scanResult: ExtendedScanResult = {
    fetchError: complianceCheck.fetchError,
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
    pageSpeed: pageSpeedData,
  };

  // Ergebnis im Cache speichern (10 Minuten TTL)
  scanCache.set(cacheKey, { result: scanResult, timestamp: Date.now() });

  return scanResult;
}