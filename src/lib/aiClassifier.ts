// src/lib/aiClassifier.ts
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface UnknownService {
  scriptUrl: string;
  scriptName?: string;
  htmlAttributes?: Record<string, string>;
}

interface ServiceClassification {
  category: string;
  name: string;
  data_transfer_country: string;
  requires_consent: boolean;
  confidence: number;
}

function hashUrl(url: string): string {
  let hash = 0;
  for (let i = 0; i < url.length; i++) {
    const char = url.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

export async function classifyUnknownService(service: UnknownService): Promise<ServiceClassification> {
  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 256,
    messages: [{
      role: 'user',
      content: `Du bist ein Datenschutz-Experte. Klassifiziere diesen Web-Dienst:
Script URL: ${service.scriptUrl}
Script Name: ${service.scriptName || 'unbekannt'}
HTML Attribute: ${JSON.stringify(service.htmlAttributes || {})}

Antworte NUR mit gültigem JSON (kein Markdown):
{
  "category": "analytics|tracking|marketing|cdn|font|chat|payment|social|video|other",
  "name": "Erkannter Dienst-Name",
  "data_transfer_country": "CH|EU|US|unknown",
  "requires_consent": true,
  "confidence": 0.9
}`
    }]
  });

  const raw = response.content[0].type === 'text' ? response.content[0].text : '{}';
  try {
    return JSON.parse(raw);
  } catch {
    return {
      category: 'other',
      name: 'Unbekannt',
      data_transfer_country: 'unknown',
      requires_consent: true,
      confidence: 0
    };
  }
}

export async function classifyWithCache(service: UnknownService): Promise<ServiceClassification> {
  const cacheKey = hashUrl(service.scriptUrl);

  try {
    const { data: cached } = await supabase
      .from('service_classifications_cache')
      .select('*')
      .eq('cache_key', cacheKey)
      .single();

    if (cached) return cached.classification;
  } catch {}

  const result = await classifyUnknownService(service);

  try {
    await supabase.from('service_classifications_cache').insert({
      cache_key: cacheKey,
      script_url: service.scriptUrl,
      classification: result
    });
  } catch {}

  return result;
}