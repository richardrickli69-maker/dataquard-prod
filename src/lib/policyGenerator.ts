/**
 * Dataquard – Policy Generator (Server-seitig)
 * Version 2.2 – März 2026
 *
 * Hybrid-Ansatz:
 *   Bekannte Dienste   → feste Textbausteine aus modules.ts
 *   Unbekannte Dienste → Claude API generiert on-demand (Professional/Enterprise)
 *   Branchenspezifisch → Claude ergänzt Zusatzabschnitt (Professional/Enterprise)
 */

import {
  type CompanyData,
  type ActiveModules,
  deriveModules,
  generatePrivacyPolicy,
  generateImpressum,
} from './modules';
import { type ScannerResult, type DetectedService } from './scanner';

// ---------------------------------------------------------------------------
// BEKANNTE DIENSTE – feste Textbausteine in modules.ts
// Alles NICHT in dieser Liste → Claude API on-demand
// ---------------------------------------------------------------------------

const KNOWN_SERVICE_NAMES = new Set([
  'Google Analytics', 'Google Tag Manager', 'Hotjar', 'Matomo / Piwik',
  'Meta Pixel', 'Google Ads', 'LinkedIn Insight Tag',
  'YouTube', 'Vimeo', 'Google Maps',
  'Google Fonts', 'Adobe Fonts',
  'Mailchimp', 'HubSpot', 'Calendly',
  'Stripe', 'PayPal', 'WooCommerce', 'Shopify',
  'Google reCAPTCHA', 'Cloudflare',
]);

// ---------------------------------------------------------------------------
// TYPEN
// ---------------------------------------------------------------------------

export interface Step1Data {
  firmenname: string;
  strasse: string;
  hausnummer: string;
  plz: string;
  ort: string;
  email: string;
  telefon?: string;
  websiteUrl: string;
  rechtsform: 'GmbH' | 'AG' | 'Einzelunternehmen' | 'Verein' | 'Sonstige';
  uidNummer?: string;
  vertretung?: string;
  language: 'de' | 'fr' | 'it' | 'en';
  // Plan bestimmt ob Custom Passagen verfügbar sind
  plan?: 'free' | 'starter' | 'professional' | 'enterprise';
}

export interface Step2Data {
  hasShop: boolean;
  paymentMethods: ('stripe' | 'paypal' | 'twint' | 'rechnung' | 'kreditkarte')[];
  hasContactForm: boolean;
  hasNewsletter: boolean;
  hasLoginArea: boolean;
  hasAppointmentBooking: boolean;
  hasJobListings: boolean;
  recruitingPlatforms: boolean;
  hasTalentPool: boolean;
  hasEmployeeData: boolean;
  // Optional: Branche fuer Premium-Ergaenzung
  branche?: string; // z.B. 'Arztpraxis', 'Treuhänder', 'Immobilien'
}

export type Step3Data = ScannerResult;

export interface PolicyGeneratorInput {
  step1: Step1Data;
  step2: Step2Data;
  step3: Step3Data;
  /** Optional: Ergebnis der KI-Inhaltsanalyse (visualAiService) */
  aiAudit?: { requiresDisclosure: boolean; deepfakeRisk: string; summary: string };
}

/** KI-generierte individuelle Passage */
export interface CustomPassage {
  serviceName: string;
  category: string;
  country: string;
  content: string;
  generatedByAI: true;
  needsReview: boolean; // immer true – zur Pruefung empfehlen
}

export interface GeneratedDocuments {
  id: string;
  privacyPolicy: string;
  impressum: string;
  cookieBannerText?: string;
  consentFormText?: string;
  hrConsentText?: string;
  activeModules: ActiveModules;
  detectedServices: string[];
  // NEU v2.2
  customPassages: CustomPassage[];          // KI-generierte Passagen
  unknownServicesSkipped: string[];         // uebersprungen weil kein Premium-Plan
  language: string;
  generatedAt: string;
  format: 'markdown';
  disclaimer: string;
}

// ---------------------------------------------------------------------------
// CLAUDE API – PASSAGE FUER UNBEKANNTEN DIENST
// ---------------------------------------------------------------------------

/**
 * Generiert einen nDSG/DSGVO-konformen Textbaustein fuer einen
 * unbekannten Dienst on-demand via Claude API.
 *
 * Nur aufgerufen wenn:
 *   1. Dienst NICHT in KNOWN_SERVICE_NAMES
 *   2. plan = 'professional' | 'enterprise'
 *   3. ANTHROPIC_API_KEY in .env.local gesetzt
 */
