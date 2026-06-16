# PROJ-1: Supabase Infrastruktur & Auth

## Status: In Progress
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
| Supabase Auth übernimmt Google-Login | Keine eigene Passwort-Verwaltung/-Sicherung nötig; sicherster und einfachster Weg | 2026-06-16 |
| Allowlist-Prüfung nach erfolgreicher Google-Anmeldung | E-Mail wird gegen die Allowlist-Tabelle geprüft; nicht gelistet → sofort abmelden + Meldung | 2026-06-16 |
| Row Level Security auf allen Tabellen | Datenbank gibt nur an angemeldete, berechtigte Nutzer Daten heraus | 2026-06-16 |
| Secrets ausschließlich in Umgebungsvariablen | Keine Zugangsschlüssel im Code | 2026-06-16 |
| Pakete `@supabase/supabase-js` + `@supabase/ssr` | Verbindung zu Supabase und zuverlässiger Login in Next.js (Server + Browser) | 2026-06-16 |
| Nutzerprofil-Tabelle getrennt von Supabase-Auth-Daten | Anmelde-Geheimnisse verwaltet Supabase Auth selbst; wir speichern nur Profil-Stammdaten | 2026-06-16 |

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)

### Bausteine der Oberfläche
```
CRM-App  (alles hinter dem Login)
│
├── Login-Seite  (einziger ohne Anmeldung sichtbarer Bereich)
│     └── Button „Mit Google anmelden"
│
├── Anmelde-Wächter  (prüft pro Seite: angemeldet? freigeschaltet?)
│
└── Grund-Gerüst nach dem Login
      ├── Obere Leiste mit Nutzer-Menü  →  „Abmelden"
      └── Start-/Platzhalter-Bereich  (wird später die Pipeline, PROJ-2)
```
Zusätzlich: zentrale Hinweis-/Fehleranzeige (z. B. „Zugang nicht freigeschaltet", „Google nicht erreichbar").

### Datenmodell (in Klartext)
**Nutzerprofile** – pro angemeldetem Nutzer: eindeutige Kennung, Name, E-Mail, Profilfoto (von Google), Datum der ersten Anmeldung.
**Erlaubte Adressen (Allowlist)** – E-Mail-Adresse + Freischaltungsdatum. Aktuell nur die Adresse des Geschäftsführers.
Die Anmelde-Geheimnisse selbst verwaltet Supabase Auth; sie liegen nicht in diesen Tabellen.

Speicherort: Supabase (PostgreSQL).

### Tech-Entscheidungen (warum)
- **Supabase Auth mit Google:** keine eigene Passwortverwaltung; sicher und schnell; passt zur späteren Gmail-Anbindung (PROJ-7).
- **Allowlist-Prüfung nach der Anmeldung:** nur freigeschaltete E-Mails dürfen rein, alle anderen werden sofort abgemeldet.
- **Row Level Security:** Schutzwall in der Datenbank – nur berechtigte Nutzer erhalten Daten.
- **Umgebungsvariablen für Geheimnisse:** Zugangsschlüssel liegen nie im Code.

### Abhängigkeiten (zu installieren)
- `@supabase/supabase-js` – Verbindung zur Supabase-Datenbank und -Auth.
- `@supabase/ssr` – sorgt dafür, dass der Login in Next.js (Server + Browser) zuverlässig funktioniert.

### Einmalige Einrichtung (Setup)
- **Supabase-Projekt:** Es wird das bereits bestehende Projekt **„ej319's Project"** verwendet (Organisation `qykwpepzummfeisstkro`, Projekt-Ref `yuvybadqfenrhmyaudun`, Region `eu-central-1`/Frankfurt). Kein neues Projekt nötig.
- Vor dem ersten Tabellen-Anlegen in `/backend` kurz prüfen, dass das Projekt leer ist (keine vorhandenen Tabellen/Daten überschreiben).
- Umgebungsvariablen (Projekt-URL + Anon-Key) eintragen.
- In der Google-Cloud die Google-Anmeldung (OAuth) freischalten und mit Supabase verbinden.
- Supabase-Client in [src/lib/supabase.ts](../src/lib/supabase.ts) aktivieren (aktuell nur Platzhalter).

## Frontend-Implementierung (Stand 2026-06-16)
- **Login-Seite `/login`:** Pipedrive-Look, zentrierte Karte mit Button „Mit Google anmelden" (vierfarbiges Google-Icon). Der Button zeigt aktuell einen Hinweis-Toast; die echte Supabase-Google-Anmeldung folgt in `/backend`.
- **Grund-Gerüst (`AppShell`):** obere Leiste mit Logo + Nutzer-Menü (Avatar-Dropdown mit „Abmelden"). Abmelden zeigt aktuell einen Hinweis-Toast; echte Abmeldung folgt in `/backend`.
- **Startseite `/`:** Platzhalter-Dashboard mit Hinweis „Pipeline kommt in PROJ-2".
- **Design:** Akzentfarbe auf Pipedrive-Grün gesetzt (`--primary: 151 65% 29%` in `globals.css`).
- **Neue Dateien:** `src/components/google-icon.tsx`, `login-card.tsx`, `user-menu.tsx`, `app-shell.tsx`; `src/app/login/page.tsx`. **Geändert:** `src/app/layout.tsx` (Toaster, Sprache de), `src/app/page.tsx`, `src/app/globals.css`.
- **Verifikation:** `npm run build` erfolgreich (Routen `/` und `/login`).
- **Offen für `/backend`:** Supabase-Client aktivieren + Umgebungsvariablen, Google-OAuth, Allowlist-Prüfung, Route-Schutz (nicht angemeldet → `/login`), echte Session in `AppShell`/`UserMenu`, echte Abmeldung. Den Platzhalter-Nutzer in `AppShell` durch die echte Session ersetzen.

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
