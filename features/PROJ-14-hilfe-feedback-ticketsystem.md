# PROJ-14: In-App-Hilfe & Feedback/Ticket-System

## Status: Deployed
**Created:** 2026-07-13
**Last Updated:** 2026-07-13

> **Stand 2026-07-13:** **Live auf https://crm-gc.vercel.app.** Feedback-Dialog (Schnellzugriff-Symbol in der Kopfzeile, erfasst die aktuelle Seite) + Seite „Hilfe & Feedback" (Liste, Status neu/in Arbeit/erledigt, Löschen). DB-Migration `feedback_tickets` live + verifiziert (4 Policies). tsc sauber · Vitest **98/98** (4 neue) · `next build` · Live-Routen ok. Offen: kurzer Sicht-Test durch den Nutzer.

> **Kurzfassung:** Nutzer melden **Fehler, Ideen oder Fragen** direkt aus der App. Jede Meldung wird als **Ticket** gespeichert (mit automatisch erfasster Seite als Kontext) und auf einer **„Hilfe & Feedback"-Seite** gesammelt — mit Status (neu / in Arbeit / erledigt), damit sie nachverfolgt und abgearbeitet werden können. Dazu ein kurzer Hilfe-Text auf derselben Seite.

## Dependencies
- Requires: PROJ-1 (Auth) — Login-Pflicht; Ticket wird dem angemeldeten Nutzer zugeordnet

## User Stories
- Als Nutzer möchte ich einen Fehler oder eine Idee direkt aus der App melden, damit ich nicht extra eine E-Mail schreiben muss.
- Als Nutzer möchte ich, dass automatisch mitgespeichert wird, auf welcher Seite ich war, damit ein Fehler leichter nachvollziehbar ist.
- Als Geschäftsführer möchte ich alle Meldungen an einem Ort sehen und ihren Status pflegen (neu / in Arbeit / erledigt), damit nichts untergeht.
- Als Nutzer möchte ich eine kurze Hilfe/Anleitung finden, damit ich weiß, wie ich Support bekomme.
- Als Geschäftsführer möchte ich erledigte oder irrtümliche Tickets löschen können, damit die Liste aufgeräumt bleibt.

## Funktionsbeschreibung
- **Menüpunkt „Hilfe & Feedback"** (im Nutzer-Menü) → eigene Seite.
- **Feedback geben**: Knopf öffnet einen Dialog mit: **Art** (Fehler / Idee / Frage), **Beschreibung** (Pflicht). Die **aktuelle Seite** (Pfad) wird automatisch mitgespeichert.
- **Ticket-Liste** (neueste zuerst): Art, Beschreibung, Seite, wer, wann, **Status**.
- **Status ändern**: neu → in Arbeit → erledigt (per Auswahl).
- **Löschen** eines Tickets (mit Bestätigung).
- **Kurze Hilfe** oben auf der Seite (wie melde ich sinnvoll, was passiert mit meiner Meldung).
- Team-weit sichtbar (alle angemeldeten Nutzer sehen die Tickets).

## Out of Scope
- **Datei-/Screenshot-Anhang** an ein Ticket — MVP ist Text; Screenshots als spätere Ausbaustufe (Bild-Infrastruktur aus PROJ-15 wäre nutzbar).
- **E-Mail-Benachrichtigung** bei neuem Ticket / Antworten — spätere Phase (Cron/Mail).
- **Kommentare/Diskussion** an Tickets, Zuweisung an Personen, Prioritäten — MVP nur Status.
- **Öffentliche Wissensdatenbank / FAQ-Verwaltung** — nur ein kurzer statischer Hilfe-Text.
- **Rollen/Rechte** (nur GF darf Status ändern) — im Einzelnutzer-Start darf jeder Angemeldete pflegen.

## Acceptance Criteria

**Format:** Angenommen [Vorbedingung] / Wenn [Aktion] / Dann [Ergebnis]

- [ ] Angenommen der Nutzer ist angemeldet, wenn er „Hilfe & Feedback" öffnet, dann sieht er einen kurzen Hilfe-Text, einen „Feedback geben"-Knopf und die Ticket-Liste (bzw. einen Leer-Hinweis)
- [ ] Angenommen der Nutzer öffnet den Feedback-Dialog, wenn er eine Art wählt und eine Beschreibung eingibt und absendet, dann erscheint das Ticket in der Liste mit Status „neu" und der Seite, von der aus er es gemeldet hat
- [ ] Angenommen der Nutzer sendet ohne Beschreibung ab, wenn er auf „Absenden" klickt, dann wird ein Validierungshinweis gezeigt und nichts gespeichert
- [ ] Angenommen ein Ticket existiert, wenn der Nutzer den Status auf „in Arbeit" oder „erledigt" setzt, dann bleibt die Änderung erhalten (auch nach Neuladen)
- [ ] Angenommen ein Ticket existiert, wenn der Nutzer auf „Löschen" klickt, dann erscheint ein Bestätigungsdialog und erst nach Bestätigung ist das Ticket entfernt
- [ ] Angenommen der Nutzer ist nicht angemeldet, wenn er die Feedback-Seite aufruft, dann wird er zur Login-Seite umgeleitet

