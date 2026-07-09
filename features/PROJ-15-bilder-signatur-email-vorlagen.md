# PROJ-15: Bilder & Signatur in E-Mail-Vorlagen

## Status: Planned
**Created:** 2026-07-08
**Last Updated:** 2026-07-08

> **Kurzfassung:** Zwei zusammengehörige Bild-Funktionen für E-Mails, die sich dasselbe technische Fundament teilen (Bilder hochladen, optimieren und **fest in die Mail einbetten**, damit sie beim Empfänger — auch in Outlook — sofort sichtbar sind):
> 1. **Persönliche Signatur** (pro Nutzer) mit Logo, die automatisch (abschaltbar) unten in jede Mail eingesetzt wird.
> 2. **Bilder frei im Vorlagentext** — beim Erstellen einer Vorlage lassen sich Bilder an beliebiger Stelle einfügen (z. B. Produktfoto).

## Dependencies
- Requires: PROJ-9 (E-Mail-Vorlagen) — Bilder im Vorlagentext bauen auf dem Vorlagen-Editor auf
- Requires: PROJ-7 (E-Mail-Versand Gmail) — die eingebetteten Bilder müssen beim Versand mitgeschickt werden; der HTML-Sicherheitsfilter (`sanitizeEmailHtml`) muss kontrolliert erweitert werden
- Requires: PROJ-1 (Auth) — Signatur ist pro Nutzer; Login-Pflicht

## User Stories
- Als Vertriebsnutzer möchte ich einmal eine persönliche Signatur mit Firmenlogo anlegen, damit sie automatisch unter jeder E-Mail steht, ohne dass ich sie jedes Mal tippe.
- Als Vertriebsnutzer möchte ich die Signatur für eine einzelne Mail weglassen können (z. B. bei kurzen Antworten), damit ich flexibel bleibe.
- Als Vertriebsnutzer möchte ich in einer E-Mail-Vorlage Bilder an beliebiger Stelle einfügen (z. B. ein Produktfoto), damit meine Mails professioneller wirken.
- Als Vertriebsnutzer möchte ich, dass meine Bilder beim Empfänger zuverlässig angezeigt werden — auch in Outlook —, damit Logo und Bilder nicht als leere Kästchen ankommen.
- Als späteres Teammitglied möchte ich meine eigene Signatur (eigener Name, eigene Durchwahl) mit demselben Firmenlogo haben, damit jede Person korrekt unterschreibt.

## Funktionsbeschreibung

### Teil A — Persönliche Signatur
- Neue Seite **„Einstellungen"** (Menüpunkt im Profil-Menü oben rechts), pro Nutzer.
- Signatur-Editor: formatierter Text (wie im Vorlagen-Editor) **plus Bild** (Logo) — mehrere Bilder erlaubt.
- Die Signatur wird beim Öffnen des E-Mail-Schreibfensters **automatisch unten eingefügt**, mit einem **Schalter „Signatur anhängen"** (an/aus) pro Mail.
- Änderungen an der Signatur wirken sich auf künftige Mails aus, nicht auf bereits gesendete.

### Teil B — Bilder im Vorlagentext
- Im Vorlagen-Editor (PROJ-9) ein neuer **Bild-Knopf** in der Formatierungsleiste: Bild hochladen → wird an der Cursor-Stelle eingefügt.
- Beim Einfügen der Vorlage in eine Mail wandern die Bilder — wie schon die Anhänge — als eigene, eingebettete Kopien mit.

### Gemeinsames Fundament (beide Teile)
- **Bilder werden fest in die Mail eingebettet** (mitgeschickt, nicht per Link von einem Server nachgeladen) → sofort sichtbar in gängigen Postfächern inkl. Outlook, ohne „Bilder anzeigen"-Klick.
- **Nur selbst hochgeladene Bilder** — kein Einfügen fremder Bild-Links aus dem Web (Sicherheit).
- **Automatische Optimierung:** erlaubte Formate JPG, PNG, GIF; zu große Bilder werden automatisch verkleinert; Größenlimit pro Bild (~2 MB nach Optimierung).
- Das bestehende **Öffnungs-Tracking** (unsichtbarer Pixel aus PROJ-7) bleibt unverändert; es ist von den Inhaltsbildern getrennt.

