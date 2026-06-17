# PROJ-2: Pipeline-basierte Kundenverwaltung

## Status: In Progress
**Created:** 2026-06-17
**Last Updated:** 2026-06-17

## Dependencies
- Requires: PROJ-1 (Supabase Infrastruktur & Auth) — Login + Datenbank
- Verwandt: PROJ-3 (Excel-Import füllt das Board), PROJ-4 (Detailansicht mit Verlauf), PROJ-5 (Aktivitäten liefern die Marker-/Sortier-Daten)

## User Stories
- As a Vertriebsnutzer, I want to alle Interessenten/Kunden als Karten in einem Phasen-Board sehen so that ich den Stand auf einen Blick erfasse.
- As a Vertriebsnutzer, I want to mit einem grünen „+"-Button schnell einen neuen Kunden anlegen (nur Firmenname Pflicht) so that ich Leads sofort festhalten kann.
- As a Vertriebsnutzer, I want to Karten per Drag-and-Drop zwischen Phasen verschieben so that ich den Fortschritt pflege.
- As a Vertriebsnutzer, I want to auf jeder Karte einen Aktivitäts-Marker sehen so that ich erkenne, wo ich dranbleiben muss.
- As a Vertriebsnutzer, I want to per Klick auf eine Karte die Kunden-Detailseite (neuer Tab) öffnen so that ich Felder bearbeiten, die Phase ändern oder den Kunden löschen kann.
- As a Vertriebsnutzer, I want to die Karten nach verschiedenen Kriterien sortieren so that ich die Liste nach Bedarf ordne.

## Out of Scope
- **Verlauf** (Notizen, Aktivitäten, E-Mails) auf der Detailseite → PROJ-4. PROJ-2 baut nur das Detailseiten-Gerüst (Felder anzeigen/bearbeiten, Phase ändern, löschen).
- **Aktivitäts-Marker-Logik** (Datenquelle Aktivitäten) und die Sortierung „Letzte Aktivität" → vollständig mit PROJ-5. In PROJ-2 nur die Anzeige; ohne Aktivitätsdaten zeigen alle Karten das gelbe Warndreieck.
- **Excel-Import** → PROJ-3. **Anrufen/Mailen aus der Karte** → PROJ-7/PROJ-8.
- **Mehrere Pipelines**, **mehrere Aufträge pro Kunde** (Karte = Auftrag), **Archiv/Suche/Filter** → spätere Ausbaustufen.
- **Verwaltung der Auswahllisten** (Kategorie/Quelle per Oberfläche bearbeiten) → spätere Ausbaustufe; die Quellen-Liste muss aber erweiterbar angelegt sein.

## Acceptance Criteria

**Format:** Angenommen [Vorbedingung] / Wenn [Aktion] / Dann [Ergebnis]

- [ ] Angenommen ich bin angemeldet, wenn ich das Board öffne, dann sehe ich 8 Phasen-Spalten (Kalter Kontakt, Gespräch aufgenommen, Anfrage, Lead, Vor Ort Termin, Angesprochen, Gewonnen, Verloren) mit den Kundenkarten in der jeweiligen Phase.
- [ ] Angenommen das Board hat keine Kunden, wenn ich es öffne, dann sehe ich einen Hinweis „Noch keine Kunden" und den grünen „+"-Button.
- [ ] Angenommen ich klicke den grünen „+"-Button, wenn ich nur den Firmennamen eingebe und speichere, dann erscheint eine neue Karte in der Phase „Kalter Kontakt".
- [ ] Angenommen ich lasse den Firmennamen leer, wenn ich auf Speichern klicke, dann erscheint eine Validierungsmeldung und es wird nicht gespeichert.
- [ ] Angenommen eine Karte existiert, wenn ich sie per Drag-and-Drop in eine andere Phase ziehe, dann bleibt sie dort und der Stand ist nach dem Neuladen der Seite erhalten.
- [ ] Angenommen ich klicke auf eine Karte, wenn die Detailansicht geöffnet wird, dann öffnet sie sich in einem neuen Browser-Tab unter einer eigenen Adresse.
- [ ] Angenommen ich bin auf der Detailseite, wenn ich Felder ändere und speichere, dann sind die Änderungen anschließend auf dem Board sichtbar.
- [ ] Angenommen ich bin auf der Detailseite, wenn ich auf „Löschen" klicke und die Sicherheitsabfrage bestätige, dann verschwindet die Karte vom Board.
- [ ] Angenommen eine Karte hat Ort, Kategorie oder Monatswert, wenn ich sie auf dem Board ansehe, dann werden diese Angaben auf der Karte angezeigt.
- [ ] Angenommen eine Karte hat keine geplante Aktivität, wenn ich das Board ansehe, dann zeigt die Karte das gelbe Warndreieck (vollständige Marker-Logik mit PROJ-5).
- [ ] Angenommen ich wähle eine Sortierung (Alphabet, Letzte Aktivität, Auftragswert oder Kategorie), wenn ich sie anwende, dann werden die Karten innerhalb jeder Spalte entsprechend sortiert.

