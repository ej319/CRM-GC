# PROJ-5: Aktivitätenplanung und Aktivitätenliste

## Status: Architected
**Created:** 2026-06-22
**Last Updated:** 2026-06-22

## Dependencies
- Requires: PROJ-1 (Supabase Infrastruktur & Auth) — Login + Datenbank, freigeschaltete Nutzer
- Requires: PROJ-2 (Pipeline) — Board-Karten mit Aktivitäts-Marker (4 Zustände) + Sortierung „Letzte Aktivität" (wartet auf echte Daten)
- Requires: PROJ-4 (Detailansicht/Verlauf) — „Aktivität"-Reiter (Anlegen), „Fokus"-Bereich (Geplantes) und Verlauf-Reiter „Aktivitäten" (Platzhalter, die PROJ-5 füllt)

## User Stories
- Als Vertriebsnutzer möchte ich aus der Kundenakte eine Aktivität (Anruf / Termin vor Ort / Angebot machen / Nachfassen / Feedback-Gespräch) mit Datum und optionaler Uhrzeit planen, damit ich nichts vergesse.
- Als Vertriebsnutzer möchte ich auf der Kundenkarte sofort sehen, ob etwas überfällig (rot), heute (grün) oder später (grau) ansteht — oder keine offene Aktivität geplant ist (gelbes Warndreieck), damit ich weiß, wo ich dranbleiben muss.
- Als Vertriebsnutzer möchte ich eine erledigte Aktivität **abhaken** — sie wird als erledigt markiert, **bleibt aber im Verlauf des Kunden** (z.B. „Anruf · erledigt am …") — und sofort gefragt werden, die nächste Aktivität zu planen (überspringbar), damit der komplette Kontaktverlauf über Jahre erhalten bleibt und ich trotzdem immer einen nächsten Schritt habe.
- Als Vertriebsnutzer möchte ich in der Kundenakte im „Fokus" die dringendste offene Aktivität sehen und im Verlauf alle Aktivitäten (offene wie erledigte), damit ich Stand und Historie kenne.
- Als Vertriebsnutzer möchte ich eine zentrale „Aktivitäten"-Seite, die alle offenen Aktivitäten nach Fälligkeit sortiert zeigt (überfällig → heute → demnächst), damit ich meinen Tag planen kann.
- Als Vertriebsnutzer möchte ich Aktivitäten bearbeiten (z.B. das Datum verschieben) und löschen können, damit ich auf Änderungen reagiere.

## Out of Scope
- **Erinnerungen/Benachrichtigungen** (E-Mail/Push) → PROJ-11.
- **Wiederkehrende Aktivitäten** (Serien) — der Folge-Aktivität-Dialog ersetzt das bewusst durch manuelles Planen.
- **Zuweisung an bestimmte Mitarbeiter** — Aktivitäten gehören zur geteilten Team-Pipeline (Mehrnutzer-Zuweisung später).
- **Kalender-Sync** (Google Calendar o.ä.).
- **E-Mail als Aktivitätstyp** → eigenes Feature (PROJ-7).
- **Neue Aktivität ohne Kundenbezug aus der zentralen Liste anlegen** → Aktivitäten entstehen immer am Kunden (Akte oder Folge-Aktivität-Dialog).
- **Zentrale „Erledigt"-Liste** → die zentrale Seite listet nur **offene** Aktivitäten (Planung); erledigte Aktivitäten sind Historie im Verlauf der jeweiligen Kundenakte.

## Acceptance Criteria

**Format:** Angenommen [Vorbedingung] / Wenn [Aktion] / Dann [Ergebnis]

- [ ] Angenommen ich bin in der Kundenakte, wenn ich den Reiter „Aktivität" wähle, Typ + Datum (Uhrzeit optional) + optionale Notiz eingebe und speichere, dann erscheint die Aktivität beim Kunden (Fokus/Verlauf) und auf der zentralen Aktivitäten-Seite.
- [ ] Angenommen ich plane eine Aktivität ohne Datum oder ohne Typ, wenn ich speichere, dann erscheint eine Validierungsmeldung und es wird nicht gespeichert.
- [ ] Angenommen ein Kunde hat eine **offene** Aktivität in der Vergangenheit, wenn ich das Board ansehe, dann zeigt seine Karte einen **roten** Marker (überfällig).
- [ ] Angenommen ein Kunde hat eine heute fällige **offene** Aktivität, wenn ich das Board ansehe, dann zeigt seine Karte einen **grünen** Marker.
- [ ] Angenommen ein Kunde hat nur zukünftige **offene** Aktivitäten, wenn ich das Board ansehe, dann zeigt seine Karte einen **grauen** Marker.
- [ ] Angenommen ein Kunde hat keine **offene** Aktivität (auch wenn erledigte im Verlauf stehen), wenn ich das Board ansehe, dann zeigt seine Karte das **gelbe Warndreieck**.
- [ ] Angenommen ein Kunde hat mehrere offene Aktivitäten, wenn der Karten-/Akten-Status bestimmt wird, dann hat „überfällig" Vorrang vor „heute" vor „zukünftig".
- [ ] Angenommen eine offene Aktivität existiert, wenn ich sie **abhake**, dann wird sie als erledigt markiert, **bleibt im Verlauf des Kunden** (mit Erledigt-Datum), zählt nicht mehr für Marker/Fokus, und es öffnet sich **automatisch** der Dialog „Nächste Aktivität planen".
- [ ] Angenommen eine Aktivität ist erledigt, wenn ich den Verlauf-Reiter „Aktivitäten" ansehe, dann sehe ich sie als erledigten Eintrag (Typ-Symbol, Erledigt-Datum, Notiz, abgehakt dargestellt).
- [ ] Angenommen der „Nächste Aktivität planen"-Dialog ist offen, wenn ich Typ + Datum (Uhrzeit/Notiz optional) eingebe und speichere, dann ist die neue Aktivität sofort beim Kunden und in der Liste sichtbar.
- [ ] Angenommen der „Nächste Aktivität planen"-Dialog ist offen, wenn ich ihn überspringe/wegklicke, dann wird keine neue Aktivität angelegt; hat der Kunde dann keine offene Aktivität, zeigt seine Karte das gelbe Warndreieck.
- [ ] Angenommen ich bin in der Kundenakte, wenn ich „Fokus" ansehe, dann sehe ich die dringendste **offene** Aktivität (überfällige zuerst, sonst die zeitlich nächste) mit Typ und Datum/Uhrzeit.
- [ ] Angenommen ich öffne die Seite „Aktivitäten", wenn sie lädt, dann sehe ich alle **offenen** Aktivitäten nach Fälligkeit sortiert (überfällig → heute → demnächst) mit Typ-Symbol, Kundenname, Fälligkeit und Notiz.
- [ ] Angenommen ich bin auf der Aktivitäten-Seite, wenn ich einen Filter wähle (Überfällig / Heute / Zukunft), dann sehe ich nur die passenden Aktivitäten; ich kann sie auch direkt abhaken (mit Folge-Aktivität-Dialog).
- [ ] Angenommen ich klicke auf der Aktivitäten-Seite auf eine Zeile, wenn ich sie anklicke, dann komme ich zur Kundenakte des zugehörigen Kunden.
- [ ] Angenommen eine Aktivität existiert, wenn ich sie bearbeite (z.B. Datum ändere) und speichere, dann ist die Änderung in Akte, Board-Marker und Liste sichtbar.
- [ ] Angenommen eine Aktivität existiert, wenn ich auf „Löschen" klicke und die Sicherheitsabfrage bestätige, dann verschwindet sie endgültig (für versehentlich angelegte; ohne Folge-Aktivität-Dialog).
- [ ] Angenommen ich bin nicht angemeldet, wenn ich die Aktivitäten-Seite oder die Kundenakte öffne, dann werde ich zur Login-Seite geleitet.

## Edge Cases
- Was passiert beim **Abhaken**? → Die Aktivität wird als erledigt markiert (Erledigt-Datum), **bleibt im Verlauf** des Kunden, zählt nicht mehr als offen; danach öffnet sich der Folge-Aktivität-Dialog.
- Was passiert mit einem Kunden, der nur **erledigte** Aktivitäten hat? → Gelbes Warndreieck (keine offene Aktivität), aber der Verlauf zeigt die erledigten Einträge.
- Abhaken **aus der zentralen Liste**? → Gleiches Verhalten inkl. Folge-Aktivität-Dialog (der Kunde ist bekannt); die erledigte verschwindet aus der Planungs-Liste, bleibt aber im Kunden-Verlauf.
- Was passiert mit einer Aktivität, deren Datum heute ist, aber deren Uhrzeit schon vorbei ist? → Gilt den **ganzen heutigen Tag als „heute" (grün)**; erst ab morgen „überfällig" (rot).
- Was passiert bei mehreren überfälligen offenen Aktivitäten? → Marker rot; „Fokus" zeigt die **älteste** überfällige (am dringendsten).
- Was passiert ohne Uhrzeit? → Gilt als ganztägig; in Fokus/Liste wird nur das Datum gezeigt.
- Was passiert beim Löschen eines Kunden mit Aktivitäten? → Alle (offene wie erledigte) werden **mitgelöscht** (CASCADE).
- Was passiert bei gleichzeitiger Bearbeitung/Abhaken durch zwei Nutzer? → Die zuletzt gespeicherte Änderung gewinnt.
- Was passiert bei einem Netzwerkfehler beim Speichern? → Fehlermeldung; die Eingabe bleibt erhalten.

## Technical Requirements (optional)
- Security: Zugriff nur für angemeldete, freigeschaltete Nutzer (PROJ-1). Geteilte Team-Daten. Row Level Security auf der neuen Aktivitäten-Tabelle.
- Datum/Heute-Bewertung in der Zeitzone Europe/Berlin (damit „heute/überfällig" korrekt umschlägt).
- Performance: Board-Marker leiten sich je Kunde aus dessen **offenen** Aktivitäten ab (aggregiert); zentrale Seite nach Fälligkeit sortiert.
- Aktivitäten hängen am Kunden (CASCADE) — deckt sich mit PROJ-3 (Import-Rückgängigmachen) und PROJ-4 (Kunde löschen).

## Open Questions
- [ ] „Nächste Aktivität planen"-Dialog: Datum auf +7 Tage vorbelegen (änderbar)? (Vorschlag: ja.)
- [ ] „Fokus" bei mehreren überfälligen: älteste (dringendste) zuerst — bestätigt? Alternativ neueste.
- [ ] Verlauf-Reiter „Aktivitäten": offene UND erledigte gemeinsam chronologisch, oder erledigte optisch abgesetzt (durchgestrichen/abgehakt)? (Vorschlag: gemeinsam, erledigte mit Haken + Erledigt-Datum.)

## Decision Log

### Product Decisions
<!-- Added by /write-spec -->
| Decision | Rationale | Date |
|----------|-----------|------|
| 5 Aktivitäts-Typen: Anruf, Termin vor Ort, Angebot machen, Nachfassen, Feedback-Gespräch (erweiterbare Liste) | Passt zum konkreten Vertriebsprozess; Pflege später über die geplante Listen-Verwaltung | 2026-06-22 |
| Aktivität = Typ + Fälligkeit (Datum + optionale Uhrzeit) + optionale Notiz, am Kunden | Reicht zum Planen; Uhrzeit optional für reine Aufgaben | 2026-06-22 |
| **Abhaken = als erledigt markieren** — die Aktivität **bleibt im Kunden-Verlauf** (Historie über Jahre), zählt aber nicht mehr als „offen"; danach öffnet der Folge-Aktivität-Dialog | Kompletter Kontaktverlauf bleibt erhalten, Planungs-Ansichten bleiben sauber; Pipedrive-Muster „immer eine nächste Aktivität" | 2026-06-22 |
| Marker / „Fokus" / zentrale Liste betrachten nur **offene** Aktivitäten | Erledigte sind Historie und sollen den Status nicht verfälschen | 2026-06-22 |
| 3 Farbzustände nach Datum (offene Aktivitäten): überfällig=rot, heute=grün, zukünftig=grau; keine offene=gelbes Warndreieck | Direkter Handlungs-Hinweis auf der Karte; nutzt die in PROJ-2 angelegten Marker-Zustände | 2026-06-22 |
| Status-Vorrang: überfällig > heute > zukünftig | Das Dringendste ist zuerst sichtbar | 2026-06-22 |
| Heute fällig bleibt den ganzen Tag „heute" (grün), auch wenn die Uhrzeit vorbei ist | Vermeidet, dass Termine schon mittags „überfällig" wirken | 2026-06-22 |
| Zentrale „Aktivitäten"-Seite (nur offene), Standard nach Fälligkeit sortiert; Filter Überfällig/Heute/Zukunft | Tagesplanung; ausdrücklicher Nutzerwunsch (nach Datum) | 2026-06-22 |
| „Fokus" zeigt die dringendste offene Aktivität; Verlauf-Reiter zeigt offene UND erledigte Aktivitäten | Füllt die PROJ-4-Platzhalter; vollständige Historie | 2026-06-22 |
| Anlegen aus der Kundenakte bzw. über den Folge-Aktivität-Dialog (nicht „frei" aus der Liste) im MVP | Kundenkontext ist immer vorhanden | 2026-06-22 |
| Geteilte Team-Daten, keine Mitarbeiter-Zuweisung im MVP | Konsistent mit PROJ-2; Mehrnutzer-Zuweisung später | 2026-06-22 |

### Technical Decisions
<!-- Added by /architecture -->
| Decision | Rationale | Date |
|----------|-----------|------|
| Aktivitäten als eigene Tabelle (Verweis auf Kunde), FK ON DELETE CASCADE | Mehrere Aktivitäten pro Kunde; verschwinden mit dem Kunden (PROJ-3/PROJ-4) | 2026-06-22 |
| **Erledigt-Zeitpunkt am Datensatz** (`erledigt_am`, leer = offen); Abhaken setzt ihn (löscht nicht) | Erledigte bleiben als Historie erhalten; offen/erledigt klar trennbar | 2026-06-22 |
| Marker / Fokus / zentrale Liste nur aus **offenen** Aktivitäten (erledigt_am leer) | Erledigte verfälschen den Status nicht | 2026-06-22 |
| Farbstatus berechnet (nicht gespeichert), bezogen auf „heute" Europe/Berlin | Immer korrekt ohne nächtlichen Hintergrundjob | 2026-06-22 |
| Board-Marker je Kunde per Aggregat (frühestes offenes Datum / Überfällig-Kennzeichen) | Effizient bei vielen Karten; ersetzt das bisherige „alle gelb" | 2026-06-22 |
| Zentrale Seite unter eigener Route `/aktivitaeten` + Menüpunkt „Aktivitäten" | Tagesübersicht, getrennt vom Board | 2026-06-22 |
| Native Datums-/Uhrzeit-Eingaben statt Datepicker-Paket | Einfach, keine neue Abhängigkeit | 2026-06-22 |
| Umsetzung über Next Server Actions + RLS wie bei `customers`/`notes` | Konsistent; geteilte Team-Daten geschützt | 2026-06-22 |
| Aktivitäts-Typen als erweiterbare App-Liste (5 Startwerte) | Wie Kategorie/Quelle; Pflege später über Listen-Verwaltung | 2026-06-22 |
| „Folge-Aktivität planen" als Frontend-Dialog nach Abhaken (Datum +7 Tage vorbelegt) | Pipedrive-Muster „immer eine nächste Aktivität" | 2026-06-22 |

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)

### Bausteine der Oberfläche
```
Zentrale Seite „/aktivitaeten"  (Menüpunkt „Aktivitäten" oben rechts, neben „Daten importieren")
├── Filter:  Überfällig · Heute · Zukunft   (Standard: alle OFFENEN nach Fälligkeit sortiert)
└── Liste: Typ-Symbol · Kunde · Fälligkeit (Datum/Uhrzeit) · Notiz · [✓ Abhaken] [Bearbeiten] [Löschen]
       └── Klick auf die Zeile → Kundenakte

Kundenakte „/kunde/[id]"  (aus PROJ-4)
├── Anlege-Leiste → Reiter „Aktivität" → Formular: Typ ▾ · Datum · Uhrzeit (optional) · Notiz · [Speichern]
├── „Fokus": dringendste OFFENE Aktivität (Typ, Datum/Uhrzeit) + [✓ Abhaken]
└── Verlauf → Reiter „Aktivitäten": OFFENE (farbig nach Datum) UND ERLEDIGTE (abgehakt, mit Erledigt-Datum),
       je [✓ Abhaken (nur offene)] [Bearbeiten] [Löschen]

Abhaken (überall gleich) → Aktivität wird als erledigt markiert (bleibt im Verlauf)
       → Dialog „Nächste Aktivität planen" (Kunde vorbelegt, Datum +7 Tage) → [Speichern] / [Überspringen]

Board „/"  (aus PROJ-2)
└── Kundenkarte → Aktivitäts-Marker aus den OFFENEN Aktivitäten (🔴 überfällig / 🟢 heute / ⚪ zukünftig / ⚠️ keine offene)
```

### Datenmodell (in Klartext)
- **Aktivitäten** (neue Tabelle): Verweis auf den Kunden, Typ, Fälligkeitsdatum, optionale Uhrzeit, optionale Notiz, **Erledigt-Zeitpunkt** (leer = offen, gesetzt = erledigt), Ersteller, Zeitstempel. Beim Löschen des Kunden gehen seine Aktivitäten mit (CASCADE).
- **Abhaken** setzt nur den Erledigt-Zeitpunkt — die Aktivität **bleibt erhalten** und erscheint weiter im Verlauf des Kunden. **Löschen** (Sicherheitsabfrage) entfernt sie dagegen ganz (für Versehen).
- Der **Farbstatus** (überfällig/heute/zukünftig) gilt nur für **offene** Aktivitäten und wird **berechnet** (Datum vs. „heute", Europe/Berlin), nicht gespeichert.
- **Aktivitäts-Typen** als erweiterbare App-Liste (die 5 Startwerte), wie Kategorie/Quelle.
- Der **Board-Marker je Kunde** kommt aus dessen **offenen** Aktivitäten (Vorrang überfällig → heute → zukünftig; keine offene → gelb). Auch die Sortierung „Letzte Aktivität" nutzt das.

Speicherort: Supabase (PostgreSQL), geteilte Team-Daten, Row Level Security.

### Der „Abhaken + Folge planen"-Ablauf
1. Klick auf den Haken an einer offenen Aktivität → sie wird als **erledigt** markiert (bleibt im Verlauf, mit Erledigt-Datum).
2. Direkt danach öffnet sich der Dialog **„Nächste Aktivität planen"** (derselbe Kunde, Datum auf +7 Tage vorbelegt, alles änderbar).
3. **Speichern** → neue offene Aktivität. **Überspringen** → keine; hat der Kunde dann keine offene Aktivität, erscheint das gelbe Warndreieck.

### Tech-Entscheidungen (warum)
- **Aktivitäten als eigene Tabelle** mit Verweis auf den Kunden (CASCADE): mehrere pro Kunde; verschwinden mit dem Kunden.
- **Erledigt-Zeitpunkt statt Löschen beim Abhaken:** erledigte Aktivitäten bleiben als Historie; offene/erledigte sind sauber trennbar.
- **Farbstatus berechnet statt gespeichert** (nur für offene): stimmt immer von selbst, kein Hintergrundjob.
- **Board-Marker per Aggregat** über offene Aktivitäten: effizient auch bei vielen Karten.
- **Native Datums-/Uhrzeit-Eingabe** (kein Kalender-Paket): einfach, keine neue Abhängigkeit.
- **Server-Aktionen + RLS** wie bei `customers`/`notes`: konsistent, geteilte Team-Daten geschützt.
- **„Folge-Aktivität planen" als Dialog im Frontend** nach erfolgreichem Abhaken: Pipedrive-Muster „immer eine nächste Aktivität".

### Abhängigkeiten (zu installieren)
- **Keine neuen Pakete.** shadcn/ui-Bausteine (Dialog, Auswahl, Eingabe, Tabs, Tabelle) sind vorhanden; Datum/Uhrzeit über native Browser-Eingabefelder.

## Frontend-Implementierung (Stand 2026-06-22)
- **Neue Seite `/aktivitaeten`** (Menüpunkt „Aktivitäten" oben rechts): offene Aktivitäten nach Fälligkeit, Filter Alle/Überfällig/Heute/Zukunft, je Zeile Typ-Symbol · Kunde (Link) · Fälligkeit (farbig) · Notiz · Abhaken.
- **Kundenakte:** „Aktivität"-Reiter zeigt jetzt das **Aktivitäts-Formular** (Typ, Datum, Uhrzeit optional, Notiz); **„Fokus"** zeigt die dringendste offene Aktivität (abhakbar); Verlauf-Reiter **„Aktivitäten"** listet offene (farbig) + erledigte (abgehakt); „Alle" zeigt Aktivitäten + Notizen.
- **Abhaken-Ablauf:** Haken → Aktivität wird erledigt (bleibt im Verlauf) → **„Nächste Aktivität planen"-Dialog** (Datum +7 Tage vorbelegt, überspringbar).
- **Status-Logik** (`src/lib/activities/data.ts`): überfällig/heute/zukünftig nach Datum (Europe/Berlin), Marker-Aggregat je Kunde, Fokus-Auswahl — mit Unit-Tests (6).
- **Neue Dateien:** `src/lib/activities/{data,data.test}.ts`; `src/components/detail/{activity-form,activity-item,plan-next-dialog}.tsx`; `src/components/activities/activity-list.tsx`; `src/app/aktivitaeten/page.tsx`. Geändert: `detail-composer.tsx`, `verlauf.tsx`, `customer-detail.tsx`, `user-menu.tsx`.
- **Verifikation:** `tsc --noEmit` sauber; `npm test` 34/34 grün; Dev-Server hat die Änderungen ohne Fehler übernommen (Voll-Build ausgelassen, um den laufenden Dev-Server nicht zu stören).
- **Vorschau-Hinweis:** Aktivitäten laufen **nur im Browser** (anlegen/abhaken/bearbeiten/löschen sichtbar, nicht dauerhaft gespeichert); die zentrale Seite zeigt Beispieldaten; die Board-Marker stehen noch auf „keine". Banner weisen darauf hin.
- **Offen für `/backend`:** Tabelle `activities` (Verweis auf Kunde, Typ, Fälligkeit, Notiz, `erledigt_am`, CASCADE) mit RLS; Server-Aktionen anlegen/abhaken/bearbeiten/löschen; echte Daten für Kundenakte + zentrale Seite; **Board-Marker + Sortierung „Letzte Aktivität"** an die offenen Aktivitäten je Kunde anbinden; Vorschau-Banner/Beispieldaten entfernen.

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
