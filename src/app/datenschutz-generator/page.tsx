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

interface PolicyData {
  domain: string;
  rechtsraum: 'CH' | 'DE' | 'BOTH';
  firmaName: string;
  strasse: string;
  plz: string;
  ort: string;
  land: string;
  email: string;
  hasGoogleAnalytics: boolean;
  hasMetaPixel: boolean;
  hasGoogleAds: boolean;
  hasHotjar: boolean;
  hasStripe: boolean;
  hasYoutube: boolean;
  hasLinkedIn: boolean;
  hasOtherTrackers: boolean;
  hasContactForm: boolean;
  hasNewsletter: boolean;
  hasShop: boolean;
  hasLogin: boolean;
  hasComments: boolean;
}

const defaultData: PolicyData = {
  domain: '',
  rechtsraum: 'CH',
  firmaName: '',
  strasse: '',
  plz: '',
  ort: '',
  land: 'Schweiz',
  email: '',
  hasGoogleAnalytics: false,
  hasMetaPixel: false,
  hasGoogleAds: false,
  hasHotjar: false,
  hasStripe: false,
  hasYoutube: false,
  hasLinkedIn: false,
  hasOtherTrackers: false,
  hasContactForm: false,
  hasNewsletter: false,
  hasShop: false,
  hasLogin: false,
  hasComments: false,
};

