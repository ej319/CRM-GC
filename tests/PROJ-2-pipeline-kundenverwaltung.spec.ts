import { test, expect } from "@playwright/test";

/**
 * E2E-Tests für PROJ-2 (Pipeline-basierte Kundenverwaltung).
 *
 * Hinweis: Das Board und die Detailseite liegen vollständig hinter dem
 * Google-Login (PROJ-1). Ein echter Google-Login lässt sich nicht
 * automatisiert durchführen, daher werden hier die automatisierbaren Pfade
 * abgesichert: der Zugangsschutz von Board- und Detail-Route.
 *
 * Die angemeldeten Abläufe (Anlegen, Drag-and-Drop, Bearbeiten, Löschen,
 * Sortieren, Persistenz nach Neuladen) wurden manuell verifiziert; die reine
 * Logik (Sortierung, DB-Mapping, Eingabe-Validierung) ist über Vitest-
 * Unit-Tests abgedeckt (src/lib/pipeline/*.test.ts).
 */
test.describe("PROJ-2: Pipeline – Zugangsschutz", () => {
  test("nicht angemeldet: Board (/) leitet zur Login-Seite um", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/login$/);
  });

  test("nicht angemeldet: Kunden-Detailseite leitet zur Login-Seite um", async ({
    page,
  }) => {
    await page.goto("/kunde/11111111-1111-1111-1111-111111111111");
    await expect(page).toHaveURL(/\/login$/);
  });

  test("nicht angemeldet: Detailseite ist auch in mobiler Ansicht geschützt", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/kunde/11111111-1111-1111-1111-111111111111");
    await expect(page).toHaveURL(/\/login$/);
  });
});
