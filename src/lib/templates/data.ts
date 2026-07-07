// Typen + reine Platzhalter-Logik für E-Mail-Vorlagen (PROJ-9).
// Dieser Helfer ist bewusst frei von Server-/Browser-Abhängigkeiten, damit die
// Kernlogik (Anrede-Automatik, Ersatztexte, Betreff-Bereinigung) isoliert
// getestet werden kann. Er läuft im Browser beim Einfügen einer Vorlage.

export interface TemplateAttachment {
  id: string;
  fileName: string;
  fileSize: number;
  contentType?: string;
  storagePath: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string; // "" wenn keiner
  bodyHtml: string;
  /** Optionale Ersatztexte je Platzhalter-Token, z. B. { Firma: "unser Kunde" }. */
  placeholderDefaults: Record<string, string>;
  attachments: TemplateAttachment[];
  createdAt: string;
  updatedAt: string;
}

/** Kundenfelder, die für Platzhalter zur Verfügung stehen. */
export interface TemplateCustomerFields {
  name?: string | null;
  contactName?: string | null;
  address?: string | null;
  plz?: string | null;
  city?: string | null;
  category?: string | null;
}

export interface PlaceholderDef {
  /** Token ohne geschweifte Klammern, z. B. "Anrede". */
  token: string;
  label: string;
  /** Kann in der Vorlage einen eigenen Ersatztext bekommen (alle außer Anrede). */
  hasDefault: boolean;
}

/** Alle verfügbaren Platzhalter (Reihenfolge = Anzeige im „Einfügen"-Menü). */
export const TEMPLATE_PLACEHOLDERS: PlaceholderDef[] = [
  { token: "Anrede", label: "Anrede (automatisch)", hasDefault: false },
  { token: "Firma", label: "Firma", hasDefault: true },
  { token: "Ansprechpartner", label: "Ansprechpartner", hasDefault: true },
  { token: "Adresse", label: "Adresse", hasDefault: true },
  { token: "PLZ", label: "PLZ", hasDefault: true },
  { token: "Stadt", label: "Stadt", hasDefault: true },
  { token: "Kategorie", label: "Kategorie", hasDefault: true },
];

const FALLBACK_ANREDE = "Sehr geehrte Damen und Herren,";

function clean(value: string | null | undefined): string {
  return (value ?? "").trim();
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Baut die Zuordnung Token → einzusetzender Wert für einen konkreten Kunden.
 * {Anrede} ist fest automatisiert; alle anderen greifen bei leerem Kundenfeld
 * auf den (optionalen) Ersatztext der Vorlage zurück, sonst leer.
 */
function buildValueMap(
  customer: TemplateCustomerFields,
  defaults: Record<string, string>,
): Map<string, string> {
  const contact = clean(customer.contactName);
  const anrede = contact ? `Guten Tag ${contact},` : FALLBACK_ANREDE;

  const withFallback = (raw: string, token: string): string =>
    raw || clean(defaults[token]);

  return new Map<string, string>([
    ["Anrede", anrede],
    ["Firma", withFallback(clean(customer.name), "Firma")],
    ["Ansprechpartner", withFallback(contact, "Ansprechpartner")],
    ["Adresse", withFallback(clean(customer.address), "Adresse")],
    ["PLZ", withFallback(clean(customer.plz), "PLZ")],
    ["Stadt", withFallback(clean(customer.city), "Stadt")],
    ["Kategorie", withFallback(clean(customer.category), "Kategorie")],
  ]);
}

// Erlaubt Buchstaben inkl. deutscher Umlaute als Token-Namen.
const TOKEN_RE = /\{([A-Za-zÄÖÜäöüß]+)\}/g;

/**
 * Ersetzt bekannte {Platzhalter} durch die Kundenwerte.
 * - Unbekannte/vertippte Tokens (z. B. {Fimra}) bleiben unverändert stehen.
 * - html=true: Werte werden HTML-sicher eingesetzt (für den formatierten Text).
 * - html=false: reiner Text (für den Betreff); doppelte/führende Leerzeichen
 *   werden am Ende bereinigt, damit kein „kaputter" Betreff entsteht.
 */
export function fillPlaceholders(
  text: string,
  customer: TemplateCustomerFields,
  defaults: Record<string, string> = {},
  opts: { html?: boolean } = {},
): string {
  const map = buildValueMap(customer, defaults);
  const html = opts.html ?? false;

  const replaced = (text ?? "").replace(TOKEN_RE, (whole, token: string) => {
    if (!map.has(token)) return whole; // unbekannt → unverändert lassen
    const value = map.get(token) ?? "";
    return html ? escapeHtml(value) : value;
  });

  if (html) return replaced;
  // Betreff: mehrfach-/Rand-Leerzeichen glätten.
  return replaced.replace(/\s+/g, " ").trim();
}
