# PROJ-1: Supabase Infrastruktur & Auth

## Status: Planned
**Created:** 2026-06-16
**Last Updated:** 2026-06-16

## Dependencies
- None

## User Stories
- As a Nutzer, I want to mich mit meinem Google-Konto anmelden so that ich kein zusätzliches Passwort verwalten muss.
- As a Geschäftsführer, I want to dass nur freigeschaltete Adressen Zugang haben so that keine Unbefugten meine Kundendaten sehen können.
- As a Nutzer, I want to nach dem Login direkt in meinem Arbeitsbereich landen so that ich sofort loslegen kann.
- As a Nutzer, I want to angemeldet bleiben, bis ich mich aktiv abmelde so that ich mich nicht ständig neu einloggen muss.
- As a Nutzer, I want to mich abmelden können so that an meinem PC niemand anderes auf die Daten zugreifen kann.

## Out of Scope
- Mitarbeiter-Selbstverwaltung (erlaubte Adressen per Oberfläche freischalten/entfernen) — eigene spätere Funktion, kommt erst, wenn regelmäßig mehrere Nutzer dazukommen.
- E-Mail-+-Passwort-Login — bewusst ausgeschlossen, ausschließlich Google-Login.
- Passwort-Zurücksetzen — entfällt, da kein eigenes Passwort verwaltet wird.
- Rollen- und Rechteverwaltung (Admin vs. normaler Nutzer) — später, wenn das Team wächst.
- Gmail-Postfach lesen/senden — separat in PROJ-7. Hier ausschließlich die *Anmeldung* via Google, kein Zugriff auf E-Mails.
- Pipeline-Ansicht selbst — PROJ-2. Nach dem Login wird zunächst ein einfacher Platzhalter-Startbereich angezeigt.

## Acceptance Criteria

**Format:** Angenommen [Vorbedingung] / Wenn [Aktion] / Dann [Ergebnis]

- [ ] Angenommen ich bin nicht angemeldet, wenn ich eine beliebige CRM-Seite öffne, dann werde ich auf die Login-Seite umgeleitet.
- [ ] Angenommen ich bin auf der Login-Seite, wenn ich auf „Mit Google anmelden" klicke und ein freigeschaltetes Konto auswähle, dann werde ich angemeldet und lande im Startbereich.
- [ ] Angenommen ich melde mich mit einem nicht freigeschalteten Google-Konto an, wenn die Anmeldung abgeschlossen wird, dann werde ich sofort wieder abgemeldet und sehe die verständliche Meldung „Dieser Zugang ist nicht freigeschaltet".
- [ ] Angenommen ich bin angemeldet, wenn ich den Browser schließe und das CRM später erneut öffne, dann bin ich weiterhin angemeldet.
- [ ] Angenommen ich bin angemeldet, wenn ich auf „Abmelden" klicke, dann werde ich abgemeldet und auf die Login-Seite geleitet.
- [ ] Angenommen Google oder die Datenbank sind gerade nicht erreichbar, wenn ich mich anmelden will, dann sehe ich eine Fehlermeldung und kann es erneut versuchen.
- [ ] Angenommen ein freigeschalteter Nutzer meldet sich zum ersten Mal an, wenn die Anmeldung erfolgreich ist, dann wird automatisch ein Nutzerprofil in der Datenbank angelegt.

## Edge Cases
- Was passiert, wenn ein nicht freigeschaltetes Google-Konto die Anmeldung durchläuft? → Sofortige Abmeldung, klare Meldung, Verbleib auf der Login-Seite.
- Was passiert, wenn der Nutzer das Google-Anmeldefenster abbricht/schließt? → Rückkehr zur Login-Seite, keine Daten gespeichert.
- Was passiert, wenn Google/Supabase während der Anmeldung nicht erreichbar ist? → Fehlermeldung, erneuter Versuch möglich.
- Was passiert, wenn die Sitzung nach sehr langer Zeit abläuft? → Beim nächsten Zugriff Umleitung zur Login-Seite.
- Was passiert beim direkten Aufruf einer geschützten Unterseite ohne Login? → Umleitung zur Login-Seite.

## Technical Requirements (optional)
- Security: Zugang ausschließlich für Adressen auf einer Allowlist (in der Datenbank gepflegt). Row Level Security auf allen Tabellen aktiviert. Zugangsdaten/Secrets ausschließlich über Umgebungsvariablen, nie im Code.
- Setup: Supabase-Projekt anlegen, Umgebungsvariablen (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) konfigurieren, Supabase-Client aktivieren ([src/lib/supabase.ts](../src/lib/supabase.ts) ist aktuell nur Platzhalter).
- Datenbank-Grundgerüst (Detail in /architecture): mindestens eine Tabelle für Nutzerprofile und eine Allowlist-Tabelle für erlaubte E-Mail-Adressen.
- Auth: Google OAuth über Supabase Auth.
- Session: bleibt bestehen, bis der Nutzer sich aktiv abmeldet.

## Open Questions
- [ ] Soll der Geschäftsführer eine Benachrichtigung erhalten, wenn ein nicht freigeschaltetes Konto eine Anmeldung versucht? (Vorschlag: vorerst nein)
- [ ] Bevorzugte Beschriftung/Position des „Abmelden"-Buttons (z. B. im Nutzer-Menü oben rechts) — final im /frontend festlegen.

## Decision Log

### Product Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Login mit Google statt E-Mail/Passwort | Firma nutzt Google Workspace; kein zusätzliches Passwort, passt zur späteren Gmail-Anbindung (PROJ-7) | 2026-06-16 |
| Zugang nur per Allowlist einzeln freigeschalteter Adressen | Volle Kontrolle darüber, wer Kundendaten sieht; rein interne Anwendung | 2026-06-16 |
| Allowlist vorerst manuell/technisch pflegen | Aktuell faktisch nur ein Nutzer; Selbstverwaltungs-Oberfläche lohnt erst bei mehreren Nutzern | 2026-06-16 |
| Gesamtes CRM hinter Login (keine öffentlichen Seiten) | Internes Werkzeug ohne öffentliche Inhalte | 2026-06-16 |
| Angemeldet bleiben bis zur aktiven Abmeldung | Komfort beim täglichen Einsatz am festen PC | 2026-06-16 |
| Nach Login zunächst Platzhalter-Startbereich | Pipeline (PROJ-2) existiert noch nicht; Landing wird später die Pipeline | 2026-06-16 |

### Technical Decisions
<!-- Added by /architecture -->
| Decision | Rationale | Date |
|----------|-----------|------|

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)
_To be added by /architecture_

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
