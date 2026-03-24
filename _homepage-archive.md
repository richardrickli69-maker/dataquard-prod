/**
 * _homepage-archive.tsx
 * ══════════════════════════════════════════════════════════════
 * Ausgelagerter Homepage-Code — für Unterseiten Teil B bestimmt:
 *   - Sektion "Vier Säulen"    → /tools
 *   - Sektion "Scan Preview"   → /tools
 *   - Sektion "Stats"          → /tools
 *   - Sektion "Copy-Paste"     → /tools
 *   - Sektion "Vergleich"      → /preise
 *   - Sektion "AGB"            → weg (Link /agb reicht)
 *   - Sektion "FAQ Accordion"  → weg (/faq Seite vorhanden)
 *   - faqs Array               → weg (/faq Seite vorhanden)
 * ══════════════════════════════════════════════════════════════
 */

// ═══════════════════════════════════════════════════════
// faqs Array (war in page.tsx, useState<number | null>)
// Nicht mehr auf Homepage — /faq Seite vorhanden
// ═══════════════════════════════════════════════════════
/*
  const faqs = [
    { q: 'Was kostet ein Datenschutzanwalt?', a: 'Ein Datenschutzanwalt verlangt CHF 1\'500 bis 3\'500 für eine massgeschneiderte Erklärung. Mit Dataquard erhalten Sie das gleiche Ergebnis ab CHF 19.–/Mt. – in 3 Minuten.' },
    { q: 'Was passiert wenn ich keine Datenschutzerklärung habe?', a: 'Nach dem Schweizer nDSG (in Kraft seit 01.09.2023) drohen Bussen bis CHF 250\'000. Für EU-Kunden gilt die DSGVO mit Bussen bis 4% des weltweiten Jahresumsatzes.' },
    { q: 'Gilt das nDSG auch für Einzelunternehmer?', a: 'Ja – das nDSG gilt für alle Unternehmen die Personendaten von Schweizer Einwohnern bearbeiten, unabhängig von Grösse oder Rechtsform.' },
    { q: 'Wie unterscheidet sich Dataquard von kostenlosen Generatoren?', a: 'Kostenlose Generatoren erstellen eine generische Vorlage ohne Ihre Website zu analysieren. Dataquard scannt automatisch alle Drittanbieter und erstellt eine massgeschneiderte Erklärung.' },
    { q: 'Wie lange dauert die Policy-Generierung?', a: 'Die Website-Analyse dauert wenige Sekunden. Die Policy ist innerhalb von 30-60 Sekunden verfügbar.' },
    { q: 'Ist die generierte Policy wirklich nDSG/DSGVO-konform?', a: 'Ja. Über 40 juristisch validierte Textbausteine (P1–P7, W1–W8, D1–D12, etc.) speziell für nDSG und DSGVO. Keine generischen KI-Texte – präzise, vollständig und rechtssicher.' },
    { q: 'Brauche ich technische Fähigkeiten?', a: 'Nein! Sie brauchen nur Ihre Domain-Adresse. Der Rest ist vollautomatisch.' },
    { q: 'Welche Daten sammelt Dataquard?', a: 'Nur die Informationen die Sie uns geben (Domain, Unternehmensname). Daten bleiben in der Schweiz.' },
    { q: 'Wie viel Bussgeld droht bei DSGVO/nDSG-Verstössen?', a: 'Bis CHF 250\'000 bei nDSG und bis € 20 Mio. oder 4% des weltweiten Jahresumsatzes bei DSGVO. Mit Dataquard sind Sie in Minuten konform.' },
    { q: 'Kann ich die Policy bearbeiten?', a: 'Ja! Sie erhalten eine Markdown/HTML-Version die Sie problemlos anpassen können.' },
    { q: 'Gibt es eine Geld-zurück-Garantie?', a: 'Ja! Innerhalb der ersten 14 Tage nach Abschluss können Sie Ihr Abo ohne Angabe von Gründen kündigen und erhalten eine volle Rückerstattung. Nach Ablauf der 14 Tage läuft Ihr Abo bis zum Ende der bezahlten Laufzeit.' },
    { q: 'Was ist der EU AI Act Art. 50?', a: 'Der EU AI Act ist das weltweit erste umfassende KI-Gesetz. Artikel 50 verlangt, dass KI-generierte Inhalte als solche gekennzeichnet werden müssen. Für Schweizer KMU mit EU-Kunden gilt: Wer KI-Bilder auf seiner Website verwendet, muss diese transparent kennzeichnen — sonst drohen Bussgelder.' },
    { q: 'Muss ich KI-Bilder auf meiner Website kennzeichnen?', a: 'Ja, wenn Sie Kunden in der EU haben. Der EU AI Act Art. 50 schreibt vor, dass KI-generierte Inhalte erkennbar sein müssen. Viele KMU nutzen Tools wie Midjourney, DALL-E oder ChatGPT für Website-Bilder, ohne zu wissen, dass eine Kennzeichnungspflicht besteht. Dataquard erkennt automatisch, welche Bilder auf Ihrer Website KI-generiert sind.' },
    { q: 'Was ist ein Deepfake und warum ist das für mein KMU relevant?', a: 'Ein Deepfake ist ein manipuliertes Bild oder Video, das täuschend echt aussieht. Für KMU relevant: Betrüger können Team-Fotos manipulieren, gefälschte Geschäftsführer-Videos erstellen oder Ihr Firmenimage missbrauchen. Der Dataquard AI-Trust Check erkennt solche Manipulationen und warnt Sie.' },
  ];
*/

