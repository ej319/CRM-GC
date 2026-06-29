import { test, expect } from "@playwright/test";

/**
 * E2E-Tests für PROJ-7 (E-Mail-Versand über Gmail).
 *
 * Hinweis: Der eigentliche Versand lässt sich nicht automatisiert testen
 * (echter Google-OAuth + Gmail-Postfach nötig) und wurde manuell live verifiziert.
 * Hier werden die automatisierbaren, sicherheitsrelevanten Eigenschaften abgesichert:
 *  - Der Tracking-Pixel MUSS ohne Login erreichbar bleiben (sonst zählt kein Öffnen).
 *  - Die Kundenakte mit E-Mail-Funktion ist login-geschützt.
 */
test.describe("PROJ-7: E-Mail-Versand (Gmail)", () => {
  test("Tracking-Pixel ist ohne Login öffentlich erreichbar und liefert ein GIF", async ({
    request,
  }) => {
    // So ruft das E-Mail-Programm des (nicht angemeldeten) Empfängers den Pixel ab.
    const res = await request.get(
      "/api/email/track/00000000-0000-0000-0000-000000000000",
    );
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toContain("image/gif");
    // Darf nicht gecacht werden, sonst zählt nur das erste Öffnen je Mail-Client.
    expect(res.headers()["cache-control"]).toContain("no-store");
  });

  test("nicht angemeldet: Kundenakte (mit E-Mail-Reiter) leitet zur Login-Seite um", async ({
    page,
  }) => {
    await page.goto("/kunde/00000000-0000-0000-0000-000000000000");
    await expect(page).toHaveURL(/\/login$/);
  });

  test("Gmail-Verbinden-Start ist login-geschützt", async ({ page }) => {
    await page.goto("/api/gmail/connect");
    await expect(page).toHaveURL(/\/login$/);
  });
});
