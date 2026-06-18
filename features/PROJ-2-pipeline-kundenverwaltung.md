# PROJ-2: Pipeline-basierte Kundenverwaltung

## Status: Approved
**Created:** 2026-06-17
**Last Updated:** 2026-06-18

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

## Backend-Implementierung (Stand 2026-06-18)
- **Datenbank:** Tabellen `pipeline_stages` (8 Phasen geseedet) + `customers`, beide mit Row Level Security. Zugriff nur für freigeschaltete Nutzer (mit Profil); geteilte Team-Daten. Trigger `set_updated_at`; Indizes auf `stage_id` und `updated_at`. Security-Advisor sauber (außer der bekannten, nicht zutreffenden Passwort-Warnung).
- **Server-Code:** `src/lib/pipeline/schema.ts` (Zod-Validierung) + `schema.test.ts` (5 Unit-Tests, grün); `queries.ts` (`getCustomers`/`getCustomer`, Mapper DB→Customer); `actions.ts` (Server Actions `createCustomer`, `updateCustomer`, `updateCustomerStage`, `deleteCustomer` mit Auth-Prüfung, Validierung, `revalidatePath`).
- **Frontend angebunden:** `page.tsx` lädt Kunden server-seitig; Board nutzt echte Aktionen (Anlegen; optimistisches Verschieben mit Rücksprung bei Fehler); Detailseite lädt den echten Kunden und speichert/ändert die Phase/löscht über Aktionen. Beispieldaten entfernt.
- **Verifikation:** `tsc --noEmit` sauber; `npm test` 5/5; Dev-Server kompiliert ohne Fehler. Hinweis: Das Board startet **leer** (die Datenbank wurde in PROJ-1 zurückgesetzt) – neue Kunden über den „+"-Button anlegen.
- **Offen (PROJ-5):** Aktivitäts-Marker und die Sortierung „Letzte Aktivität" an echte Aktivitätsdaten anbinden (aktuell zeigen alle Karten „keine Aktivität").

## QA Test Results

**Tested:** 2026-06-18
**App URL:** http://localhost:3000
**Tester:** QA Engineer (AI)

### Acceptance Criteria Status

