/**
 * Dataquard – Alle Textbausteine (Modules)
 * Version 2.1 – Februar 2026
 *
 * Jedes Modul ist ein eigenständiger Textblock.
 * Pflichtmodule (P1–P7) werden IMMER aktiviert.
 * Alle anderen Module werden vom Scanner oder Fragebogen gesteuert.
 */

// ---------------------------------------------------------------------------
// TYPEN
// ---------------------------------------------------------------------------

export interface CompanyData {
  firmenname: string;
  strasse: string;
  hausnummer: string;
  plz: string;
  ort: string;
  email: string;
  telefon?: string;
  websiteUrl: string;
  rechtsform: string;
  uidNummer?: string;
  vertretung?: string;
  hosterName?: string;
  hosterOrt?: string;
}

export interface ActiveModules {
  // Pflicht
  P1: boolean; P2: boolean; P3: boolean; P4: boolean;
  P5: boolean; P6: boolean; P7: boolean;
  // Website
  W1: boolean; W2: boolean; W3: boolean; W4: boolean;
  W5: boolean; W6: boolean; W7: boolean; W8: boolean;
  // Drittanbieter
  D1: boolean; D2: boolean; D3: boolean; D4: boolean;
  D5: boolean; D6: boolean; D7: boolean; D8: boolean;
  D9: boolean; D10: boolean; D11: boolean; D12: boolean;
  // Cookies
  C1: boolean; C2: boolean; C3: boolean; C4: boolean; C5: boolean;
  // Zahlung
  Z1: boolean; Z2: boolean; Z3: boolean;
  // HR
  HR1: boolean; HR2: boolean; HR3: boolean; HR4: boolean; HR5: boolean;
  // Transfer
  T1: boolean; T2: boolean;
}

export type ModuleKey = keyof ActiveModules;

// ---------------------------------------------------------------------------
// ABLEITUNGSLOGIK
// (Gegeben erkannte Dienste → welche Module werden automatisch aktiv?)
// ---------------------------------------------------------------------------

export function deriveModules(
  scannerModules: Partial<ActiveModules>,
  questionnaireModules: Partial<ActiveModules>
): ActiveModules {
  const m: ActiveModules = {
    // Pflichtmodule immer aktiv
    P1: true, P2: true, P3: true, P4: true, P5: true, P6: true, P7: true,
    // Website-Grundmodule immer aktiv
    W1: true, W2: true,
    // Rest aus Scanner + Fragebogen
    W3: false, W4: false, W5: false, W6: false, W7: false, W8: false,
    D1: false, D2: false, D3: false, D4: false, D5: false, D6: false,
    D7: false, D8: false, D9: false, D10: false, D11: false, D12: false,
    C1: true, C2: true, C3: false, C4: false, C5: false,
    Z1: false, Z2: false, Z3: false,
    HR1: false, HR2: false, HR3: false, HR4: false, HR5: false,
    T1: false, T2: false,
    ...scannerModules,
    ...questionnaireModules,
  };

  // --- Automatische Ableitungen ---

  // Analytics → C3 + T2
  if (m.D1 || m.D9) { m.C3 = true; m.T2 = true; }
  // YouTube → C3 + T2
  if (m.D5) { m.C3 = true; m.T2 = true; }
  // Werbung → C4 + T2
  if (m.D2 || m.D3 || m.D4) { m.C4 = true; m.T2 = true; }
  // Alle US-Dienste → T2
  if (m.D1 || m.D2 || m.D3 || m.D4 || m.D5 || m.D6 || m.D7 || m.D8 ||
      m.D9 || m.D10 || m.D11 || m.D12 || m.Z1 || m.Z2) {
    m.T2 = true;
  }
  // EU-Dienste → T1
  if (m.HR3) { m.T1 = true; }
  // Cookie-Consent-Banner wenn C3 oder C4
  if (m.C3 || m.C4) { m.C5 = true; }
  // Mailchimp → D10 aktiviert auch W4
  if (m.D10) { m.W4 = true; }
  // Calendly → D12 aktiviert auch W8
  if (m.D12) { m.W8 = true; }

  return m;
}

