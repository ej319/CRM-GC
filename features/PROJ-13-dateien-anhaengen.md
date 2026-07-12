# PROJ-13: Dateien/Angebote anhängen

## Status: Architected
**Created:** 2026-07-12
**Last Updated:** 2026-07-12

> **Kurzfassung:** Am Kunden lassen sich Dateien (Angebote, PDFs, Fotos, Office-Dokumente) ablegen, in einer Liste ansehen, herunterladen und wieder löschen. Der „Dateien"-Bereich zeigt eine **Gesamtübersicht**: selbst hochgeladene Dateien **und** die Anhänge aus gesendeten E-Mails (Herkunft klar erkennbar). Abgelegte Dateien können außerdem direkt an eine neue E-Mail angehängt werden.

## Dependencies
- Requires: PROJ-1 (Auth) — Login-Pflicht, Team-Datenhaltung
- Requires: PROJ-2 (Kunden) — Dateien hängen am Kunden
- Requires: PROJ-4 (Detailansicht/Verlauf) — „Datei"-Reiter und „Dateien"-Filter im Verlauf sind dort als Platzhalter vorbereitet
- Integriert mit: PROJ-7 (E-Mail-Versand) — E-Mail-Anhänge werden mit angezeigt; abgelegte Dateien können an Mails angehängt werden

## User Stories
- Als Vertriebsnutzer möchte ich beim Kunden eine Datei (z. B. ein Angebot als PDF) hochladen, damit alle wichtigen Unterlagen an einem Ort liegen.
- Als Vertriebsnutzer möchte ich eine kurze Beschreibung zu einer Datei erfassen, damit ich sie später auch bei kryptischem Dateinamen wiedererkenne.
- Als Vertriebsnutzer möchte ich alle Dateien eines Kunden – auch die Anhänge gesendeter E-Mails – an einem Ort sehen und herunterladen, damit ich nichts suchen muss.
- Als Vertriebsnutzer möchte ich eine abgelegte Datei direkt an eine neue E-Mail anhängen, damit ich sie nicht erst herunterladen und wieder hochladen muss.
- Als Vertriebsnutzer möchte ich eine selbst hochgeladene Datei wieder löschen können, damit veraltete Unterlagen verschwinden.

## Funktionsbeschreibung

### „Datei"-Reiter (Anlege-Leiste in der Kundenakte)
- Datei-Upload (eine oder mehrere), optional mit kurzer **Beschreibung**.
- Fortschritts-/Ladeanzeige beim Hochladen; danach erscheint die Datei sofort in der Liste.