function generatePolicyTemplate(data: PolicyData): string {
  const today = new Date().toLocaleDateString('de-CH', {
    day: '2-digit', month: '2-digit', year: 'numeric'
  });

  const lawRef = data.rechtsraum === 'CH'
    ? 'dem Schweizer Datenschutzgesetz (DSG/nDSG)'
    : data.rechtsraum === 'DE'
    ? 'der Datenschutz-Grundverordnung (DSGVO) und dem BDSG'
    : 'dem Schweizer Datenschutzgesetz (DSG/nDSG) sowie der DSGVO';

  const sections: string[] = [];

  sections.push(`DATENSCHUTZERKLÄRUNG\n\nStand: ${today}\n`);
  sections.push(`1. VERANTWORTLICHER\n\n${data.firmaName}\n${data.strasse}\n${data.plz} ${data.ort}\n${data.land}\nE-Mail: ${data.email}\nWebsite: ${data.domain}\n`);
  sections.push(`2. GRUNDSÄTZE DER DATENVERARBEITUNG\n\nWir verarbeiten Ihre personenbezogenen Daten im Einklang mit ${lawRef}. Die Erhebung und Verarbeitung Ihrer Daten erfolgt nur, soweit dies zur Bereitstellung unserer Dienstleistungen erforderlich ist oder Sie Ihre Einwilligung erteilt haben.\n`);
  sections.push(`3. HOSTING UND SERVER-LOGS\n\nUnsere Website wird auf Servern in der Schweiz gehostet. Bei jedem Aufruf unserer Website werden automatisch Informationen erfasst, die Ihr Browser übermittelt. Diese sogenannten Server-Log-Files beinhalten: Browsertyp und -version, verwendetes Betriebssystem, Referrer-URL, Hostname des zugreifenden Rechners, Uhrzeit der Serveranfrage sowie IP-Adresse.\n\nDiese Daten werden ausschliesslich zur Sicherstellung des störungsfreien Betriebs der Website und zur Verbesserung unseres Angebots genutzt und werden nach spätestens 30 Tagen gelöscht.\n`);
  sections.push(`4. COOKIES UND TRACKING\n\nUnsere Website verwendet Cookies. Cookies sind kleine Textdateien, die auf Ihrem Endgerät gespeichert werden. Technisch notwendige Cookies werden auf Basis unseres berechtigten Interesses gesetzt. Für alle weiteren Cookies holen wir Ihre Einwilligung ein.\n\nSie können Ihren Browser so einstellen, dass Sie über das Setzen von Cookies informiert werden und Cookies nur im Einzelfall erlauben.\n`);

  if (data.hasGoogleAnalytics) {
    sections.push(`5. GOOGLE ANALYTICS\n\nDiese Website nutzt Google Analytics, einen Webanalysedienst der Google LLC, 1600 Amphitheatre Parkway, Mountain View, CA 94043, USA. Google Analytics verwendet Cookies, die eine Analyse der Benutzung der Website ermöglichen.\n\nDie durch den Cookie erzeugten Informationen über Ihre Benutzung dieser Website werden in der Regel an einen Server von Google in den USA übertragen und dort gespeichert. Wir haben IP-Anonymisierung aktiviert. Grundlage ist Ihre Einwilligung gemäss Cookie-Banner.\n\nSie können die Erfassung durch Google Analytics verhindern, indem Sie das Browser-Add-on zur Deaktivierung von Google Analytics installieren: https://tools.google.com/dlpage/gaoptout\n`);
  }

  if (data.hasMetaPixel) {
    sections.push(`${data.hasGoogleAnalytics ? '6' : '5'}. META PIXEL (FACEBOOK)\n\nDiese Website verwendet den Meta Pixel der Meta Platforms Ireland Ltd., 4 Grand Canal Square, Dublin 2, Irland. Der Meta Pixel ermöglicht es Meta, die Besucher unserer Website als Zielgruppe für die Anzeige von Anzeigen auf Facebook und Instagram zu definieren.\n\nDie Nutzung erfolgt auf Grundlage Ihrer Einwilligung. Sie können Ihre Einwilligung jederzeit über unseren Cookie-Banner widerrufen.\n`);
  }

  if (data.hasStripe) {
    sections.push(`ZAHLUNGSABWICKLUNG (STRIPE)\n\nFür die Zahlungsabwicklung setzen wir den Dienst Stripe der Stripe Payments Europe Ltd., 1 Grand Canal Street Lower, Grand Canal Dock, Dublin, Irland ein. Bei Zahlungen werden Ihre Zahlungsdaten direkt an Stripe übermittelt und dort verarbeitet. Wir speichern keine Kreditkartendaten. Die Verarbeitung erfolgt auf Grundlage der Vertragserfüllung.\n`);
  }

  if (data.hasYoutube) {
    sections.push(`YOUTUBE VIDEOS\n\nAuf unserer Website sind YouTube-Videos eingebettet. Betreiber ist die Google Ireland Limited, Gordon House, Barrow Street, Dublin 4, Irland. Beim Aufruf einer Seite mit eingebettetem YouTube-Video wird eine Verbindung zu YouTube hergestellt. Wir verwenden YouTube im erweiterten Datenschutzmodus.\n`);
  }

  if (data.hasContactForm) {
    sections.push(`KONTAKTFORMULAR\n\nWenn Sie uns per Kontaktformular Anfragen zukommen lassen, werden Ihre Angaben aus dem Anfrageformular inklusive der von Ihnen dort angegebenen Kontaktdaten zwecks Bearbeitung der Anfrage und für den Fall von Anschlussfragen bei uns gespeichert. Diese Daten geben wir nicht ohne Ihre Einwilligung weiter.\n`);
  }

  if (data.hasNewsletter) {
    sections.push(`NEWSLETTER\n\nWenn Sie unseren Newsletter abonnieren möchten, benötigen wir Ihre E-Mail-Adresse sowie Informationen, die uns die Überprüfung gestatten, dass Sie der Inhaber der angegebenen E-Mail-Adresse sind. Weitere Daten werden nicht erhoben. Diese Daten verwenden wir ausschliesslich für den Versand der angeforderten Informationen und geben diese nicht an Dritte weiter.\n`);
  }

  const rights = data.rechtsraum === 'CH'
    ? 'Auskunft (Art. 25 DSG), Berichtigung, Löschung, Einschränkung der Bearbeitung sowie Datenübertragbarkeit'
    : 'Auskunft (Art. 15 DSGVO), Berichtigung (Art. 16), Löschung (Art. 17), Einschränkung (Art. 18), Datenübertragbarkeit (Art. 20) sowie Widerspruch (Art. 21)';

  sections.push(`IHRE RECHTE\n\nSie haben das Recht auf ${rights}. Zur Geltendmachung Ihrer Rechte wenden Sie sich bitte an: ${data.email}\n\n${data.rechtsraum === 'CH'
    ? 'Sie haben zudem das Recht, beim Eidgenössischen Datenschutz- und Öffentlichkeitsbeauftragten (EDÖB) Beschwerde einzureichen.'
    : 'Sie haben das Recht, sich bei einer Datenschutz-Aufsichtsbehörde zu beschweren.'}\n`);

  sections.push(`ÄNDERUNGEN DIESER DATENSCHUTZERKLÄRUNG\n\nWir behalten uns vor, diese Datenschutzerklärung anzupassen, damit sie stets den aktuellen rechtlichen Anforderungen entspricht. Für Ihren erneuten Besuch gilt dann die neue Datenschutzerklärung.\n\nLetzte Aktualisierung: ${today}`);

  return sections.join('\n---\n\n');
}

