'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

function SuccessInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const product = searchParams.get('product');
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (!sessionId) return;

    if (product === 'impressum') {
      // Redirect to Impressum Generator with paid flag
      const timer = setTimeout(() => {
        router.push(`/impressum-generator?paid=true&session_id=${sessionId}`);
      }, 2500);
      return () => clearTimeout(timer);
    } else {
      // Starter or Professional → Dashboard
      const timer = setTimeout(() => {
        router.push('/dashboard');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [sessionId, product, router]);

  const isImpressum = product === 'impressum';

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 to-black text-white flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">

        {/* Success Icon */}
        <div className="text-8xl mb-6 animate-bounce">✅</div>

        <h1 className="text-4xl font-bold mb-4">Zahlung erfolgreich!</h1>

        <p className="text-gray-300 text-lg mb-8">
          {isImpressum
            ? 'Ihr Impressum wird jetzt freigeschaltet. Sie werden in Kürze weitergeleitet...'
            : 'Ihr Dataquard-Zugang ist aktiv. Sie werden zum Dashboard weitergeleitet...'}
        </p>

        {/* Product Info */}
        <div className="bg-indigo-900 bg-opacity-50 border border-indigo-700 rounded-xl p-6 mb-8 text-left">
          <h2 className="font-bold text-white mb-3">
            {isImpressum ? '📄 Impressum' : product === 'starter' ? '⭐ Dataquard Starter' : '🚀 Dataquard Professional'}
          </h2>
          <ul className="space-y-2 text-sm text-gray-300">
            {isImpressum ? (
              <>
                <li className="flex gap-2"><span className="text-green-400">✓</span>Sofort-Download freigeschaltet</li>
                <li className="flex gap-2"><span className="text-green-400">✓</span>nDSG / TMG-konform</li>
                <li className="flex gap-2"><span className="text-green-400">✓</span>Für Schweiz & Deutschland</li>
              </>
            ) : (
              <>
                <li className="flex gap-2"><span className="text-green-400">✓</span>Datenschutzerklärung aktiviert</li>
                <li className="flex gap-2"><span className="text-green-400">✓</span>Automatische Updates bei Gesetzesänderungen</li>
                <li className="flex gap-2"><span className="text-green-400">✓</span>Dashboard-Zugang freigeschaltet</li>
              </>
            )}
          </ul>
        </div>

        {/* Loading Spinner */}
        <div className="flex items-center justify-center gap-3 text-gray-400">
          <svg className="animate-spin h-5 w-5 text-indigo-400" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          <span className="text-sm">
            {isImpressum ? 'Weiterleitung zum Impressum Generator...' : 'Weiterleitung zum Dashboard...'}
          </span>
        </div>

        {/* Manual Link */}
        <div className="mt-6">
          <a
            href={isImpressum ? `/impressum-generator?paid=true&session_id=${sessionId}` : '/dashboard'}
            className="text-indigo-400 hover:text-indigo-300 text-sm underline"
          >
            Nicht weitergeleitet? Hier klicken →
          </a>
        </div>

      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 to-black text-white flex items-center justify-center">
        <div className="text-4xl animate-bounce">✅</div>
      </div>
    }>
      <SuccessInner />
    </Suspense>
  );
}
