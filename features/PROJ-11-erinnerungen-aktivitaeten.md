# PROJ-11: Erinnerungen/Benachrichtigungen für Aktivitäten

## Status: Architected
**Created:** 2026-07-13
**Last Updated:** 2026-07-13

> **Kurzfassung:** Eine **Erinnerungs-Glocke** in der Kopfzeile (auf jeder Seite sichtbar) zeigt an, wie viele offene Aktivitäten **heute fällig oder überfällig** sind. Ein Klick öffnet eine kurze Liste dieser Aktivitäten (Kunde, Typ, Fälligkeit) — direkt anklickbar, um zur Kundenakte zu springen. So gehen geplante Anrufe/Termine nicht unter, sobald man im CRM ist.

## Dependencies
- Requires: PROJ-1 (Auth) — Login-Pflicht; Anzeige nur für angemeldete Nutzer
- Requires: PROJ-5 (Aktivitäten) — baut auf den vorhandenen Aktivitäten (Fälligkeitsdatum, offen/erledigt) und der bestehenden Datenschicht auf

## User Stories
- Als Vertriebsnutzer möchte ich beim Öffnen des CRM sofort sehen, ob heute etwas fällig ist, damit ich keine geplante Aktivität vergesse.
- Als Vertriebsnutzer möchte ich überfällige Aktivitäten deutlich erkennen, damit ich Liegengebliebenes nachhole.
- Als Vertriebsnutzer möchte ich von der Erinnerung direkt zum betreffenden Kunden springen, damit ich sofort handeln kann.
- Als Vertriebsnutzer möchte ich, dass die Anzahl sinkt, sobald ich eine Aktivität erledige, damit die Anzeige immer stimmt.

## Funktionsbeschreibung
- **Glocken-Symbol in der Kopfzeile** (neben dem Nutzer-Menü), auf jeder Seite.
- Eine **Zahl (Badge)** an der Glocke = Anzahl offener Aktivitäten, die **überfällig** oder **heute fällig** sind. Keine fälligen → keine Zahl (dezente Glocke).
- **Klick auf die Glocke** öffnet ein kleines Fenster mit der Liste dieser Aktivitäten (überfällige zuerst): Kundenname, Aktivitätstyp, Fälligkeit; überfällige rot markiert.
- **Klick auf einen Eintrag** öffnet die Kundenakte.
- Ein Link „Alle Aktivitäten" führt zur bestehenden Aktivitäten-Seite.
- **Zukünftige** Aktivitäten (später fällig) zählen nicht in die Erinnerung, erscheinen aber weiterhin auf der Aktivitäten-Seite.

