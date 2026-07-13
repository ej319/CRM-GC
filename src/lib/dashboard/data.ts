// Reine Aggregations-Logik für das Dashboard (PROJ-12). Ohne Server-/Browser-
// Abhängigkeiten, damit die Kennzahlen isoliert testbar sind.
import type { Customer, Stage } from "@/lib/pipeline/data";
import { dueReminders, isOpen, type Activity } from "@/lib/activities/data";

export interface StageStat {
  id: string;
  name: string;
  color: string;
  count: number;
  value: number; // Summe monatlicher Wert in dieser Phase
  isWon?: boolean;
  isLost?: boolean;
}

export interface DashboardStats {
  totalCustomers: number;
  /** Kunden in aktiven Phasen (nicht gewonnen/verloren). */
  activeCustomers: number;
  /** Summe monatlicher Wert der aktiven Pipeline. */
  pipelineValue: number;
  wonCount: number;
  lostCount: number;
  dueCount: number;
  openActivities: number;
  perStage: StageStat[];
  /** Höchste Kundenzahl einer Phase (für die Balken-Skalierung). */
  maxStageCount: number;
}

export function buildDashboard(
  customers: Customer[],
  stages: Stage[],
  openActivities: Activity[],
  today?: string,
): DashboardStats {
  const perStage: StageStat[] = stages.map((s) => {
    const inStage = customers.filter((c) => c.stageId === s.id);
    return {
      id: s.id,
      name: s.name,
      color: s.color,
      count: inStage.length,
      value: inStage.reduce((sum, c) => sum + (c.monthlyValue ?? 0), 0),
      isWon: s.isWon,
      isLost: s.isLost,
    };
  });

  const active = perStage.filter((s) => !s.isWon && !s.isLost);
  const won = perStage.find((s) => s.isWon);
  const lost = perStage.find((s) => s.isLost);
  const openList = openActivities.filter(isOpen);

  return {
    totalCustomers: customers.length,
    activeCustomers: active.reduce((sum, s) => sum + s.count, 0),
    pipelineValue: active.reduce((sum, s) => sum + s.value, 0),
    wonCount: won?.count ?? 0,
    lostCount: lost?.count ?? 0,
    dueCount: dueReminders(openList, today).length,
    openActivities: openList.length,
    perStage,
    maxStageCount: perStage.reduce((max, s) => Math.max(max, s.count), 0),
  };
}

/** Ganzzahliger Euro-Betrag mit Tausenderpunkt, z. B. „1.250 €". */
export function formatEuro(value: number): string {
  const rounded = Math.round(value || 0);
  return `${rounded.toLocaleString("de-DE")} €`;
}
