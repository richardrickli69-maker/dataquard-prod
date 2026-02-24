'use client';

import { useState } from 'react';

interface JurisdictionResult {
  jurisdiction: 'nDSG' | 'DSGVO' | 'BOTH';
  ampel: '🟢' | '🟡' | '🔴';
  confidence: number;
  reasons: string[];
}

interface ScanResult {
  jurisdiction: JurisdictionResult;
  url: string;
  timestamp: string;
}

export default function Scanner() {
  const [url, setUrl] = useState('');
  const [result, setResult] = useState<ScanResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleScan = async () => {
    if (!url.trim()) return;

    setLoading(true);
    setError('');
    setResult(null);

    try {
      // Call the REAL API!
      const response = await fetch('/api/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Scan failed');
      }

      const data = await response.json();

      if (data.success) {
        setResult({
          jurisdiction: data.data.jurisdiction,
          url: data.data.scan.domain,
          timestamp: data.data.timestamp,
        });
      } else {
        setError(data.error || 'Unknown error');
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to scan website'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🔍 Website Scanner
          </h1>
          <p className="text-xl text-gray-600">
            Automatisch erkennen: nDSG oder DSGVO?
          </p>
        </div>

        {/* Scanner Form */}
        <div className="bg-white p-8 rounded-lg shadow-md mb-8">
          <label className="block text-lg font-semibold mb-4">
            Website-URL eingeben:
          </label>

          <div className="flex gap-2 mb-4">
            <input
              type="text"
              placeholder="https://example.ch"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyPress={(e) =>
                e.key === 'Enter' && !loading && handleScan()
              }
              className="flex-1 border-2 border-gray-300 rounded px-4 py-3 focus:outline-none focus:border-blue-600"
            />
            <button
              onClick={handleScan}
              disabled={loading || !url.trim()}
              className="bg-blue-600 text-white px-8 py-3 rounded font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
            >
              {loading ? 'Scanning...' : '🚀 Scan'}
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              ❌ {error}
            </div>
          )}

          {/* Quick Examples */}
          <div className="mt-6 pt-6 border-t">
            <p className="text-sm font-semibold text-gray-600 mb-3">
              Test-Links:
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setUrl('example.ch')}
                className="text-left text-sm bg-gray-100 hover:bg-gray-200 p-3 rounded text-gray-700"
              >
                ✅ example.ch (nDSG)
              </button>
              <button
                onClick={() => setUrl('example.de')}
                className="text-left text-sm bg-gray-100 hover:bg-gray-200 p-3 rounded text-gray-700"
              >
                ✅ example.de (DSGVO)
              </button>
              <button
                onClick={() => setUrl('example.com')}
                className="text-left text-sm bg-gray-100 hover:bg-gray-200 p-3 rounded text-gray-700"
              >
                ✅ example.com (BOTH)
              </button>
            </div>
          </div>
        </div>

        {/* Results */}
        {result && (
          <div className="bg-white p-8 rounded-lg shadow-md">
            {/* Ampel */}
            <div className="text-center mb-8">
              <div className="text-8xl mb-4">{result.jurisdiction.ampel}</div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                {result.jurisdiction.jurisdiction}
              </h2>
              <p className="text-gray-600">
                Website: <strong>{result.url}</strong>
              </p>
            </div>

            {/* Message */}
            <div className="bg-blue-50 border-l-4 border-blue-600 p-6 mb-8">
              <p className="text-lg text-gray-800">
                {result.jurisdiction.jurisdiction === 'nDSG' && (
                  <>
                    ✅ Diese Website braucht eine <strong>Schweizer nDSG Privacy Policy</strong>
                  </>
                )}
                {result.jurisdiction.jurisdiction === 'DSGVO' && (
                  <>
                    ✅ Diese Website braucht eine <strong>EU-DSGVO Privacy Policy</strong>
                  </>
                )}
                {result.jurisdiction.jurisdiction === 'BOTH' && (
                  <>
                    ⚠️ Diese Website braucht <strong>BEIDE Policies</strong> (nDSG + DSGVO)
                  </>
                )}
              </p>
            </div>

            {/* Confidence & Reasons */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">
                  Konfidenz: {result.jurisdiction.confidence}%
                </h3>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${result.jurisdiction.confidence}%` }}
                />
              </div>
            </div>

            {/* Reasons */}
            {result.jurisdiction.reasons.length > 0 && (
              <div className="mb-8">
                <h3 className="font-semibold text-gray-900 mb-4">
                  Erkannt aufgrund von:
                </h3>
                <ul className="space-y-2">
                  {result.jurisdiction.reasons.map((reason, i) => (
                    <li
                      key={i}
                      className="flex items-center text-gray-700"
                    >
                      <span className="text-green-600 mr-3">✅</span>
                      {reason}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setResult(null)}
                className="bg-gray-600 text-white py-3 rounded font-semibold hover:bg-gray-700"
              >
                ← Neuer Scan
              </button>
              <button className="bg-green-600 text-white py-3 rounded font-semibold hover:bg-green-700">
                Policy kaufen 💰
              </button>
            </div>
          </div>
        )}

        {/* Info Section */}
        {!result && (
          <div className="bg-blue-50 border-l-4 border-blue-600 p-6 rounded">
            <h3 className="font-bold text-gray-900 mb-3">
              ℹ️ Wie funktioniert der Scanner?
            </h3>
            <ol className="list-decimal list-inside text-gray-700 space-y-2">
              <li>Geben Sie Ihre Website-URL ein</li>
              <li>Der Scanner analysiert Ihre Website</li>
              <li>
                Die Ampel zeigt: 🟢 nDSG, 🟡 DSGVO, oder 🔴 BEIDE
              </li>
              <li>Sie sehen sofort welche Policy Sie brauchen</li>
              <li>Klicken Sie "Policy kaufen" um zu beginnen</li>
            </ol>
          </div>
        )}
      </div>
    </div>
  );
}