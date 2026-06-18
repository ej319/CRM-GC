import { describe, it, expect, vi } from "vitest";

// Der Supabase-Server-Client zieht `next/headers` herein; für den reinen
// Mapper-Test mocken wir ihn weg, damit der Import keine Nebenwirkungen hat.
vi.mock("@/lib/supabase/server", () => ({ createClient: vi.fn() }));

import { rowToCustomer } from "./queries";

const baseRow = {
  id: "11111111-1111-1111-1111-111111111111",
  name: "Acme GmbH",
  contact_name: "",
  phone: "",
  email: "",
  address: "",
  plz: "",
  city: "",
  category: "",
  source: "",
  monthly_value: null,
  stage_id: "lead",
  updated_at: "2026-06-18T10:00:00Z",
};

describe("rowToCustomer", () => {
  it("mappt snake_case-Spalten auf camelCase-Felder", () => {
    const cust = rowToCustomer({
      ...baseRow,
      contact_name: "Max Mustermann",
      city: "Berlin",
      stage_id: "anfrage",
    });
    expect(cust.id).toBe(baseRow.id);
    expect(cust.name).toBe("Acme GmbH");
    expect(cust.contactName).toBe("Max Mustermann");
    expect(cust.city).toBe("Berlin");
    expect(cust.stageId).toBe("anfrage");
    expect(cust.updatedAt).toBe(baseRow.updated_at);
  });

  it("wandelt leere Text-Spalten in undefined um", () => {
    const cust = rowToCustomer(baseRow);
    expect(cust.contactName).toBeUndefined();
    expect(cust.phone).toBeUndefined();
    expect(cust.email).toBeUndefined();
    expect(cust.city).toBeUndefined();
    expect(cust.category).toBeUndefined();
  });

  it("wandelt monthly_value (null/String/Zahl) korrekt um", () => {
    expect(rowToCustomer(baseRow).monthlyValue).toBeUndefined();
    expect(rowToCustomer({ ...baseRow, monthly_value: "150.5" }).monthlyValue).toBe(
      150.5,
    );
    expect(rowToCustomer({ ...baseRow, monthly_value: 0 }).monthlyValue).toBe(0);
  });

  it("setzt die Aktivitätsfelder bis PROJ-5 auf leer/none", () => {
    const cust = rowToCustomer(baseRow);
    expect(cust.lastActivityAt).toBeNull();
    expect(cust.activityStatus).toBe("none");
  });
});