export async function generateCustomPassage(
  service: DetectedService,
  companyName: string,
  language: 'de' | 'fr' | 'it' | 'en' = 'de'
): Promise<CustomPassage | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.warn('[Dataquard] ANTHROPIC_API_KEY fehlt – Custom Passage übersprungen');
    return null;
  }

  const langName: Record<string, string> = {
    de: 'Deutsch', fr: 'Französisch', it: 'Italienisch', en: 'Englisch',
  };

  const prompt = `Du bist ein Schweizer Datenschutzexperte. Schreibe einen präzisen Datenschutz-Textbaustein auf ${langName[language]} für folgenden Dienst:

Dienst: ${service.name}
Kategorie: ${service.category}
Land/Serverstandort: ${service.country}
Unternehmen: ${companyName}

Anforderungen:
- Konform mit nDSG und DSGVO
- Maximal 120 Wörter
- Was der Dienst tut, welche Daten erhoben werden, ob Daten ins Ausland gehen
- Falls USA: Standardvertragsklauseln erwähnen
- Sachlich, klar, professionell
- Kein Heading – nur Fliesstext
- Beginne mit "Wir nutzen..." oder "Wir verwenden..."

Antworte NUR mit dem Textbaustein.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 300,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      console.error('[Dataquard] Claude API Fehler:', response.status);
      return null;
    }

    const data = await response.json();
    const content: string = data.content?.[0]?.text?.trim();
    if (!content) return null;

    console.log(`[Dataquard] Custom Passage generiert: ${service.name}`);

    return {
      serviceName:   service.name,
      category:      service.category,
      country:       service.country,
      content,
      generatedByAI: true,
      needsReview:   true,
    };
  } catch (error) {
    console.error('[Dataquard] generateCustomPassage Fehler:', error);
    return null;
  }
}

// ---------------------------------------------------------------------------
// CLAUDE API – BRANCHENSPEZIFISCHE ERGAENZUNG (Premium)
// ---------------------------------------------------------------------------

export async function generateBranchenErgaenzung(
  branche: string,
  companyData: CompanyData,
  language: 'de' | 'fr' | 'it' | 'en' = 'de'
): Promise<CustomPassage | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;

  const langName: Record<string, string> = {
    de: 'Deutsch', fr: 'Französisch', it: 'Italienisch', en: 'Englisch',
  };

  const prompt = `Du bist ein Schweizer Datenschutzexperte. Schreibe einen branchenspezifischen Datenschutz-Ergänzungsabschnitt auf ${langName[language]}.

Branche: ${branche}
Unternehmen: ${companyData.firmenname}, ${companyData.ort}, Schweiz

Anforderungen:
- Konform mit nDSG und DSGVO
- 80–150 Wörter
- Typische Datenbearbeitungen dieser Branche
- Rechtsgrundlage erwähnen
- Sachlich und präzise, kein Heading
- Beginne mit "Als ${branche} bearbeiten wir zusätzlich..."

Antworte NUR mit dem Textbaustein.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 400,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) return null;

    const data = await response.json();
    const content: string = data.content?.[0]?.text?.trim();
    if (!content) return null;

    return {
      serviceName:   `Branchenspezifisch: ${branche}`,
      category:      'Branchenergänzung',
      country:       'CH',
      content,
      generatedByAI: true,
      needsReview:   true,
    };
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// HILFSFUNKTIONEN
// ---------------------------------------------------------------------------

function generateCookieBannerText(): string {
  return 'Wir verwenden Cookies. Einige sind technisch notwendig, andere helfen uns diese Website zu verbessern.\n\n**Alles akzeptieren** | **Nur notwendige** | **Einstellungen**';
}

function generateConsentFormText(): string {
  return 'Ich habe die Datenschutzerklärung gelesen und stimme der Verarbeitung meiner Angaben zu. Einwilligung jederzeit widerrufbar.';
}

function generateHrConsentText(hasTalentPool: boolean): string {
  let text = 'Ihre Bewerbungsunterlagen werden ausschliesslich für das Bewerbungsverfahren verwendet. Löschung nach 3 Monaten.';
  if (hasTalentPool) {
    text += '\n\n**Talent-Pool:** Einverstanden mit 12-monatiger Aufbewahrung. Einwilligung widerrufbar.';
  }
  return text;
}

