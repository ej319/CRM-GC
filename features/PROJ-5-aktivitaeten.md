# PROJ-5: Aktivitätenplanung und Aktivitätenliste

## Status: Planned
**Created:** 2026-06-22
**Last Updated:** 2026-06-22

## Dependencies
- Requires: PROJ-1 (Supabase Infrastruktur & Auth) — Login + Datenbank, freigeschaltete Nutzer
- Requires: PROJ-2 (Pipeline) — Board-Karten mit Aktivitäts-Marker (4 Zustände) + Sortierung „Letzte Aktivität" (wartet auf echte Daten)
- Requires: PROJ-4 (Detailansicht/Verlauf) — „Aktivität"-Reiter (Anlegen), „Fokus"-Bereich (Geplantes) und Verlauf-Reiter „Aktivitäten" (Platzhalter, die PROJ-5 füllt)

## User Stories
- Als Vertriebsnutzer möchte ich aus der Kundenakte eine Aktivität (Anruf / Termin vor Ort / Angebot machen / Nachfassen / Feedback-Gespräch) mit Datum und optionaler Uhrzeit planen, damit ich nichts vergesse.
- Als Vertriebsnutzer möchte ich auf der Kundenkarte sofort sehen, ob etwas überfällig (rot), heute (grün) oder später (grau) ansteht — oder nichts geplant ist (gelbes Warndreieck), damit ich weiß, wo ich dranbleiben muss.
- Als Vertriebsnutzer möchte ich in der Kundenakte im „Fokus" die nächste/dringendste Aktivität sehen und im Verlauf alle Aktivitäten des Kunden, damit ich den Stand kenne.
- Als Vertriebsnutzer möchte ich eine zentrale „Aktivitäten"-Seite, die alle Aktivitäten nach Fälligkeit sortiert zeigt (überfällig → heute → demnächst), damit ich meinen Tag planen kann.
- Als Vertriebsnutzer möchte ich Aktivitäten bearbeiten (z.B. das Datum verschieben) und löschen können, damit ich auf Änderungen reagiere.

## Out of Scope
- **„Erledigt"-/Abhaken-Status** — bewusst weggelassen. Eine erledigte Aktivität wird **gelöscht oder neu terminiert** (kein Haken, keine Erledigt-Filter, kein Erledigt-Zeitpunkt).
- **Erinnerungen/Benachrichtigungen** (E-Mail/Push) → PROJ-11.
- **Wiederkehrende Aktivitäten** (Serien).
- **Zuweisung an bestimmte Mitarbeiter** — Aktivitäten gehören zur geteilten Team-Pipeline (Mehrnutzer-Zuweisung später).
- **Kalender-Sync** (Google Calendar o.ä.).
- **E-Mail als Aktivitätstyp** → E-Mail ist ein eigenes Feature (PROJ-7).
- **Anlegen einer Aktivität direkt aus der zentralen Liste** → mögliche spätere Ergänzung (siehe Offene Fragen); im MVP wird aus der Kundenakte angelegt.

## Acceptance Criteria

**Format:** Angenommen [Vorbedingung] / Wenn [Aktion] / Dann [Ergebnis]

- [ ] Angenommen ich bin in der Kundenakte, wenn ich den Reiter „Aktivität" wähle, Typ + Datum (Uhrzeit optional) + optionale Notiz eingebe und speichere, dann erscheint die Aktivität beim Kunden (Fokus/Verlauf) und auf der zentralen Aktivitäten-Seite.
- [ ] Angenommen ich plane eine Aktivität ohne Datum oder ohne Typ, wenn ich speichere, dann erscheint eine Validierungsmeldung und es wird nicht gespeichert.
- [ ] Angenommen ein Kunde hat eine Aktivität in der Vergangenheit, wenn ich das Board ansehe, dann zeigt seine Karte einen **roten** Marker (überfällig).
- [ ] Angenommen ein Kunde hat eine heute fällige Aktivität, wenn ich das Board ansehe, dann zeigt seine Karte einen **grünen** Marker.
- [ ] Angenommen ein Kunde hat nur zukünftige Aktivitäten, wenn ich das Board ansehe, dann zeigt seine Karte einen **grauen** Marker.
- [ ] Angenommen ein Kunde hat keine Aktivität, wenn ich das Board ansehe, dann zeigt seine Karte das **gelbe Warndreieck**.
- [ ] Angenommen ein Kunde hat mehrere Aktivitäten, wenn der Karten-/Akten-Status bestimmt wird, dann hat „überfällig" Vorrang vor „heute" vor „zukünftig".
- [ ] Angenommen ich bin in der Kundenakte, wenn ich „Fokus" ansehe, dann sehe ich die dringendste Aktivität (überfällige zuerst, sonst die zeitlich nächste) mit Typ und Datum/Uhrzeit.
- [ ] Angenommen ein Kunde hat Aktivitäten, wenn ich im Verlauf den Reiter „Aktivitäten" wähle, dann sehe ich sie mit Typ, Datum/Uhrzeit, Notiz und Farbkennzeichnung.
- [ ] Angenommen ich öffne die Seite „Aktivitäten", wenn sie lädt, dann sehe ich alle Aktivitäten nach Fälligkeit sortiert (überfällig → heute → demnächst) mit Typ-Symbol, Kundenname, Fälligkeit und Notiz.
- [ ] Angenommen ich bin auf der Aktivitäten-Seite, wenn ich einen Filter wähle (Überfällig / Heute / Zukunft), dann sehe ich nur die passenden Aktivitäten.
- [ ] Angenommen ich klicke auf der Aktivitäten-Seite auf eine Zeile, wenn ich sie anklicke, dann komme ich zur Kundenakte des zugehörigen Kunden.
- [ ] Angenommen eine Aktivität existiert, wenn ich sie bearbeite (z.B. Datum ändere) und speichere, dann ist die Änderung in Akte, Board-Marker und Liste sichtbar.
- [ ] Angenommen eine Aktivität existiert, wenn ich auf „Löschen" klicke und die Sicherheitsabfrage bestätige, dann verschwindet sie überall.
- [ ] Angenommen ich bin nicht angemeldet, wenn ich die Aktivitäten-Seite oder die Kundenakte öffne, dann werde ich zur Login-Seite geleitet.