// ═══════════════════════════════════════════════════════
// ABSCHNITT: VIER SÄULEN DETAIL → /tools
// ═══════════════════════════════════════════════════════
/*
      <section style={{ maxWidth: 960, margin: '0 auto', padding: '50px 24px', borderTop: `1px solid ${G.border}` }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <span style={{ color: G.green, fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' }}>Vier-Säulen-Analyse</span>
          <h2 style={{ fontSize: 30, fontWeight: 800, marginTop: 6 }}>Mehr als nur ein Compliance-Check — die einzige 4-Säulen-Analyse der Schweiz</h2>
          <p style={{ color: G.textSec, fontSize: 14, marginTop: 6 }}>73% der Schweizer KMU-Websites sind nicht nDSG-konform. Und niemand prüft KI-Inhalte. Wir schon.</p>
        </div>
        <div className="grid-4col" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 16 }}>
          {[
            { ic: '⚖️', tag: 'RECHTSSICHERHEIT', t: 'Compliance-Check', s: 'nDSG + DSGVO', d: 'Automatische Prüfung aller rechtlichen Anforderungen. Ampel-System zeigt sofort, wo Handlungsbedarf besteht.', ch: ['Datenschutzerklärung vorhanden', 'Cookie-Banner konform', 'Tracker erkannt & dokumentiert', 'Impressum vollständig'] },
            { ic: '⚡', tag: 'GESCHWINDIGKEIT', t: 'Performance-Scan', s: 'Speed & Technik', d: 'Ladezeit, externe Scripts, Google Fonts — alles was bremst und rechtlich riskant ist.', ch: ['Ladezeit < 3 Sekunden', 'Mobile-freundlich', 'SSL aktiv & gültig', 'Keine veralteten Scripts'] },
            { ic: '🛡️', tag: 'VERTRAUEN', t: 'Trust-Score', s: 'Sicherheit & Vertrauen', d: 'SSL, Impressum, Cookie-Handling, Datentransfer. Ihr Vertrauens-Profil auf einen Blick.', ch: ['Meta-Tags vollständig', 'Kontaktinfos sichtbar', 'Keine broken Links', 'HTTPS überall'] },
            { ic: '🤖', tag: 'KI-SICHERHEIT', t: 'AI-Trust Check', s: 'KI-Erkennung & Deepfakes', d: 'Automatische Erkennung von KI-generierten Bildern und Deepfakes. EU AI Act Art. 50 Konformität auf Knopfdruck.', ch: ['KI-generierte Bilder erkannt', 'Deepfake-Warnung', 'EU AI Act Art. 50 konform', 'Transparenz-Badge verfügbar'] },
          ].map(c => (
            <div key={c.t} style={{ background: G.bgWhite, borderRadius: 16, padding: 26, border: `1px solid ${G.border}`, position: 'relative', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: c.tag === 'KI-SICHERHEIT' ? `linear-gradient(90deg, ${G.violet}, transparent)` : `linear-gradient(90deg, ${G.green}, transparent)` }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: c.tag === 'KI-SICHERHEIT' ? G.violet : G.green, letterSpacing: 2 }}>{c.tag}</span>
              <div style={{ margin: '10px 0 6px' }}><IconEl ic={c.ic} size={48} /></div>
              <h3 style={{ fontSize: 20, fontWeight: 800 }}>{c.t}</h3>
              <div style={{ fontSize: 14, color: c.tag === 'KI-SICHERHEIT' ? G.violet : G.green, marginBottom: 12, fontWeight: 600 }}>{c.s}</div>
              <p style={{ fontSize: 14, color: G.textSec, lineHeight: 1.6, marginBottom: 14 }}>{c.d}</p>
              <div style={{ borderTop: `1px solid ${G.border}`, paddingTop: 10 }}>
                {c.ch.map(x => <div key={x} style={{ fontSize: 14, color: G.text, padding: '3px 0', display: 'flex', gap: 6, alignItems: 'center' }}><img src="/checkmark.png" alt="" width={16} height={16} style={{ flexShrink: 0 }} />{x}</div>)}
              </div>
            </div>
          ))}
        </div>
      </section>
*/