const inputStyle: React.CSSProperties = {
  width: '100%', background: G.bgLight, border: `1px solid ${G.border}`,
  borderRadius: 8, padding: '12px 14px', fontSize: 14, color: G.text,
  outline: 'none', boxSizing: 'border-box',
};

function stepCircle(s: number, current: number) {
  const done = current > s;
  const active = current === s;
  return {
    width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 14, fontWeight: 700,
    background: done || active ? G.green : G.bgLight,
    color: done || active ? '#fff' : G.textMuted,
    border: `2px solid ${done || active ? G.green : G.border}`,
  } as React.CSSProperties;
}

function rechtsraumBtn(_r: string, active: boolean): React.CSSProperties {
  return {
    flex: 1, padding: '12px 8px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer',
    border: `2px solid ${active ? G.green : G.border}`,
    background: active ? G.greenBg : G.bgLight,
    color: active ? G.green : G.textSec,
    transition: 'all 0.15s',
  };
}

function toggleBtn(active: boolean): React.CSSProperties {
  return {
    display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
    borderRadius: 8, border: `2px solid ${active ? G.green : G.border}`,
    background: active ? G.greenBg : G.bgLight,
    color: active ? G.green : G.textSec,
    cursor: 'pointer', fontSize: 13, fontWeight: active ? 600 : 400,
    textAlign: 'left', transition: 'all 0.15s',
  };
}

