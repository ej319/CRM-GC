# Product Requirements Document

## Vision
Ein schlankes, persönliches CRM für die G+C Facility GmbH, das die Kernfunktionen von Pipedrive nachbildet: pipelinebasierte Verwaltung von Kunden und Aufträgen, eine Kunden-Detailansicht mit komplettem Verlauf (Notizen, Aktivitäten, E-Mails), Aktivitätenplanung, volle Gmail-Anbindung und Click-to-Call über Placetel. Das System startet schlank für einen einzelnen Nutzer, ist aber von Anfang an technisch so aufgebaut, dass später Mitarbeiter mit eigenem Login dazukommen können.

## Target Users
Zunächst der Geschäftsführer der G+C Facility GmbH als alleiniger Vertriebsnutzer, später ein kleines Vertriebsteam.
- Schnelle Übersicht über alle Interessenten und laufenden Aufträge in einer Pipeline.
- Aufträge per Drag-and-Drop oder per Klick durch die Phasen bewegen.
- Pro Kunde an einem Ort den kompletten Verlauf sehen: Notizen, Aktivitäten und E-Mails.
- Aktivitäten (Anrufe, Termine, Aufgaben) planen und zentral nachverfolgen.
- Direkt aus der Kundenakte anrufen (Placetel) und E-Mails schreiben (Gmail).
- Bestehende Pipedrive-Daten per Excel-Import mit Spaltenzuordnung übernehmen.

## Core Features (Roadmap)

| Priority | Feature | Status |
|----------|---------|--------|
| P0 (MVP) | Supabase Infrastruktur & Auth | Planned |
| P0 (MVP) | Pipeline-basierte Kundenverwaltung (Kanban, Drag-and-Drop) | Planned |
| P0 (MVP) | Excel-Import mit Spaltenzuordnung | Planned |
| P0 (MVP) | Kunden-/Auftrags-Detailansicht mit komplettem Verlauf | Planned |
| P0 (MVP) | Aktivitätenplanung und Aktivitätenliste | Planned |
| P0 (MVP) | Notizen am Kunden/Auftrag | in PROJ-4 |
| P0 (MVP) | E-Mail-Versand und Gmail-Postfach-Sync (voll) | Planned (v1: Versand) |
| P0 (MVP) | Click-to-Call über Placetel | Planned |
| P1 | E-Mail-Vorlagen | Planned |
| P1 | Pipeline-Automatik-Regeln | Deployed |
| P2 | Erinnerungen/Benachrichtigungen für Aktivitäten | Deployed |
| P2 | Auswertungen/Dashboard | Deployed |
| P2 | Dateien/Angebote anhängen | Planned |

## Success Metrics
- Bestehende Pipedrive-Daten lassen sich per Excel-Import vollständig übernehmen.
- Ein Auftrag kann durch alle Pipeline-Phasen bewegt werden – per Drag-and-Drop und per Klick.
- In der Kunden-Detailansicht sind Notizen, Aktivitäten und E-Mails als einheitlicher Verlauf sichtbar.
- E-Mails lassen sich aus der Kundenakte senden, eingehende Antworten erscheinen automatisch beim richtigen Kunden.
- Ein Anruf lässt sich mit einem Klick aus der Kundenakte über Placetel starten.
- Das System unterstützt Authentifizierung und kann später weitere Nutzer aufnehmen.

## Constraints
- Backend: Supabase (PostgreSQL + Auth + Storage). Daten liegen dauerhaft in der Datenbank, nicht nur lokal im Browser.
- Mehrnutzer-fähig von Beginn an angelegt, im Start aber bewusst schlank für einen Nutzer.
- E-Mail-Anbindung läuft über Gmail / Google Workspace (offizielle Google-Anbindung), volle Zwei-Wege-Synchronisation. Dies ist die technisch aufwändigste Funktion und wird nach Pipeline und Detailansicht gebaut.
- Click-to-Call über die Placetel-Windows-App: klickbare Telefonnummer (`tel:`/`callto:`-Link), die Placetel zum Wählen nutzt. Tiefere Placetel-Schnittstellen-Anbindung erst später.
- Automatik-Regeln für die Pipeline kommen erst, nachdem Pipeline, Aktivitäten und E-Mail stehen.
- Design: Orientierung am Look von Pipedrive – siehe `docs/design-system.md`.

## Non-Goals
- Kein verkaufsfertiges Produkt für Dritte – ausschließlich für den internen Gebrauch der G+C Facility GmbH.
- Keine vollständige Pipedrive-Klonfunktionalität mit allen Erweiterungen.
- Keine native Mobile-App in der ersten Version.
- Keine umfassenden Workflow-Automatisierungen, Formeln oder komplexen Reporting-Dashboards im MVP.
- Kein E-Mail-Marketing-Workflow; nur CRM-basierte 1:1-E-Mail-Kommunikation und Sync.

---

Use `/write-spec` to create detailed feature specifications for each item in the roadmap above.