// ═══════════════════════════════════════════════════════
// ABSCHNITT: SCAN PREVIEW (muster-kmu.ch Dark Demo + "So sieht Ihr Ergebnis aus") → /tools
// ═══════════════════════════════════════════════════════
/*
      <section style={{ maxWidth: 860, margin: '0 auto', padding: '40px 24px', borderTop: `1px solid ${G.border}` }}>
        <div className="grid-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, alignItems: 'center' }}>
          <div style={{ background: '#1a1a2e', border: '1px solid #2a2a44', borderRadius: 16, overflow: 'hidden', boxShadow: '0 8px 30px rgba(0,0,0,0.15)' }}>
            <div style={{ background: '#22223a', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid #2a2a44' }}>
              <div style={{ display: 'flex', gap: 5 }}>
                <div style={{ width: 9, height: 9, borderRadius: '50%', background: '#ef444480' }} />
                <div style={{ width: 9, height: 9, borderRadius: '50%', background: '#eab30880' }} />
                <div style={{ width: 9, height: 9, borderRadius: '50%', background: '#22c55e80' }} />
              </div>
              <div style={{ flex: 1, background: '#14142a', border: '1px solid #2a2a44', borderRadius: 5, padding: '4px 10px', fontSize: 10, color: '#888', fontFamily: 'monospace' }}>muster-kmu.ch</div>
            </div>
            <div style={{ padding: 18 }}>
              <div style={{ fontSize: 9, color: '#666', letterSpacing: 2, marginBottom: 12, fontWeight: 700 }}>SCAN-ERGEBNIS</div>
              {[
                { l: 'Datenschutzerklärung', ic: '/fehler.png', extra: '', c: '#ef4444' },
                { l: 'Cookie-Banner', ic: '/warnung.png', extra: '', c: '#eab308' },
                { l: 'Google Analytics', ic: '/fehler.png', extra: '', c: '#ef4444' },
                { l: 'SSL-Zertifikat', ic: '/checkmark.png', extra: '', c: '#22c55e' },
                { l: 'KI-Bilder erkannt', ic: '/warnung.png', extra: '3/5', c: '#eab308' },
              ].map(r => (
                <div key={r.l} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 12px', background: '#14142a', borderRadius: 8, marginBottom: 4, border: '1px solid #2a2a44' }}>
                  <span style={{ fontSize: 12, color: '#ccc' }}>{r.l}</span>
                  <span style={{ fontSize: 12, color: r.c, display: 'flex', alignItems: 'center', gap: 4 }}><img src={r.ic} alt="" width={13} height={13} style={{ flexShrink: 0 }} />{r.extra}</span>
                </div>
              ))}
              <div style={{ marginTop: 14, borderTop: '1px solid #2a2a44', paddingTop: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ fontSize: 10, color: '#666' }}>Compliance-Score</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 60, background: '#2a2a44', borderRadius: 8, height: 5 }}>
                      <div style={{ width: '28%', background: '#ef4444', height: 5, borderRadius: 8 }} />
                    </div>
                    <span style={{ fontSize: 16, fontWeight: 900, color: '#ef4444' }}>28<span style={{ fontSize: 10, color: '#666' }}>/100</span></span>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 10, color: '#666' }}>AI-Trust Score</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 60, background: '#2a2a44', borderRadius: 8, height: 5 }}>
                      <div style={{ width: '45%', background: '#8B5CF6', height: 5, borderRadius: 8 }} />
                    </div>
                    <span style={{ fontSize: 16, fontWeight: 900, color: '#8B5CF6' }}>45<span style={{ fontSize: 10, color: '#666' }}>/100</span></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div>
            <h2 style={{ fontSize: 26, fontWeight: 800, marginBottom: 10 }}>So sieht Ihr Ergebnis aus</h2>
            <p style={{ fontSize: 13, color: G.textSec, marginBottom: 20, lineHeight: 1.6 }}>In Sekunden sehen Sie, wo Ihre Website rechtliche Risiken hat – klar, verständlich, ohne Fachjargon.</p>
            {[
              { ic: '🔍', t: 'Alle Tracker werden erkannt', d: 'Google Analytics, Facebook Pixel, Hotjar – wir finden jeden Drittanbieter.' },
              { ic: '🚦', t: 'Ampel zeigt Handlungsbedarf', d: 'Rot, Gelb, Grün – auf einen Blick sehen Sie, was behoben werden muss.' },
              { ic: '⚡', t: 'Policy mit einem Klick generieren', d: 'Datenschutzerklärung erstellen, herunterladen, einbinden. Fertig.' },
              { ic: '🤖', t: 'KI-Bilder automatisch erkennen', d: 'Deepfakes und KI-generierte Inhalte auf Ihrer Website finden — EU AI Act konform.' },
            ].map(p => (
              <div key={p.t} style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
                <span style={{ flexShrink: 0 }}><IconEl ic={p.ic} size={22} /></span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 2 }}>{p.t}</div>
                  <div style={{ fontSize: 12, color: G.textSec, lineHeight: 1.5 }}>{p.d}</div>
                </div>
              </div>
            ))}
            <button onClick={() => { document.getElementById('hero-scanner')?.scrollIntoView({ behavior: 'smooth', block: 'center' }); setTimeout(() => document.getElementById('hero-url-input')?.focus(), 500); }} style={{ marginTop: 12, padding: '13px 32px', background: '#22c55e', color: '#fff', fontWeight: 700, borderRadius: 12, border: 'none', fontSize: 16, cursor: 'pointer', transition: 'background 0.2s' }}>Jetzt kostenlos prüfen →</button>
          </div>
        </div>
      </section>
*/

