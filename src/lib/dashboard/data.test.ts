import { describe, it, expect } from "vitest";
import { buildDashboard, formatEuro } from "./data";
import type { Customer, Stage } from "@/lib/pipeline/data";
import type { Activity } from "@/lib/activities/data";

const stages: Stage[] = [
  { id: "lead", name: "Lead", color: "#000" },
  { id: "gewonnen", name: "Gewonnen", color: "#0f0", isWon: true },
  { id: "verloren", name: "Verloren", color: "#f00", isLost: true },
];

function cust(partial: Partial<Customer>): Customer {
  return {
    id: Math.random().toString(),
    name: "K",
    stageId: "lead",
    updatedAt: "2026-07-13T00:00:00Z",
    ...partial,
  } as Customer;
}

function act(partial: Partial<Activity>): Activity {
  return {
    id: Math.random().toString(),
    customerId: "c1",
    type: "Anruf",
    dueDate: "2026-07-13",
    ...partial,
  };
}

const TODAY = "2026-07-13";

describe("buildDashboard", () => {
  const customers: Customer[] = [
    cust({ stageId: "lead", monthlyValue: 100 }),
    cust({ stageId: "lead", monthlyValue: 200 }),
    cust({ stageId: "gewonnen", monthlyValue: 500 }),
    cust({ stageId: "verloren", monthlyValue: 999 }),
  ];
  const activities: Activity[] = [
    act({ dueDate: "2026-07-10" }), // überfällig
    act({ dueDate: TODAY }), // heute
    act({ dueDate: "2026-07-20" }), // zukünftig
    act({ dueDate: "2026-07-01", completedAt: "2026-07-02T10:00:00Z" }), // erledigt
  ];

  const d = buildDashboard(customers, stages, activities, TODAY);

  it("zählt Kunden gesamt und aktiv (ohne gewonnen/verloren)", () => {
    expect(d.totalCustomers).toBe(4);
    expect(d.activeCustomers).toBe(2);
  });

  it("summiert nur die aktive Pipeline (monatlich)", () => {
    expect(d.pipelineValue).toBe(300);
  });

  it("zählt gewonnen/verloren separat", () => {
    expect(d.wonCount).toBe(1);
    expect(d.lostCount).toBe(1);
  });

  it("zählt fällige (überfällig+heute) und offene Aktivitäten", () => {
    expect(d.dueCount).toBe(2);
    expect(d.openActivities).toBe(3);
  });

  it("liefert Phasen-Statistik + maxStageCount", () => {
    expect(d.perStage.find((s) => s.id === "lead")?.count).toBe(2);
    expect(d.maxStageCount).toBe(2);
  });
});

describe("formatEuro", () => {
  it("formatiert mit Tausenderpunkt", () => {
    expect(formatEuro(1250)).toBe("1.250 €");
    expect(formatEuro(0)).toBe("0 €");
  });
});
