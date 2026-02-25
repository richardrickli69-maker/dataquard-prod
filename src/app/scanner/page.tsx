'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

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
  const { user } = useAuth();
  const [url, setUrl] = useState('');
  const [result, setResult] = useState<ScanResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [reminderSent, setReminderSent] = useState(false);

  const handleScan = async () => {
    if (!url.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);
    setReminderSent(false);

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
      setError(err instanceof Error ? err.message : 'Failed to scan');
    } finally {
      setLoading(false);
    }
  };

  // Retargeting: Create reminder if user leaves without buying
  useEffect(() => {
    return () => {
      if (result && !loading && !reminderSent && user?.email) {
        // User is leaving after scan without purchasing
        fetch('/api/reminders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: user.email,
            domain: result.url,
            scanId: null,
          }),
        })
          .then(() => setReminderSent(true))
          .catch(() => {
            // Reminder creation failed silently
          });
      }
    };
  }, [result, loading, reminderSent, user]);

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-400';
    if (score >= 50) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 70) return 'bg-green-900 border-green-700';
    if (score >= 50) return 'bg-yellow-900 border-yellow-700';
    return 'bg-red-900 border-red-700';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 to-black text-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">🔍 Website Health Check</h1>
          <p className="text-xl text-gray-300">Compliance + Optimization + Security Analysis</p>
        </div>

        <div className="bg-indigo-900 bg-opacity-50 p-8 rounded-lg shadow-lg border border-indigo-700 mb-8">
          <label className="block text-lg font-semibold mb-4 text-white">Website-URL eingeben:</label>

          <div className="flex gap-2 mb-4">
            <input
              type="text"
              placeholder="https://example.ch"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !loading && handleScan()}
              className="flex-1 border-2 border-indigo-600 rounded px-4 py-3 bg-indigo-800 text-white placeholder-gray-400 focus:outline-none focus:border-indigo-400"
            />
            <button
              onClick={handleScan}
              disabled={loading || !url.trim()}
              className="bg-indigo-600 text-white px-8 py-3 rounded font-semibold hover:bg-indigo-500 disabled:bg-gray-600 transition"
            >
              {loading ? 'Scanning...' : '🚀 Scan'}
            </button>
          </div>

          {error && (
            <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded">
              ❌ {error}
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-indigo-700">
            <p className="text-sm font-semibold text-gray-300 mb-3">Test-Links:</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setUrl('example.ch')}
                className="text-left text-sm bg-indigo-800 hover:bg-indigo-700 p-3 rounded border border-indigo-700"
              >
                ✅ example.ch
              </button>
              <button
                onClick={() => setUrl('example-tracker.de')}
                className="text-left text-sm bg-indigo-800 hover:bg-indigo-700 p-3 rounded border border-indigo-700"
              >
                ⚠️ example-tracker.de
              </button>
            </div>
          </div>
        </div>

        {result && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className={`border-2 p-6 rounded-lg bg-indigo-900 bg-opacity-50 ${getScoreBgColor(result.scan.compliance.score)}`}>
                <h3 className="font-bold text-white mb-2">Compliance</h3>
                <div className={`text-5xl font-bold ${getScoreColor(result.scan.compliance.score)} mb-2`}>
                  {result.scan.compliance.score}%
                </div>
                <p className="text-sm text-gray-300">
                  {result.scan.compliance.ampel} {result.scan.compliance.jurisdiction}
                </p>
              </div>

              <div className={`border-2 p-6 rounded-lg bg-indigo-900 bg-opacity-50 ${getScoreBgColor(result.scan.optimization.score)}`}>
                <h3 className="font-bold text-white mb-2">Optimization</h3>
                <div className={`text-5xl font-bold ${getScoreColor(result.scan.optimization.score)} mb-2`}>
                  {result.scan.optimization.score}%
                </div>
                <p className="text-sm text-gray-300">
                  ⏱️ {result.scan.optimization.loadTime.toFixed(1)}s load time
                </p>
              </div>

              <div className={`border-2 p-6 rounded-lg bg-indigo-900 bg-opacity-50 ${getScoreBgColor(result.scan.trust.score)}`}>
                <h3 className="font-bold text-white mb-2">Trust</h3>
                <div className={`text-5xl font-bold ${getScoreColor(result.scan.trust.score)} mb-2`}>
                  {result.scan.trust.score}%
                </div>
                <p className="text-sm text-gray-300">
                  {result.scan.trust.hasSSL ? '🔒 SSL Active' : '🔓 No SSL'}
                </p>
              </div>
            </div>

            <div className="bg-indigo-900 bg-opacity-50 p-6 rounded-lg shadow-lg border border-indigo-700">
              <h2 className="text-2xl font-bold text-white mb-4">📊 Key Findings</h2>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <span className="text-indigo-400 mr-3">•</span>
                  <span className="text-gray-200">
                    <strong>Compliance:</strong> {result.scan.compliance.hasPrivacyPolicy ? '✅ Privacy Policy found' : '❌ Missing Privacy Policy'}
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-indigo-400 mr-3">•</span>
                  <span className="text-gray-200">
                    <strong>Trackers:</strong> {result.scan.optimization.trackerCount} found
                    {result.scan.optimization.trackerCount > 5 ? ' (Too many!)' : ' (Good)'}
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-indigo-400 mr-3">•</span>
                  <span className="text-gray-200">
                    <strong>SSL:</strong> {result.scan.trust.hasSSL ? '✅ Secure' : '❌ Not secure'}
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-indigo-400 mr-3">•</span>
                  <span className="text-gray-200">
                    <strong>Mobile:</strong> {result.scan.optimization.isMobileFriendly ? '✅ Mobile friendly' : '❌ Not mobile friendly'}
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-indigo-400 mr-3">•</span>
                  <span className="text-gray-200">
                    <strong>Impressum:</strong> {result.scan.trust.hasImpressum ? '✅ Found' : '❌ Missing'}
                  </span>
                </li>
              </ul>
            </div>

            {result.scan.insights.length > 0 && (
              <div className="bg-blue-900 bg-opacity-50 border-l-4 border-blue-600 p-6 rounded">
                <h3 className="font-bold text-white mb-4">💡 Insights</h3>
                <ul className="space-y-2">
                  {result.scan.insights.map((insight, i) => (
                    <li key={i} className="text-gray-300">{insight}</li>
                  ))}
                </ul>
              </div>
            )}

            {result.scan.recommendations.length > 0 && (
              <div className="bg-yellow-900 bg-opacity-50 border-l-4 border-yellow-600 p-6 rounded">
                <h3 className="font-bold text-white mb-4">🎯 Recommendations</h3>
                <ul className="space-y-2">
                  {result.scan.recommendations.map((rec, i) => (
                    <li key={i} className="text-gray-300">{rec}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setResult(null)}
                className="bg-gray-700 text-white py-3 rounded font-semibold hover:bg-gray-600"
              >
                ← New Scan
              </button>
              <a href="/checkout" className="bg-green-600 text-white py-3 rounded font-semibold hover:bg-green-500 text-center">
                Get Privacy Policy 💰
              </a>
            </div>
          </div>
        )}

        {!result && (
          <div className="bg-indigo-900 bg-opacity-50 border-l-4 border-indigo-600 p-6 rounded">
            <h3 className="font-bold text-white mb-3">ℹ️ What we check:</h3>
            <ul className="list-disc list-inside text-gray-300 space-y-2">
              <li><strong>Compliance:</strong> GDPR/nDSG requirements, trackers, cookie banner</li>
              <li><strong>Optimization:</strong> Load time, performance, mobile-friendly, SSL</li>
              <li><strong>Security:</strong> Outdated scripts, mixed content, SSL certificates</li>
              <li><strong>Trust:</strong> Impressum, contact info, meta tags, security indicators</li>
              <li><strong>Insights:</strong> How compliance and performance are linked</li>
              <li><strong>Recommendations:</strong> Actionable steps to improve everything</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}