# Design System

> Vorgabe des Nutzers: **„Lass es aussehen wie Pipedrive."**
> Diese Notiz beschreibt einen Pipedrive-orientierten Look auf Basis von Tailwind + shadcn/ui (Template-Standard). Sie wird vom `/frontend`-Skill beim Bauen der Oberfläche gelesen.

## Gesamteindruck
Hell, aufgeräumt, sachlich-professionell. Viel Weißraum, klare Trennlinien, dezente Schatten. Inhalt steht im Vordergrund, das Design ist ruhig und funktional – kein verspieltes oder dunkles Theme.

## Layout
- **Linke Seitenleiste (Sidebar):** feste Navigation mit den Hauptbereichen (Pipeline, Kontakte, Aktivitäten, E-Mail). Schmal, mit Icons + Text.
- **Obere Leiste (Top-Bar):** Suche, Schnell-Aktion „+ Neu", Nutzer-Menü rechts.
- **Hauptbereich:** je nach Ansicht Kanban-Board, Listen oder Detailansicht.
- **Pipeline = Kanban-Board:** horizontale Phasen-Spalten, Aufträge als Karten, per Drag-and-Drop verschiebbar. Pro Spalte eine Summen-/Anzahl-Anzeige oben.

## Farben (Pipedrive-orientiert)
- **Primär/Akzent:** sattes Grün (Buttons, aktive Navigation, „Gewonnen"-Status). Richtwert `#017737`–`#1A7A4C`.
- **Hintergrund Board/Seiten:** sehr helles Grau, Richtwert `#F4F5F7`.
- **Karten/Flächen:** Weiß `#FFFFFF` mit dezentem Rahmen `#E3E6EA` und leichtem Schatten.
- **Text:** dunkles Anthrazit `#1F2A37` für Haupttext, Grau `#6B7280` für Sekundärtext.
- **Statusfarben:** Grün = gewonnen, Rot = verloren, Gelb/Orange = überfällige Aktivität.

## Typografie
- Klare, gut lesbare Sans-Serif (Template-Standard, z. B. Inter).
- Deutliche Hierarchie: kräftige Überschriften, ruhiger Fließtext, kleine graue Labels.

## Komponenten-Stil
- Abgerundete Ecken (mittel), dezente Schatten, viel Innenabstand auf Karten.
- Buttons: gefüllt grün für Primäraktionen, schlicht/umrandet für Sekundäraktionen.
- Tabellen/Listen mit ruhigen Zeilentrennern, Hover-Hervorhebung.
- shadcn/ui-Komponenten verwenden, NICHT neu nachbauen.

## Später
Firmenidentität der G+C Facility GmbH (Logo, exaktes Firmen-Grün) kann später über die Akzentfarbe und das Logo in der Sidebar ergänzt werden.
