'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { PageWrapper } from '../components/PageWrapper';

const G = {
  green: '#22c55e',
  greenBg: 'rgba(34,197,94,0.08)',
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

export default function AuthPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) setIsAuthenticated(true);
    };
    checkAuth();
  }, []);

  useEffect(() => {
    if (isAuthenticated) router.push('/dashboard');
  }, [isAuthenticated, router]);

  const handleResetPassword = async () => {
    if (!email) { setError('Bitte E-Mail-Adresse eingeben'); return; }
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) { setError(error.message); } else { setResetSent(true); setError(''); }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) { setError(error.message); } else { setIsAuthenticated(true); }
    } catch { setError('Ein Fehler ist beim Anmelden aufgetreten'); }
    finally { setIsLoading(false); }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) { setError(error.message); } else { setIsAuthenticated(true); }
    } catch { setError('Ein Fehler ist bei der Registrierung aufgetreten'); }
    finally { setIsLoading(false); }
  };

  if (isAuthenticated) return null;

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
            <p style={{ color: G.textSec, fontSize: 14 }}>Datenschutz-Compliance für Schweizer KMUs</p>
          </div>

          <div style={{ background: G.bgWhite, border: `1px solid ${G.border}`, borderRadius: 16, padding: 32, boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20, color: G.text }}>
              {isSignUp ? 'Konto erstellen' : 'Anmelden'}
            </h2>

            {error && (
              <div style={{ background: G.redBg, border: `1px solid ${G.redBorder}`, color: G.red, padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontSize: 13 }}>
                {error}
              </div>
            )}

            <form onSubmit={isSignUp ? handleSignUp : handleSignIn} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: G.textSec, marginBottom: 6 }}>E-Mail</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="ihre@email.com" style={inputStyle} required />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: G.textSec, marginBottom: 6 }}>Passwort</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" style={inputStyle} required />
              </div>
              <button type="submit" disabled={isLoading} style={{ width: '100%', padding: '12px', background: G.green, color: '#fff', fontWeight: 700, border: 'none', borderRadius: 8, fontSize: 14, cursor: isLoading ? 'not-allowed' : 'pointer', opacity: isLoading ? 0.7 : 1, marginTop: 4 }}>
                {isLoading ? 'Wird geladen…' : isSignUp ? 'Registrieren' : 'Anmelden'}
              </button>
            </form>

            {!isSignUp && (
              <div style={{ marginTop: 14, textAlign: 'center' }}>
                {resetSent ? (
                  <p style={{ color: G.green, fontSize: 13 }}>E-Mail gesendet – bitte prüfen Sie Ihren Posteingang.</p>
                ) : (
                  <button type="button" onClick={handleResetPassword} style={{ color: G.textMuted, fontSize: 13, background: 'none', border: 'none', cursor: 'pointer' }}>
                    Passwort vergessen?
                  </button>
                )}
              </div>
            )}

            <div style={{ marginTop: 14, textAlign: 'center' }}>
              <button onClick={() => { setIsSignUp(!isSignUp); setError(''); setEmail(''); setPassword(''); setResetSent(false); }} style={{ color: G.green, fontSize: 13, fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>
                {isSignUp ? 'Bereits ein Konto? Anmelden' : 'Noch kein Konto? Registrieren'}
              </button>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: 20 }}>
            <Link href="/" style={{ color: G.textMuted, fontSize: 13, textDecoration: 'none' }}>← Zurück zur Startseite</Link>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