## Out of Scope
- **Bilder in Notizen** — hier geht es nur um E-Mails.
- **Fremde Bild-Links aus dem Web einfügen** (Hotlinking) — aus Sicherheitsgründen nur selbst hochgeladene Bilder.
- **SVG-Bilder** — aus Sicherheitsgründen ausgeschlossen (können Skripte enthalten); nur Pixel-Formate (JPG/PNG/GIF).
- **Bild-Bearbeitung** (Zuschneiden, Drehen, Textumfluss, freie Positionierung) — Bilder werden einfach an der Cursor-Stelle inline eingefügt; nur automatisches Verkleinern.
- **Mehrere Signaturen pro Nutzer / Signatur-Vorlagen** — genau eine Signatur pro Nutzer.
- **Signatur team-weit teilen** — Signatur ist bewusst persönlich (nur das Logo ist faktisch für alle gleich, wird aber je Signatur hochgeladen).
- **Weitere persönliche Einstellungen** auf der neuen „Einstellungen"-Seite — vorerst nur die Signatur (die Seite ist aber so gedacht, dass später mehr dazukommt).

## Acceptance Criteria

**Format:** Angenommen [Vorbedingung] / Wenn [Aktion] / Dann [Ergebnis]

**Signatur**
- [ ] Angenommen der Nutzer ist angemeldet, wenn er die Seite „Einstellungen" öffnet, dann kann er eine Signatur mit formatiertem Text und mindestens einem Bild anlegen und speichern
- [ ] Angenommen eine Signatur ist gespeichert, wenn der Nutzer in einer Kundenakte das E-Mail-Schreibfenster öffnet, dann ist die Signatur unten bereits eingefügt und der Schalter „Signatur anhängen" steht auf an
- [ ] Angenommen die Signatur ist automatisch eingefügt, wenn der Nutzer den Schalter „Signatur anhängen" ausschaltet, dann verschwindet die Signatur aus dem Entwurf
- [ ] Angenommen der Nutzer hat noch keine Signatur, wenn er das Schreibfenster öffnet, dann wird keine Signatur eingefügt und es erscheint kein Fehler
- [ ] Angenommen der Nutzer sendet eine Mail mit Signatur, wenn der Empfänger die Mail in Outlook öffnet, dann ist das Logo sofort sichtbar (kein „Bilder anzeigen"-Klick nötig)

**Bilder im Vorlagentext**
- [ ] Angenommen der Nutzer bearbeitet eine Vorlage, wenn er über den Bild-Knopf ein Bild hochlädt, dann erscheint es an der Cursor-Stelle im Vorlagentext
- [ ] Angenommen eine Vorlage enthält ein Bild, wenn der Nutzer sie in eine Mail einfügt und sendet, dann kommt das Bild beim Empfänger eingebettet an (sichtbar in gängigen Postfächern)

**Bild-Grenzen & Validierung**
- [ ] Angenommen der Nutzer lädt ein sehr großes Bild hoch, wenn es die Maße überschreitet, dann wird es automatisch verkleinert und ohne Fehler eingefügt
- [ ] Angenommen der Nutzer lädt eine nicht unterstützte Datei hoch (z. B. SVG oder PDF), wenn er es versucht, dann erscheint ein Hinweis und das Bild wird nicht eingefügt
- [ ] Angenommen ein Bild überschreitet auch nach Optimierung das Größenlimit, wenn der Nutzer es hochlädt, dann erscheint ein Hinweis und es wird nicht eingefügt

## Edge Cases
- **Riesiges Handy-Foto:** wird automatisch auf sinnvolle Breite verkleinert; erst wenn es danach noch zu groß ist, Hinweis + Ablehnung.
- **Nicht unterstütztes Format (SVG, BMP, HEIC, PDF):** Hinweis, kein Einfügen.
- **Mail-Gesamtgröße nahe 25 MB** (mehrere eingebettete Bilder + Anhänge): Hinweis vor dem Senden, dass die Mail zu groß wird.
- **Signatur wird geändert, während eine Mail offen im Entwurf ist:** der offene Entwurf behält die alte Signatur (Signatur gehört ab Einfügen zur Mail).
- **Bild wird aus der Signatur/Vorlage gelöscht, das noch in einer offenen Mail steckt:** die bereits eingebettete Kopie in der offenen/gesendeten Mail bleibt erhalten.
- **Empfänger-Postfach blockiert trotzdem Bilder** (sehr strenge Einstellung): selten bei eingebetteten Bildern; als dokumentierter Vorbehalt akzeptiert.
- **Signatur doppelt:** Schalter aus/wieder an darf die Signatur nicht zweimal einfügen.
- **Zwei Nutzer:** Signaturen sind pro Nutzer getrennt (kein Konflikt); Vorlagen-Bilder sind team-weit sichtbar.

## Technical Requirements (optional)
- Bilder werden **eingebettet** verschickt (inline, mit der Mail mitgeschickt), nicht per externem Link — Ziel: zuverlässige Anzeige inkl. Outlook.
- Der HTML-Sicherheitsfilter (`sanitizeEmailHtml`) wird **kontrolliert** erweitert: Bilder nur aus eigener, vertrauenswürdiger Quelle (eigene Uploads/eingebettet), keine fremden URLs, keine Skripte/Event-Handler, kein SVG.
- Bild-Optimierung (Verkleinern, Format/Größe prüfen) serverseitig zuverlässig.
- Login-Pflicht; Signatur pro Nutzer über Zugriffsschutz getrennt; Vorlagen-Bilder team-weit wie die Vorlagen selbst.

## Open Questions
- [ ] Reihenfolge der Umsetzung: erst Signatur (Teil A), dann Bilder im Text (Teil B) — oder beides zusammen? (Empfehlung: Signatur zuerst, da häufigster Nutzen; im /architecture-Schritt entscheiden.)
- [ ] Genaue Maß-/Größen-Grenzen (max. Breite in Pixeln, max. MB pro Bild) — im /architecture-Schritt festlegen.
- [ ] Soll die Signatur auch bei reinen „Antwort"-Mails automatisch kommen? (Aktuell gibt es nur Neu-Mails aus der Kundenakte — daher vorerst kein Sonderfall.)

## Decision Log

### Product Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Umfang: Signatur UND Bilder im Text | Nutzerentscheidung („beides"); teilen sich dasselbe Bild-Fundament | 2026-07-08 |
| Signatur pro Nutzer (nicht team-weit) | Jeder sendet aus eigenem Postfach und unterschreibt mit eigenem Namen | 2026-07-08 |
| Signatur automatisch einfügen, pro Mail abschaltbar | Bequem und trotzdem flexibel (kurze/interne Mails ohne Signatur) | 2026-07-08 |
| Bilder fest eingebettet statt per Server-Link nachladen | Zuverlässige Anzeige beim Empfänger, auch in Outlook (kein „Bilder anzeigen"-Klick) | 2026-07-08 |
| Nur selbst hochgeladene Bilder, kein Web-Hotlinking, kein SVG | Sicherheit: keine fremden Inhalte, keine Skripte über Bilder | 2026-07-08 |
| Automatische Bild-Optimierung + Größenlimit (~2 MB/Bild) | Mails bleiben schnell und unter Gmails 25-MB-Grenze; kein Nutzer-Aufwand | 2026-07-08 |
| Eigene „Einstellungen"-Seite für die Signatur | Trennt Persönliches (Signatur) sauber von team-weiten Vorlagen; ausbaubar | 2026-07-08 |

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
