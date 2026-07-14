import { describe, it, expect } from "vitest";
import { parseInquiry } from "./parse";

// Echtes Format des Kontaktformulars (Elementor) von gc-facility.de.
// Achtung: Sternchen an den Feldnamen, Absender ist das EIGENE Postfach.
const FORM_BODY = [
  "Vorname: Max",
  "Nachname*: Muster",
  "Unternehmen*: Muster GmbH",
  "E-Mail*: max@muster.de",
  "Telefon*: 03089068153",
  "Leistung*: Büroreinigung",
  "Objektgröße*: 100 m2",
  "Anmerkung: Bitte um Angebot",
  "",
  "---",
  "",
  "Datum: 25. Juni 2026",
  "Seiten URL: https://gc-facility.de/form/",
  "Benutzer Agent: Mozilla/5.0 (Windows NT 10.0)",
  "Remote IP: 84.174.27.63",
  "Unterstützt von: Elementor",
].join("\n");

describe("parseInquiry – echtes Kontaktformular (Sternchen-Felder)", () => {
  const res = parseInquiry({
    fromName: "Ewgeni Jussufov",
    fromEmail: "ej@gc-facility.de", // eigenes Postfach!
    subject: "Neuer Eintrag im Kontaktformular",
    bodyText: FORM_BODY,
  });

  it("nimmt das Unternehmen als Firma", () => {
    expect(res.name).toBe("Muster GmbH");
  });

  it("setzt Vor- + Nachname als Ansprechpartner", () => {
    expect(res.contactName).toBe("Max Muster");
  });

  it("nimmt die E-Mail aus dem Text – NICHT die eigene Absenderadresse", () => {
    expect(res.email).toBe("max@muster.de");
  });

  it("erkennt die Telefonnummer trotz Sternchen", () => {
    expect(res.phone?.replace(/\D/g, "")).toBe("03089068153");
  });

  it("schneidet den technischen Fuß (Browser/IP) aus der Notiz", () => {
    expect(res.note).toContain("Anmerkung: Bitte um Angebot");
    expect(res.note).not.toContain("Remote IP");
    expect(res.note).not.toContain("Benutzer Agent");
  });
});

describe("parseInquiry – Formular ohne Unternehmen (Privatperson)", () => {
  const res = parseInquiry({
    fromEmail: "ej@gc-facility.de",
    subject: "Neuer Eintrag im Kontaktformular",
    bodyText: ["Vorname: Erika", "Nachname*: Beispiel", "E-Mail*: erika@web.de"].join("\n"),
  });

  it("nutzt den Personennamen als Firma", () => {
    expect(res.name).toBe("Erika Beispiel");
  });

  it("setzt dann keinen separaten Ansprechpartner", () => {
    expect(res.contactName).toBeUndefined();
  });

  it("nimmt trotzdem die E-Mail aus dem Text", () => {
    expect(res.email).toBe("erika@web.de");
  });
});

describe("parseInquiry – direkte Anfrage (Absender = Interessent)", () => {
  const res = parseInquiry({
    fromName: "Thomas Fischer",
    fromEmail: "thomas@kunde.de",
    subject: "Angebotsanfrage",
    bodyText: "Guten Tag, bitte um ein Angebot. Erreichbar unter 0171 2345678.",
  });

  it("nimmt Name und E-Mail vom Absender", () => {
    expect(res.name).toBe("Thomas Fischer");
    expect(res.email).toBe("thomas@kunde.de");
  });

  it("findet die Telefonnummer im Fließtext", () => {
    expect(res.phone?.replace(/\D/g, "")).toBe("01712345678");
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
    const res = parseInquiry({ fromEmail: "a@b.de", bodyText: "Kurze Anfrage." });
    expect(res.phone).toBeUndefined();
  });
});