// ---------------------------------------------------------------------------
// TEXTBAUSTEINE – HILFSFUNKTIONEN
// ---------------------------------------------------------------------------

function fill(template: string, data: CompanyData): string {
  return template
    .replace(/{FIRMENNAME}/g, data.firmenname)
    .replace(/{STRASSE}/g, data.strasse)
    .replace(/{HAUSNUMMER}/g, data.hausnummer)
    .replace(/{PLZ}/g, data.plz)
    .replace(/{ORT}/g, data.ort)
    .replace(/{EMAIL_DATENSCHUTZ}/g, data.email)
    .replace(/{TELEFON}/g, data.telefon ?? '')
    .replace(/{WEBSITE_URL}/g, data.websiteUrl)
    .replace(/{HOSTER_NAME}/g, data.hosterName ?? 'einem Hosting-Anbieter')
    .replace(/{HOSTER_ORT}/g, data.hosterOrt ?? '');
}

// ---------------------------------------------------------------------------
// PFLICHTMODULE (P1–P7) – immer aktiv
// ---------------------------------------------------------------------------

export const MODULE_P1 = (data: CompanyData): string => fill(`## 1. Verantwortlicher

Verantwortlich für die Datenbearbeitungen, die über diese Website erfolgen, ist:

**{FIRMENNAME}**
{STRASSE} {HAUSNUMMER}
{PLZ} {ORT}, Schweiz

E-Mail: {EMAIL_DATENSCHUTZ}${data.telefon ? '\nTelefon: {TELEFON}' : ''}
Website: {WEBSITE_URL}

Wenn Sie Fragen oder Anliegen zum Datenschutz haben, können Sie uns jederzeit unter der oben genannten E-Mail-Adresse erreichen.
`, data);

export const MODULE_P2 = (): string => `## 2. Allgemeine Hinweise

Mit dieser Datenschutzerklärung informieren wir Sie darüber, welche Personendaten wir im Zusammenhang mit unserer Website und unseren Angeboten bearbeiten. Wir informieren insbesondere darüber, wofür, wie und wo wir welche Personendaten bearbeiten. Wir informieren ausserdem über die Rechte von Personen, deren Daten wir bearbeiten.

Personendaten sind alle Angaben, die sich auf eine bestimmte oder bestimmbare natürliche Person beziehen. Bearbeiten umfasst jeden Umgang mit Personendaten, namentlich das Beschaffen, Speichern, Verwenden, Verändern, Bekanntgeben und Löschen von Personendaten.
`;

export const MODULE_P3 = (hasEuTransfer: boolean): string => `## 3. Rechtsgrundlagen

Wir bearbeiten Personendaten im Einklang mit dem schweizerischen Datenschutzrecht, insbesondere dem Bundesgesetz über den Datenschutz (Datenschutzgesetz, DSG) und der Verordnung zum Bundesgesetz über den Datenschutz (Datenschutzverordnung, DSV).
${hasEuTransfer ? `
Soweit die Europäische Datenschutz-Grundverordnung (DSGVO) anwendbar ist, bearbeiten wir Personendaten gestützt auf folgende Rechtsgrundlagen:

- **Einwilligung** (Art. 6 Abs. 1 lit. a DSGVO): Die betroffene Person hat ihre Einwilligung zu der Bearbeitung gegeben.
- **Vertragserfüllung** (Art. 6 Abs. 1 lit. b DSGVO): Die Bearbeitung ist für die Erfüllung eines Vertrags erforderlich.
- **Rechtliche Verpflichtung** (Art. 6 Abs. 1 lit. c DSGVO): Die Bearbeitung ist zur Erfüllung einer rechtlichen Verpflichtung erforderlich.
- **Berechtigtes Interesse** (Art. 6 Abs. 1 lit. f DSGVO): Die Bearbeitung ist zur Wahrung berechtigter Interessen erforderlich.
` : ''}`;

