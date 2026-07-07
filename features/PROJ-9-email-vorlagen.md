# PROJ-9: E-Mail-Vorlagen

## Status: In Progress
**Created:** 2026-07-07
**Last Updated:** 2026-07-07

> **Stand 2026-07-07:** Frontend + Backend gebaut und lokal verifiziert (tsc sauber · Vitest **69/69** grün, davon 10 neue Platzhalter-Tests · `next build` inkl. neuer Route `/vorlagen` erfolgreich). **Der Code ist „inert", solange die Datenbank-Migration nicht angewandt ist** — die zwei Tabellen + der Storage-Bucket fehlen dann live. Migration liegt startklar unter `supabase/migrations/proj9_email_vorlagen.sql`; das Anwenden auf die Live-DB braucht eine ausdrückliche Nutzer-Freigabe (wie bei PROJ-7). Danach: `/qa` und `/deploy`.

> **Kurzfassung:** Wiederkehrende E-Mails (Erstansprache, Angebots-Nachfass, Terminbestätigung …) werden einmal als Vorlage angelegt und dann mit einem Klick in das E-Mail-Schreibfenster der Kundenakte eingefügt — inklusive automatisch ausgefüllter Kundendaten (Platzhalter), optionalem Betreff und fest hinterlegten Anhängen.

## Dependencies
- Requires: PROJ-7 (E-Mail-Versand Gmail) — Vorlagen werden im bestehenden Schreibfenster (`EmailComposer`) eingefügt und über den bestehenden Versandweg verschickt
- Requires: PROJ-1 (Supabase Infrastruktur & Auth) — Login-Pflicht, Team-Datenhaltung
- Nutzt: Kundenfelder aus PROJ-2 (Firma, Ansprechpartner, Adresse, PLZ, Stadt, Kategorie) für Platzhalter

## User Stories
- Als Vertriebsnutzer möchte ich häufig gebrauchte E-Mails als Vorlage speichern, damit ich sie nicht jedes Mal neu tippen muss.
- Als Vertriebsnutzer möchte ich beim Schreiben einer E-Mail eine Vorlage auswählen, die Betreff und Text automatisch einsetzt, damit eine typische Mail in Sekunden fertig ist.
- Als Vertriebsnutzer möchte ich Platzhalter (z. B. Anrede, Firmenname) in Vorlagen verwenden, die beim Einfügen automatisch mit den Daten des geöffneten Kunden gefüllt werden, damit jede Mail persönlich wirkt, ohne dass ich sie nachbearbeite.
- Als Vertriebsnutzer möchte ich einer Vorlage feste Anhänge (z. B. Firmenbroschüre) hinterlegen, damit diese automatisch mit in die Mail wandern.
- Als Vertriebsnutzer möchte ich meine Vorlagen auf einer eigenen Seite anlegen, bearbeiten, umbenennen und löschen, damit die Sammlung gepflegt bleibt.
- Als (späteres) Teammitglied möchte ich dieselben Vorlagen sehen und nutzen wie alle anderen, damit die Firmen-Kommunikation einheitlich bleibt.

## Funktionsbeschreibung

### Vorlagen-Seite (neuer Menüpunkt „Vorlagen")
- Liste aller Vorlagen (Name, Betreff-Vorschau, zuletzt geändert), Team-weit sichtbar.
- Anlegen/Bearbeiten mit: **Name** (Pflicht), **Betreff** (optional), **Text** (Formatierungs-Editor wie im Schreibfenster: fett/kursiv/Listen), **Anhänge** (optional, mehrere Dateien), **Platzhalter einfügen** (Auswahl-Knopf, damit niemand die Schreibweise auswendig kennen muss).
- Löschen mit Bestätigungsdialog.

### Platzhalter
Beim Einfügen in der Kundenakte werden Platzhalter mit den Daten des geöffneten Kunden gefüllt:

| Platzhalter | Quelle | Wenn leer |
|---|---|---|
| `{Anrede}` | intelligent: „Guten Tag Thomas Müller," (Ansprechpartner) | automatisch „Sehr geehrte Damen und Herren," |
| `{Ansprechpartner}` | contactName | Ersatztext der Vorlage, sonst leer |
| `{Firma}` | name | Ersatztext der Vorlage, sonst leer |
| `{Adresse}` / `{PLZ}` / `{Stadt}` | address / plz / city | Ersatztext der Vorlage, sonst leer |
| `{Kategorie}` | category | Ersatztext der Vorlage, sonst leer |

