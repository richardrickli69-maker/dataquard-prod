/**
 * JS-Rendering-Detektor
 * Erkennt ob eine Website hauptsächlich per JavaScript gerendert wird (SPA).
 * In diesem Fall sind statische HTML-Scans unvollständig.
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
 * Gibt false-positive-sichere Ergebnisse zurück.
 */
export function detectJsRendering(html: string): JsRenderingResult {
  const signals: string[] = [];
  let detectedFramework: string | null = null;

  // Signal 1: Sehr wenig sichtbarer Text
  const textContent = html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  if (textContent.length < 200) {
    signals.push('Minimaler Text-Inhalt im HTML (<200 Zeichen)');
  }

  // Signal 2: Framework-Marker
  for (const { pattern, name } of FRAMEWORK_PATTERNS) {
    if (pattern.test(html)) {
      if (!detectedFramework) detectedFramework = name;
      else if (!detectedFramework.includes(name)) {
        detectedFramework = `${detectedFramework} / ${name}`;
      }
    }
  }
  if (detectedFramework) {
    signals.push(`Framework erkannt: ${detectedFramework}`);
  }

  // Signal 3: Leerer oder minimaler Body (ohne Scripts)
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  if (bodyMatch) {
    const bodyContent = bodyMatch[1];
    const bodyWithoutScripts = bodyContent.replace(/<script[\s\S]*?<\/script>/gi, '').trim();
    const bodyTextLength = bodyWithoutScripts.replace(/<[^>]*>/g, '').trim().length;
    if (bodyTextLength < 100) {
      signals.push('Leerer Body (ohne Script-Tags < 100 Zeichen)');
    }
  }

  // Signal 4: Viele Script-Tags im Verhältnis zum Content
  const scriptCount = (html.match(/<script/gi) ?? []).length;
  if (scriptCount > 5 && textContent.length < 500) {
    signals.push(`Viele Script-Tags (${scriptCount}) bei wenig Text-Inhalt`);
  }

  // Signal 5: Kein sinnvoller <noscript>-Fallback trotz Framework-Marker
  if (detectedFramework) {
    const noscriptMatch = html.match(/<noscript[^>]*>([\s\S]*?)<\/noscript>/i);
    const hasNoscriptContent = noscriptMatch && noscriptMatch[1].replace(/<[^>]*>/g, '').trim().length >= 50;
    if (!hasNoscriptContent) {
      signals.push('Kein <noscript>-Fallback trotz Framework-Marker');
    }
  }

  // Signal 6: Bundle-Dateien (Webpack, Vite, etc.)
  for (const pattern of BUNDLE_PATTERNS) {
    if (pattern.test(html)) {
      signals.push('Bundle-Dateien gefunden (Webpack/Vite)');
      break; // Nur einmal zählen
    }
  }

  // Bewertung
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

  // 1 Signal → nur low confidence, Scan gilt noch als vollständig
  return {
    isLikelyJsRendered: false,
    confidence: 'low',
    signals,
    scanReliability: 'vollständig',
    detectedFramework,
  };
}