export const MODULE_P4 = (): string => `## 4. Betroffenenrechte

Sie haben im Rahmen des auf Sie anwendbaren Datenschutzrechts und soweit darin vorgesehen folgende Rechte:

- **Recht auf Auskunft:** Sie können Auskunft darüber verlangen, ob und welche Personendaten wir über Sie bearbeiten (Art. 25 DSG).
- **Recht auf Berichtigung:** Sie können die Berichtigung unrichtiger Personendaten verlangen.
- **Recht auf Löschung:** Sie können die Löschung Ihrer Personendaten verlangen.
- **Recht auf Datenübertragbarkeit:** Sie können verlangen, dass wir Ihnen Ihre Personendaten in einem gängigen Format übergeben (Art. 28 DSG).
- **Recht auf Widerspruch und Widerruf:** Sie können der Bearbeitung jederzeit widersprechen und Ihre Einwilligung jederzeit widerrufen.
- **Recht auf Beschwerde:** Sie haben das Recht, eine Beschwerde beim Eidgenössischen Datenschutz- und Öffentlichkeitsbeauftragten (EDÖB) einzureichen.

Um diese Rechte geltend zu machen, können Sie sich jederzeit an uns wenden unter der in Ziffer 1 genannten Adresse.
`;

export const MODULE_P5 = (): string => `## 5. Speicherdauer

Wir speichern Personendaten nur so lange, wie dies für den jeweiligen Zweck erforderlich ist. Vertragsdaten speichern wir länger, da wir dazu durch gesetzliche Aufbewahrungspflichten verpflichtet sind (z.B. 10 Jahre gemäss Art. 958f OR) und weil wir die Daten allenfalls für die Durchsetzung und Abwehr von Ansprüchen benötigen.
`;

export const MODULE_P6 = (): string => `## 6. Datensicherheit

Wir treffen angemessene technische und organisatorische Sicherheitsmassnahmen, um den Schutz der Personendaten vor unberechtigtem Zugriff und Missbrauch sicherzustellen (Art. 8 DSG). Dazu gehören unter anderem der Einsatz von Verschlüsselung, Firewalls, Zugriffskontrollen und sichere Datenübertragung.

Wir können die Sicherheit der Daten jedoch nicht vollständig gewährleisten. Die Kommunikation über das Internet kann Sicherheitslücken aufweisen.
`;

export const MODULE_P7 = (): string => `## 7. Änderungen der Datenschutzerklärung

Wir können diese Datenschutzerklärung jederzeit anpassen und ergänzen. Wir werden über solche Anpassungen in geeigneter Form informieren, insbesondere durch Veröffentlichung der jeweils aktuellen Datenschutzerklärung auf unserer Website.
`;

// ---------------------------------------------------------------------------
// WEBSITE-MODULE (W1–W8)
// ---------------------------------------------------------------------------

export const MODULE_W1 = (data: CompanyData, serverLocation: 'CH' | 'EU' | 'USA'): string => {
  const locationText = {
    CH: `Der Server befindet sich in der Schweiz bei ${data.hosterName}, ${data.hosterOrt}.`,
    EU: `Der Server befindet sich in der EU. Ihre Daten sind durch die DSGVO geschützt.`,
    USA: `Der Server befindet sich in den USA. Wir haben geeignete Garantien (Standardvertragsklauseln) getroffen.`,
  }[serverLocation];

  return fill(`## Server-Logfiles und Hosting

Unsere Website wird bei **{HOSTER_NAME}** gehostet. Beim Besuch unserer Website werden automatisch Server-Logfiles erfasst:

- IP-Adresse des zugreifenden Geräts
- Datum und Uhrzeit des Zugriffs
- Name und URL der abgerufenen Seite
- Verwendeter Webbrowser und Betriebssystem
- Referrer-URL (die zuvor besuchte Seite)
- Übertragene Datenmenge

Diese Daten werden aus technischen Gründen benötigt und nach 14 Tagen gelöscht.

${locationText}
`, data);
};

export const MODULE_W2 = (): string => `## SSL/TLS-Verschlüsselung

Unsere Website nutzt aus Sicherheitsgründen eine SSL- bzw. TLS-Verschlüsselung. Eine verschlüsselte Verbindung erkennen Sie daran, dass die Adresszeile von «http://» auf «https://» wechselt und an dem Schloss-Symbol in Ihrer Browserzeile.
`;

