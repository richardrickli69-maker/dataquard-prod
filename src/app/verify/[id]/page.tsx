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
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-black flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">

        {!badge ? (
          /* Badge nicht gefunden */
          <div className="bg-white rounded-2xl shadow-2xl p-8 text-center border-4 border-red-400">
            <img src="/logo.png" alt="Dataquard" className="mx-auto mb-4" style={{ maxWidth: '120px' }} />
            <p className="text-red-500 text-xl font-bold mb-2">❌ Badge nicht gefunden</p>
            <p className="text-gray-500 text-sm mb-6">
              Dieser Verifizierungs-Link ist ungültig oder wurde widerrufen.
            </p>
            <Link href="/" className="text-indigo-600 hover:text-indigo-800 text-sm font-semibold transition">
              ← Zur Startseite
            </Link>
          </div>
        ) : (
          /* Badge gefunden */
          <div className={`bg-white rounded-2xl shadow-2xl border-4 ${isValid ? 'border-green-400' : 'border-gray-300'} overflow-hidden`}>

            {/* Top bar */}
            <div className={`h-2 w-full ${isValid ? 'bg-green-400' : 'bg-gray-300'}`} />

            <div className="p-8 text-center">

              {/* Logo */}
              <img
                src="/logo.png"
                alt="Dataquard"
                className="mx-auto mb-4 object-contain"
                style={{ maxWidth: '150px', height: 'auto' }}
              />

              {/* Status */}
              <p className={`text-xl font-bold mb-1 ${isValid ? 'text-green-600' : 'text-gray-400'}`}>
                {isValid ? '✓ Verified Badge' : '✗ Badge abgelaufen'}
              </p>
              <p className="text-gray-500 text-xs mb-6">
                {isValid
                  ? 'Diese Website wurde auf DSGVO/nDSG-Compliance geprüft'
                  : 'Die Verifikation ist nicht mehr gültig'}
              </p>

              {/* Divider */}
              <div className={`h-px w-full mb-6 ${isValid ? 'bg-green-100' : 'bg-gray-100'}`} />

              {/* Badge-Infos */}
              <div className="space-y-3 text-sm">

                <div className="flex justify-between items-center">
                  <span className="text-gray-400 font-medium">Website</span>
                  <a
                    href={badge.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 font-semibold hover:text-indigo-800 transition truncate ml-4 max-w-[220px]"
                    title={badge.website_url}
                  >
                    {badge.website_url.replace(/^https?:\/\//, '')}
                  </a>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-400 font-medium">Ausgestellt am</span>
                  <span className="text-gray-700 font-semibold">
                    {new Date(badge.issued_at).toLocaleDateString('de-CH', {
                      day: '2-digit', month: '2-digit', year: 'numeric'
                    })}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-400 font-medium">Gültig bis</span>
                  <span className={`font-semibold ${isExpired ? 'text-red-500' : 'text-gray-700'}`}>
                    {badge.expires_at
                      ? new Date(badge.expires_at).toLocaleDateString('de-CH', {
                          day: '2-digit', month: '2-digit', year: 'numeric'
                        })
                      : 'Unbegrenzt'}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-400 font-medium">Status</span>
                  <span className={`px-3 py-0.5 rounded-full text-xs font-bold ${
                    isValid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                  }`}>
                    {isValid ? '● Aktiv' : '● Inaktiv'}
                  </span>
                </div>

              </div>

              {/* Divider */}
              <div className="h-px w-full my-6 bg-gray-100" />

              {/* Footer */}
              <p className="text-gray-400 text-xs mb-3">Verifiziert durch</p>
              <Link
                href="/"
                className="text-indigo-600 hover:text-indigo-800 font-bold text-sm transition"
              >
                🛡️ dataquard.ch
              </Link>
              <p className="mt-4">
                <Link href="/" className="text-gray-400 hover:text-gray-600 text-xs transition">
                  ← Zur Startseite
                </Link>
              </p>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
