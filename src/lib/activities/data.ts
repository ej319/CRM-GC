// Typen, Typ-Liste und reine Hilfslogik für Aktivitäten (PROJ-5).

export const ACTIVITY_TYPES = [
  "Anruf",
  "Termin vor Ort",
  "Angebot machen",
  "Nachfassen",
  "Feedback-Gespräch",
] as const;

export interface Activity {
  id: string;
  customerId: string;
  type: string;
  dueDate: string; // "YYYY-MM-DD"
  dueTime?: string; // "HH:MM" (optional)
  note?: string;
  /** ISO-Zeitstempel, wenn erledigt; leer = offen. */
  completedAt?: string | null;
}

export type DueStatus = "overdue" | "today" | "future";
/** Wie der Board-Marker: today/future/overdue, oder "none" (keine offene Aktivität). */
export type MarkerStatus = DueStatus | "none";

/** Heutiges Datum in Europe/Berlin als "YYYY-MM-DD". */
export function todayInBerlin(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Berlin",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export function isOpen(activity: Activity): boolean {
  return !activity.completedAt;
}

/** Farbstatus einer Aktivität anhand ihres Fälligkeitsdatums (nur für offene relevant). */
export function dueStatus(dueDate: string, today: string = todayInBerlin()): DueStatus {
  if (dueDate < today) return "overdue";
  if (dueDate === today) return "today";
  return "future";
}

const STATUS_RANK: Record<DueStatus, number> = { overdue: 0, today: 1, future: 2 };

/**
 * Aggregierter Marker-Status eines Kunden aus seinen OFFENEN Aktivitäten:
 * überfällig vor heute vor zukünftig; keine offene → "none".
 */
export function markerStatus(
  activities: Activity[],
  today: string = todayInBerlin(),
): MarkerStatus {
  const open = activities.filter(isOpen);
  if (open.length === 0) return "none";
  return open
    .map((a) => dueStatus(a.dueDate, today))
    .sort((a, b) => STATUS_RANK[a] - STATUS_RANK[b])[0];
}

/**
 * Die dringendste offene Aktivität (für „Fokus"): überfällige zuerst (älteste),
 * sonst die zeitlich nächste.
 */
export function focusActivity(
  activities: Activity[],
  today: string = todayInBerlin(),
): Activity | null {
  const open = activities
    .filter(isOpen)
    .slice()
    .sort((a, b) => (a.dueDate + (a.dueTime ?? "")).localeCompare(b.dueDate + (b.dueTime ?? "")));
  if (open.length === 0) return null;
  const overdue = open.filter((a) => dueStatus(a.dueDate, today) === "overdue");
  return (overdue[0] ?? open.find((a) => dueStatus(a.dueDate, today) !== "overdue")) ?? open[0];
}

const MONTHS = [
  "Jan.", "Feb.", "März", "Apr.", "Mai", "Juni",
  "Juli", "Aug.", "Sep.", "Okt.", "Nov.", "Dez.",
];

/** Formatiert Fälligkeit als „22. Juni 2026" (+ „, 10:15", wenn Uhrzeit gesetzt). */
export function formatDue(dueDate: string, dueTime?: string): string {
  const [y, m, d] = dueDate.split("-").map(Number);
  if (!y || !m || !d) return dueDate;
  const base = `${d}. ${MONTHS[m - 1]} ${y}`;
  return dueTime ? `${base}, ${dueTime}` : base;
}
