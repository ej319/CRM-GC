# PROJ-15: Bilder & Signatur in E-Mail-Vorlagen

## Status: Deployed
**Created:** 2026-07-08
**Last Updated:** 2026-07-12

> **Offen / geparkt (2026-07-12):** Logo/Bild in der Signatur klappt beim Nutzer noch nicht end-to-end. Belegt per DB: Text-Signatur speichert/versendet einwandfrei; ein Bild wurde bisher nur **einmal** hochgeladen (11:03, `logo.gif`) und landete nicht im gespeicherten Signatur-HTML. Vermutete Hauptursache: Nutzer fügt ein **aus Gmail kopiertes Bild** ein (Strg+V), das **keine echte Bilddatei** in der Zwischenablage enthält → kein Upload. Umgesetzte Verbesserungen (live): Paste-to-Upload, robuste DOM-Einfügung mit gemerkter Cursor-Position (`lastRange`) für Bild-Knopf/Platzhalter/Paste, absolute Bildadressen im Filter/Helfer erlaubt, `image/*`-Auswahl, sichtbare Upload-Toasts, prominenter Knopf **„Logo / Bild einfügen"** (Nutzer bestätigt: Knopf ist sichtbar → neue Version wird ausgeliefert). **Nächster Schritt beim Wiederaufgreifen:** Nutzer den Knopf „Logo / Bild einfügen" mit einer **Datei** (nicht Kopieren) nutzen lassen und die erscheinende Toast-Meldung auswerten (lokalisiert die Stelle eindeutig). Vom Nutzer bewusst vorerst zurückgestellt.

