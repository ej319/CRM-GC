// Reine Parser-Logik für eingehende Anfrage-Mails (PROJ-10, Automatik 1).
// Funktioniert für zwei typische Fälle:
//  a) der Interessent schreibt direkt  -> Absender ist der Kunde
//  b) ein Kontaktformular schickt die Mail -> Kundendaten stehen IM Text
// Ohne Server-/Browser-Abhängigkeiten, damit isoliert testbar.

export interface RawInquiry {
  fromName?: string;
  fromEmail?: string;
  subject?: string;
  bodyText?: string;
}

export interface ParsedInquiry {
  name: string;
  email?: string;
  phone?: string;
  /** Vollständiger Mail-Text – wird als Notiz am Kunden gespeichert. */
  note: string;
}

const EMAIL_ANY = /[^\s<>,;:"']+@[^\s<>,;:"']+\.[a-zA-Z]{2,}/;

/** Wert hinter einem Feldnamen aus dem Text ziehen, z. B. „Name: Max Muster". */
function labeled(body: string, labels: string[]): string | undefined {
  for (const label of labels) {
    const re = new RegExp(
      `(?:^|\\n)\\s*${label}\\s*[:\\-]\\s*(.+)`,
      "i",
    );
    const m = body.match(re);
    const val = m?.[1]?.trim();
    if (val) return val;
  }
  return undefined;
}

function cleanPhone(value: string): string | undefined {
  const m = value.match(/(?:\+\d{1,3}[\s/.-]?)?\(?\d[\d\s/().-]{5,}/);
  const p = m?.[0]?.trim();
  return p && p.replace(/\D/g, "").length >= 6 ? p : undefined;
}

/** Zieht Name, E-Mail, Telefon und den Notiztext aus einer Anfrage-Mail. */
export function parseInquiry(raw: RawInquiry): ParsedInquiry {
  const body = (raw.bodyText ?? "").trim();

  // E-Mail: bevorzugt ein beschriftetes Feld im Text (Kontaktformular),
  // sonst der Absender.
  const labeledEmailRaw = labeled(body, ["e-?mail", "email", "mail"]);
  const labeledEmail = labeledEmailRaw?.match(EMAIL_ANY)?.[0];
  const email = labeledEmail || raw.fromEmail || undefined;

  // Name: beschriftetes Feld, sonst Absendername, sonst aus der Adresse.
  const labeledName = labeled(body, ["name", "vor-?\\s?und\\s?nachname", "absender"]);
  const fallbackName =
    raw.fromName?.trim() ||
    (email ? email.split("@")[0].replace(/[._-]+/g, " ") : "") ||
    raw.subject?.trim() ||
    "Neue Anfrage";
  const name = (labeledName || fallbackName).slice(0, 120);

  // Telefon: beschriftetes Feld, sonst irgendeine Telefonnummer im Text.
  const labeledPhone = labeled(body, ["telefon", "tel\\.?", "handy", "mobil", "rufnummer"]);
  const phone = labeledPhone
    ? cleanPhone(labeledPhone)
    : cleanPhone(body) || undefined;

  const note =
    [raw.subject ? `Betreff: ${raw.subject}` : "", body].filter(Boolean).join("\n\n") ||
    "Eingehende Anfrage";

  return { name, email, phone, note: note.slice(0, 5000) };
}
