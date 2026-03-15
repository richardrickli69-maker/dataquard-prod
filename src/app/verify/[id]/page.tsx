// src/app/verify/[id]/page.task.tsx
// ÄNDERUNG: Dunkler Indigo/Purple-Hintergrund → #f8f9fb (Light)
// Karten bleiben weiß – nur outer background geändert
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
    <div style={{ minHeight: '100vh', background: '#f8f9fb', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 16px' }}>
      <div style={{ width: '100%', maxWidth: 420 }}>

        {!badge ? (
          <div style={{ background: '#ffffff', borderRadius: 20, padding: 32, textAlign: 'center', border: '3px solid #dc2626', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
            <img src="/logo.png" alt="Dataquard" style={{ maxWidth: 120, margin: '0 auto 16px', display: 'block' }} />
            <p style={{ color: '#dc2626', fontSize: 18, fontWeight: 700, marginBottom: 8 }}>❌ Badge nicht gefunden</p>
            <p style={{ color: '#555566', fontSize: 13, marginBottom: 20 }}>
              Dieser Verifizierungs-Link ist ungültig oder wurde widerrufen.
            </p>
            <Link href="/" style={{ color: '#22c55e', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
              ← Zur Startseite
            </Link>
          </div>
        ) : (
          <div style={{ background: '#ffffff', borderRadius: 20, boxShadow: '0 4px 24px rgba(0,0,0,0.06)', border: `3px solid ${isValid ? '#22c55e' : '#e2e4ea'}`, overflow: 'hidden' }}>

            {/* Top bar */}
            <div style={{ height: 4, width: '100%', background: isValid ? '#22c55e' : '#e2e4ea' }} />

            <div style={{ padding: 32, textAlign: 'center' }}>

              {/* Logo – margin-top erhöht damit Logo nicht abgeschnitten */}
              <img
                src="/logo.png"
                alt="Dataquard"
                style={{ maxWidth: 140, height: 'auto', margin: '8px auto 16px', display: 'block', objectFit: 'contain' }}
              />

              <p style={{ fontSize: 18, fontWeight: 700, marginBottom: 4, color: isValid ? '#22c55e' : '#888899' }}>
                {isValid ? '✓ Verified Badge' : '✗ Badge abgelaufen'}
              </p>
              <p style={{ color: '#888899', fontSize: 12, marginBottom: 20 }}>
                {isValid
                  ? 'Diese Website wurde auf DSGVO/nDSG-Compliance geprüft'
                  : 'Die Verifikation ist nicht mehr gültig'}
              </p>

              <div style={{ height: 1, background: isValid ? 'rgba(34,197,94,0.15)' : '#e2e4ea', marginBottom: 20 }} />

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 13, textAlign: 'left' }}>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#888899', fontWeight: 500 }}>Website</span>
                  <a href={badge.website_url} target="_blank" rel="noopener noreferrer"
                    style={{ color: '#22c55e', fontWeight: 600, textDecoration: 'none', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                    title={badge.website_url}>
                    {badge.website_url.replace(/^https?:\/\//, '')}
                  </a>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#888899', fontWeight: 500 }}>Ausgestellt am</span>
                  <span style={{ color: '#1a1a2e', fontWeight: 600 }}>
                    {new Date(badge.issued_at).toLocaleDateString('de-CH', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#888899', fontWeight: 500 }}>Gültig bis</span>
                  <span style={{ fontWeight: 600, color: isExpired ? '#dc2626' : '#1a1a2e' }}>
                    {badge.expires_at
                      ? new Date(badge.expires_at).toLocaleDateString('de-CH', { day: '2-digit', month: '2-digit', year: 'numeric' })
                      : 'Unbegrenzt'}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#888899', fontWeight: 500 }}>Status</span>
                  <span style={{ padding: '3px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: isValid ? 'rgba(34,197,94,0.1)' : 'rgba(220,38,38,0.08)', color: isValid ? '#22c55e' : '#dc2626' }}>
                    {isValid ? '● Aktiv' : '● Inaktiv'}
                  </span>
                </div>

              </div>

              <div style={{ height: 1, background: '#e2e4ea', margin: '20px 0' }} />

              <p style={{ color: '#888899', fontSize: 11, marginBottom: 8 }}>Verifiziert durch</p>
              <Link href="/" style={{ color: '#22c55e', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
                <img src="/icon-schutz.png" alt="Schutz" width={16} height={16} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: 4 }} />dataquard.ch
              </Link>
              <p style={{ marginTop: 12 }}>
                <Link href="/" style={{ color: '#888899', fontSize: 12, textDecoration: 'none' }}>← Zur Startseite</Link>
              </p>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
