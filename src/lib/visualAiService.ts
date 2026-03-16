/**
 * Dataquard – Visual AI Service
 * Erkennt KI-generierte Inhalte auf Websites via Metadaten-Analyse.
 * EU AI Act Art. 50 – Kennzeichnungspflicht für synthetische Inhalte.
 *
 * Privacy-Garantie: Keine Bildspeicherung – nur flüchtige Metadaten-Analyse.
 */

export interface AiAuditResult {
  /** 0–100: Wahrscheinlichkeit dass KI-generierte Inhalte vorhanden sind */
  realityScore: number;
  /** Gefundene KI-Signale */
  signals: AiSignal[];
  /** Deepfake-Risiko erkannt */
  deepfakeRisk: 'none' | 'low' | 'medium' | 'high';
  /** EU AI Act Art. 50 Kennzeichnung erforderlich */
  requiresDisclosure: boolean;
  /** Zusammenfassung für den Nutzer */
  summary: string;
  /** Verarbeitungshinweis (DSGVO/nDSG) */
  privacyNote: string;
}

export interface AiSignal {
  type: 'c2pa' | 'xmp' | 'meta_generator' | 'ai_attribution' | 'watermark_hint' | 'content_pattern';
  confidence: number;
  detail: string;
}

/** KI-Tools die C2PA/XMP-Signaturen hinterlassen */
const AI_GENERATORS = [
  'dall-e', 'dall·e', 'midjourney', 'stable diffusion', 'firefly', 'adobe firefly',
  'imagen', 'ideogram', 'leonardo', 'runway', 'sora', 'kling', 'pika',
  'canva ai', 'bing image creator', 'gpt-4o', 'claude', 'gemini',
];

/** Meta-Tags die auf KI-Generierung hinweisen */
const AI_META_PATTERNS = [
  /generator.*(?:ai|gpt|claude|gemini|midjourney|dall)/i,
  /(?:ai|artificial.intelligence|machine.learning).*generated/i,
  /created.with.*(?:ai|neural|diffusion)/i,
  /content.*(?:synthetic|ai-assisted|ai-generated)/i,
];

/** Script-Quellen von KI-Plattformen */
const AI_SCRIPT_SOURCES = [
  'openai.com', 'anthropic.com', 'replicate.com', 'huggingface.co',
  'runwayml.com', 'stability.ai', 'midjourney.com',
];

/**
 * Analysiert eine Website auf KI-generierte Inhalte.
 * Verarbeitet nur Metadaten – keine Bildspeicherung.
 */
export async function analyzeForAiContent(url: string): Promise<AiAuditResult> {
  const signals: AiSignal[] = [];

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Dataquard-Compliance-Scanner/2.0 (+https://www.dataquard.ch)',
        'Accept': 'text/html,application/xhtml+xml',
      },
    });
    clearTimeout(timeout);

    if (!response.ok) {
      return buildResult(signals, 'Seite nicht erreichbar – keine KI-Analyse möglich.');
    }

    const html = await response.text();

    // 1. C2PA / XMP Metadaten im HTML-Head
    checkC2paXmp(html, signals);

    // 2. Meta-Generator Tags
    checkMetaGenerators(html, signals);

    // 3. AI-Attribution in Open Graph / Schema.org
    checkAiAttribution(html, signals);

    // 4. Script-Quellen von KI-Plattformen
    checkAiScriptSources(html, signals);

    // 5. Content-Muster (Alt-Text, Bildunterschriften)
    checkContentPatterns(html, signals);

    // 6. Response-Header auf AI-Hints prüfen
    checkResponseHeaders(response.headers, signals);

  } catch {
    // Timeout oder Netzwerkfehler – kein Signal, kein Fehler nach aussen
  }

  return buildResult(signals);
}

function checkC2paXmp(html: string, signals: AiSignal[]) {
  // C2PA manifest hints im HTML
  if (/c2pa|content.credentials|content.authenticity/i.test(html)) {
    signals.push({
      type: 'c2pa',
      confidence: 0.85,
      detail: 'C2PA / Content Credentials Metadaten gefunden',
    });
  }
  // XMP-Daten (oft in SVG oder Inline-Bilddaten eingebettet)
  if (/xmp:creator|xmp:creatortool|photoshop:source/i.test(html)) {
    const toolMatch = html.match(/xmp:creatortool[^>]*>([^<]{1,60})/i);
    const tool = toolMatch?.[1]?.trim() ?? 'unbekannt';
    const isAi = AI_GENERATORS.some(g => tool.toLowerCase().includes(g));
    if (isAi) {
      signals.push({
        type: 'xmp',
        confidence: 0.9,
        detail: `XMP CreatorTool: ${tool}`,
      });
    }
  }
}

