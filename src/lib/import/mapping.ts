// Reine Hilfslogik für den Import (PROJ-3): Spalten-Auto-Zuordnung,
// Zahl-Erkennung, Werte-Vorschlag (lokaler Fallback) und das Vorbereiten
// der Zeilen (Validierung + Dubletten-Erkennung innerhalb der Datei).
// Bewusst ohne React/Server – damit gut testbar.
import type { CustomerInput } from "@/lib/pipeline/schema";
import { CATEGORY_OPTIONS } from "@/lib/pipeline/data";

export type CrmFieldKey =
  | "name"
  | "contactName"
  | "phone"
  | "email"
  | "address"
  | "plz"
  | "city"
  | "category"
  | "source"
  | "monthlyValue";

/** Leerer Wert in der Spaltenzuordnung = „nicht importieren". */
export const IGNORE = "";
export type MappingTarget = CrmFieldKey | typeof IGNORE;

export interface CrmFieldDef {
  key: CrmFieldKey;
  label: string;
  required?: boolean;
}

export const CRM_FIELDS: CrmFieldDef[] = [
  { key: "name", label: "Firmenname", required: true },
  { key: "contactName", label: "Ansprechpartner" },
  { key: "phone", label: "Telefon" },
  { key: "email", label: "E-Mail" },
  { key: "address", label: "Adresse" },
  { key: "plz", label: "PLZ" },
  { key: "city", label: "Ort" },
  { key: "category", label: "Kategorie" },
  { key: "source", label: "Quelle" },
  { key: "monthlyValue", label: "Monatswert (€)" },
];

// Stichwörter pro Feld (deutsch + typische Pipedrive-Exportnamen).
const SYNONYMS: Record<CrmFieldKey, string[]> = {
  name: ["firma", "firmenname", "name", "unternehmen", "organization", "organisation", "company", "kunde"],
  contactName: ["ansprechpartner", "kontakt", "contact", "contactperson", "person", "vorname", "nachname"],
  phone: ["telefon", "tel", "phone", "telefonnummer", "mobil", "handy", "festnetz"],
  email: ["email", "mail", "emailadresse"],
  address: ["adresse", "strasse", "straße", "street", "address", "anschrift"],
  plz: ["plz", "postleitzahl", "zip", "postal", "postalcode"],
  city: ["ort", "stadt", "city", "town"],
  category: ["kategorie", "category", "branche", "typ", "art", "label", "segment"],
  source: ["quelle", "source", "herkunft", "kanal", "channel"],
  monthlyValue: ["monatswert", "wert", "value", "betrag", "umsatz", "monatlich", "monthly", "dealvalue", "amount", "preis"],
};

function normalize(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9äöüß]/g, "");
}

/**
 * Schlägt für jede Spaltenüberschrift das am besten passende CRM-Feld vor.
 * Jedes Feld wird höchstens einer Spalte zugeordnet (erste Übereinstimmung gewinnt).
 */
export function autoSuggestMapping(
  headers: string[],
): Record<string, MappingTarget> {
  const used = new Set<CrmFieldKey>();
  const result: Record<string, MappingTarget> = {};

  for (const header of headers) {
    const n = normalize(header);
    let match: MappingTarget = IGNORE;

    for (const field of CRM_FIELDS) {
      if (used.has(field.key)) continue;
      const hit = SYNONYMS[field.key].some((syn) => {
        const ns = normalize(syn);
        if (!ns) return false;
        if (n === ns) return true;
        if (n.includes(ns)) return true;
        // Abkürzungen (z.B. „Tel" -> „telefon") nur ab Länge 3
        if (n.length >= 3 && ns.includes(n)) return true;
        return false;
      });
      if (hit) {
        match = field.key;
        break;
      }
    }

    if (match) used.add(match as CrmFieldKey);
    result[header] = match;
  }

  return result;
}

/**
 * Erkennt gängige deutsche und englische Zahlenformate.
 * "1.200,50 €" -> 1200.5 · "1.200" -> 1200 · "1234" -> 1234 · "1,5" -> 1.5
 * Gibt null zurück, wenn keine Zahl erkennbar ist.
 */
export function parseGermanNumber(input: string): number | null {
  if (!input) return null;
  let s = input.trim();
  if (!s) return null;
  s = s.replace(/[€$\s]/g, "");
  if (s === "") return null;

  if (s.includes(",")) {
    // Komma = Dezimaltrenner; Punkte sind Tausendertrenner
    s = s.replace(/\./g, "").replace(",", ".");
  } else if (/^-?\d{1,3}(\.\d{3})+$/.test(s)) {
    // Nur Punkte als Tausendertrenner (z.B. 1.200 oder 1.200.000)
    s = s.replace(/\./g, "");
  }

  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  Arztpraxis: ["arzt", "praxis", "zahn", "medizin", "klinik", "doctor", "dental", "therapie"],
  Kanzlei: ["kanzlei", "anwalt", "recht", "steuer", "notar", "law", "legal"],
  Industrie: ["industrie", "produktion", "fabrik", "werk", "logistik", "lager", "metall", "bau"],
  Fitnessstudio: ["fitness", "gym", "sport", "studio"],
  Büro: ["büro", "buero", "office", "agentur", "beratung", "consulting", "verwaltung", "finanz", "versicherung", "it", "software", "marketing", "immobilien"],
};

/**
 * Lokaler Vorschlag (ohne KI) für einen Kategorie-Wert.
 * Gibt eine der festen CRM-Kategorien zurück oder "" (kein Treffer).
 * Dient als Fallback, wenn kein KI-Schlüssel hinterlegt ist (/backend ersetzt
 * dies bei vorhandenem Schlüssel durch einen KI-Vorschlag).
 */
