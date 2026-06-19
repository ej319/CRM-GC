import { test, expect } from "@playwright/test";

/**
 * E2E-Tests für PROJ-3 (Excel-/CSV-Import mit Spaltenzuordnung).
 *
 * Die Import-Seite liegt vollständig hinter dem Google-Login (PROJ-1). Ein
 * echter Google-Login lässt sich nicht automatisiert durchführen, daher wird
 * hier der automatisierbare Pfad abgesichert: der Zugangsschutz der Route
 * /import. Server-Aktionen (createImportRun, importCustomersBatch,
 * finalizeImportRun, undoImport, suggestValueMappings) prüfen zusätzlich
 * serverseitig `requireUser`.
 *
 * Die angemeldeten Abläufe (Datei lesen, Zuordnung, echter Import, Verlauf,
 * Rückgängigmachen) wurden manuell verifiziert; die reine Logik (Auto-Mapping,
 * Zahl-Erkennung, Validierung, Dubletten innerhalb der Datei, Vorschlag-Parsing)
 * ist über Vitest-Unit-Tests abgedeckt (src/lib/import/mapping.test.ts).
 */
test.describe("PROJ-3: Excel-Import – Zugangsschutz", () => {
  test("nicht angemeldet: Import-Seite (/import) leitet zur Login-Seite um", async ({
    page,
  }) => {
    await page.goto("/import");
    await expect(page).toHaveURL(/\/login$/);
  });

  test("nicht angemeldet: Import-Seite ist auch in mobiler Ansicht geschützt", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/import");
    await expect(page).toHaveURL(/\/login$/);
  });
});
