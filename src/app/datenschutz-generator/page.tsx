'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

interface PolicyData {
  // Website
  domain: string;
  rechtsraum: 'CH' | 'DE' | 'BOTH';
  // Firma
  firmaName: string;
  strasse: string;
  plz: string;
  ort: string;
  land: string;
  email: string;
  // Services (aus Scanner)
  hasGoogleAnalytics: boolean;
  hasMetaPixel: boolean;
  hasGoogleAds: boolean;
  hasHotjar: boolean;
  hasStripe: boolean;
  hasYoutube: boolean;
  hasLinkedIn: boolean;
  hasOtherTrackers: boolean;
  // Features
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

// Template-basierte Policy-Bausteine
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

  // Header
  sections.push(`DATENSCHUTZERKLÄRUNG\n\nStand: ${today}\n`);

  // 1. Verantwortlicher
  sections.push(`1. VERANTWORTLICHER\n\n${data.firmaName}\n${data.strasse}\n${data.plz} ${data.ort}\n${data.land}\nE-Mail: ${data.email}\nWebsite: ${data.domain}\n`);

  // 2. Grundsätze
  sections.push(`2. GRUNDSÄTZE DER DATENVERARBEITUNG\n\nWir verarbeiten Ihre personenbezogenen Daten im Einklang mit ${lawRef}. Die Erhebung und Verarbeitung Ihrer Daten erfolgt nur, soweit dies zur Bereitstellung unserer Dienstleistungen erforderlich ist oder Sie Ihre Einwilligung erteilt haben.\n`);

  // 3. Hosting & Server
  sections.push(`3. HOSTING UND SERVER-LOGS\n\nUnsere Website wird auf Servern in der Schweiz gehostet. Bei jedem Aufruf unserer Website werden automatisch Informationen erfasst, die Ihr Browser übermittelt. Diese sogenannten Server-Log-Files beinhalten: Browsertyp und -version, verwendetes Betriebssystem, Referrer-URL, Hostname des zugreifenden Rechners, Uhrzeit der Serveranfrage sowie IP-Adresse.\n\nDiese Daten werden ausschliesslich zur Sicherstellung des störungsfreien Betriebs der Website und zur Verbesserung unseres Angebots genutzt und werden nach spätestens 30 Tagen gelöscht.\n`);

  // 4. Cookies
  sections.push(`4. COOKIES UND TRACKING\n\nUnsere Website verwendet Cookies. Cookies sind kleine Textdateien, die auf Ihrem Endgerät gespeichert werden. Technisch notwendige Cookies werden auf Basis unseres berechtigten Interesses gesetzt. Für alle weiteren Cookies holen wir Ihre Einwilligung ein.\n\nSie können Ihren Browser so einstellen, dass Sie über das Setzen von Cookies informiert werden und Cookies nur im Einzelfall erlauben.\n`);

  // 5. Google Analytics
  if (data.hasGoogleAnalytics) {
    sections.push(`5. GOOGLE ANALYTICS\n\nDiese Website nutzt Google Analytics, einen Webanalysedienst der Google LLC, 1600 Amphitheatre Parkway, Mountain View, CA 94043, USA. Google Analytics verwendet Cookies, die eine Analyse der Benutzung der Website ermöglichen.\n\nDie durch den Cookie erzeugten Informationen über Ihre Benutzung dieser Website werden in der Regel an einen Server von Google in den USA übertragen und dort gespeichert. Wir haben IP-Anonymisierung aktiviert. Grundlage ist Ihre Einwilligung gemäss Cookie-Banner.\n\nSie können die Erfassung durch Google Analytics verhindern, indem Sie das Browser-Add-on zur Deaktivierung von Google Analytics installieren: https://tools.google.com/dlpage/gaoptout\n`);
  }

