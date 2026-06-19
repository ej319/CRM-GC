# PROJ-3: Excel-/CSV-Import mit Spaltenzuordnung

## Status: Planned
**Created:** 2026-06-19
**Last Updated:** 2026-06-19

## Dependencies
- Requires: PROJ-1 (Supabase Infrastruktur & Auth) — Login + Datenbank, freigeschaltete Nutzer
- Requires: PROJ-2 (Pipeline-basierte Kundenverwaltung) — `customers`-Tabelle, 8 Phasen, Validierungsregeln (Karte = Kunde)

## User Stories
- Als Vertriebsnutzer möchte ich eine Excel- oder CSV-Datei (z.B. meinen Pipedrive-Export) hochladen, damit ich meinen bestehenden Kundenbestand übernehmen kann, ohne alles von Hand einzutippen.
- Als Vertriebsnutzer möchte ich meine Datei-Spalten den CRM-Feldern zuordnen, damit die richtigen Daten in den richtigen Feldern landen.
- Als Vertriebsnutzer möchte ich für jeden unterschiedlichen Kategorie-/Quelle-Wert einen Vorschlag bekommen, den ich bestätigen oder ändern kann, damit ich nicht jeden Kunden einzeln einsortieren muss.
- Als Vertriebsnutzer möchte ich vor dem endgültigen Speichern eine Vorschau mit Zusammenfassung sehen, damit ich kontrollieren kann, was importiert, übersprungen oder leer gelassen wird.
- Als Vertriebsnutzer möchte ich, dass bereits vorhandene Firmen automatisch übersprungen werden, damit keine doppelten Einträge (Dubletten) entstehen.
- Als Vertriebsnutzer möchte ich einen Import jederzeit wieder rückgängig machen können, damit ich einen fehlerhaften Import sauber zurücknehmen kann.

## Out of Scope
- **Vorhandene Kunden überschreiben/aktualisieren** — Dubletten werden ausschließlich übersprungen, nicht aktualisiert (siehe Produktentscheidung).
- **Vollautomatische KI-Einsortierung** der Kategorien ohne Bestätigung — der Import liefert nur einen Vorschlag pro Wert; eine vollautomatische Variante ist eine spätere Ausbaustufe.
- **Import von Verlauf** (Notizen, Aktivitäten, E-Mails) — nur Kunden-Stammdaten. Verlauf folgt mit PROJ-4 / PROJ-5 / PROJ-6 / PROJ-7.
- **Phasen-Auswahl bzw. Phasen pro Zeile** — alle Importe landen immer in „Kalter Kontakt" (bewusst vereinfacht). Verschieben danach im Board (PROJ-2).
- **Mehrere Aufträge/Deals als eigene Karten** — PROJ-2 gilt: Karte = Kunde. Eine Zeile = ein Kunde.
- **Pipedrive-API / automatische oder wiederkehrende Importe** — nur manueller Datei-Upload.
- **Speichern/Wiederverwenden von Zuordnungs-Vorlagen (Mapping-Templates)** — mögliche spätere Erweiterung; Migration ist meist einmalig.
- **Eigene Verwaltungs-Oberfläche für die Kategorie-/Quellen-Listen** — wie schon in PROJ-2 für später vorgesehen; neue Werte können beim Import zwar entstehen, eine Pflege-Oberfläche kommt später.

## Acceptance Criteria

**Format:** Angenommen [Vorbedingung] / Wenn [Aktion] / Dann [Ergebnis]

