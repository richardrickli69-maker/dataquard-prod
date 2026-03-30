// src/lib/generateAgencyInvoicePdf.ts
// Rechnung PDF fuer Agency-Abo-Checkout
// Gleiche Technologie wie generateInvoicePdf.ts: pdf-lib + NotoSans via CDN

import { PDFDocument, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';

const FONT_REGULAR = 'https://cdn.jsdelivr.net/gh/googlefonts/noto-fonts/hinted/ttf/NotoSans/NotoSans-Regular.ttf';
const FONT_BOLD    = 'https://cdn.jsdelivr.net/gh/googlefonts/noto-fonts/hinted/ttf/NotoSans/NotoSans-Bold.ttf';

async function loadFonts(pdfDoc: Awaited<ReturnType<typeof PDFDocument.create>>) {
  const [fontRes, boldRes] = await Promise.all([fetch(FONT_REGULAR), fetch(FONT_BOLD)]);
  if (!fontRes.ok) throw new Error(`Font regular failed: ${fontRes.status}`);
  if (!boldRes.ok) throw new Error(`Font bold failed: ${boldRes.status}`);
  const font = await pdfDoc.embedFont(Buffer.from(await fontRes.arrayBuffer()));
  const bold = await pdfDoc.embedFont(Buffer.from(await boldRes.arrayBuffer()));
  return { font, bold };
}

// Zufaellige 4-stellige Nummer fuer Rechnungsnummer
function rand4(): string {
  return String(Math.floor(1000 + Math.random() * 9000));
}

const PLAN_LABELS: Record<string, string> = {
  agency_basic:      'Agency Basic',
  agency_pro:        'Agency Pro',
  agency_enterprise: 'Agency Enterprise',
};

const PLAN_PRICES: Record<string, number> = {
  agency_basic:      79,
  agency_pro:        179,
  agency_enterprise: 349,
};

export async function generateAgencyInvoicePdf(params: {
  plan: string;
  customerEmail: string;
  nextBillingDate: string;   // z.B. "30.04.2026"
  invoiceDate?: string;      // z.B. "30.03.2026" – default: heute
}): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  pdfDoc.registerFontkit(fontkit);
  const page = pdfDoc.addPage([595, 842]);
  const { font, bold } = await loadFonts(pdfDoc);
  const { width, height } = page.getSize();

  // Farben
  const green      = rgb(0.133, 0.773, 0.369);
  const darkGreen  = rgb(0.086, 0.529, 0.255);
  const gray       = rgb(0.6,   0.6,   0.6);
  const lightgray  = rgb(0.93,  0.93,  0.93);
  const black      = rgb(0.1,   0.1,   0.1);
  const white      = rgb(1,     1,     1);
  const lightGreen = rgb(0.91,  0.98,  0.93);
  const navy       = rgb(0.039, 0.059, 0.118);  // #0a0f1e

  const planLabel  = PLAN_LABELS[params.plan] ?? params.plan;
  const amount     = PLAN_PRICES[params.plan] ?? 0;
  const mwstRate   = 0.081;
  const netto      = amount / (1 + mwstRate);
  const mwst       = amount - netto;

  // Rechnungsdatum + Nummer
  const now         = new Date();
  const datePart    = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
  const invoiceNum  = `DQ-AG-${datePart}-${rand4()}`;
  const invoiceDate = params.invoiceDate ?? now.toLocaleDateString('de-CH', { day: '2-digit', month: '2-digit', year: 'numeric' });

  // Gruener Balken oben
  page.drawRectangle({ x: 0, y: height - 4, width, height: 4, color: green });

  // Logo
  const logoController = new AbortController();
  const logoTimeout = setTimeout(() => logoController.abort(), 5000);
  try {
    const logoRes = await fetch('https://www.dataquard.ch/logo.png', { signal: logoController.signal });
    const logoBuffer = await logoRes.arrayBuffer();
    const logoImage  = await pdfDoc.embedPng(logoBuffer);
    const scale      = Math.min(160 / logoImage.width, 60 / logoImage.height);
    page.drawImage(logoImage, {
      x: 50, y: height - 36 - logoImage.height * scale,
      width: logoImage.width * scale, height: logoImage.height * scale,
    });
  } catch {
    page.drawText('Data',    { x: 50, y: height - 60, size: 22, font: bold, color: green });
    page.drawText('quard',   { x: 50 + bold.widthOfTextAtSize('Data', 22), y: height - 60, size: 22, font: bold, color: darkGreen });
    page.drawText('Agentur-Compliance-Loesung', { x: 50, y: height - 76, size: 9, font, color: gray });
  } finally {
    clearTimeout(logoTimeout);
  }

  // Rechnung-Label oben rechts
  page.drawText('RECHNUNG',       { x: width - 195, y: height - 50, size: 11, font: bold, color: green });
  page.drawText(`Nr. ${invoiceNum}`, { x: width - 195, y: height - 66, size: 9.5, font, color: rgb(0.35, 0.35, 0.35) });
  page.drawText(invoiceDate,      { x: width - 195, y: height - 80, size: 9.5, font, color: rgb(0.35, 0.35, 0.35) });

  // Trennlinie
  page.drawLine({ start: { x: 50, y: height - 100 }, end: { x: width - 50, y: height - 100 }, thickness: 1, color: lightgray });

  // Absenderzeile
  page.drawText('Richard Rickli  \u00B7  Gstadstrasse 53  \u00B7  4153 Reinach BL  \u00B7  Schweiz  \u00B7  info@dataquard.ch', {
    x: 50, y: height - 118, size: 8.5, font, color: gray,
  });

  // Empfaenger + Zahlungsart
  page.drawText('RECHNUNGSEMPFAENGER', { x: 50,  y: height - 148, size: 8, font: bold, color: gray });
  page.drawText('ZAHLUNGSART',         { x: 300, y: height - 148, size: 8, font: bold, color: gray });
  page.drawText(params.customerEmail,  { x: 50,  y: height - 162, size: 11, font, color: black });
  page.drawText('Kreditkarte via Stripe (Monatsabo)', { x: 300, y: height - 162, size: 10, font, color: black });

  // Tabellen-Header
  const tableY = height - 206;
  page.drawRectangle({ x: 50, y: tableY - 4, width: width - 100, height: 22, color: lightGreen });
  page.drawText('BESCHREIBUNG', { x: 56,  y: tableY + 5, size: 8.5, font: bold, color: darkGreen });
  page.drawText('MENGE',        { x: 390, y: tableY + 5, size: 8.5, font: bold, color: darkGreen });
  page.drawText('BETRAG',       { x: 460, y: tableY + 5, size: 8.5, font: bold, color: darkGreen });

  // Produktzeile
  const rowY = tableY - 30;
  page.drawText(`Dataquard ${planLabel} (Monatsabo)`, { x: 56, y: rowY + 8, size: 12, font: bold, color: black });
  page.drawText(`Agentur-Compliance-Plattform \u00B7 ${planLabel}`, { x: 56, y: rowY - 7, size: 9, font, color: gray });
  page.drawText('1',                               { x: 398, y: rowY + 8, size: 12, font, color: black });
  page.drawText(`CHF ${amount.toFixed(2)}`,        { x: 455, y: rowY + 8, size: 12, font, color: black });

  // Laufzeit-Hinweis
  page.drawText(`Monatsabo \u00B7 Automatische Verlaengerung`,     { x: 56, y: rowY - 24, size: 8.5, font, color: gray });
  page.drawText(`Naechste Abrechnung: ${params.nextBillingDate}`,  { x: 56, y: rowY - 37, size: 8.5, font, color: gray });

  // Trennlinie
  page.drawLine({ start: { x: 50, y: rowY - 52 }, end: { x: width - 50, y: rowY - 52 }, thickness: 0.5, color: lightgray });

  // MwSt. Aufschluesselung
  const t1Y = rowY - 70;
  page.drawText('Zwischensumme (exkl. MwSt.)',   { x: 340, y: t1Y,      size: 10, font, color: gray });
  page.drawText(`CHF ${netto.toFixed(2)}`,        { x: 455, y: t1Y,      size: 10, font, color: black });
  page.drawText('MwSt. 8.1%',                     { x: 340, y: t1Y - 16, size: 10, font, color: gray });
  page.drawText(`CHF ${mwst.toFixed(2)}`,         { x: 455, y: t1Y - 16, size: 10, font, color: black });

  // Total-Box (navy Hintergrund)
  const totalY = t1Y - 52;
  page.drawRectangle({ x: 50, y: totalY - 8, width: width - 100, height: 38, color: navy });
  page.drawText('Total inkl. MwSt.', { x: 60,  y: totalY + 14, size: 12, font: bold, color: white });
  page.drawText(`CHF ${amount.toFixed(2)}`, { x: 435, y: totalY + 14, size: 16, font: bold, color: green });

  // Bezahlt-Badge
  page.drawRectangle({ x: 50, y: totalY - 34, width: 72, height: 18, color: lightGreen });
  page.drawText('Bezahlt', { x: 60, y: totalY - 25, size: 9, font: bold, color: darkGreen });

  // Hinweis
  page.drawText('Diese Rechnung wurde automatisch erstellt.', {
    x: 50, y: totalY - 60, size: 8.5, font, color: gray,
  });

  // Footer
  page.drawLine({ start: { x: 50, y: 55 }, end: { x: width - 50, y: 55 }, thickness: 0.5, color: lightgray });
  page.drawText('Dataquard  \u00B7  Reinach BL  \u00B7  Schweiz  \u00B7  dataquard.ch', {
    x: 50, y: 40, size: 8.5, font, color: gray,
  });
  page.drawText('info@dataquard.ch', { x: width - 148, y: 40, size: 8.5, font, color: gray });

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}
