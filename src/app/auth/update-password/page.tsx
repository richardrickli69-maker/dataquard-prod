'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { PageWrapper } from '../../components/PageWrapper';

const G = {
  green: '#22c55e',
  bg: '#f8f9fb',
  bgWhite: '#ffffff',
  bgLight: '#f1f2f6',
  border: '#e2e4ea',
  text: '#1a1a2e',
  textSec: '#555566',
  textMuted: '#888899',
  red: '#dc2626',
  redBg: 'rgba(220,38,38,0.06)',
  redBorder: 'rgba(220,38,38,0.15)',
};

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    // Supabase Auth Event Listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') {
        setReady(true);
      }
    });

    // Session-Check (PKCE Flow — Code wurde serverseitig getauscht)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setReady(true);
      } else {
        // Kein Session gefunden — 5 Sekunden warten, dann nochmal prüfen
        timeoutId = setTimeout(async () => {
          const { data: { session: retrySession } } = await supabase.auth.getSession();
          if (retrySession) {
            setReady(true);
          } else {
            // Endgültig keine Session — Benutzer zurück zum Login schicken
            console.error('[update-password] Keine Session nach Timeout — Redirect zu /auth');
            window.location.href = '/auth?error=session_expired';
          }
        }, 5000);
      }
    });

    return () => {
      subscription.unsubscribe();
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) { setError('Passwort muss mindestens 6 Zeichen haben'); return; }
    if (password !== confirm) { setError('Passwörter stimmen nicht überein'); return; }
    setIsLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setIsLoading(false);
    if (error) { setError(error.message); }
    else {
      setSuccess(true);
      setTimeout(() => router.push('/dashboard'), 2000);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 14px', background: G.bgLight,
    border: `1px solid ${G.border}`, borderRadius: 8, color: G.text,
    fontSize: 14, outline: 'none', boxSizing: 'border-box',
  };

  return (
    <PageWrapper>
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 24px' }}>
        <div style={{ width: '100%', maxWidth: 420 }}>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 6, color: G.text }}>🔐 Dataquard</h1>
            <p style={{ color: G.textSec, fontSize: 14 }}>Neues Passwort setzen</p>
          </div>

          <div style={{ background: G.bgWhite, border: `1px solid ${G.border}`, borderRadius: 16, padding: 32, boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
            {success ? (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
                <p style={{ color: G.green, fontWeight: 700, fontSize: 16 }}>Passwort gespeichert!</p>
                <p style={{ color: G.textMuted, fontSize: 13, marginTop: 6 }}>Sie werden zum Dashboard weitergeleitet…</p>
              </div>
            ) : !ready ? (
              <div style={{ textAlign: 'center', color: G.textMuted, fontSize: 14 }}>
                <div style={{ width: 36, height: 36, border: `3px solid ${G.border}`, borderTopColor: G.green, borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                Sitzung wird verifiziert…
              </div>
            ) : (
              <>
                <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20, color: G.text }}>Neues Passwort</h2>
                {error && (
                  <div style={{ background: G.redBg, border: `1px solid ${G.redBorder}`, color: G.red, padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontSize: 13 }}>
                    {error}
                  </div>
                )}
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: G.textSec, marginBottom: 6 }}>Neues Passwort</label>
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Mindestens 6 Zeichen" style={inputStyle} required />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: G.textSec, marginBottom: 6 }}>Passwort bestätigen</label>
                    <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Passwort wiederholen" style={inputStyle} required />
                  </div>
                  <button type="submit" disabled={isLoading} style={{ width: '100%', padding: '12px', background: G.green, color: '#fff', fontWeight: 700, border: 'none', borderRadius: 8, fontSize: 14, cursor: isLoading ? 'not-allowed' : 'pointer', opacity: isLoading ? 0.7 : 1, marginTop: 4 }}>
                    {isLoading ? 'Wird gespeichert…' : 'Passwort speichern'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
