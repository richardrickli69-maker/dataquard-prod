'use client';

import { useState } from 'react';

export default function Scanner() {
  const [url, setUrl] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleScan = async () => {
    if (!url) return;
    
    setLoading(true);
    // Simulate scan result
    setTimeout(() => {
      const isCH = url.includes('.ch');
      const jurisdiction = isCH ? 'nDSG' : 'DSGVO';
      const ampel = isCH ? '🟢' : '🟡';
      
      setResult({
        jurisdiction,
        ampel,
        url,
        reasons: [
          `Domain: ${isCH ? '.ch' : 'nicht .ch'}`,
          `Region: ${isCH ? 'Schweiz' : 'EU'}`
        ]
      });
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-blue-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-4xl font-bold mb-8 text-center">Website Scanner</h1>
        
        <div className="bg-white p-8 rounded-lg shadow-md mb-8">
          <label className="block text-lg font-semibold mb-4">
            Website-URL eingeben:
          </label>
          <input
            type="text"
            placeholder="https://example.ch"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full border-2 border-gray-300 rounded px-4 py-3 mb-4 focus:outline-none focus:border-blue-600"
          />
          <button
            onClick={handleScan}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded font-semibold hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? 'Scanning...' : '🚀 Scan starten!'}
          </button>
        </div>

        {result && (
          <div className="bg-white p-8 rounded-lg shadow-md">
            <div className="text-6xl text-center mb-4">{result.ampel}</div>
            <h2 className="text-2xl font-bold text-center mb-4">{result.jurisdiction}</h2>
            <p className="text-center text-gray-600 mb-8">
              Sie brauchen eine {result.jurisdiction} Privacy Policy!
            </p>
            
            <div className="mb-8">
              <h3 className="font-semibold mb-4">Gründe:</h3>
              <ul className="space-y-2">
                {result.reasons.map((reason: string, i: number) => (
                  <li key={i} className="text-gray-700">✅ {reason}</li>
                ))}
              </ul>
            </div>

            <button className="w-full bg-green-600 text-white py-3 rounded font-semibold hover:bg-green-700">
              Policy jetzt kaufen
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