export const MODULE_W3 = (): string => `## Kontaktformular

Wenn Sie uns über unser Kontaktformular eine Nachricht senden, werden die von Ihnen angegebenen Daten (z.B. Name, E-Mail-Adresse, Nachricht) zum Zweck der Bearbeitung Ihrer Anfrage bei uns gespeichert. Die Angabe der E-Mail-Adresse ist erforderlich. Die Daten werden gelöscht, sobald Ihre Anfrage vollständig bearbeitet wurde und keine gesetzlichen Aufbewahrungspflichten entgegenstehen.
`;

export const MODULE_W4 = (hasMailchimp: boolean): string => `## Newsletter

Wenn Sie unseren Newsletter abonnieren, verwenden wir die hierfür angegebene E-Mail-Adresse ausschliesslich für den Versand des Newsletters. Die Anmeldung erfolgt im Double-Opt-In-Verfahren. Sie können Ihre Einwilligung jederzeit über den Abmeldelink im Newsletter widerrufen.
${hasMailchimp ? `
Für den Versand nutzen wir Mailchimp (Rocket Science Group LLC, USA). Ihre E-Mail-Adresse wird auf Servern in den USA gespeichert. Wir haben einen Auftragsverarbeitungsvertrag abgeschlossen und geeignete Garantien getroffen.
` : ''}`;

export const MODULE_W5 = (): string => `## E-Commerce / Online-Shop

Wenn Sie eine Bestellung aufgeben, erheben wir: Name und Anschrift, E-Mail-Adresse, Telefonnummer (sofern angegeben), Bestelldaten und Zahlungsinformationen. Diese Daten werden zur Vertragsabwicklung verwendet und gemäss gesetzlichen Aufbewahrungspflichten (10 Jahre OR) gespeichert.
`;

export const MODULE_W6 = (): string => `## Login-Bereich / Benutzerkonto

Für die Nutzung unseres Login-Bereichs verarbeiten wir Ihre Zugangsdaten (E-Mail-Adresse, Passwort) sowie Ihre Aktivitäten im eingeloggten Bereich. Passwörter werden verschlüsselt gespeichert und sind für uns nicht lesbar.
`;

export const MODULE_W7 = (): string => `## Blog und Kommentare

Auf unserer Website bieten wir einen Blog an. Wenn Sie einen Kommentar hinterlassen, werden Ihr Name, Ihre E-Mail-Adresse (nicht veröffentlicht) und Ihr Kommentar gespeichert. Wir behalten uns vor, Kommentare ohne Angabe von Gründen zu löschen.
`;

export const MODULE_W8 = (hasCalendly: boolean): string => `## Online-Terminbuchung

Wenn Sie über unsere Website einen Termin buchen, werden Ihre Daten (Name, E-Mail, Telefon, gewünschter Termin) zur Terminvereinbarung verarbeitet.
${hasCalendly ? `
Für die Terminbuchung verwenden wir Calendly (Calendly LLC, USA). Ihre Daten werden auf Servern in den USA verarbeitet.
` : ''}`;

// ---------------------------------------------------------------------------
// DRITTANBIETER-MODULE (D1–D12) – nur wenn Scanner erkennt
// ---------------------------------------------------------------------------

export const MODULE_D1 = (): string => `## Google Analytics

Wir verwenden Google Analytics, einen Webanalysedienst der Google Ireland Limited. Google Analytics verwendet Cookies, die eine Analyse der Benutzung der Website ermöglichen. Wir verwenden Google Analytics mit der Erweiterung «_anonymizeIp()», wodurch IP-Adressen gekürzt verarbeitet werden. Die erzeugten Informationen werden an einen Server von Google in den USA übertragen. Sie können die Erfassung verhindern: https://tools.google.com/dlpage/gaoptout
`;

export const MODULE_D2 = (): string => `## Google Ads

Wir nutzen Google Ads (Google Ireland Limited) für Online-Werbung. Beim Besuch unserer Website können Cookies gesetzt werden, die Google zur Erfolgsmessung unserer Anzeigen nutzt. Daten können in die USA übermittelt werden. Mehr: https://policies.google.com/privacy
`;

