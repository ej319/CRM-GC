# PROJ-7: E-Mail-Versand aus der Kundenakte (Gmail)

## Status: In Progress
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
- [ ] **Token-Verschlüsselung:** reicht die Standard-Verschlüsselung von Supabase „at rest", oder Supabase Vault für die Gmail-Token? → /backend
- [ ] **`googleapis` vs. direkte REST-Aufrufe** (Bündelgröße/Aufwand) → /backend entscheidet final.

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
| Eigener Gmail-OAuth-Flow getrennt vom Supabase-Login (Scope `gmail.send` + Refresh-Token) | Login liefert nur Identität; serverseitiges Senden braucht offline-Zugriff | 2026-06-23 |
| Zugriffs-/Refresh-Token nur serverseitig (Supabase, RLS; Versand via Server-Aktion) | Sicherheit — Token nie im Browser | 2026-06-23 |
| Versand über die Gmail-API im Namen des Postfachs | Erscheint in Gmail „Gesendet"; offizielle Anbindung (PRD) | 2026-06-23 |
| `googleapis`-Bibliothek für Versand + Token-Refresh | Bewährt, übernimmt Refresh + Nachrichtenbau; weniger Eigenfehler | 2026-06-23 |
| Anhänge im Supabase Storage + Metadaten in der DB | Standard, Bytes für den Versand verfügbar | 2026-06-23 |
| Öffnungs-Tracking über unsichtbaren Pixel + öffentliche Erfassungs-Route | Einziger praktikabler Weg ohne tiefe Integration; DSGVO-Vorbehalt | 2026-06-23 |
| Erste echte API-Routen der App (OAuth-Callback, Tracking-Pixel) | OAuth-Rückkehr und Pixel-Abruf brauchen Server-Endpunkte (keine Server-Action) | 2026-06-23 |
| Nur Scope `gmail.send` in v1 | Minimalprinzip; Lese-Scope erst beim späteren Empfangs-Sync | 2026-06-23 |
| Neue Umgebungs-Variablen für den Gmail-OAuth-Client | Eigener Google-Client nötig; vom Nutzer in Google Cloud anzulegen | 2026-06-23 |

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)

### Bausteine der Oberfläche & Abläufe
```
„Gmail verbinden" (einmalig)
├── Aktion im Nutzer-Menü/Einstellungen  ODER  Prompt im E-Mail-Reiter (wenn nicht verbunden)
└── → Google-Zustimmungsseite (Sende-Berechtigung) → Rückkehr ins CRM → Verbindung serverseitig gespeichert

Kundenakte „/kunde/[id]" → Anlege-Leiste → Reiter „E-Mail"
├── nicht verbunden:  Hinweis + Button „Gmail verbinden"
└── verbunden:  Schreibfenster
      ├── Von:    verbundenes Postfach (fest)
      ├── An:     aus der Kunden-E-Mail vorbelegt (änderbar)   [optional CC/BCC]
      ├── Betreff
      ├── Text mit einfacher Formatierung (HTML-Mail)
      ├── Anhänge (Dateien hinzufügen)
      └── [Senden] → über Gmail versendet

Verlauf → Reiter „E-Mails":  gesendete E-Mails
      └── Empfänger · Betreff · Zeit · Anhänge · „geöffnet am …" / „noch nicht geöffnet"
```

### Datenmodell (in Klartext)
- **Gmail-Verbindung** (eine Zeile, geteiltes Team-Postfach): verbundene Adresse, Zugriffs-/Refresh-Token (**nur serverseitig**, verschlüsselt), Ablaufzeit. Grundlage fürs Senden.
- **Gesendete E-Mails** (neue Tabelle): Verweis auf den Kunden, Empfänger (+ optional CC), Betreff, Text (HTML), Absender, Sendezeitpunkt, Gmail-Nachrichten-ID, Tracking-Kennung, „geöffnet am" (leer = noch nicht), Anhang-Infos.
- **Anhänge**: Datei im **Supabase Storage** + Metadaten (Name, Größe) am E-Mail-Eintrag.
- Speicherort: Supabase (PostgreSQL + Storage), geschützt per Row Level Security.

### Wie das Senden funktioniert
- Der Versand läuft über die **Gmail-API im Namen deines verbundenen Postfachs** (eine Server-Aktion baut die E-Mail inkl. Anhänge zusammen und sendet sie). Dadurch landet die Mail **automatisch in deinem Gmail „Gesendet"**.
- Läuft der Zugriff ab, wird er automatisch über den Refresh-Token erneuert; klappt das nicht, erscheint „Gmail neu verbinden".

