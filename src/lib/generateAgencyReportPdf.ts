/**
 * Agency Report PDF Generator
 * Erstellt Compliance-Berichte für einzelne Domains im Agency-Dashboard.
 * Unterstützt White-Label (benutzerdefiniertes Logo + Farbe für Agency Pro/Enterprise).
 * Pattern: pdf-lib + fontkit + NotoSans via CDN (kein fs.readFileSync!)
 */
import { PDFDocument, rgb, RGB } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';

const FONT_REGULAR = 'https://cdn.jsdelivr.net/gh/googlefonts/noto-fonts/hinted/ttf/NotoSans/NotoSans-Regular.ttf';
const FONT_BOLD    = 'https://cdn.jsdelivr.net/gh/googlefonts/noto-fonts/hinted/ttf/NotoSans/NotoSans-Bold.ttf';

/** Lädt Regular + Bold NotoSans und bettet sie ein */
async function loadFonts(pdfDoc: Awaited<ReturnType<typeof PDFDocument.create>>) {
  const [fontRes, boldRes] = await Promise.all([fetch(FONT_REGULAR), fetch(FONT_BOLD)]);
  if (!fontRes.ok) throw new Error(`Font-Laden fehlgeschlagen: ${fontRes.status}`);
  if (!boldRes.ok) throw new Error(`Bold-Font-Laden fehlgeschlagen: ${boldRes.status}`);
  const font = await pdfDoc.embedFont(Buffer.from(await fontRes.arrayBuffer()));
  const bold = await pdfDoc.embedFont(Buffer.from(await boldRes.arrayBuffer()));
  return { font, bold };
}

/** Hex-Farbe (#22c55e) in pdf-lib RGB umwandeln */
function hexToRgb(hex: string): RGB {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  return rgb(r, g, b);
}

/** Score-Farbe: grün ≥ 70, gelb ≥ 50, rot < 50 */
function scoreColor(score: number | null): RGB {
  if (score === null) return rgb(0.6, 0.6, 0.6);
  if (score >= 70) return rgb(0.13, 0.77, 0.37);
  if (score >= 50) return rgb(0.92, 0.70, 0.0);
  return rgb(0.86, 0.15, 0.15);
}

export interface AgencyReportParams {
  domain: string;
  complianceScore: number | null;
  performanceScore: number | null;
  securityScore: number | null;
  aiTrustScore: number | null;
  aiImagesFound: number;
  aiImagesLabeled: number;
  trackersFound: number;
  recommendations: string[];
  scannedAt: string | null;
  /** White-Label: Agentur-Logo URL (null → Dataquard-Logo) */
  customLogoUrl: string | null;
  /** White-Label: Akzentfarbe Hex (null → #22c55e) */
  customColor: string | null;
  /** Agentur-Name für den Report-Header */
  agencyName: string | null;
}