## Out of Scope
- **E-Mail-Erinnerungen / Push-Benachrichtigungen**, die auch bei geschlossenem CRM ankommen — braucht einen zeitgesteuerten Server-Dienst (Cron); **spätere Phase** (in Open Questions vermerkt).
- **Einzelne Erinnerungen „abhaken"/„später erinnern"** (Snooze) — die Anzeige ergibt sich live aus den offenen, fälligen Aktivitäten; erledigt man die Aktivität, verschwindet sie.
- **Konfigurierbare Vorlaufzeit** (z. B. „1 Tag vorher erinnern") — MVP: heute + überfällig.
- **Ton/Desktop-Benachrichtigung** — nur die visuelle Glocke in der App.
- **Team-Benachrichtigungen für fremde Aktivitäten** — Aktivitäten sind ohnehin team-weit; die Glocke zeigt alle offenen fälligen (kein Nutzer-Filter im MVP).

## Acceptance Criteria

**Format:** Angenommen [Vorbedingung] / Wenn [Aktion] / Dann [Ergebnis]

- [ ] Angenommen es gibt offene Aktivitäten, die heute fällig oder überfällig sind, wenn der Nutzer eine beliebige Seite öffnet, dann zeigt die Glocke in der Kopfzeile deren Anzahl
- [ ] Angenommen es gibt keine fälligen offenen Aktivitäten, wenn der Nutzer eine Seite öffnet, dann zeigt die Glocke keine Zahl
- [ ] Angenommen die Glocke zeigt eine Zahl, wenn der Nutzer darauf klickt, dann erscheint eine Liste der fälligen Aktivitäten mit Kundenname, Typ und Fälligkeit, überfällige zuerst und rot markiert
- [ ] Angenommen die Liste ist offen, wenn der Nutzer auf einen Eintrag klickt, dann öffnet sich die zugehörige Kundenakte
- [ ] Angenommen der Nutzer erledigt eine fällige Aktivität, wenn er die Seite neu lädt, dann ist die Glocken-Zahl entsprechend niedriger
- [ ] Angenommen der Nutzer ist nicht angemeldet, wenn er die App aufruft, dann sieht er die Glocke nicht (Login-geschützt)

## Edge Cases
- **Viele fällige Aktivitäten:** die Liste zeigt eine sinnvolle Obergrenze (z. B. die nächsten ~10) mit Hinweis „… und X weitere → Alle Aktivitäten"; die Zahl an der Glocke bleibt die Gesamtzahl.
- **Aktivität ohne Uhrzeit:** wird nur mit Datum angezeigt; zählt normal.
- **Fälligkeit heute mit vergangener Uhrzeit:** zählt als „heute fällig" (kein separater Stunden-Feinschliff im MVP).
- **Zeitzone:** „heute" wird in Europe/Berlin bestimmt (wie im bestehenden Aktivitäten-Code).
- **Keine Kunden/Aktivitäten:** Glocke ohne Zahl; Liste zeigt „Keine fälligen Aktivitäten".

## Technical Requirements (optional)
- Login-Pflicht; Anzeige nur in der angemeldeten Ansicht.
- Nutzt die vorhandene Aktivitäten-Datenschicht; **keine neue Tabelle/Infrastruktur** nötig.
- Fälligkeitslogik als reine, testbare Funktion (überfällig/heute/zukünftig, Europe/Berlin).

## Open Questions
- [x] Auslieferungsweg → **gelöst:** MVP = **In-App-Glocke** (zuverlässig, ohne Server-Dienst). E-Mail-/Push-Erinnerungen (auch bei geschlossener App) sind eine **spätere Phase** (eigener Cron-Dienst) — bewusst zurückgestellt.
- [x] Vorlaufzeit → **gelöst:** MVP zeigt „heute + überfällig"; konfigurierbare Vorlauftage später.

## Decision Log

### Product Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| MVP = visuelle In-App-Glocke statt E-Mail/Push | Zuverlässig und ohne zusätzliche Server-Infrastruktur; sofortiger Alltagsnutzen, sobald man im CRM ist | 2026-07-13 |
| „Fällig" = überfällig + heute (keine Vorlauftage) | Einfach und eindeutig; Vorlaufzeit kann später ergänzt werden | 2026-07-13 |
| Kein Snooze/Einzel-Abhaken der Erinnerung | Anzeige ergibt sich live aus offenen, fälligen Aktivitäten — Erledigen genügt | 2026-07-13 |
| Alle offenen fälligen Aktivitäten (kein Nutzer-Filter) | Aktivitäten sind team-weit; Einzelnutzer-Start | 2026-07-13 |

### Technical Decisions
<!-- Added by /architecture -->
| Decision | Rationale | Date |
|----------|-----------|------|
| Keine neue Tabelle/Infrastruktur; Erinnerungen live aus den bestehenden Aktivitäten berechnet | „Fällig" ist aus `activities` (Fälligkeitsdatum, offen) ableitbar; nichts zu persistieren | 2026-07-13 |
| Fällige Aktivitäten über die vorhandene `getOpenActivities()` laden, im Server (`AppShell`) | Wird ohnehin genutzt/erprobt; liefert Kundennamen mit | 2026-07-13 |
| Reine Funktion `dueReminders()` in `activities/data.ts` + Unit-Tests | Kernlogik (überfällig+heute, Sortierung) isoliert testbar | 2026-07-13 |
| Glocke als Client-Komponente (Dropdown), in der bestehenden Kopfzeile (`AppShell`) | Konsistent mit Nutzer-Menü; minimaler Eingriff | 2026-07-13 |
| Keine neue Bibliothek | shadcn-Dropdown/Badge + Lucide-Glocke vorhanden | 2026-07-13 |

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)

### Überblick in einem Satz
Eine Erinnerungs-Glocke in der bestehenden Kopfzeile zeigt live die Anzahl **überfälliger + heute fälliger** offener Aktivitäten und listet sie in einem Dropdown — komplett aus den vorhandenen Aktivitäten berechnet, ohne neue Datenbank oder Server-Dienst.

### A) Was der Nutzer sieht
```
Kopfzeile (AppShell, jede Seite)
├── Logo
└── rechts:
    ├── NEU: Glocke 🔔 + Zahl (überfällig+heute)
    │     └── Klick → Dropdown:
    │           ├── „Fällige Aktivitäten"
    │           ├── Eintrag: Kunde · Typ · Fälligkeit (überfällig rot) → Kundenakte
    │           ├── … (max ~10) + „und X weitere"
    │           └── Link „Alle Aktivitäten" → /aktivitaeten
    └── Nutzer-Menü (bestehend)
```

### B) Daten
- **Keine neue Tabelle.** Die Erinnerungen sind eine **Sicht** auf die bestehenden Aktivitäten: offene Aktivitäten mit Fälligkeit ≤ heute (Europe/Berlin).
- Geladen über die vorhandene `getOpenActivities()` (liefert offene Aktivitäten inkl. Kundenname), in `AppShell` (serverseitig). Eine reine Funktion `dueReminders()` filtert/sortiert.

### C) Was neu gebaut wird (knapp)
- **Reine Funktion** `dueReminders(rows, today)` in `src/lib/activities/data.ts` (überfällig+heute, überfällige zuerst) + Unit-Tests.
- **`src/components/notification-bell.tsx`** (Client): Glocke + Badge + Dropdown-Liste; Einträge verlinken auf `/kunde/[id]`, plus „Alle Aktivitäten".
- **`AppShell`**: lädt die fälligen Aktivitäten und rendert die Glocke links vom Nutzer-Menü.

### D) Sicherheit
- Nur in der angemeldeten Ansicht (AppShell prüft bereits Login/Profil). Keine neuen Datenpfade.

### E) Zusätzliche Pakete
**Keine.**

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
