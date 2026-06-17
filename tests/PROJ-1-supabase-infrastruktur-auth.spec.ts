import { test, expect } from "@playwright/test";

/**
 * E2E-Tests für PROJ-1 (Login & Zugangsschutz).
 *
 * Hinweis: Der eigentliche Google-Login lässt sich nicht automatisiert testen
 * (echte Google-Anmeldung nötig) und wurde manuell verifiziert. Hier werden die
 * automatisierbaren Pfade abgesichert: Zugangsschutz, Login-Seite, Fehlermeldungen.
 */
test.describe("PROJ-1: Login & Zugangsschutz", () => {
  test("nicht angemeldet: Startseite leitet zur Login-Seite um", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/login$/);
  });

  test("Login-Seite zeigt den Google-Anmelde-Button", async ({ page }) => {
    await page.goto("/login");
    await expect(
      page.getByRole("button", { name: /Mit Google anmelden/i }),
    ).toBeVisible();
  });

  test("nicht freigeschaltetes Konto: Hinweis wird angezeigt", async ({
    page,
  }) => {
    await page.goto("/login?error=not_allowed");
    await expect(page.getByText(/nicht freigeschaltet/i)).toBeVisible();
  });

  test("fehlgeschlagene Anmeldung: Fehlermeldung wird angezeigt", async ({
    page,
  }) => {
    await page.goto("/login?error=auth");
    await expect(
      page.getByText(/Anmeldung ist fehlgeschlagen/i),
    ).toBeVisible();
  });

  test("OAuth-Rückkehr ohne Code: leitet zur Login-Seite mit Fehler", async ({
    page,
  }) => {
    await page.goto("/auth/callback");
    await expect(page).toHaveURL(/\/login\?error=auth/);
  });

  test("Login-Seite funktioniert auch in mobiler Ansicht (375px)", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/login");
    await expect(
      page.getByRole("button", { name: /Mit Google anmelden/i }),
    ).toBeVisible();
  });
});
