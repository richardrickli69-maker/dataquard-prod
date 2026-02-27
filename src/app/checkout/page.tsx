'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function SuccessInner() {
  const searchParams = useSearchParams();
  const product = searchParams.get('product') || 'starter';
  const sessionId = searchParams.get('session_id');
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          window.location.href = '/dashboard';
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const productNames: Record<string, string> = {
    impressum: 'Impressum',
    starter: 'Starter',
    professional: 'Professional',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 to-black text-white flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center">

        {/* Success Animation */}
        <div className="text-8xl mb-6 animate-bounce">🎉</div>

        <h1 className="text-4xl font-bold text-white mb-4">
          Zahlung erfolgreich!
        </h1>

        <p className="text-xl text-gray-300 mb-2">
          Willkommen bei Dataquard {productNames[product] || product}!
        </p>

        <p className="text-gray-400 mb-8">
          Eine Bestätigung wurde an Ihre E-Mail-Adresse gesendet.
        </p>

        {/* What's next */}
        <div className="bg-indigo-900 bg-opacity-50 border border-indigo-700 rounded-xl p-6 mb-8 text-left">
          <h2 className="text-white font-bold text-lg mb-4">✅ Was jetzt?</h2>
          <ul className="space-y-3">
            {product === 'impressum' ? (
              <>
                <li className="flex items-start gap-3 text-gray-300">
                  <span className="text-green-400 mt-0.5">1.</span>
                  <span>Ihr Impressum ist freigeschaltet – jetzt herunterladen</span>
                </li>
                <li className="flex items-start gap-3 text-gray-300">
                  <span className="text-green-400 mt-0.5">2.</span>
                  <span>HTML-Snippet in Ihre Website einbinden</span>
                </li>
                <li className="flex items-start gap-3 text-gray-300">
                  <span className="text-green-400 mt-0.5">3.</span>
                  <span>Fertig – rechtlich abgesichert! 🔒</span>
                </li>
              </>
            ) : (
              <>
                <li className="flex items-start gap-3 text-gray-300">
                  <span className="text-green-400 mt-0.5">1.</span>
                  <span>Website scannen und Ampel-Score anzeigen</span>
                </li>
                <li className="flex items-start gap-3 text-gray-300">
                  <span className="text-green-400 mt-0.5">2.</span>
                  <span>Datenschutzerklärung generieren & herunterladen</span>
                </li>
                <li className="flex items-start gap-3 text-gray-300">
                  <span className="text-green-400 mt-0.5">3.</span>
                  <span>Impressum erstellen und einbinden</span>
                </li>
                <li className="flex items-start gap-3 text-gray-300">
                  <span className="text-green-400 mt-0.5">4.</span>
                  <span>Automatische Updates bei Gesetzesänderungen</span>
                </li>
              </>
            )}
          </ul>
        </div>

        {/* CTA Buttons */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {product === 'impressum' ? (
            <>
              <a
                href="/impressum-generator"
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-xl transition-all"
              >
                📄 Impressum herunterladen
              </a>
              <a
                href="/scanner"
                className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-4 rounded-xl transition-all"
              >
                🔍 Website scannen
              </a>
            </>
          ) : (
            <>
              <a
                href="/scanner"
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-xl transition-all"
              >
                🔍 Scanner starten
              </a>
              <a
                href="/dashboard"
                className="bg-green-600 hover:bg-green-500 text-white font-bold py-4 rounded-xl transition-all"
              >
                📊 Dashboard
              </a>
            </>
          )}
        </div>

        <p className="text-gray-500 text-sm">
          Sie werden in {countdown} Sekunden weitergeleitet...
        </p>

      </div>
    </div>
  );
}

export default function CheckoutSuccess() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 to-black text-white flex items-center justify-center">
        <div className="text-4xl">⏳</div>
      </div>
    }>
      <SuccessInner />
    </Suspense>
  );
}