export async function generateAgencyReportPdf(params: AgencyReportParams): Promise<Buffer> {
  const accentColor = params.customColor ? hexToRgb(params.customColor) : rgb(0.133, 0.773, 0.369);
  const accentDark  = params.customColor ? hexToRgb(params.customColor) : rgb(0.086, 0.529, 0.255);

  const gray       = rgb(0.6, 0.6, 0.6);
  const lightgray  = rgb(0.93, 0.93, 0.93);
  const black      = rgb(0.1, 0.1, 0.1);
  const white      = rgb(1, 1, 1);
  const bgLight    = rgb(0.97, 0.97, 0.98);

  const pdfDoc = await PDFDocument.create();
  pdfDoc.registerFontkit(fontkit);
  const page = pdfDoc.addPage([595, 842]);
  const { font, bold } = await loadFonts(pdfDoc);
  const { width, height } = page.getSize();

  // ── Akzentbalken oben ──────────────────────────────────────────────────────
  page.drawRectangle({ x: 0, y: height - 4, width, height: 4, color: accentColor });

  // ── Logo (White-Label oder Dataquard-Fallback) ─────────────────────────────
  const logoUrl = params.customLogoUrl ?? 'https://www.dataquard.ch/logo.png';
  const logoCtrl = new AbortController();
  const logoTimeout = setTimeout(() => logoCtrl.abort(), 5000);
  try {
    const logoRes = await fetch(logoUrl, { signal: logoCtrl.signal });
    const logoBytes = await logoRes.arrayBuffer();
    // PNG oder JPEG automatisch erkennen
    const isPng = logoUrl.toLowerCase().includes('.png') ||
                  new Uint8Array(logoBytes).slice(0, 4).join(',') === '137,80,78,71';
    const logoImage = isPng
      ? await pdfDoc.embedPng(Buffer.from(logoBytes))
      : await pdfDoc.embedJpg(Buffer.from(logoBytes));
    const maxW = 150, maxH = 50;
    const scale = Math.min(maxW / logoImage.width, maxH / logoImage.height);
    page.drawImage(logoImage, {
      x: 50, y: height - 35 - logoImage.height * scale,
      width: logoImage.width * scale, height: logoImage.height * scale,
    });
  } catch {
    // Fallback: Text-Logo
    page.drawText('Data', { x: 50, y: height - 65, size: 20, font: bold, color: accentColor });
    page.drawText('quard', { x: 50 + bold.widthOfTextAtSize('Data', 20), y: height - 65, size: 20, font: bold, color: accentDark });
  } finally {
    clearTimeout(logoTimeout);
  }

  // ── Report-Titel rechts ────────────────────────────────────────────────────
  page.drawText('COMPLIANCE REPORT', { x: width - 220, y: height - 50, size: 10, font: bold, color: accentColor });
  const headerSub = params.agencyName ? `Erstellt von ${params.agencyName}` : 'Dataquard Agency Report';
  page.drawText(headerSub, { x: width - 220, y: height - 64, size: 8, font, color: gray });

  // ── Trennlinie ─────────────────────────────────────────────────────────────
  page.drawLine({ start: { x: 50, y: height - 82 }, end: { x: width - 50, y: height - 82 }, thickness: 1, color: lightgray });

  // ── Domain + Datum ─────────────────────────────────────────────────────────
  let y = height - 110;
  page.drawText('Domain', { x: 50, y, size: 8, font, color: gray });
  page.drawText(params.domain, { x: 50, y: y - 14, size: 16, font: bold, color: black });
  if (params.scannedAt) {
    const scanDate = new Date(params.scannedAt).toLocaleDateString('de-CH');
    page.drawText(`Gescannt am ${scanDate}`, { x: 50, y: y - 30, size: 9, font, color: gray });
  }

  // ── 4-Säulen-Scores (Cards) ────────────────────────────────────────────────
  y -= 60;
  page.drawText('4-SÄULEN-ANALYSE', { x: 50, y, size: 9, font: bold, color: accentColor });
  y -= 18;

  const scores: { label: string; value: number | null }[] = [
    { label: 'Compliance',   value: params.complianceScore },
    { label: 'Performance',  value: params.performanceScore },
    { label: 'Security',     value: params.securityScore },
    { label: 'AI-Trust',     value: params.aiTrustScore },
  ];

  const cardW = 110, cardH = 70, cardGap = 10;
  scores.forEach((s, i) => {
    const cx = 50 + i * (cardW + cardGap);
    const cy = y - cardH;
    // Card-Hintergrund
    page.drawRectangle({ x: cx, y: cy, width: cardW, height: cardH, color: bgLight });
    // Farbiger Score-Balken oben
    page.drawRectangle({ x: cx, y: cy + cardH - 4, width: cardW, height: 4, color: scoreColor(s.value) });
    // Label
    page.drawText(s.label, { x: cx + 8, y: cy + cardH - 20, size: 9, font: bold, color: black });
    // Score-Wert
    const scoreText = s.value !== null ? `${s.value}` : '–';
    page.drawText(scoreText, { x: cx + 8, y: cy + cardH - 38, size: 22, font: bold, color: scoreColor(s.value) });
    page.drawText('/ 100', { x: cx + 8 + bold.widthOfTextAtSize(scoreText, 22), y: cy + cardH - 38, size: 9, font, color: gray });
    // Ampel-Text
    const ampelText = s.value === null ? 'Nicht gescannt' : s.value >= 70 ? 'Gut' : s.value >= 50 ? 'Verbesserungsbedarf' : 'Kritisch';
    page.drawText(ampelText, { x: cx + 8, y: cy + 10, size: 8, font, color: scoreColor(s.value) });
  });

  y -= cardH + 24;

  // ── KI-Bilder & Tracker ────────────────────────────────────────────────────
  page.drawLine({ start: { x: 50, y }, end: { x: width - 50, y }, thickness: 0.5, color: lightgray });
  y -= 18;
  page.drawText('AI-CONTENT & TRACKER', { x: 50, y, size: 9, font: bold, color: accentColor });
  y -= 16;

  const stats: { label: string; value: string }[] = [
    { label: 'KI-Bilder erkannt',      value: `${params.aiImagesFound}` },
    { label: 'Davon gekennzeichnet',    value: `${params.aiImagesLabeled}` },
    { label: 'Nicht gekennzeichnet',    value: `${Math.max(0, params.aiImagesFound - params.aiImagesLabeled)}` },
    { label: 'Tracker erkannt',         value: `${params.trackersFound}` },
  ];

  stats.forEach((stat, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const sx = 50 + col * 240;
    const sy = y - row * 28;
    page.drawText(stat.label + ':', { x: sx, y: sy, size: 9, font, color: gray });
    page.drawText(stat.value, { x: sx + 160, y: sy, size: 9, font: bold, color: black });
  });

  y -= Math.ceil(stats.length / 2) * 28 + 12;

  // ── EU AI Act Hinweis (wenn ungekennzeichnete KI-Bilder) ───────────────────
  const unlabeled = Math.max(0, params.aiImagesFound - params.aiImagesLabeled);
  if (unlabeled > 0) {
    page.drawRectangle({ x: 50, y: y - 28, width: width - 100, height: 28, color: rgb(1.0, 0.97, 0.93) });
    page.drawText(
      `EU AI Act Art. 50: ${unlabeled} KI-Bild${unlabeled > 1 ? 'er' : ''} ohne Kennzeichnung erkannt — Kennzeichnungspflicht beachten.`,
      { x: 58, y: y - 18, size: 8.5, font, color: rgb(0.8, 0.4, 0.0) }
    );
    y -= 44;
  }

  // ── Empfehlungen ───────────────────────────────────────────────────────────
  page.drawLine({ start: { x: 50, y }, end: { x: width - 50, y }, thickness: 0.5, color: lightgray });
  y -= 18;
  page.drawText('EMPFEHLUNGEN', { x: 50, y, size: 9, font: bold, color: accentColor });
  y -= 16;

  const displayRecs = params.recommendations.length > 0
    ? params.recommendations
    : ['Keine dringenden Massnahmen identifiziert. Führen Sie regelmässige Scans durch.'];

  for (const rec of displayRecs.slice(0, 8)) {
    if (y < 80) break;
    // Bullet
    page.drawCircle({ x: 56, y: y + 3, size: 2.5, color: accentColor });
    // Text (max 90 Zeichen pro Zeile)
    const line = rec.length > 90 ? rec.slice(0, 87) + '…' : rec;
    page.drawText(line, { x: 66, y, size: 9, font, color: black });
    y -= 18;
  }

  // ── Footer ─────────────────────────────────────────────────────────────────
  page.drawLine({ start: { x: 50, y: 50 }, end: { x: width - 50, y: 50 }, thickness: 0.5, color: lightgray });
  page.drawText('Dataquard · www.dataquard.ch · Reinach BL, Schweiz · Daten in Zürich', {
    x: 50, y: 36, size: 7.5, font, color: gray,
  });
  page.drawText('Bericht ist nicht rechtsverbindlich. Für eine rechtliche Beratung wenden Sie sich an einen Anwalt.',
    { x: 50, y: 24, size: 7, font, color: rgb(0.75, 0.75, 0.75) }
  );

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}
