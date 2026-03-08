import { PDFDocument, rgb } from 'pdf-lib'
import fontkit from '@pdf-lib/fontkit'

const FONT_REGULAR = 'https://cdn.jsdelivr.net/gh/googlefonts/noto-fonts/hinted/ttf/NotoSans/NotoSans-Regular.ttf'
const FONT_BOLD = 'https://cdn.jsdelivr.net/gh/googlefonts/noto-fonts/hinted/ttf/NotoSans/NotoSans-Bold.ttf'

async function loadFonts(pdfDoc: Awaited<ReturnType<typeof PDFDocument.create>>) {
  const [fontRes, boldRes] = await Promise.all([
    fetch(FONT_REGULAR),
    fetch(FONT_BOLD),
  ])
  if (!fontRes.ok) throw new Error(`Font load failed: ${fontRes.status}`)
  if (!boldRes.ok) throw new Error(`Bold font load failed: ${boldRes.status}`)
  const fontBytes = Buffer.from(await fontRes.arrayBuffer())
  const boldBytes = Buffer.from(await boldRes.arrayBuffer())
  const font = await pdfDoc.embedFont(fontBytes)
  const bold = await pdfDoc.embedFont(boldBytes)
  return { font, bold }
}

export async function generateInstallationPdf(params: {
  planLabel: string
  customerEmail: string
}): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create()
  pdfDoc.registerFontkit(fontkit)
  const page = pdfDoc.addPage([595, 842])
  const { font, bold } = await loadFonts(pdfDoc)
  const { width, height } = page.getSize()

  const navy = rgb(0.102, 0.137, 0.494)
  const red = rgb(0.753, 0.224, 0.169)
  const gray = rgb(0.6, 0.6, 0.6)
  const lightgray = rgb(0.93, 0.93, 0.93)
  const black = rgb(0.1, 0.1, 0.1)
  const green = rgb(0.18, 0.49, 0.2)
  const lightgreen = rgb(0.91, 0.96, 0.91)
  const white = rgb(1, 1, 1)

  // Accent bar top
  page.drawRectangle({ x: 0, y: height - 4, width, height: 4, color: navy })

  // Logo
  const logoController = new AbortController()
  const logoTimeout = setTimeout(() => logoController.abort(), 5000)
  try {
    const logoRes = await fetch('https://dataquard.ch/logo.png', { signal: logoController.signal })
    const logoBuffer = await logoRes.arrayBuffer()
    const logoImage = await pdfDoc.embedPng(logoBuffer)
    const logoDims = logoImage.scale(0.12)
    page.drawImage(logoImage, { x: 50, y: height - 86, width: logoDims.width, height: logoDims.height })
  } catch {
    page.drawText('Data', { x: 50, y: height - 60, size: 22, font: bold, color: navy })
    page.drawText('quard', { x: 50 + bold.widthOfTextAtSize('Data', 22), y: height - 60, size: 22, font: bold, color: red })
    page.drawText('DSGVO / DSG Compliance-Lösungen', { x: 50, y: height - 80, size: 9, font, color: gray })
  } finally {
    clearTimeout(logoTimeout)
  }

  // Titel rechts
  page.drawText('INSTALLATIONSANLEITUNG', { x: width - 230, y: height - 55, size: 10, font: bold, color: navy })
  page.drawText(`Dataquard ${params.planLabel}`, { x: width - 230, y: height - 70, size: 9, font, color: gray })

  // Trennlinie
  page.drawLine({ start: { x: 50, y: height - 100 }, end: { x: width - 50, y: height - 100 }, thickness: 1, color: lightgray })

  // Titel
  page.drawText('So installieren Sie Ihre Dokumente', { x: 50, y: height - 135, size: 16, font: bold, color: navy })
  page.drawText('Folgen Sie diesen Schritten um Ihre Website rechtssicher einzurichten.', {
    x: 50, y: height - 155, size: 10, font, color: gray
  })

  // Hinweis-Box
  page.drawRectangle({ x: 50, y: height - 195, width: width - 100, height: 28, color: rgb(0.99, 0.97, 0.88) })
  page.drawText('Tipp: Speichern Sie alle Dokumente in einem Ordner "Dataquard – [Ihre Domain]" auf Ihrem Computer.', {
    x: 58, y: height - 183, size: 9, font, color: rgb(0.57, 0.39, 0.06)
  })

  // Schritt 1
  let y = height - 230
  page.drawRectangle({ x: 50, y: y - 2, width: 22, height: 22, color: navy })
  page.drawText('1', { x: 58, y: y + 5, size: 11, font: bold, color: white })
  page.drawText('Datenschutzerklärung einbinden', { x: 80, y: y + 5, size: 12, font: bold, color: black })
  y -= 22
  const step1 = [
    '1. Melden Sie sich unter dataquard.ch/dashboard an',
    '2. Klicken Sie auf "Datenschutzerklärung generieren"',
    '3. Dokument als PDF herunterladen und lokal speichern',
    '4. Auf Ihrer Website eine neue Seite /datenschutz erstellen',
    '5. Den generierten Text dort einfügen und Seite veröffentlichen',
    '6. Im Footer einen Link hinzufügen: <a href="/datenschutz">Datenschutz</a>',
  ]
  for (const line of step1) {
    page.drawText(line, { x: 80, y, size: 9.5, font, color: rgb(0.25, 0.25, 0.25) })
    y -= 16
  }

  // Schritt 2
  y -= 14
  page.drawRectangle({ x: 50, y: y - 2, width: 22, height: 22, color: navy })
  page.drawText('2', { x: 58, y: y + 5, size: 11, font: bold, color: white })
  page.drawText('Impressum einbinden', { x: 80, y: y + 5, size: 12, font: bold, color: black })
  y -= 22
  const step2 = [
    '1. Unter dataquard.ch/impressum-generator Ihre Daten eingeben',
    '2. Impressum als PDF herunterladen und lokal speichern',
    '3. Auf Ihrer Website eine neue Seite /impressum erstellen',
    '4. Den generierten Text einfügen und Seite veröffentlichen',
    '5. Im Footer einen Link hinzufügen: <a href="/impressum">Impressum</a>',
  ]
  for (const line of step2) {
    page.drawText(line, { x: 80, y, size: 9.5, font, color: rgb(0.25, 0.25, 0.25) })
    y -= 16
  }

  // Schritt 3
  y -= 14
  page.drawRectangle({ x: 50, y: y - 2, width: 22, height: 22, color: navy })
  page.drawText('3', { x: 58, y: y + 5, size: 11, font: bold, color: white })
  page.drawText('Cookie-Banner installieren', { x: 80, y: y + 5, size: 12, font: bold, color: black })
  y -= 22
  const step3 = [
    '1. Unter dataquard.ch/cookie-banner-generator Banner konfigurieren',
    '2. Wählen Sie React/Next.js oder Vanilla JS',
    '3. Code kopieren und auf Ihrer Website einfügen:',
    '   WordPress: Appearance → Theme Editor → footer.php → vor </body>',
    '   Wix / Squarespace: Einstellungen → Benutzerdefinierter Code',
    '   Next.js: In layout.tsx vor </body>',
  ]
  for (const line of step3) {
    page.drawText(line, { x: 80, y, size: 9.5, font, color: rgb(0.25, 0.25, 0.25) })
    y -= 16
  }

  // Abschluss-Box
  y -= 20
  page.drawRectangle({ x: 50, y: y - 10, width: width - 100, height: 36, color: lightgreen })
  page.drawText('Fertig! Ihre Website ist jetzt rechtssicher nach nDSG / DSGVO.', {
    x: 60, y: y + 12, size: 10, font: bold, color: green
  })
  page.drawText('Bei Fragen: info@dataquard.ch', { x: 60, y: y - 2, size: 9, font, color: green })

  // Footer
  page.drawLine({ start: { x: 50, y: 55 }, end: { x: width - 50, y: 55 }, thickness: 0.5, color: lightgray })
  page.drawText('dataquard.ch – richard@dataquard.ch', { x: 50, y: 40, size: 8.5, font, color: gray })
  page.drawText('Einzelunternehmen – Reinach BL – Schweiz', { x: 320, y: 40, size: 8.5, font, color: gray })

  const pdfBytes = await pdfDoc.save()
  return Buffer.from(pdfBytes)
}