  // 6. Meta Pixel
  if (data.hasMetaPixel) {
    sections.push(`${data.hasGoogleAnalytics ? '6' : '5'}. META PIXEL (FACEBOOK)\n\nDiese Website verwendet den Meta Pixel der Meta Platforms Ireland Ltd., 4 Grand Canal Square, Dublin 2, Irland. Der Meta Pixel ermöglicht es Meta, die Besucher unserer Website als Zielgruppe für die Anzeige von Anzeigen auf Facebook und Instagram zu definieren.\n\nDie Nutzung erfolgt auf Grundlage Ihrer Einwilligung. Sie können Ihre Einwilligung jederzeit über unseren Cookie-Banner widerrufen.\n`);
  }

  // Stripe
  if (data.hasStripe) {
    sections.push(`ZAHLUNGSABWICKLUNG (STRIPE)\n\nFür die Zahlungsabwicklung setzen wir den Dienst Stripe der Stripe Payments Europe Ltd., 1 Grand Canal Street Lower, Grand Canal Dock, Dublin, Irland ein. Bei Zahlungen werden Ihre Zahlungsdaten direkt an Stripe übermittelt und dort verarbeitet. Wir speichern keine Kreditkartendaten. Die Verarbeitung erfolgt auf Grundlage der Vertragserfüllung.\n`);
  }

  // YouTube
  if (data.hasYoutube) {
    sections.push(`YOUTUBE VIDEOS\n\nAuf unserer Website sind YouTube-Videos eingebettet. Betreiber ist die Google Ireland Limited, Gordon House, Barrow Street, Dublin 4, Irland. Beim Aufruf einer Seite mit eingebettetem YouTube-Video wird eine Verbindung zu YouTube hergestellt. Wir verwenden YouTube im erweiterten Datenschutzmodus.\n`);
  }

  // Kontaktformular
  if (data.hasContactForm) {
    sections.push(`KONTAKTFORMULAR\n\nWenn Sie uns per Kontaktformular Anfragen zukommen lassen, werden Ihre Angaben aus dem Anfrageformular inklusive der von Ihnen dort angegebenen Kontaktdaten zwecks Bearbeitung der Anfrage und für den Fall von Anschlussfragen bei uns gespeichert. Diese Daten geben wir nicht ohne Ihre Einwilligung weiter.\n`);
  }

  // Newsletter
  if (data.hasNewsletter) {
    sections.push(`NEWSLETTER\n\nWenn Sie unseren Newsletter abonnieren möchten, benötigen wir Ihre E-Mail-Adresse sowie Informationen, die uns die Überprüfung gestatten, dass Sie der Inhaber der angegebenen E-Mail-Adresse sind. Weitere Daten werden nicht erhoben. Diese Daten verwenden wir ausschliesslich für den Versand der angeforderten Informationen und geben diese nicht an Dritte weiter.\n`);
  }

  // Betroffenenrechte
  const rights = data.rechtsraum === 'CH'
    ? 'Auskunft (Art. 25 DSG), Berichtigung, Löschung, Einschränkung der Bearbeitung sowie Datenübertragbarkeit'
    : 'Auskunft (Art. 15 DSGVO), Berichtigung (Art. 16), Löschung (Art. 17), Einschränkung (Art. 18), Datenübertragbarkeit (Art. 20) sowie Widerspruch (Art. 21)';

  sections.push(`IHRE RECHTE\n\nSie haben das Recht auf ${rights}. Zur Geltendmachung Ihrer Rechte wenden Sie sich bitte an: ${data.email}\n\n${data.rechtsraum === 'CH'
    ? 'Sie haben zudem das Recht, beim Eidgenössischen Datenschutz- und Öffentlichkeitsbeauftragten (EDÖB) Beschwerde einzureichen.'
    : 'Sie haben das Recht, sich bei einer Datenschutz-Aufsichtsbehörde zu beschweren.'}\n`);

  // Änderungen
  sections.push(`ÄNDERUNGEN DIESER DATENSCHUTZERKLÄRUNG\n\nWir behalten uns vor, diese Datenschutzerklärung anzupassen, damit sie stets den aktuellen rechtlichen Anforderungen entspricht. Für Ihren erneuten Besuch gilt dann die neue Datenschutzerklärung.\n\nLetzte Aktualisierung: ${today}`);

  return sections.join('\n---\n\n');
}