function checkMetaGenerators(html: string, signals: AiSignal[]) {
  const metaMatches = html.matchAll(/<meta[^>]+>/gi);
  for (const match of metaMatches) {
    const tag = match[0];
    for (const pattern of AI_META_PATTERNS) {
      if (pattern.test(tag)) {
        signals.push({
          type: 'meta_generator',
          confidence: 0.75,
          detail: `Meta-Tag KI-Hinweis: ${tag.substring(0, 80)}`,
        });
        break;
      }
    }
    // Explizit: <meta name="generator" content="Midjourney" /> etc.
    const generatorContent = tag.match(/name=["']generator["'][^>]*content=["']([^"']{1,80})/i)?.[1]
      ?? tag.match(/content=["']([^"']{1,80})["'][^>]*name=["']generator/i)?.[1];
    if (generatorContent) {
      const lower = generatorContent.toLowerCase();
      const found = AI_GENERATORS.find(g => lower.includes(g));
      if (found) {
        signals.push({
          type: 'meta_generator',
          confidence: 0.95,
          detail: `Generator: ${generatorContent}`,
        });
      }
    }
  }
}

function checkAiAttribution(html: string, signals: AiSignal[]) {
  // Alle JSON-LD Blöcke ZUSAMMEN auswerten — nur EIN Signal pro Seite (kein Duplikat)
  const jsonLdMatches = [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  const allJsonLd = jsonLdMatches.map(m => m[1]).join('\n');

  if (/\bai\b|artificial.intelligence|machine.learning|neural.network|diffusion/i.test(allJsonLd)) {
    // Konfidenz-Stufen: je mehr Deklarations-Felder, desto höher
    const hasAiTool = /"tool"[\s\S]{0,400}Artificial Intelligence/i.test(allJsonLd)
      || /Artificial Intelligence[\s\S]{0,400}"tool"/i.test(allJsonLd);
    const hasAiCreator = /creator[\s\S]{0,400}(?:anthropic|openai|deepmind|stability)/i.test(allJsonLd);
    const hasEuAiAct = /eu ai act|art\. 50|transparenzpflicht/i.test(allJsonLd);
    const hasToolField = /"tool"\s*:/i.test(allJsonLd);

    const richCount = [hasAiTool, hasAiCreator, hasEuAiAct, hasToolField].filter(Boolean).length;

    let confidence = 0.70;
    let detail = 'Schema.org JSON-LD enthält KI-Attributierung';

    if (richCount >= 3) {
      confidence = 0.95;
      detail = 'Schema.org JSON-LD: vollständige KI-Attributierung (tool + creator + EU AI Act)';
    } else if (richCount >= 2) {
      confidence = 0.90;
      detail = 'Schema.org JSON-LD: erweiterte KI-Attributierung (tool/creator erkannt)';
    } else if (richCount >= 1) {
      confidence = 0.80;
      detail = 'Schema.org JSON-LD: KI-Attributierung mit Deklarationsfeld';
    }

    signals.push({ type: 'ai_attribution', confidence, detail });
  }

  // Open Graph / Twitter Cards
  if (/og:description|twitter:description/i.test(html)) {
    const desc = html.match(/content=["'][^"']*(?:KI|AI|künstliche Intelligenz|generated by)[^"']{0,100}/i)?.[0];
    if (desc) {
      signals.push({
        type: 'ai_attribution',
        confidence: 0.65,
        detail: 'OG-Beschreibung: KI-Hinweis erkannt',
      });
    }
  }
}

function checkAiScriptSources(html: string, signals: AiSignal[]) {
  // Nur echte <script src="..."> Tags prüfen — NICHT JSON-LD URLs (verhindert False Positives)
  const scriptSrcs = (html.match(/<script[^>]+src=["'][^"']+["'][^>]*>/gi) ?? []).join(' ').toLowerCase();
  for (const source of AI_SCRIPT_SOURCES) {
    if (scriptSrcs.includes(source)) {
      signals.push({
        type: 'watermark_hint',
        confidence: 0.60,
        detail: `Eingebundene Ressource von KI-Plattform: ${source}`,
      });
    }
  }
}

function checkContentPatterns(html: string, signals: AiSignal[]) {
  // Alt-Texte mit typischen KI-Beschreibungsmustern
  const aiAltPatterns = [
    /alt=["'][^"']*(?:ai.generated|dall-e|midjourney|stable.diffusion)[^"']*["']/i,
    /alt=["'][^"']*(?:created.by.ai|generated.by.ai)[^"']*["']/i,
  ];
  for (const pattern of aiAltPatterns) {
    if (pattern.test(html)) {
      signals.push({
        type: 'content_pattern',
        confidence: 0.8,
        detail: 'Bild-Alt-Text weist auf KI-generiertes Bild hin',
      });
      break;
    }
  }
  // Explizite KI-Inhaltshinweise — nur wenn als Warnung/Hinweis formuliert, nicht als Service-Beschreibung
  // "deepfake" allein reicht nicht (z.B. Anbieter von Deepfake-Erkennung) → zusätzlicher Kontext nötig
  if (/synthetic.media|ai.content.notice|generated.by.artificial/i.test(html) ||
      (/deepfake/i.test(html) && /warnung|achtung|disclosure|notice|gekennzeichnet|hinweis/i.test(html))) {
    signals.push({
      type: 'content_pattern',
      confidence: 0.85,
      detail: 'Expliziter KI-Inhaltshinweis im Seitentext',
    });
  }
}

function checkResponseHeaders(headers: Headers, signals: AiSignal[]) {
  const contentPolicy = headers.get('content-security-policy') ?? '';
  const server = headers.get('x-powered-by') ?? '';
  if (/ai.gateway|openai|anthropic/i.test(contentPolicy + server)) {
    signals.push({
      type: 'watermark_hint',
      confidence: 0.55,
      detail: 'HTTP-Header deutet auf KI-Infrastruktur hin',
    });
  }
}

function buildResult(signals: AiSignal[], fallbackSummary?: string): AiAuditResult {
  if (signals.length === 0) {
    return {
      realityScore: 95,
      signals: [],
      deepfakeRisk: 'none',
      requiresDisclosure: false,
      summary: fallbackSummary ?? 'Keine KI-Inhaltssignale erkannt. Seite erscheint authentisch.',
      privacyNote: 'Nur Metadaten analysiert – keine Bildspeicherung.',
    };
  }

  // Explizite KI-Deklarationen (positiv — Compliance-Nachweis)
  const declarations = signals.filter(s => s.type === 'ai_attribution');
  // Starke Risiko-Signale: eindeutiger Nachweis undeklarierter KI (C2PA-Signatur, XMP-Metadaten)
  const hardRisks = signals.filter(s => s.type === 'c2pa' || s.type === 'xmp');
  // Ambigue Signale (meta_generator, watermark_hint, content_pattern) — weder positiv noch stark negativ

  let realityScore: number;
  let requiresDisclosure: boolean;
  let deepfakeRisk: AiAuditResult['deepfakeRisk'] = 'none';
  const summaryParts: string[] = [];

  if (declarations.length > 0 && hardRisks.length === 0) {
    // Fall 1: KI korrekt deklariert, keine undeklarierten Risiken → hoher Compliance-Score
    // Formel: 50 (Basis) + Deklarationen*15 + AvgKonfidenz*20 → 80–100%
    const avgConf = declarations.reduce((s, sig) => s + sig.confidence, 0) / declarations.length;
    realityScore = Math.min(100, Math.round(50 + declarations.length * 15 + avgConf * 20));
    requiresDisclosure = false;
    summaryParts.push(`KI-Nutzung korrekt deklariert — ${declarations.length} Deklarations-Signal(e) erkannt.`);
    summaryParts.push('EU AI Act Art. 50: Anforderungen erfüllt.');

  } else if (declarations.length > 0 && hardRisks.length > 0) {
    // Fall 2: Deklaration vorhanden, aber auch eindeutige Risiken → mittlerer Score
    const avgDeclConf = declarations.reduce((s, sig) => s + sig.confidence, 0) / declarations.length;
    realityScore = Math.min(100, Math.round(50 + declarations.length * 10 + avgDeclConf * 10 - hardRisks.length * 10));
    requiresDisclosure = true;
    const maxConf = Math.max(...signals.map(s => s.confidence));
    summaryParts.push(`KI-Deklaration vorhanden, aber ${hardRisks.length} undeklariertes Signal(e) erkannt.`);
    summaryParts.push(`EU AI Act Art. 50: Deklaration prüfen (Konfidenz: ${Math.round(maxConf * 100)}%).`);
    if (maxConf >= 0.85) deepfakeRisk = 'medium';
    else if (maxConf >= 0.70) deepfakeRisk = 'low';

  } else {
    // Fall 3: Keine Deklaration — KI-Signale ohne Ausweisung → Score sinkt
    // Formel: 50 (Basis) − Risiken*20 − AvgKonfidenz*20 → 0–49%
    const allRisk = [...hardRisks, ...signals.filter(s => s.type !== 'ai_attribution')];
    const maxConf = allRisk.length > 0 ? Math.max(...allRisk.map(s => s.confidence)) : 0;
    const avgConf = allRisk.length > 0
      ? allRisk.reduce((s, sig) => s + sig.confidence, 0) / allRisk.length
      : 0;
    realityScore = Math.max(0, Math.round(50 - allRisk.length * 15 - avgConf * 20));
    requiresDisclosure = maxConf >= 0.65;

    if (maxConf >= 0.85) deepfakeRisk = 'high';
    else if (maxConf >= 0.70) deepfakeRisk = 'medium';
    else if (maxConf >= 0.55) deepfakeRisk = 'low';

    if (requiresDisclosure) {
      summaryParts.push(`${signals.length} KI-Signal(e) erkannt (Konfidenz: ${Math.round(maxConf * 100)}%).`);
      summaryParts.push('EU AI Act Art. 50: Kennzeichnung empfohlen.');
    } else {
      summaryParts.push(`Schwache KI-Signale (${signals.length}x) – kein zwingender Handlungsbedarf.`);
    }
  }

  return {
    realityScore,
    signals,
    deepfakeRisk,
    requiresDisclosure,
    summary: summaryParts.join(' '),
    privacyNote: 'Flüchtige Metadaten-Analyse im RAM – keine Bild- oder Inhaltsspeicherung (DSGVO/nDSG-konform).',
  };
}