// ═══════════════════════════════════════════════════════
// ABSCHNITT: STATS (4'800+, 73%, 0%, 3 min) → /tools
// ═══════════════════════════════════════════════════════
/*
      <section style={{ maxWidth: 860, margin: '0 auto', padding: '40px 24px' }}>
        <div className="grid-4col" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, textAlign: 'center' }}>
          {[
            { ic: '📊', n: "4\u2019800+", l: 'Schweizer KMUs betroffen von nDSG-Pflichten' },
            { ic: '⚠️', n: '73%', l: 'der Schweizer Websites ohne korrekte DSE' },
            { ic: '🤖', n: '0%', l: 'der Schweizer Compliance-Tools prüfen KI-Inhalte' },
            { ic: '⚡', n: '3 min', l: 'bis Ihre Website vollständig geschützt ist' },
          ].map(s => (
            <div key={s.n} style={{ background: G.bgWhite, borderRadius: 14, padding: 24, border: `1px solid ${G.border}`, boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
              <div style={{ marginBottom: 6 }}><IconEl ic={s.ic} size={22} /></div>
              <div style={{ fontSize: 28, fontWeight: 900, color: G.green }}>{s.n}</div>
              <div style={{ fontSize: 12, color: G.textMuted, marginTop: 6, lineHeight: 1.5 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </section>
*/