export const MODULE_D3 = (): string => `## Meta Pixel (Facebook/Instagram)

Wir nutzen das Meta Pixel von Meta Platforms Ireland Limited. Beim Besuch wird eine Verbindung zu Meta-Servern hergestellt. Meta ordnet diese Information Ihrem Benutzerkonto zu, sofern Sie bei Facebook/Instagram angemeldet sind. Daten können in die USA übermittelt werden. Mehr: https://www.facebook.com/privacy/policy/
`;

export const MODULE_D4 = (): string => `## LinkedIn Insight Tag

Wir verwenden den LinkedIn Insight Tag (LinkedIn Ireland Unlimited Company). Damit können wir Informationen über Besucher unserer Website erhalten, die LinkedIn-Mitglieder sind, und Anzeigen auf LinkedIn schalten. Daten können in die USA übermittelt werden. Mehr: https://www.linkedin.com/legal/privacy-policy
`;

export const MODULE_D5 = (): string => `## YouTube-Videos

Wir binden Videos von YouTube ein (Google Ireland Limited). Beim Aufrufen wird eine Verbindung zu YouTube hergestellt. Wir nutzen den erweiterten Datenschutzmodus. Beim Abspielen werden Cookies gesetzt und Daten können in die USA übermittelt werden.
`;

export const MODULE_D6 = (): string => `## Google Maps

Wir verwenden Google Maps (Google Ireland Limited). Beim Aufrufen wird eine Verbindung zu Google hergestellt. Ihre IP-Adresse und Ihr Standort können an Google übermittelt werden. Mehr: https://policies.google.com/privacy
`;

export const MODULE_D7 = (): string => `## Google Fonts

Unsere Website nutzt Google Fonts (Google Ireland Limited). Beim Aufrufen lädt Ihr Browser Schriftarten von einem Google-Server, wobei Ihre IP-Adresse an Google übermittelt wird. Daten können in die USA übermittelt werden.
`;

export const MODULE_D8 = (): string => `## Vimeo

Wir binden Videos von Vimeo ein (Vimeo Inc., USA). Beim Aufrufen wird eine Verbindung zu Vimeo-Servern hergestellt. Dabei kann Ihre IP-Adresse und das aufgerufene Video erfasst werden. Mehr: https://vimeo.com/privacy
`;

export const MODULE_D9 = (): string => `## Hotjar

Wir verwenden Hotjar (Hotjar Ltd., Malta). Hotjar ermöglicht es uns, das Nutzerverhalten auf unserer Website zu analysieren (Heatmaps, Sitzungsaufzeichnungen). Hotjar setzt Cookies und kann Daten in die USA übermitteln. Mehr: https://www.hotjar.com/legal/policies/privacy/
`;

export const MODULE_D10 = (): string => `## Mailchimp

Für den Versand unseres Newsletters nutzen wir Mailchimp (Rocket Science Group LLC, USA). Ihre E-Mail-Adresse wird auf Servern in den USA gespeichert. Wir haben einen Auftragsverarbeitungsvertrag abgeschlossen. Mehr: https://mailchimp.com/legal/privacy/
`;

export const MODULE_D11 = (): string => `## HubSpot

Wir nutzen HubSpot (HubSpot, Inc., USA) für CRM und Marketing. HubSpot kann Cookies setzen und Nutzerdaten erfassen. Ihre Daten werden auf Servern in den USA verarbeitet. Mehr: https://legal.hubspot.com/privacy-policy
`;

export const MODULE_D12 = (): string => `## Calendly

Für die Online-Terminbuchung nutzen wir Calendly (Calendly LLC, USA). Ihre Daten werden auf Servern in den USA verarbeitet. Mehr: https://calendly.com/privacy
`;

// ---------------------------------------------------------------------------
// COOKIE-MODULE (C1–C5) – automatisch abgeleitet
// ---------------------------------------------------------------------------