## Edge Cases
- **Sehr lange Beschreibung:** wird gespeichert (sinnvolle Obergrenze, z. B. 5.000 Zeichen) und in der Liste ggf. gekürzt dargestellt.
- **Netzwerkfehler beim Absenden:** Fehlermeldung, Eingabe bleibt im Dialog erhalten.
- **Ticket ohne erkennbare Seite** (direkt von der Feedback-Seite): Seite = „Hilfe & Feedback" bzw. der aktuelle Pfad.
- **Viele Tickets:** Liste neueste zuerst, mit sinnvollem Limit auf die Abfrage.
- **Zwei Nutzer ändern denselben Status:** zuletzt gespeicherter Wert gewinnt (kein Sperrmechanismus).

## Technical Requirements (optional)
- Login-Pflicht; Team-RLS wie bei Notizen; Eingaben serverseitig mit Zod validiert.
- Kein XSS: Beschreibung wird als reiner Text gespeichert und angezeigt (kein HTML).

## Open Questions
- [x] Auslieferung/Benachrichtigung → **gelöst:** MVP = In-App-Liste; E-Mail-Benachrichtigung später.
- [x] Screenshots → **gelöst:** MVP Text-only; Screenshot-Anhang spätere Ausbaustufe.

## Decision Log

### Product Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Arten: Fehler / Idee / Frage | Deckt die häufigen Meldungen ab, hilft beim Triagieren | 2026-07-13 |
| Status: neu / in Arbeit / erledigt | Einfacher, klarer Bearbeitungsfluss | 2026-07-13 |
| Aktuelle Seite automatisch mitspeichern | Erleichtert das Nachvollziehen von Fehlern | 2026-07-13 |
| Team-weit, jeder Angemeldete darf pflegen | Einzelnutzer-Start; Rollen später | 2026-07-13 |
| Text-only (kein Screenshot) im MVP | Schlank und zuverlässig; Bilder später | 2026-07-13 |
| Beschreibung als reiner Text (kein HTML) | Kein XSS-Risiko, keine Formatierung nötig | 2026-07-13 |

### Technical Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Neue Tabelle `feedback_tickets`, Team-RLS wie `notes` | Konsistent, erprobtes Muster | 2026-07-13 |
| Server-Aktionen mit Zod; Beschreibung als Text (React-escaped) | Pflichtprüfung serverseitig, kein XSS | 2026-07-13 |
| Aktuelle Seite über `usePathname()` im Dialog erfasst | Kein zusätzlicher Aufwand, zuverlässig | 2026-07-13 |
| Menüpunkt „Hilfe & Feedback" im Nutzer-Menü; eigene Seite `/feedback` | Konsistent mit Vorlagen/Einstellungen | 2026-07-13 |
| Keine neue Bibliothek | shadcn-Bausteine reichen | 2026-07-13 |

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)

### Überblick in einem Satz
Nutzer senden über einen Dialog ein Ticket (Art + Beschreibung + automatisch erfasste Seite), das in einer neuen Tabelle team-weit gespeichert und auf der Seite „Hilfe & Feedback" mit Status-Pflege und Löschen verwaltet wird.

### A) Was der Nutzer sieht
```
Nutzer-Menü → NEU: „Hilfe & Feedback" → Seite /feedback
Seite /feedback (nur angemeldet)
├── kurzer Hilfe-Text
├── Knopf „Feedback geben" → Dialog (Art: Fehler/Idee/Frage · Beschreibung · [Absenden])
└── Ticket-Liste (neueste zuerst)
    └── Art · Beschreibung · Seite · wer/wann · Status-Auswahl (neu/in Arbeit/erledigt) · [Löschen]
```

### B) Daten
**Neue Tabelle „feedback_tickets":** Kennung, Art (fehler/idee/frage), Beschreibung (Text), Seite (Pfad), Status (neu/in_arbeit/erledigt, Standard „neu"), wer erstellt hat, Zeitpunkte. Team-RLS wie Notizen.

### C) Was neu gebaut wird (knapp)
- **Datenschicht** `src/lib/feedback/` (Typen + Status/Art-Metadaten als reine, testbare Konstanten/Helfer; Zod; `getTickets`; Server-Aktionen `createTicket`, `updateTicketStatus`, `deleteTicket`).
- **Seite** `src/app/feedback/page.tsx` + Client-Komponente (Hilfe-Text, „Feedback geben"-Dialog, Liste mit Status/Löschen).
- **Menüpunkt** „Hilfe & Feedback" im Nutzer-Menü.
- **Datenbank-Migration** (Tabelle + RLS).

### D) Sicherheit
- Login-Pflicht; Team-RLS; Zod-Validierung; Beschreibung als reiner Text (kein HTML → kein XSS).

### E) Zusätzliche Pakete
**Keine.**

## QA Test Results
_Formaler /qa-Durchlauf ausstehend. Verifiziert: Vitest 98/98 (4 neu: Art/Status-Labels), tsc sauber, `next build`, DB (Tabelle + 4 Policies), Live-Routen. Ausstehend: authentifizierter End-to-End-Test (Feedback absenden, Status ändern, löschen)._

## Deployment

### Deploy 2026-07-13
- **Live:** https://crm-gc.vercel.app — Vercel-Projekt `ewgeni-s-projects/crm-gc`
- **Datenbank:** Migration `proj14_feedback_tickets` angewandt + verifiziert (Tabelle `feedback_tickets`, 4 Policies, Team-RLS).
- **Keine neuen Umgebungs-Variablen.**
- **Post-Deploy-Checks:** `/feedback` login-geschützt (307 → /login); `/login` 200 — keine Regression.
- **Offen:** manueller Smoke-Test durch den Nutzer (Feedback absenden → in Liste → Status ändern → löschen).