function mapStep2ToModules(step2: Step2Data): Partial<ActiveModules> {
  const mods: Partial<ActiveModules> = {};
  if (step2.hasContactForm)        mods.W3  = true;
  if (step2.hasNewsletter)         mods.W4  = true;
  if (step2.hasShop)               mods.W5  = true;
  if (step2.hasLoginArea)          mods.W6  = true;
  if (step2.hasAppointmentBooking) mods.W8  = true;
  if (step2.hasJobListings)        { mods.HR1 = true; mods.HR2 = true; }
  if (step2.recruitingPlatforms)   mods.HR3 = true;
  if (step2.hasTalentPool)         mods.HR4 = true;
  if (step2.hasEmployeeData)       mods.HR5 = true;
  if (step2.paymentMethods.includes('stripe'))  mods.Z1 = true;
  if (step2.paymentMethods.includes('paypal'))  mods.Z2 = true;
  if (step2.paymentMethods.includes('twint'))   mods.Z3 = true;
  return mods;
}

function appendCustomPassages(policy: string, passages: CustomPassage[]): string {
  if (passages.length === 0) return policy;
  const notice =
    '\n\n---\n> ⚠️ **Hinweis:** Die folgenden Abschnitte wurden automatisch von einer KI generiert ' +
    'und sollten vor Veröffentlichung geprüft werden.\n\n';
  const text = passages
    .map(p => `## ${p.serviceName}\n*(${p.category} · ${p.country} · KI-generiert)*\n\n${p.content}`)
    .join('\n\n');
  return policy + notice + text;
}

// ---------------------------------------------------------------------------
// HAUPT-FUNKTION
// ---------------------------------------------------------------------------

/** EU AI Act Art. 50 Klausel – automatisch eingefügt wenn KI-Inhalte erkannt */
function generateAiActClause(lang: string, deepfakeRisk: string): string {
  const riskLabel = deepfakeRisk === 'high' ? 'erhöhtes' : deepfakeRisk === 'medium' ? 'mittleres' : 'geringes';
  if (lang === 'de') {
    return `
## Einsatz von KI und Deepfake-Analyse (Art. 50 EU AI Act)

Diese Website verwendet und/oder stellt KI-generierte Inhalte bereit. Gemäss **Art. 50 des EU AI Act** (Transparenzpflichten für bestimmte KI-Systeme) informieren wir Sie hiermit:

**Erkanntes Risiko:** ${riskLabel}

**Was wird analysiert?**
Beim Aufruf dieser Website werden Metadaten und öffentlich zugängliche Inhaltssignale flüchtig analysiert, um KI-generierte oder synthetische Medieninhalte (Text, Bild, Audio, Video) zu erkennen. Diese Analyse erfolgt ausschliesslich im Arbeitsspeicher – es werden **keine Inhalte gespeichert**.

**Ihre Rechte:**
- Auskunftsrecht über den Einsatz von KI-Systemen (Art. 22 DSGVO / Art. 25 nDSG)
- Widerspruchsrecht gegen automatisierte Einzelentscheidungen

**Technische Grundlage:** C2PA Content Credentials, XMP-Metadaten, Heuristische Musteranalyse

Verantwortlich für den Einsatz dieser Analysefunktion ist der Betreiber dieser Website.`;
  }
  return `
## Use of AI and Deepfake Analysis (Art. 50 EU AI Act)

This website uses and/or provides AI-generated content. In accordance with **Art. 50 of the EU AI Act** (transparency obligations for certain AI systems), we inform you that content may be AI-generated or synthetic. Analysis is performed transiently in RAM – no content is stored.`;
}

