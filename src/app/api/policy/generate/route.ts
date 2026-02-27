import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export async function POST(req: NextRequest) {
  try {
    const { data, templatePolicy } = await req.json();

    const trackers = [
      data.hasGoogleAnalytics && 'Google Analytics',
      data.hasMetaPixel && 'Meta Pixel / Facebook Pixel',
      data.hasGoogleAds && 'Google Ads',
      data.hasHotjar && 'Hotjar',
      data.hasStripe && 'Stripe',
      data.hasYoutube && 'YouTube',
      data.hasLinkedIn && 'LinkedIn Insight Tag',
      data.hasOtherTrackers && 'weitere Tracking-Dienste',
    ].filter(Boolean).join(', ');

    const features = [
      data.hasContactForm && 'Kontaktformular',
      data.hasNewsletter && 'Newsletter',
      data.hasShop && 'Online-Shop',
      data.hasLogin && 'Benutzer-Login',
      data.hasComments && 'Kommentarfunktion',
    ].filter(Boolean).join(', ');

    const prompt = `Du bist ein Schweizer Datenschutzrechts-Experte. Überarbeite und verbessere die folgende Datenschutzerklärung für ein KMU.

FIRMEN-KONTEXT:
- Firma: ${data.firmaName}
- Website: ${data.domain}
- Rechtsraum: ${data.rechtsraum === 'CH' ? 'Schweiz (nDSG)' : data.rechtsraum === 'DE' ? 'Deutschland (DSGVO)' : 'Schweiz + Deutschland (nDSG + DSGVO)'}
- Eingesetzte Tracker/Dienste: ${trackers || 'keine'}
- Website-Features: ${features || 'keine'}

TEMPLATE ZUM VERBESSERN:
${templatePolicy}

AUFGABEN:
1. Formuliere die Texte natürlicher und verständlicher für KMU-Inhaber
2. Stelle sicher dass alle rechtlichen Pflichtangaben enthalten sind
3. Passe die Sprache dem Rechtsraum an (CH: "Bearbeitung", DE: "Verarbeitung")
4. Füge bei gefundenen Trackern spezifische, aktuelle Informationen hinzu
5. Behalte die Struktur mit nummerierten Abschnitten bei
6. Gib NUR die fertige Datenschutzerklärung zurück, ohne Erklärungen oder Kommentare

WICHTIG: Antworte ausschliesslich mit dem Text der Datenschutzerklärung, ohne Präambel oder Nachbemerkungen.`;

    const message = await anthropic.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 4000,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const policy = message.content[0].type === 'text' ? message.content[0].text : templatePolicy;

    return NextResponse.json({ policy, source: 'ai' });
  } catch (err) {
    console.error('Policy generation error:', err);
    return NextResponse.json(
      { error: 'KI-Generierung fehlgeschlagen', policy: null },
      { status: 500 }
    );
  }
}