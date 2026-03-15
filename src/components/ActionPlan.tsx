'use client';

import { useState } from 'react';

interface ActionItem {
  urgency: 'sofort' | 'diese Woche' | 'dieser Monat';
  title: string;
  description: string;
  link?: string;
}

interface ActionPlanResult {
  actions: ActionItem[];
  complianceScore: number;
}

interface ExtendedScanResult {
  compliance: {
    score: number;
    jurisdiction: string;
    ampel: string;
    hasPrivacyPolicy: boolean;
    trackersFound: string[];
    hasCookieBanner: boolean;
  };
  optimization: {
    score: number;
    loadTime: number;
    trackerCount: number;
  };
  trust: {
    score: number;
    hasSSL: boolean;
    hasImpressum: boolean;
  };
  recommendations: string[];
}

interface Props {
  scanResult: ExtendedScanResult;
  url: string;
}

const URGENCY_CONFIG = {
  'sofort': {
    label: 'Sofort',
    bg: 'bg-red-900 bg-opacity-40',
    border: 'border-red-700',
    badge: 'bg-red-700 text-red-100',
    icon: '🔴',
  },
  'diese Woche': {
    label: 'Diese Woche',
    bg: 'bg-yellow-900 bg-opacity-40',
    border: 'border-yellow-700',
    badge: 'bg-yellow-700 text-yellow-100',
    icon: '🟡',
  },
  'dieser Monat': {
    label: 'Dieser Monat',
    bg: 'bg-blue-900 bg-opacity-40',
    border: 'border-blue-700',
    badge: 'bg-blue-800 text-blue-100',
    icon: '🔵',
  },
} as const;

export default function ActionPlan({ scanResult, url }: Props) {
  const [result, setResult] = useState<ActionPlanResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/scan/action-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scanResult, url }),
      });
      if (!res.ok) throw new Error('Anfrage fehlgeschlagen');
      const data = await res.json();
      setResult(data);
    } catch {
      setError('KI-Analyse konnte nicht geladen werden. Bitte versuchen Sie es erneut.');
    } finally {
      setLoading(false);
    }
  };

  const scoreColor = result
    ? result.complianceScore >= 70 ? 'text-green-400' : result.complianceScore >= 50 ? 'text-yellow-400' : 'text-red-400'
    : 'text-gray-400';

  const scoreBarColor = result
    ? result.complianceScore >= 70 ? 'bg-green-500' : result.complianceScore >= 50 ? 'bg-yellow-500' : 'bg-red-500'
    : 'bg-gray-600';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-indigo-900 bg-opacity-30 border border-indigo-700 p-6 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-bold">🎯 KI-Massnahmenplan</h2>
          {result && (
            <button
              onClick={handleGenerate}
              className="text-xs text-indigo-400 hover:text-indigo-300 underline"
            >
              Neu generieren
            </button>
          )}
        </div>
        <p className="text-gray-400 text-sm mb-4">
          Priorisierte Handlungsempfehlungen basierend auf Ihrem aktuellen Scan-Ergebnis für <strong className="text-gray-200">{url}</strong>
        </p>

        {!result && !loading && (
          <button
            onClick={handleGenerate}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-6 rounded-lg transition-all flex items-center justify-center gap-2"
          >
            <img src="/badge-ai-trust.svg" alt="AI" width={20} height={20} style={{ display: 'inline-block' }} />
            <span>KI-Analyse generieren</span>
          </button>
        )}

        {loading && (
          <div className="flex items-center justify-center gap-3 py-8 text-gray-400">
            <svg className="animate-spin h-5 w-5 text-indigo-400" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            <span className="text-sm">Claude analysiert Ihre Website...</span>
          </div>
        )}

        {error && (
          <div className="bg-red-900 bg-opacity-30 border border-red-700 text-red-300 px-4 py-3 rounded text-sm">
            {error}
          </div>
        )}
      </div>

      {result && (
        <>
          {/* Compliance Score */}
          <div className="bg-indigo-900 bg-opacity-30 border border-indigo-700 p-6 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-white">Compliance-Score</h3>
              <span className={`text-3xl font-bold ${scoreColor}`}>{result.complianceScore}/100</span>
            </div>
            <div className="w-full bg-indigo-900 rounded-full h-3">
              <div
                className={`${scoreBarColor} h-3 rounded-full transition-all duration-700`}
                style={{ width: `${result.complianceScore}%` }}
              />
            </div>
            <p className="text-gray-400 text-xs mt-2">
              {result.complianceScore >= 70 ? '✅ Gute Compliance – weiter verbessern' :
               result.complianceScore >= 50 ? '⚠️ Verbesserungsbedarf – Massnahmen ergreifen' :
               '❌ Kritischer Handlungsbedarf – sofort handeln'}
            </p>
          </div>

          {/* Action Items */}
          <div className="space-y-4">
            {result.actions.map((action, i) => {
              const config = URGENCY_CONFIG[action.urgency];
              return (
                <div
                  key={i}
                  className={`${config.bg} border ${config.border} p-5 rounded-lg`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-xl mt-0.5">{config.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded ${config.badge}`}>
                          {config.label}
                        </span>
                      </div>
                      <h4 className="text-white font-bold mb-1">{action.title}</h4>
                      <p className="text-gray-300 text-sm">{action.description}</p>
                      {action.link && (
                        <a
                          href={action.link}
                          className="inline-block mt-3 text-indigo-400 hover:text-indigo-300 text-sm font-semibold underline"
                        >
                          Jetzt umsetzen →
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
