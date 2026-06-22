import { describe, it, expect } from "vitest";
import {
  dueStatus,
  markerStatus,
  focusActivity,
  formatDue,
  type Activity,
} from "./data";

const TODAY = "2026-06-22";

function act(partial: Partial<Activity>): Activity {
  return {
    id: Math.random().toString(),
    customerId: "c1",
    type: "Anruf",
    dueDate: TODAY,
    ...partial,
  };
}

describe("dueStatus", () => {
  it("erkennt überfällig / heute / zukünftig", () => {
    expect(dueStatus("2026-06-21", TODAY)).toBe("overdue");
    expect(dueStatus("2026-06-22", TODAY)).toBe("today");
    expect(dueStatus("2026-06-23", TODAY)).toBe("future");
  });
});

describe("markerStatus", () => {
  it("gibt 'none' ohne offene Aktivität", () => {
    expect(markerStatus([], TODAY)).toBe("none");
    expect(
      markerStatus([act({ dueDate: "2026-06-20", completedAt: "2026-06-21T10:00:00Z" })], TODAY),
    ).toBe("none");
  });

  it("priorisiert überfällig vor heute vor zukünftig (nur offene)", () => {
    const list = [
      act({ dueDate: "2026-06-25" }), // future
      act({ dueDate: "2026-06-22" }), // today
      act({ dueDate: "2026-06-20" }), // overdue
    ];
    expect(markerStatus(list, TODAY)).toBe("overdue");
    expect(markerStatus([act({ dueDate: "2026-06-25" }), act({ dueDate: "2026-06-22" })], TODAY)).toBe("today");
    expect(markerStatus([act({ dueDate: "2026-06-25" })], TODAY)).toBe("future");
  });
});

describe("focusActivity", () => {
  it("wählt die älteste überfällige, sonst die nächste", () => {
    const list = [
      act({ id: "a", dueDate: "2026-06-25" }),
      act({ id: "b", dueDate: "2026-06-19" }),
      act({ id: "c", dueDate: "2026-06-20" }),
    ];
    expect(focusActivity(list, TODAY)?.id).toBe("b");
  });

  it("ignoriert erledigte", () => {
    const list = [
      act({ id: "done", dueDate: "2026-06-18", completedAt: "x" }),
      act({ id: "open", dueDate: "2026-06-24" }),
    ];
    expect(focusActivity(list, TODAY)?.id).toBe("open");
  });
});

describe("formatDue", () => {
  it("formatiert Datum und optionale Uhrzeit", () => {
    expect(formatDue("2026-06-22")).toBe("22. Juni 2026");
    expect(formatDue("2026-06-22", "10:15")).toBe("22. Juni 2026, 10:15");
  });
});
