'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

// ─── Types ───────────────────────────────────────────────────────────────────

interface ScanResult {
  url: string;
  scores: {
    compliance: number;
    optimization: number;
    trust: number;
  };
  findings: {
    datenschutz: boolean;
    cookieBanner: boolean;
    trackerCount: number;
    ssl: boolean;
    mobile: boolean;
    impressum: boolean;
    impressumVollstaendig: boolean;
    impressumPflichtangaben: string[];
  };
  jurisdiction: 'nDSG' | 'DSGVO' | 'BEIDES';
  insights: string[];
  recommendations: string[];
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const jurisdictionColor = (j: string) => {
  if (j === 'nDSG') return 'text-green-400 bg-green-400/10 border-green-400/30';
  if (j === 'DSGVO') return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30';
  return 'text-red-400 bg-red-400/10 border-red-400/30';
};

const jurisdictionEmoji = (j: string) => {
  if (j === 'nDSG') return '🟢';
  if (j === 'DSGVO') return '🟡';
  return '🔴';
};

const scoreColor = (score: number) => {
  if (score >= 70) return '#22c55e';
  if (score >= 40) return '#f59e0b';
  return '#ef4444';
};

const scoreLabel = (score: number) => {
  if (score >= 70) return 'Gut';
  if (score >= 40) return 'Verbesserungsbedarf';
  return 'Kritisch';
};

// ─── Score Circle ─────────────────────────────────────────────────────────────

function ScoreCircle({ score, label, icon }: { score: number; label: string; icon: string }) {
  const r = 20;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = scoreColor(score);

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-12 h-12 sm:w-14 sm:h-14">
        <svg className="w-12 h-12 sm:w-14 sm:h-14 -rotate-90" viewBox="0 0 52 52">
          <circle cx="26" cy="26" r={r} fill="none" stroke="#1e293b" strokeWidth="5" />
          <circle
            cx="26" cy="26" r={r}
            fill="none"
            stroke={color}
            strokeWidth="5"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-sm leading-none">{icon}</span>
          <span className="text-[10px] font-bold text-white leading-none mt-0.5">{score}%</span>
        </div>
      </div>
      <span className="text-[11px] text-slate-400 font-medium leading-tight text-center">{label}</span>
      <span className="text-[11px] font-semibold leading-tight" style={{ color }}>{scoreLabel(score)}</span>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ScannerPage() {
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState('');

  // Chat
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: 'Hallo! Ich bin der Dataquard Assistent. Ich helfe Ihnen bei Fragen zu DSGVO, nDSG und Website-Compliance. Was möchten Sie wissen?'
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatOpen) chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, chatOpen]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlParam = params.get('url');
    if (urlParam) setUrl(urlParam);
  }, []);

  // ── Scan ──────────────────────────────────────────────────────────────────

  const handleScan = async () => {
    if (!url.trim()) { setError('Bitte geben Sie eine URL ein.'); return; }
    setError('');
    setScanning(true);
    setResult(null);

    let scanUrl = url.trim();
    if (!scanUrl.startsWith('http://') && !scanUrl.startsWith('https://')) {
      scanUrl = 'https://' + scanUrl;
    }

    try {
      let session = null;
      try {
        const { data, error } = await supabase.auth.getSession();
        if (!error) session = data.session;
      } catch {
        // Abgelaufener Token – User ist nicht eingeloggt, kein Problem
      }
      console.log('[scanner] session user:', session?.user?.email, 'token:', session?.access_token?.substring(0, 20));
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      const res = await fetch('/api/scan/extended', {
        method: 'POST',
        headers,
        body: JSON.stringify({ url: scanUrl }),
      });

      if (!res.ok) throw new Error(`Serverfehler: ${res.status}`);
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Scan fehlgeschlagen');

      const scan = data.data?.scan;
      const rawJurisdiction = scan?.compliance?.jurisdiction ?? 'nDSG';
      const jurisdiction = (rawJurisdiction === 'GDPR' ? 'DSGVO' : rawJurisdiction) as 'nDSG' | 'DSGVO' | 'BEIDES';

      setResult({
        url: scanUrl,
        scores: {
          compliance: scan?.compliance?.score ?? 0,
          optimization: scan?.optimization?.score ?? 0,
          trust: scan?.trust?.score ?? 0,
        },
        findings: {
          datenschutz: scan?.compliance?.hasPrivacyPolicy ?? false,
          cookieBanner: scan?.compliance?.hasCookieBanner ?? false,
          trackerCount: scan?.optimization?.trackerCount ?? 0,
          ssl: scan?.trust?.hasSSL ?? scan?.optimization?.hasSSL ?? false,
          mobile: scan?.optimization?.isMobileFriendly ?? false,
          impressum: scan?.trust?.hasImpressum ?? false,
          impressumVollstaendig: scan?.trust?.impressumComplete ?? false,
          impressumPflichtangaben: scan?.trust?.impressumMissing ?? [],
        },
        jurisdiction,
        insights: scan?.insights ?? [],
        recommendations: scan?.recommendations ?? [],
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Scan fehlgeschlagen. Bitte versuchen Sie es erneut.');
    } finally {
      setScanning(false);
    }
  };

  // ── Chat ──────────────────────────────────────────────────────────────────

  const handleChat = async () => {
    if (!chatInput.trim() || chatLoading) return;

    const userMsg: ChatMessage = { role: 'user', content: chatInput.trim() };
    const updatedMessages = [...chatMessages, userMsg];
    setChatMessages(updatedMessages);
    setChatInput('');
    setChatLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages,
          context: result
            ? `Website ${result.url} analysiert. Compliance: ${result.scores.compliance}%, Optimierung: ${result.scores.optimization}%, Vertrauen: ${result.scores.trust}%. Jurisdiktion: ${result.jurisdiction}.`
            : undefined,
        }),
      });

      if (!res.ok) throw new Error('Chat-Fehler');
      const data = await res.json();

      setChatMessages(prev => [
        ...prev,
        { role: 'assistant', content: data.message ?? 'Entschuldigung, keine Antwort erhalten.' }
      ]);
    } catch {
      setChatMessages(prev => [
        ...prev,
        { role: 'assistant', content: 'Der Assistent ist momentan nicht verfügbar. Bitte versuchen Sie es später erneut oder schreiben Sie an support@dataquard.ch.' }
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white font-sans">

      {/* Header */}
      <header className="border-b border-slate-800 bg-[#0a0f1e]/90 backdrop-blur sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors text-xs sm:text-sm px-2 py-1 rounded-lg hover:bg-slate-800"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Zurück
            </button>
            <span className="text-slate-700">|</span>
            <Link href="/" className="flex items-center gap-2">
              <span className="text-lg font-bold">
                <span className="text-blue-400">Data</span><span className="text-red-500">quard</span>
              </span>
            </Link>
          </div>
          <Link
            href="/checkout"
            className="text-xs bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-3 py-1.5 rounded-full font-medium transition-all"
          >
            Upgrade – CHF 79 Einmalkauf
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="max-w-4xl mx-auto px-4 py-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2">
            Website-Analyse
          </h1>
          <p className="text-slate-400 text-base">
            Compliance · Optimierung · Sicherheitsanalyse
          </p>
        </div>

        {/* URL Input */}
        <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 mb-6 shadow-xl">
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Website-URL eingeben
          </label>
          <div className="flex gap-3">
            <input
              type="text"
              value={url}
              onChange={e => setUrl(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleScan()}
              placeholder="https://ihre-website.ch"
              className="flex-1 bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
            <button
              onClick={handleScan}
              disabled={scanning}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2"
            >
              {scanning ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Analyse läuft…
                </>
              ) : (
                <>🚀 Analyse starten</>
              )}
            </button>
          </div>

          {error && <p className="mt-3 text-red-400 text-sm">{error}</p>}
        </div>

        {/* Info box – no result yet */}
        {!result && !scanning && (
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-xl">
            <h2 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
              <span className="text-blue-400">ℹ️</span> Was wir prüfen
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { icon: '🔒', title: 'Compliance', desc: 'DSGVO/nDSG-Anforderungen, Tracker-Erkennung, Cookie Banner' },
                { icon: '⚡', title: 'Optimierung', desc: 'Ladezeit, Performance, Mobile-Freundlichkeit, SSL' },
                { icon: '🛡️', title: 'Sicherheit', desc: 'Veraltete Scripts, Mixed Content, SSL-Zertifikate' },
                { icon: '✅', title: 'Vertrauen', desc: 'Kontaktinfos, Meta Tags, Sicherheitsindikatoren' },
                { icon: '📄', title: 'Impressum', desc: 'Vollständigkeit, Pflichtangaben nach nDSG/DSGVO' },
                { icon: '🎯', title: 'Empfehlungen', desc: 'Konkrete Schritte zur Verbesserung' },
              ].map(item => (
                <div key={item.title} className="flex gap-3 p-3 bg-slate-800/50 rounded-xl">
                  <span className="text-lg flex-shrink-0">{item.icon}</span>
                  <div>
                    <p className="text-sm font-semibold text-white">{item.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Loading */}
        {scanning && (
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-10 text-center shadow-xl">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
            <p className="text-white font-semibold">Analyse läuft…</p>
            <p className="text-slate-400 text-sm mt-1">Wir prüfen Compliance, Optimierung, Sicherheit und Impressum.</p>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-5">

            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-semibold ${jurisdictionColor(result.jurisdiction)}`}>
              {jurisdictionEmoji(result.jurisdiction)} Jurisdiktion: {result.jurisdiction}
            </div>

            {/* Score circles */}
            <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-xl">
              <h2 className="text-sm font-semibold text-slate-300 mb-5">Analyse-Ergebnis</h2>
              <div className="flex justify-around flex-wrap gap-2 sm:gap-4">
                <ScoreCircle score={result.scores.compliance} label="Compliance" icon="🔒" />
                <ScoreCircle score={result.scores.optimization} label="Optimierung" icon="⚡" />
                <ScoreCircle score={result.scores.trust} label="Vertrauen" icon="✅" />
              </div>
            </div>

            {/* Findings */}
            <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-xl">
              <h2 className="text-sm font-semibold text-slate-300 mb-4">📊 Befunde</h2>
              <div className="space-y-2">
                {[
                  { label: 'Datenschutzerklärung', ok: result.findings.datenschutz, bad: '❌ Fehlt – Pflicht nach nDSG/DSGVO!', good: '✅ Vorhanden' },
                  { label: 'Cookie Banner', ok: result.findings.cookieBanner, bad: '❌ Fehlt', good: '✅ Vorhanden' },
                  { label: 'Tracker gefunden', ok: result.findings.trackerCount <= 4, bad: `⚠️ ${result.findings.trackerCount} Tracker – zu viele`, good: `✅ ${result.findings.trackerCount} Tracker (akzeptabel)` },
                  { label: 'SSL / HTTPS', ok: result.findings.ssl, bad: '❌ Kein SSL – Sicherheitsrisiko!', good: '✅ Sicher' },
                  { label: 'Mobile-Optimierung', ok: result.findings.mobile, bad: '⚠️ Nicht mobile-freundlich', good: '✅ Mobile-freundlich' },
                  {
                    label: 'Impressum',
                    ok: result.findings.impressum,
                    bad: '❌ Fehlt – gesetzlich verpflichtend!',
                    good: result.findings.impressumVollstaendig ? '✅ Vollständig vorhanden' : '⚠️ Vorhanden, aber unvollständig'
                  },
                ].map(row => (
                  <div key={row.label} className="flex items-start gap-2 py-1.5 border-b border-slate-800 last:border-0">
                    <span className="text-slate-400 text-sm w-48 flex-shrink-0">{row.label}:</span>
                    <span className={`text-sm ${row.ok ? 'text-green-400' : 'text-red-400'}`}>
                      {row.ok ? row.good : row.bad}
                    </span>
                  </div>
                ))}

                {result.findings.impressum && !result.findings.impressumVollstaendig && result.findings.impressumPflichtangaben.length > 0 && (
                  <div className="mt-2 p-3 bg-yellow-400/5 border border-yellow-400/20 rounded-xl">
                    <p className="text-yellow-400 text-xs font-semibold mb-1">Fehlende Pflichtangaben im Impressum:</p>
                    <ul className="list-disc list-inside text-xs text-slate-300 space-y-0.5">
                      {result.findings.impressumPflichtangaben.map((a, i) => <li key={i}>{a}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Insights */}
            {result.insights.length > 0 && (
              <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-xl">
                <h2 className="text-sm font-semibold text-slate-300 mb-4">💡 Erkenntnisse</h2>
                <ul className="space-y-2">
                  {result.insights.map((insight, i) => (
                    <li key={i} className="text-sm text-slate-300 pl-3 border-l border-slate-700">
                      {insight}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recommendations */}
            {result.recommendations.length > 0 && (
              <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-xl">
                <h2 className="text-sm font-semibold text-slate-300 mb-4">🎯 Empfehlungen</h2>
                <ol className="space-y-2">
                  {result.recommendations.map((rec, i) => (
                    <li key={i} className="text-sm text-slate-300 flex gap-3">
                      <span className="flex-shrink-0 w-5 h-5 bg-blue-600/20 text-blue-400 rounded-full flex items-center justify-center text-xs font-bold">
                        {i + 1}
                      </span>
                      <span>{rec.replace(/^\d+\.?\s*/, '')}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => { setResult(null); setUrl(''); }}
                className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
              >
                ← Neue Analyse
              </button>
              <Link
                href={`/impressum-generator?domain=${encodeURIComponent(result.url)}&jurisdiction=${result.jurisdiction}`}
                className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
              >
                📄 Impressum generieren
              </Link>
              <Link
                href={`/cookie-banner-generator?domain=${encodeURIComponent(result.url)}&jurisdiction=${result.jurisdiction}&trackers=${result.findings.trackerCount > 0 ? 'google_analytics' : ''}`}
                className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
              >
                🍪 Cookie-Banner generieren
              </Link>
              <Link
                href="/checkout"
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
              >
                🔒 Datenschutzerklärung – CHF 79 Einmalkauf
              </Link>
            </div>
          </div>
        )}
      </main>

      {/* Chat window */}
      {chatOpen && (
        <div className="fixed bottom-20 right-4 w-80 sm:w-96 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-700 to-indigo-700">
            <div className="flex items-center gap-2">
              <span className="text-lg">🤖</span>
              <div>
                <p className="text-sm font-bold text-white">Dataquard Assistent</p>
                <p className="text-xs text-blue-200">DSGVO & nDSG Hilfe</p>
              </div>
            </div>
            <button onClick={() => setChatOpen(false)} className="text-blue-200 hover:text-white transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-72">
            {chatMessages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-br-sm' : 'bg-slate-800 text-slate-200 rounded-bl-sm'}`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {chatLoading && (
              <div className="flex justify-start">
                <div className="bg-slate-800 px-3 py-2 rounded-2xl rounded-bl-sm">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <div className="px-3 py-3 border-t border-slate-700 flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleChat()}
              placeholder="Ihre Frage…"
              className="flex-1 bg-slate-800 border border-slate-600 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
            <button
              onClick={handleChat}
              disabled={chatLoading || !chatInput.trim()}
              className="bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white px-3 py-2 rounded-xl transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Chat toggle button */}
      <button
        onClick={() => setChatOpen(prev => !prev)}
        className="fixed bottom-4 right-4 w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 text-white rounded-full shadow-xl flex items-center justify-center z-50 transition-all hover:scale-105"
        title="Dataquard Assistent öffnen"
      >
        {chatOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <span className="text-2xl">🤖</span>
        )}
      </button>

    </div>
  );
}
