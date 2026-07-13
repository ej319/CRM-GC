import { describe, it, expect } from "vitest";
import { addWorkingDays, isAngebotTemplate } from "./data";

describe("isAngebotTemplate", () => {
  it("erkennt die Angebot-Vorlage unabhängig von Groß/Klein und Leerzeichen", () => {
    expect(isAngebotTemplate("Angebot")).toBe(true);
    expect(isAngebotTemplate("  angebot ")).toBe(true);
    expect(isAngebotTemplate("Angebot Fensterreinigung")).toBe(false);
    expect(isAngebotTemplate("Erstansprache")).toBe(false);
    expect(isAngebotTemplate(undefined)).toBe(false);
  });
});

describe("addWorkingDays", () => {
  it("überspringt das Wochenende (Freitag + 2 = Dienstag)", () => {
    // 2026-01-02 ist ein Freitag
    expect(addWorkingDays("2026-01-02", 2)).toBe("2026-01-06");
  });

  it("bleibt innerhalb der Woche (Montag + 2 = Mittwoch)", () => {
    // 2026-01-05 ist ein Montag
    expect(addWorkingDays("2026-01-05", 2)).toBe("2026-01-07");
  });

  it("landet nie auf einem Wochenende", () => {
    for (let start = 1; start <= 7; start++) {
      const res = addWorkingDays(`2026-06-0${start}`, 2);
      const [y, m, d] = res.split("-").map(Number);
      const dow = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
      expect(dow).not.toBe(0);
      expect(dow).not.toBe(6);
    }
  });
});
