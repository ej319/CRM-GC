// Liest eine Excel- (.xlsx) oder CSV-Datei im Browser ein (PROJ-3).
// Die Datei wird NICHT hochgeladen/gespeichert – nur lokal zur Verarbeitung gelesen.
import * as XLSX from "xlsx";

export interface ParsedFile {
  /** Spaltenüberschriften (erste nicht-leere Zeile der Datei). */
  headers: string[];
  /** Datenzeilen als Objekte: { "Spaltenname": "Wert" }. */
  rows: Record<string, string>[];
  sheetName: string;
}

/**
 * Liest die erste Tabelle einer Excel-/CSV-Datei.
 * Wirft einen verständlichen Fehler, wenn keine Tabelle/keine Datenzeilen vorhanden sind.
 */
export async function parseSpreadsheet(file: File): Promise<ParsedFile> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array" });

  const sheetName = workbook.SheetNames[0];
  if (!sheetName) {
    throw new Error("Die Datei enthält keine Tabelle.");
  }

  const sheet = workbook.Sheets[sheetName];
  const matrix = XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    raw: false,
    defval: "",
    blankrows: false,
  }) as unknown as unknown[][];

  // Zeilen, die irgendeinen Inhalt haben.
  const nonEmpty = matrix.filter((row) =>
    row.some((cell) => String(cell ?? "").trim() !== ""),
  );

  if (nonEmpty.length === 0) {
    throw new Error("Die Datei enthält keine Daten.");
  }

  const headerRow = nonEmpty[0].map((cell) => String(cell ?? "").trim());
  const headers = headerRow.map((h, i) => h || `Spalte ${i + 1}`);

  if (nonEmpty.length === 1) {
    throw new Error(
      "Die Datei enthält nur Überschriften, aber keine Datenzeilen.",
    );
  }

  const rows: Record<string, string>[] = [];
  for (let i = 1; i < nonEmpty.length; i++) {
    const row = nonEmpty[i];
    const obj: Record<string, string> = {};
    headers.forEach((header, idx) => {
      obj[header] = String(row[idx] ?? "").trim();
    });
    rows.push(obj);
  }

  return { headers, rows, sheetName };
}
