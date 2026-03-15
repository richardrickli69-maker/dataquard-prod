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

export async function generateInvoicePdf(params: {
  invoiceNumber: string
  date: string
  product: string           // z.B. "Dataquard Starter" oder "Dataquard AI-Trust Abo"
  description?: string      // optionale Produktbeschreibung
  amount: number
  customerEmail: string
  mode?: 'payment' | 'subscription'   // default: 'payment'
  subscriptionEndsAt?: string         // z.B. "13.03.2027" — nur für subscription
}): Promise<Buffer> {
  const mode = params.mode ?? 'payment'

  const pdfDoc = await PDFDocument.create()
  pdfDoc.registerFontkit(fontkit)
  const page = pdfDoc.addPage([595, 842])
  const { font, bold } = await loadFonts(pdfDoc)
  const { width, height } = page.getSize()

  // Farbpalette
  const green     = rgb(0.133, 0.773, 0.369)   // #22c55e
  const darkGreen = rgb(0.086, 0.529, 0.255)
  const violet    = rgb(0.545, 0.361, 0.965)    // #8B5CF6 (AI-Trust)
  const gray      = rgb(0.6, 0.6, 0.6)
  const lightgray = rgb(0.93, 0.93, 0.93)
  const black     = rgb(0.1, 0.1, 0.1)
  const white     = rgb(1, 1, 1)
  const lightGreenBg = rgb(0.91, 0.98, 0.93)
  const lightVioletBg = rgb(0.96, 0.94, 1.0)

  const isAiTrust = mode === 'subscription'
  const accentColor = isAiTrust ? violet : green
  const accentBg = isAiTrust ? lightVioletBg : lightGreenBg

  // Accent bar top
  page.drawRectangle({ x: 0, y: height - 4, width, height: 4, color: accentColor })

  // Logo
  const logoController = new AbortController()
  const logoTimeout = setTimeout(() => logoController.abort(), 5000)
  try {
    const logoRes = await fetch('https://www.dataquard.ch/logo.png', { signal: logoController.signal })
    const logoBuffer = await logoRes.arrayBuffer()
    const logoImage = await pdfDoc.embedPng(logoBuffer)
    const logoMaxWidth = 160
    const logoMaxHeight = 65
    const logoScale = Math.min(logoMaxWidth / logoImage.width, logoMaxHeight / logoImage.height)
    const logoWidth = logoImage.width * logoScale
    const logoHeight = logoImage.height * logoScale
    page.drawImage(logoImage, { x: 50, y: height - 40 - logoHeight, width: logoWidth, height: logoHeight })
  } catch {
    page.drawText('Data', { x: 50, y: height - 60, size: 22, font: bold, color: green })
    page.drawText('quard', { x: 50 + bold.widthOfTextAtSize('Data', 22), y: height - 60, size: 22, font: bold, color: darkGreen })
    page.drawText('DSGVO / DSG Compliance-Lösungen', { x: 50, y: height - 80, size: 9, font, color: gray })
  } finally {
    clearTimeout(logoTimeout)
  }

  // Rechnung Label rechts
  page.drawText('RECHNUNG', { x: width - 200, y: height - 55, size: 11, font: bold, color: accentColor })
  page.drawText(`Nr. ${params.invoiceNumber}`, { x: width - 200, y: height - 72, size: 10, font, color: rgb(0.35, 0.35, 0.35) })
  page.drawText(params.date, { x: width - 200, y: height - 86, size: 10, font, color: rgb(0.35, 0.35, 0.35) })

  // Trennlinie
  page.drawLine({ start: { x: 50, y: height - 100 }, end: { x: width - 50, y: height - 100 }, thickness: 1, color: lightgray })

  // Absender
  page.drawText('Richard Rickli · Gstadstrasse 53 · 4153 Reinach BL · Schweiz · info@dataquard.ch', {
    x: 50, y: height - 120, size: 8.5, font, color: gray,
  })

  // Empfänger + Zahlungsart
  page.drawText('RECHNUNGSEMPFÄNGER', { x: 50, y: height - 150, size: 8, font: bold, color: gray })
  page.drawText(params.customerEmail, { x: 50, y: height - 164, size: 11, font, color: black })

  const zahlungsart = mode === 'subscription' ? 'Jahres-Abo · Stripe' : 'Einmalkauf · Stripe / TWINT'
  page.drawText('ZAHLUNGSART', { x: 280, y: height - 150, size: 8, font: bold, color: gray })
  page.drawText(zahlungsart, { x: 280, y: height - 164, size: 11, font, color: black })

  // Tabellen-Header
  const tableY = height - 210
  page.drawRectangle({ x: 50, y: tableY - 4, width: width - 100, height: 22, color: accentBg })
  page.drawText('BESCHREIBUNG', { x: 55, y: tableY + 4, size: 8.5, font: bold, color: accentColor })
  page.drawText('MENGE', { x: 390, y: tableY + 4, size: 8.5, font: bold, color: accentColor })
  page.drawText('BETRAG', { x: 460, y: tableY + 4, size: 8.5, font: bold, color: accentColor })

  // Produktzeile
  const rowY = tableY - 30
  page.drawText(params.product, { x: 55, y: rowY + 8, size: 12, font: bold, color: black })

  // Beschreibung: dynamisch aus param oder Fallback je nach Plan
  const description = params.description ?? (
    mode === 'subscription'
      ? 'Laufende KI-Überwachung: Deepfake-Erkennung, EU AI Act Art. 50, Shield-Badge, E-Mail-Alerts'
      : 'Datenschutzerklärung + Impressum + Cookie-Banner + AI-Trust Scan'
  )
  page.drawText(description, { x: 55, y: rowY - 6, size: 9, font, color: gray })

  page.drawText('1', { x: 398, y: rowY + 8, size: 12, font, color: black })
  page.drawText(`CHF ${params.amount.toFixed(2)}`, { x: 455, y: rowY + 8, size: 12, font, color: black })

  // Laufzeit (nur bei Subscription)
  let extraRowOffset = 0
  if (mode === 'subscription' && params.subscriptionEndsAt) {
    extraRowOffset = 20
    page.drawText('Laufzeit: 1 Jahr (verlängert sich automatisch)', {
      x: 55, y: rowY - 20, size: 8.5, font, color: gray,
    })
    page.drawText(`Nächste Rechnung: ${params.subscriptionEndsAt}`, {
      x: 55, y: rowY - 33, size: 8.5, font, color: gray,
    })
  }

  // Trennlinie
  page.drawLine({
    start: { x: 50, y: rowY - 22 - extraRowOffset },
    end: { x: width - 50, y: rowY - 22 - extraRowOffset },
    thickness: 0.5, color: lightgray,
  })

  // MwSt.
  const mwstRate = 0.081
  const netto = params.amount / (1 + mwstRate)
  const mwst = params.amount - netto
  const t1Y = rowY - 40 - extraRowOffset

  page.drawText('Zwischensumme', { x: 360, y: t1Y, size: 10, font, color: gray })
  page.drawText(`CHF ${netto.toFixed(2)}`, { x: 455, y: t1Y, size: 10, font, color: black })
  page.drawText('MwSt. 8.1%', { x: 360, y: t1Y - 18, size: 10, font, color: gray })
  page.drawText(`CHF ${mwst.toFixed(2)}`, { x: 455, y: t1Y - 18, size: 10, font, color: black })

  // Total Box
  const totalY = t1Y - 55
  page.drawRectangle({ x: 50, y: totalY - 8, width: width - 100, height: 38, color: accentColor })
  page.drawText('Total inkl. MwSt.', { x: 60, y: totalY + 14, size: 12, font: bold, color: white })
  page.drawText(`CHF ${params.amount.toFixed(2)}`, { x: 430, y: totalY + 14, size: 16, font: bold, color: white })

  // Bezahlt Badge
  page.drawRectangle({ x: 50, y: totalY - 35, width: 80, height: 18, color: accentBg })
  page.drawText('Bezahlt', { x: 62, y: totalY - 27, size: 9, font: bold, color: isAiTrust ? violet : darkGreen })

  // Footer
  page.drawLine({ start: { x: 50, y: 55 }, end: { x: width - 50, y: 55 }, thickness: 0.5, color: lightgray })
  page.drawText('dataquard.ch · info@dataquard.ch', { x: 50, y: 40, size: 8.5, font, color: gray })
  page.drawText('Einzelunternehmen · Reinach BL · Schweiz', { x: 320, y: 40, size: 8.5, font, color: gray })

  const pdfBytes = await pdfDoc.save()
  return Buffer.from(pdfBytes)
}