### Öffnungs-Tracking
- Beim Senden wird ein **unsichtbarer 1×1-Pixel** mit eindeutiger Kennung in die HTML-Mail eingebettet. Öffnet der Empfänger die Mail und lädt Bilder, ruft sein Programm den Pixel ab → eine kleine **öffentliche Route** hält „geöffnet am" fest.
- **Vorbehalt:** funktioniert nur, wenn Bilder geladen werden (sonst „noch nicht geöffnet"); **DSGVO** beachten (siehe offene Fragen).

### Tech-Entscheidungen (warum)
- **Eigener Gmail-OAuth-Flow, getrennt vom Login:** Der Supabase-Google-Login liefert nur die Identität. Fürs serverseitige Senden brauchen wir eine **eigene Google-Zustimmung mit Sende-Berechtigung** und einen Refresh-Token, den wir sicher speichern.
- **Token nur serverseitig** (verschlüsselt, Versand über Server-Aktion) — nie im Browser.
- **Versand über Gmail-API** statt eigenem Mailserver: „offizielle Google-Anbindung" (PRD), erscheint im echten Postfach.
- **Bewährte Google-Bibliothek** (`googleapis`) für Versand + Token-Erneuerung — weniger Eigenfehler.
- **Anhänge im Supabase Storage**, Metadaten in der DB.
- **Neue API-Routen** (Erstes Mal in der App): Gmail-Verbindungs-Rückkehr (OAuth-Callback) und die Tracking-Pixel-Route — beides reine Server-Endpunkte.

### Einmalige Einrichtung durch den Nutzer (Voraussetzung fürs Backend)
- In der **Google Cloud Console**: Gmail-API aktivieren, OAuth-Zustimmungsbildschirm anlegen, **Sende-Berechtigung (`gmail.send`)** hinzufügen, einen **OAuth-Client** erstellen (Client-ID + Secret), die **Rückkehr-Adresse** (Vercel-Domain) eintragen und dich als **Testnutzer** hinzufügen.
- **Neue Umgebungs-Variablen** (in Vercel/`.env.local`): Gmail-OAuth-Client-ID + -Secret. (Der Agent kann `.env`-Dateien nicht schreiben — ich sage dir genau, was reinkommt.)

### Abhängigkeiten (zu installieren)
- `googleapis` (Gmail-Versand + Token-Erneuerung). Evtl. ein kleiner MIME-Helfer zum Zusammenbauen der Nachricht mit Anhängen.

## Implementation Notes

### Frontend (2026-06-23)
Das **E-Mail-Schreibfenster als Vorschau** ist gebaut — die Oberfläche steht, der echte Versand kommt mit dem Backend (Gmail-Anbindung).

- **Neue Komponente** `src/components/detail/email-composer.tsx` (`EmailComposer`):
  - Felder: **Von** (statisch: „dein verbundenes Gmail-Postfach"), **An** (mit der Kundenadresse vorbelegt — die zentrale Anforderung), **Betreff**, **Text** (mehrzeilig) und **Anhänge** (Datei-Auswahl → entfernbare Chips mit Dateiname).
  - „Senden"-Button ist deaktiviert, solange kein Empfänger eingetragen ist.
  - Ein Hinweis-Banner („Vorschau") erklärt, dass „Gmail verbinden", der echte Versand und die Text-Formatierung mit dem Backend aktiviert werden.
  - Schnittstelle nach außen: `onSend(draft)` (Entwurf = `{ to, subject, body, attachments }`) gibt `true` bei Erfolg zurück → dann werden Betreff/Text/Anhänge geleert. Diese Schnittstelle bleibt im Backend gleich; dort wird der Vorschau-Stub durch die echte Gmail-Server-Action ersetzt.
- **`src/components/detail/detail-composer.tsx`**: Der „E-Mail"-Reiter zeigt jetzt den `EmailComposer` statt des Platzhalters (`customerEmail` + `onSendEmail` durchgereicht).
- **`src/components/pipeline/customer-detail.tsx`**: reicht `customer.email` an den Composer durch; `onSendEmail` ist im Vorschau-Modus ein Stub, der einen Hinweis-Toast zeigt („E-Mail-Versand wird mit der Gmail-Anbindung aktiviert (Backend).") und `false` zurückgibt (Felder bleiben erhalten).
- Verwendete shadcn-Bausteine: Alert, Button, Input, Label, Textarea. Keine neue Abhängigkeit nötig.
- Verifikation: `tsc --noEmit` sauber, `npm test` 37/37 grün.

**Noch offen fürs Backend:** Gmail-OAuth-Verbindung + Token (server-seitig), echte Versand-Server-Action, Speichern der gesendeten Mail im Verlauf, Öffnungs-Tracking (DSGVO-Entscheidung), Versand in „Gesendet". Voraussetzung: Google-Cloud-Einrichtung durch den Nutzer (siehe „Einmalige Einrichtung").

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
