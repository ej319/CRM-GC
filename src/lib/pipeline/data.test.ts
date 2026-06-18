import { describe, it, expect } from "vitest";

import { sortCustomers, type Customer } from "./data";

/** Minimaler Test-Kunde; nur die für die Sortierung relevanten Felder zählen. */
function c(partial: Partial<Customer> & { name: string }): Customer {
  return {
    id: partial.id ?? partial.name,
    name: partial.name,
    stageId: partial.stageId ?? "kalter_kontakt",
    updatedAt: partial.updatedAt ?? "2026-01-01T00:00:00Z",
    monthlyValue: partial.monthlyValue,
    category: partial.category,
    lastActivityAt: partial.lastActivityAt,
    activityStatus: partial.activityStatus,
  };
}

describe("sortCustomers", () => {
  it("sortiert alphabetisch nach Name (deutsche Locale)", () => {
    const list = [c({ name: "Zebra" }), c({ name: "Ärzte" }), c({ name: "Beta" })];
    const sorted = sortCustomers(list, "alpha").map((x) => x.name);
    expect(sorted).toEqual(["Ärzte", "Beta", "Zebra"]);
  });

  it("sortiert nach Auftragswert absteigend; ohne Wert nach unten", () => {
    const list = [
      c({ name: "Klein", monthlyValue: 100 }),
      c({ name: "Ohne" }),
      c({ name: "Gross", monthlyValue: 900 }),
    ];
    const sorted = sortCustomers(list, "value").map((x) => x.name);
    expect(sorted).toEqual(["Gross", "Klein", "Ohne"]);
  });

  it("sortiert nach Kategorie; ohne Kategorie nach unten", () => {
    const list = [
      c({ name: "C", category: "Kanzlei" }),
      c({ name: "A", category: "Büro" }),
      c({ name: "B" }),
    ];
    const sorted = sortCustomers(list, "category").map((x) => x.name);
    expect(sorted).toEqual(["A", "C", "B"]);
  });

  it("stellt bei 'Letzte Aktivität' Kunden ohne Aktivität ganz oben dar", () => {
    const list = [
      c({ name: "MitAlt", lastActivityAt: "2026-01-01T00:00:00Z" }),
      c({ name: "OhneAktivität", lastActivityAt: null }),
      c({ name: "MitNeu", lastActivityAt: "2026-06-01T00:00:00Z" }),
    ];
    const sorted = sortCustomers(list, "last_activity").map((x) => x.name);
    expect(sorted[0]).toBe("OhneAktivität");
    // Danach die mit Aktivität, neueste zuerst.
    expect(sorted.slice(1)).toEqual(["MitNeu", "MitAlt"]);
  });

  it("verändert die Eingabeliste nicht (gibt eine Kopie zurück)", () => {
    const list = [c({ name: "B" }), c({ name: "A" })];
    const before = list.map((x) => x.name);
    sortCustomers(list, "alpha");
    expect(list.map((x) => x.name)).toEqual(before);
  });
});
