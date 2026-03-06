// src/app/verify/[id]/page.tsx
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

interface Props {
  params: Promise<{ id: string }>;
}

async function getBadge(id: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
  const { data } = await supabase
    .from('verified_badges')
    .select('id, website_url, issued_at, expires_at, is_active')
    .eq('id', id)
    .single();
  return data;
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const badge = await getBadge(id);
  return {
    title: badge
      ? `Verifiziert: ${badge.website_url} – Dataquard`
      : 'Badge nicht gefunden – Dataquard',
  };
}

export default async function VerifyPage({ params }: Props) {
  const { id } = await params;
  const badge = await getBadge(id);

  const now = new Date();
  const isExpired = badge?.expires_at && new Date(badge.expires_at) < now;
  const isValid = badge?.is_active && !isExpired;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-black text-white flex flex-col">

      {/* Header */}
      <header className="border-b border-indigo-800 px-6 py-4">
        <div className="max-w-2xl mx-auto flex justify-between items-center">
          <Link href="/" className="text-xl font-bold text-white hover:text-indigo-300 transition">
            🛡️ Dataquard
          </Link>
          <Link href="/" className="text-indigo-400 hover:text-indigo-300 text-sm transition">
            Zur Startseite →
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="max-w-lg w-full">

          {!badge ? (
            /* Badge nicht gefunden */
            <div className="bg-red-900 bg-opacity-30 border border-red-600 rounded-2xl p-10 text-center">
              <div className="text-6xl mb-4">❌</div>
              <h1 className="text-2xl font-bold text-red-300 mb-2">Badge nicht gefunden</h1>
              <p className="text-gray-400">
                Dieser Verifizierungs-Link ist ungültig oder wurde widerrufen.
              </p>
            </div>
          ) : (
            /* Badge gefunden */
            <div className={`rounded-2xl p-1 ${isValid ? 'bg-gradient-to-br from-green-500 to-emerald-600' : 'bg-gradient-to-br from-gray-600 to-gray-700'}`}>
              <div className="bg-indigo-950 rounded-xl p-8 text-center">

                {/* Status Icon */}
                <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-6 ${isValid ? 'bg-green-500 bg-opacity-20' : 'bg-gray-600 bg-opacity-20'}`}>
                  {isValid ? (
                    <svg className="w-10 h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  ) : (
                    <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  )}
                </div>

                {/* Headline */}
                <h1 className={`text-2xl font-bold mb-2 ${isValid ? 'text-green-300' : 'text-gray-400'}`}>
                  {isValid ? '✓ Dataquard-verifiziert' : 'Badge abgelaufen oder inaktiv'}
                </h1>

                <p className="text-gray-400 text-sm mb-8">
                  {isValid
                    ? 'Diese Website wurde auf DSGVO/nDSG-Compliance geprüft.'
                    : 'Die Verifikation ist nicht mehr gültig.'}
                </p>

                {/* Website */}
                <div className="bg-indigo-900 bg-opacity-50 border border-indigo-700 rounded-xl p-4 mb-6">
                  <p className="text-gray-400 text-xs mb-1">Verifizierte Website</p>
                  <a
                    href={badge.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-300 font-semibold text-lg hover:text-indigo-200 transition break-all"
                  >
                    {badge.website_url}
                  </a>
                </div>

                {/* Details */}
                <div className="grid grid-cols-2 gap-4 mb-8 text-sm">
                  <div className="bg-indigo-900 bg-opacity-30 rounded-lg p-3">
                    <p className="text-gray-400 text-xs mb-1">Ausgestellt am</p>
                    <p className="text-white font-semibold">
                      {new Date(badge.issued_at).toLocaleDateString('de-CH', {
                        day: '2-digit', month: '2-digit', year: 'numeric'
                      })}
                    </p>
                  </div>
                  <div className="bg-indigo-900 bg-opacity-30 rounded-lg p-3">
                    <p className="text-gray-400 text-xs mb-1">Gültig bis</p>
                    <p className={`font-semibold ${isExpired ? 'text-red-400' : 'text-white'}`}>
                      {badge.expires_at
                        ? new Date(badge.expires_at).toLocaleDateString('de-CH', {
                          day: '2-digit', month: '2-digit', year: 'numeric'
                        })
                        : 'Unbegrenzt'}
                    </p>
                  </div>
                </div>

                {/* Badge Image Preview */}
                <div className="flex justify-center mb-6">
                  <img
                    src={`/api/badges/${badge.id}/image`}
                    alt="Dataquard Verified Badge"
                    width={200}
                    height={120}
                    className="rounded-lg shadow-lg"
                  />
                </div>

                {/* Powered by */}
                <div className="border-t border-indigo-800 pt-6">
                  <p className="text-gray-500 text-xs mb-2">Verifiziert durch</p>
                  <Link href="/" className="text-indigo-400 hover:text-indigo-300 font-semibold transition">
                    🛡️ Dataquard – Website Compliance
                  </Link>
                </div>

              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-indigo-800 px-6 py-6">
        <div className="max-w-2xl mx-auto flex justify-center gap-6 text-sm text-gray-500">
          <Link href="/impressum" className="hover:text-indigo-300 transition">Impressum</Link>
          <Link href="/datenschutz" className="hover:text-indigo-300 transition">Datenschutz</Link>
          <Link href="/" className="hover:text-indigo-300 transition">Dataquard</Link>
        </div>
      </footer>

    </div>
  );
}