### „Dateien" im Verlauf (Gesamtübersicht)
- Liste aller Dateien des Kunden, neueste zuerst:
  - **Selbst hochgeladene** Dateien (Name, optionale Beschreibung, Größe, Datum, wer).
  - **E-Mail-Anhänge** aus gesendeten Mails (mit Kennzeichnung „aus E-Mail" + Betreff/Datum als Herkunft).
- Pro Datei: **Herunterladen**. Zusätzlich bei selbst hochgeladenen Dateien: **Löschen** (mit Bestätigung).
- E-Mail-Anhänge sind hier **nur ansehbar/herunterladbar**, nicht löschbar (sie gehören zur E-Mail).
- Der bestehende „Dateien"-Filter im Verlauf zeigt genau diese Übersicht.

### E-Mail-Integration
- Im E-Mail-Schreibfenster gibt es zusätzlich zu „Anhang hochladen" die Möglichkeit **„Aus abgelegten Dateien wählen"**: Die selbst hochgeladenen Dateien des Kunden werden zur Auswahl angeboten und als Anhang übernommen (eigene Kopie, wie bei den bestehenden Anhängen).

### Grenzen & Regeln
- **Alle Dateitypen** erlaubt (außer offensichtlich ausführungs-riskante) — Dateien werden nur gespeichert und heruntergeladen, **nie** von der App ausgeführt oder inline gerendert.
- **Max. ~20 MB pro Datei** (passt zum E-Mail-Versand über Gmail, 25 MB).
- Team-weit sichtbar (wie Notizen/E-Mails/Vorlagen).

## Out of Scope
- **Löschen von E-Mail-Anhängen** aus dem Datei-Bereich — sie gehören zur E-Mail (nur Download).
- **Vorschau/Inline-Anzeige** von Dateien (PDF-Viewer, Bildvorschau) — vorerst nur Download.
- **Ordner/Kategorien/Tags** — flache Liste reicht für den Start (optionale Beschreibung als Hilfe).
- **Versionierung** von Dateien (mehrere Stände derselben Datei) — nicht nötig.
- **Umbenennen** der eigentlichen Datei — nur die optionale Beschreibung ist editierbar (siehe Open Questions).
- **Dateien an Notizen/Aktivitäten** hängen — Dateien hängen am Kunden.
- **Freigabe-Links** nach außen (öffentliche Download-Links) — Dateien bleiben login-geschützt.

## Acceptance Criteria

**Format:** Angenommen [Vorbedingung] / Wenn [Aktion] / Dann [Ergebnis]

- [ ] Angenommen der Nutzer ist in der Kundenakte im „Datei"-Reiter, wenn er eine Datei auswählt und hochlädt, dann erscheint sie danach in der Datei-Übersicht mit Name, Größe und Datum
- [ ] Angenommen der Nutzer lädt eine Datei mit Beschreibung hoch, wenn der Upload fertig ist, dann wird die Beschreibung bei der Datei angezeigt
- [ ] Angenommen eine Datei überschreitet ~20 MB, wenn der Nutzer sie hochlädt, dann erscheint ein Hinweis und die Datei wird nicht abgelegt
- [ ] Angenommen der Kunde hat noch keine Dateien und keine E-Mail-Anhänge, wenn der Nutzer die Datei-Übersicht öffnet, dann sieht er einen freundlichen Leer-Hinweis
- [ ] Angenommen eine selbst hochgeladene Datei existiert, wenn der Nutzer auf „Herunterladen" klickt, dann wird die Originaldatei heruntergeladen
- [ ] Angenommen eine selbst hochgeladene Datei existiert, wenn der Nutzer auf „Löschen" klickt, dann erscheint ein Bestätigungsdialog und erst nach Bestätigung ist die Datei entfernt
- [ ] Angenommen eine gesendete E-Mail hatte einen Anhang, wenn der Nutzer die Datei-Übersicht öffnet, dann erscheint dieser Anhang mit Kennzeichnung „aus E-Mail" und lässt sich herunterladen, aber nicht löschen
- [ ] Angenommen der Kunde hat abgelegte Dateien, wenn der Nutzer im E-Mail-Schreibfenster „Aus abgelegten Dateien wählen" nutzt, dann kann er eine davon als Anhang übernehmen und mitsenden
- [ ] Angenommen der Nutzer ist nicht angemeldet, wenn er eine Datei-Adresse aufruft, dann erhält er keinen Zugriff (login-geschützt)

## Edge Cases
- **Sehr großer Upload / Netzwerkfehler:** Fehlermeldung, die Datei wird nicht abgelegt; bereits hochgeladene Dateien bleiben.
- **Mehrere Dateien gleichzeitig hochladen:** jede einzeln mit Fortschritt; scheitert eine, betrifft es die anderen nicht.
- **Gleicher Dateiname zweimal:** beide werden als getrennte Einträge abgelegt (kein Überschreiben).
- **Datei gelöscht, während sie gerade in einer offenen Mail als Anhang hängt:** die bereits ins Schreibfenster übernommene Kopie bleibt für diese Mail erhalten (wie bei bestehenden Anhängen).
- **Kunde wird gelöscht:** seine abgelegten Dateien werden mitgelöscht.
- **Datei ohne Beschreibung:** nur der Dateiname wird angezeigt (kein Fehler).
- **E-Mail-Anhang und gleichnamige eigene Datei:** beide erscheinen getrennt, Herkunft klar erkennbar.

## Technical Requirements (optional)
- Login-Pflicht für alle Datei-Aktionen; Team-RLS wie bei Notizen/Aktivitäten; privater Storage (keine öffentlichen Links).
- Dateien werden nie serverseitig ausgeführt oder inline gerendert — nur gespeichert/heruntergeladen.
- Upload/Übersicht fühlen sich flüssig an; große Listen bleiben bedienbar (Limit auf Abfragen).

## Open Questions
- [x] Beschreibung nachträglich editierbar? → **Ja** (gelöst in /architecture): kleine Server-Aktion zum Ändern der Beschreibung einer eigenen Datei.
- [x] Sortierung/Filter? → **MVP: „neueste zuerst"**, Herkunft je Zeile gekennzeichnet („aus E-Mail"); keine zusätzlichen Filter.

## Decision Log