// ═══════════════════════════════════════════════════════
// ABSCHNITT: COPY-PASTE VERGLEICH ("HÄUFIGSTER FEHLER") → /tools
// ═══════════════════════════════════════════════════════
/*
      <section style={{ maxWidth: 860, margin: '0 auto', padding: '50px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <span style={{ color: '#ef4444', fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' }}>HÄUFIGSTER FEHLER</span>
          <h2 style={{ fontSize: 28, fontWeight: 800, marginTop: 6 }}>
            &laquo;Ich kopiere einfach eine Datenschutzerklärung von einer anderen Website.&raquo;
          </h2>
          <p style={{ color: G.textSec, fontSize: 14, marginTop: 8 }}>Das machen 90% der KMUs. Und genau deshalb sind 73% nicht rechtskonform.</p>
        </div>

        <div className="grid-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 32 }}>
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 16, padding: 26, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, #ef4444, transparent)' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <img src="/fehler.png" alt="Fehler" width={24} height={24} />
              <h3 style={{ fontSize: 16, fontWeight: 800, color: '#991b1b' }}>Copy-Paste Datenschutzerklärung</h3>
            </div>
            {[
              { ic: '⚠️', t: 'Falsche Drittanbieter', d: 'Enthält Google Analytics, obwohl Sie es nicht nutzen — aber Ihr Stripe fehlt komplett.' },
              { ic: '⚠️', t: 'Falsche Jurisdiktion', d: 'Kopiert von einer .de-Website? Dann fehlt der nDSG-Teil. Kopiert von .ch? Dann fehlt DSGVO für deutsche Kunden.' },
              { ic: '⚠️', t: 'Veraltet ab Tag 1', d: 'Sie fügen ein Kontaktformular hinzu, wechseln den Hoster — die kopierte Policy weiss nichts davon.' },
              { ic: '⚠️', t: 'Rechtlich angreifbar', d: 'Eine falsche DSE ist schlimmer als keine — sie beweist, dass Sie es versucht aber falsch gemacht haben.' },
            ].map(r => (
              <div key={r.t} style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
                <span style={{ flexShrink: 0, marginTop: 2 }}><IconEl ic={r.ic} size={18} /></span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#991b1b', marginBottom: 2 }}>{r.t}</div>
                  <div style={{ fontSize: 12, color: '#7f1d1d', lineHeight: 1.6, opacity: 0.85 }}>{r.d}</div>
                </div>
              </div>
            ))}
            <div style={{ marginTop: 16, padding: '12px 14px', background: '#fee2e2', borderRadius: 10, fontSize: 12, color: '#991b1b', fontWeight: 600, textAlign: 'center' }}>
              <img src="/warnung.png" alt="" width={14} height={14} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: 6 }} />Bussgeld: bis CHF 250&apos;000 (nDSG) · bis €20 Mio. oder 4% des Jahresumsatzes (DSGVO)
            </div>
          </div>

          <div style={{ background: G.greenBg || 'rgba(34,197,94,0.04)', border: `1px solid ${G.green}33`, borderRadius: 16, padding: 26, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${G.green}, transparent)` }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <IconEl ic="✅" size={24} />
              <h3 style={{ fontSize: 16, fontWeight: 800, color: G.green }}>Dataquard — automatisch korrekt</h3>
            </div>
            {[
              { ic: '🔍', t: 'Echte Drittanbieter erkannt', d: 'Dataquard scannt Ihre Website und erkennt automatisch welche Dienste Sie wirklich nutzen — von Google Analytics über Meta Pixel bis zu versteckten Tracking-Pixeln in <noscript>-Tags. Über 35 Tracker-Patterns werden geprüft.' },
              { ic: '🚦', t: 'Richtige Jurisdiktion', d: 'Automatische Erkennung: nDSG, DSGVO oder beides — basierend auf Ihrer Domain, Ihrem Server und Ihren Besuchern.' },
              { ic: '🔄', t: 'Immer aktuell', d: 'Neuer Tracker? Neues Plugin? Dataquard erkennt Änderungen automatisch. Im Starter-Plan erhalten Sie monatliche Compliance-Reports per E-Mail. Im Professional-Plan wird Ihre Datenschutzerklärung sogar vollautomatisch aktualisiert.' },
              { ic: '🛡️', t: 'Rechtlich fundiert', d: 'Generiert nach nDSG Art. 19 und DSGVO Art. 13/14. Zusätzlich: EU AI Act Art. 50 Konformität — Dataquard erkennt KI-generierte Bilder und Deepfakes auf Ihrer Website und sorgt für die gesetzlich vorgeschriebene Kennzeichnung.' },
              { ic: '📊', t: '4-Säulen-Analyse', d: 'Dataquard ist der einzige Schweizer Website-Check, der gleichzeitig Compliance, Performance, Security und AI-Trust prüft. Kein anderes Tool bietet alle vier Säulen in einem Scan.' },
            ].map(r => (
              <div key={r.t} style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
                <span style={{ flexShrink: 0, marginTop: 2 }}><IconEl ic={r.ic} size={18} /></span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: G.green, marginBottom: 2 }}>{r.t}</div>
                  <div style={{ fontSize: 12, color: G.textSec, lineHeight: 1.6 }}>{r.d}</div>
                </div>
              </div>
            ))}
            <div style={{ marginTop: 16, padding: '12px 14px', background: `${G.green}12`, borderRadius: 10, fontSize: 12, color: G.green, fontWeight: 600, textAlign: 'center' }}>
              ✓ Ab CHF 19.–/Mt. · Jährliche Abrechnung · Rechtssicher · In 3 Minuten fertig
            </div>
          </div>
        </div>
      </section>
*/

