# PROJ-12: Auswertungen/Dashboard

## Status: Deployed
**Created:** 2026-07-13
**Last Updated:** 2026-07-13

> **Stand 2026-07-13:** **Live auf https://crm-gc.vercel.app.** Eigene Seite „Dashboard" (Nutzer-Menü) mit Kennzahlen-Karten und Pipeline-Übersicht pro Phase. Keine neue Datenbank (live aus Kunden + Aktivitäten berechnet). tsc sauber · Vitest **104/104** (6 neue) · `next build` · Live-Routen ok.

> **Kurzfassung:** Eine Übersichtsseite mit den wichtigsten Zahlen: monatlicher Pipeline-Wert, Kundenanzahl, gewonnene/verlorene Aufträge, fällige Aktivitäten — plus eine Aufschlüsselung der Pipeline **pro Phase** (Anzahl + Wert je Phase als Balken).

## Dependencies
- Requires: PROJ-1 (Auth), PROJ-2 (Pipeline/Kunden mit Phase + monatlichem Wert)
- Nutzt: PROJ-5 (Aktivitäten) für die Kennzahl „fällige Aktivitäten"

## User Stories
- Als Geschäftsführer möchte ich auf einen Blick den monatlichen Wert meiner aktiven Pipeline sehen, damit ich mein Geschäft einschätze.
- Als Geschäftsführer möchte ich sehen, wie sich meine Aufträge auf die Phasen verteilen, damit ich Engpässe erkenne.
- Als Geschäftsführer möchte ich die Zahl gewonnener/verlorener Aufträge sehen, damit ich meinen Erfolg verfolge.
- Als Geschäftsführer möchte ich sehen, wie viele Aktivitäten fällig sind, damit ich weiß, was ansteht.

## Funktionsbeschreibung
- **Menüpunkt „Dashboard"** (im Nutzer-Menü) → eigene Seite.
- **Kennzahlen-Karten:** Pipeline-Wert/Monat (aktive Phasen), Kunden gesamt, Gewonnen (+ Verloren als Hinweis), Fällige Aktivitäten (+ offene gesamt).
- **Pipeline nach Phase:** je Phase Anzahl Kunden + Summe monatlicher Wert, als proportionaler Balken (Phasenfarbe wie im Board).
- Link zurück zum Pipeline-Board.

## Out of Scope
- **Zeitverläufe/Historie** (Entwicklung über Wochen/Monate) — bräuchte Verlaufsdaten; spätere Ausbaustufe.
- **Frei konfigurierbare Diagramme / Export** (CSV/PDF) — MVP zeigt feste, sinnvolle Kennzahlen.
- **Filter nach Zeitraum/Nutzer/Kategorie** — MVP zeigt den Gesamtstand.
- **Umsatzprognosen / Gewichtung nach Phase** — nur der eingetragene monatliche Wert.
- **Diagramm-Bibliothek** — Balken werden schlank mit Bordmitteln dargestellt.

## Acceptance Criteria

**Format:** Angenommen [Vorbedingung] / Wenn [Aktion] / Dann [Ergebnis]

- [ ] Angenommen der Nutzer ist angemeldet, wenn er „Dashboard" öffnet, dann sieht er die Kennzahlen-Karten und die Pipeline-Aufschlüsselung pro Phase
- [ ] Angenommen es gibt Kunden mit monatlichem Wert in aktiven Phasen, wenn das Dashboard geladen wird, dann zeigt „Pipeline-Wert/Monat" deren Summe (ohne gewonnen/verloren)
- [ ] Angenommen es gibt fällige (überfällige/heutige) offene Aktivitäten, wenn das Dashboard geladen wird, dann zeigt die Kennzahl deren Anzahl
- [ ] Angenommen es gibt noch keine Kunden, wenn das Dashboard geladen wird, dann werden alle Zahlen als 0 angezeigt (kein Fehler)
- [ ] Angenommen der Nutzer ist nicht angemeldet, wenn er das Dashboard aufruft, dann wird er zur Login-Seite umgeleitet

