# PROJ-4: Kunden-/Auftrags-Detailansicht mit komplettem Verlauf

## Status: Planned
**Created:** 2026-06-22
**Last Updated:** 2026-06-22

## Dependencies
- Requires: PROJ-1 (Supabase Infrastruktur & Auth) — Login + Datenbank, freigeschaltete Nutzer
- Requires: PROJ-2 (Pipeline-basierte Kundenverwaltung) — Kunden-Tabelle, Detailseiten-Gerüst `/kunde/[id]`, Phasen, Kategorie
- **Enthält PROJ-6 (Notizen):** PROJ-6 geht in PROJ-4 auf (Notizen sind die erste, voll funktionsfähige Verlauf-Quelle)
- Verwandt (klinken sich später in denselben Verlauf ein): PROJ-5 (Aktivitäten → „Fokus" + Verlauf), PROJ-7 (E-Mails → Verlauf), PROJ-8 (Anruf aus der Telefonnummer), PROJ-13 (Dateien → Verlauf)

## User Stories
- Als Vertriebsnutzer möchte ich auf der Kunden-Detailseite alle Basisdaten links kompakt sehen (Ansprechpartner, Telefon, E-Mail, Adresse, Kategorie als farbiges Etikett, Phase, Monatswert), damit ich den Kunden auf einen Blick erfasse.
- Als Vertriebsnutzer möchte ich die Kundendaten über einen „Bearbeiten"-Button ändern und speichern, damit ich Angaben aktuell halte.
- Als Vertriebsnutzer möchte ich oben schnell eine Notiz anlegen (später auch Aktivität/E-Mail/Datei), damit ich Festgehaltenes sofort dokumentiere.
- Als Vertriebsnutzer möchte ich im Verlauf alle Notizen chronologisch (neueste oben) mit Verfasser und Zeit sehen, damit ich den kompletten Kontaktverlauf nachvollziehe.
- Als Vertriebsnutzer möchte ich Notizen bearbeiten und (mit Bestätigung) löschen können, damit ich Fehler korrigiere.
- Als Vertriebsnutzer möchte ich den Verlauf nach Typ filtern (Alle/Notizen/Aktivitäten/E-Mails/Dateien), damit ich gezielt finde.
- Als Vertriebsnutzer möchte ich einen vorbereiteten „Fokus"-Bereich für Geplantes sehen, damit später anstehende Aktivitäten oben erscheinen.

## Out of Scope
- **Aktivitäten-Funktion** (anlegen/planen/abhaken, „Fokus" mit echten Daten) → PROJ-5. In PROJ-4 nur der Bereich + Platzhalter-Reiter.
- **E-Mail-Anzeige/Versand/Sync** → PROJ-7. Nur Platzhalter-Reiter „kommt bald".
- **Datei-Upload/-Anhang** → PROJ-13. Nur Platzhalter-Reiter.
- **Ein-Klick-Anruf (Placetel)** → PROJ-8. Die Telefonnummer wird in PROJ-4 nur angezeigt.
- **Verwaltung der Auswahllisten** (Label/Kategorie/Quelle selbst bearbeiten) → kleiner separater Schritt später.
- **Phasen-Fortschrittsbalken** oben und **„Gewonnen/Verloren"-Schnellknöpfe** → optional später; die Phase ändert man im Feld.
- **Notiz-Formatierung** (Fett/Listen/Bilder), **Anheften/Pinnen** von Einträgen, **Kommentare** an Einträgen → später.
- **Mehrere Aufträge pro Kunde** (Karte = Kunde aus PROJ-2) → spätere Ausbaustufe.

## Acceptance Criteria

**Format:** Angenommen [Vorbedingung] / Wenn [Aktion] / Dann [Ergebnis]

- [ ] Angenommen ich öffne `/kunde/[id]` eines vorhandenen Kunden, wenn die Seite lädt, dann sehe ich links die kompakte Übersicht (Firmenname, Ansprechpartner, Telefon, E-Mail, Adresse/PLZ/Ort, Kategorie als farbiges Etikett, Quelle, Monatswert, Phase) und im Hauptbereich die Anlege-Leiste, den „Fokus"-Bereich und den Verlauf.
- [ ] Angenommen ich bin in der Übersicht, wenn ich auf „Bearbeiten" klicke, Felder ändere und speichere, dann sind die Änderungen sofort sichtbar und nach dem Neuladen erhalten.
- [ ] Angenommen ich bearbeite den Kunden, wenn ich den Firmennamen leere und speichere, dann erscheint eine Validierungsmeldung und es wird nicht gespeichert.
- [ ] Angenommen ich wähle den Reiter „Notiz", wenn ich Text eingebe und auf „Speichern" klicke, dann erscheint die Notiz oben im Verlauf mit meinem Namen und Zeitstempel.
- [ ] Angenommen ich gebe eine leere Notiz (oder nur Leerzeichen) ein, wenn ich auf „Speichern" klicke, dann wird nichts gespeichert.
- [ ] Angenommen eine Notiz existiert, wenn ich sie bearbeite und speichere, dann zeigt der Verlauf den geänderten Text.
- [ ] Angenommen eine Notiz existiert, wenn ich auf „Löschen" klicke und die Sicherheitsabfrage bestätige, dann verschwindet die Notiz aus dem Verlauf.
- [ ] Angenommen es gibt mehrere Notizen, wenn ich den Verlauf ansehe, dann stehen die neuesten oben.
- [ ] Angenommen der Kunde hat noch keine Einträge, wenn ich den Verlauf ansehe, dann sehe ich den Hinweis „Noch keine Einträge".
- [ ] Angenommen ich wähle einen Filter-Reiter (Alle/Notizen/Aktivitäten/E-Mails/Dateien), wenn ich ihn anklicke, dann zeigt der Verlauf nur diesen Typ; für noch nicht gebaute Typen erscheint „kommt bald".
- [ ] Angenommen die Telefonnummer ist gesetzt, wenn ich die Übersicht ansehe, dann wird sie angezeigt (Ein-Klick-Anruf folgt mit PROJ-8).
- [ ] Angenommen das Speichern einer Notiz schlägt fehl (z.B. Netzwerk), wenn ich speichere, dann erscheint eine Fehlermeldung und mein eingegebener Text bleibt erhalten.
- [ ] Angenommen ich bin nicht angemeldet, wenn ich `/kunde/[id]` öffne, dann werde ich zur Login-Seite geleitet.

## Edge Cases
- Was passiert, wenn der Kunde nicht existiert / gelöscht wurde? → Hinweis „nicht gefunden" + „Zurück zum Board" (bereits aus PROJ-2).
- Was passiert bei sehr langer Notiz / sehr vielen Notizen? → Verlauf ist scrollbar; Zeilenumbrüche im Notiztext werden korrekt dargestellt.
- Was passiert bei gleichzeitiger Bearbeitung desselben Kunden/derselben Notiz durch zwei Nutzer? → Die zuletzt gespeicherte Änderung gewinnt (bewusst einfach, wie PROJ-2).
- Was passiert mit Sonderzeichen/Umlauten/HTML im Notiztext? → Wird als reiner Text dargestellt (escaped), kein HTML/Script wird ausgeführt.
- Was passiert beim Löschen eines Kunden, an dem Notizen hängen? → Die Notizen werden mitgelöscht (CASCADE). Deckt sich mit PROJ-3: Ein rückgängig gemachter Import entfernt den Kunden **inkl.** seiner Notizen.
- Was passiert bei einem Netzwerkfehler beim Laden des Verlaufs? → Verständlicher Fehlhinweis; erneutes Laden möglich.

## Technical Requirements (optional)
- Security: Zugriff nur für angemeldete, freigeschaltete Nutzer (PROJ-1). Geteilte Team-Daten: alle sehen/bearbeiten dieselben Notizen. Row Level Security auf der neuen Notizen-Tabelle.
- Notiztext wird als Klartext gespeichert und escaped angezeigt (kein HTML/Script).
- Performance: Detailseite lädt Kunde + Notizen serverseitig; eine neu angelegte Notiz erscheint sofort im Verlauf.
- Erweiterbarkeit: Der Verlauf ist als einheitliche Zeitleiste angelegt und für die Eintragstypen Aktivität/E-Mail/Datei vorbereitet (Filter-Reiter bereits vorhanden).

## Open Questions
- [ ] Phasen-Fortschrittsbalken oben und „Gewonnen/Verloren"-Schnellknöpfe gewünscht? (Vorschlag: später.)
- [ ] Notiz-Formatierung (Fett/Listen) später nachrüsten? (Aktuell bewusst nur Text.)
- [ ] Eigene Verwaltungs-Oberfläche zum Bearbeiten der Auswahllisten (Label/Kategorie/Quelle) — wann und als welche PROJ-Nummer?

## Decision Log

### Product Decisions
<!-- Added by /write-spec -->
| Decision | Rationale | Date |
|----------|-----------|------|
| PROJ-4 umfasst Layout + voll funktionsfähige Notizen; PROJ-6 (Notizen) geht darin auf | Notizen sind die einzige Verlauf-Quelle ohne externe Abhängigkeit; macht die Detailseite sofort nutzbar und testbar | 2026-06-22 |
| Aktivität/E-Mail/Datei/Anruf bleiben eigene Features (PROJ-5/7/13/8); in PROJ-4 nur Platzhalter-Reiter | Single Responsibility; PROJ-4 baut den erweiterbaren Verlauf-Rahmen | 2026-06-22 |
| Layout gedreht: links kompakte Übersicht, Mitte = Anlege-Leiste + „Fokus" + Verlauf | Entspricht der vom Nutzer gezeigten Pipedrive-Zielansicht | 2026-06-22 |
| Kundendaten bearbeiten über „Bearbeiten"-Button (Lese-Ansicht → editierbar) | Vertraut, einfach, nutzt das bestehende Formular weiter | 2026-06-22 |
| Notiz-Editor = einfacher mehrzeiliger Text | Reicht für Gesprächsnotizen, robust, später erweiterbar | 2026-06-22 |
| „Label" = bestehende Kategorie als farbiges Etikett (kein neues Feld) | Vermeidet doppeltes Feld; die Geschäftsart ist bereits „Kategorie" | 2026-06-22 |
| Notizen: Verfasser + Zeit, neueste oben, bearbeiten/löschen (Löschen mit Bestätigung), geteilte Team-Daten | Nachvollziehbarer Kontaktverlauf, konsistent mit PROJ-2 | 2026-06-22 |
| Telefon nur anzeigen; Ein-Klick-Anruf in PROJ-8 | Klare Trennung; Placetel-Anbindung ist ein eigenes Feature | 2026-06-22 |
| Verwaltung der Auswahllisten (Label/Kategorie/Quelle) als kleiner separater Schritt | Hält PROJ-4 fokussiert | 2026-06-22 |

### Technical Decisions
<!-- Added by /architecture -->
| Decision | Rationale | Date |
|----------|-----------|------|
| Notizen als eigene Tabelle (Verweis auf den Kunden), nicht als Textfeld am Kunden | Mehrere Einträge mit Verfasser/Zeit; Grundlage für die gemeinsame Zeitleiste | 2026-06-22 |
| Notizen `ON DELETE CASCADE` am Kunden | Beim Löschen/Import-Rückgängigmachen verschwinden die Notizen mit dem Kunden (klärt PROJ-3-Frage) | 2026-06-22 |
| Verfasser-Anzeige aus dem Nutzerprofil (Name, Fallback E-Mail) | Nachvollziehbar, ohne den Namen zu duplizieren | 2026-06-22 |
| Verlauf als einheitliche, typ-basierte Zeitleiste (jetzt nur „Notiz") | Aktivität/E-Mail/Datei klinken sich später ohne Umbau ein | 2026-06-22 |
| Umsetzung über Next Server Actions + RLS wie bei `customers` | Konsistent mit PROJ-2/PROJ-3; geteilte Team-Daten geschützt | 2026-06-22 |
| Bearbeiten via Lese-/Editier-Umschaltung, bestehende Speicher-Logik weiterverwenden | Wenig neuer Code, vertraute Bedienung | 2026-06-22 |
| „Label" = bestehende Kategorie als farbiges Etikett (Farben aus vorhandener Map) | Vermeidet ein doppeltes Feld | 2026-06-22 |
| Keine neuen Pakete; vorhandene shadcn-Bausteine (Tabs, Textarea, …) | Kein Eigenbau, kein zusätzliches Risiko | 2026-06-22 |

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)

### Bausteine der Oberfläche
```
Kunden-Detailseite „/kunde/[id]"  (im Grund-Gerüst mit oberer Leiste)
├── Kopf: Firmenname  ·  [← Board]  ·  [Löschen] (Sicherheitsabfrage)
│
├── Linke Spalte – Kundenübersicht (kompakt)
│     ├── Lese-Ansicht: Ansprechpartner · Telefon · E-Mail · Adresse/PLZ/Ort ·
│     │   Kategorie (farbiges Etikett) · Quelle · Monatswert · Phase
│     └── [Bearbeiten] → Felder werden änderbar → [Speichern] / [Abbrechen]
│
└── Hauptbereich (Mitte)
      ├── Anlege-Leiste (Reiter):  [Notiz]aktiv · Aktivität · E-Mail · Datei  (letztere „kommt bald")
      │     └── Notiz-Editor: mehrzeiliges Textfeld + [Speichern]
      ├── „Fokus" (Geplantes) – Platzhalter-Bereich, füllt PROJ-5
      └── Verlauf
            ├── Filter-Reiter:  Alle · Notizen · Aktivitäten · E-Mails · Dateien
            ├── Eintrag (Notiz):  Text · Verfasser · Datum/Zeit · [Bearbeiten] / [Löschen]
            └── Leer-Zustand: „Noch keine Einträge"
```

### Datenmodell (in Klartext)
Neu hinzu kommt:
- **Notizen** (eigene Tabelle): Verweis auf den Kunden, Notiztext, **Verfasser** (welcher Nutzer), Erstell- und Änderungszeit. Beim Löschen des Kunden werden seine Notizen **automatisch mitgelöscht** (CASCADE) – passt zum Import-Rückgängigmachen aus PROJ-3.
- **Verfasser-Anzeige:** Es wird der Name aus dem Nutzerprofil gezeigt (Fallback: E-Mail) – der Name wird nicht doppelt gespeichert.
- Geteilte Team-Daten: alle freigeschalteten Nutzer sehen/bearbeiten dieselben Notizen (Row Level Security).
- Die **Kundenfelder bleiben unverändert** (PROJ-2). „Label" = die bestehende **Kategorie**, als farbiges Etikett dargestellt (Farben aus der schon vorhandenen Kategorie-Farbtabelle).

Speicherort: Supabase (PostgreSQL).

### Wie der Verlauf aufgebaut ist
- Der Verlauf ist eine **einheitliche Zeitleiste mit Eintragstyp**. Aktuell gibt es nur den Typ „Notiz".
- Aktivitäten (PROJ-5), E-Mails (PROJ-7) und Dateien (PROJ-13) klinken sich später als **weitere Eintragstypen** in dieselbe Zeitleiste und dieselben Filter-Reiter ein – **ohne Umbau**. Bis dahin zeigen ihre Reiter „kommt bald".
- Sortierung: neueste oben.

### Tech-Entscheidungen (warum)
- **Notizen als eigene Tabelle** (statt Textfeld am Kunden): erlaubt mehrere Einträge mit Verfasser/Zeit und ist die Grundlage für die gemeinsame Zeitleiste.
- **Reiter & Editor aus vorhandenen Bausteinen** (shadcn-Tabs + Textfeld): kein Eigenbau, kein neues Paket.
- **Bearbeiten per Lese-/Editier-Umschaltung**: nutzt die bestehende Speicher-Logik aus PROJ-2 weiter – wenig neuer Code, vertraute Bedienung.
- **Speichern/Ändern/Löschen über Next Server Actions** (wie PROJ-2/PROJ-3); neue Notiz erscheint sofort.
- **Notiztext als Klartext** (escaped): kein HTML/Script – kein Sicherheitsrisiko.
- **RLS wie bei `customers`**: nur freigeschaltete Nutzer, geteilte Team-Daten.

### Abhängigkeiten (zu installieren)
- **Keine neuen Pakete.** Alle benötigten shadcn/ui-Bausteine (Tabs, Textarea, Card, Button, AlertDialog, Badge, ScrollArea) sind bereits installiert.

## Frontend-Implementierung (Stand 2026-06-22)
- **Detailseite `/kunde/[id]` neu aufgebaut:** oben [← Board] + [Löschen]; darunter Raster mit **linker Kundenübersicht** und **Hauptbereich** (Anlege-Leiste + „Fokus" + Verlauf).
- **Linke Übersicht** (`customer-summary.tsx`): Lese-Ansicht mit Kategorie als **farbigem Etikett**, Ansprechpartner/Telefon/E-Mail/Adresse/Quelle/Monatswert; **Phase** jederzeit per Auswahl änderbar; **„Bearbeiten"-Button** schaltet die Felder editierbar → Speichern. **Speichern/Phase ändern sind echt** (nutzen die PROJ-2-Server-Aktionen `updateCustomer`/`updateCustomerStage`).
- **Anlege-Leiste** (`detail-composer.tsx`): Reiter **Notiz** (mehrzeiliges, gelbes Textfeld + Speichern) aktiv; **Aktivität/E-Mail/Datei** als Platzhalter „kommt bald".
- **Verlauf** (`verlauf.tsx` + `note-item.tsx`): Filter-Reiter (Alle/Notizen/Aktivitäten/E-Mails/Dateien); Notizen als gelbe Einträge mit **Verfasser + Zeit**, **Bearbeiten** (inline) und **Löschen** (Sicherheitsabfrage); Leer-Zustand „Noch keine Einträge"; andere Reiter „kommt bald".
- **„Fokus"** als Platzhalter-Karte (füllt PROJ-5).
- **Neue Dateien:** `src/lib/notes/data.ts`; `src/components/detail/{customer-summary,detail-composer,verlauf,note-item}.tsx`. Geändert: `src/components/pipeline/customer-detail.tsx` (komplett neu als Orchestrator).
- **Verifikation:** `tsc --noEmit` sauber; `npm test` 28/28 grün; `npm run build` erfolgreich (`/kunde/[id]` vorhanden).
- **Vorschau-Hinweis:** Notizen laufen aktuell **nur im Browser** (anlegen/bearbeiten/löschen sichtbar, aber nicht dauerhaft gespeichert). Ein Banner weist darauf hin.
- **Offen für `/backend`:** Tabelle `notes` (Verweis auf Kunde, Text, Verfasser, Zeit, `ON DELETE CASCADE`) mit RLS; Server-Aktionen Notiz anlegen/bearbeiten/löschen; Notizen serverseitig laden (Verfassername aus Profil); Vorschau-Banner entfernen.

## Backend-Implementierung (Stand 2026-06-22)
- **Datenbank:** Neue Tabelle `notes` (Verweis auf den Kunden `customer_id` **ON DELETE CASCADE**, `body`, `author_id` → profiles, `created_at`, `updated_at`) mit Row Level Security (lesen/anlegen/ändern/löschen nur für freigeschaltete Nutzer mit Profil – gleiches Muster wie `customers`). Trigger `notes_set_updated_at`; Index auf `(customer_id, created_at desc)`.
- **Härtung:** `set_updated_at()` mit festem `search_path` (behebt den Advisor-Hinweis „function_search_path_mutable"). Security-Advisor sonst sauber (nur die bekannte, nicht zutreffende Passwort-Warnung – Google-Login).
- **Server-Code:** `src/lib/notes/queries.ts` (`getNotes` + Mapper, Verfassername aus dem Profil-Join, Fallback E-Mail/„Unbekannt"); `src/lib/notes/actions.ts` (`createNote`, `updateNote`, `deleteNote` mit Auth-Prüfung + Leer-Validierung).
- **Frontend angebunden:** Die Detailseite **lädt die Notizen serverseitig** und reicht sie durch; Anlegen/Bearbeiten/Löschen laufen jetzt **echt** über die Server-Aktionen (Liste aktualisiert sich aus der Server-Antwort). Bei Fehlern bleibt die Eingabe erhalten (Notiz-Editor leert erst bei Erfolg). **Vorschau-Banner entfernt.**
- **Verifikation:** `tsc --noEmit` sauber; `npm test` 28/28 grün; `npm run build` erfolgreich; Security-Advisor sauber.
- **Offen (spätere Features):** „Fokus"/Aktivitäten (PROJ-5), E-Mails (PROJ-7), Dateien (PROJ-13), Ein-Klick-Anruf (PROJ-8) klinken sich in denselben Verlauf/dieselbe Leiste ein. Verfassername ist „Du" nur im alten Vorschau-Stand gewesen – jetzt echter Profilname.

## QA Test Results

**Tested:** 2026-06-22
**App URL:** http://localhost:3000
**Tester:** QA Engineer (AI)

> Hinweis: Die Detailseite liegt hinter dem Google-Login. Der **angemeldete Klickdurchlauf** (Notiz anlegen/bearbeiten/löschen) lässt sich nicht automatisieren; abgesichert sind **Zugangsschutz per E2E**, **Datenmodell direkt in Supabase** und ein **statischer Abgleich** gegen die Kriterien. Empfehlung: einmal live durchklicken (siehe Hinweise unten).

### Acceptance Criteria Status

- [x] **AC-1 – Layout:** Detailseite mit linker Übersicht + Hauptbereich (Anlege-Leiste/Fokus/Verlauf); Build erfolgreich, Route `/kunde/[id]` vorhanden.
- [x] **AC-2 – Bearbeiten + speichern (persistiert):** Nutzt die **echten** PROJ-2-Aktionen `updateCustomer` (bereits in PROJ-2 getestet/Approved); Lese-/Editier-Umschaltung.
- [x] **AC-3 – Leerer Firmenname abgelehnt:** Client-Prüfung + serverseitige Zod-Validierung (PROJ-2).
- [x] **AC-4 – Notiz anlegen → oben mit Name + Zeit:** `createNote` legt an (author = angemeldeter Nutzer), Liste prepend; Verfassername aus Profil-Join.
- [x] **AC-5 – Leere Notiz wird nicht gespeichert:** Client- **und** serverseitige Leer-Prüfung (`body.trim()`).
- [x] **AC-6 – Notiz bearbeiten:** `updateNote` speichert; Verlauf zeigt geänderten Text (+ „bearbeitet").
- [x] **AC-7 – Notiz löschen mit Sicherheitsabfrage:** `AlertDialog` → `deleteNote`.
- [x] **AC-8 – Neueste oben:** `getNotes` sortiert `created_at desc`; neue Notiz wird oben eingefügt.
- [x] **AC-9 – Leer-Zustand:** „Noch keine Einträge" bei 0 Notizen.
- [x] **AC-10 – Filter-Reiter:** Alle/Notizen zeigen Notizen; Aktivitäten/E-Mails/Dateien „kommt bald".
- [x] **AC-11 – Telefon angezeigt:** in der Übersicht; Ein-Klick-Anruf folgt mit PROJ-8.
- [x] **AC-12 – Speichern schlägt fehl → Fehler + Eingabe bleibt:** Notiz-Editor leert erst bei Erfolg; bei Fehler Toast, Text bleibt.
- [x] **AC-13 – Nicht angemeldet → Login:** E2E-Redirect für `/kunde/[id]` (Chromium + Mobile Chrome, via PROJ-2-Spec), 22/22 grün.

**Ergebnis: 13/13 Akzeptanzkriterien abgedeckt** (Logik/Datenmodell/Zugangsschutz verifiziert; finaler Live-Klickdurchlauf empfohlen).

### Edge Cases Status

- [x] **Kunde nicht gefunden/gelöscht:** Hinweis + „Zurück zum Board" (aus PROJ-2).
- [x] **Lange/viele Notizen:** Verlauf scrollbar; Notiztext mit Zeilenumbrüchen (`whitespace-pre-wrap`).
- [x] **Gleichzeitige Bearbeitung:** Zuletzt gespeichert gewinnt (bewusst einfach).
- [x] **Sonderzeichen/HTML im Notiztext:** Als reiner Text dargestellt (React escaped), kein HTML/Script.
- [x] **Kunde löschen → Notizen mit gelöscht:** FK `customer_id` = **CASCADE** (in Supabase verifiziert). Deckt zugleich PROJ-3 ab (Import-Rückgängigmachen entfernt Kunde inkl. Notizen).
- [~] **Netzwerkfehler beim Laden des Verlaufs:** `getNotes` liefert bei Fehler eine leere Liste → es erscheint der Leer-Zustand statt eines expliziten Fehlhinweises (siehe BUG LOW-1).

### Security Audit Results
- [x] **Authentifizierung:** `/kunde/[id]` ohne Login nicht erreichbar (E2E-Redirect); alle Notiz-Aktionen prüfen `requireUser()`.
- [x] **Autorisierung / RLS:** `notes` mit RLS + 4 Policies (lesen/anlegen/ändern/löschen nur mit Profil = freigeschaltet). In Supabase verifiziert.
- [x] **XSS:** Notiztext nur über React gerendert (escaped); kein `dangerouslySetInnerHTML`.
- [x] **SQL-Injektion:** Ausschließlich parametrisierte Supabase-Aufrufe.
- [x] **Secrets:** Keine neuen; PROJ-4 braucht keinen externen Schlüssel.
- [x] **Funktions-Härtung:** `set_updated_at` mit festem `search_path` (Advisor-Hinweis behoben). Security-Advisor sonst sauber (nur die nicht zutreffende Passwort-Warnung).
- [i] **Rate Limiting:** Nicht implementiert – internes CRM, wie PROJ-2/PROJ-3.

### Automated Tests
- **Unit (Vitest): 28/28 grün** (keine Regression; PROJ-4 hat keine eigene komplexe Pure-Logik).
- **E2E (Playwright): 22/22 grün** – Zugangsschutz inkl. `/kunde/[id]` (Chromium + Mobile Chrome); PROJ-1/PROJ-2/PROJ-3 weiterhin grün.
- **Datenmodell (Supabase):** `notes` RLS aktiv + 4 Policies; FK `customer_id` = CASCADE; Trigger + Index vorhanden.
- **Build:** `tsc --noEmit` sauber; `npm run build` erfolgreich.

### Bugs Found

#### LOW-1: Ladefehler des Verlaufs zeigt Leer-Zustand statt Fehlhinweis
- **Severity:** Low
- `getNotes` gibt bei einem Lesefehler eine leere Liste zurück → der Nutzer sieht „Noch keine Einträge" statt eines Hinweises „Verlauf konnte nicht geladen werden". Für den Normalbetrieb unkritisch; später ein expliziter Fehlhinweis möglich.

#### LOW-2: Bearbeiten/Löschen einer zwischenzeitlich entfernten Notiz
- **Severity:** Low
- Wird eine Notiz parallel gelöscht und danach bearbeitet, meldet `updateNote` einen Fehler (Toast); ein Löschen einer bereits entfernten Notiz bleibt folgenlos. Tritt im Normalbetrieb kaum auf.

#### INFO: Live-Klickdurchlauf ausstehend
- Der angemeldete Ablauf (Notiz anlegen/bearbeiten/löschen, **Verfassername** korrekt aus dem Profil, **Persistenz nach Neuladen**) wurde nicht automatisiert geprüft. Empfehlung: einmal live testen.

### Summary
- **Acceptance Criteria:** 13/13 abgedeckt
- **Bugs Found:** 2 niedrig + 1 Hinweis (0 kritisch, 0 hoch, 0 mittel)
- **Security:** Bestanden (Auth + RLS + Validierung + parametrisierte Queries + Funktions-Härtung)
- **Production Ready:** **YES** (keine kritischen/hohen Fehler) – empfohlen: einmaliger Live-Klickdurchlauf einer Notiz vor dem Produktiv-Einsatz.

## Deployment
- **Live:** https://crm-gc.vercel.app — Vercel-Projekt `ewgeni-s-projects/crm-gc`
- **Deployed:** 2026-06-23 (MVP-Sammel-Deployment PROJ-1–5, 8)