### Product Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Ablegen/Verwalten **und** direkt per Mail versenden | Nutzerentscheidung; spart Herunterladen+Wiederhochladen | 2026-07-12 |
| Datei-Übersicht zeigt eigene Uploads **und** E-Mail-Anhänge (Herkunft markiert) | Nutzerentscheidung: eine Gesamtübersicht aller Dateien des Kunden | 2026-07-12 |
| E-Mail-Anhänge in der Übersicht nur ansehen/herunterladen (nicht löschbar) | Integrität: Anhänge gehören zur gesendeten Mail; kein versehentliches Löschen | 2026-07-12 |
| Alle Dateitypen (außer riskante), max ~20 MB | Nutzerentscheidung; Dateien werden nie ausgeführt/gerendert, nur gespeichert/geladen; Größe passt zu Gmail | 2026-07-12 |
| Optionale Beschreibung pro Datei | Wiedererkennung bei kryptischen Dateinamen (z. B. „scan_001.pdf") | 2026-07-12 |
| Team-weit (nicht pro Nutzer) | Konsistent mit Notizen/E-Mails/Vorlagen | 2026-07-12 |
| Nur Download, keine Inline-Vorschau (MVP) | Schlank; Vorschau kann später kommen | 2026-07-12 |

### Technical Decisions
<!-- Added by /architecture -->
| Decision | Rationale | Date |
|----------|-----------|------|
| Neue Tabelle `customer_files` + eigener privater Bucket `customer-files` | Sauber getrennt von E-Mail-Anhängen; Team-RLS wie `notes` | 2026-07-12 |
| Download über kurzlebige **signierte Links** (wie E-Mail-Anhänge) | Bestehendes, erprobtes Muster (`createSignedUrl`); privat, kein öffentlicher Link | 2026-07-12 |
| Gesamtübersicht = `customer_files` **+** die Anhänge der bereits geladenen E-Mails, im Browser zusammengeführt | Kein zweiter Server-Umweg; die Kundenakte lädt E-Mails inkl. Anhänge ohnehin | 2026-07-12 |
| „Aus abgelegten Dateien wählen": ausgewählte Datei wird in den `email-attachments`-Bucket **kopiert** | Mail bekommt eigene, unabhängige Kopie (wie Vorlagen-Anhänge in PROJ-9) | 2026-07-12 |
| Server-Aktionen mit Zod, wie Notizen/Vorlagen | Konsistenz, Pflicht-/Größenprüfung serverseitig | 2026-07-12 |
| Keine neue Bibliothek | shadcn-Bausteine + bestehende Storage-/Upload-Mechanik reichen | 2026-07-12 |

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)

### Überblick in einem Satz
PROJ-13 legt Kundendateien in einer neuen Tabelle + eigenem privaten Speicher-Bereich ab, zeigt im Verlauf eine **zusammengeführte Übersicht** aus eigenen Uploads und E-Mail-Anhängen und erlaubt, eine abgelegte Datei beim Mailschreiben als Anhang zu übernehmen.

### A) Was der Nutzer sieht (Baumstruktur)

```
Kundenakte → Anlege-Leiste
└── Reiter „Datei" (ersetzt Platzhalter)
    ├── Datei(en) auswählen  +  optionale Beschreibung
    └── Hochladen (mit Ladeanzeige)

Kundenakte → Verlauf
└── Filter „Dateien" (ersetzt Platzhalter)
    └── Liste (neueste zuerst):
        ├── eigene Datei: Name · Beschreibung · Größe · Datum · [Herunterladen] [Löschen]
        └── E-Mail-Anhang: Name · Größe · „aus E-Mail: Betreff, Datum" · [Herunterladen]

E-Mail-Schreibfenster
└── NEU: „Aus abgelegten Dateien wählen" → Liste der Kundendateien → als Anhang übernehmen
```

### B) Welche Informationen gespeichert werden (in einfachen Worten)

**Neue Tabelle „Kundendateien":** Kennung, Kunde, Dateiname, optionale Beschreibung, Größe, Typ, Speicherort, wer hochgeladen hat, Zeitpunkt. Wird der Kunde gelöscht, verschwinden seine Dateien automatisch mit.

**Neuer privater Speicher-Bereich „customer-files":** nur für angemeldete Nutzer; keine öffentlichen Links.

**E-Mail-Anhänge** bleiben unverändert dort, wo sie sind (bei der E-Mail) — sie werden in der Übersicht nur **mitangezeigt**, nicht kopiert oder verschoben.

### C) Wie die Übersicht entsteht (einfach erklärt)
Die Kundenakte lädt die E-Mails des Kunden ohnehin schon inklusive ihrer Anhänge. Für die „Dateien"-Übersicht werden diese Anhänge mit den selbst hochgeladenen Dateien **im Browser zu einer Liste zusammengeführt** und nach Datum sortiert. Jede Zeile zeigt klar, woher sie stammt. Kein zusätzlicher Server-Abruf nötig.

### D) Was neu gebaut wird (Entwickler-Sicht, knapp)
- **Datenschicht** `src/lib/files/` (Typen, Query `getCustomerFiles`, Server-Aktionen: hochladen-Eintrag anlegen, Beschreibung ändern, löschen inkl. Storage-Datei, und „Kundendatei → E-Mail-Anhang kopieren").
- **Datei-Reiter**: Upload (Browser → Bucket) + Beschreibung, im bestehenden `DetailComposer`.
- **Verlauf „Dateien"**: zusammengeführte Liste (eigene Dateien + E-Mail-Anhänge), Download per signiertem Link, Löschen nur für eigene Dateien.
- **Composer**: „Aus abgelegten Dateien wählen" (Auswahl-Dialog) → Kopie in `email-attachments`.
- **Datenbank-Migration**: Tabelle + Bucket + Team-RLS-Policies.

### E) Sicherheit
- Login-Pflicht überall; Team-RLS wie bei Notizen; privater Bucket, Download nur über kurzlebige signierte Links.
- Dateien werden **nie** ausgeführt oder inline gerendert — nur gespeichert und heruntergeladen.

### F) Zusätzliche Pakete
**Keine.**

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
