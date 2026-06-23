# PROJ-7: E-Mail-Versand aus der Kundenakte (Gmail)

## Status: Planned
**Created:** 2026-06-23
**Last Updated:** 2026-06-23

> **Umfang dieser Spec:** v1 = **Senden** aus der Kundenakte über Gmail. Das **Empfangen / Postfach-Sync** (eingehende E-Mails automatisch beim Kunden) ist eine **spätere Phase** der E-Mail-Funktion und hier bewusst Out of Scope.

## Dependencies
- Requires: PROJ-1 (Supabase Infrastruktur & Auth) — Login + sichere Token-Speicherung
- Requires: PROJ-2 (Pipeline) — E-Mail-Adresse am Kunden
- Requires: PROJ-4 (Detailansicht/Verlauf) — „E-Mail"-Reiter in der Anlege-Leiste + Verlauf-Reiter „E-Mails" (Platzhalter, den PROJ-7 füllt)
- Verwandt / baut darauf auf: PROJ-9 (E-Mail-Vorlagen: Vorlage wählen, „Feld einfügen"/Platzhalter, Vorlagen-Verwaltung, Vorlagen-Anhänge)

## User Stories
- Als Vertriebsnutzer möchte ich mein Gmail-Postfach (gc-facility.de) einmal mit dem CRM verbinden, damit ich E-Mails direkt aus dem CRM senden kann.
- Als Vertriebsnutzer möchte ich in der Kundenakte über den „E-Mail"-Reiter schreiben, wobei die **Adresse des Kunden bereits eingetragen** ist, damit ich ohne Tippen losschreiben kann.
- Als Vertriebsnutzer möchte ich Betreff + formatierten Text schreiben und **Dateien anhängen**, damit ich vollwertige E-Mails (z.B. mit Angebot) versende.
- Als Vertriebsnutzer möchte ich die gesendete E-Mail anschließend **im Verlauf des Kunden** sehen, damit der Kontaktverlauf vollständig ist.
- Als Vertriebsnutzer möchte ich sehen, **ob eine gesendete E-Mail geöffnet wurde**, damit ich weiß, ob der Kunde sie gelesen hat.
- Als Vertriebsnutzer möchte ich, dass gesendete E-Mails auch in meinem **Gmail-Postfach („Gesendet")** erscheinen, damit alles konsistent an einem Ort liegt.

## Out of Scope
- **Vorlagen, „Feld einfügen" (Platzhalter/Mailmerge), Vorlagen-Verwaltung und Vorlagen-Anhänge** → PROJ-9 (E-Mail-Vorlagen).
- **Empfangen / Postfach-Sync** (eingehende & extern gesendete E-Mails automatisch beim passenden Kunden) → spätere Phase der E-Mail-Funktion (eigener Schritt nach PROJ-7).
- **Meetingplaner** und **Sequenzen/automatische Abfolgen** → nicht Teil (Sequenzen ~ PROJ-10).
- **Signatur-Verwaltung** → später (offene Frage).
- **Mehrere/Team-Postfächer** → ein verbundenes Postfach jetzt; pro-Nutzer-Postfächer später (Mehrnutzer).
- Datei-Anhänge nutzen ähnliche Technik wie PROJ-13, hier aber ausschließlich für den E-Mail-Versand.

## Acceptance Criteria

**Format:** Angenommen [Vorbedingung] / Wenn [Aktion] / Dann [Ergebnis]

- [ ] Angenommen ich habe noch kein Gmail verbunden, wenn ich den „E-Mail"-Reiter öffne, dann sehe ich eine Aufforderung „Gmail verbinden" statt des Schreibfensters.
- [ ] Angenommen ich verbinde mein Gmail erfolgreich, wenn ich danach den „E-Mail"-Reiter öffne, dann kann ich schreiben und senden (Von = mein verbundenes Postfach).
- [ ] Angenommen der Kunde hat eine E-Mail-Adresse, wenn ich den „E-Mail"-Reiter öffne, dann ist diese Adresse im Feld „An" bereits eingetragen und änderbar.
- [ ] Angenommen ich schreibe Betreff + Text (mit einfacher Formatierung), wenn ich auf „Senden" klicke, dann wird die E-Mail über mein Gmail versendet.
- [ ] Angenommen ich hänge eine oder mehrere Dateien an, wenn ich sende, dann erhält der Empfänger die E-Mail mit diesen Anhängen.
- [ ] Angenommen ich habe keinen (gültigen) Empfänger eingetragen, wenn ich auf „Senden" klicke, dann erscheint ein Hinweis und es wird nicht gesendet.
- [ ] Angenommen die E-Mail wurde gesendet, wenn ich den Verlauf des Kunden ansehe (Reiter „E-Mails" / „Alle"), dann erscheint sie als Eintrag mit Empfänger, Betreff, Text, Zeit und Anhängen.
- [ ] Angenommen eine gesendete E-Mail wird vom Empfänger geöffnet, wenn ich den Verlauf-Eintrag ansehe, dann wird „geöffnet am …" angezeigt (sofern der Empfänger Bilder lädt).
- [ ] Angenommen die E-Mail wurde gesendet, wenn ich in mein Gmail schaue, dann liegt sie dort im Ordner „Gesendet".
- [ ] Angenommen das Senden schlägt fehl (Verbindung abgelaufen/Netzwerk/Gmail-Fehler), wenn ich sende, dann erscheint eine Fehlermeldung und mein Entwurf bleibt erhalten; bei abgelaufener Verbindung werde ich zum erneuten Verbinden aufgefordert.
- [ ] Angenommen ich bin nicht angemeldet, wenn ich die Kundenakte/E-Mail öffne, dann werde ich zur Login-Seite geleitet.

## Edge Cases
- Gmail nicht verbunden / Verbindung widerrufen → „Gmail verbinden"-Aufforderung; Senden gesperrt.
- Kein E-Mail-Feld am Kunden → „An" leer, manuell eintragen; ungültige Adresse → Hinweis, kein Versand.
- Zugriffsberechtigung/Token abgelaufen → Aufforderung zum erneuten Verbinden; Entwurf bleibt erhalten.
- Anhang über dem Gmail-Limit (~25 MB) → Hinweis, kein Versand.
- Öffnungs-Tracking: Empfänger lädt keine Bilder / Mail-Programm blockt Bilder → Öffnung wird nicht erfasst (zeigt „noch nicht geöffnet", obwohl evtl. gelesen) — bekannte Unzuverlässigkeit.
- Mehrere Empfänger / CC → alle werden gespeichert; das Tracking gilt pro E-Mail (nicht pro einzelnem Empfänger).
- Netzwerkfehler beim Hochladen eines Anhangs → Hinweis; Versand erst nach erfolgreichem Anhang.
- Sehr langer/komplexer HTML-Text → wird korrekt gesendet und im Verlauf lesbar dargestellt.

## Technical Requirements (optional)
- **Offizielle Google-Anbindung:** Versand über die Gmail-API mit Sende-Berechtigung (OAuth). Der Zugriffs-/Refresh-Token wird **ausschließlich serverseitig** (verschlüsselt in Supabase) gespeichert, **nie im Browser**. Versand läuft über eine Server-Aktion.
- **Google-Einrichtung:** Gmail-API aktivieren, OAuth-Consent + Sende-Scope. Für den internen Einzelnutzer reicht zunächst der „Testing"-Modus; eine Google-App-Verifizierung wird erst bei breiterer Nutzung nötig (siehe offene Fragen).
- **Anhänge:** Upload (z.B. Supabase Storage), als echter Gmail-Anhang mitgesendet; Größenlimit beachten.
- **Öffnungs-Tracking:** unsichtbarer Zähl-Pixel pro gesendeter E-Mail + eine Endpunkt-Route, die das Öffnen festhält. **DSGVO-Vorbehalt** (siehe offene Fragen).
- Sicherheit: Zugriff nur für angemeldete Nutzer; RLS auf den neuen E-Mail-Tabellen; geteilte Team-Daten.

## Open Questions
- [ ] **Öffnungs-Tracking & DSGVO:** Tracking per Pixel ist in DE rechtlich heikel. Brauchen wir einen Hinweis (Footer)/Einwilligung, akzeptierst du das Risiko für B2B-Mails, oder soll es abschaltbar sein? → vor dem Bauen klären.
- [ ] **CC/BCC** im MVP enthalten? (Vorschlag: ja, optional ein-/ausklappbar.)
- [ ] **Signatur** (aus Gmail übernommen oder im CRM hinterlegt) im MVP? (Vorschlag: später.)
- [ ] **„Gmail verbinden"** wo anbieten — Nutzer-Menü/Einstellungen und/oder Prompt im E-Mail-Reiter? (Vorschlag: beides.)
- [ ] **Google-OAuth-Verifizierung:** Aufwand/Abhängigkeit klären, falls über den internen Nutzer hinaus genutzt (sensible Scopes).
- [ ] **Betreff Pflicht?** (Vorschlag: leeren Betreff mit Rückfrage erlauben.)

## Decision Log

### Product Decisions
<!-- Added by /write-spec -->
| Decision | Rationale | Date |
|----------|-----------|------|
| v1 = Senden; Empfangen/Postfach-Sync später (eigener Schritt) | Nutzerwunsch „Erst Senden"; hält das große Feature machbar | 2026-06-23 |
| Empfänger automatisch aus der Kunden-E-Mail vorbelegt (änderbar) | Schnelles Schreiben ohne Tippen (ausdrücklich „ganz wichtig") | 2026-06-23 |
| Formatierter (HTML-)Text statt reinem Text | Entspricht der Pipedrive-Ansicht/Erwartung; E-Mails sind i.d.R. HTML | 2026-06-23 |
| Datei-Anhänge in v1 enthalten | Nutzer-Auswahl; z.B. Angebote mitsenden | 2026-06-23 |
| Öffnungs-Tracking (Zähl-Pixel) in v1 enthalten | Nutzer-Auswahl; mit DSGVO-/Zuverlässigkeits-Vorbehalt (offene Frage) | 2026-06-23 |
| Vorlagen, „Feld einfügen", Vorlagen-Verwaltung/-Anhänge → PROJ-9 | Eigene Funktion laut Roadmap; baut auf PROJ-7 auf | 2026-06-23 |
| Meetingplaner / Sequenzen raus | Nicht benötigt / andere Features (PROJ-10) | 2026-06-23 |
| Ein verbundenes Postfach (gc-facility.de), Token nur serverseitig | Einzelnutzer jetzt; pro-Nutzer später; Token nie im Browser | 2026-06-23 |
| Versand über Gmail-API (erscheint in Gmail „Gesendet") | „Offizielle Google-Anbindung", Konsistenz mit dem echten Postfach | 2026-06-23 |

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
