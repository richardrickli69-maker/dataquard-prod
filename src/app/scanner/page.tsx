'use client';

import { useState } from 'react';

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
    hasSSL: boolean;
    sslExpiry?: string;
    isMobileFriendly: boolean;
    lighthouseScore: number;
    trackerCount: number;
    estimatedSpeedImpact: string;
  };
  trust: {
    score: number;
    hasSSL: boolean;
    hasImpressum: boolean;
    hasContact: boolean;
    metaTagsComplete: boolean;
    noBrokenLinks: boolean;
  };
  insights: string[];
  recommendations: string[];
}

interface ScanResult {
  url: string;
  scan: ExtendedScanResult;
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
      const response = await fetch('/api/scan/extended', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Scan failed');
      }

      const data = await response.json();
      if (data.success) {
        setResult(data.data);
      } else {
        setError(data.error || 'Unknown error');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to scan website');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 70) return 'bg-green-50 border-green-200';
    if (score >= 50) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🔍 Website Health Check
          </h1>
          <p className="text-xl text-gray-600">
            Compliance + Optimization + Trust Analysis
          </p>
        </div>

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
              onKeyPress={(e) => e.key === 'Enter' && !loading && handleScan()}
              className="flex-1 border-2 border-gray-300 rounded px-4 py-3 focus:outline-none focus:border-blue-600"
            />
            <button
              onClick={handleScan}
              disabled={loading || !url.trim()}
              className="bg-blue-600 text-white px-8 py-3 rounded font-semibold hover:bg-blue-700 disabled:bg-gray-400 transition"
            >
              {loading ? 'Scanning...' : '🚀 Scan'}
            </button>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              ❌ {error}
            </div>
          )}

          <div className="mt-6 pt-6 border-t">
            <p className="text-sm font-semibold text-gray-600 mb-3">
              Test-Links:
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setUrl('example.ch')}
                className="text-left text-sm bg-gray-100 hover:bg-gray-200 p-3 rounded"
              >
                ✅ example.ch
              </button>
              <button
                onClick={() => setUrl('example-tracker.de')}
                className="text-left text-sm bg-gray-100 hover:bg-gray-200 p-3 rounded"
              >
                ⚠️ example-tracker.de
              </button>
            </div>
          </div>
        </div>

        {result && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className={`border-2 p-6 rounded-lg ${getScoreBgColor(result.scan.compliance.score)}`}>
                <h3 className="font-bold text-gray-900 mb-2">Compliance</h3>
                <div className={`text-5xl font-bold ${getScoreColor(result.scan.compliance.score)} mb-2`}>
                  {result.scan.compliance.score}%
                </div>
                <p className="text-sm text-gray-600">
                  {result.scan.compliance.ampel} {result.scan.compliance.jurisdiction}
                </p>
              </div>

              <div className={`border-2 p-6 rounded-lg ${getScoreBgColor(result.scan.optimization.score)}`}>
                <h3 className="font-bold text-gray-900 mb-2">Optimization</h3>
                <div className={`text-5xl font-bold ${getScoreColor(result.scan.optimization.score)} mb-2`}>
                  {result.scan.optimization.score}%
                </div>
                <p className="text-sm text-gray-600">
                  ⏱️ {result.scan.optimization.loadTime.toFixed(1)}s load time
                </p>
              </div>

              <div className={`border-2 p-6 rounded-lg ${getScoreBgColor(result.scan.trust.score)}`}>
                <h3 className="font-bold text-gray-900 mb-2">Trust</h3>
                <div className={`text-5xl font-bold ${getScoreColor(result.scan.trust.score)} mb-2`}>
                  {result.scan.trust.score}%
                </div>
                <p className="text-sm text-gray-600">
                  {result.scan.trust.hasSSL ? '🔒 SSL Active' : '🔓 No SSL'}
                </p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">📊 Key Findings</h2>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <span className="text-blue-600 mr-3">•</span>
                  <span className="text-gray-700">
                    <strong>Compliance:</strong> {result.scan.compliance.hasPrivacyPolicy ? '✅ Privacy Policy found' : '❌ Missing Privacy Policy'}
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-3">•</span>
                  <span className="text-gray-700">
                    <strong>Trackers:</strong> {result.scan.optimization.trackerCount} found
                    {result.scan.optimization.trackerCount > 5 ? ' (Too many!)' : ' (Good)'}
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-3">•</span>
                  <span className="text-gray-700">
                    <strong>SSL:</strong> {result.scan.trust.hasSSL ? '✅ Secure' : '❌ Not secure'}
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-3">•</span>
                  <span className="text-gray-700">
                    <strong>Mobile:</strong> {result.scan.optimization.isMobileFriendly ? '✅ Mobile friendly' : '❌ Not mobile friendly'}
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-3">•</span>
                  <span className="text-gray-700">
                    <strong>Impressum:</strong> {result.scan.trust.hasImpressum ? '✅ Found' : '❌ Missing'}
                  </span>
                </li>
              </ul>
            </div>

            {result.scan.insights.length > 0 && (
              <div className="bg-blue-50 border-l-4 border-blue-600 p-6 rounded">
                <h3 className="font-bold text-gray-900 mb-4">💡 Insights</h3>
                <ul className="space-y-2">
                  {result.scan.insights.map((insight, i) => (
                    <li key={i} className="text-gray-700">
                      {insight}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {result.scan.recommendations.length > 0 && (
              <div className="bg-yellow-50 border-l-4 border-yellow-600 p-6 rounded">
                <h3 className="font-bold text-gray-900 mb-4">🎯 Recommendations</h3>
                <ul className="space-y-2">
                  {result.scan.recommendations.map((rec, i) => (
                    <li key={i} className="text-gray-700">
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setResult(null)}
                className="bg-gray-600 text-white py-3 rounded font-semibold hover:bg-gray-700"
              >
                ← New Scan
              </button>
              <button className="bg-green-600 text-white py-3 rounded font-semibold hover:bg-green-700">
                Get Privacy Policy 💰
              </button>
            </div>
          </div>
        )}

        {!result && (
          <div className="bg-blue-50 border-l-4 border-blue-600 p-6 rounded">
            <h3 className="font-bold text-gray-900 mb-3">
              ℹ️ What we check:
            </h3>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li><strong>Compliance:</strong> GDPR/nDSG requirements, trackers, cookie banner</li>
              <li><strong>Optimization:</strong> Load time, performance, mobile-friendly, SSL</li>
              <li><strong>Trust:</strong> Impressum, contact info, security certificates, meta tags</li>
              <li><strong>Insights:</strong> How compliance and performance are linked</li>
              <li><strong>Recommendations:</strong> Actionable steps to improve everything</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}