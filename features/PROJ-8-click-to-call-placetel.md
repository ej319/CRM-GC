# PROJ-8: Click-to-Call über Placetel

## Status: Planned
**Created:** 2026-06-23
**Last Updated:** 2026-06-23

## Dependencies
- Requires: PROJ-1 (Supabase Infrastruktur & Auth) — Zugriffsschutz für Kundendaten
- Requires: PROJ-2 (Pipeline) — Telefonnummer am Kunden
- Requires: PROJ-4 (Detailansicht/Verlauf) — die Kundenakte zeigt die Telefonnummer an (bisher nur als Text mit Hinweis „Anruf kommt mit PROJ-8")

## User Stories
- Als Vertriebsnutzer möchte ich in der Kundenakte die Telefonnummer anklicken und damit über meine Placetel-Windows-App sofort einen Anruf starten, ohne die Nummer abzutippen.
- Als Vertriebsnutzer möchte ich zwischen „tel:" und „callto:" umschalten können, damit der Klick zu meiner Placetel-App passt.
- Als Vertriebsnutzer möchte ich, dass jede angezeigte Telefonnummer klickbar ist (überall, wo sie auftaucht), damit ich von überall direkt anrufen kann.
- Als Vertriebsnutzer möchte ich an einem Telefon-Symbol erkennen, dass eine Nummer anklickbar ist, damit klar ist, dass ich darüber anrufe.

## Out of Scope
- **Tiefere Placetel-Schnittstelle** (API, Anrufstatus, automatisches Anruf-Protokoll, Aufzeichnung) → spätere Ausbaustufe (PRD-Vorgabe).
- **Automatisches Anlegen einer „Anruf"-Aktivität/Notiz** nach dem Klick → später; Aktivitäten plant man weiterhin manuell (PROJ-5).
- **Eingehende Anrufe / „wer ruft an"-Anzeige** → nicht Teil dieser Funktion.
- **Rufnummern-Eingabe/-Validierung** → bleibt wie in PROJ-2; PROJ-8 macht eine vorhandene Nummer nur klickbar.
- **Telefonnummer auf den Board-Karten** → Karten zeigen keine Nummer; „überall klickbar" gilt dort, wo eine Nummer tatsächlich angezeigt wird.

## Acceptance Criteria

**Format:** Angenommen [Vorbedingung] / Wenn [Aktion] / Dann [Ergebnis]

- [ ] Angenommen ein Kunde hat eine Telefonnummer, wenn ich seine Akte öffne, dann ist die Nummer als Anruf-Link mit Telefon-Symbol dargestellt.
- [ ] Angenommen ich klicke auf die Telefonnummer, wenn der Link ausgelöst wird, dann startet die Placetel-App den Anruf an diese Nummer (über das gewählte Schema `tel:`/`callto:`).
- [ ] Angenommen ein Kunde hat keine Telefonnummer, wenn ich seine Akte öffne, dann gibt es keinen Anruf-Link (nur „—").
- [ ] Angenommen die Nummer enthält Leerzeichen/Klammern/Bindestriche, wenn der Anruf-Link erzeugt wird, dann wird eine bereinigte, wählbare Nummer verwendet, während die Anzeige wie eingegeben bleibt.
- [ ] Angenommen ich öffne den Anruf-Schalter im Nutzer-Menü, wenn ich zwischen „tel:" und „callto:" umschalte, dann verwenden alle Anruf-Links ab sofort das gewählte Schema.
- [ ] Angenommen ich habe „callto:" gewählt, wenn ich die App später neu lade, dann ist „callto:" weiterhin aktiv (geräte-lokal gespeichert).
- [ ] Angenommen eine Telefonnummer wird an einer anderen Stelle angezeigt (jetzt oder künftig), wenn sie gerendert wird, dann ist sie ebenfalls als Anruf-Link klickbar (einheitlicher Baustein).
- [ ] Angenommen ich bin nicht angemeldet, wenn ich eine Kundenakte öffne, dann werde ich zur Login-Seite geleitet (unverändert).

## Edge Cases
- Was passiert ohne installierte Placetel-App / ohne Protokoll-Handler am Desktop? → Der Klick bewirkt nichts Sichtbares (das Betriebssystem findet keinen Handler); auf Mobilgeräten öffnet sich der Telefon-Dialer. Kein Fehler in der App.
- Was passiert bei einer „unsauberen" Nummer (Buchstaben, oder nach dem Bereinigen leer)? → Kein Anruf-Link, nur Anzeige als Text.
- Was passiert mit internationalen Nummern (+49 …)? → Das führende „+" und die Ziffern bleiben erhalten, Leerzeichen werden entfernt.
- Was passiert beim Umschalten tel:/callto: ohne Neuladen? → Die Anruf-Links verwenden das neue Schema ab dem nächsten Rendern/sofort.
- Was passiert, wenn mehrere Nummern in einem Feld stehen? → Selten; das Feld wird as-is bereinigt (keine Auftrennung) — bekannte Einschränkung.

## Technical Requirements (optional)
- **Kein Backend nötig:** rein klientseitig (Link-Erzeugung + geräte-lokale Einstellung). Keine neue Tabelle, kein Server-Aufruf.
- Sicherheit: Kundendaten nur für angemeldete Nutzer sichtbar (unverändert, PROJ-1). Keine neuen Secrets.
- Die Schema-Einstellung (tel:/callto:) wird **geräte-lokal** gespeichert (Browser), Standard „tel:".
- Ein **einheitlicher Telefonnummer-Link-Baustein**, der überall verwendet wird, damit künftige Anzeige-Stellen die Klickbarkeit automatisch erhalten.

## Open Questions
- [ ] Welches Schema bei dir tatsächlich wählt (tel: oder callto:) — beim Testen mit der Placetel-App klären; der Umschalter deckt beide ab.
- [ ] Soll nach einem Anruf optional eine Anruf-Notiz/Aktivität vorgeschlagen werden? (Vorschlag: später, mit tieferer Placetel-Anbindung.)
- [ ] Ort des Umschalters: Nutzer-Menü (Vorschlag) oder eigene Einstellungs-Seite?

## Decision Log

### Product Decisions
<!-- Added by /write-spec -->
| Decision | Rationale | Date |
|----------|-----------|------|
| Klickbare Telefonnummer als `tel:`/`callto:`-Link (Placetel-App wählt) | PRD-Vorgabe; einfachste Lösung ohne tiefe Placetel-Schnittstelle | 2026-06-23 |
| Umschalter `tel:` ↔ `callto:`, geräte-lokal gespeichert, Standard `tel:` | Hängt von der lokalen Placetel-App ab; der Nutzer wählt das passende Schema | 2026-06-23 |
| Telefonnummer **überall** klickbar über einen einheitlichen Baustein | Nutzerwunsch „überall klickbar"; künftige Stellen erben es automatisch | 2026-06-23 |
| Anzeige bleibt wie eingegeben; nur der Link nutzt eine bereinigte Nummer | Lesbarkeit + zuverlässiges Wählen | 2026-06-23 |
| Umschalter im Nutzer-Menü | Set-once-Einstellung, unaufdringlich und auffindbar | 2026-06-23 |
| Kein Anruf-Protokoll / keine automatische Aktivität in PROJ-8 | Tiefere Placetel-Anbindung laut PRD später | 2026-06-23 |
| Rein klientseitig, kein Backend/keine Tabelle | Es wird nur ein Link erzeugt + eine geräte-lokale Einstellung gespeichert | 2026-06-23 |

### Technical Decisions
<!-- Added by /architecture -->
| Decision | Rationale | Date |
|----------|-----------|------|
| Rein klientseitig (kein Backend, keine Tabelle) | Es wird nur ein Link erzeugt + eine geräte-lokale Einstellung gespeichert | 2026-06-23 |
| Anruf-Schema (tel:/callto:) im Browser-Speicher + gemeinsamer Zustand | Geräteabhängig (lokale Placetel-App); hält Umschalter und Links ohne Neuladen synchron | 2026-06-23 |
| Einheitlicher `PhoneLink`-Baustein | „überall klickbar"; künftige Stellen erben die Funktion | 2026-06-23 |
| Nummer nur für den Link bereinigt (+/Ziffern), Anzeige unverändert | Zuverlässiges Wählen bei lesbarer Anzeige | 2026-06-23 |
| Standard `tel:`; anfänglich `tel:`, beim Laden auf den gespeicherten Wert | Sicherer Standard, keine Hydratations-Konflikte | 2026-06-23 |
| Keine neuen Pakete (vorhandene shadcn/lucide-Bausteine) | Kein Eigenbau, kein Risiko | 2026-06-23 |

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)

### Bausteine der Oberfläche
```
Anruf-Schema (geräte-lokal, Standard „tel:")  — kleiner Zustand, aus dem Browser-Speicher geladen
└── Umschalter im Nutzer-Menü (oben rechts):  tel:  ⇄  callto:

PhoneLink (einheitlicher Telefon-Link-Baustein)
├── zeigt die Nummer + Telefon-Symbol
├── Klick öffnet  <schema>:<bereinigte Nummer>  → Placetel-App wählt
├── verwendet in der Kundenakte (Feld „Telefon") — und überall, wo künftig eine Nummer steht
└── keine Nummer / nach Bereinigung leer  → nur Text „—", kein Link
```

### Datenmodell (in Klartext)
- **Keine Datenbank, keine neue Tabelle.** Gespeichert wird nur **eine geräte-lokale Einstellung**: das „Anruf-Schema" (`tel:` oder `callto:`, Standard `tel:`) im Browser-Speicher des jeweiligen PCs.
- Der Anruf-**Link** nutzt eine **bereinigte** Nummer (führendes „+" + Ziffern, ohne Leerzeichen/Klammern); die **Anzeige** bleibt wie eingegeben.

### Tech-Entscheidungen (warum)
- **Rein klientseitig:** Es wird nur ein Link erzeugt — kein Server, keine Tabelle, kein API-Schlüssel.
- **Einstellung geräte-lokal** (Browser-Speicher), weil sie von der lokalen Placetel-App des jeweiligen PCs abhängt; über einen kleinen gemeinsamen Zustand verteilt, damit das **Umschalten die Links sofort** ändert (ohne Neuladen).
- **Ein wiederverwendbarer `PhoneLink`-Baustein:** erfüllt „überall klickbar" und lässt künftige Anzeige-Stellen die Funktion automatisch erben.
- **Nummer nur für den Link bereinigt**, Anzeige unverändert: zuverlässiges Wählen bei lesbarer Darstellung.
- **shadcn/ui-Bausteine** (Schalter, Menüeintrag) und das Telefon-Symbol sind vorhanden — kein Eigenbau.

### Abhängigkeiten (zu installieren)
- **Keine neuen Pakete.**

## Frontend-Implementierung (Stand 2026-06-23)
- **Einheitlicher `PhoneLink`-Baustein** (`src/components/phone/phone-link.tsx`): zeigt die Nummer mit Telefon-Symbol und macht sie als `tel:`/`callto:`-Link klickbar; ohne wählbare Nummer nur Text („—" bzw. die Roh-Anzeige).
- **Anruf-Schema (tel:/callto:)** über einen Context (`CallSchemeProvider`), der das Grund-Gerüst (`app-shell`) umschließt und die Wahl **geräte-lokal** im Browser speichert (Standard `tel:`). Umschalter als **Radio-Auswahl im Nutzer-Menü** („Anruf-Link (Placetel)": tel: / callto:) — wirkt sofort auf alle Links.
- **Nummer-Aufbereitung** (`src/lib/phone/format.ts`, `toDialNumber`): führendes „+" + Ziffern, sonst kein Link; mit Unit-Tests (3).
- **Kundenakte:** das Feld „Telefon" nutzt jetzt `PhoneLink`; der Platzhalter-Hinweis „kommt mit PROJ-8" wurde entfernt.
- **Neue Dateien:** `src/lib/phone/{format,format.test}.ts`; `src/components/phone/{call-scheme,phone-link}.tsx`. Geändert: `app-shell.tsx` (Provider), `user-menu.tsx` (Umschalter), `customer-summary.tsx` (PhoneLink).
- **Verifikation:** `tsc --noEmit` sauber; `npm test` 37/37 grün; Dev-Server kompiliert ohne Fehler.
- **Kein Backend nötig** (rein klientseitig). Hinweis zum Test: Ob `tel:` oder `callto:` deine Placetel-App tatsächlich wählt, zeigt sich erst auf deinem PC — dafür ist der Umschalter da.

## QA Test Results

**Tested:** 2026-06-23
**App URL:** http://localhost:3000
**Tester:** QA Engineer (AI)

> Rein klientseitige Funktion. Die Nummern-Aufbereitung ist per Unit-Tests abgedeckt, der Zugangsschutz der Kundenakte über die PROJ-2-E2E. Ob `tel:` oder `callto:` wählt, hängt von der lokalen Placetel-App ab → über den Umschalter testbar.

### Acceptance Criteria Status
- [x] **AC-1 – Nummer als Anruf-Link mit Symbol:** `PhoneLink` rendert Link + Telefon-Symbol.
- [x] **AC-2 – Klick startet Anruf (tel:/callto:):** `href = <schema>:<bereinigte Nummer>`; Schema aus der Einstellung. (Tatsächliches Wählen ist OS-/Placetel-abhängig.)
- [x] **AC-3 – Keine Nummer → kein Link:** `PhoneLink` zeigt nur „—".
- [x] **AC-4 – Bereinigung, Anzeige unverändert:** `toDialNumber` (unit-getestet); Anzeige bleibt die Roh-Nummer.
- [x] **AC-5 – Umschalten wirkt auf alle Links:** gemeinsamer Context (`CallSchemeProvider`).
- [x] **AC-6 – Wahl überlebt Neuladen (geräte-lokal):** Browser-Speicher, beim Laden eingelesen.
- [x] **AC-7 – Überall klickbar (einheitlicher Baustein):** ein wiederverwendbarer `PhoneLink`; aktuell in der Kundenakte, künftige Stellen erben es.
- [x] **AC-8 – Nicht angemeldet → Login:** Kundenakte hinter Login (PROJ-2-E2E, 26/26 grün).

**Ergebnis: 8/8 Akzeptanzkriterien abgedeckt.**

### Edge Cases Status
- [x] **Kein Placetel-Handler / Desktop:** Klick bewirkt nichts (OS findet keinen Handler); Mobil öffnet den Dialer — kein App-Fehler.
- [x] **Unsaubere/leere Nummer:** kein Link, nur Text (`toDialNumber` → null, unit-getestet).
- [x] **International (+49 …):** „+" und Ziffern bleiben erhalten (unit-getestet).
- [x] **Umschalten ohne Neuladen:** Links nutzen sofort das neue Schema (Context).
- [~] **Mehrere Nummern in einem Feld:** wird as-is bereinigt (bekannte Einschränkung, selten).

### Security Audit Results
- [x] **Kein Injection-Risiko im Link:** `href` besteht aus festem Schema (`tel`/`callto`) + ausschließlich „+"/Ziffern; kein `javascript:` o.ä. möglich. Anzeigetext wird von React escaped.
- [x] **Authentifizierung:** Kundendaten nur für angemeldete Nutzer (unverändert, PROJ-1).
- [x] **Keine neuen Daten/Secrets:** rein klientseitig; im Browser-Speicher nur „tel"/„callto" (beim Lesen validiert).
- [i] **Rate Limiting:** nicht relevant (kein Server-Aufruf).

### Automated Tests
- **Unit (Vitest): 37/37 grün** — inkl. `toDialNumber` (`src/lib/phone/format.test.ts`, 3).
- **E2E (Playwright): 26/26 grün** — keine Regression (PROJ-8 ohne neue Route; Kundenakte über PROJ-2 abgesichert).
- **Typen:** `tsc --noEmit` sauber.

### Bugs Found
- Keine kritischen/hohen/mittleren Fehler.
- **INFO:** Welches Schema (tel:/callto:) tatsächlich wählt, hängt von der lokalen Placetel-App ab — über den Umschalter im Nutzer-Menü zu ermitteln.
- **INFO:** `PhoneLink` wird aktuell nur in der Kundenakte verwendet (die einzige Stelle mit Telefonnummer); der wiederverwendbare Baustein deckt künftige Stellen ab.

### Summary
- **Acceptance Criteria:** 8/8 abgedeckt
- **Bugs Found:** 0 (2 informative Hinweise)
- **Security:** Bestanden (kein Injection-Risiko, Auth unverändert, keine neuen Secrets)
- **Production Ready:** **YES** — empfohlen: kurz live testen, welches Schema deine Placetel-App wählt.

## Deployment
- **Live:** https://crm-gc.vercel.app — Vercel-Projekt `ewgeni-s-projects/crm-gc`
- **Deployed:** 2026-06-23 (MVP-Sammel-Deployment PROJ-1–5, 8)
