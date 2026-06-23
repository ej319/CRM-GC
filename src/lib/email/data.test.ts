import { describe, it, expect } from "vitest";

import {
  escapeHtml,
  textToHtml,
  stripHtml,
  isValidEmail,
  normalizeRecipients,
} from "./data";

describe("escapeHtml", () => {
  it("maskiert HTML-Sonderzeichen", () => {
    expect(escapeHtml('<b>"&"</b>')).toBe("&lt;b&gt;&quot;&amp;&quot;&lt;/b&gt;");
  });
});

describe("textToHtml", () => {
  it("wandelt Zeilenumbrüche in <br> um", () => {
    const html = textToHtml("Zeile 1\nZeile 2");
    expect(html).toContain("Zeile 1<br>");
    expect(html).toContain("Zeile 2");
  });

  it("maskiert eingebetteten HTML-Code (kein XSS)", () => {
    const html = textToHtml("<script>alert(1)</script>");
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
  });
});

describe("stripHtml", () => {
  it("macht eine einfache HTML-Mail wieder lesbar", () => {
    expect(stripHtml("Hallo<br>Welt")).toBe("Hallo\nWelt");
    expect(stripHtml("<p>Text &amp; mehr</p>")).toBe("Text & mehr");
  });
});

describe("isValidEmail", () => {
  it("akzeptiert gültige Adressen", () => {
    expect(isValidEmail("kunde@example.de")).toBe(true);
    expect(isValidEmail("  kunde@example.de  ")).toBe(true);
  });
  it("lehnt ungültige Adressen ab", () => {
    expect(isValidEmail("keine-mail")).toBe(false);
    expect(isValidEmail("a@b")).toBe(false);
    expect(isValidEmail("")).toBe(false);
  });
});

describe("normalizeRecipients", () => {
  it("normalisiert mehrere gültige Adressen", () => {
    expect(normalizeRecipients(" a@x.de ,b@y.de")).toBe("a@x.de, b@y.de");
  });
  it("gibt null bei leerer Eingabe zurück", () => {
    expect(normalizeRecipients("   ")).toBeNull();
  });
  it("gibt null zurück, wenn eine Adresse ungültig ist", () => {
    expect(normalizeRecipients("a@x.de, kaputt")).toBeNull();
  });
});
