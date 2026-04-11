'use client';
// Checkout-Button für Agency-Pläne auf /fuer-agenturen
// Holt Supabase-Session und startet Stripe Checkout

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

interface AgencyCheckoutButtonProps {
  plan: 'agency_basic' | 'agency_pro' | 'advokatur';
  label: string;
  highlight: boolean;
  green: string;
  white: string;
}

export default function AgencyCheckoutButton({ plan, label, highlight, green, white }: AgencyCheckoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product: plan,
          userId:    session?.user?.id    ?? null,
          userEmail: session?.user?.email ?? null,
        }),
      });
      const json = await res.json() as { url?: string; error?: string };
      if (json.url) {
        window.location.href = json.url;
      } else {
        setError(json.error ?? 'Fehler beim Starten der Zahlung');
        setLoading(false);
      }
    } catch {
      setError('Verbindungsfehler. Bitte erneut versuchen.');
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        onClick={handleClick}
        disabled={loading}
        style={{
          display: 'block',
          width: '100%',
          padding: '13px',
          borderRadius: '12px',
          background:   loading ? '#aaa' : highlight ? green : 'transparent',
          border:       highlight ? 'none' : `2px solid ${green}`,
          color:        highlight ? white  : green,
          fontWeight:   700,
          fontSize:     '15px',
          cursor:       loading ? 'not-allowed' : 'pointer',
          textAlign:    'center',
          textDecoration: 'none',
          transition:   'opacity 0.15s',
        }}
      >
        {loading ? 'Weiterleitung…' : label}
      </button>
      {error && (
        <p style={{ fontSize: '12px', color: '#dc2626', marginTop: '6px', textAlign: 'center' }}>
          {error}
        </p>
      )}
    </div>
  );
}