## Edge Cases
- **Keine Kunden/Aktivitäten:** alle Kennzahlen 0, Balken leer, kein Fehler.
- **Kunde ohne monatlichen Wert:** zählt bei der Anzahl, trägt 0 zum Wert bei.
- **Alle Kunden in einer Phase:** Balken dieser Phase 100 %, übrige leer.
- **Sehr große Beträge:** mit Tausenderpunkt formatiert (z. B. „1.250 €").

## Technical Requirements (optional)
- Login-Pflicht. Keine neue Tabelle — Kennzahlen live aus `customers` (Phase, monatlicher Wert) und offenen Aktivitäten berechnet.
- Aggregation als reine, testbare Funktion.

## Open Questions
- [x] Welche Kennzahlen? → **gelöst (Standard):** Pipeline-Wert/Monat, Kunden gesamt, Gewonnen/Verloren, fällige Aktivitäten + Pipeline pro Phase. Weitere (Zeitverlauf, Filter) später.

## Decision Log

### Product Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Feste, naheliegende Kennzahlen (kein Konfigurator) | Sofort nützlicher Überblick; schlank | 2026-07-13 |
| Pipeline-Wert nur aus aktiven Phasen (ohne gewonnen/verloren) | Zeigt das noch offene Geschäft | 2026-07-13 |
| Balken statt Diagramm-Bibliothek | Kein zusätzliches Paket; genügt für den Überblick | 2026-07-13 |

### Technical Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Reine `buildDashboard()` in `src/lib/dashboard/data.ts` + Tests | Kennzahlen isoliert testbar | 2026-07-13 |
| Serverseitig aus `getCustomers()` + `getOpenActivities()` berechnet | Bestehende Datenschicht, keine neue Infrastruktur | 2026-07-13 |
| Dashboard als reine (Server-)Komponente | Nur Anzeige, keine Interaktion nötig | 2026-07-13 |
| Menüpunkt „Dashboard" im Nutzer-Menü | Konsistent; Startseite bleibt das Board | 2026-07-13 |

---

## Tech Design (Solution Architect)

### Überblick
Serverseitig werden Kunden (Phase + monatlicher Wert) und offene Aktivitäten geladen und mit einer reinen `buildDashboard()`-Funktion zu Kennzahlen + Phasen-Statistik aggregiert; die Dashboard-Seite zeigt Karten + Balken. Keine neue Tabelle, keine Bibliothek.

### Was neu gebaut wurde
- `src/lib/dashboard/data.ts` — `buildDashboard()` (Kennzahlen + `perStage`), `formatEuro()` + Unit-Tests (6).
- `src/components/dashboard/dashboard-view.tsx` — Karten + Pipeline-Balken (Server-Komponente).
- `src/app/dashboard/page.tsx` — lädt Daten, rendert Ansicht.
- Menüpunkt „Dashboard" im Nutzer-Menü.

### Sicherheit
Login-Pflicht (AppShell). Nur Anzeige aggregierter, ohnehin sichtbarer Daten.

## QA Test Results
_Formaler /qa-Durchlauf ausstehend. Verifiziert: Vitest 104/104 (6 neu: `buildDashboard`/`formatEuro`), tsc sauber, `next build`, Live-Routen. Ausstehend: authentifizierter Sicht-Test (Zahlen plausibel, Balken korrekt)._

## Deployment

### Deploy 2026-07-13
- **Live:** https://crm-gc.vercel.app — Vercel-Projekt `ewgeni-s-projects/crm-gc`
- **Keine Datenbank-Änderung, keine neuen Umgebungs-Variablen.**
- **Post-Deploy-Checks:** `/dashboard` login-geschützt (307 → /login); `/login` 200 — keine Regression.
- **Offen:** kurzer Sicht-Test durch den Nutzer.
