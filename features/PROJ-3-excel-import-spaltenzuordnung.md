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
- [ ] Soll „Rückgängig machen" für jeden vergangenen Import gelten oder nur den jeweils letzten? (Vorschlag: jeden, über einen Import-Verlauf.)
- [ ] Wenn an importierten Kunden später Verlauf hängt (Notizen/Aktivitäten/E-Mails, PROJ-4 ff.): Rückgängigmachen trotzdem erlauben (mit Warnung) oder dann blockieren? → spätestens beim Bau dieser Features klären.
- [ ] Genauer Vorschlags-Mechanismus für die Kategorie-Zuordnung (einfache Stichwort-Erkennung vs. KI-Vorschlag) → Entscheidung in `/architecture`; KI ggf. nur für den Vorschlag, nicht für die finale Festlegung.
- [ ] Sollen Zuordnungs-Vorlagen (Mapping) gespeichert werden, um wiederkehrende Importe zu erleichtern? (Vermutlich unnötig, da Migration meist einmalig.)

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
| _To be added by /architecture_ | | |

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)
_To be added by /architecture_

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