function DataschutzGeneratorInner() {
  const searchParams = useSearchParams();
  const [data, setData] = useState<PolicyData>(defaultData);
  const [step, setStep] = useState(1);
  const [generating, setGenerating] = useState(false);
  const [generatedPolicy, setGeneratedPolicy] = useState('');
  const [useAI, setUseAI] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const checkBilling = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;
      const { data: billing } = await supabase
        .from('subscriptions').select('id').eq('user_id', session.user.id)
        .eq('status', 'active').limit(1).maybeSingle();
      if (billing) setIsPaid(true);
    };
    checkBilling();
  }, []);

  useEffect(() => {
    const domain = searchParams.get('domain');
    const jurisdiction = searchParams.get('jurisdiction');
    const trackers = searchParams.get('trackers');
    if (domain) {
      const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/\/$/, '');
      const updates: Partial<PolicyData> = {
        domain: `https://${cleanDomain}`,
        rechtsraum: jurisdiction?.includes('DSGVO') ? 'DE' : 'CH',
      };
      if (trackers) {
        const t = trackers.toLowerCase();
        updates.hasGoogleAnalytics = t.includes('google') || t.includes('analytics');
        updates.hasMetaPixel = t.includes('meta') || t.includes('facebook');
        updates.hasGoogleAds = t.includes('ads') || t.includes('adwords');
        updates.hasHotjar = t.includes('hotjar');
        updates.hasStripe = t.includes('stripe');
        updates.hasYoutube = t.includes('youtube');
        updates.hasLinkedIn = t.includes('linkedin');
      }
      setData(prev => ({ ...prev, ...updates }));
    }
  }, [searchParams]);

  const update = (field: keyof PolicyData, value: string | boolean) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const isStep1Valid = data.domain && data.firmaName && data.email;

  const handleGenerate = async () => {
    setGenerating(true);
    const templatePolicy = generatePolicyTemplate(data);
    if (useAI) {
      try {
        const response = await fetch('/api/policy/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data, templatePolicy }),
        });
        const result = await response.json();
        setGeneratedPolicy(result.policy || templatePolicy);
      } catch {
        setGeneratedPolicy(templatePolicy);
      }
    } else {
      setGeneratedPolicy(templatePolicy);
    }
    setGenerating(false);
    setStep(3);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedPolicy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const TRACKERS = [
    { key: 'hasGoogleAnalytics', label: 'Google Analytics', icon: '📊' },
    { key: 'hasMetaPixel', label: 'Meta / Facebook Pixel', icon: '👁️' },
    { key: 'hasGoogleAds', label: 'Google Ads', icon: '📢' },
    { key: 'hasHotjar', label: 'Hotjar', icon: '🔥' },
    { key: 'hasStripe', label: 'Stripe (Zahlung)', icon: '💳' },
    { key: 'hasYoutube', label: 'YouTube Videos', icon: '▶️' },
    { key: 'hasLinkedIn', label: 'LinkedIn Insight', icon: '💼' },
    { key: 'hasOtherTrackers', label: 'Andere Tracker', icon: '🔍' },
  ] as const;

  const FEATURES = [
    { key: 'hasContactForm', label: 'Kontaktformular', icon: '✉️' },
    { key: 'hasNewsletter', label: 'Newsletter', icon: '📧' },
    { key: 'hasShop', label: 'Online-Shop', icon: '🛒' },
    { key: 'hasLogin', label: 'Benutzer-Login', icon: '🔐' },
    { key: 'hasComments', label: 'Kommentarfunktion', icon: '💬' },
  ] as const;

  const cardStyle: React.CSSProperties = {
    background: G.bgWhite, border: `1px solid ${G.border}`, borderRadius: 14, padding: 32,
  };

  return (
    <PageWrapper>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ display: 'inline-block', background: G.greenBg, color: G.green, border: `1px solid ${G.greenBorder}`, fontSize: 11, fontWeight: 800, padding: '4px 14px', borderRadius: 20, marginBottom: 16, letterSpacing: 1 }}>
            KERNPRODUKT
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: G.text, marginBottom: 8 }}>🔒 Datenschutzerklärung Generator</h1>
          <p style={{ color: G.textSec, fontSize: 15 }}>Individuell, nDSG/DSGVO-konform, in 3 Minuten fertig.</p>
          {searchParams.get('domain') && (
            <div style={{ marginTop: 14, display: 'inline-flex', alignItems: 'center', gap: 8, background: G.greenBg, border: `1px solid ${G.greenBorder}`, color: G.green, padding: '8px 16px', borderRadius: 8, fontSize: 13 }}>
              ✅ Domain aus Scan vorausgefüllt: <strong>{searchParams.get('domain')}</strong>
            </div>
          )}
        </div>

        {/* Step Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 32, gap: 0 }}>
          {[1, 2, 3].map((s) => (
            <div key={s} style={{ display: 'flex', alignItems: 'center' }}>
              <div style={stepCircle(s, step)}>{step > s ? '✓' : s}</div>
              {s < 3 && <div style={{ width: 64, height: 2, background: step > s ? G.green : G.border }} />}
            </div>
          ))}
        </div>

        {/* Step 1 */}
        {step === 1 && (
          <div style={cardStyle}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: G.text, marginBottom: 24 }}>Schritt 1: Website & Firma</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: G.textSec, marginBottom: 6 }}>Website-URL *</label>
                <input type="text" value={data.domain} onChange={e => update('domain', e.target.value)} placeholder="https://www.ihre-website.ch" style={inputStyle} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: G.textSec, marginBottom: 6 }}>Rechtsraum *</label>
                <div style={{ display: 'flex', gap: 10 }}>
                  {(['CH', 'DE', 'BOTH'] as const).map((r) => (
                    <button key={r} onClick={() => update('rechtsraum', r)} style={rechtsraumBtn(r, data.rechtsraum === r)}>
                      {r === 'CH' ? '🇨🇭 nDSG' : r === 'DE' ? '🇩🇪 DSGVO' : '🇨🇭🇩🇪 Beide'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: G.textSec, marginBottom: 6 }}>Firmenname *</label>
                <input type="text" value={data.firmaName} onChange={e => update('firmaName', e.target.value)} placeholder="Muster GmbH" style={inputStyle} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: G.textSec, marginBottom: 6 }}>Strasse</label>
                  <input type="text" value={data.strasse} onChange={e => update('strasse', e.target.value)} placeholder="Musterstrasse 1" style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: G.textSec, marginBottom: 6 }}>PLZ / Ort</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input type="text" value={data.plz} onChange={e => update('plz', e.target.value)} placeholder="4001" style={{ ...inputStyle, width: 80 }} />
                    <input type="text" value={data.ort} onChange={e => update('ort', e.target.value)} placeholder="Basel" style={{ ...inputStyle, flex: 1 }} />
                  </div>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: G.textSec, marginBottom: 6 }}>E-Mail (Datenschutzkontakt) *</label>
                <input type="email" value={data.email} onChange={e => update('email', e.target.value)} placeholder="datenschutz@firma.ch" style={inputStyle} />
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={!isStep1Valid}
              style={{ marginTop: 28, width: '100%', background: isStep1Valid ? G.green : G.bgLight, color: isStep1Valid ? '#fff' : G.textMuted, border: 'none', borderRadius: 10, padding: '14px', fontSize: 15, fontWeight: 700, cursor: isStep1Valid ? 'pointer' : 'not-allowed' }}
            >
              Weiter →
            </button>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div style={cardStyle}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: G.text, marginBottom: 6 }}>Schritt 2: Dienste & Features</h2>
            <p style={{ color: G.textMuted, fontSize: 13, marginBottom: 24 }}>
              {searchParams.get('trackers') ? '✅ Automatisch aus Scan erkannt – bitte prüfen und ergänzen' : 'Welche Dienste nutzen Sie auf Ihrer Website?'}
            </p>

            <div style={{ marginBottom: 24 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: G.text, marginBottom: 12 }}>📡 Tracking & Analytics</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {TRACKERS.map(({ key, label, icon }) => (
                  <button key={key} onClick={() => update(key, !data[key])} style={toggleBtn(data[key])}>
                    <span>{icon}</span>
                    <span style={{ flex: 1 }}>{label}</span>
                    {data[key] && <span style={{ color: G.green }}>✓</span>}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 24 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: G.text, marginBottom: 12 }}>⚙️ Website-Features</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {FEATURES.map(({ key, label, icon }) => (
                  <button key={key} onClick={() => update(key, !data[key])} style={toggleBtn(data[key])}>
                    <span>{icon}</span>
                    <span style={{ flex: 1 }}>{label}</span>
                    {data[key] && <span style={{ color: G.green }}>✓</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* AI Toggle */}
            <div style={{ background: G.bgLight, border: `1px solid ${G.border}`, borderRadius: 10, padding: '14px 18px', marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: 14, fontWeight: 600, color: G.text, marginBottom: 2, display: 'flex', alignItems: 'center', gap: 6 }}><img src="/badge-ai-trust.svg" alt="" width={16} height={16} style={{ display: 'inline-block' }} /> KI-Optimierung aktivieren</p>
                <p style={{ fontSize: 12, color: G.textMuted }}>Claude AI formuliert individuellere Texte</p>
              </div>
              <button
                onClick={() => setUseAI(!useAI)}
                style={{ width: 48, height: 26, borderRadius: 13, border: 'none', background: useAI ? G.green : G.border, cursor: 'pointer', position: 'relative', flexShrink: 0 }}
              >
                <span style={{ position: 'absolute', top: 3, width: 20, height: 20, background: '#fff', borderRadius: '50%', transition: 'left 0.15s', left: useAI ? 25 : 3 }} />
              </button>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setStep(1)} style={{ flex: '0 0 33%', background: G.bgLight, border: `1px solid ${G.border}`, borderRadius: 10, padding: '14px', fontSize: 14, fontWeight: 700, color: G.textSec, cursor: 'pointer' }}>
                ← Zurück
              </button>
              <button
                onClick={handleGenerate}
                disabled={generating}
                style={{ flex: 1, background: G.green, border: 'none', borderRadius: 10, padding: '14px', fontSize: 15, fontWeight: 700, color: '#fff', cursor: generating ? 'not-allowed' : 'pointer', opacity: generating ? 0.7 : 1 }}
              >
                {generating ? (
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    <svg style={{ width: 16, height: 16, animation: 'spin 1s linear infinite' }} fill="none" viewBox="0 0 24 24">
                      <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    {useAI ? 'KI generiert...' : 'Wird generiert...'}
                  </span>
                ) : '🔒 Datenschutzerklärung generieren'}
              </button>
            </div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && generatedPolicy && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={cardStyle}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: G.text }}>✅ Datenschutzerklärung bereit!</h2>
                <span style={{ background: G.greenBg, color: G.green, border: `1px solid ${G.greenBorder}`, fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 20 }}>
                  Vorschau kostenlos
                </span>
              </div>

              <div style={{ position: 'relative' }}>
                <div style={{ background: G.bgLight, border: `1px solid ${G.border}`, borderRadius: 10, padding: 20, fontSize: 13, lineHeight: 1.7, whiteSpace: 'pre-wrap', fontFamily: 'monospace', maxHeight: 256, overflow: 'hidden', color: G.text }}>
                  {isPaid ? generatedPolicy : generatedPolicy.split('\n').slice(0, 20).join('\n')}
                </div>
                {!isPaid && (
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 80, background: 'linear-gradient(to top, #f8f9fb, transparent)', borderRadius: '0 0 10px 10px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: 10 }}>
                    <p style={{ color: G.textMuted, fontSize: 12 }}>Vollständige Datenschutzerklärung nach Freischaltung</p>
                  </div>
                )}
              </div>

              <div style={{ marginTop: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {isPaid ? (
                  <>
                    <button onClick={handleCopy} style={{ background: G.bgLight, border: `1px solid ${G.border}`, borderRadius: 10, padding: '14px', fontSize: 14, fontWeight: 700, color: G.textSec, cursor: 'pointer' }}>
                      {copied ? '✅ Kopiert!' : '📋 Kopieren'}
                    </button>
                    <button
                      onClick={() => {
                        const blob = new Blob([generatedPolicy], { type: 'text/plain;charset=utf-8' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url; a.download = 'datenschutzerklaerung.txt'; a.click();
                      }}
                      style={{ background: G.green, border: 'none', borderRadius: 10, padding: '14px', fontSize: 14, fontWeight: 700, color: '#fff', cursor: 'pointer' }}
                    >
                      ⬇️ Herunterladen
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={() => setStep(2)} style={{ background: G.bgLight, border: `1px solid ${G.border}`, borderRadius: 10, padding: '14px', fontSize: 14, fontWeight: 700, color: G.textSec, cursor: 'pointer' }}>
                      ← Bearbeiten
                    </button>
                    <a href="/checkout?product=starter" style={{ background: G.green, borderRadius: 10, padding: '14px', fontSize: 14, fontWeight: 700, color: '#fff', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      🔓 Freischalten – CHF 79
                    </a>
                  </>
                )}
              </div>
            </div>

            {!isPaid && (
              <div style={{ background: G.bgWhite, border: `1px solid ${G.border}`, borderRadius: 14, padding: 24 }}>
                <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                  <div style={{ fontSize: 36 }}>🔒</div>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: G.text, marginBottom: 8 }}>Dataquard Starter – CHF 79</h3>
                    <p style={{ color: G.textSec, fontSize: 13, marginBottom: 16 }}>
                      Datenschutzerklärung + Impressum + Cookie-Analyse + Performance-Check + automatische Updates
                    </p>
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                      <a href="/checkout?product=starter" style={{ background: G.green, color: '#fff', fontWeight: 700, padding: '10px 20px', borderRadius: 8, fontSize: 13, textDecoration: 'none' }}>
                        ⭐ Starter – CHF 79
                      </a>
                      <a href="/checkout?product=impressum" style={{ background: G.bgLight, color: G.textSec, fontWeight: 700, padding: '10px 20px', borderRadius: 8, fontSize: 13, textDecoration: 'none', border: `1px solid ${G.border}` }}>
                        Nur Policy – CHF 19
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div style={{ textAlign: 'center' }}>
              <a href="/scanner" style={{ color: G.textMuted, fontSize: 13, textDecoration: 'underline' }}>← Zurück zum Scanner</a>
            </div>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}

export default function DataschutzGenerator() {
  return (
    <Suspense fallback={
      <PageWrapper>
        <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>⏳</div>
            <p style={{ color: '#888899', fontSize: 14 }}>Wird geladen...</p>
          </div>
        </div>
      </PageWrapper>
    }>
      <DataschutzGeneratorInner />
    </Suspense>
  );
}
