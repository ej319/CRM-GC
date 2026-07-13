// Typen, Phasen-Definition und Hilfsfunktionen für die Pipeline (PROJ-2).
// Die Phasen sind zusätzlich als Tabelle in Supabase angelegt (gleiche IDs);
// diese Konstante liefert Reihenfolge, Namen und Farben für die Oberfläche.

export const STAGE_IDS = [
  "kalter_kontakt",
  "gespraech",
  "anfrage",
  "lead",
  "vor_ort",
  "angebotserstellung",
  "nachfassen",
  "angesprochen",
  "gewonnen",
  "verloren",
] as const;

export type StageId = (typeof STAGE_IDS)[number];

export interface Stage {
  id: StageId;
  name: string;
  color: string;
  isWon?: boolean;
  isLost?: boolean;
}

export const STAGES: Stage[] = [
  { id: "kalter_kontakt", name: "Kalter Kontakt", color: "#64748b" },
  { id: "gespraech", name: "Gespräch aufgenommen", color: "#0ea5e9" },
  { id: "anfrage", name: "Anfrage", color: "#6366f1" },
  { id: "lead", name: "Lead", color: "#8b5cf6" },
  { id: "vor_ort", name: "Vor Ort Termin", color: "#f59e0b" },
  { id: "angebotserstellung", name: "Angebotserstellung", color: "#d946ef" },
  { id: "nachfassen", name: "Nachfassen", color: "#0891b2" },
  { id: "angesprochen", name: "Angesprochen", color: "#14b8a6" },
  { id: "gewonnen", name: "Gewonnen", color: "#22c55e", isWon: true },
  { id: "verloren", name: "Verloren", color: "#ef4444", isLost: true },
];

export const CATEGORY_OPTIONS = [
  "Büro",
  "Arztpraxis",
  "Kanzlei",
  "Industrie",
  "Fitnessstudio",
  "Sonstige",
] as const;

export const SOURCE_OPTIONS = ["Google", "Sonstige"] as const;

export const CATEGORY_COLORS: Record<string, string> = {
  Büro: "#0ea5e9",
  Arztpraxis: "#22c55e",
  Kanzlei: "#8b5cf6",
  Industrie: "#64748b",
  Fitnessstudio: "#f59e0b",
  Sonstige: "#94a3b8",
};

export type ActivityStatus = "today" | "future" | "overdue" | "none";

export interface Customer {
  id: string;
  name: string;
  contactName?: string;
  phone?: string;
  email?: string;
  address?: string;
  plz?: string;
  city?: string;
  category?: string;
  source?: string;
  monthlyValue?: number;
  stageId: StageId;
  updatedAt: string;
  lastActivityAt?: string | null;
  // Echte Marker-Logik liefert PROJ-5 (Aktivitäten); bis dahin "none".
  activityStatus?: ActivityStatus;
}

export type SortKey = "last_activity" | "alpha" | "value" | "category";

export function sortCustomers(list: Customer[], key: SortKey): Customer[] {
  const copy = [...list];
  switch (key) {
    case "alpha":
      return copy.sort((a, b) => a.name.localeCompare(b.name, "de"));
    case "value":
      return copy.sort((a, b) => (b.monthlyValue ?? -1) - (a.monthlyValue ?? -1));
    case "category":
      return copy.sort((a, b) =>
        (a.category ?? "ZZZ").localeCompare(b.category ?? "ZZZ", "de"),
      );
    case "last_activity":
    default:
      return copy.sort((a, b) => {
        // Kunden ohne Aktivität zuerst (ganz oben)
        const aHas = a.lastActivityAt ? 1 : 0;
        const bHas = b.lastActivityAt ? 1 : 0;
        if (aHas !== bHas) return aHas - bHas;
        if (!a.lastActivityAt || !b.lastActivityAt) return 0;
        return b.lastActivityAt.localeCompare(a.lastActivityAt);
      });
  }
}