- [ ] Angenommen ich bin angemeldet, wenn ich die Import-Seite öffne, dann kann ich eine Excel- (.xlsx) oder CSV-Datei auswählen und hochladen.
- [ ] Angenommen ich habe eine Datei hochgeladen, wenn die erste Zeile Spaltenüberschriften enthält, dann werden die Spalten erkannt und – wo die Namen erkennbar passen – den CRM-Feldern automatisch vorgeschlagen.
- [ ] Angenommen die Datei ist hochgeladen, wenn ich die Spaltenzuordnung sehe, dann kann ich jeder Datei-Spalte ein CRM-Feld zuordnen oder sie auf „nicht importieren" setzen.
- [ ] Angenommen ich ordne die Spalten zu, wenn ich keine Spalte dem Pflichtfeld Firmenname zuordne, dann kann ich nicht fortfahren und werde darauf hingewiesen.
- [ ] Angenommen ich habe eine Spalte als Kategorie (bzw. Quelle) zugeordnet, wenn ich zum nächsten Schritt gehe, dann sehe ich für jeden unterschiedlichen Wert einen Vorschlag zur CRM-Kategorie, den ich bestätigen, ändern oder als neuen Wert übernehmen kann.
- [ ] Angenommen die Zuordnung steht, wenn ich zur Vorschau gehe, dann sehe ich eine Zusammenfassung: Anzahl zu importieren, Anzahl Dubletten (übersprungen), Anzahl mit leer gelassenen Feldern (Warnungen).
- [ ] Angenommen die Vorschau wird angezeigt, wenn ich nicht aktiv auf „Importieren" klicke, dann wird nichts gespeichert.
- [ ] Angenommen ich klicke auf „Importieren", wenn der Import läuft, dann sehe ich einen Fortschritt und am Ende eine Ergebnis-Meldung (importiert / übersprungen / Warnungen).
- [ ] Angenommen ein Firmenname aus der Datei existiert bereits im CRM (Groß-/Kleinschreibung egal), wenn ich importiere, dann wird diese Zeile übersprungen und in der Zusammenfassung als Dublette gezählt.
- [ ] Angenommen derselbe Firmenname kommt in der Datei mehrfach vor, wenn ich importiere, dann wird nur der erste angelegt und die weiteren als Dublette übersprungen.
- [ ] Angenommen eine Zeile hat keinen Firmennamen, wenn ich importiere, dann wird sie übersprungen und als fehlerhaft gemeldet.
- [ ] Angenommen eine Zeile hat einen Firmennamen, aber ein ungültiges Feld (z.B. unsinnige E-Mail oder Monatswert ist keine Zahl), wenn ich importiere, dann wird der Kunde angelegt, das betroffene Feld bleibt leer und es wird als Warnung gezählt.
- [ ] Angenommen der Import ist abgeschlossen, wenn ich danach das Board öffne, dann erscheinen alle importierten Kunden in der Phase „Kalter Kontakt".
- [ ] Angenommen ich lade eine Datei hoch, die keine Tabelle / kein passendes Format ist oder keine Datenzeilen enthält, wenn ich sie auswähle, dann erscheint eine verständliche Fehlermeldung und es wird nichts importiert.
- [ ] Angenommen ich habe einen Import durchgeführt, wenn ich ihn im Import-Verlauf auf „Rückgängig machen" klicke und die Sicherheitsabfrage bestätige, dann werden genau die in diesem Import angelegten Kunden wieder entfernt.
- [ ] Angenommen ich klicke „Rückgängig machen", wenn die Sicherheitsabfrage erscheint, dann wird ohne Bestätigung nichts entfernt.
- [ ] Angenommen einzelne importierte Kunden wurden zwischenzeitlich bereits manuell gelöscht, wenn ich den Import rückgängig mache, dann werden die übrigen entfernt und es entsteht kein Fehler.

## Edge Cases
- Was passiert bei einer Datei mit über 2.000 Zeilen? → Sie wird in Blöcken verarbeitet, mit Fortschrittsanzeige; der Browser bleibt bedienbar.
- Was passiert, wenn der Import mittendrin abbricht (Netzwerk/Fehler)? → Bereits importierte Kunden bleiben gespeichert; ein erneuter Import überspringt diese als Dublette (kein Datenchaos).
- Was passiert mit deutschen Zahlenformaten beim Monatswert (z.B. „1.200,00 €" oder „1234")? → Es wird versucht, gängige Formate zu erkennen; gelingt das nicht, bleibt das Feld leer (Warnung).
- Was passiert mit Umlauten in CSV-Dateien (UTF-8 vs. Windows-Format)? → Umlaute müssen korrekt erhalten bleiben.
- Was passiert bei sehr vielen unterschiedlichen Kategorie-Werten? → Der Zuordnungs-Schritt bleibt pro Wert (nicht pro Kunde); optional „alle unbekannten als neuen Wert übernehmen".
- Was passiert, wenn ich einen Import rückgängig mache, dessen Kunden ich danach bearbeitet/verschoben habe? → Sie werden trotzdem entfernt (Herkunft = dieser Import); die Sicherheitsabfrage weist darauf hin.
- Was passiert beim Rückgängigmachen eines bereits rückgängig gemachten Imports? → Der Eintrag ist als „rückgängig gemacht" markiert und nicht erneut ausführbar.
- Was passiert mit Daten, die später an importierte Kunden hängen (Notizen/Aktivitäten, PROJ-4 ff.)? → Beim Rückgängigmachen würden diese mitentfernt (CASCADE); die Abfrage warnt davor (heute noch keine solchen Daten vorhanden – siehe Offene Fragen).

