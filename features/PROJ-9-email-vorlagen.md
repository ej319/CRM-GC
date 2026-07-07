# PROJ-9: E-Mail-Vorlagen

## Status: Planned
**Created:** 2026-07-07
**Last Updated:** 2026-07-07

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
- [ ] Sollen beim Löschen einer Vorlage deren Anhang-Dateien im Speicher sofort mitgelöscht werden oder (wie bei E-Mail-Anhängen) erhalten bleiben? → in /architecture klären

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

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)
_To be added by /architecture_

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