function DataschutzGeneratorInner() {
  const searchParams = useSearchParams();
  const [data, setData] = useState<PolicyData>(defaultData);
  const [step, setStep] = useState(1);
  const [generating, setGenerating] = useState(false);
  const [generatedPolicy, setGeneratedPolicy] = useState('');
  const [useAI, setUseAI] = useState(false);
  const [isPaid] = useState(false);
  const [copied, setCopied] = useState(false);

  // Auto-fill from scanner
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

      // Auto-detect trackers from scanner
      if (trackers) {
        const trackerList = trackers.toLowerCase();
        updates.hasGoogleAnalytics = trackerList.includes('google') || trackerList.includes('analytics');
        updates.hasMetaPixel = trackerList.includes('meta') || trackerList.includes('facebook');
        updates.hasGoogleAds = trackerList.includes('ads') || trackerList.includes('adwords');
        updates.hasHotjar = trackerList.includes('hotjar');
        updates.hasStripe = trackerList.includes('stripe');
        updates.hasYoutube = trackerList.includes('youtube');
        updates.hasLinkedIn = trackerList.includes('linkedin');
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

    // Always generate template first
    const templatePolicy = generatePolicyTemplate(data);

    if (useAI) {
      try {
        const response = await fetch('/api/policy/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data, templatePolicy }),
        });
        const result = await response.json();
        if (result.policy) {
          setGeneratedPolicy(result.policy);
        } else {
          setGeneratedPolicy(templatePolicy);
        }
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 to-black text-white py-12 px-4">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-block bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-wide">
            Kernprodukt
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">🔒 Datenschutzerklärung Generator</h1>
          <p className="text-gray-300 text-lg">
            Individuell, nDSG/DSGVO-konform, in 3 Minuten fertig.
          </p>
          {searchParams.get('domain') && (
            <div className="mt-4 inline-flex items-center gap-2 bg-green-900 border border-green-700 text-green-300 px-4 py-2 rounded-lg text-sm">
              ✅ Domain aus Scan vorausgefüllt: <strong>{searchParams.get('domain')}</strong>
            </div>
          )}
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center mb-8 gap-0">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${
                step >= s
                  ? 'bg-indigo-600 border-indigo-500 text-white'
                  : 'bg-indigo-900 border-indigo-700 text-gray-400'
              }`}>
                {step > s ? '✓' : s}
              </div>
              {s < 3 && (
                <div className={`w-16 h-0.5 ${step > s ? 'bg-indigo-500' : 'bg-indigo-800'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Firma & Website */}
        {step === 1 && (
          <div className="bg-indigo-900 bg-opacity-50 border border-indigo-700 rounded-xl p-8">
            <h2 className="text-xl font-bold text-white mb-6">Schritt 1: Website & Firma</h2>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Website-URL *</label>
                <input
                  type="text"
                  value={data.domain}
                  onChange={e => update('domain', e.target.value)}
                  placeholder="https://www.ihre-website.ch"
                  className="w-full bg-indigo-800 border border-indigo-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Rechtsraum *</label>
                <div className="grid grid-cols-3 gap-3">
                  {(['CH', 'DE', 'BOTH'] as const).map((r) => (
                    <button
                      key={r}
                      onClick={() => update('rechtsraum', r)}
                      className={`py-3 rounded-lg border-2 font-semibold text-sm transition-all ${
                        data.rechtsraum === r
                          ? 'border-indigo-400 bg-indigo-700 text-white'
                          : 'border-indigo-700 bg-indigo-900 text-gray-400 hover:border-indigo-500'
                      }`}
                    >
                      {r === 'CH' ? '🇨🇭 nDSG' : r === 'DE' ? '🇩🇪 DSGVO' : '🇨🇭🇩🇪 Beide'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Firmenname *</label>
                <input
                  type="text"
                  value={data.firmaName}
                  onChange={e => update('firmaName', e.target.value)}
                  placeholder="Muster GmbH"
                  className="w-full bg-indigo-800 border border-indigo-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Strasse</label>
                  <input
                    type="text"
                    value={data.strasse}
                    onChange={e => update('strasse', e.target.value)}
                    placeholder="Musterstrasse 1"
                    className="w-full bg-indigo-800 border border-indigo-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">PLZ / Ort</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={data.plz}
                      onChange={e => update('plz', e.target.value)}
                      placeholder="4001"
                      className="w-20 bg-indigo-800 border border-indigo-600 rounded-lg px-3 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-400"
                    />
                    <input
                      type="text"
                      value={data.ort}
                      onChange={e => update('ort', e.target.value)}
                      placeholder="Basel"
                      className="flex-1 bg-indigo-800 border border-indigo-600 rounded-lg px-3 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-400"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">E-Mail (Datenschutzkontakt) *</label>
                <input
                  type="email"
                  value={data.email}
                  onChange={e => update('email', e.target.value)}
                  placeholder="datenschutz@firma.ch"
                  className="w-full bg-indigo-800 border border-indigo-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-400"
                />
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={!isStep1Valid}
              className="mt-8 w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-700 disabled:text-gray-500 text-white font-bold py-4 rounded-lg transition-all"
            >
              Weiter →
            </button>
          </div>
        )}

        {/* Step 2: Tracker & Features */}
        {step === 2 && (
          <div className="bg-indigo-900 bg-opacity-50 border border-indigo-700 rounded-xl p-8">
            <h2 className="text-xl font-bold text-white mb-2">Schritt 2: Dienste & Features</h2>
            <p className="text-gray-400 text-sm mb-6">
              {searchParams.get('trackers')
                ? '✅ Automatisch aus Scan erkannt – bitte prüfen und ergänzen'
                : 'Welche Dienste nutzen Sie auf Ihrer Website?'}
            </p>

            {/* Tracker */}
            <div className="mb-6">
              <h3 className="text-white font-semibold mb-3">📡 Tracking & Analytics</h3>
              <div className="grid grid-cols-2 gap-3">
                {TRACKERS.map(({ key, label, icon }) => (
                  <button
                    key={key}
                    onClick={() => update(key, !data[key])}
                    className={`flex items-center gap-3 p-3 rounded-lg border-2 text-left transition-all ${
                      data[key]
                        ? 'border-indigo-400 bg-indigo-700 text-white'
                        : 'border-indigo-700 bg-indigo-900 text-gray-400 hover:border-indigo-500'
                    }`}
                  >
                    <span>{icon}</span>
                    <span className="text-sm font-medium">{label}</span>
                    {data[key] && <span className="ml-auto text-indigo-300">✓</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* Features */}
            <div className="mb-6">
              <h3 className="text-white font-semibold mb-3">⚙️ Website-Features</h3>
              <div className="grid grid-cols-2 gap-3">
                {FEATURES.map(({ key, label, icon }) => (
                  <button
                    key={key}
                    onClick={() => update(key, !data[key])}
                    className={`flex items-center gap-3 p-3 rounded-lg border-2 text-left transition-all ${
                      data[key]
                        ? 'border-green-500 bg-green-900 bg-opacity-50 text-white'
                        : 'border-indigo-700 bg-indigo-900 text-gray-400 hover:border-indigo-500'
                    }`}
                  >
                    <span>{icon}</span>
                    <span className="text-sm font-medium">{label}</span>
                    {data[key] && <span className="ml-auto text-green-300">✓</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* AI Toggle */}
            <div className="bg-indigo-800 border border-indigo-600 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-semibold text-sm">🤖 KI-Optimierung aktivieren</p>
                  <p className="text-gray-400 text-xs mt-1">Claude AI formuliert individuellere Texte</p>
                </div>
                <button
                  onClick={() => setUseAI(!useAI)}
                  className={`w-12 h-6 rounded-full transition-all relative ${useAI ? 'bg-indigo-500' : 'bg-gray-600'}`}
                >
                  <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${useAI ? 'left-7' : 'left-1'}`} />
                </button>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setStep(1)}
                className="w-1/3 bg-indigo-900 border border-indigo-600 hover:bg-indigo-800 text-white font-bold py-4 rounded-lg transition-all"
              >
                ← Zurück
              </button>
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="w-2/3 bg-green-600 hover:bg-green-500 disabled:bg-gray-700 text-white font-bold py-4 rounded-lg transition-all"
              >
                {generating ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                    </svg>
                    {useAI ? 'KI generiert...' : 'Wird generiert...'}
                  </span>
                ) : '🔒 Datenschutzerklärung generieren'}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Preview & Download */}
        {step === 3 && generatedPolicy && (
          <div className="space-y-6">
            <div className="bg-indigo-900 bg-opacity-50 border border-indigo-700 rounded-xl p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">✅ Datenschutzerklärung bereit!</h2>
                <span className="bg-green-900 text-green-300 border border-green-700 text-xs font-bold px-3 py-1 rounded-full">
                  Vorschau kostenlos
                </span>
              </div>

              {/* Preview */}
              <div className="relative">
                <div className="bg-white text-gray-800 rounded-lg p-6 text-sm leading-relaxed whitespace-pre-wrap font-mono max-h-64 overflow-hidden">
                  {isPaid ? generatedPolicy : generatedPolicy.split('\n').slice(0, 20).join('\n')}
                </div>
                {!isPaid && (
                  <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-indigo-900 to-transparent rounded-b-lg flex items-end justify-center pb-3">
                    <p className="text-gray-300 text-sm">Vollständige Datenschutzerklärung nach Freischaltung</p>
                  </div>
                )}
              </div>

              {/* Buttons */}
              <div className="mt-6 grid grid-cols-2 gap-4">
                {isPaid ? (
                  <>
                    <button
                      onClick={handleCopy}
                      className="bg-indigo-700 hover:bg-indigo-600 text-white font-bold py-4 rounded-lg transition-all"
                    >
                      {copied ? '✅ Kopiert!' : '📋 Kopieren'}
                    </button>
                    <button
                      onClick={() => {
                        const blob = new Blob([generatedPolicy], { type: 'text/plain;charset=utf-8' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = 'datenschutzerklaerung.txt';
                        a.click();
                      }}
                      className="bg-green-600 hover:bg-green-500 text-white font-bold py-4 rounded-lg transition-all"
                    >
                      ⬇️ Herunterladen
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setStep(2)}
                      className="bg-indigo-900 border border-indigo-600 hover:bg-indigo-800 text-white font-bold py-4 rounded-lg transition-all"
                    >
                      ← Bearbeiten
                    </button>
                    <a
                      href="/checkout?product=starter"
                      className="bg-green-600 hover:bg-green-500 text-white font-bold py-4 rounded-lg transition-all text-center flex items-center justify-center"
                    >
                      🔓 Freischalten – CHF 79/Jahr
                    </a>
                  </>
                )}
              </div>
            </div>

            {/* Upsell */}
            {!isPaid && (
              <div className="bg-gradient-to-r from-green-900 to-indigo-900 border border-green-700 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <div className="text-4xl">🔒</div>
                  <div>
                    <h3 className="text-white font-bold text-lg mb-2">Dataquard Starter – CHF 79/Jahr</h3>
                    <p className="text-gray-300 text-sm mb-4">
                      Datenschutzerklärung + Impressum + Cookie-Analyse + Performance-Check + automatische Updates
                    </p>
                    <div className="flex gap-3 flex-wrap">
                      <a
                        href="/checkout?product=starter"
                        className="bg-green-600 text-white font-bold px-5 py-2 rounded-lg text-sm hover:bg-green-500 transition-all"
                      >
                        ⭐ Starter – CHF 79/Jahr
                      </a>
                      <a
                        href="/checkout?product=impressum"
                        className="bg-indigo-700 text-white font-bold px-5 py-2 rounded-lg text-sm hover:bg-indigo-600 transition-all"
                      >
                        Nur Policy – CHF 19
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="text-center">
              <a href="/scanner" className="text-gray-400 hover:text-gray-300 text-sm underline">
                ← Zurück zum Scanner
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function DataschutzGenerator() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-gray-300">Wird geladen...</p>
        </div>
      </div>
    }>
      <DataschutzGeneratorInner />
    </Suspense>
  );
}