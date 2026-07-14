# PROJ-10: Pipeline-Automatik-Regeln

## Status: Deployed
**Created:** 2026-07-13
**Last Updated:** 2026-07-13

> **Stand 2026-07-13 (Phase 2 live):** **Automatik 1 gebaut und live.** Gmail-**Lesezugriff** (`gmail.readonly`) ergänzt; Mails mit dem eingestellten **Label** (Standard „CRM-Anfrage") werden ausgelesen → Kunde in **„Anfrage"** + **Notiz** (Mail-Text) + **Aktivität „Anruf" für heute**. Doppelte werden über `inbound_processed` verhindert. Geprüft wird **beim Öffnen des CRM** (serverseitig auf max. alle 5 Min. gedrosselt) und per **„Jetzt prüfen"**-Knopf auf der Automatik-Seite (dort auch das Label einstellbar). Statt Vercel-Cron bewusst gewählt, weil der Hobby-Tarif nur **einen Tages-Cron** erlaubt.
> **Wichtig – einmalige Nutzer-Aktion:** Der bestehende Gmail-Token hat nur Sende-Rechte. Der Nutzer muss **Gmail einmal neu verbinden** (und ggf. den Scope im Google-Cloud-Zustimmungsbildschirm ergänzen), sonst meldet die Seite „Gmail neu verbinden". Zusätzlich braucht es einen **Gmail-Filter**, der Anfrage-Mails mit dem Label versieht.
> tsc sauber · Vitest **117/117** (9 neue Parser-Tests) · `next build`.

> **Stand 2026-07-13 (Phase 1 live):** **Automatik 2** ist live auf https://crm-gc.vercel.app: Wird eine E-Mail mit der Vorlage **„Angebot"** gesendet, wandert der Kunde automatisch in die neue Phase **„Nachfassen"** und es entsteht eine Aktivität „Nachfassen" **2 Werktage** später. Neue Pipeline-Phasen **Angebotserstellung** + **Nachfassen** ergänzt. Eigene Seite **„Automatik"** (Nutzer-Menü) mit An/Aus je Regel. tsc sauber · Vitest **108/108** (4 neue) · `next build`.
> **Phase 2 (geplant): Automatik 1** — eingehende Anfrage-Mail → automatisch Lead. Braucht Gmail-**Lesezugriff** (neuer Scope + einmalige Google-Freigabe des Nutzers) + einen **zeitgesteuerten Prüf-Dienst** (Vercel Cron) + Parsing/Dedup. Regel ist als „geplant/aus" bereits sichtbar.

## Dependencies
- Requires: PROJ-2 (Pipeline/Phasen), PROJ-5 (Aktivitäten), PROJ-7 (E-Mail-Versand), PROJ-9 (E-Mail-Vorlagen)
- Phase 2 zusätzlich: eingehender Gmail-Sync (neuer Scope + Cron) — bisher nicht vorhanden

## User Stories
- Als Vertriebsnutzer möchte ich, dass nach dem Versand eines Angebots automatisch die nächste Phase + eine Nachfass-Aufgabe gesetzt werden, damit ich nichts vergesse.
- Als Vertriebsnutzer möchte ich, dass eingehende Anfrage-Mails automatisch als Lead mit Anruf-Aufgabe erfasst werden, damit ich schnell reagiere (Phase 2).
- Als Geschäftsführer möchte ich Automatiken zentral ein-/ausschalten und verstehen, was sie tun.

## Funktionsbeschreibung

### Automatik 2 — „Angebot verschickt → Nachfassen" (LIVE)
- Auslöser: eine E-Mail wird über die Vorlage **„Angebot"** geschrieben und gesendet.
- Wirkung: Kunde → Phase **„Nachfassen"**; neue Aktivität **„Nachfassen"** mit Fälligkeit **+2 Werktage** (Wochenende übersprungen). Nur wenn die Regel aktiv ist.
- Rückmeldung im Schreibfenster („Kunde nach 'Nachfassen' verschoben …").

### Pipeline-Phasen (angepasst)
- Neu: **Angebotserstellung** und **Nachfassen** (im Board + `pipeline_stages`). Reihenfolge: … Vor Ort Termin → Angebotserstellung → Nachfassen → … Gewonnen/Verloren.
- Der Wechsel nach „Angebotserstellung" bleibt **manuell** (per Board), wie gewünscht.

### Automatik-Seite
- Menüpunkt **„Automatik"** → Liste der Regeln mit Beschreibung + **An/Aus-Schalter** (gespeichert in `automation_rules`). Geplante Regeln (Automatik 1) sind sichtbar, aber als „Geplant" markiert und noch nicht schaltbar.

### Automatik 1 — „Eingehende Anfrage → Lead" (PHASE 2, geplant)
- Eingehende Mail mit passendem **Gmail-Label**/Betreff → Kunde in **„Anfrage"** anlegen + Aktivität **„Anruf"** für heute.

## Out of Scope (Phase 1)
- **Automatik 1 (eingehende Mails)** — bewusst Phase 2 (neuer Gmail-Scope + Cron + Nutzer-Freigabe).
- **Frei konfigurierbare Regeln** (eigener Regel-Editor) — MVP: feste, eingebaute Regeln mit An/Aus.
- **Auswahl der „Angebot"-Vorlage per Einstellung** — MVP erkennt die Vorlage am Namen „Angebot".
- **Feiertage** bei der Werktage-Berechnung — nur Wochenenden.

## Acceptance Criteria
- [ ] Angenommen die Regel ist aktiv, wenn eine Mail über die Vorlage „Angebot" gesendet wird, dann steht der Kunde danach in Phase „Nachfassen"
- [ ] Angenommen die Regel ist aktiv, wenn eine „Angebot"-Mail gesendet wird, dann existiert eine offene Aktivität „Nachfassen" mit Fälligkeit 2 Werktage später
- [ ] Angenommen eine „Angebot"-Mail wird an einem Donnerstag/Freitag gesendet, wenn die Aktivität angelegt wird, dann liegt die Fälligkeit auf einem Werktag (Wochenende übersprungen)
- [ ] Angenommen eine Mail wird OHNE die Vorlage „Angebot" gesendet, wenn sie rausgeht, dann passiert keine Automatik
- [ ] Angenommen die Regel ist ausgeschaltet, wenn eine „Angebot"-Mail gesendet wird, dann passiert keine Automatik
- [ ] Angenommen der Nutzer öffnet „Automatik", wenn er einen Schalter umlegt, dann bleibt der Zustand erhalten (auch nach Neuladen)
- [ ] Angenommen der Nutzer ist nicht angemeldet, wenn er „/automatik" aufruft, dann wird er zur Login-Seite umgeleitet

## Edge Cases
- **Vorlage bearbeitet nach Einfügen:** zählt weiterhin als „Angebot"-Versand (die zuletzt eingefügte Vorlage ist maßgeblich).
- **Kunde schon in „Nachfassen":** wird (harmlos) erneut gesetzt; Aktivität wird angelegt.
- **Regel-Zeile fehlt in der DB:** gilt als „aus" (kein Fehler).
- **Aktivität konnte nicht angelegt werden:** Phasenwechsel bleibt; keine Blockade des Versands.

## Open Questions
- [x] Phasen anpassen? → **Ja** (Angebotserstellung, Nachfassen ergänzt).
- [x] „Angebot"-Vorlage erkennen? → **Über den Namen „Angebot"** (später per Einstellung wählbar).
- [ ] Automatik 1 (eingehend): genaues Auslöse-Kriterium (Label-Name? Betreff-Muster?) + Feldzuordnung (Name/Adresse/Telefon aus der Mail) → in Phase 2 mit dem Nutzer festlegen.

## Decision Log

### Product Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Phasen um Angebotserstellung + Nachfassen erweitert | Passt den Verkaufsprozess ab; Automatik 2 braucht „Nachfassen" | 2026-07-13 |
| Automatik 2 zuerst, Automatik 1 als Phase 2 | Automatik 2 ohne neue Rechte sofort nutzbar; eingehend braucht Gmail-Lesezugriff + Cron + Nutzer-Freigabe | 2026-07-13 |
| Eigene „Automatik"-Seite mit An/Aus | Transparenz + Kontrolle; erweiterbar | 2026-07-13 |
| +2 Werktage (nur Wochenenden) | Einfach und ausreichend; Feiertage später | 2026-07-13 |

### Technical Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Neue Phasen in Konstante `STAGES` **und** `pipeline_stages` (FK-Ziel) | `customers.stage_id` hat FK auf `pipeline_stages`; Board liest die Konstante | 2026-07-13 |
| `automation_rules`-Tabelle (key/enabled), Team-RLS | An/Aus je Regel persistent | 2026-07-13 |
| Reine Helfer `addWorkingDays`/`isAngebotTemplate` + Tests | Kernlogik isoliert testbar | 2026-07-13 |
| Automatik nach erfolgreichem Versand über Server-Aktion `onEmailSent` | Server-seitig zuverlässig; UI aktualisiert Aktivität + zeigt Hinweis | 2026-07-13 |
| Angewandte Vorlage via `appliedTemplateName` im Entwurf durchgereicht | Kein zusätzlicher Zustand nötig | 2026-07-13 |

---

## Tech Design (Solution Architect)
Siehe „Technical Decisions" + Funktionsbeschreibung. Neu: `src/lib/automation/` (data/queries/actions), `src/app/automatik/`, `src/components/automation/`, Erweiterung von `STAGES`, Einhängen in den Versand (`email-composer` → `customer-detail` → `onEmailSent`). Keine neue Bibliothek.

## QA Test Results
_Formaler /qa-Durchlauf ausstehend. Verifiziert: Vitest 108/108 (4 neu: `addWorkingDays`, `isAngebotTemplate`), tsc sauber, `next build`, DB (Phasen + `automation_rules`). Ausstehend: End-to-End-Test (Angebot-Mail senden → Phase/Aktivität prüfen; Regel aus/an)._

## Deployment

### Deploy 2026-07-13 (Phase 1)
- **Live:** https://crm-gc.vercel.app
- **Datenbank:** Migration `proj10_automation` (2 neue Phasen in `pipeline_stages`, Tabelle `automation_rules` + RLS + 2 Regeln) angewandt + verifiziert.
- **Post-Deploy-Checks:** `/automatik` login-geschützt (307 → /login); keine Regression.
- **Offen:** Nutzer-Smoke-Test (Automatik 2) + Phase 2 (Automatik 1, eingehende Mails).
