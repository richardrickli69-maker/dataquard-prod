import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export async function generateInvoicePdf(params: {
  invoiceNumber: string;
  date: string;
  product: string;
  amount: number;
  customerEmail: string;
}): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]); // A4
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const { width, height } = page.getSize();

  // Header
  page.drawText('Dataquard', { x: 50, y: height - 60, size: 24, font: fontBold, color: rgb(0.1, 0.2, 0.6) });
  page.drawText('DSGVO / DSG Compliance-Loesungen', { x: 50, y: height - 80, size: 10, font, color: rgb(0.5, 0.5, 0.5) });

  // Trennlinie
  page.drawLine({ start: { x: 50, y: height - 95 }, end: { x: width - 50, y: height - 95 }, thickness: 1, color: rgb(0.85, 0.85, 0.85) });

  // Absender
  page.drawText('Richard Rickli · Gstadstrasse 53 · 4153 Reinach BL · Schweiz', { x: 50, y: height - 120, size: 9, font, color: rgb(0.4, 0.4, 0.4) });

  // Titel
  page.drawText('Quittung / Rechnung', { x: 50, y: height - 170, size: 18, font: fontBold, color: rgb(0.1, 0.1, 0.1) });

  // Rechnungsdetails
  const details: [string, string][] = [
    ['Rechnungsnummer', params.invoiceNumber],
    ['Datum', params.date],
    ['Kunde', params.customerEmail],
    ['Produkt', params.product],
    ['Art', 'Einmalkauf'],
  ];
  let y = height - 220;
  for (const [label, value] of details) {
    page.drawText(label, { x: 50, y, size: 11, font, color: rgb(0.4, 0.4, 0.4) });
    page.drawText(value, { x: 220, y, size: 11, font: fontBold, color: rgb(0.1, 0.1, 0.1) });
    y -= 28;
  }

  // Trennlinie
  page.drawLine({ start: { x: 50, y: y - 10 }, end: { x: width - 50, y: y - 10 }, thickness: 1, color: rgb(0.85, 0.85, 0.85) });

  // Total
  page.drawText('Total', { x: 50, y: y - 40, size: 14, font: fontBold, color: rgb(0.1, 0.1, 0.1) });
  page.drawText(`CHF ${params.amount}`, { x: 220, y: y - 40, size: 14, font: fontBold, color: rgb(0.1, 0.2, 0.6) });

  // Footer
  page.drawText('Vielen Dank fuer Ihr Vertrauen · dataquard.ch · richard@dataquard.ch', { x: 50, y: 40, size: 9, font, color: rgb(0.5, 0.5, 0.5) });

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}
