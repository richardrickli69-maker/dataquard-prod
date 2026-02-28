'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

interface ImpressumData {
  // Firma
  firmaName: string;
  rechtsform: string;
  strasse: string;
  plz: string;
  ort: string;
  land: string;
  // Kontakt
  email: string;
  telefon: string;
  website: string;
  // Verantwortlich
  geschaeftsfuehrer: string;
  // Register
  handelsregister: boolean;
  registergericht: string;
  registernummer: string;
  // Steuer
  mwstNummer: string;
  uid: string;
  // Rechtsraum
  rechtsraum: 'CH' | 'DE' | 'AT' | 'BOTH';
}

const defaultData: ImpressumData = {
  firmaName: '',
  rechtsform: 'Einzelunternehmen',
  strasse: '',
  plz: '',
  ort: '',
  land: 'Schweiz',
  email: '',
  telefon: '',
  website: '',
  geschaeftsfuehrer: '',
  handelsregister: false,
  registergericht: '',
  registernummer: '',
  mwstNummer: '',
  uid: '',
  rechtsraum: 'CH',
};

const rechtsformen = [
  'Einzelunternehmen',
  'GmbH',
  'AG',
  'Kollektivgesellschaft',
  'Kommanditgesellschaft',
  'Genossenschaft',
  'Verein',
  'Stiftung',
];

function generateImpressumText(data: ImpressumData): string {
  const lines: string[] = [];

  lines.push('Impressum');
  lines.push('');
  lines.push(`${data.firmaName}${data.rechtsform !== 'Einzelunternehmen' ? ` ${data.rechtsform}` : ''}`);
  lines.push(data.strasse);
  lines.push(`${data.plz} ${data.ort}`);
  lines.push(data.land);
  lines.push('');

  if (data.telefon) {
    lines.push(`Telefon: ${data.telefon}`);
  }
  lines.push(`E-Mail: ${data.email}`);
  if (data.website) {
    lines.push(`Website: ${data.website}`);
  }
  lines.push('');

  if (data.geschaeftsfuehrer) {
    if (data.rechtsform === 'AG') {
      lines.push(`Verwaltungsratspräsident: ${data.geschaeftsfuehrer}`);
    } else if (data.rechtsform === 'GmbH') {
      lines.push(`Geschäftsführer: ${data.geschaeftsfuehrer}`);
    } else {
      lines.push(`Verantwortlich: ${data.geschaeftsfuehrer}`);
    }
    lines.push('');
  }

  if (data.handelsregister && data.registernummer) {
    lines.push('Handelsregistereintrag:');
    if (data.rechtsraum === 'DE' || data.rechtsraum === 'AT') {
      lines.push(`Eingetragen im Handelsregister`);
      if (data.registergericht) lines.push(`Registergericht: ${data.registergericht}`);
      lines.push(`Registernummer: ${data.registernummer}`);
    } else {
      lines.push(`UID: ${data.registernummer}`);
    }
    lines.push('');
  }

  if (data.uid && data.rechtsraum === 'CH') {
    lines.push(`UID: ${data.uid}`);
    lines.push('');
  }

  if (data.mwstNummer) {
    if (data.rechtsraum === 'CH') {
      lines.push(`MWST-Nr.: ${data.mwstNummer}`);
    } else {
      lines.push(`Umsatzsteuer-Identifikationsnummer: ${data.mwstNummer}`);
    }
    lines.push('');
  }
if (data.rechtsraum === 'CH') {
    lines.push('Haftungsausschluss:');
    lines.push(
      'Die Inhalte dieser Website wurden mit grösstmöglicher Sorgfalt erstellt. ' +
      'Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen. ' +
      'Als Diensteanbieter sind wir für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich.'
    );
  } else if (data.rechtsraum === 'BOTH') {
    lines.push('Haftungsausschluss (Schweiz – nDSG):');
    lines.push(
      'Die Inhalte dieser Website wurden mit grösstmöglicher Sorgfalt erstellt. ' +
      'Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen. ' +
      'Als Diensteanbieter sind wir für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich.'
    );
    lines.push('');
    lines.push('Haftungsausschluss (Deutschland – TMG):');
    lines.push(
      'Die Inhalte unserer Seiten wurden mit größter Sorgfalt erstellt. ' +
      'Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen. ' +
      'Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich.'
    );
  } else {
    lines.push('Haftungsausschluss:');
    lines.push(
      'Die Inhalte unserer Seiten wurden mit größter Sorgfalt erstellt. ' +
      'Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen. ' +
      'Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich.'
    );
  }

  return lines.join('\n');
}

