import { describe, it, expect } from "vitest";
import {
  autoSuggestMapping,
  parseGermanNumber,
  localGuessCategory,
  getDistinctValues,
  parseSuggestionMap,
  prepareRows,
} from "./mapping";
import { CATEGORY_OPTIONS } from "@/lib/pipeline/data";

describe("parseSuggestionMap", () => {
  it("übernimmt nur Vorschläge aus der erlaubten Optionsliste", () => {
    const raw = {
      Marketingagentur: "Büro",
      Zahnarzt: "Arztpraxis",
      Unfug: "Gibtsnicht",
    };
    const result = parseSuggestionMap(
      raw,
      ["Marketingagentur", "Zahnarzt", "Unfug"],
      CATEGORY_OPTIONS,
    );
    expect(result["Marketingagentur"]).toBe("Büro");
    expect(result["Zahnarzt"]).toBe("Arztpraxis");
    expect(result["Unfug"]).toBeUndefined();
  });

  it("ist robust gegen Unsinn", () => {
    expect(parseSuggestionMap(null, ["X"], CATEGORY_OPTIONS)).toEqual({});
    expect(parseSuggestionMap("kein objekt", ["X"], CATEGORY_OPTIONS)).toEqual(
      {},
    );
  });
});

describe("autoSuggestMapping", () => {
  it("ordnet gängige deutsche und Pipedrive-Spalten zu", () => {
    const result = autoSuggestMapping([
      "Firmenname",
      "Ansprechpartner",
      "Telefon",
      "E-Mail",
      "Ort",
      "Kategorie",
      "Monatswert",
    ]);
    expect(result["Firmenname"]).toBe("name");
    expect(result["Ansprechpartner"]).toBe("contactName");
    expect(result["Telefon"]).toBe("phone");
    expect(result["E-Mail"]).toBe("email");
    expect(result["Ort"]).toBe("city");
    expect(result["Kategorie"]).toBe("category");
    expect(result["Monatswert"]).toBe("monthlyValue");
  });

  it("lässt unbekannte Spalten unzugeordnet", () => {
    const result = autoSuggestMapping(["Notiz XY"]);
    expect(result["Notiz XY"]).toBe("");
  });

  it("ordnet jedes Feld nur einer Spalte zu", () => {
    const result = autoSuggestMapping(["Name", "Firmenname"]);
    const names = Object.values(result).filter((v) => v === "name");
    expect(names).toHaveLength(1);
  });
});

describe("parseGermanNumber", () => {
  it("erkennt deutsche und englische Formate", () => {
    expect(parseGermanNumber("1.200,50 €")).toBe(1200.5);
    expect(parseGermanNumber("1.200")).toBe(1200);
    expect(parseGermanNumber("1234")).toBe(1234);
    expect(parseGermanNumber("1,5")).toBe(1.5);
    expect(parseGermanNumber("1.200.000")).toBe(1200000);
  });

  it("gibt null bei Unsinn zurück", () => {
    expect(parseGermanNumber("abc")).toBeNull();
    expect(parseGermanNumber("")).toBeNull();
  });
});

describe("localGuessCategory", () => {
  it("schlägt sinnvolle Kategorien vor", () => {
    expect(localGuessCategory("Zahnarztpraxis")).toBe("Arztpraxis");
    expect(localGuessCategory("Marketingagentur")).toBe("Büro");
    expect(localGuessCategory("Steuerkanzlei")).toBe("Kanzlei");
    expect(localGuessCategory("Logistikzentrum")).toBe("Industrie");
  });

  it("gibt leer zurück, wenn nichts passt", () => {
    expect(localGuessCategory("Zoohandlung XYZ")).toBe("");
  });
});

describe("getDistinctValues", () => {
  it("liefert eindeutige Werte einer zugeordneten Spalte", () => {
    const rows = [
      { Branche: "Büro" },
      { Branche: "Büro" },
      { Branche: "Praxis" },
      { Branche: "" },
    ];
    const values = getDistinctValues(rows, { Branche: "category" }, "category");
    expect(values).toEqual(["Büro", "Praxis"]);
  });
});

describe("prepareRows", () => {
  const mapping = {
    Firma: "name" as const,
    Mail: "email" as const,
    Wert: "monthlyValue" as const,
    Branche: "category" as const,
  };

  it("überspringt Zeilen ohne Firmenname als Fehler", () => {
    const result = prepareRows([{ Firma: "", Mail: "", Wert: "", Branche: "" }], mapping, {}, {});
    expect(result.summary.errors).toBe(1);
    expect(result.summary.toImport).toBe(0);
    expect(result.rows[0].status).toBe("error");
  });

  it("erkennt Dubletten innerhalb der Datei (Groß-/Kleinschreibung egal)", () => {
    const result = prepareRows(
      [
        { Firma: "Müller GmbH", Mail: "", Wert: "", Branche: "" },
        { Firma: "müller gmbh", Mail: "", Wert: "", Branche: "" },
      ],
      mapping,
      {},
      {},
    );
    expect(result.summary.toImport).toBe(1);
    expect(result.summary.dupesInFile).toBe(1);
    expect(result.rows[1].status).toBe("dupe-file");
  });

  it("legt Kunden trotz ungültiger Felder an und zählt Warnungen", () => {
    const result = prepareRows(
      [{ Firma: "Test AG", Mail: "kaputt", Wert: "keinewert", Branche: "" }],
      mapping,
      {},
      {},
    );
    expect(result.summary.toImport).toBe(1);
    expect(result.summary.warnings).toBe(1);
    expect(result.rows[0].input.email).toBeUndefined();
    expect(result.rows[0].input.monthlyValue).toBeUndefined();
    expect(result.rows[0].warnings.length).toBe(2);
  });

  it("wendet die Kategorie-Zuordnung an", () => {
    const result = prepareRows(
      [{ Firma: "Agentur X", Mail: "", Wert: "", Branche: "Marketingagentur" }],
      mapping,
      { Marketingagentur: "Büro" },
      {},
    );
    expect(result.rows[0].input.category).toBe("Büro");
  });
});