export const MODULE_C1 = (): string => `## Cookies – Allgemeines

Unsere Website verwendet Cookies. Bei Cookies handelt es sich um kleine Textdateien, die in Ihrem Browser gespeichert werden. Sie können das Setzen von Cookies über Ihre Browsereinstellungen verhindern und bereits gespeicherte Cookies löschen. Bitte beachten Sie, dass ohne Cookies möglicherweise nicht alle Funktionen nutzbar sind.
`;

export const MODULE_C2 = (): string => `## Technisch notwendige Cookies

Wir verwenden technisch notwendige Cookies für den Betrieb unserer Website: Session-Cookies, Cookies zur Speicherung Ihrer Cookie-Präferenzen und – bei Online-Shops – Cookies für die Warenkorbfunktion. Diese Cookies werden ohne Einwilligung gesetzt, da sie technisch zwingend erforderlich sind.
`;

export const MODULE_C3 = (): string => `## Analyse-Cookies

Wir verwenden Analyse-Cookies, um das Nutzungsverhalten unserer Besucher zu verstehen und unser Angebot zu verbessern. Diese Cookies werden nur mit Ihrer ausdrücklichen Einwilligung gesetzt. Sie können Ihre Einwilligung jederzeit über die Cookie-Einstellungen widerrufen.
`;

export const MODULE_C4 = (): string => `## Marketing-Cookies

Wir verwenden Marketing-Cookies, um Ihnen relevante Werbung anzuzeigen und die Wirksamkeit unserer Werbekampagnen zu messen. Diese Cookies werden nur mit Ihrer ausdrücklichen Einwilligung gesetzt. Sie können Ihre Einwilligung jederzeit widerrufen.
`;

export const MODULE_C5 = (): string => `## Cookie-Banner

Beim ersten Besuch unserer Website erscheint ein Cookie-Banner. Dort können Sie wählen:

- **Alles akzeptieren** – alle Cookies zulassen
- **Nur notwendige Cookies** – nur technisch erforderliche Cookies
- **Einstellungen** – individuelle Auswahl

Mehr Informationen finden Sie in dieser Datenschutzerklärung.
`;

// ---------------------------------------------------------------------------
// ZAHLUNGS-MODULE (Z1–Z3) – Fragebogen Schritt 2 + Scanner
// ---------------------------------------------------------------------------

export const MODULE_Z1 = (): string => `## Stripe (Zahlungsabwicklung)

Für die Zahlungsabwicklung nutzen wir Stripe (Stripe Payments Europe, Ltd., Irland). Ihre Zahlungsdaten werden direkt an Stripe übermittelt. Wir erhalten nur eine Bestätigung. Ihre Zahlungsdaten werden nicht auf unseren Servern gespeichert. Daten können in die USA übermittelt werden. Mehr: https://stripe.com/privacy
`;

export const MODULE_Z2 = (): string => `## PayPal

Wir bieten Zahlung über PayPal an (PayPal (Europe) S.à r.l. et Cie, Luxemburg). Ihre Zahlungsdaten werden an PayPal übermittelt. Mehr: https://www.paypal.com/ch/webapps/mpp/ua/privacy-full
`;

export const MODULE_Z3 = (): string => `## TWINT

Wir bieten Zahlung über TWINT an (TWINT AG, Schweiz). Die Transaktion wird über die TWINT-App abgewickelt. Ihre Daten verbleiben in der Schweiz.
`;

// ---------------------------------------------------------------------------
// HR-MODULE (HR1–HR5) – USP-Feature, fehlt bei fast allen Wettbewerbern
// ---------------------------------------------------------------------------

export const MODULE_HR1 = (): string => `## Bewerbungen über Website

Wenn Sie sich über unsere Website bewerben, erheben wir: Name, Kontaktdaten, Bewerbungsunterlagen (Lebenslauf, Motivationsschreiben, Zeugnisse) sowie weitere Angaben, die Sie freiwillig mitteilen. Wir verwenden diese Daten ausschliesslich für das Bewerbungsverfahren. Kommt es zu einem Arbeitsverhältnis, werden Ihre Daten in die Personalakte übernommen. Andernfalls werden sie spätestens 3 Monate nach der Absage gelöscht, sofern Sie nicht der längeren Aufbewahrung zugestimmt haben.
`;

