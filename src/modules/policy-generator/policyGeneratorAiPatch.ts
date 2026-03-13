import type { ScanAiAudit } from '../../services/scanner/scannerServiceAiPatch';

const AI_CLAUSE_DE = `## Einsatz von KI-Inhaltserkennung und Deepfake-Analyse (Art. 50 EU AI Act)

Diese Website verwendet automatisierte Systeme zur Erkennung von KI-generierten und
manipulierten Bildinhalten (Deepfakes). Die Analyse dient dem Schutz unserer Nutzer
vor irreführenden oder synthetischen Inhalten.

**Verarbeitung:** Bildmaterialien werden ausschliesslich flüchtig im Arbeitsspeicher
(RAM) analysiert. Es erfolgt keine dauerhafte Speicherung der Bilder oder der
Analyseergebnisse auf unseren Servern.

**Rechtsgrundlage:** Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an der
Sicherstellung authentischer Inhalte) sowie Art. 50 EU AI Act (Transparenzpflichten
beim Einsatz von KI-Systemen zur Inhaltsmoderation).

**Anbieter:** Dataquard KI-Analyse (Dataquard, Schweiz). Die Verarbeitung
erfolgt ausschliesslich auf Servern in der Schweiz und der EU.

**Ihre Rechte:** Sie können der Verarbeitung jederzeit widersprechen. Kontaktieren
Sie uns hierfür unter den im Impressum angegebenen Kontaktdaten.`;

export function injectAiClauseIfRequired(
  policyMarkdown: string,
  aiAudit: ScanAiAudit
): { policy: string; clauseAdded: boolean } {
  if (!aiAudit.requiresAiClause) return { policy: policyMarkdown, clauseAdded: false };
  if (policyMarkdown.includes('Art. 50 EU AI Act')) return { policy: policyMarkdown, clauseAdded: false };

  const insertionMarkers = ['## Kontakt', '## Impressum', '## Änderungen', '## Schluss'];
  let insertedAt = -1;
  for (const marker of insertionMarkers) {
    const idx = policyMarkdown.indexOf(marker);
    if (idx !== -1) { insertedAt = idx; break; }
  }

  const updatedPolicy =
    insertedAt !== -1
      ? policyMarkdown.slice(0, insertedAt) + '\n\n' + AI_CLAUSE_DE + '\n\n' + policyMarkdown.slice(insertedAt)
      : policyMarkdown + '\n\n' + AI_CLAUSE_DE;

  return { policy: updatedPolicy, clauseAdded: true };
}
