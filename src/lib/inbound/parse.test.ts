import { describe, it, expect } from "vitest";
import { parseInquiry } from "./parse";

describe("parseInquiry – Kontaktformular (Daten im Text)", () => {
  const body = [
    "Neue Anfrage über das Kontaktformular:",
    "Name: Max Muster",
    "E-Mail: max.muster@firma.de",
    "Telefon: 030 / 123 456 78",
    "Nachricht: Wir suchen eine Büroreinigung.",
  ].join("\n");

  const res = parseInquiry({
    fromName: "Website Formular",
    fromEmail: "noreply@gc-facility.de",
    subject: "Anfrage Büroreinigung",
    bodyText: body,
  });

  it("nimmt Name aus dem Text statt vom Absender", () => {
    expect(res.name).toBe("Max Muster");
  });

  it("nimmt die E-Mail aus dem Text statt der Absenderadresse", () => {
    expect(res.email).toBe("max.muster@firma.de");
  });

  it("erkennt die Telefonnummer", () => {
    expect(res.phone).toContain("030");
  });

  it("speichert Betreff + Text als Notiz", () => {
    expect(res.note).toContain("Betreff: Anfrage Büroreinigung");
    expect(res.note).toContain("Büroreinigung");
  });
});

describe("parseInquiry – direkte Mail des Interessenten", () => {
  const res = parseInquiry({
    fromName: "Erika Beispiel",
    fromEmail: "erika@kunde.de",
    subject: "Reinigungsanfrage",
    bodyText: "Guten Tag, bitte um ein Angebot. Erreichbar unter 0171 2345678.",
  });

  it("nimmt Name und E-Mail vom Absender", () => {
    expect(res.name).toBe("Erika Beispiel");
    expect(res.email).toBe("erika@kunde.de");
  });

  it("findet die Telefonnummer im Fließtext", () => {
    expect(res.phone?.replace(/\D/g, "")).toContain("01712345678");
  });
});

describe("parseInquiry – Randfälle", () => {
  it("kommt ohne Absendername klar (Name aus Adresse)", () => {
    const res = parseInquiry({ fromEmail: "thomas.mueller@x.de", bodyText: "" });
    expect(res.name).toBe("thomas mueller");
  });

  it("kommt mit leerer Mail klar", () => {
    const res = parseInquiry({});
    expect(res.name).toBe("Neue Anfrage");
    expect(res.note).toBe("Eingehende Anfrage");
  });

  it("liefert kein Telefon, wenn keins vorhanden", () => {
    const res = parseInquiry({
      fromEmail: "a@b.de",
      bodyText: "Kurze Anfrage ohne Nummer.",
    });
    expect(res.phone).toBeUndefined();
  });
});