// ═══════════════════════════════════════════════════════
// ABSCHNITT: VERGLEICH TABELLE (Dataquard vs. Wettbewerb) → /preise
// ═══════════════════════════════════════════════════════
/*
      <section style={{ maxWidth: 800, margin: '0 auto', padding: '50px 24px', borderTop: `1px solid ${G.border}` }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, textAlign: 'center', marginBottom: 24 }}>Dataquard vs. Wettbewerb — der einzige 4-Säulen-Check</h2>
        <div className="table-scroll" style={{ borderRadius: 14, overflow: 'hidden', border: `1px solid ${G.border}` }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead><tr style={{ background: G.bgLight }}>
              <th style={{ padding: '12px 14px', textAlign: 'left', color: G.textMuted, fontWeight: 600 }}>Feature</th>
              <th style={{ padding: 12, textAlign: 'center', color: G.green, fontWeight: 800 }}>Dataquard</th>
              <th style={{ padding: 12, textAlign: 'center', color: G.textMuted }}>PrivacyBee</th>
              <th style={{ padding: 12, textAlign: 'center', color: G.textMuted }}>iubenda</th>
            </tr></thead>
            <tbody>
              {[
                ['Compliance (nDSG + DSGVO)', '✅', '✅', '✅'],
                ['Performance-Check', '✅', '❌', '❌'],
                ['Security-Check', '✅', '❌', '❌'],
                ['Preis', 'ab CHF 19.–/Mt.', 'CHF 55/J.', '€ 144+/J.'],
                ['🤖 AI-Trust (EU AI Act Art. 50)', '✅', '❌', '❌'],
                ['🤖 KI-Bild-Erkennung', '✅', '❌', '❌'],
                ['🤖 Deepfake-Check', '✅', '❌', '❌'],
                ['Daten in der Schweiz', '✅', '✅', '❌'],
              ].map((r, i) => (
                <tr key={r[0]} style={{ background: i % 2 === 0 ? G.bgWhite : G.bg, borderTop: `1px solid ${G.border}` }}>
                  <td style={{ padding: '10px 14px', color: G.text }}>
                    {r[0].startsWith('🤖')
                      ? <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><IconEl ic="🤖" size={20} />{r[0].replace(/^🤖\s*/, '')}</span>
                      : r[0]}
                  </td>
                  <td style={{ padding: 10, textAlign: 'center', fontWeight: 700 }}>{r[1] === '✅' ? <IconEl ic="✅" size={24} /> : r[1] === '❌' ? <img src="/fehler.png" alt="Nein" width={24} height={24} /> : r[1] === '⚠️' ? <img src="/warnung.png" alt="Eingeschränkt" width={24} height={24} /> : r[1]}</td>
                  <td style={{ padding: 10, textAlign: 'center', color: G.textSec }}>{r[2] === '✅' ? <IconEl ic="✅" size={24} /> : r[2] === '❌' ? <img src="/fehler.png" alt="Nein" width={24} height={24} /> : r[2] === '⚠️' ? <img src="/warnung.png" alt="Eingeschränkt" width={24} height={24} /> : r[2]}</td>
                  <td style={{ padding: 10, textAlign: 'center', color: G.textSec }}>{r[3] === '✅' ? <IconEl ic="✅" size={24} /> : r[3] === '❌' ? <img src="/fehler.png" alt="Nein" width={24} height={24} /> : r[3] === '⚠️' ? <img src="/warnung.png" alt="Eingeschränkt" width={24} height={24} /> : r[3]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
*/

// ═══════════════════════════════════════════════════════
// ABSCHNITT: AGB ZUSAMMENFASSUNG → weg (Link zu /agb reicht)
// ═══════════════════════════════════════════════════════
/*
      <section style={{ maxWidth: 860, margin: '0 auto', padding: '50px 24px', borderTop: `1px solid ${G.border}` }}>
        <div style={{ background: G.bgWhite, border: `1px solid ${G.border}`, borderRadius: 18, padding: '40px 32px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <h2 style={{ fontSize: 30, fontWeight: 800, marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}><img src="/ablage.png" alt="" width={40} height={40} style={{ display: 'inline-block' }} /> Allgemeine Geschäftsbedingungen</h2>
          <p style={{ color: G.textSec, fontSize: 13, maxWidth: 500, margin: '0 auto 28px' }}>Transparenz ist uns wichtig. Unsere AGB regeln die Nutzung klar und fair – ohne Kleingedrucktes.</p>
          <div className="grid-4col" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 24, textAlign: 'left' }}>
            {[
              { ic: '🔒', t: 'Datenschutz', d: 'Daten auf Schweizer Servern. Nie an Dritte.' },
              { ic: '💳', t: 'Zahlung', d: 'Jahresabo. Jederzeit kündbar.' },
              { ic: '↩️', t: '14 Tage Garantie', d: 'Geld zurück ohne Angabe von Gründen.' },
              { ic: '⚖️', t: 'Haftung', d: 'Keine Rechtsberatung. Anwalt empfohlen.' },
            ].map(a => (
              <div key={a.t} style={{ background: G.bgLight, border: `1px solid ${G.border}`, borderRadius: 10, padding: 16 }}>
                <div style={{ marginBottom: 6 }}><IconEl ic={a.ic} size={36} /></div>
                <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 4 }}>{a.t}</div>
                <div style={{ fontSize: 14, color: G.textSec, lineHeight: 1.5 }}>{a.d}</div>
              </div>
            ))}
          </div>
          <Link href="/agb" style={{ display: 'inline-block', padding: '13px 28px', border: `2px solid ${G.green}`, color: G.green, borderRadius: 8, fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>Vollständige AGB lesen →</Link>
        </div>
      </section>
*/

// ═══════════════════════════════════════════════════════
// ABSCHNITT: FAQ ACCORDION → weg (/faq Seite vorhanden)
// ═══════════════════════════════════════════════════════
/*
      <section style={{ maxWidth: 680, margin: '0 auto', padding: '50px 24px', borderTop: `1px solid ${G.border}` }} id="faq">
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <span style={{ color: G.green, fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' }}>FAQ</span>
          <h2 style={{ fontSize: 24, fontWeight: 800, marginTop: 6 }}>Häufig gestellte Fragen</h2>
          <p style={{ color: G.textSec, fontSize: 13, marginTop: 4 }}>Alles was Sie wissen müssen</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {faqs.map((faq, idx) => (
            <div key={idx} style={{ background: G.bgWhite, borderRadius: 10, border: `1px solid ${G.border}`, overflow: 'hidden' }}>
              <button onClick={() => setOpenFAQ(openFAQ === idx ? null : idx)} style={{ width: '100%', padding: '14px 18px', textAlign: 'left', background: 'transparent', border: 'none', color: G.text, fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>{faq.q}</span>
                <span style={{ color: G.green, fontSize: 20, fontWeight: 700 }}>{openFAQ === idx ? '−' : '+'}</span>
              </button>
              {openFAQ === idx && (
                <div style={{ padding: '12px 18px', borderTop: `1px solid ${G.border}`, fontSize: 14, color: G.textSec, lineHeight: 1.7 }}>{faq.a}</div>
              )}
            </div>
          ))}
        </div>
      </section>
*/