function ImpressumGeneratorInner() {
  const searchParams = useSearchParams();
  const [data, setData] = useState<ImpressumData>(defaultData);
  const [step, setStep] = useState(1);
  const [showPreview, setShowPreview] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [copied, setCopied] = useState(false);

  // Auto-fill from scanner results via URL params
  useEffect(() => {
    const domain = searchParams.get('domain');
    const hasImpressum = searchParams.get('hasImpressum');
    const jurisdiction = searchParams.get('jurisdiction');

    if (domain) {
      const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/\/$/, '');
      setData(prev => ({
        ...prev,
        website: `https://${cleanDomain}`,
        rechtsraum: jurisdiction === 'DSGVO' ? 'DE' : 'CH',
      }));
    }
  }, [searchParams]);

  const update = (field: keyof ImpressumData, value: string | boolean) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const isStep1Valid = data.firmaName && data.strasse && data.plz && data.ort && data.email;
  const isStep2Valid = data.geschaeftsfuehrer;

  const impressumText = generateImpressumText(data);

  const handleCopy = () => {
    navigator.clipboard.writeText(impressumText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!isPaid) {
      // Redirect to checkout with impressum flag
      window.location.href = '/checkout?product=impressum';
      return;
    }
    const blob = new Blob([impressumText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'impressum.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 to-black text-white py-12 px-4">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-block bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-wide">
            Neu
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">📄 Impressum Generator</h1>
          <p className="text-gray-300 text-lg">
            Erstelle in 2 Minuten ein rechtssicheres Impressum für die Schweiz oder Deutschland.
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

        {/* Step 1: Firma & Kontakt */}
        {step === 1 && (
          <div className="bg-indigo-900 bg-opacity-50 border border-indigo-700 rounded-xl p-8">
            <h2 className="text-xl font-bold text-white mb-6">Schritt 1: Firmen- & Kontaktangaben</h2>

            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Firmenname / Ihr Name *
                  </label>
                  <input
                    type="text"
                    value={data.firmaName}
                    onChange={e => update('firmaName', e.target.value)}
                    placeholder="Muster GmbH"
                    className="w-full bg-indigo-800 border border-indigo-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-400"
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Rechtsform *
                  </label>
                  <select
                    value={data.rechtsform}
                    onChange={e => update('rechtsform', e.target.value)}
                    className="w-full bg-indigo-800 border border-indigo-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-400"
                  >
                    {rechtsformen.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Strasse & Hausnummer *</label>
                <input
                  type="text"
                  value={data.strasse}
                  onChange={e => update('strasse', e.target.value)}
                  placeholder="Musterstrasse 1"
                  className="w-full bg-indigo-800 border border-indigo-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-400"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">PLZ *</label>
                  <input
                    type="text"
                    value={data.plz}
                    onChange={e => update('plz', e.target.value)}
                    placeholder="4001"
                    className="w-full bg-indigo-800 border border-indigo-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-400"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Ort *</label>
                  <input
                    type="text"
                    value={data.ort}
                    onChange={e => update('ort', e.target.value)}
                    placeholder="Basel"
                    className="w-full bg-indigo-800 border border-indigo-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-400"
                  />
                </div>
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
                      {r === 'CH' ? '🇨🇭 Schweiz' : r === 'DE' ? '🇩🇪 Deutschland' : '🇨🇭🇩🇪 Beide'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">E-Mail *</label>
                  <input
                    type="email"
                    value={data.email}
                    onChange={e => update('email', e.target.value)}
                    placeholder="info@firma.ch"
                    className="w-full bg-indigo-800 border border-indigo-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Telefon</label>
                  <input
                    type="text"
                    value={data.telefon}
                    onChange={e => update('telefon', e.target.value)}
                    placeholder="+41 61 000 00 00"
                    className="w-full bg-indigo-800 border border-indigo-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Website</label>
                <input
                  type="text"
                  value={data.website}
                  onChange={e => update('website', e.target.value)}
                  placeholder="https://www.firma.ch"
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

        {/* Step 2: Verantwortliche Person & Register */}
        {step === 2 && (
          <div className="bg-indigo-900 bg-opacity-50 border border-indigo-700 rounded-xl p-8">
            <h2 className="text-xl font-bold text-white mb-6">Schritt 2: Verantwortliche Person & Register</h2>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {data.rechtsform === 'AG' ? 'Verwaltungsratspräsident' : 'Geschäftsführer / Inhaber'} *
                </label>
                <input
                  type="text"
                  value={data.geschaeftsfuehrer}
                  onChange={e => update('geschaeftsfuehrer', e.target.value)}
                  placeholder="Max Muster"
                  className="w-full bg-indigo-800 border border-indigo-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-400"
                />
              </div>

              {data.rechtsraum === 'CH' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">UID-Nummer (falls vorhanden)</label>
                  <input
                    type="text"
                    value={data.uid}
                    onChange={e => update('uid', e.target.value)}
                    placeholder="CHE-123.456.789"
                    className="w-full bg-indigo-800 border border-indigo-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-400"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">MWST-Nummer (falls vorhanden)</label>
                <input
                  type="text"
                  value={data.mwstNummer}
                  onChange={e => update('mwstNummer', e.target.value)}
                  placeholder={data.rechtsraum === 'CH' ? 'CHE-123.456.789 MWST' : 'DE123456789'}
                  className="w-full bg-indigo-800 border border-indigo-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-400"
                />
              </div>

              <div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={data.handelsregister}
                    onChange={e => update('handelsregister', e.target.checked)}
                    className="w-5 h-5 rounded border-indigo-600 bg-indigo-800 text-indigo-500"
                  />
                  <span className="text-gray-300 font-medium">Im Handelsregister eingetragen</span>
                </label>
              </div>

              {data.handelsregister && (
                <div className="grid grid-cols-2 gap-4 pl-4 border-l-2 border-indigo-600">
                  {(data.rechtsraum === 'DE' || data.rechtsraum === 'AT') && (
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Registergericht</label>
                      <input
                        type="text"
                        value={data.registergericht}
                        onChange={e => update('registergericht', e.target.value)}
                        placeholder="Amtsgericht München"
                        className="w-full bg-indigo-800 border border-indigo-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-400"
                      />
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      {data.rechtsraum === 'CH' ? 'UID' : 'HRB-Nummer'}
                    </label>
                    <input
                      type="text"
                      value={data.registernummer}
                      onChange={e => update('registernummer', e.target.value)}
                      placeholder={data.rechtsraum === 'CH' ? 'CHE-123.456.789' : 'HRB 12345'}
                      className="w-full bg-indigo-800 border border-indigo-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-400"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-4 mt-8">
              <button
                onClick={() => setStep(1)}
                className="w-1/3 bg-indigo-900 border border-indigo-600 hover:bg-indigo-800 text-white font-bold py-4 rounded-lg transition-all"
              >
                ← Zurück
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!isStep2Valid}
                className="w-2/3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-700 disabled:text-gray-500 text-white font-bold py-4 rounded-lg transition-all"
              >
                Impressum generieren →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Preview & Download */}
        {step === 3 && (
          <div className="space-y-6">

            {/* Free Preview */}
            <div className="bg-indigo-900 bg-opacity-50 border border-indigo-700 rounded-xl p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">✅ Ihr Impressum ist bereit!</h2>
                <span className="bg-green-900 text-green-300 border border-green-700 text-xs font-bold px-3 py-1 rounded-full">
                  Vorschau kostenlos
                </span>
              </div>

              {/* Preview Box */}
              <div className="relative">
                <div className="bg-white text-gray-800 rounded-lg p-6 font-mono text-sm leading-relaxed whitespace-pre-wrap">
                  {isPaid ? impressumText : (
                    <>
                      {impressumText.split('\n').slice(0, 8).join('\n')}
                      <div className="mt-4 blur-sm select-none">
                        {impressumText.split('\n').slice(8).join('\n')}
                      </div>
                    </>
                  )}
                </div>

                {/* Blur overlay for non-paid */}
                {!isPaid && (
                  <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-indigo-900 to-transparent rounded-b-lg flex items-end justify-center pb-4">
                    <p className="text-gray-300 text-sm">Rest des Impressums nach Freischaltung sichtbar</p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
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
                      onClick={handleDownload}
                      className="bg-green-600 hover:bg-green-500 text-white font-bold py-4 rounded-lg transition-all"
                    >
                      ⬇️ Als .txt herunterladen
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
                      href="/checkout?product=impressum"
                      className="bg-green-600 hover:bg-green-500 text-white font-bold py-4 rounded-lg transition-all text-center flex items-center justify-center"
                    >
                      🔓 Freischalten & Downloaden
                    </a>
                  </>
                )}
              </div>
            </div>

            {/* Pricing Info */}
            {!isPaid && (
              <div className="bg-gradient-to-r from-indigo-800 to-indigo-900 border border-indigo-600 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <div className="text-4xl">💡</div>
                  <div>
                    <h3 className="text-white font-bold text-lg mb-2">Noch mehr Schutz mit Dataquard Starter</h3>
                    <p className="text-gray-300 text-sm mb-4">
                      Für CHF 79/Jahr erhalten Sie: Impressum + Datenschutzerklärung + Cookie-Analyse + 
                      Performance-Check + automatische Updates bei Gesetzesänderungen.
                    </p>
                    <div className="flex gap-3">
                      <a
                        href="/checkout?product=impressum"
                        className="bg-white text-indigo-900 font-bold px-5 py-2 rounded-lg text-sm hover:bg-gray-100 transition-all"
                      >
                        Nur Impressum – CHF 19
                      </a>
                      <a
                        href="/checkout?product=starter"
                        className="bg-indigo-600 text-white font-bold px-5 py-2 rounded-lg text-sm hover:bg-indigo-500 transition-all"
                      >
                        Starter – CHF 79/Jahr ⭐
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* What's included */}
            <div className="bg-indigo-900 bg-opacity-30 border border-indigo-800 rounded-xl p-6">
              <h3 className="text-white font-semibold mb-4">Was ist im Impressum enthalten?</h3>
              <div className="grid grid-cols-2 gap-3 text-sm text-gray-300">
                <div className="flex items-center gap-2">✅ Firmen- & Kontaktangaben</div>
                <div className="flex items-center gap-2">✅ Verantwortliche Person</div>
                <div className="flex items-center gap-2">✅ Handelsregistereintrag</div>
                <div className="flex items-center gap-2">✅ MWST / UID-Nummer</div>
                <div className="flex items-center gap-2">✅ Haftungsausschluss</div>
                <div className="flex items-center gap-2">
                  {data.rechtsraum === 'CH' ? '✅ nDSG-konform' : data.rechtsraum === 'DE' ? '✅ TMG-konform' : '✅ CH + DE konform'}
                </div>
              </div>
            </div>

            {/* Back to scanner link */}
            <div className="text-center">
              <a href="/scanner" className="text-gray-400 hover:text-gray-300 text-sm underline">
                ← Zurück zum Website-Scanner
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ImpressumGenerator() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-gray-300">Wird geladen...</p>
        </div>
      </div>
    }>
      <ImpressumGeneratorInner />
    </Suspense>
  );
}