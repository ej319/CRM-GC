import { describe, it, expect } from "vitest";
import { fillPlaceholders, type TemplateCustomerFields } from "./data";

const full: TemplateCustomerFields = {
  name: "Muster GmbH",
  contactName: "Thomas Müller",
  address: "Hauptstr. 1",
  plz: "10115",
  city: "Berlin",
  category: "Büro",
};

const empty: TemplateCustomerFields = {};

describe("fillPlaceholders – Anrede", () => {
  it("nutzt den Ansprechpartner, wenn vorhanden", () => {
    expect(fillPlaceholders("{Anrede}", full)).toBe("Guten Tag Thomas Müller,");
  });

  it("fällt auf die neutrale Anrede zurück, wenn kein Ansprechpartner da ist", () => {
    expect(fillPlaceholders("{Anrede}", empty)).toBe(
      "Sehr geehrte Damen und Herren,",
    );
  });
});

describe("fillPlaceholders – Kundenfelder & Ersatztexte", () => {
  it("setzt vorhandene Felder ein", () => {
    expect(fillPlaceholders("{Firma} in {Stadt}", full)).toBe(
      "Muster GmbH in Berlin",
    );
  });

  it("nutzt den Ersatztext der Vorlage, wenn das Feld leer ist", () => {
    expect(fillPlaceholders("{Firma}", empty, { Firma: "unser Kunde" })).toBe(
      "unser Kunde",
    );
  });

  it("lässt die Stelle leer, wenn Feld leer und kein Ersatztext", () => {
    expect(fillPlaceholders("Hallo {Firma}!", empty)).toBe("Hallo !");
  });
});

describe("fillPlaceholders – Robustheit", () => {
  it("lässt unbekannte/vertippte Platzhalter unverändert", () => {
    expect(fillPlaceholders("{Fimra}", full)).toBe("{Fimra}");
  });

  it("bereinigt beim Betreff doppelte/führende Leerzeichen", () => {
    // {Kategorie} leer → sonst „Angebot  für “ mit Doppel-Leerzeichen
    expect(fillPlaceholders("Angebot {Kategorie} für Sie", empty)).toBe(
      "Angebot für Sie",
    );
  });

  it("setzt Werte im HTML-Modus HTML-sicher ein", () => {
    const res = fillPlaceholders("<p>{Firma}</p>", { name: "Müller & Co <X>" }, {}, {
      html: true,
    });
    expect(res).toBe("<p>Müller &amp; Co &lt;X&gt;</p>");
  });

  it("glättet im HTML-Modus keine Leerzeichen (behält Formatierung)", () => {
    const res = fillPlaceholders("<p>a  b</p>", empty, {}, { html: true });
    expect(res).toBe("<p>a  b</p>");
  });

  it("ersetzt mehrere Vorkommen desselben Platzhalters", () => {
    expect(fillPlaceholders("{Firma} = {Firma}", full)).toBe(
      "Muster GmbH = Muster GmbH",
    );
  });
});
