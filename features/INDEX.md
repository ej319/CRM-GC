# Feature Index

> Central tracking for all features. Updated by skills automatically.

## Status Legend
- **Roadmap** - `/init` done, feature identified in feature map, no spec file yet
- **Planned** - `/write-spec` done, full spec written, architecture not yet designed
- **Architected** - `/architecture` done, tech design approved, ready to build
- **In Progress** - `/frontend` or `/backend` active or completed, not yet in QA
- **In Review** - `/qa` active, testing in progress
- **Approved** - `/qa` passed, no critical/high bugs, ready to deploy
- **Deployed** - `/deploy` done, live in production

## Features

| ID | Feature | Priority | Dependencies | Status | Spec | Created |
|----|---------|----------|--------------|--------|------|---------|
| PROJ-1 | Supabase Infrastruktur & Auth | P0 | None | Deployed | PROJ-1-supabase-infrastruktur-auth.md | 2026-06-16 |
| PROJ-2 | Pipeline-basierte Kundenverwaltung (Kanban, Drag-and-Drop) | P0 | PROJ-1 | Deployed | PROJ-2-pipeline-kundenverwaltung.md | 2026-06-17 |
| PROJ-3 | Excel-Import mit Spaltenzuordnung | P0 | PROJ-1, PROJ-2 | Deployed | PROJ-3-excel-import-spaltenzuordnung.md | 2026-06-19 |
| PROJ-4 | Kunden-/Auftrags-Detailansicht mit komplettem Verlauf (inkl. Notizen) | P0 | PROJ-2 | Deployed | PROJ-4-detailansicht-verlauf.md | 2026-06-22 |
| PROJ-5 | Aktivitätenplanung und Aktivitätenliste | P0 | PROJ-1, PROJ-2, PROJ-4 | Deployed | PROJ-5-aktivitaeten.md | 2026-06-22 |
| PROJ-6 | Notizen am Kunden/Auftrag — geht in PROJ-4 auf | P0 | PROJ-4 | Merged → PROJ-4 | (siehe PROJ-4) | |
| PROJ-7 | E-Mail-Versand aus der Kundenakte (Gmail) — v1: Senden, Postfach-Sync später | P0 | PROJ-1, PROJ-2, PROJ-4 | Deployed | PROJ-7-email-versand-gmail.md | 2026-06-23 |
| PROJ-8 | Click-to-Call über Placetel | P0 | PROJ-2, PROJ-4 | Deployed | PROJ-8-click-to-call-placetel.md | 2026-06-23 |
| PROJ-9 | E-Mail-Vorlagen | P1 | PROJ-7 | Deployed | PROJ-9-email-vorlagen.md | 2026-07-07 |
| PROJ-10 | Pipeline-Automatik-Regeln | P1 | PROJ-2, PROJ-5, PROJ-7 | Roadmap | | |
| PROJ-11 | Erinnerungen/Benachrichtigungen für Aktivitäten | P2 | PROJ-5 | Architected | PROJ-11-erinnerungen-aktivitaeten.md | 2026-07-13 |
| PROJ-12 | Auswertungen/Dashboard | P2 | PROJ-2 | Roadmap | | |
| PROJ-13 | Dateien/Angebote anhängen | P2 | PROJ-2, PROJ-4, PROJ-7 | Deployed | PROJ-13-dateien-anhaengen.md | 2026-07-12 |
| PROJ-14 | In-App-Hilfe & Feedback/Ticket-System (Nutzer/Mitarbeiter melden Fehler & Ideen; Claude triagiert als Support und setzt als Entwickler um) | P1 | PROJ-1 | Roadmap | | 2026-06-25 |
| PROJ-15 | Bilder/Signatur in E-Mail-Vorlagen | P2 | PROJ-9 | Deployed | PROJ-15-bilder-signatur-email-vorlagen.md | 2026-07-08 |

## Recommended Build Order
PROJ-1 → PROJ-2 → PROJ-3 → PROJ-4 (inkl. Notizen/PROJ-6) → PROJ-5 → PROJ-8 → PROJ-7 → PROJ-9 → PROJ-10 → PROJ-11 → PROJ-12 → PROJ-13

## Next Available ID: PROJ-16
