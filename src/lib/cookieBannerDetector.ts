/**
 * Cookie-Banner-Erkennung v2.0
 * Erkennt Cookie-Consent-Management-Plattformen (CMPs) via 5 Strategien:
 * 1. Script-Source-Pattern (zuverlässigste Methode)
 * 2. Inline-Script-Pattern
 * 3. HTML-Element-Pattern (IDs, Classes, data-Attribute)
 * 4. Meta-Tag / Noscript-Pattern
 * 5. Text-Content-Fallback
 */

export interface CookieBannerResult {
  /** true wenn ein Cookie-Banner erkannt wurde */
  detected: boolean;
  /** Name des CMP-Anbieters, z.B. "CookieBot" oder "Eigenentwicklung" */
  provider: string | null;
  /** Erkennungsmethode */
  detectionMethod: 'script-source' | 'inline-script' | 'html-element' | 'meta-tag' | 'text-fallback' | 'none';
  /** Wie sicher ist die Erkennung */
  confidence: 'high' | 'medium' | 'low';
  /** Beschreibung was gefunden wurde */
  details: string;
}

/** Bekannte CMP Script-Domain-Pattern → Provider-Name */
const SCRIPT_SOURCE_PATTERNS: Array<{ pattern: RegExp; provider: string }> = [
  // Grosse internationale CMPs
  { pattern: /cookiebot\.com/i, provider: 'CookieBot (Usercentrics)' },
  { pattern: /onetrust\.com/i, provider: 'OneTrust' },
  { pattern: /osano\.com/i, provider: 'Osano' },
  { pattern: /termly\.io/i, provider: 'Termly' },
  { pattern: /cookiefirst\.com/i, provider: 'CookieFirst' },
  { pattern: /ketch\.com/i, provider: 'Ketch' },
  { pattern: /iubenda\.com/i, provider: 'iubenda' },
  { pattern: /quantcast\.com.*choice/i, provider: 'Quantcast Choice' },
  { pattern: /trustarc\.com/i, provider: 'TrustArc' },
  { pattern: /didomi\.io/i, provider: 'Didomi' },
  { pattern: /axeptio\.eu/i, provider: 'Axeptio' },
  { pattern: /consentmanager\.net/i, provider: 'Consentmanager' },
  { pattern: /usercentrics\.eu/i, provider: 'Usercentrics' },
  { pattern: /usercentrics\.com/i, provider: 'Usercentrics' },
  { pattern: /secureprivacy\.ai/i, provider: 'Secure Privacy' },
  { pattern: /pandectes\.io/i, provider: 'Pandectes' },
  { pattern: /enzuzo\.com/i, provider: 'Enzuzo' },
  { pattern: /metomic\.io/i, provider: 'Metomic' },
  { pattern: /civic\.com.*cookie/i, provider: 'Civic Cookie Control' },
  { pattern: /cookiepro\.com/i, provider: 'CookiePro (OneTrust)' },
  { pattern: /cookie-script\.com/i, provider: 'Cookie-Script' },
  { pattern: /cookieyes\.com/i, provider: 'CookieYes' },
  { pattern: /cookiehub\.com/i, provider: 'CookieHub' },
  { pattern: /cookieinfoscript/i, provider: 'Cookie Info Script' },
  { pattern: /tarteaucitron/i, provider: 'tarteaucitron.js' },

  // Klaro
  { pattern: /klaro\.org/i, provider: 'Klaro' },
  { pattern: /klaro\.kiprotect/i, provider: 'Klaro' },

  // WordPress-Plugins
  { pattern: /complianz/i, provider: 'Complianz (WordPress)' },
  { pattern: /borlabs-cookie/i, provider: 'Borlabs Cookie (WordPress)' },
  { pattern: /real-cookie-banner/i, provider: 'Real Cookie Banner (WordPress)' },
  { pattern: /cookie-law-info/i, provider: 'CookieYes/Cookie Law Info (WordPress)' },
  { pattern: /gdpr-cookie-compliance/i, provider: 'GDPR Cookie Compliance (WordPress)' },
  { pattern: /moove.*gdpr/i, provider: 'Moove GDPR (WordPress)' },
  { pattern: /cookie-notice/i, provider: 'Cookie Notice (WordPress)' },

  // Schweiz-spezifisch / weitere CMPs
  { pattern: /livechat.*cookie/i, provider: 'LiveChat Cookie Banner' },
  { pattern: /app\.termly\.io/i, provider: 'Termly' },
  { pattern: /cdn\.cookielaw\.org/i, provider: 'OneTrust' },
  { pattern: /geolocation\.onetrust\.com/i, provider: 'OneTrust' },
  { pattern: /optanon/i, provider: 'OneTrust (Optanon)' },
  { pattern: /cc\.cdn\.civiccomputing/i, provider: 'Civic Cookie Control' },
  { pattern: /consent\.cookiebot\.com/i, provider: 'CookieBot (Usercentrics)' },
  { pattern: /consentcdn\.cookiebot\.com/i, provider: 'CookieBot (Usercentrics)' },
  { pattern: /policy\.app\.usercentrics\.eu/i, provider: 'Usercentrics' },
  { pattern: /consent\.yahoo\.com/i, provider: 'Yahoo Consent' },
  { pattern: /fundingchoicesmessages\.google\.com/i, provider: 'Google Funding Choices' },
  { pattern: /cmp\.inmobi\.com/i, provider: 'InMobi CMP' },
  // Cookiebot data-Attribute (kein src nötig)
  { pattern: /data-cbid\s*=/i, provider: 'CookieBot (Usercentrics)' },
  { pattern: /id\s*=\s*["']Cookiebot["']/i, provider: 'CookieBot (Usercentrics)' },
  // Weitere Nischen-CMPs
  { pattern: /silktide\.com/i, provider: 'Silktide' },
  { pattern: /privacybee\.com/i, provider: 'PrivacyBee' },
  { pattern: /eprivacycookiesolution\.com/i, provider: 'ePrivacy' },
  { pattern: /windcave.*consent/i, provider: 'Windcave CMP' },
];

/** Inline-Script-Pattern für Cookie-Banner-Initialisierung */
const INLINE_SCRIPT_PATTERNS: RegExp[] = [
  /CookieConsent\s*\(/i,
  /CookieConsent\s*\.\s*init/i,
  /cookieconsent\s*\./i,
  /CookieBanner/i,
  /cookie_banner/i,
  /gdprConsent/i,
  /showCookieBanner/i,
  /initCookieConsent/i,
  /cookie[-_]?consent[-_]?config/i,
  /OneTrust\s*\./i,
  /OneTrust\s*\(/i,
  /OptanonWrapper/i,
  /Osano\s*\(/i,
  /tarteaucitron/i,
  /klaro\.show/i,
  /klaro\.render/i,
  /cookiefirst/i,
  /Didomi\s*\./i,
  /window\.axeptioSettings/i,
  /window\.usercentrics/i,
  /window\.UC_UI/i,
  /consentMode/i,
  /gtag.*consent/i,
  /dataLayer\.push.*consent/i,
  /CookieFirst/i,
  /borlabsCookie/i,
  /BorlabsCookie/i,
  /complianz/i,
  /cmplz/i,
  /CookieYes/i,
  /cookieyes/i,
];

/** HTML-Element-Pattern (IDs, Classes, data-Attribute) */
const ELEMENT_ID_PATTERNS: RegExp[] = [
  // Bekannte IDs
  /id\s*=\s*["']CybotCookiebotDialog["']/i,
  /id\s*=\s*["']onetrust[-_]/i,
  /id\s*=\s*["']ot-sdk/i,
  /id\s*=\s*["']optanon/i,
  /id\s*=\s*["']osano[-_]/i,
  /id\s*=\s*["']termly[-_]/i,
  /id\s*=\s*["']didomi[-_]/i,
  /id\s*=\s*["']axeptio/i,
  /id\s*=\s*["']usercentrics/i,
  /id\s*=\s*["']klaro/i,
  /id\s*=\s*["']tarteaucitron/i,
  /id\s*=\s*["']complianz/i,
  /id\s*=\s*["']borlabs/i,
  /id\s*=\s*["']cookieyes/i,
  // Generische Cookie-Banner IDs
  /id\s*=\s*["']cookie[-_]?(banner|consent|notice|popup|bar|modal|overlay|wrapper|container|box|message|info|policy|gdpr|notification|alert|dialog|widget|layer|strip|ribbon|disclaimer|warning|accept)["']/i,
  // CSS-Klassen
  /class\s*=\s*["'][^"']*cookie[-_]?(banner|consent|notice|popup|bar|modal|overlay|wrapper|container|box)["']/i,
  /class\s*=\s*["'][^"']*cc[-_]?(banner|window|dialog|container|message|overlay|root)["']/i,
  /class\s*=\s*["'][^"']*gdpr[-_]?(banner|consent|notice|popup|bar|modal)["']/i,
  /class\s*=\s*["'][^"']*consent[-_]?(banner|bar|modal|popup|dialog|overlay|wrapper|notice|manager)["']/i,
  /class\s*=\s*["'][^"']*privacy[-_]?(banner|bar|notice|popup|overlay)["']/i,
  // data-Attribute
  /data-cookie[-_]?consent/i,
  /data-gdpr/i,
  /data-cc["-\s]/i,
  // aria-label
  /aria-label\s*=\s*["'][^"']*cookie/i,
  // Eigenentwicklungen: generische Section/Div IDs
  /id\s*=\s*["']cookies["']/i,
  /id\s*=\s*["']cookieDisclaimer["']/i,
  /id\s*=\s*["']cleanCookieDisclaimer["']/i,
  /RemoveCookieDisclaimer/i,
  /id\s*=\s*["']cookie[-_]?(bar|strip|ribbon|hint|message|hint)["']/i,
];

/** Meta-Tag / Link / Noscript-Pattern */
const META_PATTERNS: RegExp[] = [
  /<meta[^>]*cookie[-_]?consent/i,
  /<noscript[^>]*>[^<]*cookie/i,
  /<link[^>]*(cookieconsent|cookiebot|onetrust|usercentrics)[^>]*>/i,
];

/**
 * Erkennt Cookie-Banner via 5 Strategien.
 * Gibt false-positive-sicheres Ergebnis zurück.
 */
export function detectCookieBanner(html: string): CookieBannerResult {
  // Strategie 1: Script-Source-Erkennung (höchste Konfidenz)
  const scriptTags = html.match(/<script[^>]*src\s*=\s*["'][^"']*["'][^>]*>/gi) ?? [];
  const scriptSources = scriptTags.join(' ');

  for (const { pattern, provider } of SCRIPT_SOURCE_PATTERNS) {
    if (pattern.test(scriptSources)) {
      return {
        detected: true,
        provider,
        detectionMethod: 'script-source',
        confidence: 'high',
        details: `${provider} Script erkannt`,
      };
    }
  }

  // Strategie 1.5: Gesamtes HTML auf CMP-Domain-Referenzen prüfen
  // Fängt auch <link rel="preload">, data-src, inline JS-Erzeugung, noscript auf
  for (const { pattern, provider } of SCRIPT_SOURCE_PATTERNS) {
    if (pattern.test(html)) {
      return {
        detected: true,
        provider,
        detectionMethod: 'script-source',
        confidence: 'high',
        details: `${provider} Referenz im HTML erkannt`,
      };
    }
  }

  // Strategie 2: Inline-Script-Erkennung (hohe Konfidenz)
  const inlineScripts = (html.match(/<script(?![^>]*src)[^>]*>([\s\S]*?)<\/script>/gi) ?? []).join(' ');

  for (const pattern of INLINE_SCRIPT_PATTERNS) {
    const match = inlineScripts.match(pattern);
    if (match) {
      // Provider aus dem Match ableiten
      const matchedText = match[0];
      const knownProvider = resolveInlineProvider(matchedText);
      return {
        detected: true,
        provider: knownProvider ?? 'Eigenentwicklung',
        detectionMethod: 'inline-script',
        confidence: 'medium',
        details: `Cookie-Banner-Initialisierung im Inline-Script gefunden`,
      };
    }
  }

  // Strategie 3: HTML-Element-Erkennung (mittlere Konfidenz)
  for (const pattern of ELEMENT_ID_PATTERNS) {
    if (pattern.test(html)) {
      return {
        detected: true,
        provider: 'Eigenentwicklung',
        detectionMethod: 'html-element',
        confidence: 'medium',
        details: `Cookie-Banner-Element (ID/Class) im HTML gefunden`,
      };
    }
  }

  // Strategie 4: Meta-Tag / Noscript-Erkennung (mittlere Konfidenz)
  for (const pattern of META_PATTERNS) {
    if (pattern.test(html)) {
      return {
        detected: true,
        provider: null,
        detectionMethod: 'meta-tag',
        confidence: 'medium',
        details: `Cookie-Consent-Link oder Meta-Tag gefunden`,
      };
    }
  }

  // Strategie 5: Text-Content-Fallback (nur niedrige Konfidenz)
  // Nur auslösen wenn Cookie-Text UND Akzeptieren-Button vorhanden
  const htmlLow = html.toLowerCase();
  const hasCookieText =
    /diese website (verwendet|nutzt|benutzt) cookies/i.test(html) ||
    /die (website|seite|app) (verwendet|nutzt|benutzt|setzt) cookies/i.test(html) ||
    /wir (verwenden|nutzen|benutzen|setzen) cookies/i.test(html) ||
    /this (website|site|app) uses cookies/i.test(html) ||
    /we use cookies/i.test(html) ||
    /nous utilisons des cookies/i.test(html) ||
    /utilizziamo i cookie/i.test(html) ||
    /cookie[-\s]?(einstellungen|settings|preferences|richtlinien|policy)/i.test(html) ||
    /verwendung von cookies/i.test(html) ||
    /nutzung von cookies/i.test(html) ||
    /cookies? (akzeptieren|ablehnen|einschr[äa]nken|verwalten|zustimmen)/i.test(html);

  const hasAcceptButton =
    />(akzeptieren|alle akzeptieren|accept all|accept|accepter|accettare|einverstanden|zustimmen|verstanden|got it|i agree|alle annehmen|ok|okay|schliessen|close|dismiss)<\//i.test(html) ||
    // Generische OK-Buttons neben Cookie-Sektionen (z.B. id="cleanCookieDisclaimer")
    /id=["'][^"']*cookie[^"']*["']/i.test(html) && />\s*ok\s*</i.test(html);

  if (hasCookieText && hasAcceptButton) {
    return {
      detected: true,
      provider: 'Eigenentwicklung',
      detectionMethod: 'text-fallback',
      confidence: 'low',
      details: 'Cookie-Text und Akzeptieren-Button im HTML gefunden',
    };
  }

  // Kein Cookie-Banner erkannt
  return {
    detected: false,
    provider: null,
    detectionMethod: 'none',
    confidence: 'high',
    details: 'Kein Cookie-Banner erkannt',
  };
}

/** Leitet aus Inline-Script-Text einen Provider-Namen ab */
function resolveInlineProvider(text: string): string | null {
  const t = text.toLowerCase();
  if (t.includes('cookiebot') || t.includes('cybotcookiebot')) return 'CookieBot (Usercentrics)';
  if (t.includes('onetrust') || t.includes('optanon')) return 'OneTrust';
  if (t.includes('osano')) return 'Osano';
  if (t.includes('tarteaucitron')) return 'tarteaucitron.js';
  if (t.includes('klaro')) return 'Klaro';
  if (t.includes('didomi')) return 'Didomi';
  if (t.includes('axeptio')) return 'Axeptio';
  if (t.includes('usercentrics') || t.includes('uc_ui')) return 'Usercentrics';
  if (t.includes('cookiefirst')) return 'CookieFirst';
  if (t.includes('borlabs')) return 'Borlabs Cookie (WordPress)';
  if (t.includes('complianz') || t.includes('cmplz')) return 'Complianz (WordPress)';
  if (t.includes('cookieyes')) return 'CookieYes';
  return null;
}
