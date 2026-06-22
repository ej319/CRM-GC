import { createClient } from "@/lib/supabase/server";
import type { Activity, ActivityRow } from "@/lib/activities/data";

export const ACTIVITY_SELECT =
  "id, customer_id, type, due_date, due_time, note, completed_at";

interface ActivityDbRow {
  id: string;
  customer_id: string;
  type: string;
  due_date: string;
  due_time: string | null;
  note: string | null;
  completed_at: string | null;
}

export function rowToActivity(row: ActivityDbRow): Activity {
  return {
    id: row.id,
    customerId: row.customer_id,
    type: row.type,
    dueDate: row.due_date,
    dueTime: row.due_time ? row.due_time.slice(0, 5) : undefined,
    note: row.note || undefined,
    completedAt: row.completed_at,
  };
}

/** Alle Aktivitäten eines Kunden (offene wie erledigte), nach Datum. */
export async function getCustomerActivities(
  customerId: string,
): Promise<Activity[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("activities")
    .select(ACTIVITY_SELECT)
    .eq("customer_id", customerId)
    .order("due_date", { ascending: true });
  if (error || !data) return [];
  return (data as ActivityDbRow[]).map(rowToActivity);
}

/** Alle OFFENEN Aktivitäten (für die zentrale Seite), nach Fälligkeit + Kundenname. */
export async function getOpenActivities(): Promise<ActivityRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("activities")
    .select(`${ACTIVITY_SELECT}, customers(name)`)
    .is("completed_at", null)
    .order("due_date", { ascending: true })
    .order("due_time", { ascending: true, nullsFirst: true });
  if (error || !data) return [];
  return (
    data as unknown as (ActivityDbRow & { customers: { name: string } | null })[]
  ).map((row) => ({
    ...rowToActivity(row),
    customerName: row.customers?.name ?? "—",
  }));
}
