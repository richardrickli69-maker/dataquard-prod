import { PDFDocument, rgb } from 'pdf-lib'
import fs from 'fs'
import path from 'path'

export async function generateInvoicePdf(params: {
  invoiceNumber: string
  date: string
  product: string
  amount: number
  customerEmail: string
}): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create()
  const page = pdfDoc.addPage([595, 842])
  const fontBytes = fs.readFileSync(path.join(process.cwd(), 'public/fonts/NotoSans-Regular.ttf'))
  const boldBytes = fs.readFileSync(path.join(process.cwd(), 'public/fonts/NotoSans-Bold.ttf'))
  const font = await pdfDoc.embedFont(fontBytes)
  const bold = await pdfDoc.embedFont(boldBytes)
  const { width, height } = page.getSize()

  const navy = rgb(0.102, 0.137, 0.494)
  const red = rgb(0.753, 0.224, 0.169)
  const gray = rgb(0.6, 0.6, 0.6)
  const lightgray = rgb(0.93, 0.93, 0.93)
  const black = rgb(0.1, 0.1, 0.1)
  const white = rgb(1, 1, 1)

  // Accent bar top
  page.drawRectangle({ x: 0, y: height - 4, width, height: 4, color: navy })

  // Logo einbetten
  const logoController = new AbortController()
  const logoTimeout = setTimeout(() => logoController.abort(), 5000)
  try {
    const logoRes = await fetch('https://dataquard.ch/logo.png', { signal: logoController.signal })
    const logoBuffer = await logoRes.arrayBuffer()
    const logoImage = await pdfDoc.embedPng(logoBuffer)
    const logoDims = logoImage.scale(0.12)
    page.drawImage(logoImage, {
      x: 50,
      y: height - 80,
      width: logoDims.width,
      height: logoDims.height,
    })
    // Logo-Text rechts davon
    page.drawText('Dataguard', { x: 50 + logoDims.width + 10, y: height - 60, size: 20, font: bold, color: navy })
    page.drawText('guard', { x: 50 + logoDims.width + 10 + font.widthOfTextAtSize('Data', 20), y: height - 60, size: 20, font: bold, color: red })
  } catch {
    // Fallback ohne Logo
    page.drawText('Data', { x: 50, y: height - 60, size: 22, font: bold, color: navy })
    page.drawText('guard', { x: 50 + font.widthOfTextAtSize('Data', 22), y: height - 60, size: 22, font: bold, color: red })
  } finally {
    clearTimeout(logoTimeout)
  }
  page.drawText('DSGVO / DSG Compliance-Lösungen', { x: 50, y: height - 80, size: 9, font, color: gray })

  // Rechnung Label rechts
  page.drawText('RECHNUNG', { x: width - 200, y: height - 55, size: 11, font: bold, color: navy })
  page.drawText(`Nr. ${params.invoiceNumber}`, { x: width - 200, y: height - 72, size: 10, font, color: rgb(0.35, 0.35, 0.35) })
  page.drawText(params.date, { x: width - 200, y: height - 86, size: 10, font, color: rgb(0.35, 0.35, 0.35) })

  // Trennlinie
  page.drawLine({ start: { x: 50, y: height - 100 }, end: { x: width - 50, y: height - 100 }, thickness: 1, color: lightgray })

  // Absender
  page.drawText('Richard Rickli  -  Gstadstrasse 53  -  4153 Reinach BL  -  Schweiz  -  richard@dataquard.ch', {
    x: 50, y: height - 120, size: 8.5, font, color: gray
  })

  // Empfaenger + Zahlungsart
  page.drawText('RECHNUNGSEMPFÄNGER', { x: 50, y: height - 150, size: 8, font: bold, color: gray })
  page.drawText(params.customerEmail, { x: 50, y: height - 164, size: 11, font, color: black })

  page.drawText('ZAHLUNGSART', { x: 280, y: height - 150, size: 8, font: bold, color: gray })
  page.drawText('Einmalkauf  -  Stripe', { x: 280, y: height - 164, size: 11, font, color: black })

  // Tabellen-Header
  const tableY = height - 210
  page.drawRectangle({ x: 50, y: tableY - 4, width: width - 100, height: 22, color: rgb(0.95, 0.96, 0.98) })
  page.drawText('BESCHREIBUNG', { x: 55, y: tableY + 4, size: 8.5, font: bold, color: navy })
  page.drawText('MENGE', { x: 390, y: tableY + 4, size: 8.5, font: bold, color: navy })
  page.drawText('BETRAG', { x: 460, y: tableY + 4, size: 8.5, font: bold, color: navy })

  // Tabellenzeile
  const rowY = tableY - 30
  page.drawText(params.product, { x: 55, y: rowY + 8, size: 12, font: bold, color: black })
  page.drawText('Datenschutzerklärung + Impressum + Cookie-Banner (1 Domain)', {
    x: 55, y: rowY - 6, size: 9, font, color: gray
  })
  page.drawText('1', { x: 398, y: rowY + 8, size: 12, font, color: black })
  page.drawText(`CHF ${params.amount.toFixed(2)}`, { x: 455, y: rowY + 8, size: 12, font, color: black })

  // Trennlinie
  page.drawLine({ start: { x: 50, y: rowY - 22 }, end: { x: width - 50, y: rowY - 22 }, thickness: 0.5, color: lightgray })

  // MwSt. Berechnung (8.1%)
  const mwstRate = 0.081
  const netto = params.amount / (1 + mwstRate)
  const mwst = params.amount - netto

  const t1Y = rowY - 40
  page.drawText('Zwischensumme', { x: 360, y: t1Y, size: 10, font, color: gray })
  page.drawText(`CHF ${netto.toFixed(2)}`, { x: 455, y: t1Y, size: 10, font, color: black })

  page.drawText('MwSt. 8.1%', { x: 360, y: t1Y - 18, size: 10, font, color: gray })
  page.drawText(`CHF ${mwst.toFixed(2)}`, { x: 455, y: t1Y - 18, size: 10, font, color: black })

  // Total Box
  const totalY = t1Y - 55
  page.drawRectangle({ x: 50, y: totalY - 8, width: width - 100, height: 38, color: navy })
  page.drawText('Total inkl. MwSt.', { x: 60, y: totalY + 14, size: 12, font: bold, color: white })
  page.drawText(`CHF ${params.amount.toFixed(2)}`, { x: 430, y: totalY + 14, size: 16, font: bold, color: white })

  // Bezahlt Badge
  page.drawRectangle({ x: 50, y: totalY - 35, width: 80, height: 18, color: rgb(0.91, 0.96, 0.91) })
  page.drawText('Bezahlt', { x: 62, y: totalY - 27, size: 9, font: bold, color: rgb(0.18, 0.49, 0.2) })

  // Footer
  page.drawLine({ start: { x: 50, y: 55 }, end: { x: width - 50, y: 55 }, thickness: 0.5, color: lightgray })
  page.drawText('dataquard.ch  -  richard@dataquard.ch', { x: 50, y: 40, size: 8.5, font, color: gray })
  page.drawText('Einzelunternehmen  -  Reinach BL  -  Schweiz', { x: 320, y: 40, size: 8.5, font, color: gray })

  const pdfBytes = await pdfDoc.save()
  return Buffer.from(pdfBytes)
}