## Edge Cases
- Was passiert bei sehr vielen Karten in einer Spalte? → Die Spalte wird innerhalb scrollbar.
- Was passiert mit einer Karte, die nur einen Firmennamen hat? → Sie wird angezeigt, optionale Felder bleiben einfach leer.
- Was passiert, wenn das Speichern beim Verschieben fehlschlägt (Netzwerk)? → Die Karte springt sichtbar in die alte Phase zurück und es erscheint eine Fehlermeldung.
- Was passiert beim Löschen eines Kunden, an dem später Aktivitäten/Notizen hängen? → Diese werden mitgelöscht (CASCADE); die Sicherheitsabfrage weist darauf hin.
- Was passiert bei gleichzeitiger Bearbeitung durch zwei Nutzer (später relevant)? → Die zuletzt gespeicherte Änderung gewinnt; bewusst einfach gehalten.
- Was passiert bei Sortierung „Letzte Aktivität" für Kunden ohne Aktivität? → Diese stehen ganz oben.
- Mobile Ansicht: Drag-and-Drop ist auf kleinen Touch-Bildschirmen schwierig → auf Mobil kann die Phase alternativ auf der Detailseite per Auswahl geändert werden.

## Technical Requirements (optional)
- Security: Zugriff nur für angemeldete, freigeschaltete Nutzer (PROJ-1). Row Level Security auf allen neuen Tabellen.
- Geteilte Team-Daten: alle angemeldeten Nutzer sehen und bearbeiten dieselbe Pipeline (kein privater Pro-Nutzer-Bestand).
- Datenmodell-Hinweis (Detail in /architecture): eine Kunden-Tabelle mit direkter Phasen-Zuordnung (Karte = Kunde). Quelle als erweiterbare Liste anlegen.
- Performance: Drag-and-Drop soll sich flüssig anfühlen; Änderungen werden sofort gespeichert.

## Open Questions
- [ ] Genaue Startwerte bestätigt: Kategorie = Büro, Arztpraxis, Kanzlei, Industrie, Fitnessstudio, Sonstige · Quelle = Google, Sonstige. (Quelle später erweiterbar um LinkedIn, Facebook, YouTube, Google SEO, Google AdWords, Kaltakquise.)
- [ ] Standard-Sortierung beim Öffnen: Vorschlag „Letzte Aktivität".

## Decision Log

