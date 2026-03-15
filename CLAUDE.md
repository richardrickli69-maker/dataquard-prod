# CLAUDE.md – Dataquard Projekt-Anweisungen für Claude Code

## PROJEKT
- **Name:** Dataquard (www.dataquard.ch)
- **Was:** Schweizer SaaS – Website Compliance & Health Check für KMUs
- **Standort:** Reinach BL, Schweiz
- **Stack:** Next.js (App Router, TypeScript), Supabase (Zürich), Stripe, Resend, Claude API, Sightengine API, Tailwind CSS
- **Hosting:** Vercel (Auto-Deploy via GitHub)
- **Pfad:** C:\Development\Projects\dataquard
- **Shell:** PowerShell (KEIN && – Befehle immer einzeln eingeben)

---

## VOR JEDER ÄNDERUNG (PFLICHT)

1. Lies ALLE betroffenen Dateien komplett durch
2. Liste alle Imports, Abhängigkeiten und Verknüpfungen auf
3. Prüfe ob es Konflikte mit bestehenden Funktionen gibt
4. Zeig den IST-Zustand als Zusammenfassung BEVOR du Code schreibst
5. Warte auf OK falls es ein grösserer Umbau ist

---

## CODE-REGELN

### Allgemein
- NUR die Dateien ändern die nötig sind – nichts anderes anfassen
- Bestehende Funktionalität NICHT brechen
- Alle Imports prüfen – fehlende hinzufügen, ungenutzte entfernen
- TypeScript strict: keine `any` Types, keine ignorierten Errors
- Umlaute (ä, ö, ü) müssen überall korrekt funktionieren
- Code-Kommentare auf Deutsch
- Keine `console.log` im Production Code (nur `console.error`)
- Jede API Route mit try/catch und sinnvollen Error-Responses
- Loading States für alle async Operationen
- Responsive Design (Mobile + Desktop) bei UI-Änderungen

### Supabase
- Auth: IMMER `createBrowserClient` aus `@supabase/ssr` verwenden
- NIEMALS `createClient` aus `@supabase/supabase-js` (speichert Session nur im Memory)
- Schreib-Operationen: `upsert` statt `update` wenn User evtl. noch nicht existiert
- DB-Tabelle für Abos heisst `subscriptions` (NICHT `billing`)
- Spalte für den Plan heisst `plan` (NICHT `subscription_tier`)
- Supabase `subscriptions` hat AI-Trust Spalten: `ai_trust_active`, `ai_trust_expires_at`, `ai_trust_stripe_subscription_id`
- Alle Queries mit Error-Handling
- Supabase Auth URL Configuration: Site URL = `https://www.dataquard.ch`

### Next.js / Vercel
- URL Parameter: `window.location.search` verwenden (NICHT `useSearchParams` – Suspense-Problem)
- Chat API Response-Format: `{ message }` (NICHT `{ content }`)
- Scan API Pfad: `data.data.scan.compliance.score`
- `NEXT_PUBLIC_BASE_URL` = `https://www.dataquard.ch` auf Vercel (lokal: `http://localhost:3000`)
- Domain: IMMER `www.dataquard.ch` verwenden (NICHT `dataquard.ch` ohne www, NICHT die Supabase URL)
- Serverless Functions: KEIN `fs.readFileSync` für lokale Dateien (funktioniert nicht auf Vercel)
- Assets in Serverless: Externe CDN URLs verwenden (NICHT fetch vom eigenen Domain – gibt HTML zurück)

### PDF-Generierung
- Library: `pdf-lib` mit `fontkit`
- Schrift: NotoSans via jsDelivr CDN laden (unterstützt Umlaute)
- NIEMALS lokale Font-Dateien mit `fs.readFileSync` laden

### Environment Variables
- Nur bestehende aus `.env.local` nutzen
- Neue Variables explizit nennen und begründen
- Sightengine: `SIGHTENGINE_API_USER` + `SIGHTENGINE_API_SECRET` (bereits konfiguriert)

---

## VERBOTEN

❌ Dateien ändern die nicht zum Task gehören
❌ `any` als TypeScript Type
❌ Fehler still ignorieren (try/catch ohne Logging)
❌ Neue Dependencies ohne Begründung
❌ Code-Kommentare auf Englisch
❌ Mehrere Befehle mit `&&` verketten (PowerShell!)
❌ `fs.readFileSync` für Assets in Serverless Functions
❌ `createClient` aus `@supabase/supabase-js` für Auth
❌ Supabase `update` wenn User evtl. nicht existiert
❌ `useSearchParams` ohne Suspense-Boundary
❌ `console.log` in Production Code
❌ Fetch von Assets vom eigenen Domain in Serverless
❌ `https://dataquard.ch` ohne www (IMMER `https://www.dataquard.ch`)
❌ "Basel" als Standort (IMMER "Reinach BL, Schweiz")
❌ `subscription_tier` als Spaltenname (heisst `plan`)

---

## PRE-SAVE CHECKLISTE

Vor dem Speichern jeder Änderung durchgehen:

