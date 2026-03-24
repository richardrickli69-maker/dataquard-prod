'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { PageWrapper } from '../components/PageWrapper';

const G = {
  green: '#22c55e',
  greenBg: 'rgba(34,197,94,0.08)',
  greenBorder: 'rgba(34,197,94,0.25)',
  bgWhite: '#ffffff',
  bgLight: '#f1f2f6',
  border: '#e2e4ea',
  text: '#1a1a2e',
  textSec: '#555566',
  textMuted: '#888899',
};

interface ImpressumData {
  firmaName: string; rechtsform: string; strasse: string; plz: string;
  ort: string; land: string; email: string; telefon: string; website: string;
  geschaeftsfuehrer: string; handelsregister: boolean; registergericht: string;
  registernummer: string; mwstNummer: string; uid: string;
  rechtsraum: 'CH' | 'DE' | 'AT' | 'BOTH';
}

const defaultData: ImpressumData = {
  firmaName: '', rechtsform: 'Einzelunternehmen', strasse: '', plz: '', ort: '',
  land: 'Schweiz', email: '', telefon: '', website: '', geschaeftsfuehrer: '',
  handelsregister: false, registergericht: '', registernummer: '', mwstNummer: '',
  uid: '', rechtsraum: 'CH',
};

const rechtsformen = ['Einzelunternehmen','GmbH','AG','Kollektivgesellschaft','Kommanditgesellschaft','Genossenschaft','Verein','Stiftung'];

function generateImpressumText(data: ImpressumData): string {
  const lines: string[] = [];
  lines.push('Impressum', '');
  lines.push(`${data.firmaName}${data.rechtsform !== 'Einzelunternehmen' ? ` ${data.rechtsform}` : ''}`);
  lines.push(data.strasse, `${data.plz} ${data.ort}`, data.land, '');
  if (data.telefon) lines.push(`Telefon: ${data.telefon}`);
  lines.push(`E-Mail: ${data.email}`);
  if (data.website) lines.push(`Website: ${data.website}`);
  lines.push('');
  if (data.geschaeftsfuehrer) {
    if (data.rechtsform === 'AG') lines.push(`Verwaltungsratspräsident: ${data.geschaeftsfuehrer}`);
    else if (data.rechtsform === 'GmbH') lines.push(`Geschäftsführer: ${data.geschaeftsfuehrer}`);
    else lines.push(`Verantwortlich: ${data.geschaeftsfuehrer}`);
    lines.push('');
  }
  if (data.handelsregister && data.registernummer) {
    lines.push('Handelsregistereintrag:');
    if (data.rechtsraum === 'DE' || data.rechtsraum === 'AT') {
      lines.push('Eingetragen im Handelsregister');
      if (data.registergericht) lines.push(`Registergericht: ${data.registergericht}`);
      lines.push(`Registernummer: ${data.registernummer}`);
    } else { lines.push(`UID: ${data.registernummer}`); }
    lines.push('');
  }
  if (data.uid && data.rechtsraum === 'CH') { lines.push(`UID: ${data.uid}`, ''); }
  if (data.mwstNummer) {
    lines.push(data.rechtsraum === 'CH' ? `MWST-Nr.: ${data.mwstNummer}` : `Umsatzsteuer-Identifikationsnummer: ${data.mwstNummer}`, '');
  }
  if (data.rechtsraum === 'CH') {
    lines.push('Haftungsausschluss:', 'Die Inhalte dieser Website wurden mit grösstmöglicher Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen. Als Diensteanbieter sind wir für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich.');
  } else if (data.rechtsraum === 'BOTH') {
    lines.push('Haftungsausschluss (Schweiz – nDSG):', 'Die Inhalte dieser Website wurden mit grösstmöglicher Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen. Als Diensteanbieter sind wir für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich.', '', 'Haftungsausschluss (Deutschland – TMG):', 'Die Inhalte unserer Seiten wurden mit größter Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen. Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich.');
  } else {
    lines.push('Haftungsausschluss:', 'Die Inhalte unserer Seiten wurden mit größter Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen. Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich.');
  }
  return lines.join('\n');
}

const inputStyle: React.CSSProperties = { width: '100%', background: G.bgLight, border: `1px solid ${G.border}`, borderRadius: 8, padding: '10px 14px', color: G.text, fontSize: 14, outline: 'none', boxSizing: 'border-box' };
const labelStyle: React.CSSProperties = { display: 'block', fontSize: 13, fontWeight: 500, color: G.textSec, marginBottom: 6 };

