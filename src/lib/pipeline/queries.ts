import { createClient } from "@/lib/supabase/server";
import type { Customer, StageId } from "@/lib/pipeline/data";
import type { ImportRun } from "@/lib/import/mapping";
import { markerStatus, todayInBerlin, type Activity } from "@/lib/activities/data";

interface CustomerRow {
  id: string;
  name: string;
  contact_name: string;
  phone: string;
  email: string;
  address: string;
  plz: string;
  city: string;
  category: string;
  source: string;
  monthly_value: number | string | null;
  stage_id: string;
  updated_at: string;
}

export function rowToCustomer(row: CustomerRow): Customer {
  return {
    id: row.id,
    name: row.name,
    contactName: row.contact_name || undefined,
    phone: row.phone || undefined,
    email: row.email || undefined,
    address: row.address || undefined,
    plz: row.plz || undefined,
    city: row.city || undefined,
    category: row.category || undefined,
    source: row.source || undefined,
    monthlyValue: row.monthly_value != null ? Number(row.monthly_value) : undefined,
    stageId: row.stage_id as StageId,
    updatedAt: row.updated_at,
    lastActivityAt: null,
    activityStatus: "none",
  };
}

/** Alle Kunden laden (geteilte Team-Pipeline). */
export async function getCustomers(): Promise<Customer[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .order("updated_at", { ascending: false });
  if (error || !data) return [];
  const customers = (data as CustomerRow[]).map(rowToCustomer);

  // Offene Aktivitäten je Kunde laden → Marker-Status + früheste Fälligkeit.
  const { data: acts } = await supabase
    .from("activities")
    .select("customer_id, due_date")
    .is("completed_at", null);
  const today = todayInBerlin();
  const byCustomer = new Map<string, string[]>();
  for (const a of (acts ?? []) as { customer_id: string; due_date: string }[]) {
    const list = byCustomer.get(a.customer_id) ?? [];
    list.push(a.due_date);
    byCustomer.set(a.customer_id, list);
  }
  for (const c of customers) {
    const dates = byCustomer.get(c.id) ?? [];
    if (dates.length === 0) {
      c.activityStatus = "none";
      c.lastActivityAt = null;
    } else {
      const minimal: Activity[] = dates.map((d) => ({
        id: "",
        customerId: c.id,
        type: "",
        dueDate: d,
        completedAt: null,
      }));
      c.activityStatus = markerStatus(minimal, today);
      c.lastActivityAt = dates.slice().sort()[0]; // früheste offene Fälligkeit
    }
  }
  return customers;
}

/** Einen Kunden anhand der ID laden. */
export async function getCustomer(id: string): Promise<Customer | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error || !data) return null;
  return rowToCustomer(data as CustomerRow);
}

interface ImportRunRow {
  id: string;
  file_name: string;
  imported: number;
  skipped: number;
  warnings: number;
  status: string;
  created_at: string;
}

/** Bisherige Import-Vorgänge laden (für den Import-Verlauf, PROJ-3). */
export async function getImportRuns(): Promise<ImportRun[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("import_runs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);
  if (error || !data) return [];
  return (data as ImportRunRow[]).map((row) => ({
    id: row.id,
    fileName: row.file_name,
    imported: row.imported,
    skipped: row.skipped,
    warnings: row.warnings,
    status: row.status === "undone" ? "undone" : "completed",
    createdAt: row.created_at,
  }));
}