export const MODULE_HR2 = (): string => `## Bewerbungen per E-Mail

Wenn Sie sich per E-Mail bewerben, werden Ihre Bewerbungsunterlagen und Personendaten zum Zweck des Bewerbungsverfahrens verarbeitet. Bitte beachten Sie, dass E-Mails unverschlüsselt übertragen werden können. Die Aufbewahrungsfrist beträgt 3 Monate nach Abschluss des Verfahrens.
`;

export const MODULE_HR3 = (): string => `## Recruiting-Plattformen

Wir nutzen für Stellenausschreibungen folgende Plattformen:

- **jobs.ch** (JobCloud AG, Schweiz)
- **LinkedIn** (LinkedIn Ireland Unlimited Company – Daten können in die USA übermittelt werden)
- **Indeed** (Indeed Ireland Operations Ltd., Irland)

Wenn Sie sich über eine Plattform bewerben, gelten zusätzlich deren Datenschutzbestimmungen.
`;

export const MODULE_HR4 = (): string => `## Talent-Pool

Wir möchten Ihre Unterlagen in unserem Talent-Pool aufbewahren, um Sie bei zukünftigen Stellen zu berücksichtigen. Dies erfolgt ausschliesslich mit Ihrer ausdrücklichen Einwilligung. Ihre Daten werden maximal 12 Monate aufbewahrt. Sie können Ihre Einwilligung jederzeit widerrufen.
`;

export const MODULE_HR5 = (): string => `## Mitarbeiterdaten

Im Rahmen des Arbeitsverhältnisses bearbeiten wir: Personalien, AHV-Nummer und Sozialversicherungsdaten, Lohndaten und Bankinformationen, Angaben zu Arbeitszeit und Absenzen sowie Arbeitszeugnisse. Diese Daten werden zur Vertragserfüllung, Lohnabrechnung und Einhaltung gesetzlicher Vorschriften verarbeitet. Aufbewahrung: 10 Jahre für Lohndaten, 5 Jahre für übrige Personaldaten nach Ende des Arbeitsverhältnisses.
`;

// ---------------------------------------------------------------------------
// TRANSFER-MODULE (T1–T2) – automatisch abgeleitet
// ---------------------------------------------------------------------------

export const MODULE_T1 = (): string => `## Datenübermittlung EU/EWR

Wir übermitteln Personendaten an Empfänger in der EU und im EWR. Die EU und der EWR verfügen nach Auffassung des Bundesrates über ein angemessenes Datenschutzniveau.
`;

export const MODULE_T2 = (): string => `## Datenübermittlung USA

Einige der von uns genutzten Dienste haben ihren Sitz in den USA. Die USA verfügen möglicherweise nicht über ein gleichwertiges Datenschutzniveau. Soweit wir Personendaten in die USA übermitteln, treffen wir geeignete Garantien (z.B. EU-Standardvertragsklauseln, verbindliche Unternehmensvorschriften oder Zertifizierungen).
`;

// ---------------------------------------------------------------------------
// IMPRESSUM-GENERATOR
// ---------------------------------------------------------------------------

export function generateImpressum(data: CompanyData): string {
  return `# Impressum

**${data.firmenname}**
${data.strasse} ${data.hausnummer}
${data.plz} ${data.ort}, Schweiz
${data.uidNummer ? `\nUID: ${data.uidNummer}` : ''}
${data.vertretung ? `Vertretungsberechtigte Person: ${data.vertretung}` : ''}

E-Mail: ${data.email}${data.telefon ? ` | Telefon: ${data.telefon}` : ''}
Website: ${data.websiteUrl}

**Haftungsausschluss:** Die Inhalte dieser Website werden mit grösster Sorgfalt erstellt. Der Anbieter übernimmt jedoch keine Gewähr für die Richtigkeit, Vollständigkeit und Aktualität der bereitgestellten Inhalte.

**Urheberrecht:** Die Inhalte und Werke unterliegen dem schweizerischen Urheberrecht. Jede Verwertung ausserhalb der Grenzen des Urheberrechts bedarf der schriftlichen Zustimmung.
`;
}

