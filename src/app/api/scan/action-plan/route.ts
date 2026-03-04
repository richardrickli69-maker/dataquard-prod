/**
 * Dataquard – KI-Massnahmenplan
 * POST /api/scan/action-plan
 * Gibt 3 priorisierte Massnahmen + Compliance-Score zurück
 */
import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export interface ActionItem {
  urgency: 'sofort' | 'diese Woche' | 'dieser Monat';
  title: string;
  description: string;
  link?: string;
}

export interface ActionPlanResponse {
  actions: ActionItem[];
  complianceScore: number;
}

function buildFallback(scanResult: any): ActionPlanResponse {
  const score = Math.round(
    (scanResult.compliance?.score ?? 50) * 0.5 +
    (scanResult.trust?.score ?? 50) * 0.3 +
    (scanResult.optimization?.score ?? 50) * 0.2
  );

  const actions: ActionItem[] = [];

  if (!scanResult.compliance?.hasPrivacyPolicy) {
    actions.push({
      urgency: 'sofort',
      title: 'Datenschutzerklärung erstellen',
      description: 'Ihre Website hat keine Datenschutzerklärung – Pflicht nach nDSG/DSGVO.',
      link: '/datenschutz-generator',
    });
  }
  if (!scanResult.trust?.hasImpressum) {
    actions.push({
      urgency: 'sofort',
      title: 'Impressum hinzufügen',
      description: 'Kein Impressum gefunden – gesetzlich vorgeschrieben für gewerbliche Websites.',
      link: '/impressum-generator',
    });
  }
  if (!scanResult.compliance?.hasCookieBanner) {
    actions.push({
      urgency: 'diese Woche',
      title: 'Cookie-Banner implementieren',
      description: 'Tracker ohne Einwilligung verstoßen gegen nDSG/DSGVO.',
    });
  }
  if (scanResult.optimization?.trackerCount > 5) {
    actions.push({
      urgency: 'dieser Monat',
      title: 'Tracker reduzieren',
      description: `${scanResult.optimization.trackerCount} Tracker erkannt – zu viele verlangsamen die Website und erhöhen das Datenschutzrisiko.`,
    });
  }

  // Mindestens 3 Massnahmen sicherstellen
  const defaults: ActionItem[] = [
    { urgency: 'sofort', title: 'Datenschutzerklärung prüfen', description: 'Prüfen Sie ob Ihre Datenschutzerklärung alle aktuellen nDSG-Anforderungen erfüllt.', link: '/datenschutz-generator' },
    { urgency: 'diese Woche', title: 'SSL-Zertifikat kontrollieren', description: 'Stellen Sie sicher dass Ihr SSL-Zertifikat gültig und korrekt konfiguriert ist.' },
    { urgency: 'dieser Monat', title: 'Regelmässige Compliance-Scans', description: 'Führen Sie monatliche Scans durch um Compliance-Probleme frühzeitig zu erkennen.', link: '/scanner' },
  ];

  while (actions.length < 3) {
    const next = defaults[actions.length];
    if (next) actions.push(next);
    else break;
  }

  return { actions: actions.slice(0, 3), complianceScore: Math.max(0, Math.min(100, score)) };
}

export async function POST(request: NextRequest) {
  try {
    const { scanResult, url } = await request.json();
    if (!scanResult) {
      return NextResponse.json({ error: 'scanResult erforderlich' }, { status: 400 });
    }

    const prompt = `Du bist ein Datenschutz-Experte für Schweizer KMUs (nDSG/DSGVO).

Analysiere diesen Website-Scan und erstelle GENAU 3 priorisierte Massnahmen auf Deutsch.

Scan-Daten für ${url ?? 'unbekannte Domain'}:
- Compliance-Score: ${scanResult.compliance?.score ?? 'N/A'}%
- Datenschutzerklärung: ${scanResult.compliance?.hasPrivacyPolicy ? 'vorhanden' : 'FEHLT'}
- Cookie-Banner: ${scanResult.compliance?.hasCookieBanner ? 'vorhanden' : 'FEHLT'}
- Tracker: ${scanResult.optimization?.trackerCount ?? 0} gefunden (${(scanResult.compliance?.trackersFound ?? []).join(', ') || 'keine'})
- SSL: ${scanResult.trust?.hasSSL ? 'aktiv' : 'FEHLT'}
- Impressum: ${scanResult.trust?.hasImpressum ? 'vorhanden' : 'FEHLT'}
- Rechtsgebiet: ${scanResult.compliance?.jurisdiction ?? 'nDSG'}
- Ladezeit: ${scanResult.optimization?.loadTime?.toFixed(1) ?? 'N/A'}s
- Bestehende Empfehlungen: ${(scanResult.recommendations ?? []).slice(0, 3).join('; ')}

Antworte NUR mit validem JSON in diesem Format (kein Markdown, keine Erklärungen):
{
  "actions": [
    {"urgency": "sofort", "title": "...", "description": "...", "link": "/datenschutz-generator"},
    {"urgency": "diese Woche", "title": "...", "description": "..."},
    {"urgency": "dieser Monat", "title": "...", "description": "..."}
  ],
  "complianceScore": 42
}

Regeln:
- urgency muss exakt "sofort", "diese Woche" oder "dieser Monat" sein
- complianceScore: Gesamtwert 0-100 basierend auf allen Faktoren
- link nur bei: /datenschutz-generator, /impressum-generator, /scanner, /checkout
- Massnahmen spezifisch für diese Website, nicht generisch
- Sprache: Schweizer Deutsch (keine DSGVO-Anglizismen)`;

    try {
      const message = await anthropic.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 512,
        messages: [{ role: 'user', content: prompt }],
      });

      const text = message.content[0].type === 'text' ? message.content[0].text : '';
      const parsed: ActionPlanResponse = JSON.parse(text.trim());

      // Validierung
      if (!Array.isArray(parsed.actions) || parsed.actions.length !== 3 || typeof parsed.complianceScore !== 'number') {
        throw new Error('Invalid response structure');
      }

      return NextResponse.json(parsed);
    } catch {
      // Fallback wenn Claude-Aufruf oder JSON-Parsing fehlschlägt
      return NextResponse.json(buildFallback(scanResult));
    }
  } catch (error) {
    return NextResponse.json({ error: 'Interner Fehler' }, { status: 500 });
  }
}