### Product Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Karte = Kunde/Interessent (nicht einzelner Auftrag) | Einfacher zu bauen/bedienen; passt zu den Phasen; mehrere Aufträge pro Kunde später möglich | 2026-06-17 |
| Notizen sind kein Kundenfeld | Gehören in den Verlauf der Detailansicht (PROJ-4/PROJ-6), rechts-mittig | 2026-06-17 |
| 4 Aktivitäts-Marker auf der Karte (grün/grau/rot/gelb) | Schneller Überblick, wo Handlungsbedarf ist; Logik via PROJ-5 | 2026-06-17 |
| Klick auf Karte öffnet Detailseite (eigene URL) im neuen Tab | Board bleibt offen, Kunden parallel öffenbar | 2026-06-17 |
| Bearbeiten/Löschen/Phase auf der Detailseite (PROJ-2-Gerüst) | Klare Trennung; Verlauf folgt in PROJ-4 | 2026-06-17 |
| Eine Pipeline mit 8 festen Phasen; neue Karte startet in „Kalter Kontakt" | Schlanker Start; mehrere Pipelines später | 2026-06-17 |
| Gewonnen/Verloren als normale Spalten (kein Auto-Archiv) | Einfachste Lösung; Archiv/Filter später | 2026-06-17 |
| Endgültiges Löschen mit Sicherheitsabfrage | Reicht für MVP; kein Papierkorb nötig | 2026-06-17 |
| Karten sortierbar: Alphabet, Letzte Aktivität (neue ohne Aktivität oben), Auftragswert, Kategorie | Flexible Ordnung je nach Arbeitsweise | 2026-06-17 |
| Quelle startet minimal (Google, Sonstige), aber erweiterbar angelegt | Marketing-Plattformen (LinkedIn, Facebook, YouTube, Google SEO/AdWords, Kaltakquise) folgen später | 2026-06-17 |
| Geteilte Team-Pipeline (alle sehen dieselben Kunden) | Mehrnutzer-Ziel aus dem PRD | 2026-06-17 |

### Technical Decisions
<!-- Added by /architecture -->
| Decision | Rationale | Date |
|----------|-----------|------|
| Eine `customers`-Tabelle mit direkter Phasen-Zuordnung (Karte = Kunde) | Einfachstes Modell, passt zu „Karte = Kunde" | 2026-06-17 |
| Pipeline-Phasen als eigene Tabelle (Name, Reihenfolge, Farbe, gewonnen/verloren), 8 vorab angelegt | Erlaubt späteres Umbenennen/Sortieren/mehrere Pipelines ohne Code-Umbau | 2026-06-17 |
| Kategorie/Quelle als Textfeld + App-seitige Auswahlliste | Einfach jetzt, leicht erweiterbar (Marketing-Quellen später); Verwaltungs-Oberfläche später | 2026-06-17 |
| Drag-and-Drop via `@dnd-kit` | Bewährt, performant, tastatur-/barrierearm; kein Eigenbau | 2026-06-17 |
| Speichern über Next Server Actions; optimistische Updates beim Verschieben | Flüssige Bedienung; Karte springt bei Fehler zurück | 2026-06-17 |
| Detailseite unter eigener Route `/kunde/[id]` | Nur so im neuen Tab öffenbar | 2026-06-17 |
| Board ersetzt die Platzhalter-Startseite „/" | Pipeline ist der Hauptarbeitsbereich (Landing nach Login) | 2026-06-17 |
| RLS: alle angemeldeten/freigeschalteten Nutzer dürfen lesen + schreiben | Gemeinsame Team-Pipeline (PRD-Ziel) | 2026-06-17 |

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)

### Bausteine der Oberfläche
```
Board-Seite „/"  (im Grund-Gerüst mit oberer Leiste + Nutzer-Menü)
├── Kopfzeile:  [grüner +-Button „Neuer Kunde"]   [Sortier-Auswahl ▾]
├── Kanban-Board (8 Spalten, seitlich scrollbar)
│     ├── Spalte „Kalter Kontakt"
│     │     └── Kundenkarte (ziehbar) – Name · Ort · Kategorie-Etikett · Wert · Aktivitäts-Marker
│     ├── „Gespräch aufgenommen" → … → „Gewonnen" → „Verloren"
│     └── Leer-Zustand: „Noch keine Kunden" + Hinweis auf +-Button
└── Anlegen-/Bearbeiten-Dialog (Formular-Fenster)

Kunden-Detailseite „/kunde/[id]"  (öffnet im neuen Tab)
├── Kundenfelder anzeigen + bearbeiten
├── Phase ändern (Auswahl)
├── Löschen (Sicherheitsabfrage)
└── [Platzhalter für Verlauf → PROJ-4]
```

