// Datenstruktur + Beispieldaten für das Pipeline-Board (PROJ-2).
// Die echte Datenbank-Anbindung kommt in /backend; hier dienen Beispiel-Kunden
// nur der Vorschau und zum Testen von Drag-and-Drop/Sortierung.

export type StageId =
  | "kalter_kontakt"
  | "gespraech"
  | "anfrage"
  | "lead"
  | "vor_ort"
  | "angesprochen"
  | "gewonnen"
  | "verloren";

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
  // Demo-Wert; die echte Marker-Logik liefert PROJ-5 (Aktivitäten).
  activityStatus?: ActivityStatus;
}

export type SortKey = "last_activity" | "alpha" | "value" | "category";

export const SAMPLE_CUSTOMERS: Customer[] = [
  { id: "c1", name: "Sonnenschein Bürocenter", contactName: "Petra Lang", phone: "+4930111111", email: "info@sonnenschein.de", city: "Berlin", category: "Büro", source: "Google", monthlyValue: 1200, stageId: "kalter_kontakt", updatedAt: "2026-06-17", lastActivityAt: "2026-06-17", activityStatus: "today" },
  { id: "c2", name: "Zahnarztpraxis Dr. Klein", contactName: "Dr. Klein", phone: "+4930222222", email: "praxis@drklein.de", city: "Berlin", category: "Arztpraxis", source: "Sonstige", monthlyValue: 650, stageId: "gespraech", updatedAt: "2026-06-12", lastActivityAt: "2026-06-12", activityStatus: "overdue" },
  { id: "c3", name: "Kanzlei Hofmann & Partner", contactName: "RA Hofmann", phone: "+4933333333", email: "kontakt@hofmann-partner.de", city: "Potsdam", category: "Kanzlei", source: "Google", monthlyValue: 900, stageId: "anfrage", updatedAt: "2026-06-16", lastActivityAt: "2026-06-20", activityStatus: "future" },
  { id: "c4", name: "FitPlus Studio", contactName: "Marco Renz", phone: "+4930444444", email: "team@fitplus.de", city: "Berlin", category: "Fitnessstudio", source: "Sonstige", monthlyValue: 1500, stageId: "lead", updatedAt: "2026-06-15", lastActivityAt: null, activityStatus: "none" },
  { id: "c5", name: "Müller Logistik GmbH", contactName: "Frau Müller", phone: "+4930555555", email: "office@mueller-logistik.de", city: "Berlin", category: "Industrie", source: "Google", monthlyValue: 2400, stageId: "vor_ort", updatedAt: "2026-06-17", lastActivityAt: "2026-06-17", activityStatus: "today" },
  { id: "c6", name: "Stadtklinik Nord", contactName: "Verwaltung", phone: "+4930666666", email: "verwaltung@stadtklinik-nord.de", city: "Berlin", category: "Arztpraxis", source: "Google", monthlyValue: 3200, stageId: "angesprochen", updatedAt: "2026-06-14", lastActivityAt: "2026-06-21", activityStatus: "future" },
  { id: "c7", name: "Werbeagentur Pixelwerk", contactName: "Jan Bauer", phone: "+4930777777", email: "hallo@pixelwerk.de", city: "Berlin", category: "Büro", source: "Sonstige", monthlyValue: 480, stageId: "gewonnen", updatedAt: "2026-06-10", lastActivityAt: null, activityStatus: "none" },
  { id: "c8", name: "Café Central", contactName: "Inhaber", phone: "+4930888888", email: "info@cafecentral.de", city: "Berlin", category: "Sonstige", source: "Sonstige", monthlyValue: 300, stageId: "verloren", updatedAt: "2026-06-08", lastActivityAt: "2026-06-05", activityStatus: "overdue" },
];

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