> **Stand 2026-07-10:** **Live auf https://crm-gc.vercel.app** (beide Phasen: Signatur + Bilder im Vorlagentext). Migration angewandt (Tabelle `user_signatures` mit Nutzer-eigener RLS, privater Bucket `email-images`; per SQL verifiziert, Advisor ohne neue Warnung). Verifiziert: tsc sauber · Vitest **82/82** · `next build` · Live-Routen-Checks (Einstellungen & Bild-Route login-geschützt, keine Regression). **Offen: manueller End-to-End-Test** (Signatur mit Logo anlegen → Mail senden → Logo im Empfänger-Postfach sichtbar).

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
- [x] Genaue Maß-/Größen-Grenzen → **gelöst in /architecture:** Bilder werden beim Hochladen automatisch auf **max. 1000 px Breite** verkleinert; **max. ~2 MB pro Bild** nach Optimierung; **Mail-Gesamtgröße ~20 MB** (sicher unter Gmails 25-MB-Grenze) → sonst Hinweis vor dem Senden.
- [x] Signatur bei „Antwort"-Mails → **gelöst:** entfällt vorerst; es gibt nur Neu-Mails aus der Kundenakte, kein Sonderfall.
- [x] Reihenfolge → **gelöst:** zwei Phasen (Signatur zuerst, dann Bilder im Vorlagentext).

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
| Umsetzung in **2 Phasen**: Phase 1 Signatur, Phase 2 Bilder im Vorlagentext | Beide nutzen dasselbe Bild-Fundament (Upload, Optimierung, Einbetten); Signatur zuerst = schneller sichtbarer Nutzen, kleinere erste Auslieferung | 2026-07-09 |
| Bilder **beim Hochladen im Browser** verkleinern/optimieren (max. 1000 px Breite, Ziel < 2 MB) statt serverseitig | Keine neue schwere Server-Bibliothek nötig; entlastet den Server; Ergebnis liegt direkt sende-fertig im Speicher | 2026-07-09 |
| Bilder in **eigenem privaten Speicher-Bereich** ablegen; in App/Editor über eine **login-geschützte Bild-Adresse** anzeigen | Bilder bleiben privat (nie öffentlich); Editor kann sie trotzdem zeigen | 2026-07-09 |
| Beim **Senden** die Bilder aus dem Text herauslesen und **fest in die Mail einbetten** (Technik: „multipart/related" mit `cid:`-Verweisen) | Die zuverlässige Anzeige inkl. Outlook; baut auf dem bestehenden Nachrichten-Bau (`mime.ts`) auf | 2026-07-09 |
| Signatur in **eigener Tabelle pro Nutzer** (genau eine je Nutzer) + Signatur-Bilder im privaten Bereich | Signatur ist persönlich; sauber getrennt von team-weiten Vorlagen | 2026-07-09 |
| Sicherheitsfilter (`sanitizeEmailHtml`) **kontrolliert erweitern**: `<img>` nur mit Verweis auf **eigene** Bilder erlaubt, keine fremden URLs, kein SVG, keine Skripte | Bilder ermöglichen, ohne ein neues XSS-/Tracking-Einfallstor zu öffnen | 2026-07-09 |
| Formatierungs-Editor um **Bild-Knopf** erweitern (auf dem bestehenden `RichTextEditor` aufbauen) | Wiederverwendung; derselbe Editor dient Vorlagen und Signatur | 2026-07-09 |
| **Keine neue externe Bibliothek** nötig (Browser-Bordmittel fürs Verkleinern, bestehendes `sanitize-html`, bestehender MIME-Bau) | Schlank, wartungsarm, konsistent | 2026-07-09 |

---

## Implementation Notes

### Frontend + Backend (2026-07-09) — beide Phasen
Datenschicht/Logik zuerst mit Tests, dann UI; der Live-Versand blieb rückwärtskompatibel.

**Bild-Fundament (gemeinsam):**
- `src/lib/email/images.ts` — reine Helfer: App-Bildadresse bauen, Bild-Verweise im HTML finden (`extractImagePaths`), auf `cid:` umschreiben (`rewriteImagesToCid`), Größen-Mathe (`fitWidth`) + Konstanten (Formate, 1000 px, ~2 MB). Mit `images.test.ts` (8 Tests).
- `src/lib/email/optimize-image.ts` (Browser) — verkleinert JPG/PNG per Canvas, GIF bleibt unverändert; Format-Prüfung.
- `src/lib/email/upload-image.ts` (Browser) — optimiert + lädt in den Bucket `email-images` und liefert die App-Adresse.
- `src/app/api/email/image/[key]/route.ts` — login-geschützte Anzeige der privaten Bilder.
- `sanitize.ts` — `<img>` nur mit eigener Quelle (App-Route oder `cid:`) erlaubt; kein SVG, keine fremden URLs (+2 Tests).
- `mime.ts` — neuer `multipart/related`-Zweig für eingebettete Bilder (`InlineImage`, `Content-ID`); bestehende Pfade unverändert (+3 Tests, alte grün).
- `email/actions.ts` `sendEmail` — lädt die Bilder aus dem HTML, bettet sie ein (cid), Größen-Gesamtprüfung (~22 MB). Im Verlauf gespeicherter Text behält die App-Bildadressen.

**Phase 1 — Signatur:**
- `src/lib/signature/{data,queries,actions}.ts` — eine Signatur pro Nutzer; `saveSignature` bereinigt mit `sanitizeEmailHtml`.
- `src/app/einstellungen/page.tsx` + `src/components/settings/signature-editor.tsx` — Signatur-Editor (Formatierung + Bild-Knopf).
- `src/components/detail/editor-image-button.tsx` — wiederverwendbarer Bild-Knopf (Upload + Einfügen).
- `rich-text-editor.tsx` — um `insertHtml` erweitert (rückwärtskompatibel).
- `email-composer.tsx` — Schalter „Signatur anhängen" (Standard an, wenn Signatur vorhanden) + Vorschau; Signatur wird beim Senden ans Ende gesetzt.
- Menüpunkt „Einstellungen"; Signatur wird über `kunde/[id]/page.tsx` → CustomerDetail → DetailComposer → Composer durchgereicht.

**Phase 2 — Bilder im Vorlagentext:**
- `template-editor-dialog.tsx` — derselbe Bild-Knopf in der Formatierungsleiste. Beim Senden werden die Bilder (wie in der Signatur) eingebettet.

**Datenbank:** Migration `supabase/migrations/proj15_signatur_bilder.sql` (Tabelle `user_signatures` mit Nutzer-eigener RLS + privater Bucket `email-images` + Policies). **Noch nicht live angewandt.**

**Verifikation:** tsc sauber · Vitest **82/82** · `next build` (neue Routen erzeugt).

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)

