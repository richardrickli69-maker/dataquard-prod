// src/app/api/cron/law-monitor/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Anthropic from '@anthropic-ai/sdk';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SOURCES = [
  { name: 'EDÖB', url: 'https://www.edoeb.admin.ch/edoeb/de/home/aktuell.rss' },
  { name: 'EUR-Lex', url: 'https://eur-lex.europa.eu/rss/rss.xml?locale=de' },
  { name: 'Bundesblatt CH', url: 'https://www.admin.ch/gov/de/start/dokumentation/medienmitteilungen.rss.html' },
];

async function fetchRSS(url: string) {
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'Dataquard-LawMonitor/1.0' } });
    const text = await res.text();
    const items: { title: string; link: string; summary: string }[] = [];
    const itemMatches = text.matchAll(/<item>([\s\S]*?)<\/item>/g);
    for (const match of itemMatches) {
      const item = match[1];
      const title = item.match(/<title>([\s\S]*?)<\/title>/)?.[1]?.replace(/<!\[CDATA\[|\]\]>/g, '').trim() || '';
      const link = item.match(/<link>([\s\S]*?)<\/link>/)?.[1]?.trim() || '';
      const summary = item.match(/<description>([\s\S]*?)<\/description>/)?.[1]?.replace(/<!\[CDATA\[|\]\]>/g, '').replace(/<[^>]*>/g, '').trim() || '';
      if (title) items.push({ title, link, summary });
    }
    return items;
  } catch {
    return [];
  }
}

async function checkRelevance(text: string) {
  try {
    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 256,
      messages: [{
        role: 'user',
        content: `Prüfe ob dieser Text für nDSG/DSGVO-Compliance relevant ist:

"${text.substring(0, 500)}"

Antworte NUR mit gültigem JSON:
{
  "is_relevant": true,
  "confidence": 0.9,
  "affected_modules": ["datenschutz", "cookies"],
  "reason": "Kurze Begründung"
}`
      }]
    });
    const raw = response.content[0].type === 'text' ? response.content[0].text : '{}';
    return JSON.parse(raw);
  } catch {
    return { is_relevant: false, confidence: 0, affected_modules: [], reason: '' };
  }
}

async function filterNewEntries(items: { title: string; link: string; summary: string }[], sourceName: string) {
  const newItems = [];
  for (const item of items.slice(0, 5)) {
    const { data } = await supabase
      .from('law_alerts')
      .select('id')
      .eq('title', item.title)
      .eq('source', sourceName)
      .single();
    if (!data) newItems.push(item);
  }
  return newItems;
}

export async function GET(request: Request) {
  // Sicherheit: nur Vercel Cron oder Admin
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let processed = 0;
  let alerts = 0;

  for (const source of SOURCES) {
    const items = await fetchRSS(source.url);
    const newEntries = await filterNewEntries(items, source.name);

    for (const entry of newEntries) {
      processed++;
      const relevance = await checkRelevance(entry.title + ' ' + entry.summary);

      if (relevance.is_relevant && relevance.confidence > 0.7) {
        alerts++;
        await supabase.from('law_alerts').insert({
          source: source.name,
          title: entry.title,
          url: entry.link,
          summary: entry.summary,
          relevance_score: relevance.confidence,
          affected_modules: relevance.affected_modules,
          reason: relevance.reason,
          status: 'pending_review',
          created_at: new Date().toISOString()
        });
      }
    }
  }

  return NextResponse.json({ success: true, processed, alerts });
}