## Edge Cases
- Was passiert mit einer Aktivität, deren Datum heute ist, aber deren Uhrzeit schon vorbei ist? → Gilt den **ganzen heutigen Tag als „heute" (grün)**; erst ab morgen „überfällig" (rot).
- Was passiert bei mehreren überfälligen Aktivitäten? → Marker rot; „Fokus" zeigt die **älteste** überfällige (am dringendsten).
- Was passiert ohne Uhrzeit? → Gilt als ganztägig; in Fokus/Liste wird nur das Datum gezeigt.
- Was passiert beim Löschen eines Kunden mit Aktivitäten? → Die Aktivitäten werden **mitgelöscht** (CASCADE).
- Was passiert bei sehr vielen Aktivitäten auf der zentralen Seite? → Nach Fälligkeit sortiert, scrollbar.
- Was passiert bei gleichzeitiger Bearbeitung durch zwei Nutzer? → Die zuletzt gespeicherte Änderung gewinnt (bewusst einfach).
- Was passiert ohne „Erledigt"-Status mit vergangenen Aktivitäten? → Sie **bleiben überfällig (rot)**, bis sie gelöscht oder neu terminiert werden (bewusste Vereinfachung).
- Was passiert bei einem Netzwerkfehler beim Speichern? → Fehlermeldung; die Eingabe bleibt erhalten.

## Technical Requirements (optional)
- Security: Zugriff nur für angemeldete, freigeschaltete Nutzer (PROJ-1). Geteilte Team-Daten. Row Level Security auf der neuen Aktivitäten-Tabelle.
- Datum/Heute-Bewertung in der Zeitzone Europe/Berlin (damit „heute/überfällig" korrekt umschlägt).
- Performance: Board-Marker leiten sich je Kunde aus dessen Aktivitäten ab (aggregiert); Aktivitäten-Seite nach Fälligkeit sortiert.
- Aktivitäten hängen am Kunden (CASCADE) — deckt sich mit PROJ-3 (Import-Rückgängigmachen entfernt Kunde inkl. Aktivitäten) und PROJ-4 (Löschen des Kunden).

## Open Questions
- [ ] Aktivität direkt aus der zentralen Liste anlegen (Kunde auswählen) — jetzt oder später?
- [ ] „Fokus" bei mehreren überfälligen: älteste (dringendste) zuerst — bestätigt? Alternativ neueste.
- [ ] Sollen vergangene Aktivitäten im Verlauf optisch als „war fällig am …" markiert werden, oder einfach rot bleiben?

## Decision Log

### Product Decisions
<!-- Added by /write-spec -->
| Decision | Rationale | Date |
|----------|-----------|------|
| 5 Aktivitäts-Typen: Anruf, Termin vor Ort, Angebot machen, Nachfassen, Feedback-Gespräch (erweiterbare Liste) | Passt zum konkreten Vertriebsprozess; Pflege später über die geplante Listen-Verwaltung | 2026-06-22 |
| Aktivität = Typ + Fälligkeit (Datum + optionale Uhrzeit) + optionale Notiz, am Kunden | Reicht zum Planen; Uhrzeit optional für reine Aufgaben | 2026-06-22 |
| **Kein „Erledigt"-Status** — erledigte Aktivitäten werden gelöscht oder neu terminiert | Ausdrücklicher Nutzerwunsch („erledigt brauche ich nicht"); hält das Modell schlank | 2026-06-22 |
| 3 Farbzustände nach Datum: überfällig=rot, heute=grün, zukünftig=grau; keine Aktivität=gelbes Warndreieck | Direkter Handlungs-Hinweis auf der Karte; nutzt die in PROJ-2 angelegten Marker-Zustände | 2026-06-22 |
| Status-Vorrang: überfällig > heute > zukünftig | Das Dringendste ist zuerst sichtbar | 2026-06-22 |
| Heute fällig bleibt den ganzen Tag „heute" (grün), auch wenn die Uhrzeit vorbei ist | Vermeidet, dass Termine schon mittags „überfällig" wirken | 2026-06-22 |
| Zentrale „Aktivitäten"-Seite, Standard nach Fälligkeit sortiert; Filter Überfällig/Heute/Zukunft | Tagesplanung; ausdrücklicher Nutzerwunsch (nach Datum) | 2026-06-22 |
| „Fokus" zeigt die dringendste Aktivität; Verlauf zeigt alle Aktivitäten des Kunden | Füllt die PROJ-4-Platzhalter | 2026-06-22 |
| Anlegen aus der Kundenakte (nicht aus der zentralen Liste) im MVP | Kundenkontext ist dort vorhanden; Liste-Anlegen ggf. später | 2026-06-22 |
| Geteilte Team-Daten, keine Mitarbeiter-Zuweisung im MVP | Konsistent mit PROJ-2; Mehrnutzer-Zuweisung später | 2026-06-22 |

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
