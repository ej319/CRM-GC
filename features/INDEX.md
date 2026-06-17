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
| PROJ-1 | Supabase Infrastruktur & Auth | P0 | None | Approved | PROJ-1-supabase-infrastruktur-auth.md | 2026-06-16 |
| PROJ-2 | Pipeline-basierte Kunden- und Auftragsverwaltung (Kanban, Drag-and-Drop) | P0 | PROJ-1 | Roadmap | | |
| PROJ-3 | Excel-Import mit Spaltenzuordnung | P0 | PROJ-1, PROJ-2 | Roadmap | | |
| PROJ-4 | Kunden-/Auftrags-Detailansicht mit komplettem Verlauf | P0 | PROJ-2 | Roadmap | | |
| PROJ-5 | Aktivitätenplanung und Aktivitätenliste | P0 | PROJ-1, PROJ-2 | Roadmap | | |
| PROJ-6 | Notizen am Kunden/Auftrag | P0 | PROJ-2 | Roadmap | | |
| PROJ-7 | E-Mail-Versand und Gmail-Postfach-Sync (voll) | P0 | PROJ-1, PROJ-2 | Roadmap | | |
| PROJ-8 | Click-to-Call über Placetel | P0 | PROJ-2, PROJ-4 | Roadmap | | |
| PROJ-9 | E-Mail-Vorlagen | P1 | PROJ-7 | Roadmap | | |
| PROJ-10 | Pipeline-Automatik-Regeln | P1 | PROJ-2, PROJ-5, PROJ-7 | Roadmap | | |
| PROJ-11 | Erinnerungen/Benachrichtigungen für Aktivitäten | P2 | PROJ-5 | Roadmap | | |
| PROJ-12 | Auswertungen/Dashboard | P2 | PROJ-2 | Roadmap | | |
| PROJ-13 | Dateien/Angebote anhängen | P2 | PROJ-2 | Roadmap | | |

## Recommended Build Order
PROJ-1 → PROJ-2 → PROJ-3 → PROJ-6 → PROJ-5 → PROJ-4 → PROJ-8 → PROJ-7 → PROJ-9 → PROJ-10 → PROJ-11 → PROJ-12 → PROJ-13

## Next Available ID: PROJ-14