### Überblick in einem Satz
PROJ-15 fügt ein gemeinsames **Bild-Fundament** hinzu (Bilder privat hochladen → im Browser optimieren → beim Senden fest in die Mail einbetten) und nutzt es an zwei Stellen: einer **persönlichen Signatur** (neue „Einstellungen"-Seite) und **Bildern im Vorlagentext** (Bild-Knopf im Vorlagen-Editor).

### Reihenfolge: zwei Phasen
- **Phase 1 — Signatur:** neue „Einstellungen"-Seite, Signatur-Editor mit Bild, automatisches (abschaltbares) Einfügen im Schreibfenster, Einbetten beim Senden. Bringt sofort sichtbaren Nutzen.
- **Phase 2 — Bilder im Vorlagentext:** Bild-Knopf im Vorlagen-Editor; die Bilder reisen beim Einfügen der Vorlage mit. Nutzt exakt dasselbe Fundament aus Phase 1.

### A) Was der Nutzer sieht (Baumstruktur)

```
Nutzer-Menü (oben rechts)
└── NEU: „Einstellungen"  →  Einstellungen-Seite

Einstellungen-Seite  (/einstellungen, nur angemeldet)          [Phase 1]
└── Bereich „E-Mail-Signatur"
    ├── Formatierungs-Editor (Text) + Bild-Knopf (Logo hochladen)
    ├── Vorschau der Signatur
    └── [Speichern]

E-Mail-Schreibfenster (Kundenakte → „E-Mail")                  [Phase 1]
├── NEU: Schalter „Signatur anhängen" (an/aus)
└── Signatur erscheint automatisch unten im Text (wenn Schalter an)

Vorlagen-Editor (aus PROJ-9)                                    [Phase 2]
└── Formatierungsleiste: NEU: Bild-Knopf → Bild an Cursor-Stelle einfügen
```

### B) Welche Informationen gespeichert werden (in einfachen Worten)

**Neue Tabelle „Signatur" (eine pro Nutzer):** formatierter Text (HTML) + Verweise auf die Signatur-Bilder + Zeitstempel. Nur der eigene Nutzer sieht/ändert sie.

**Bilder:** liegen in einem **neuen privaten Speicher-Bereich** (getrennt von den Datei-Anhängen). Jedes Bild: Name, Typ, Größe, Speicherort. Vorlagen-Bilder gehören zur Vorlage (team-weit, wie PROJ-9), Signatur-Bilder zur Signatur (pro Nutzer).

**Nichts liegt nur im Browser** — alles in der Supabase-Datenbank + Storage, wie im ganzen Projekt.

### C) Wie ein Bild seinen Weg nimmt (der knifflige Teil, einfach erklärt)

1. **Hochladen:** Beim Einfügen wählt der Nutzer ein Bild. Der Browser **verkleinert es sofort** (max. 1000 px Breite) und prüft Format (JPG/PNG/GIF) und Größe. Danach landet es im privaten Speicher-Bereich.
2. **Anzeigen in der App:** Im Editor und in der Vorschau wird das Bild über eine **login-geschützte Adresse** angezeigt — es bleibt also privat, ist aber sichtbar.
3. **Senden:** Kurz vor dem Versand liest das System die Bilder aus dem Text, **packt sie fest in die Mail** (nicht als Datei-Anhang, sondern „inline" im Text) und ersetzt die App-Adresse durch einen internen Mail-Verweis. Ergebnis: Der Empfänger sieht die Bilder sofort — auch in Outlook.
4. **Unabhängigkeit:** Wie bei den Anhängen aus PROJ-9 bekommt jede gesendete Mail ihre eigene eingebettete Kopie. Das spätere Ändern/Löschen einer Signatur oder Vorlage berührt bereits gesendete Mails nicht.

### D) Was neu gebaut wird (Entwickler-Sicht, knapp)
- **Bild-Fundament:** Browser-Optimierung (Verkleinern/Prüfen), privater Storage-Bereich, login-geschützte Bild-Anzeige-Route, Einbett-Logik beim Senden (Erweiterung von `mime.ts` auf „multipart/related" + `cid:`-Verweise).
- **Sicherheitsfilter** (`sanitizeEmailHtml`) kontrolliert um `<img>` erweitern (nur eigene Bilder, kein SVG, keine fremden URLs).
- **Phase 1:** „Einstellungen"-Seite + Signatur-Editor + Datenschicht/Server-Aktionen für die Signatur; Schalter + Auto-Einfügen im `EmailComposer`; Menüpunkt.
- **Phase 2:** Bild-Knopf im `RichTextEditor`/Vorlagen-Editor; Vorlagen-Bilder beim Einfügen mitnehmen.
- **Datenbank-Migration** (Signatur-Tabelle + neuer privater Storage-Bereich) — über die Supabase-Anbindung, mit Nutzer-Freigabe wie bei PROJ-9.

### E) Sicherheit
- Login-Pflicht überall; Signatur pro Nutzer über Zugriffsschutz getrennt.
- Nur **selbst hochgeladene** Bilder; kein Einfügen fremder Web-Bilder; **kein SVG** (Skript-Gefahr).
- Der HTML-Filter bleibt die Schutz-Garantie und wird nur eng kontrolliert geöffnet.

### F) Zusätzliche Pakete
**Keine.** Browser-Bordmittel fürs Verkleinern, bestehendes `sanitize-html`, bestehender MIME-Bau reichen aus.

## QA Test Results
_Formaler /qa-Durchlauf ausstehend. Bisher verifiziert: Vitest 82/82 (13 neu: Bild-Fundament, Filter-Bildregeln, MIME-related), tsc sauber, `next build`, DB-Verifikation per SQL (Tabelle, RLS, Bucket, Policies), Sicherheits-Advisor ohne neue Warnung, Live-Routen-Checks. Rückwärtskompatibilität des Versands durch unveränderte MIME-Tests abgesichert. Ausstehend: authentifizierter End-to-End-Test (Signatur mit Logo → senden → Empfänger sieht Logo; Bild in Vorlage → senden)._

## Deployment

### Deploy 2026-07-10
- **Live:** https://crm-gc.vercel.app — Vercel-Projekt `ewgeni-s-projects/crm-gc`
- **Datenbank:** Migrationen `proj15_user_signatures` + `proj15_email_images_bucket` angewandt (nach Nutzer-Freigabe). Verifiziert: Tabelle `user_signatures` (4 Policies, RLS je Nutzer), Bucket `email-images` (privat, 3 Policies). Advisor ohne neue Warnung.
- **Keine neuen Umgebungs-Variablen** nötig.
- **Post-Deploy-Checks (curl):** `/einstellungen` → 307 `/login`; private Bild-Route `/api/email/image/…` → 307 `/login` (nicht öffentlich); `/vorlagen` weiter geschützt; Tracking-Pixel weiter öffentlich (`200 image/gif`); `/login` 200 — keine Regression.
- **Rückwärtskompatibilität:** Der bestehende Versand-Weg ist unverändert, solange keine Bilder im HTML sind (neuer `multipart/related`-Zweig greift nur bei eingebetteten Bildern; alte MIME-Tests unverändert grün).
- **Offen:** manueller Smoke-Test durch den Nutzer (Signatur mit Logo anlegen, Mail an sich selbst senden, Logo-Anzeige im Empfänger-Postfach prüfen; optional ein Bild in einer Vorlage).