## Technical Requirements (optional)
- Security: Zugriff nur für angemeldete, freigeschaltete Nutzer (PROJ-1). Importierte Kunden landen in der geteilten Team-Pipeline (PROJ-2). Row Level Security gilt für alle betroffenen Tabellen.
- Stabilität/Performance: muss 2.000+ Zeilen zuverlässig verarbeiten (Blockverarbeitung, Fortschrittsanzeige, keine Server-Timeouts, kein Einfrieren des Browsers).
- Validierung wie beim manuellen Anlegen (PROJ-2): Firmenname Pflicht, E-Mail-Format, Monatswert ≥ 0.
- Datensparsamkeit: die hochgeladene Datei wird nur zur Verarbeitung verwendet und nicht dauerhaft gespeichert. Zeichensatz UTF-8 / Umlaute korrekt.
- Import-Vorgänge werden festgehalten (Datum, Dateiname, Trefferzahlen) und es wird gespeichert, welche Kunden zu welchem Import gehören – Grundlage für Import-Verlauf und „Rückgängig machen".

## Open Questions
- [x] „Rückgängig machen" gilt für jeden vergangenen Import (über den Import-Verlauf) — geklärt in `/architecture`.
- [x] Vorschlags-Mechanismus für die Kategorie-/Quelle-Zuordnung: KI-Vorschlag (Claude/Haiku), nur für den Vorschlag — geklärt in `/architecture`.
- [x] Zuordnungs-Vorlagen (Mapping) speichern: für MVP bewusst nicht (Migration meist einmalig).
- [ ] Wenn an importierten Kunden später Verlauf hängt (Notizen/Aktivitäten/E-Mails, PROJ-4 ff.): Rückgängigmachen trotzdem erlauben (mit Warnung) oder dann blockieren? → spätestens beim Bau dieser Features klären.

## Decision Log