### Datenmodell (in Klartext)
- **Pipeline-Phasen** – Name, Reihenfolge, Farbe, Kennzeichen „gewonnen"/„verloren". 8 Einträge werden einmalig vorab angelegt.
- **Kunden** – Firmenname (Pflicht), Ansprechpartner, Telefon, E-Mail, Adresse/PLZ/Ort, Kategorie, Quelle, Monatswert, aktuelle Phase, Erstell-/Änderungsdatum.
- Geteilte Team-Daten: alle angemeldeten, freigeschalteten Nutzer sehen/bearbeiten dieselben Kunden (RLS schützt vor nicht angemeldeten Zugriffen).

Speicherort: Supabase (PostgreSQL).

### Tech-Entscheidungen (warum)
- Fertige **Drag-and-Drop-Bibliothek** (`@dnd-kit`) statt Eigenbau: flüssig, bedienbar, weniger Fehler.
- **Phasen als eigene Tabelle**: spätere Erweiterung (Umbenennen, mehrere Pipelines) ohne Code-Umbau.
- **Kategorie/Quelle als App-Auswahlliste**: einfach + erweiterbar.
- **Optimistisches Speichern** beim Verschieben: sofortige Reaktion, Rücksprung bei Fehler.
- **Eigene Adresse pro Kunde**: ermöglicht „im neuen Tab öffnen".

### Abhängigkeiten (zu installieren)
- `@dnd-kit/core`, `@dnd-kit/sortable` – Drag-and-Drop fürs Kanban-Board.
- Formulare/Validierung: `zod` + `react-hook-form` (bereits installiert).

## Frontend-Implementierung (Stand 2026-06-17)
- **Board auf „/"** (ersetzt den Platzhalter): 8 Phasen-Spalten, Karten per **Drag-and-Drop** verschiebbar (`@dnd-kit/core`), **grüner „+ Neuer Kunde"-Button**, **Sortier-Auswahl** (Letzte Aktivität / Alphabet / Auftragswert / Kategorie), Leer-Zustand.
- **Karte** zeigt Firmenname, Ort, Kategorie-Etikett (farbig), Monatswert und den **Aktivitäts-Marker** (4 Zustände). Klick öffnet die **Detailseite im neuen Tab**.
- **Anlege-Formular** als Dialog (`react-hook-form` + `zod`): nur Firmenname Pflicht, E-Mail-/Zahl-Validierung; neue Karte startet in „Kalter Kontakt".
- **Detailseite `/kunde/[id]`**: Kundenfelder, Phasen-Auswahl, Speichern, Löschen (Sicherheitsabfrage) und **Verlauf-Platzhalter** rechts (PROJ-4).
- **Neue Dateien:** `src/lib/pipeline/data.ts` (8 Phasen, Kategorie-/Quellen-Listen, 8 Beispiel-Kunden, Sortier-Helfer); `src/components/pipeline/{activity-marker,customer-card,pipeline-column,customer-form-dialog,pipeline-board,customer-detail}.tsx`; `src/app/kunde/[id]/page.tsx`. Geändert: `src/app/page.tsx`.
- **Verifikation:** `tsc --noEmit` ohne Fehler; Dev-Server kompiliert sauber; „/" liefert für angemeldete Nutzer HTTP 200.
- **Vorschau-Hinweis:** Es werden **Beispiel-Kunden** angezeigt; Anlegen/Verschieben passieren bisher nur im Browser-Speicher, Speichern/Löschen/Phase auf der Detailseite zeigen einen Hinweis-Toast.
- **Offen für `/backend`:** Tabellen `pipeline_stages` + `customers` mit RLS; echtes Anlegen/Verschieben/Bearbeiten/Löschen persistieren; Beispieldaten durch echte DB-Daten ersetzen; Detailseite an die Datenbank anbinden.

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
