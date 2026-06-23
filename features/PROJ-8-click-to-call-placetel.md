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
| _To be added by /architecture_ | | |

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)
_To be added by /architecture_

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