export async function generateDocuments(
  input: PolicyGeneratorInput
): Promise<GeneratedDocuments> {
  const { step1, step2, step3, aiAudit } = input;

  // Professional/Enterprise = Custom Passagen verfuegbar
  const isPremium = step1.plan === 'professional' || step1.plan === 'enterprise';

  const companyData: CompanyData = {
    firmenname:  step1.firmenname,
    strasse:     step1.strasse,
    hausnummer:  step1.hausnummer,
    plz:         step1.plz,
    ort:         step1.ort,
    email:       step1.email,
    telefon:     step1.telefon,
    websiteUrl:  step1.websiteUrl,
    rechtsform:  step1.rechtsform,
    uidNummer:   step1.uidNummer,
    vertretung:  step1.vertretung,
    hosterName:  step3.hosting.name,
    hosterOrt:   step3.hosting.name !== 'Unbekannt' ? step3.hosting.name : undefined,
  };

  // Module ableiten (statisch)
  const activeModules = deriveModules(
    step3.suggestedModules,
    mapStep2ToModules(step2)
  );

  // SCHRITT A: Statische Textbausteine (alle Pläne)
  let privacyPolicy = generatePrivacyPolicy(
    companyData,
    activeModules,
    step3.hosting.serverLocation
  );
  const impressum = generateImpressum(companyData);

  const customPassages: CustomPassage[] = [];
  const unknownServicesSkipped: string[] = [];

  // SCHRITT B: Unbekannte Dienste via Claude API (nur Premium)
  const unknownServices = step3.detectedServices.filter(
    s => !KNOWN_SERVICE_NAMES.has(s.name)
  );

  if (unknownServices.length > 0) {
    if (isPremium) {
      console.log(`[Dataquard] ${unknownServices.length} unbekannte Dienste → generiere Custom Passagen...`);
      const results = await Promise.allSettled(
        unknownServices.map(s => generateCustomPassage(s, step1.firmenname, step1.language))
      );
      for (const r of results) {
        if (r.status === 'fulfilled' && r.value) customPassages.push(r.value);
      }
      privacyPolicy = appendCustomPassages(privacyPolicy, customPassages);
    } else {
      // Free/Starter: Dienste auflisten, nicht generieren
      unknownServicesSkipped.push(...unknownServices.map(s => s.name));
      console.log(`[Dataquard] Uebersprungen (kein Premium): ${unknownServicesSkipped.join(', ')}`);
    }
  }

  // SCHRITT C: Branchenspezifische Ergaenzung (nur Premium)
  if (isPremium && step2.branche) {
    const bp = await generateBranchenErgaenzung(step2.branche, companyData, step1.language);
    if (bp) {
      customPassages.push(bp);
      privacyPolicy = appendCustomPassages(privacyPolicy, [bp]);
    }
  }

  // SCHRITT D: EU AI Act Art. 50 – automatisch wenn KI-Inhalte erkannt
  if (aiAudit?.requiresDisclosure) {
    const clause = generateAiActClause(step1.language, aiAudit.deepfakeRisk);
    privacyPolicy += clause;
    console.log(`[Dataquard] EU AI Act Art. 50 Klausel eingefügt (Risiko: ${aiAudit.deepfakeRisk})`);
  }

  const hasAiContent = customPassages.length > 0 || (aiAudit?.requiresDisclosure ?? false);

  return {
    id:            `dq_${Date.now()}`,
    privacyPolicy,
    impressum,
    cookieBannerText: activeModules.C5 ? generateCookieBannerText() : undefined,
    consentFormText:  activeModules.W3 ? generateConsentFormText()   : undefined,
    hrConsentText:    (activeModules.HR1 || activeModules.HR2)
      ? generateHrConsentText(activeModules.HR4)
      : undefined,
    activeModules,
    customPassages,
    unknownServicesSkipped,
    detectedServices: step3.detectedServices.map(s => `${s.name} (${s.country})`),
    language:    step1.language,
    generatedAt: new Date().toISOString(),
    format:      'markdown',
    disclaimer: hasAiContent
      ? 'Diese DSE kombiniert anwaltlich validierte Textbausteine mit KI-generierten Passagen für erkannte Drittdienste. ' +
        'KI-Abschnitte sind gekennzeichnet und sollten vor Veröffentlichung geprüft werden.'
      : 'Diese DSE basiert auf anwaltlich validierten Textbausteinen (nDSG/DSGVO-konform). Ersetzt keine Rechtsberatung.',
  };
}

// ---------------------------------------------------------------------------
// MARKDOWN → HTML
// ---------------------------------------------------------------------------

export function markdownToHtml(markdown: string): string {
  return markdown
    .replace(/^### (.*?)$/gm, '<h3>$1</h3>')
    .replace(/^## (.*?)$/gm, '<h2>$1</h2>')
    .replace(/^# (.*?)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/^- (.*?)$/gm, '<li>$1</li>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    .replace(/\n{2,}/g, '</p><p>');
}

// ---------------------------------------------------------------------------
// FAQ
// ---------------------------------------------------------------------------

export const FAQ_CORRECT_ANSWERS = {
  isCompliant: {
    question: 'Ist die generierte Policy wirklich nDSG/DSGVO-konform?',
    answer:
      'Ja. Unsere Datenschutzerklärungen basieren auf über 40 juristisch validierten Textbausteinen ' +
      '(P1–P7, W1–W8, D1–D12, C1–C5, Z1–Z3, HR1–HR5, T1–T2). ' +
      'Für unbekannte Dienste generiert unser System individuelle Passagen, ' +
      'die als KI-generiert gekennzeichnet und zur Prüfung empfohlen werden.',
  },
  customPassages: {
    question: 'Was passiert wenn meine Website einen unbekannten Dienst verwendet?',
    answer:
      'Im Professional- und Enterprise-Plan erkennt unser Scanner unbekannte Dienste ' +
      'und generiert automatisch einen massgeschneiderten Datenschutz-Abschnitt. ' +
      'Im Free- und Starter-Plan werden unbekannte Dienste aufgelistet, ' +
      'damit Sie diese manuell ergänzen können.',
  },
};