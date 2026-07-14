// Reine Parser-Logik für eingehende Anfrage-Mails (PROJ-10, Automatik 1).
// Abgestimmt auf das echte Kontaktformular (Elementor) von gc-facility.de:
//
//   Vorname: Max
//   Nachname*: Muster
//   Unternehmen*: Muster GmbH
//   E-Mail*: max@muster.de
//   Telefon*: 030 1234567
//   Leistung*: Büroreinigung
//   Objektgröße*: 100 m2
//   Anmerkung: ...
//
// Beachte: Feldnamen können ein Sternchen tragen („E-Mail*:") und die Mail kommt
// vom eigenen Postfach – die Kundendaten stehen also NUR im Text.
// Funktioniert zusätzlich für direkte Anfragen (Absender = Interessent).

export interface RawInquiry {
  fromName?: string;
  fromEmail?: string;
  subject?: string;
  bodyText?: string;
}

export interface ParsedInquiry {
  /** Firma (bzw. Personenname, wenn kein Unternehmen angegeben). */
  name: string;
  /** Ansprechpartner (Vor- + Nachname), falls vorhanden. */
  contactName?: string;
  email?: string;
  phone?: string;
  /** Aufbereiteter Mail-Text – wird als Notiz am Kunden gespeichert. */
  note: string;
}

const EMAIL_ANY = /[^\s<>,;:"']+@[^\s<>,;:"']+\.[a-zA-Z]{2,}/;

/**
 * Wert hinter einem Feldnamen aus dem Text ziehen. Erlaubt ein optionales
 * Sternchen vor dem Doppelpunkt („Nachname*: Muster").
 */
function labeled(body: string, labels: string[]): string | undefined {
  for (const label of labels) {
    const re = new RegExp(`(?:^|\\n)[ \\t]*${label}[ \\t]*\\*?[ \\t]*[:\\-][ \\t]*(.+)`, "i");
    const val = body.match(re)?.[1]?.trim();
    if (val) return val;
  }
  return undefined;
}

function cleanPhone(value: string): string | undefined {
  const m = value.match(/(?:\+\d{1,3}[\s/.-]?)?\(?\d[\d\s/().-]{5,}/);
  const p = m?.[0]?.trim();
  return p && p.replace(/\D/g, "").length >= 6 ? p : undefined;
}

/** Technischen Fuß des Formulars (Browser/IP/Elementor) für die Notiz abschneiden. */
function trimTechnicalFooter(body: string): string {
  const cut = body.search(/\n\s*(Benutzer Agent|Remote IP|Unterstützt von)\s*[:\-]/i);
  return (cut > 0 ? body.slice(0, cut) : body).replace(/\n{3,}/g, "\n\n").trim();
}

/** Zieht Firma, Ansprechpartner, E-Mail, Telefon und den Notiztext aus einer Anfrage-Mail. */
export function parseInquiry(raw: RawInquiry): ParsedInquiry {
  const body = (raw.bodyText ?? "").trim();

  // Person: Vorname + Nachname (Formular) – sonst ein einfaches „Name"-Feld.
  const vorname = labeled(body, ["vorname"]);
  const nachname = labeled(body, ["nachname"]);
  const personFromFields = [vorname, nachname].filter(Boolean).join(" ").trim();
  const person =
    personFromFields || labeled(body, ["name", "absender"]) || raw.fromName?.trim() || "";

  // Firma: „Unternehmen"/„Firma" – sonst der Personenname.
  const company = labeled(body, ["unternehmen", "firma"]);

  // E-Mail: bevorzugt aus dem Text (Formular sendet vom eigenen Postfach!),
  // sonst der Absender.
  const labeledEmail = labeled(body, ["e-?mail", "email", "mail"])?.match(EMAIL_ANY)?.[0];
  const email = labeledEmail || raw.fromEmail || undefined;

  // Telefon: beschriftetes Feld, sonst irgendeine Nummer im Text.
  const labeledPhone = labeled(body, ["telefon", "tel", "handy", "mobil", "rufnummer"]);
  const phone = (labeledPhone ? cleanPhone(labeledPhone) : undefined) ?? cleanPhone(body);

  const fallbackName =
    person ||
    (email ? email.split("@")[0].replace(/[._-]+/g, " ") : "") ||
    raw.subject?.trim() ||
    "Neue Anfrage";

  const name = (company || fallbackName).slice(0, 120);
  // Ansprechpartner nur setzen, wenn er sich von der Firma unterscheidet.
  const contactName = person && person !== name ? person.slice(0, 120) : undefined;

  const note =
    [raw.subject ? `Betreff: ${raw.subject}` : "", trimTechnicalFooter(body)]
      .filter(Boolean)
      .join("\n\n") || "Eingehende Anfrage";

  return { name, contactName, email, phone, note: note.slice(0, 5000) };
}