### Product Decisions
<!-- Added by /write-spec -->
| Decision | Rationale | Date |
|----------|-----------|------|
| Excel (.xlsx) UND CSV werden unterstützt; generischer Import (nicht nur Pipedrive) | Nutzer importiert aus Pipedrive und ggf. eigenen Tabellen; Flexibilität ohne fest verdrahtete Vorlage | 2026-06-19 |
| Alle importierten Kunden landen immer in „Kalter Kontakt" (kein Phasen-Auswahlschritt) | Einfachster Ablauf; Verschieben danach im Board; entspricht dem DB-Standard für neue Kunden | 2026-06-19 |
| Dubletten sind nicht erlaubt: gleicher Firmenname (case-insensitive) wird übersprungen – sowohl gegen vorhandene Kunden als auch innerhalb der Datei | Verhindert doppelte Einträge und schützt vor versehentlichem Doppel-Import; kein Überschreiben bestehender Daten | 2026-06-19 |
| Jeder Import ist rückgängig machbar (Import-Verlauf; „Rückgängig machen" entfernt die in diesem Import angelegten Kunden) | Sicheres Zurücknehmen eines fehlerhaften Imports | 2026-06-19 |
| Vorschau + Zusammenfassung vor dem Speichern, expliziter „Importieren"-Klick | Kontrolle, bevor in die geteilten Team-Daten geschrieben wird | 2026-06-19 |
| Kleinere Feldfehler → Kunde wird angelegt, betroffenes Feld bleibt leer (Warnung) statt die Zeile zu verwerfen | Möglichst wenig Datenverlust | 2026-06-19 |
| Kategorie/Quelle: pro unterschiedlichem Wert ein Vorschlag, Nutzer bestätigt/ändert/übernimmt als neuen Wert | Reale Werte passen selten exakt zur festen Liste; Aufwand pro Wert (nicht pro Kunde) bleibt klein | 2026-06-19 |
| Eigene Import-Seite mit Schritt-für-Schritt-Assistent (über Menü erreichbar) | Klar getrennt vom Board; geführter Ablauf für Nicht-Techniker | 2026-06-19 |
| Ausgelegt für 2.000+ Zeilen, Verarbeitung in Blöcken mit Fortschritt | Nutzerbestand ist groß; Stabilität ist wichtig | 2026-06-19 |

### Technical Decisions
<!-- Added by /architecture -->
| Decision | Rationale | Date |
|----------|-----------|------|
| Datei wird im Browser gelesen und blockweise an den Server gesendet | Kein großer Upload, keine Server-Timeouts, flüssiger Fortschritt bei 2.000+ Zeilen | 2026-06-19 |
| Eine Bibliothek (`xlsx` / SheetJS) für Excel UND CSV | Ein Werkzeug für beide Formate; weniger Abhängigkeiten | 2026-06-19 |
| Import-Vorgänge als eigene Tabelle + Herkunfts-Verweis am Kunden | Einfache, zuverlässige Grundlage für Import-Verlauf und „Rückgängig machen" (löscht genau die Kunden des Imports, später per CASCADE inkl. Verlauf) | 2026-06-19 |
| „Rückgängig machen" gilt für jeden vergangenen Import (über den Verlauf), nicht nur den letzten | Nutzerwunsch „immer rückgängig machen" | 2026-06-19 |
| Kategorie-/Quelle-Vorschlag per Claude (Haiku), serverseitig, nur pro unterschiedlichem Wert | Versteht die Bedeutung (z.B. „Marketingagentur → Büro"); minimale Kosten; Schlüssel bleibt geheim; Nutzer bestätigt | 2026-06-19 |
| Import funktioniert auch ohne KI-Schlüssel (Vorschlag entfällt dann) | Import bleibt nutzbar, auch wenn (noch) kein API-Schlüssel hinterlegt ist | 2026-06-19 |
| Umsetzung über Next Server Actions + Wiederverwendung der PROJ-2-Validierung (zod) | Konsistent mit bestehendem Code; gleiche Regeln wie beim manuellen Anlegen | 2026-06-19 |
| Dubletten-Prüfung in der Import-Logik (kein harter DB-Zwang auf den Namen) | Verhindert Dubletten beim Import, ohne das manuelle Anlegen aus PROJ-2 einzuschränken | 2026-06-19 |

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)

### Bausteine der Oberfläche
```
Eigene Import-Seite „/import"  (im Grund-Gerüst mit oberer Leiste + Nutzer-Menü)
├── Erreichbar über das Nutzer-Menü oben rechts: „Daten importieren"
│
├── Import-Assistent (führt Schritt für Schritt)
│   ├── Schritt 1 – Datei wählen      (Excel .xlsx oder CSV hochladen / per Drag-and-Drop)
│   ├── Schritt 2 – Spalten zuordnen   (Tabelle: jede Datei-Spalte → CRM-Feld; Vorschlag automatisch; Firmenname Pflicht)
│   ├── Schritt 3 – Werte zuordnen     (Kategorie & Quelle: jeder unterschiedliche Wert mit KI-Vorschlag, änderbar / „als neu übernehmen")
│   ├── Schritt 4 – Vorschau & Prüfung (erste Zeilen + Zusammenfassung: importieren / Dubletten / Warnungen → Button „Importieren")
│   ├── Schritt 5 – Import läuft        (Fortschrittsbalken, blockweise)
│   └── Schritt 6 – Ergebnis            (importiert / übersprungen / Warnungen + Link „Zum Board")
│
└── Import-Verlauf (Liste vergangener Importe)
    └── je Eintrag: Datum · Dateiname · Zahlen · Button „Rückgängig machen" (mit Sicherheitsabfrage)
```

### Datenmodell (in Klartext)
Neu hinzu kommen:
- **Import-Vorgang** (= ein Eintrag im „Import-Verlauf"): Zeitpunkt, wer importiert hat, Dateiname, Anzahl importiert, Anzahl übersprungen (Dubletten), Anzahl Warnungen, Status (abgeschlossen / rückgängig gemacht).
- **Kunde – Herkunft:** jeder Kunde bekommt einen Vermerk, aus welchem Import-Vorgang er stammt (leer bei von Hand angelegten Kunden). Das ist die Grundlage fürs „Rückgängig machen".

Die eigentlichen Kundenfelder bleiben unverändert (PROJ-2): Firmenname, Ansprechpartner, Telefon, E-Mail, Adresse/PLZ/Ort, Kategorie, Quelle, Monatswert, Phase.

Speicherort: Supabase (PostgreSQL), geteilte Team-Daten, geschützt durch Row Level Security.

### So läuft der Import technisch ab (in Worten)
1. Die Datei wird **direkt im Browser gelesen** (nicht hochgeladen/dauerhaft gespeichert). Eine bewährte Tabellen-Bibliothek liest Excel und CSV.
2. Spalten- und Werte-Zuordnung passieren im Browser.
3. Beim Klick auf „Importieren" werden die geprüften Zeilen **in Blöcken** (z.B. einige Hundert auf einmal) an den Server geschickt und gespeichert. Nach jedem Block wächst der Fortschrittsbalken. So bleibt alles auch bei 2.000+ Zeilen flüssig und es gibt keine Zeit-Überschreitungen.
4. Pro Zeile prüft der Server: Firmenname vorhanden? Schon im Bestand oder schon in diesem Import? Felder gültig? → anlegen, überspringen oder Feld leeren (Warnung), wie in der Spec festgelegt.

### Der KI-Vorschlag (Kategorie/Quelle)
- Läuft **auf dem Server** (der KI-Schlüssel bleibt geheim, nie im Browser).
- Wird nur **einmal pro unterschiedlichem Wert** aufgerufen (eine Handvoll Mal pro Import) → sehr geringe Kosten.
- Verwendet ein schnelles, günstiges Claude-Modell (Haiku) und liefert je Wert den am besten passenden CRM-Kategorie-Vorschlag. Du bestätigst/änderst — die KI entscheidet nie endgültig.
- **Ohne hinterlegten Schlüssel funktioniert der Import trotzdem** — dann entfällt nur der Vorschlag und du ordnest die Werte selbst zu.

### Rückgängig machen
- Weil jeder importierte Kunde seinen Import-Vorgang „kennt", entfernt „Rückgängig machen" genau die Kunden dieses Imports — nach einer Sicherheitsabfrage. Der Vorgang wird danach als „rückgängig gemacht" markiert.
- Schon vorher von Hand gelöschte Kunden werden einfach übersprungen (kein Fehler).
- Sobald später Verlauf an Kunden hängt (Notizen/Aktivitäten, PROJ-4 ff.), würde dieser beim Rückgängigmachen mitentfernt — die Abfrage warnt davor (heute noch nicht relevant).

### Tech-Entscheidungen (warum)
- **Datei im Browser lesen, in Blöcken speichern:** keine großen Uploads, kein Server-Timeout, flüssiger Fortschritt auch bei großen Listen.
- **Eine Bibliothek für Excel + CSV:** ein Werkzeug für beide Formate, weniger Komplexität.
- **Herkunfts-Vermerk am Kunden:** einfachste, zuverlässige Grundlage fürs Rückgängigmachen.
- **KI nur für den Vorschlag, nur pro unterschiedlichem Wert:** liefert die gewünschte „Erkennung", bleibt aber billig und du behältst die Kontrolle.
- **Server-Aktionen statt eigener API-Routen:** genau wie in PROJ-2 — passt zum bestehenden Projekt; Wiederverwendung der PROJ-2-Validierung.
- **shadcn/ui-Bausteine** (Tabelle, Auswahllisten, Fortschrittsbalken, Dialog): bereits vorhanden, kein Eigenbau.

### Abhängigkeiten (zu installieren)
- `xlsx` (SheetJS) – liest Excel- (.xlsx) und CSV-Dateien im Browser.
- `@anthropic-ai/sdk` – Claude-Anbindung für den Kategorie-/Quelle-Vorschlag (nur serverseitig).
- (Fortschrittsbalken, Tabelle, Auswahllisten, Dialog sind als shadcn/ui-Komponenten schon installiert.)

### Einmalige Einrichtung durch den Nutzer
- Für den KI-Vorschlag wird ein **Anthropic-API-Schlüssel** gebraucht. Er wird einmalig in `.env.local` als `ANTHROPIC_API_KEY` hinterlegt (der Agent kann diese Datei aus Sicherheitsgründen nicht selbst beschreiben — der Nutzer legt sie an). Ohne Schlüssel bleibt der Import voll nutzbar, nur ohne KI-Vorschlag.

## Frontend-Implementierung (Stand 2026-06-19)
- **Neue Import-Seite `/import`** (erreichbar über das Nutzer-Menü „Daten importieren") mit Schritt-für-Schritt-Assistent: Datei → Spalten → Werte → Vorschau → Import; Fortschrittsanzeige + Ergebnis.
- **Datei lesen im Browser** über `xlsx` (SheetJS): Excel **und** CSV; erste nicht-leere Zeile = Überschriften.
- **Spalten-Auto-Zuordnung** per Stichwort-Erkennung (deutsche + Pipedrive-Namen); „Firmenname" ist Pflicht (sonst ist „Weiter" gesperrt).
- **Werte-Zuordnung** für Kategorie/Quelle pro unterschiedlichem Wert; Vorschlag vorausgewählt (lokal: `localGuessCategory`), „Wert übernehmen" oder „Leer lassen" wählbar.
- **Vorschau** mit Zusammenfassung (importieren / Dubletten / ohne Name / Warnungen) + Tabelle der ersten 15 Zeilen; alle Importe → „Kalter Kontakt".
- **Validierung/Toleranz** wie spezifiziert: ohne Firmenname → übersprungen; ungültige E-Mail / Monatswert → Feld leer + Warnung; deutsche Zahlenformate erkannt; Dubletten innerhalb der Datei erkannt.
- **Import-Verlauf** mit „Rückgängig machen" (Sicherheitsabfrage) als Oberfläche vorhanden.
- **Neue Dateien:** `src/lib/import/{parse,mapping}.ts` (+ `mapping.test.ts`, 12 Tests); `src/components/import/{import-wizard,step-file,step-columns,step-values,step-preview,step-run,import-history}.tsx`; `src/app/import/page.tsx`. Geändert: `src/components/user-menu.tsx` (Menüpunkt).
- **Verifikation:** `tsc --noEmit` ohne Fehler; `npm test` 26/26 grün; `npm run build` erfolgreich (Route `/import` als dynamisch gelistet).
- **Vorschau-Hinweis:** Das eigentliche Speichern läuft aktuell im **Vorschau-Modus** (simulierter Fortschritt) – es wird noch nichts in der Datenbank gespeichert. Der KI-Vorschlag ist bisher der lokale Fallback.
- **Offen für `/backend`:** Tabelle `import_runs` + Herkunfts-Spalte an `customers`; Server-Aktion zum **blockweisen Speichern** (inkl. Dubletten-Prüfung gegen den Bestand); **KI-Vorschlag** (Claude/Haiku) als Server-Aktion mit `ANTHROPIC_API_KEY` (Fallback: lokaler Vorschlag); Import-Verlauf + **Rückgängig machen** an echte Daten anbinden; Vorschau-Modus-Hinweis entfernen. **Sicherheitshinweis:** `xlsx@0.18.5` (npm) hat bekannte Advisories beim Parsen *bösartig präparierter* Dateien – für eigene Exporte unkritisch; optional später auf den SheetJS-CDN-Build wechseln.

## Backend-Implementierung (Stand 2026-06-19)
- **Datenbank:** Neue Tabelle `import_runs` (Dateiname, Zahlen, Status `completed`/`undone`, `created_by`, `created_at`) mit Row Level Security (lesen/anlegen/ändern nur für freigeschaltete Nutzer mit Profil – gleiches Muster wie `customers`). Neue Spalte `customers.import_run_id` (Herkunft, `ON DELETE SET NULL`) + Indizes auf `import_run_id` und `created_at`. Security-Advisor sauber (nur die bekannte, nicht zutreffende Passwort-Warnung – die App nutzt Google-Login).
- **Server-Aktionen** (`src/lib/import/actions.ts`): `createImportRun` (legt Vorgang an), `importCustomersBatch` (validiert je Zeile mit der PROJ-2-Zod-Prüfung, **Dubletten gegen den Bestand** per kleingeschriebenem Firmennamen übersprungen, Block-Insert mit `import_run_id` + Phase „Kalter Kontakt"), `finalizeImportRun` (schreibt End-Zahlen + `revalidatePath`), `undoImport` (löscht genau die Kunden des Vorgangs, markiert ihn als „rückgängig gemacht"), `suggestValueMappings` (KI-Vorschlag).
- **KI-Vorschlag:** Claude **`claude-haiku-4-5`** über `@anthropic-ai/sdk`, **serverseitig**, ein Aufruf pro unterschiedlichem Wert-Set (Kategorie/Quelle). Antwort wird streng gegen die erlaubten Optionen geprüft (`parseSuggestionMap`). **Ohne `ANTHROPIC_API_KEY` oder bei Fehlern** liefert die Aktion ein leeres Ergebnis → das Frontend nutzt automatisch den lokalen Vorschlag (`localGuessCategory`). Der Schlüssel bleibt ausschließlich serverseitig.
- **Frontend angebunden:** Der Assistent speichert jetzt **echt** und **blockweise** (300 Zeilen/Block) mit Fortschritt; der Werte-Schritt lädt erst den KI-Vorschlag (mit Fallback). Der **Import-Verlauf** lädt echte Vorgänge (`getImportRuns`); „Rückgängig machen" ruft `undoImport` auf und aktualisiert die Ansicht. „Vorschau-Modus"-Hinweis entfernt.
- **Geänderte/neue Dateien:** `src/lib/import/actions.ts` (neu), `src/lib/pipeline/queries.ts` (`getImportRuns`), `src/lib/import/mapping.ts` (`parseSuggestionMap`, `ImportRun`-Typ, +2 Tests), `src/components/import/{import-wizard,step-run,import-history}.tsx`, `src/app/import/page.tsx`.
- **Verifikation:** `tsc --noEmit` sauber; `npm test` **28/28** grün; `npm run build` erfolgreich.
- **Einmalige Einrichtung durch den Nutzer (für den KI-Vorschlag):** In `.env.local` die Zeile `ANTHROPIC_API_KEY=…` ergänzen (der Agent darf diese Datei nicht beschreiben). Ohne Schlüssel funktioniert der Import voll, nur mit einfachem statt KI-Vorschlag.
- **Sicherheitshinweis (offen):** `xlsx@0.18.5` (npm) hat bekannte Advisories beim Parsen *bösartig präparierter* Dateien – für eigene Exporte unkritisch; optional später auf den SheetJS-CDN-Build wechseln (erfordert Freigabe des CDN-Installationsbefehls).

## QA Test Results

**Tested:** 2026-06-19
**App URL:** http://localhost:3000
**Tester:** QA Engineer (AI)

> Hinweis: Die Import-Seite liegt vollständig hinter dem Google-Login. Ein echter Google-Login lässt sich nicht automatisiert durchführen; daher sind die **Zugangsschutz-Pfade per E2E** abgesichert, die **Logik per Unit-Tests**, das **Datenmodell direkt in Supabase** geprüft. Der **angemeldete Klickdurchlauf mit echter Datei** wird dem Nutzer als finale Abnahme empfohlen.

### Acceptance Criteria Status

- [x] **AC-1 – Excel/CSV hochladen:** `StepFile` akzeptiert `.xlsx/.csv`; `parseSpreadsheet` (xlsx) liest beide Formate, erste nicht-leere Zeile = Überschriften.
- [x] **AC-2 – Spalten-Auto-Vorschlag:** `autoSuggestMapping` ordnet deutsche + Pipedrive-Spalten zu (unit-getestet, 3 Tests).
- [x] **AC-3 – Spalten manuell zuordnen / „nicht importieren":** `StepColumns` mit Auswahl je Spalte inkl. „— nicht importieren —".
- [x] **AC-4 – Ohne Firmenname kein Weiter:** „Weiter" ist gesperrt + Hinweis, solange keine Spalte = Firmenname (`nameMapped`).
- [x] **AC-5 – Kategorie/Quelle-Vorschlag pro Wert:** `StepValues` + KI-Vorschlag (`suggestValueMappings`/`parseSuggestionMap`, unit-getestet) mit lokalem Fallback; „übernehmen"/„leer lassen" wählbar.
- [x] **AC-6 – Vorschau + Zusammenfassung:** `StepPreview` zeigt Zähler (importieren/Dubletten/ohne Name/Warnungen, aus `prepareRows`, unit-getestet) + erste 15 Zeilen.
- [x] **AC-7 – Nichts gespeichert ohne „Importieren":** Speicher-Aktionen laufen ausschließlich in `startImport` (Button-Klick).
- [x] **AC-8 – Fortschritt + Ergebnis:** Blockweiser Import (300/Block) setzt den Fortschrittsbalken; `StepRun` zeigt das Ergebnis.
- [x] **AC-9 – Vorhandene Firma übersprungen + gezählt:** `importCustomersBatch` prüft kleingeschriebene Firmennamen gegen den Bestand; übersprungene zählen in „skipped".
- [x] **AC-10 – Doppelter Name in der Datei → nur einmal:** `prepareRows` markiert Folgetreffer als `dupe-file` (unit-getestet).
- [x] **AC-11 – Ohne Firmenname → übersprungen + gemeldet:** `prepareRows` Status `error` (unit-getestet).
- [x] **AC-12 – Kleiner Feldfehler → Kunde angelegt, Feld leer + Warnung:** `prepareRows` (ungültige E-Mail / Zahl) unit-getestet.
- [x] **AC-13 – Nach Import in „Kalter Kontakt":** Insert setzt `stage_id = 'kalter_kontakt'`.
- [x] **AC-14 – Falsche/leere Datei → verständliche Fehlermeldung:** `parseSpreadsheet` wirft deutsche Meldungen (keine Tabelle / keine Daten / nur Überschriften); `StepFile` zeigt sie an.
- [x] **AC-15 – Import rückgängig:** `undoImport` löscht genau `customers` mit `import_run_id = runId` und markiert den Vorgang als „undone" (Datenmodell in der DB verifiziert).
- [x] **AC-16 – Rückgängig nur nach Bestätigung:** `AlertDialog`-Sicherheitsabfrage vor `undoImport`.
- [x] **AC-17 – Rückgängig robust bei bereits gelöschten:** `delete().eq()` entfernt die übrigen, ohne Fehler.

**Ergebnis: 17/17 Akzeptanzkriterien abgedeckt** (Logik + Zugangsschutz automatisiert; finaler Live-Klickdurchlauf empfohlen).

### Edge Cases Status

- [x] **>2.000 Zeilen:** Blockweise (300/Block) mit Fortschritt; Logik vorhanden (nicht mit Riesendatei live lastgetestet).
- [x] **Import bricht mittendrin ab:** Bereits gespeicherte bleiben; `finalizeImportRun` schreibt die Teil-Zahlen; ein erneuter Import überspringt sie als Dublette.
- [x] **Deutsche Zahlenformate (1.200,00 €):** `parseGermanNumber` unit-getestet.
- [~] **Umlaute in CSV (UTF-8):** xlsx liest UTF-8; nicht gesondert unit-getestet → beim Live-Klickdurchlauf mitprüfen.
- [x] **Viele unterschiedliche Kategorie-Werte:** Zuordnung bleibt pro Wert (nicht pro Kunde).
- [x] **Rückgängig nach Bearbeiten/Verschieben:** Löschung nach Herkunft (`import_run_id`); Abfrage warnt darauf hin.
- [x] **Bereits rückgängig gemachter Import:** Button entfällt bei Status „undone".
- [x] **Spätere Verlauf-Daten (PROJ-4 ff.):** `customers.import_run_id` ist `ON DELETE SET NULL` (in der DB verifiziert); künftiger Verlauf hängt an `customers` und würde mit dem Kunden mitgelöscht.

### Security Audit Results

- [x] **Authentifizierung:** `/import` ohne Login nicht erreichbar (E2E-Redirect → `/login`, Chromium + Mobile Chrome); alle Server-Aktionen prüfen zusätzlich `requireUser()`.
- [x] **Autorisierung / RLS:** `import_runs` mit RLS + 3 Policies (lesen/anlegen/ändern nur mit Profil = freigeschaltet); `customers`-Policies aus PROJ-2 gelten weiter. In Supabase verifiziert (RLS aktiv, Policies vorhanden).
- [x] **Eingabe-Validierung / XSS:** Serverseitige Zod-Prüfung je Zeile; Anzeige ausschließlich über React (escaped), kein `dangerouslySetInnerHTML`.
- [x] **SQL-Injektion:** Nur parametrisierte Supabase-Aufrufe (`.insert`, `.delete`, `.eq`, `.select`).
- [x] **Secrets:** `ANTHROPIC_API_KEY` wird **ausschließlich serverseitig** genutzt (in `actions.ts`), nie an den Browser gegeben.
- [i] **Externer Datenabfluss (KI):** Beim KI-Vorschlag werden **nur die unterschiedlichen Kategorie-/Quelle-Werte** (z.B. „Marketingagentur") an Anthropic gesendet – keine Firmennamen, Kontakte oder sonstigen Kundendaten. Nur aktiv, wenn ein API-Schlüssel hinterlegt ist (vom Nutzer gewählt).
- [i] **Rate Limiting:** Nicht implementiert – für ein internes CRM mit wenigen Nutzern derzeit nicht erforderlich (wie PROJ-2).

### Automated Tests

- **Unit (Vitest): 28/28 grün** – inkl. Import-Logik (`src/lib/import/mapping.test.ts`, 12): Auto-Mapping, Zahl-Erkennung, lokaler Vorschlag, Dubletten-/Fehler-/Warnungs-Erkennung, KI-Antwort-Auswertung.
- **E2E (Playwright): 22/22 grün** – Zugangsschutz für `/import` auf Chromium + Mobile Chrome (`tests/PROJ-3-excel-import.spec.ts`); PROJ-1- und PROJ-2-Tests weiterhin grün (keine Regression).
- **Datenmodell (Supabase):** `import_runs` RLS aktiv + 3 Policies; `customers.import_run_id` FK `ON DELETE SET NULL`; beide neuen Indizes vorhanden.
- **Build:** `tsc --noEmit` sauber; `npm run build` erfolgreich.

### Bugs Found

#### LOW-1: Dubletten-Prüfung lädt pro Block alle vorhandenen Firmennamen
- **Severity:** Low
- Bei jedem Block fragt `importCustomersBatch` alle vorhandenen Firmennamen ab. Bei sehr großen Importen sind das mehrere Voll-Abfragen. Für die erwartete Datenmenge unkritisch; ggf. später optimieren (Namen einmal laden bzw. eindeutiger Index).

#### INFO: Live-Klickdurchlauf ausstehend
- Der angemeldete End-zu-End-Ablauf (echte Datei → Zuordnung → Speichern → Verlauf → Rückgängig) wurde wegen des echten Google-Logins **nicht automatisiert** geprüft. Empfehlung: einmal mit einer Test-Excel durchklicken (idealerweise mit hinterlegtem `ANTHROPIC_API_KEY`, um den KI-Vorschlag zu sehen).

#### INFO: `xlsx@0.18.5` Advisories
- Bekannte Schwachstellen beim Parsen *bösartig präparierter* Dateien. Für eigene Pipedrive-Exporte unkritisch; optional auf den SheetJS-CDN-Build wechseln.

### Summary
- **Acceptance Criteria:** 17/17 abgedeckt (Logik + Zugangsschutz automatisiert verifiziert)
- **Bugs Found:** 1 niedrig + 2 informative Hinweise (0 kritisch, 0 hoch, 0 mittel)
- **Security:** Bestanden (Auth + RLS + Validierung + parametrisierte Queries; Secret bleibt serverseitig)
- **Production Ready:** **YES** (keine kritischen/hohen Fehler) – empfohlen: einmaliger Live-Klickdurchlauf mit Test-Datei vor dem Produktiv-Einsatz.

## Deployment
_To be added by /deploy_

## Deployment
_To be added by /deploy_