// ---------------------------------------------------------------------------
// HAUPT-GENERATOR: Baut die vollständige DSE aus aktiven Modulen
// ---------------------------------------------------------------------------

export function generatePrivacyPolicy(
  data: CompanyData,
  modules: ActiveModules,
  serverLocation: 'CH' | 'EU' | 'USA' = 'CH'
): string {
  const hasEuTransfer = modules.T1 || modules.T2;
  const sections: string[] = [];

  const heading = `# Datenschutzerklärung

*${data.firmenname} – ${data.websiteUrl}*
*Letzte Aktualisierung: ${new Date().toLocaleDateString('de-CH')}*

---
`;
  sections.push(heading);

  // Pflichtmodule
  if (modules.P1) sections.push(MODULE_P1(data));
  if (modules.P2) sections.push(MODULE_P2());
  if (modules.P3) sections.push(MODULE_P3(hasEuTransfer));
  if (modules.P4) sections.push(MODULE_P4());
  if (modules.P5) sections.push(MODULE_P5());
  if (modules.P6) sections.push(MODULE_P6());
  if (modules.P7) sections.push(MODULE_P7());

  // Website-Module
  if (modules.W1) sections.push(MODULE_W1(data, serverLocation));
  if (modules.W2) sections.push(MODULE_W2());
  if (modules.W3) sections.push(MODULE_W3());
  if (modules.W4) sections.push(MODULE_W4(modules.D10));
  if (modules.W5) sections.push(MODULE_W5());
  if (modules.W6) sections.push(MODULE_W6());
  if (modules.W7) sections.push(MODULE_W7());
  if (modules.W8) sections.push(MODULE_W8(modules.D12));

  // Drittanbieter
  const thirdParties: string[] = [];
  if (modules.D1)  thirdParties.push(MODULE_D1());
  if (modules.D2)  thirdParties.push(MODULE_D2());
  if (modules.D3)  thirdParties.push(MODULE_D3());
  if (modules.D4)  thirdParties.push(MODULE_D4());
  if (modules.D5)  thirdParties.push(MODULE_D5());
  if (modules.D6)  thirdParties.push(MODULE_D6());
  if (modules.D7)  thirdParties.push(MODULE_D7());
  if (modules.D8)  thirdParties.push(MODULE_D8());
  if (modules.D9)  thirdParties.push(MODULE_D9());
  if (modules.D10) thirdParties.push(MODULE_D10());
  if (modules.D11) thirdParties.push(MODULE_D11());
  if (modules.D12) thirdParties.push(MODULE_D12());
  if (thirdParties.length > 0) {
    sections.push('## Eingebundene Drittanbieter-Dienste\n');
    sections.push(...thirdParties);
  }

  // Cookies
  if (modules.C1) sections.push(MODULE_C1());
  if (modules.C2) sections.push(MODULE_C2());
  if (modules.C3) sections.push(MODULE_C3());
  if (modules.C4) sections.push(MODULE_C4());
  if (modules.C5) sections.push(MODULE_C5());

  // Zahlungen
  const payments: string[] = [];
  if (modules.Z1) payments.push(MODULE_Z1());
  if (modules.Z2) payments.push(MODULE_Z2());
  if (modules.Z3) payments.push(MODULE_Z3());
  if (payments.length > 0) {
    sections.push('## Zahlungsabwicklung\n');
    sections.push(...payments);
  }

  // HR-Module
  const hr: string[] = [];
  if (modules.HR1) hr.push(MODULE_HR1());
  if (modules.HR2) hr.push(MODULE_HR2());
  if (modules.HR3) hr.push(MODULE_HR3());
  if (modules.HR4) hr.push(MODULE_HR4());
  if (modules.HR5) hr.push(MODULE_HR5());
  if (hr.length > 0) {
    sections.push('## Bewerbungen und Personalwesen\n');
    sections.push(...hr);
  }

  // Transfer
  if (modules.T1) sections.push(MODULE_T1());
  if (modules.T2) sections.push(MODULE_T2());

  return sections.join('\n');
}