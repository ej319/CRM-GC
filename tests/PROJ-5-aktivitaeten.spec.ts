import { test, expect } from "@playwright/test";

/**
 * E2E-Tests für PROJ-5 (Aktivitätenplanung und Aktivitätenliste).
 *
 * Die zentrale Aktivitäten-Seite und die Kundenakte liegen hinter dem
 * Google-Login. Hier wird der automatisierbare Pfad abgesichert: der
 * Zugangsschutz der Route /aktivitaeten. Die Server-Aktionen
 * (createActivity, completeActivity, updateActivity, deleteActivity) prüfen
 * zusätzlich serverseitig `requireUser`.
 *
 * Die angemeldeten Abläufe (Planen, Abhaken + Folge-Dialog, Bearbeiten,
 * Löschen, Board-Marker) wurden manuell verifiziert; die Status-/Marker-Logik
 * ist über Vitest-Unit-Tests abgedeckt (src/lib/activities/data.test.ts).
 */
test.describe("PROJ-5: Aktivitäten – Zugangsschutz", () => {
  test("nicht angemeldet: /aktivitaeten leitet zur Login-Seite um", async ({
    page,
  }) => {
    await page.goto("/aktivitaeten");
    await expect(page).toHaveURL(/\/login$/);
  });

  test("nicht angemeldet: /aktivitaeten ist auch in mobiler Ansicht geschützt", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/aktivitaeten");
    await expect(page).toHaveURL(/\/login$/);
  });
});