function ImpressumGeneratorInner() {
  const searchParams = useSearchParams();
  const [data, setData] = useState<ImpressumData>(defaultData);
  const [step, setStep] = useState(1);
  const [isPaid, setIsPaid] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const checkBilling = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;
      const { data: billing } = await supabase.from('subscriptions').select('id').eq('user_id', session.user.id).eq('status', 'active').limit(1).maybeSingle();
      if (billing) setIsPaid(true);
    };
    checkBilling();
  }, []);

  useEffect(() => {
    const domain = searchParams.get('domain');
    const jurisdiction = searchParams.get('jurisdiction');
    if (domain) {
      const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/\/$/, '');
      setData(prev => ({ ...prev, website: `https://${cleanDomain}`, rechtsraum: jurisdiction === 'DSGVO' ? 'DE' : 'CH' }));
    }
  }, [searchParams]);

  const update = (field: keyof ImpressumData, value: string | boolean) => setData(prev => ({ ...prev, [field]: value }));
  const isStep1Valid = data.firmaName && data.strasse && data.plz && data.ort && data.email;
  const isStep2Valid = data.geschaeftsfuehrer;
  const impressumText = generateImpressumText(data);

  const handleCopy = () => { navigator.clipboard.writeText(impressumText); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  const handleDownload = () => {
    if (!isPaid) { window.location.href = '/checkout?product=impressum'; return; }
    const blob = new Blob([impressumText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'impressum.txt'; a.click();
    URL.revokeObjectURL(url);
  };

  const card: React.CSSProperties = { background: G.bgWhite, border: `1px solid ${G.border}`, borderRadius: 14, padding: 32 };
  const btnPrimary = (disabled?: boolean): React.CSSProperties => ({ background: disabled ? G.bgLight : G.green, color: disabled ? G.textMuted : '#fff', fontWeight: 700, padding: '12px', borderRadius: 8, border: 'none', cursor: disabled ? 'not-allowed' : 'pointer', fontSize: 14, width: '100%' });
  const btnSecondary: React.CSSProperties = { background: G.bgLight, border: `1px solid ${G.border}`, color: G.textSec, fontWeight: 700, padding: '12px', borderRadius: 8, cursor: 'pointer', fontSize: 14 };

  const stepStyle = (active: boolean): React.CSSProperties => ({
    width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 13, fontWeight: 700, border: '2px solid', transition: 'all 0.2s',
    background: active ? G.green : G.bgLight, borderColor: active ? G.green : G.border, color: active ? '#fff' : G.textMuted,
  });

  const rechtsraumBtn = (r: string, active: boolean): React.CSSProperties => ({
    padding: '10px', borderRadius: 8, border: '2px solid', fontWeight: 600, fontSize: 13, cursor: 'pointer', transition: 'all 0.2s',
    borderColor: active ? G.green : G.border, background: active ? G.greenBg : G.bgLight, color: active ? G.green : G.textSec,
  });

  return (
    <PageWrapper>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ display: 'inline-block', background: G.greenBg, border: `1px solid ${G.greenBorder}`, color: G.green, fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 20, marginBottom: 12, letterSpacing: 1 }}>NEU</div>
          <h1 style={{ fontSize: 30, fontWeight: 800, color: G.text, marginBottom: 8 }}>📄 Impressum Generator</h1>
          <p style={{ color: G.textSec, fontSize: 15 }}>Erstelle in 2 Minuten ein rechtssicheres Impressum für die Schweiz oder Deutschland.</p>
          {searchParams.get('domain') && (
            <div style={{ marginTop: 12, display: 'inline-flex', alignItems: 'center', gap: 8, background: G.greenBg, border: `1px solid ${G.greenBorder}`, color: G.green, padding: '8px 16px', borderRadius: 8, fontSize: 13 }}>
              ✅ Domain aus Scan vorausgefüllt: <strong>{searchParams.get('domain')}</strong>
            </div>
          )}
        </div>

        {/* Step Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 28, gap: 0 }}>
          {[1, 2, 3].map(s => (
            <div key={s} style={{ display: 'flex', alignItems: 'center' }}>
              <div style={stepStyle(step >= s)}>{step > s ? '✓' : s}</div>
              {s < 3 && <div style={{ width: 64, height: 2, background: step > s ? G.green : G.border }} />}
            </div>
          ))}
        </div>

        {/* Step 1 */}
        {step === 1 && (
          <div style={card}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: G.text, marginBottom: 20 }}>Schritt 1: Firmen- &amp; Kontaktangaben</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={labelStyle}>Firmenname / Ihr Name *</label>
                  <input type="text" value={data.firmaName} onChange={e => update('firmaName', e.target.value)} placeholder="Muster GmbH" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Rechtsform *</label>
                  <select value={data.rechtsform} onChange={e => update('rechtsform', e.target.value)} style={inputStyle}>
                    {rechtsformen.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label style={labelStyle}>Strasse &amp; Hausnummer *</label>
                <input type="text" value={data.strasse} onChange={e => update('strasse', e.target.value)} placeholder="Musterstrasse 1" style={inputStyle} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>PLZ *</label>
                  <input type="text" value={data.plz} onChange={e => update('plz', e.target.value)} placeholder="4001" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Ort *</label>
                  <input type="text" value={data.ort} onChange={e => update('ort', e.target.value)} placeholder="Basel" style={inputStyle} />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Rechtsraum *</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                  {(['CH', 'DE', 'BOTH'] as const).map(r => (
                    <button key={r} onClick={() => update('rechtsraum', r)} style={rechtsraumBtn(r, data.rechtsraum === r)}>
                      {r === 'CH' ? '🇨🇭 Schweiz' : r === 'DE' ? '🇩🇪 Deutschland' : '🇨🇭🇩🇪 Beide'}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={labelStyle}>E-Mail *</label>
                  <input type="email" value={data.email} onChange={e => update('email', e.target.value)} placeholder="info@firma.ch" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Telefon</label>
                  <input type="text" value={data.telefon} onChange={e => update('telefon', e.target.value)} placeholder="+41 61 000 00 00" style={inputStyle} />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Website</label>
                <input type="text" value={data.website} onChange={e => update('website', e.target.value)} placeholder="https://www.firma.ch" style={inputStyle} />
              </div>
            </div>
            <button onClick={() => setStep(2)} disabled={!isStep1Valid} style={{ ...btnPrimary(!isStep1Valid), marginTop: 20 }}>Weiter →</button>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div style={card}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: G.text, marginBottom: 20 }}>Schritt 2: Verantwortliche Person &amp; Register</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={labelStyle}>{data.rechtsform === 'AG' ? 'Verwaltungsratspräsident' : 'Geschäftsführer / Inhaber'} *</label>
                <input type="text" value={data.geschaeftsfuehrer} onChange={e => update('geschaeftsfuehrer', e.target.value)} placeholder="Max Muster" style={inputStyle} />
              </div>
              {data.rechtsraum === 'CH' && (
                <div>
                  <label style={labelStyle}>UID-Nummer (falls vorhanden)</label>
                  <input type="text" value={data.uid} onChange={e => update('uid', e.target.value)} placeholder="CHE-123.456.789" style={inputStyle} />
                </div>
              )}
              <div>
                <label style={labelStyle}>MWST-Nummer (falls vorhanden)</label>
                <input type="text" value={data.mwstNummer} onChange={e => update('mwstNummer', e.target.value)} placeholder={data.rechtsraum === 'CH' ? 'CHE-123.456.789 MWST' : 'DE123456789'} style={inputStyle} />
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 14, color: G.textSec }}>
                <input type="checkbox" checked={data.handelsregister} onChange={e => update('handelsregister', e.target.checked)} style={{ width: 18, height: 18 }} />
                Im Handelsregister eingetragen
              </label>
              {data.handelsregister && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, paddingLeft: 16, borderLeft: `2px solid ${G.green}` }}>
                  {(data.rechtsraum === 'DE' || data.rechtsraum === 'AT') && (
                    <div>
                      <label style={labelStyle}>Registergericht</label>
                      <input type="text" value={data.registergericht} onChange={e => update('registergericht', e.target.value)} placeholder="Amtsgericht München" style={inputStyle} />
                    </div>
                  )}
                  <div>
                    <label style={labelStyle}>{data.rechtsraum === 'CH' ? 'UID' : 'HRB-Nummer'}</label>
                    <input type="text" value={data.registernummer} onChange={e => update('registernummer', e.target.value)} placeholder={data.rechtsraum === 'CH' ? 'CHE-123.456.789' : 'HRB 12345'} style={inputStyle} />
                  </div>
                </div>
              )}
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
              <button onClick={() => setStep(1)} style={{ ...btnSecondary, width: '33%' }}>← Zurück</button>
              <button onClick={() => setStep(3)} disabled={!isStep2Valid} style={{ ...btnPrimary(!isStep2Valid), width: '67%' }}>Impressum generieren →</button>
            </div>
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: G.text }}>✅ Ihr Impressum ist bereit!</h2>
                <span style={{ background: G.greenBg, color: G.green, border: `1px solid ${G.greenBorder}`, fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20 }}>Vorschau kostenlos</span>
              </div>
              <div style={{ position: 'relative' }}>
                <div style={{ background: G.bgLight, borderRadius: 10, padding: 20, fontFamily: 'monospace', fontSize: 13, lineHeight: 1.8, color: G.text, whiteSpace: 'pre-wrap', maxHeight: 280, overflowY: isPaid ? 'auto' : 'hidden' }}>
                  {isPaid ? impressumText : (
                    <>
                      {impressumText.split('\n').slice(0, 8).join('\n')}
                      <div style={{ filter: 'blur(4px)', userSelect: 'none' }}>{impressumText.split('\n').slice(8).join('\n')}</div>
                    </>
                  )}
                </div>
                {!isPaid && (
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 80, background: `linear-gradient(to top, ${G.bgWhite}, transparent)`, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: 10 }}>
                    <p style={{ color: G.textSec, fontSize: 13 }}>Rest des Impressums nach Freischaltung sichtbar</p>
                  </div>
                )}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 16 }}>
                {isPaid ? (
                  <>
                    <button onClick={handleCopy} style={{ ...btnSecondary, width: '100%' }}>{copied ? '✅ Kopiert!' : '📋 Kopieren'}</button>
                    <button onClick={handleDownload} style={btnPrimary()}>⬇️ Als .txt herunterladen</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => setStep(2)} style={{ ...btnSecondary, width: '100%' }}>← Bearbeiten</button>
                    <a href="/checkout?product=impressum" style={{ ...btnPrimary(), display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}>🔓 Freischalten &amp; Downloaden</a>
                  </>
                )}
              </div>
            </div>

            {!isPaid && (
              <div style={{ background: G.bgWhite, border: `1px solid ${G.border}`, borderRadius: 14, padding: 24 }}>
                <div style={{ display: 'flex', gap: 16 }}>
                  <div style={{ fontSize: 32 }}>💡</div>
                  <div>
                    <h3 style={{ fontWeight: 700, fontSize: 16, color: G.text, marginBottom: 6 }}>Noch mehr Schutz mit Dataquard Starter</h3>
                    <p style={{ color: G.textSec, fontSize: 13, marginBottom: 12, lineHeight: 1.6 }}>Ab CHF 19.–/Mt. erhalten Sie: Impressum + Datenschutzerklärung + Cookie-Analyse + Performance-Check.</p>
                    <div style={{ display: 'flex', gap: 10 }}>
                      <a href="/checkout?plan=starter" style={{ background: G.green, color: '#fff', fontWeight: 700, padding: '8px 16px', borderRadius: 8, fontSize: 13, textDecoration: 'none' }}>Starter – CHF 19.–/Mt. ⭐</a>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div style={{ background: G.bgWhite, border: `1px solid ${G.border}`, borderRadius: 14, padding: 24 }}>
              <h3 style={{ fontWeight: 600, fontSize: 15, color: G.text, marginBottom: 14 }}>Was ist im Impressum enthalten?</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 13, color: G.textSec }}>
                <div>✅ Firmen- &amp; Kontaktangaben</div>
                <div>✅ Verantwortliche Person</div>
                <div>✅ Handelsregistereintrag</div>
                <div>✅ MWST / UID-Nummer</div>
                <div>✅ Haftungsausschluss</div>
                <div>{data.rechtsraum === 'CH' ? '✅ nDSG-konform' : data.rechtsraum === 'DE' ? '✅ TMG-konform' : '✅ CH + DE konform'}</div>
              </div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <a href="/scanner" style={{ color: G.textMuted, fontSize: 13, textDecoration: 'underline' }}>← Zurück zum Website-Scanner</a>
            </div>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}

export default function ImpressumGenerator() {
  return (
    <Suspense fallback={
      <PageWrapper>
        <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
          <div style={{ fontSize: 32 }}>⏳</div>
          <p style={{ color: '#888899', fontSize: 14 }}>Wird geladen...</p>
        </div>
      </PageWrapper>
    }>
      <ImpressumGeneratorInner />
    </Suspense>
  );
}
