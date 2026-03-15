import { PDFDocument, rgb } from 'pdf-lib'
import fontkit from '@pdf-lib/fontkit'

const FONT_REGULAR = 'https://cdn.jsdelivr.net/gh/googlefonts/noto-fonts/hinted/ttf/NotoSans/NotoSans-Regular.ttf'
const FONT_BOLD = 'https://cdn.jsdelivr.net/gh/googlefonts/noto-fonts/hinted/ttf/NotoSans/NotoSans-Bold.ttf'

async function loadFonts(pdfDoc: Awaited<ReturnType<typeof PDFDocument.create>>) {
  const [fontRes, boldRes] = await Promise.all([fetch(FONT_REGULAR), fetch(FONT_BOLD)])
  if (!fontRes.ok) throw new Error(`Font load failed: ${fontRes.status}`)
  if (!boldRes.ok) throw new Error(`Bold font load failed: ${boldRes.status}`)
  const font = await pdfDoc.embedFont(Buffer.from(await fontRes.arrayBuffer()))
  const bold = await pdfDoc.embedFont(Buffer.from(await boldRes.arrayBuffer()))
  return { font, bold }
}

export async function generateInstallationPdf(params: {
  planLabel: string
  customerEmail: string
  isAiTrust?: boolean   // true → AI-Trust Inhalte statt DSE/Impressum/Cookie
}): Promise<Buffer> {
  const isAiTrust = params.isAiTrust === true

  const pdfDoc = await PDFDocument.create()
  pdfDoc.registerFontkit(fontkit)
  const page = pdfDoc.addPage([595, 842])
  const { font, bold } = await loadFonts(pdfDoc)
  const { width, height } = page.getSize()

  const green      = rgb(0.133, 0.773, 0.369)
  const darkGreen  = rgb(0.086, 0.529, 0.255)
  const violet     = rgb(0.545, 0.361, 0.965)
  const darkViolet = rgb(0.38, 0.22, 0.73)
  const gray       = rgb(0.6, 0.6, 0.6)
  const lightgray  = rgb(0.93, 0.93, 0.93)
  const black      = rgb(0.1, 0.1, 0.1)
  const white      = rgb(1, 1, 1)
  const lightGreenBg  = rgb(0.91, 0.98, 0.93)
  const lightVioletBg = rgb(0.96, 0.94, 1.0)

  const accentColor = isAiTrust ? violet : green
  const accentDark  = isAiTrust ? darkViolet : darkGreen
  const accentBg    = isAiTrust ? lightVioletBg : lightGreenBg

  // Accent bar top
  page.drawRectangle({ x: 0, y: height - 4, width, height: 4, color: accentColor })

  // Logo
  const logoController = new AbortController()
  const logoTimeout = setTimeout(() => logoController.abort(), 5000)
  try {
    const logoRes = await fetch('https://www.dataquard.ch/logo.png', { signal: logoController.signal })
    const logoBuffer = await logoRes.arrayBuffer()
    const logoImage = await pdfDoc.embedPng(logoBuffer)
    const logoMaxWidth = 120
    const logoMaxHeight = 50
    const logoScale = Math.min(logoMaxWidth / logoImage.width, logoMaxHeight / logoImage.height)
    const logoWidth = logoImage.width * logoScale
    const logoHeight = logoImage.height * logoScale
    page.drawImage(logoImage, { x: 50, y: height - 40 - logoHeight, width: logoWidth, height: logoHeight })
  } catch {
    page.drawText('Data', { x: 50, y: height - 70, size: 22, font: bold, color: green })
    page.drawText('quard', { x: 50 + bold.widthOfTextAtSize('Data', 22), y: height - 70, size: 22, font: bold, color: darkGreen })
    page.drawText('DSGVO / DSG Compliance-Lösungen', { x: 50, y: height - 90, size: 9, font, color: gray })
  } finally {
    clearTimeout(logoTimeout)
  }

  // Titel rechts
  const docTitle = isAiTrust ? 'AI-TRUST EINRICHTUNG' : 'INSTALLATIONSANLEITUNG'
  page.drawText(docTitle, { x: width - 230, y: height - 55, size: 10, font: bold, color: accentColor })
  page.drawText(`Dataquard ${params.planLabel}`, { x: width - 230, y: height - 70, size: 9, font, color: gray })

  // Trennlinie
  page.drawLine({ start: { x: 50, y: height - 116 }, end: { x: width - 50, y: height - 116 }, thickness: 1, color: lightgray })

  if (isAiTrust) {
    // ─── AI-TRUST INHALTE ────────────────────────────────────────────────────
    page.drawText('Ihr AI-Trust Abo einrichten — in 3 Schritten', { x: 50, y: height - 150, size: 16, font: bold, color: accentColor })
    page.drawText('KI-Überwachung, Deepfake-Erkennung und EU AI Act Art. 50 — automatisch aktiv.', {
      x: 50, y: height - 170, size: 10, font, color: gray,
    })

    // Hinweis-Box
    page.drawRectangle({ x: 50, y: height - 210, width: width - 100, height: 28, color: accentBg })
    page.drawText('Ihr AI-Trust Abo ist sofort aktiv. Die ersten Scans laufen automatisch im Hintergrund.', {
      x: 58, y: height - 198, size: 9, font, color: accentDark,
    })

    let y = height - 245

    // Schritt 1: Shield-Badge
    page.drawRectangle({ x: 50, y: y - 2, width: 22, height: 22, color: accentColor })
    page.drawText('1', { x: 58, y: y + 5, size: 11, font: bold, color: white })
    page.drawText('Shield-Badge in Website-Footer einbinden', { x: 80, y: y + 5, size: 12, font: bold, color: black })
    y -= 22
    for (const line of [
      '1. Anmelden unter dataquard.ch/dashboard',
      '2. Unter "AI-Trust" → "Shield-Badge" den Code-Snippet kopieren',
      '3. Code in Ihren Website-Footer einfügen (vor </body>):',
      '   WordPress: Appearance → Theme Editor → footer.php',
      '   Wix / Squarespace: Einstellungen → Benutzerdefinierter Code',
      '   Next.js: In layout.tsx, direkt vor </body>',
    ]) {
      page.drawText(line, { x: 80, y, size: 9.5, font, color: rgb(0.25, 0.25, 0.25) })
      y -= 16
    }

    // Schritt 2: Dashboard Monitoring
    y -= 14
    page.drawRectangle({ x: 50, y: y - 2, width: 22, height: 22, color: accentColor })
    page.drawText('2', { x: 58, y: y + 5, size: 11, font: bold, color: white })
    page.drawText('Dashboard für KI-Monitoring nutzen', { x: 80, y: y + 5, size: 12, font: bold, color: black })
    y -= 22
    for (const line of [
      '1. Unter dataquard.ch/dashboard → "AI-Trust" Tab öffnen',
      '2. Übersicht der erkannten KI-Bilder und Deepfake-Risiken prüfen',
      '3. Bei Bedarf: EU AI Act Art. 50 Klausel für Ihre DSE generieren',
      '4. Scan-Häufigkeit und zu prüfende URLs konfigurieren',
    ]) {
      page.drawText(line, { x: 80, y, size: 9.5, font, color: rgb(0.25, 0.25, 0.25) })
      y -= 16
    }

    // Schritt 3: E-Mail-Alerts
    y -= 14
    page.drawRectangle({ x: 50, y: y - 2, width: 22, height: 22, color: accentColor })
    page.drawText('3', { x: 58, y: y + 5, size: 11, font: bold, color: white })
    page.drawText('E-Mail-Alerts und Quartals-Report einrichten', { x: 80, y: y + 5, size: 12, font: bold, color: black })
    y -= 22
    for (const line of [
      '1. E-Mail-Alerts sind für Ihre Adresse automatisch aktiviert',
      '2. Sie erhalten eine Nachricht sobald neue KI-Inhalte erkannt werden',
      '3. Quartals-Report erscheint automatisch alle 3 Monate per E-Mail',
      '4. Alert-Einstellungen unter Dashboard → AI-Trust → Benachrichtigungen',
    ]) {
      page.drawText(line, { x: 80, y, size: 9.5, font, color: rgb(0.25, 0.25, 0.25) })
      y -= 16
    }

    // Abschluss-Box
    y -= 20
    page.drawRectangle({ x: 50, y: y - 10, width: width - 100, height: 48, color: accentBg })
    page.drawText('Ihr AI-Trust Abo ist aktiv — EU AI Act Art. 50 konform.', {
      x: 60, y: y + 24, size: 10, font: bold, color: accentDark,
    })
    page.drawText('Laufzeit: 1 Jahr, verlängert sich automatisch.', {
      x: 60, y: y + 10, size: 9, font, color: accentDark,
    })
    page.drawText('Bei Fragen: info@dataquard.ch', { x: 60, y: y - 2, size: 9, font, color: accentDark })

  } else {
    // ─── EINMALKAUF INHALTE (DSE / Impressum / Cookie-Banner) ───────────────
    page.drawText('So nutzen Sie Dataquard — Schritt für Schritt', { x: 50, y: height - 150, size: 16, font: bold, color: green })
    page.drawText('Datenschutz, KI-Compliance und Installationsanleitung für Schweizer KMU.', {
      x: 50, y: height - 170, size: 10, font, color: gray,
    })

    // Hinweis-Box
    page.drawRectangle({ x: 50, y: height - 210, width: width - 100, height: 28, color: accentBg })
    page.drawText('Neu: KI-Compliance nach EU AI Act Art. 50 — Deepfake-Check und KI-Klausel werden automatisch eingefügt.', {
      x: 58, y: height - 198, size: 9, font, color: darkGreen,
    })

    let y = height - 245

    // Schritt 1
    page.drawRectangle({ x: 50, y: y - 2, width: 22, height: 22, color: green })
    page.drawText('1', { x: 58, y: y + 5, size: 11, font: bold, color: white })
    page.drawText('Datenschutzerklärung einbinden', { x: 80, y: y + 5, size: 12, font: bold, color: black })
    y -= 22
    for (const line of [
      '1. Melden Sie sich unter dataquard.ch/dashboard an',
      '2. Klicken Sie auf "Datenschutzerklärung generieren"',
      '3. Dokument als PDF herunterladen und lokal speichern',
      '4. Auf Ihrer Website eine neue Seite /datenschutz erstellen',
      '5. Den generierten Text dort einfügen und Seite veröffentlichen',
      '6. Im Footer einen Link hinzufügen: <a href="/datenschutz">Datenschutz</a>',
    ]) {
      page.drawText(line, { x: 80, y, size: 9.5, font, color: rgb(0.25, 0.25, 0.25) })
      y -= 16
    }

    // Schritt 2
    y -= 14
    page.drawRectangle({ x: 50, y: y - 2, width: 22, height: 22, color: green })
    page.drawText('2', { x: 58, y: y + 5, size: 11, font: bold, color: white })
    page.drawText('Impressum einbinden', { x: 80, y: y + 5, size: 12, font: bold, color: black })
    y -= 22
    for (const line of [
      '1. Unter dataquard.ch/impressum-generator Ihre Daten eingeben',
      '2. Impressum als PDF herunterladen und lokal speichern',
      '3. Auf Ihrer Website eine neue Seite /impressum erstellen',
      '4. Den generierten Text einfügen und Seite veröffentlichen',
      '5. Im Footer einen Link hinzufügen: <a href="/impressum">Impressum</a>',
    ]) {
      page.drawText(line, { x: 80, y, size: 9.5, font, color: rgb(0.25, 0.25, 0.25) })
      y -= 16
    }

    // Schritt 3
    y -= 14
    page.drawRectangle({ x: 50, y: y - 2, width: 22, height: 22, color: green })
    page.drawText('3', { x: 58, y: y + 5, size: 11, font: bold, color: white })
    page.drawText('Cookie-Banner installieren', { x: 80, y: y + 5, size: 12, font: bold, color: black })
    y -= 22
    for (const line of [
      '1. Unter dataquard.ch/cookie-banner-generator Banner konfigurieren',
      '2. Wählen Sie React/Next.js oder Vanilla JS',
      '3. Code kopieren und auf Ihrer Website einfügen:',
      '   WordPress: Appearance → Theme Editor → footer.php → vor </body>',
      '   Wix / Squarespace: Einstellungen → Benutzerdefinierter Code',
      '   Next.js: In layout.tsx vor </body>',
    ]) {
      page.drawText(line, { x: 80, y, size: 9.5, font, color: rgb(0.25, 0.25, 0.25) })
      y -= 16
    }

    // Schritt 4: KI-Compliance
    y -= 12
    page.drawRectangle({ x: 50, y: y - 2, width: 22, height: 22, color: green })
    page.drawText('4', { x: 58, y: y + 5, size: 11, font: bold, color: white })
    page.drawText('KI-Compliance (EU AI Act Art. 50)', { x: 80, y: y + 5, size: 12, font: bold, color: black })
    y -= 22
    for (const line of [
      '1. Dataquard scannt automatisch alle Bilder auf KI-Generierung (Deepfake-Check)',
      '2. Falls KI-Inhalte erkannt werden, wird die EU AI Act Art. 50 Klausel',
      '   automatisch in Ihre Datenschutzerklärung eingefügt',
      '3. Kein manueller Aufwand — das System erledigt alles im Hintergrund',
      '4. RAM-only Verarbeitung: Keine Bildspeicherung, voller Datenschutz',
    ]) {
      page.drawText(line, { x: 80, y, size: 9.5, font, color: rgb(0.25, 0.25, 0.25) })
      y -= 16
    }

    // Abschluss-Box
    y -= 12
    page.drawRectangle({ x: 50, y: y - 10, width: width - 100, height: 36, color: lightGreenBg })
    page.drawText('Fertig! Ihre Website ist jetzt rechtssicher nach nDSG, DSGVO und EU AI Act Art. 50.', {
      x: 60, y: y + 12, size: 10, font: bold, color: darkGreen,
    })
    page.drawText('Bei Fragen: info@dataquard.ch', { x: 60, y: y - 2, size: 9, font, color: darkGreen })
  }

  // Footer (beide Varianten)
  page.drawLine({ start: { x: 50, y: 55 }, end: { x: width - 50, y: 55 }, thickness: 0.5, color: lightgray })
  page.drawText('dataquard.ch — info@dataquard.ch', { x: 50, y: 40, size: 8.5, font, color: gray })
  page.drawText('Einzelunternehmen — Reinach BL — Schweiz', { x: 320, y: 40, size: 8.5, font, color: gray })

  const pdfBytes = await pdfDoc.save()
  return Buffer.from(pdfBytes)
}