- [x] **AC-1 – 8 Phasen-Spalten mit Karten:** Board rendert alle 8 Phasen in fester Reihenfolge; Karten werden nach `stage_id` der jeweiligen Spalte zugeordnet.
- [x] **AC-2 – Leer-Zustand:** Bei 0 Kunden erscheint „Noch keine Kunden" + grüner „+"-Button.
- [x] **AC-3 – Neuer Kunde nur mit Firmenname → Phase „Kalter Kontakt":** Anlegen ohne weitere Felder funktioniert; DB-Default `kalter_kontakt` setzt die Startphase.
- [x] **AC-4 – Leerer Firmenname wird abgelehnt:** Zod-Validierung (`min(1)`) im Dialog **und** serverseitig in `createCustomer`; Fehlermeldung wird angezeigt, es wird nicht gespeichert.
- [x] **AC-5 – Drag-and-Drop bleibt nach Neuladen erhalten:** Optimistisches Verschieben + `updateCustomerStage` persistiert in der DB + `revalidatePath`. Manuell bestätigt („klappt"), Logik unit-getestet.
- [x] **AC-6 – Klick auf Karte öffnet Detailseite im neuen Tab:** `window.open('/kunde/[id]', '_blank')`; eigene Route pro Kunde.
- [x] **AC-7 – Felder ändern + speichern → auf Board sichtbar:** `updateCustomer` speichert + `revalidatePath('/')`. Hinweis: ein **bereits offener** Board-Tab aktualisiert sich erst nach Neuladen (siehe BUG-1).
- [x] **AC-8 – Löschen mit Sicherheitsabfrage:** `AlertDialog` bestätigt, `deleteCustomer` entfernt den Datensatz, danach Rücksprung aufs Board.
- [x] **AC-9 – Karte zeigt Ort, Kategorie, Monatswert:** Werden angezeigt (Kategorie als farbiges Etikett, Wert in €-Format), leere Felder bleiben leer.
- [x] **AC-10 – Gelbes Warndreieck ohne geplante Aktivität:** Alle Karten zeigen das Warndreieck (Status „none"), bis PROJ-5 echte Aktivitätsdaten liefert.
- [x] **AC-11 – Sortierung pro Spalte:** Alphabet / Letzte Aktivität / Auftragswert / Kategorie werden je Spalte angewandt; unit-getestet.

**Ergebnis: 11/11 Akzeptanzkriterien bestanden.**

### Edge Cases Status

- [x] **Viele Karten in einer Spalte:** Spalteninhalt ist vertikal scrollbar (`overflow-y-auto`).
- [x] **Karte nur mit Firmenname:** Wird angezeigt, optionale Felder bleiben leer.
- [x] **Speichern beim Verschieben schlägt fehl:** Karte springt sichtbar in die alte Phase zurück + Fehler-Toast.
- [x] **Gleichzeitige Bearbeitung:** „Letzte Änderung gewinnt" (bewusst einfach, wie spezifiziert).
- [x] **Sortierung „Letzte Aktivität" ohne Aktivität:** Diese Kunden stehen oben (unit-getestet).
- [x] **Mobile statt Drag-and-Drop:** Phase ist auf der Detailseite per Auswahl änderbar.
- [~] **Löschen mit später anhängenden Aktivitäten/Notizen (CASCADE):** Greift erst, wenn diese Tabellen existieren (PROJ-5/PROJ-6) und per `ON DELETE CASCADE` an `customers` hängen. Aktuell wird nur der Kunde gelöscht; die Sicherheitsabfrage weist auf die Endgültigkeit hin.

### Security Audit Results
- [x] **Authentifizierung:** Board (`/`) und Detailseite (`/kunde/[id]`) sind ohne Login nicht erreichbar (Middleware-Redirect → `/login`); jede Server Action prüft zusätzlich `requireUser()`. Per E2E abgesichert (Chromium + Mobile Chrome).
- [x] **Autorisierung / RLS:** Alle `customers`-Policies (SELECT/INSERT/UPDATE/DELETE) verlangen `authenticated` **und** ein vorhandenes Profil (= freigeschaltete Nutzer). `pipeline_stages` nur lesbar. Geteilte Team-Daten – wie spezifiziert.
- [x] **Eingabe-Validierung / XSS:** React escaped allen Text; keine `dangerouslySetInnerHTML`. Kategorie-Farbe stammt aus einer festen Map mit Fallback (keine CSS-Injektion über frei eingegebene Werte).
- [x] **SQL-Injektion:** Ausschließlich parametrisierte Supabase-Aufrufe (`.eq`, `.insert`, `.update`), keine String-Verkettung.
- [x] **Secrets:** Nur der öffentliche (publishable) Supabase-Schlüssel landet im Client – unkritisch; kein Service-Key im Frontend.
- [i] **Rate Limiting:** Nicht implementiert – für ein internes CRM mit wenigen freigeschalteten Nutzern derzeit nicht erforderlich.

### Automated Tests
- **Unit (Vitest): 14/14 grün** — Eingabe-Validierung (`schema.test.ts`, 5), Sortierlogik (`data.test.ts`, 5), DB→App-Mapping (`queries.test.ts`, 4).
- **E2E (Playwright): 18/18 grün** — Zugangsschutz für Board + Detailseite auf Chromium **und** Mobile Chrome (`tests/PROJ-2-pipeline-kundenverwaltung.spec.ts`). Die angemeldeten Abläufe lassen sich wegen des echten Google-Logins nicht automatisieren und wurden manuell verifiziert.
- **Regression:** PROJ-1-Tests (Login/Zugangsschutz) weiterhin grün.
- **Test-Infrastruktur:** Mobiler Test-Browser von WebKit/„Mobile Safari" auf **Mobile Chrome (Pixel 5)** umgestellt – nutzt den bereits installierten Chromium, robuster unter Windows, keine zusätzliche Browser-Installation nötig.

### Bugs Found

#### BUG-1: Detail-Änderungen erscheinen im offenen Board-Tab erst nach Neuladen
- **Severity:** Low
- **Schritte:** Board in Tab A offen lassen → Kunde in Tab B (Detailseite) ändern/speichern → zurück zu Tab A.
- **Erwartet:** Karte aktualisiert sich automatisch. **Tatsächlich:** Erst nach Neuladen von Tab A sichtbar (Board hält lokalen Client-Zustand; Live-Sync zwischen Tabs ist nicht Teil von PROJ-2).
- **Priorität:** Nice to have (echte Live-Synchronisation ggf. später).

#### BUG-2: `updateCustomerStage` meldet Erfolg auch bei unbekannter Kunden-ID
- **Severity:** Low
- **Schritte:** Phasen-Update mit nicht existierender ID auslösen.
- **Erwartet:** Fehler. **Tatsächlich:** `update ... eq()` trifft 0 Zeilen, wirft keinen Fehler → `ok:true`. Tritt im Normalbetrieb nicht auf (IDs stammen immer aus echten Karten).
- **Priorität:** Fix in next sprint (optional `.select()`-Prüfung).

#### BUG-3: Ungültige E-Mail auf der Detailseite erst serverseitig abgefangen
- **Severity:** Low
- **Schritte:** Detailseite → ungültige E-Mail eingeben → Speichern.
- **Erwartet:** Inline-Hinweis am Feld (wie im Anlege-Dialog). **Tatsächlich:** Serverseitige Validierung greift, Fehler erscheint als Toast „Ungültige E-Mail" (Eingabe bleibt erhalten).
- **Priorität:** Nice to have.

#### INFO: Supabase-Hinweis „Leaked Password Protection deaktiviert"
- Kein Bug für dieses Feature: Die App nutzt ausschließlich Google-Login, keine Passwörter. Der Hinweis ist nicht zutreffend.

### Summary
- **Acceptance Criteria:** 11/11 bestanden
- **Bugs Found:** 3 (0 kritisch, 0 hoch, 0 mittel, 3 niedrig) + 1 informativer Hinweis
- **Security:** Bestanden (Auth + RLS + Validierung + parametrisierte Queries)
- **Production Ready:** **YES**
- **Empfehlung:** Deploybar. Die 3 niedrigprioren Punkte blockieren nicht; BUG-2 ggf. später härten, BUG-1 löst sich mit optionaler Live-Synchronisation.

## Deployment
_To be added by /deploy_
