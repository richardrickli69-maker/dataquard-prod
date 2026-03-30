// src/lib/generateAgencyGuidePdf.ts
// Kurzanleitung PDF fuer Agency-Account
// Gleiche Technologie wie generateInstallationPdf.ts: pdf-lib + NotoSans via CDN

import { PDFDocument, PDFFont, PDFPage, rgb } from 'pdf-lib';
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

// Einen nummerierten Schritt auf die Seite zeichnen
// Gibt die neue y-Position nach dem Schritt zurueck
function drawStep(
  page: PDFPage,
  y: number,
  number: string,
  title: string,
  lines: string[],
  fonts: { font: PDFFont; bold: PDFFont },
  colors: { green: ReturnType<typeof rgb>; black: ReturnType<typeof rgb>; gray: ReturnType<typeof rgb>; white: ReturnType<typeof rgb> }
): number {
  const { font, bold } = fonts;
  const { green, black, gray, white } = colors;

  // Nummerierter Kreis (Quadrat als Annäherung)
  page.drawRectangle({ x: 50, y: y - 2, width: 22, height: 22, color: green });
  page.drawText(number, { x: number.length === 1 ? 59 : 55, y: y + 5, size: 11, font: bold, color: white });

  // Titel
  page.drawText(title, { x: 80, y: y + 5, size: 12, font: bold, color: black });
  y -= 22;

  // Unterzeilen
  for (const line of lines) {
    page.drawText(line, { x: 80, y, size: 9.5, font, color: gray });
    y -= 16;
  }

  return y - 12; // Abstand nach dem Schritt
}

export async function generateAgencyGuidePdf(params: {
  plan: string;
  planLabel: string;
}): Promise<Buffer> {
  const isProOrEnterprise = params.plan === 'agency_pro' || params.plan === 'agency_enterprise';

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

  const stepFonts  = { font, bold };
  const stepColors = { green, black, gray, white };

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
  } finally {
    clearTimeout(logoTimeout);
  }

  // Titel oben rechts
  page.drawText('KURZANLEITUNG',        { x: width - 195, y: height - 50, size: 10, font: bold, color: green });
  page.drawText(`Dataquard ${params.planLabel}`, { x: width - 195, y: height - 65, size: 9, font, color: gray });

  // Trennlinie
  page.drawLine({ start: { x: 50, y: height - 100 }, end: { x: width - 50, y: height - 100 }, thickness: 1, color: lightgray });

  // Haupttitel
  page.drawText('Ihr Dataquard Agency-Account — Kurzanleitung', {
    x: 50, y: height - 130, size: 16, font: bold, color: green,
  });
  page.drawText('So starten Sie in wenigen Minuten mit Ihrer Agentur-Compliance-Plattform.', {
    x: 50, y: height - 150, size: 10, font, color: gray,
  });

  // Hinweis-Box
  page.drawRectangle({ x: 50, y: height - 188, width: width - 100, height: 26, color: lightGreen });
  page.drawText(`Ihr ${params.planLabel}-Plan ist sofort aktiv. Sie können jetzt Domains hinzufügen und scannen.`, {
    x: 58, y: height - 179, size: 9, font, color: darkGreen,
  });

  // Schritte
  let y = height - 222;

  y = drawStep(page, y, '1', 'Dashboard öffnen', [
    'Gehen Sie zu dataquard.ch/dashboard und melden Sie sich an.',
    'Klicken Sie auf den Link "Agentur" oder den Tab "Agentur" im Dashboard.',
  ], stepFonts, stepColors);

  y = drawStep(page, y, '2', 'Domains hinzufügen', [
    'Einzeln: Domain in das Eingabefeld eingeben und bestätigen.',
    'Bulk: CSV-Datei hochladen (eine Domain pro Zeile, z.B. "example.ch").',
    'Die Domains erscheinen sofort in der Tabelle mit Status "Ausstehend".',
  ], stepFonts, stepColors);

  y = drawStep(page, y, '3', 'Alle Domains scannen', [
    'Klicken Sie auf "Alle Domains scannen".',
    'Die Ergebnisse erscheinen nach wenigen Sekunden in der Tabelle.',
    'Compliance-, Performance-, Security- und AI-Trust-Scores werden angezeigt.',
  ], stepFonts, stepColors);

  y = drawStep(page, y, '4', 'Reports herunterladen', [
    'Klicken Sie bei jeder Domain auf "PDF" um den Compliance-Report herunterladen.',
    'Senden Sie den Report direkt an Ihre Kunden.',
  ], stepFonts, stepColors);

  y = drawStep(page, y, '5', 'Document Pack aktivieren (optional)', [
    'Aktivieren Sie das Document Pack (CHF 9.\u2013/Domain/Mt.) per Toggle.',
    'Pro Kunden-Domain wird automatisch generiert:',
    '  \u00B7 Datenschutzerklärung (nDSG + DSGVO)',
    '  \u00B7 Impressum',
    '  \u00B7 Cookie-Banner',
  ], stepFonts, stepColors);

  // Schritt 6 nur fuer Pro/Enterprise
  if (isProOrEnterprise) {
    y = drawStep(page, y, '6', 'White-Label konfigurieren', [
      'Unter "Branding" im Agency-Dashboard können Sie Ihr Logo und Ihre',
      'Markenfarben für alle PDF-Reports konfigurieren.',
      'Ihre Kunden sehen die Reports in Ihrem Corporate Design.',
    ], stepFonts, stepColors);
  }

  // Abschluss-Box
  y -= 8;
  page.drawRectangle({ x: 50, y: y - 10, width: width - 100, height: 36, color: lightGreen });
  page.drawText('Ihr Agency-Account ist einsatzbereit — viel Erfolg!', {
    x: 60, y: y + 12, size: 10, font: bold, color: darkGreen,
  });
  page.drawText('Bei Fragen: support@dataquard.ch', { x: 60, y: y - 2, size: 9, font, color: darkGreen });

  // Footer
  page.drawLine({ start: { x: 50, y: 55 }, end: { x: width - 50, y: 55 }, thickness: 0.5, color: lightgray });
  page.drawText('Support: support@dataquard.ch  \u00B7  dataquard.ch', { x: 50, y: 40, size: 8.5, font, color: gray });
  page.drawText('Dataquard  \u00B7  Reinach BL  \u00B7  Schweiz', { x: width - 240, y: 40, size: 8.5, font, color: gray });

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}
