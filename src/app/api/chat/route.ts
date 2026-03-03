import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

const client = new Anthropic();

const SYSTEM_PROMPT = `Du bist der freundliche Dataquard-Assistent. Dataquard ist ein Schweizer SaaS-Tool, das KMUs hilft, ihre Websites datenschutzkonform zu machen.

Dataquard-Produkte:
- Website-Scanner: Analysiert Websites auf Datenschutz-Compliance (Compliance, Optimierungs- und Trust-Score)
- Datenschutzerklärung-Generator: Erstellt rechtskonforme Datenschutzerklärungen mit Claude AI
- Impressum-Generator: Erstellt rechtskonforme Impressen für CH/DE/AT

Preispläne:
- Free: Kostenloser Scanner
- Starter: CHF 79/Jahr (1 Domain, Auto-Updates)
- Professional: CHF 199/Jahr (5 Domains, Re-Scans, Priority Support)
- Impressum Only: CHF 19 (einmalig)

Rechtliche Grundlagen:
- nDSG: Schweizer Datenschutzgesetz (seit 1. Sept. 2023 in Kraft), gilt für Schweizer Websites. Bußgelder bis CHF 250'000.
- DSGVO: EU-Datenschutz-Grundverordnung, gilt für EU-Websites und Websites die EU-Bürger ansprechen. Bußgelder bis €20 Mio oder 4% Jahresumsatz.

Antworte immer auf Deutsch, kurz und hilfreich. Verweise bei komplexen Rechtsfragen auf einen Datenschutzanwalt. Wenn du Dataquard-Features empfiehlst, erwähne den kostenlosen Scanner als Einstieg.`;

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Ungültige Anfrage' }, { status: 400 });
    }

    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 500,
      system: SYSTEM_PROMPT,
      messages: messages.map((m: { role: string; content: string }) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';

    return NextResponse.json({ content: text });
  } catch (error) {
    console.error('Chat API Fehler:', error);
    return NextResponse.json({ error: 'Fehler beim Verarbeiten der Anfrage' }, { status: 500 });
  }
}
