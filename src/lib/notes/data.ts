// Typen + Hilfsfunktionen für den Verlauf / die Notizen (PROJ-4).

export interface Note {
  id: string;
  body: string;
  authorName: string;
  createdAt: string; // ISO-Zeitstempel
  updatedAt?: string;
}

export type VerlaufFilter = "all" | "notes" | "activities" | "emails" | "files";

export const VERLAUF_FILTERS: { key: VerlaufFilter; label: string }[] = [
  { key: "all", label: "Alle" },
  { key: "notes", label: "Notizen" },
  { key: "activities", label: "Aktivitäten" },
  { key: "emails", label: "E-Mails" },
  { key: "files", label: "Dateien" },
];

/** Formatiert einen Zeitstempel für die Verlauf-Anzeige, z.B. „4. Juni 2026, 10:30". */
export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("de-DE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