- Für jeden verwendeten Platzhalter (außer `{Anrede}`, die hat ihre feste Automatik) kann in der Vorlage ein **optionaler Ersatztext** hinterlegt werden; ohne Ersatztext bleibt die Stelle leer.
- Platzhalter funktionieren im **Betreff und im Text**.

### Einfügen im Schreibfenster (Kundenakte → Reiter „E-Mail")
- Neue Vorlagen-Auswahl (z. B. Dropdown „Vorlage…") im `EmailComposer`.
- Auswahl setzt Betreff (falls die Vorlage einen hat) und Text, füllt Platzhalter mit den Kundendaten und hängt die Vorlagen-Anhänge an (als normale, einzeln entfernbare Anhang-Chips).
- Stehen bereits Betreff oder Text im Fenster, fragt das System vorher: „Vorhandenen Text ersetzen?" (Abbrechen = nichts passiert).
- Nach dem Einfügen ist alles frei editierbar — gesendet wird wie bisher über PROJ-7.

## Out of Scope
- **Automatischer Versand / Massenversand** — Vorlagen füllen nur das Schreibfenster; kein E-Mail-Marketing (PRD Non-Goal).
- **Vorlagen-Verwaltung im Schreibfenster** (Schnell-Speichern „aktuelle Mail als Vorlage") — bewusst nur die eigene Vorlagen-Seite; kann später ergänzt werden.
- **Persönliche/private Vorlagen pro Nutzer** — alle Vorlagen sind Team-weit (Entscheidung siehe Log).
- **Anrede mit Herr/Frau** („Sehr geehrter Herr Müller") — bräuchte ein neues Anrede-Feld am Kunden; bewusst vertagt (Entscheidung siehe Log).
- **Platzhalter für Absenderdaten** (eigener Name/Signatur des Nutzers) — es gibt noch keine Nutzer-Profile; ggf. später.
- **Kategorien/Ordner für Vorlagen** — bei kleiner Vorlagen-Zahl reicht eine Liste.
- **Versionierung / Änderungshistorie von Vorlagen** — nicht nötig für den internen Gebrauch.

## Acceptance Criteria

**Format:** Angenommen [Vorbedingung] / Wenn [Aktion] / Dann [Ergebnis]

- [ ] Angenommen der Nutzer ist angemeldet, wenn er den Menüpunkt „Vorlagen" öffnet, dann sieht er die Liste aller Vorlagen (bzw. einen freundlichen Leer-Hinweis mit „Erste Vorlage anlegen", solange keine existiert)
- [ ] Angenommen der Nutzer legt eine Vorlage an, wenn er Name und formatierten Text (fett/kursiv/Liste) speichert, dann erscheint die Vorlage in der Liste und die Formatierung bleibt erhalten
- [ ] Angenommen der Nutzer speichert eine Vorlage ohne Namen, wenn er auf „Speichern" klickt, dann wird eine Validierungsfehlermeldung angezeigt und nichts gespeichert
- [ ] Angenommen eine Vorlage existiert, wenn der Nutzer sie bearbeitet oder umbenennt und speichert, dann sind die Änderungen in Liste und beim nächsten Einfügen sichtbar
- [ ] Angenommen eine Vorlage existiert, wenn der Nutzer auf „Löschen" klickt, dann erscheint zuerst ein Bestätigungsdialog, und erst nach Bestätigung ist die Vorlage entfernt
- [ ] Angenommen der Nutzer ist in der Kundenakte im Reiter „E-Mail" und das Schreibfenster ist leer, wenn er eine Vorlage auswählt, dann werden Betreff und Text sofort eingesetzt und alle Platzhalter mit den Daten dieses Kunden gefüllt
- [ ] Angenommen im Schreibfenster stehen bereits Betreff oder Text, wenn der Nutzer eine Vorlage auswählt, dann fragt das System „Vorhandenen Text ersetzen?" und ersetzt nur nach Bestätigung
- [ ] Angenommen beim Kunden ist ein Ansprechpartner eingetragen, wenn eine Vorlage mit `{Anrede}` eingefügt wird, dann steht dort „Guten Tag [Ansprechpartner],"
- [ ] Angenommen beim Kunden ist kein Ansprechpartner eingetragen, wenn eine Vorlage mit `{Anrede}` eingefügt wird, dann steht dort „Sehr geehrte Damen und Herren,"
- [ ] Angenommen ein Platzhalter-Feld ist beim Kunden leer und die Vorlage definiert einen Ersatztext, wenn eingefügt wird, dann steht der Ersatztext an der Stelle; ohne Ersatztext bleibt die Stelle leer
- [ ] Angenommen eine Vorlage hat hinterlegte Anhänge, wenn sie ausgewählt wird, dann erscheinen die Anhänge als entfernbare Chips im Schreibfenster und werden beim Senden mitgeschickt
- [ ] Angenommen der Nutzer entfernt einen automatisch angehängten Vorlagen-Anhang, wenn er die Mail sendet, dann wird dieser Anhang nicht mitgeschickt (die Vorlage selbst bleibt unverändert)
- [ ] Angenommen der Nutzer ist nicht angemeldet, wenn er die Vorlagen-Seite aufruft, dann wird er zur Login-Seite umgeleitet

## Edge Cases
- **Vorlage wird gelöscht, deren Anhänge gerade in einer offenen Mail hängen:** Die bereits ins Schreibfenster übernommenen Anhänge bleiben für diese Mail erhalten (sie gehören ab Einfügen zur Mail, nicht mehr zur Vorlage).
- **Platzhalter im Betreff, Feld leer, kein Ersatztext:** Stelle bleibt leer; der Betreff darf dadurch nicht „kaputt" aussehen (führende/doppelte Leerzeichen werden bereinigt).
- **Unbekannter/vertippter Platzhalter im Text** (z. B. `{Fimra}`): bleibt unverändert als Text stehen — kein Fehler, der Nutzer sieht es beim Kontrolllesen.
- **Sehr großer Vorlagen-Anhang:** Beim Anlegen der Vorlage gilt dasselbe Größen-Limit wie beim E-Mail-Versand (18 MB); Überschreitung → Hinweis, Datei wird nicht übernommen.
- **Zwei Nutzer bearbeiten dieselbe Vorlage gleichzeitig:** Der zuletzt Speichernde gewinnt (Last-Write-Wins) — bei einem Ein-Personen-Start akzeptabel, kein Sperr-Mechanismus.
- **Vorlage ohne Betreff wird eingefügt, im Fenster steht schon ein Betreff:** Nach Bestätigung der Ersetzen-Rückfrage wird nur der Text ersetzt, der vorhandene Betreff bleibt stehen.
- **Netzwerkfehler beim Speichern einer Vorlage:** Fehlermeldung, Eingaben bleiben im Formular erhalten.

## Technical Requirements (optional)
- Login-Pflicht für Vorlagen-Seite und alle Vorlagen-Aktionen; Team-RLS wie bei Notizen/Aktivitäten
- Vorlagen-Text wird als HTML gespeichert und beim Senden durch die bestehende Bereinigung (`sanitizeEmailHtml`) geschickt — kein neuer XSS-Weg
- Einfügen einer Vorlage inkl. Platzhalter-Füllung fühlt sich sofort an (< 500 ms, keine Wartezeit)

## Open Questions
- [x] Sollen beim Löschen einer Vorlage deren Anhang-Dateien im Speicher mitgelöscht werden? → **Ja, gelöst in /architecture:** Vorlagen-Anhänge liegen in einem eigenen Speicher-Bereich. Beim Einfügen in eine Mail wird die Datei *kopiert* (die Mail bekommt eine unabhängige eigene Kopie). Dadurch kann eine gelöschte Vorlage niemals eine bereits geschriebene oder gesendete Mail beschädigen — und die Vorlagen-Datei darf beim Löschen der Vorlage bedenkenlos mit entfernt werden.

## Decision Log

### Product Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Platzhalter ja (Kundenfelder) | Hauptnutzen von Vorlagen: persönliche Mails ohne Tipparbeit (Pipedrive-Vorbild) | 2026-07-07 |
| Leere Felder → Ersatztext statt Warnung/Markierung | Nutzerentscheidung: Mail soll ohne Nacharbeit versandfertig sein | 2026-07-07 |
| Intelligente `{Anrede}` mit festem Fallback „Sehr geehrte Damen und Herren," | Häufigster Fall (Anrede) funktioniert immer; übrige Platzhalter mit optionalem Ersatztext je Vorlage | 2026-07-07 |
| Anrede-Form „Guten Tag + voller Name" statt Herr/Frau | Kein Anrede-Feld am Kunden vorhanden; funktioniert sofort mit allen Bestandsdaten (Pipedrive-Import), geschlechtsneutral | 2026-07-07 |
| Eigene Vorlagen-Seite statt Verwaltung im Schreibfenster | Nutzerentscheidung: Übersichtlichkeit; im Schreibfenster nur die Auswahl zum Einfügen | 2026-07-07 |
| Einfügen ersetzt Betreff+Text mit Rückfrage bei vorhandenem Inhalt | Kein versehentlicher Verlust von Getipptem, trotzdem schnell | 2026-07-07 |
| Vorlagen Team-weit statt pro Nutzer | Einheitliche Firmen-Kommunikation, einmalige Pflege; konsistent mit Notizen/Aktivitäten | 2026-07-07 |
| Feste Anhänge an Vorlagen bereits in v1 | Nutzerentscheidung: z. B. Firmenbroschüre soll automatisch mitgehen; nutzt bestehende Anhang-Mechanik aus PROJ-7 | 2026-07-07 |

### Technical Decisions
<!-- Added by /architecture -->
| Decision | Rationale | Date |
|----------|-----------|------|
| Vorlagen in der Datenbank (zwei neue Tabellen + eigener Datei-Bereich), nicht lokal im Browser | Vorlagen müssen team-weit geteilt und dauerhaft gespeichert werden (PRD: mehrnutzerfähig). Genau wie Notizen/Aktivitäten. | 2026-07-07 |
| Zugriffsschutz („RLS") wie bei Notizen: jeder angemeldete Nutzer sieht/pflegt alle Vorlagen | Team-weite Vorlagen sind eine Produktentscheidung; identisches Muster ist erprobt und einfach zu prüfen. | 2026-07-07 |
| Platzhalter werden im Browser gefüllt (nicht auf dem Server) | Die Kundendaten liegen beim Öffnen der Akte bereits im Browser vor → Einfügen ist sofort spürbar (kein Warten), Anforderung < 500 ms erfüllt. | 2026-07-07 |
| Platzhalter-Logik als eigener, reiner Helfer mit Unit-Tests | Kernlogik (Anrede-Automatik, Ersatztexte, Betreff-Bereinigung) unabhängig testbar; QA kann jeden Fall abdecken. | 2026-07-07 |
| Vorlagen-Anhänge in eigenem Speicher-Bereich („template-attachments"); beim Einfügen wird die Datei in den Mail-Bereich kopiert | Trennt die Lebensdauer sauber: Vorlage löschen berührt nie eine bereits geschriebene/gesendete Mail (löst die Open Question). | 2026-07-07 |
| Speichern/Ändern/Löschen über Server-Aktionen mit Zod-Prüfung, wie Notizen/Aktivitäten | Konsistent mit dem restlichen Projekt, Pflichtfeld-Prüfung serverseitig (Projekt-Regel). | 2026-07-07 |
| Vorlagen-Text wird beim Speichern UND beim Senden bereinigt (`sanitizeEmailHtml`) | Doppelter Schutz gegen schädliches HTML; die Garantie bleibt der bestehende Versand-Filter aus PROJ-7. | 2026-07-07 |
| Menüpunkt „Vorlagen" ins bestehende Nutzer-Menü (Dropdown), keine neue Leiste | Navigation läuft im Projekt komplett über das Nutzer-Menü (Aktivitäten, Import); konsistent und minimaler Eingriff. | 2026-07-07 |
| Keine neue Bibliothek nötig | Alle Bausteine vorhanden (Formatierungs-Editor, Auswahl-/Dialog-/Tabellen-Komponenten, HTML-Bereinigung, Zod). | 2026-07-07 |

---

## Implementation Notes

### Frontend + Backend (2026-07-07)
In einem Zug gebaut (Datenschicht zuerst, damit alles echt ist), lokal vollständig verifiziert.

**Datenschicht (`src/lib/templates/`):**
- `data.ts` — Typen (`EmailTemplate`, `TemplateAttachment`, `TemplateCustomerFields`), Platzhalter-Liste (`TEMPLATE_PLACEHOLDERS`) und der **reine Helfer `fillPlaceholders`** (Anrede-Automatik, Ersatztexte, HTML-sicheres Einsetzen im Text, Leerzeichen-Bereinigung im Betreff, unbekannte Tokens bleiben stehen). Läuft im Browser → Einfügen ist sofort.
- `data.test.ts` — 10 Unit-Tests (Anrede mit/ohne Ansprechpartner, Ersatztext, leer, unbekannter Token, Betreff-Bereinigung, HTML-Escaping, Mehrfach-Vorkommen).
- `schema.ts` — Zod (`templateInputSchema`, `templateAttachmentRefSchema`).
- `queries.ts` — `getTemplates` (team-weit, alphabetisch, mit Anhängen) + `rowToTemplate`.
- `actions.ts` — Server-Aktionen `createTemplate`, `updateTemplate` (inkl. Anhang-Abgleich: entfernte Dateien werden aus dem Bucket gelöscht), `deleteTemplate` (löscht auch die Anhang-Dateien) und `instantiateTemplateAttachments` (kopiert Vorlagen-Anhänge beim Einfügen als eigene Kopien in den `email-attachments`-Bucket). Text wird mit `sanitizeEmailHtml` bereinigt.

**Frontend:**
- `src/app/vorlagen/page.tsx` — Server-Seite (`getTemplates` → `AppShell` → `TemplatesPage`).
- `src/components/templates/templates-page.tsx` — Liste (shadcn-Tabelle), Leer-Zustand, Löschen-Bestätigung, hostet den Editor-Dialog; optimistische Aktualisierung der Liste.
- `src/components/templates/template-editor-dialog.tsx` — Anlegen/Bearbeiten: Name (Pflicht), Betreff, „Platzhalter einfügen" (fügt in das zuletzt fokussierte Feld ein — Betreff an Cursor-Position oder in den Text-Editor), Formatierungs-Editor, Ersatztext-Felder (nur für tatsächlich genutzte Platzhalter), Anhänge (Upload in den `template-attachments`-Bucket, 18-MB-Grenze).
- `src/components/detail/rich-text-editor.tsx` — **rückwärtskompatibel erweitert**: `forwardRef` + `insertText`-Methode (für Platzhalter), optionaler `toolbarExtra`, `onFocus`. Bestehendes Schreibfenster unverändert nutzbar.
- `src/components/detail/email-composer.tsx` — neue **Vorlagen-Auswahl** (Dropdown, nur wenn Vorlagen existieren): füllt Platzhalter sofort, fragt bei vorhandenem Betreff/Text „Ersetzen?", übernimmt Vorlagen-Anhänge als Kopien. Betreff wird nur ersetzt, wenn die Vorlage einen hat.
- Kundenfelder + Vorlagen werden durchgereicht: `kunde/[id]/page.tsx` → `customer-detail.tsx` → `detail-composer.tsx` → `email-composer.tsx`.
- Menüpunkt „E-Mail-Vorlagen" im Nutzer-Menü (`user-menu.tsx`).

**Datenbank:** Migration `supabase/migrations/proj9_email_vorlagen.sql` (zwei Tabellen, Team-RLS wie `notes`, privater Bucket `template-attachments` + Policies). **Noch nicht auf die Live-DB angewandt** — braucht Nutzer-Freigabe.

**Verifikation:** `tsc --noEmit` sauber · Vitest **69/69** grün · `next build` erfolgreich (Route `/vorlagen` erzeugt). Der echte End-to-End-Test (Vorlage anlegen, einfügen, senden) folgt in `/qa`, sobald die Migration live ist.

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)

### Überblick in einem Satz
PROJ-9 bekommt eine eigene **Vorlagen-Seite** zum Pflegen der Vorlagen (in der Datenbank gespeichert, team-weit) und eine **Vorlagen-Auswahl im E-Mail-Schreibfenster**, die eine Vorlage auswählt, die Platzhalter mit den Daten des geöffneten Kunden füllt und die Vorlagen-Anhänge als eigene Kopien in die Mail übernimmt.

### A) Was der Nutzer sieht (Baumstruktur)

```
Nutzer-Menü (oben rechts)
└── neuer Eintrag „Vorlagen"  →  führt zur Vorlagen-Seite

Vorlagen-Seite  (/vorlagen, nur angemeldet)
├── Kopfzeile: „E-Mail-Vorlagen"  +  Knopf „Neue Vorlage"
├── Leer-Zustand: freundlicher Hinweis + „Erste Vorlage anlegen"
└── Tabelle/Liste der Vorlagen
    └── pro Zeile: Name · Betreff-Vorschau · zuletzt geändert · [Bearbeiten] [Löschen]

Vorlagen-Editor (Dialog, zum Anlegen & Bearbeiten)
├── Feld „Name" (Pflicht)
├── Feld „Betreff" (optional)
├── Knopf „Platzhalter einfügen" (Auswahlliste: {Anrede}, {Firma}, {Ansprechpartner} …)
├── Formatierungs-Editor für den Text (derselbe wie im Schreibfenster)
├── Bereich „Ersatztexte" (je genutztem Platzhalter ein optionales Feld)
├── Anhänge (hochladen, als entfernbare Chips)
└── [Abbrechen] [Speichern]

E-Mail-Schreibfenster (Kundenakte → Reiter „E-Mail", bestehende Komponente)
└── NEU: Auswahl „Vorlage …" ganz oben
    ├── wählt Vorlage → (falls schon Text da: Rückfrage „Ersetzen?")
    ├── setzt Betreff + Text, Platzhalter mit Kundendaten gefüllt
    └── übernimmt Vorlagen-Anhänge als eigene, entfernbare Chips
```

### B) Welche Informationen gespeichert werden (in einfachen Worten)

**Neue Tabelle „E-Mail-Vorlagen":**
- eindeutige Kennung
- Name (Pflicht)
- Betreff (optional)
- Text als formatiertes HTML
- Ersatztexte für Platzhalter (eine kleine Zuordnung, z. B. „Firma → unser Kunde")
- wer zuletzt geändert hat + Zeitstempel „erstellt"/„geändert"

**Neue Tabelle „Vorlagen-Anhänge":** Name, Größe, Typ, Speicherort der Datei — hängt an einer Vorlage; wird die Vorlage gelöscht, verschwinden die Einträge automatisch mit.

**Neuer Datei-Bereich „template-attachments":** ein privater Speicher-Ordner nur für Vorlagen-Anhänge, getrennt vom E-Mail-Anhang-Ordner. Nur angemeldete Nutzer haben Zugriff.

**Speicherort:** Supabase-Datenbank + Supabase-Storage — dieselbe Technik wie bei E-Mails und Anhängen aus PROJ-7. Nichts liegt nur lokal im Browser.

### C) Wie das Einfügen technisch abläuft (der knifflige Teil)

1. Auf der Kundenakte sind die Kundendaten schon im Browser → die **Platzhalter-Ersetzung passiert sofort im Browser** (kein Server-Umweg, kein Warten).
2. Für die **Anrede** greift die feste Automatik: mit Ansprechpartner „Guten Tag [Name]," — ohne „Sehr geehrte Damen und Herren,". Andere leere Platzhalter nehmen den Ersatztext der Vorlage oder bleiben leer. Danach werden im Betreff überflüssige Leerzeichen bereinigt.
3. Die **Anhänge der Vorlage werden kopiert**: Beim Einfügen entsteht pro Vorlagen-Anhang eine eigene, unabhängige Datei im E-Mail-Anhang-Bereich. Ab da gehört sie zur Mail — genau wie ein selbst hochgeladener Anhang. Deshalb kann das spätere Löschen der Vorlage einer offenen oder gesendeten Mail nichts anhaben.
4. Ab hier ist alles wie gewohnt: Der Nutzer kann alles ändern und sendet über den bestehenden PROJ-7-Weg.

### D) Was neu gebaut wird (Bausteine, Entwickler-Sicht)
- **Datenzugriff/Logik:** neues Modul für Vorlagen (`getTemplates`, `createTemplate`, `updateTemplate`, `deleteTemplate`) nach dem Muster von Notizen/Aktivitäten, mit Zod-Prüfung.
- **Reiner Helfer** für Platzhalter (Anrede-Automatik, Ersatztexte, Betreff-Bereinigung) — mit Unit-Tests.
- **Seite** `/vorlagen` + **Editor-Dialog** + **Vorlagen-Tabelle** (nutzt vorhandene shadcn-Bausteine: Tabelle, Dialog, Auswahl, Formatierungs-Editor).
- **Erweiterung** am bestehenden `EmailComposer`: Vorlagen-Auswahl oben, Ersetzen-Rückfrage, Kopieren der Anhänge.
- **Menüpunkt** „Vorlagen" im Nutzer-Menü.
- **Datenbank-Migration** (zwei Tabellen + Zugriffsschutz) und **neuer Storage-Bereich** — über die Supabase-Anbindung.

### E) Sicherheit
- Login-Pflicht für Seite und alle Aktionen (Zugriffsschutz wie bei Notizen/Aktivitäten).
- Vorlagen-Text wird beim Speichern und beim Senden bereinigt → kein neuer Weg für schädliches HTML.
- Privater Datei-Bereich, keine öffentlichen Vorlagen-Anhänge.

### F) Zusätzliche Pakete
**Keine.** Alles Nötige ist bereits im Projekt (Formatierungs-Editor, shadcn-Bausteine, HTML-Bereinigung `sanitize-html`, Zod).

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
