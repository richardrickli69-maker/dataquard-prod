/**
 * JS-Rendering-Detektor
 * Erkennt ob eine Website hauptsächlich per JavaScript gerendert wird (SPA).
 * In diesem Fall sind statische HTML-Scans unvollständig.
 *
 * Wichtige Unterscheidung:
 * - SSR (Next.js, Nuxt mit SSR): Framework-Marker UND viel Content → KEIN Warning
 * - CSR (React SPA, Vue SPA):    Framework-Marker UND wenig Content → Warning
 * - Klassisch:                   Kein Framework-Marker, viel Content → KEIN Warning
 */

export interface JsRenderingResult {
  /** true = Seite wird wahrscheinlich per JS gerendert */
  isLikelyJsRendered: boolean;
  /** Konfidenz der Erkennung */
  confidence: 'high' | 'medium' | 'low';
  /** Gefundene Signale */
  signals: string[];
  /** Zuverlässigkeit des Scans */
  scanReliability: 'vollständig' | 'eingeschränkt' | 'stark eingeschränkt';
  /** Erkanntes Framework, z.B. "Next.js / React" */
  detectedFramework: string | null;
}

/** Framework-Pattern → Framework-Name */
const FRAMEWORK_PATTERNS: Array<{ pattern: RegExp; name: string }> = [
  // Next.js (erkenne zuerst, weil es auch React enthält)
  { pattern: /__NEXT_DATA__/i, name: 'Next.js' },
  { pattern: /_next\/static/i, name: 'Next.js' },
  { pattern: /<div id="__next"/i, name: 'Next.js' },

  // Nuxt (vor Vue, da spezifischer)
  { pattern: /<div id="__nuxt"/i, name: 'Nuxt.js' },
  { pattern: /__NUXT__/i, name: 'Nuxt.js' },

  // React (generisch)
  { pattern: /<div id="root"\s*>/i, name: 'React' },
  { pattern: /<div id="app"\s*>/i, name: 'React/Vue' },
  { pattern: /react[-.]dom/i, name: 'React' },

  // Vue
  { pattern: /vue[-.]min\.js/i, name: 'Vue.js' },
  { pattern: /Vue\.createApp/i, name: 'Vue.js' },

  // Angular
  { pattern: /<app-root/i, name: 'Angular' },
  { pattern: /ng-version/i, name: 'Angular' },

  // Svelte / SvelteKit
  { pattern: /__sveltekit/i, name: 'SvelteKit' },
  { pattern: /\/svelte\//i, name: 'Svelte' },

  // Gatsby
  { pattern: /___gatsby/i, name: 'Gatsby' },

  // Remix
  { pattern: /__remix/i, name: 'Remix' },

  // Generischer App-State (kein spezifisches Framework)
  { pattern: /window\.__INITIAL_STATE__/i, name: 'SPA (unbekannt)' },
  { pattern: /window\.__APP_STATE__/i, name: 'SPA (unbekannt)' },
];

/** Bundle-File-Pattern (Webpack, Vite, etc.) */
const BUNDLE_PATTERNS: RegExp[] = [
  /chunk[-.][\da-f]{6,}\.js/i,
  /bundle\.min\.js/i,
  /vendor[-.][\da-f]{6,}\.js/i,
  /main[-.][\da-f]{6,}\.js/i,
  /app[-.][\da-f]{6,}\.js/i,
  /_buildManifest\.js/i,
  /webpack[-.]runtime/i,
  /vite\/client/i,
];

/**
 * Analysiert HTML auf JS-Rendering-Signale.
 * Content-Menge ist der stärkste Override: SSR-Sites haben immer viel Content.
 */
export function detectJsRendering(html: string): JsRenderingResult {
  // Schritt 1: Sichtbaren Text-Content messen (Scripts und Styles zuerst entfernen)
  const htmlWithoutCode = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '');

  const textContent = htmlWithoutCode
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  const contentLength = textContent.length;

  // Schritt 2: Strukturelle HTML-Elemente zählen (Indikator für echten Seiteninhalt)
  const paragraphs = (htmlWithoutCode.match(/<p[\s>]/gi) ?? []).length;
  const headings = (htmlWithoutCode.match(/<h[1-6][\s>]/gi) ?? []).length;
  const links = (htmlWithoutCode.match(/<a[\s]/gi) ?? []).length;
  const images = (htmlWithoutCode.match(/<img[\s]/gi) ?? []).length;
  const lists = (htmlWithoutCode.match(/<(ul|ol)[\s>]/gi) ?? []).length;
  const sections = (htmlWithoutCode.match(/<(section|article|main|header|footer|nav)[\s>]/gi) ?? []).length;
  const totalMeaningfulElements = paragraphs + headings + links + images + lists + sections;

  // Schritt 3: Content-Override — SSR-Sites haben immer genug sichtbaren Content
  // Unabhängig von Framework-Markern: viel Content = zuverlässiger Scan
  const hasSubstantialContent = contentLength > 1000 && totalMeaningfulElements > 10;
  const hasModerateContent = contentLength > 500 && totalMeaningfulElements > 5;

  if (hasSubstantialContent) {
    // Viel Content → SSR oder klassische Site, kein Warning nötig
    return {
      isLikelyJsRendered: false,
      confidence: 'high',
      signals: [],
      scanReliability: 'vollständig',
      detectedFramework: null,
    };
  }

  // Schritt 4: Signale sammeln (nur relevant wenn wenig Content)
  const signals: string[] = [];
  let detectedFramework: string | null = null;

  // Signal 1: Sehr wenig sichtbarer Text nach Script-Entfernung
  if (contentLength < 200) {
    signals.push('Minimaler Text-Inhalt im HTML (<200 Zeichen)');
  }

  // Signal 2: Framework-Marker erkennen
  for (const { pattern, name } of FRAMEWORK_PATTERNS) {
    if (pattern.test(html)) {
      if (!detectedFramework) {
        detectedFramework = name;
      } else if (!detectedFramework.includes(name)) {
        detectedFramework = `${detectedFramework} / ${name}`;
      }
    }
  }
  if (detectedFramework) {
    signals.push(`Framework erkannt: ${detectedFramework}`);
  }

  // Signal 3: Leerer oder minimaler Body (ohne Scripts und Styles)
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  if (bodyMatch) {
    const bodyWithoutCode = bodyMatch[1]
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .trim();
    const bodyTextLength = bodyWithoutCode.replace(/<[^>]*>/g, '').trim().length;
    if (bodyTextLength < 100) {
      signals.push('Leerer Body (ohne Script-Tags < 100 Zeichen)');
    }
  }

  // Signal 4: Viele Script-Tags im Verhältnis zum Content
  const scriptCount = (html.match(/<script/gi) ?? []).length;
  if (scriptCount > 5 && contentLength < 300) {
    signals.push(`Viele Script-Tags (${scriptCount}) bei sehr wenig Text-Inhalt`);
  }

  // Signal 5: Bundle-Dateien – nur relevant wenn kein moderater Content vorhanden
  // (SSR-Sites haben auch Bundle-Dateien, daher nur bei wenig Content als Signal werten)
  if (!hasModerateContent) {
    for (const pattern of BUNDLE_PATTERNS) {
      if (pattern.test(html)) {
        signals.push('Bundle-Dateien gefunden (Webpack/Vite)');
        break; // Nur einmal zählen
      }
    }
  }

  // Schritt 5: Moderater Content als schwächerer Override
  // Mittel-Content + wenige Signale → kein Warning
  if (hasModerateContent && signals.length <= 2) {
    return {
      isLikelyJsRendered: false,
      confidence: 'low',
      signals: [],
      scanReliability: 'vollständig',
      detectedFramework: null,
    };
  }

  // Schritt 6: Bewertung nach Signal-Anzahl
  const signalCount = signals.length;

  if (signalCount === 0) {
    return {
      isLikelyJsRendered: false,
      confidence: 'high',
      signals: [],
      scanReliability: 'vollständig',
      detectedFramework: null,
    };
  }

  if (signalCount >= 4) {
    return {
      isLikelyJsRendered: true,
      confidence: 'high',
      signals,
      scanReliability: 'stark eingeschränkt',
      detectedFramework,
    };
  }

  if (signalCount >= 2) {
    return {
      isLikelyJsRendered: true,
      confidence: 'medium',
      signals,
      scanReliability: 'eingeschränkt',
      detectedFramework,
    };
  }

  // 1 Signal → kein Warning, Scan gilt als vollständig
  return {
    isLikelyJsRendered: false,
    confidence: 'low',
    signals,
    scanReliability: 'vollständig',
    detectedFramework,
  };
}