export function localGuessCategory(value: string): string {
  const n = normalize(value);
  if (!n) return "";
  const exact = CATEGORY_OPTIONS.find((opt) => normalize(opt) === n);
  if (exact) return exact;
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some((kw) => n.includes(normalize(kw)))) return category;
  }
  return "";
}

/** Ein Import-Vorgang aus dem Import-Verlauf (PROJ-3). */
export interface ImportRun {
  id: string;
  createdAt: string;
  fileName: string;
  imported: number;
  skipped: number;
  warnings: number;
  status: "completed" | "undone";
}

/**
 * Wertet die KI-Antwort zum Kategorie-/Quelle-Vorschlag aus.
 * Übernimmt pro Eingabewert nur Vorschläge, die zur erlaubten Optionsliste passen.
 */
export function parseSuggestionMap(
  raw: unknown,
  values: string[],
  options: readonly string[],
): Record<string, string> {
  const result: Record<string, string> = {};
  if (!raw || typeof raw !== "object") return result;
  const obj = raw as Record<string, unknown>;
  for (const value of values) {
    const suggested = obj[value];
    if (typeof suggested === "string" && options.includes(suggested)) {
      result[value] = suggested;
    }
  }
  return result;
}

export type RowStatus = "import" | "dupe-file" | "error";

export interface PreparedRow {
  line: number;
  input: CustomerInput;
  warnings: string[];
  status: RowStatus;
  errorReason?: string;
  rawName: string;
}

export interface ImportSummary {
  total: number;
  toImport: number;
  dupesInFile: number;
  errors: number;
  warnings: number;
}

export interface PrepareResult {
  rows: PreparedRow[];
  summary: ImportSummary;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function invertMapping(
  mapping: Record<string, MappingTarget>,
): Partial<Record<CrmFieldKey, string>> {
  const fieldToHeader: Partial<Record<CrmFieldKey, string>> = {};
  for (const [header, target] of Object.entries(mapping)) {
    if (target && !fieldToHeader[target]) {
      fieldToHeader[target] = header;
    }
  }
  return fieldToHeader;
}

/** Eindeutige, nicht-leere Werte einer zugeordneten Spalte (in Reihenfolge des Auftretens). */
export function getDistinctValues(
  rows: Record<string, string>[],
  mapping: Record<string, MappingTarget>,
  field: CrmFieldKey,
): string[] {
  const header = invertMapping(mapping)[field];
  if (!header) return [];
  const seen = new Set<string>();
  const result: string[] = [];
  for (const row of rows) {
    const value = (row[header] ?? "").trim();
    if (value && !seen.has(value)) {
      seen.add(value);
      result.push(value);
    }
  }
  return result;
}

/**
 * Bereitet alle Datenzeilen vor: baut den Kunden-Datensatz, prüft Felder,
 * erkennt Dubletten innerhalb der Datei und sammelt Warnungen.
 * Hinweis: Dubletten gegen den vorhandenen Bestand prüft erst der Server (/backend).
 */
export function prepareRows(
  dataRows: Record<string, string>[],
  mapping: Record<string, MappingTarget>,
  categoryMap: Record<string, string>,
  sourceMap: Record<string, string>,
): PrepareResult {
  const fieldToHeader = invertMapping(mapping);
  const get = (row: Record<string, string>, key: CrmFieldKey): string => {
    const header = fieldToHeader[key];
    return header ? (row[header] ?? "").trim() : "";
  };

  const rows: PreparedRow[] = [];
  const seenNames = new Set<string>();
  let toImport = 0;
  let dupesInFile = 0;
  let errors = 0;
  let warnings = 0;

  dataRows.forEach((row, index) => {
    const line = index + 1;
    const name = get(row, "name");

    if (!name) {
      rows.push({
        line,
        input: { name: "" },
        warnings: [],
        status: "error",
        errorReason: "Kein Firmenname",
        rawName: "",
      });
      errors++;
      return;
    }

    const rowWarnings: string[] = [];
    const input: CustomerInput = { name };

    const contactName = get(row, "contactName");
    if (contactName) input.contactName = contactName;

    const phone = get(row, "phone");
    if (phone) input.phone = phone;

    const email = get(row, "email");
    if (email) {
      if (EMAIL_RE.test(email)) input.email = email;
      else rowWarnings.push("E-Mail ungültig – leer gelassen");
    }

    const address = get(row, "address");
    if (address) input.address = address;

    const plz = get(row, "plz");
    if (plz) input.plz = plz;

    const city = get(row, "city");
    if (city) input.city = city;

    const categoryRaw = get(row, "category");
    if (categoryRaw) {
      const mapped = categoryRaw in categoryMap ? categoryMap[categoryRaw] : categoryRaw;
      if (mapped) input.category = mapped;
    }

    const sourceRaw = get(row, "source");
    if (sourceRaw) {
      const mapped = sourceRaw in sourceMap ? sourceMap[sourceRaw] : sourceRaw;
      if (mapped) input.source = mapped;
    }

    const monthlyRaw = get(row, "monthlyValue");
    if (monthlyRaw) {
      const n = parseGermanNumber(monthlyRaw);
      if (n !== null && n >= 0) input.monthlyValue = n;
      else rowWarnings.push("Monatswert ist keine gültige Zahl – leer gelassen");
    }

    const nameKey = name.toLowerCase();
    if (seenNames.has(nameKey)) {
      rows.push({ line, input, warnings: rowWarnings, status: "dupe-file", rawName: name });
      dupesInFile++;
      return;
    }
    seenNames.add(nameKey);

    if (rowWarnings.length > 0) warnings++;
    toImport++;
    rows.push({ line, input, warnings: rowWarnings, status: "import", rawName: name });
  });

  return {
    rows,
    summary: { total: dataRows.length, toImport, dupesInFile, errors, warnings },
  };
}