- [ ] Alle Imports vorhanden und korrekt?
- [ ] Keine bestehende Funktion kaputt gemacht?
- [ ] TypeScript Typen korrekt (keine `any`)?
- [ ] Umlaute/Sonderzeichen getestet?
- [ ] Environment Variables alle vorhanden?
- [ ] Supabase Queries mit Error-Handling?
- [ ] API Routes mit try/catch?
- [ ] Keine console.log im Production Code?
- [ ] Responsive Design (Mobile + Desktop)?
- [ ] Loading States für async Operationen?

---

## AUSGABE-FORMAT

Für JEDE Datei-Änderung:

```
### Datei: [exakter Pfad]
**Was:** [1 Satz]
**Warum:** [1 Satz]
[Code-Block]
```

## NACH DEM ÄNDERN

1. Exakte Liste der geänderten Dateien zeigen
2. Befehle zum Ausführen (einzeln, PowerShell):
   - `npm install [packages]` (falls nötig)
   - `npm run build` (Pflicht!)
   - `npm run dev` (zum Testen)
3. Was genau im Browser getestet werden soll
4. Git-Befehle (einzeln):
   ```
   git add [exakte Dateien]
   git commit -m "[aussagekräftige Message auf Deutsch]"
   git push
   ```

## BEI BUILD-FEHLERN

1. EXAKTEN Error zeigen
2. Ursache in 1 Satz erklären
3. Fix als Code-Block
4. Nicht raten lassen

---

## PROJEKT-KONTEXT

### Features (live auf www.dataquard.ch)
- Website-Scanner (4 Säulen: Compliance + Performance + Security + AI-Trust)
- AI-Trust: KI-Bild-Erkennung + Deepfake-Check via Sightengine API (EU AI Act Art. 50)
- AI-Trust Abo: CHF 99/Jahr (5/50/250 Bilder Tiers), Stripe Subscription
- Shield-Badge SVGs in public/ (badge-ai-trust.svg, badge-ai-trust-banner.svg)
- Datenschutzerklärung-Generator (nDSG + DSGVO, DE/FR/IT/EN)
- Impressum Generator
- Cookie-Banner Erkennung + Generator
- Stripe Payment (CHF 79 / CHF 149 Einmalkauf + CHF 99/Jahr AI-Trust Abo)
- Dashboard mit 6 Tabs: Übersicht, Policies, Abrechnung, Massnahmen, Verified Badge, AI-Trust
- Admin Dashboard (/admin)
- PDF-Rechnung via Resend nach Kauf (violetter Akzent für AI-Trust Abo)
- Passwort-Reset Flow (PKCE serverseitig, 5s Timeout + Fallback auf /auth)
- E-Mail-Adressen: info@dataquard.ch, support@dataquard.ch, datenschutz@dataquard.ch (Hostpoint)
- Schema.org mit 4-Säulen-Beschreibung + FAQ (inkl. 3 AI-Trust Fragen)

### Roadmap (Priorität)
1. Automated Outreach System (Zefix/Handelsregister → Batch-Scan → Claude API E-Mails → Resend). WICHTIG: EU AI Act Art. 50 als Selling Point in Outreach-Mails einbauen.
2. PWA als Mobile-App-Einstieg
3. HR-Compliance Modul (stärkster Differenzierer, kein Schweizer Konkurrent)
4. JS-Rendering via Browserless

### Homepage Design
- Dark Theme: Midnight Navy + Electric Green
- Fonts: DM Serif Display + DM Sans
- Hero-Text: „Der einzige Schweizer Website-Check mit 4-Säulen-Analyse: Compliance, Performance, Security und AI-Trust — gleichzeitig geprüft, direkt behoben."
- Trust-Badges: 🇨🇭 Schweizer Produkt | 🔒 Daten in Zürich | ⚖️ nDSG/DSGVO | 🤖 AI-Trust | ⏱ Ergebnis in 60 Sek.

### Regulatorischer Kontext (für Content und Generatoren aktuell halten)
- **nDSG (Schweiz):** In Kraft seit 01.09.2023, bisher unverändert. KEIN Cookie-Banner-Obligatorium unter nDSG (nur unter DSGVO).
- **DSGVO (EU):** Reform via "Digitaler Omnibus" in Arbeit (November 2025 vorgelegt). KMU-Erleichterungen geplant, Grundpflichten bleiben. Generatoren prüfen sobald Omnibus verabschiedet.
- **EU AI Act:** Stichtag 2. August 2026 — Pflichten für Hochrisiko-KI, Governance, Transparenz (Art. 50). KI-Kompetenzpflicht (Art. 4) gilt bereits seit Feb 2025. Dataquard deckt Art. 50 mit AI-Trust ab. Starkes Verkaufsargument für Outreach-Mails.
- **Schweizer KI-Regulierung:** Noch keine spezifische Gesetzgebung. Vernehmlassungsvorlage bis Ende 2026 geplant (EJPD). Orientiert sich an KI-Konvention des Europarats.
- **NIS2 (EU):** Seit Dezember 2025 in Kraft (Deutschland). Cybersicherheitspflichten für ~30.000 Unternehmen.

### Konkurrenz
- PrivacyBee, iubenda, dartera – keiner deckt HR-spezifische Schweizer Compliance oder AI-Trust (EU AI Act) ab
