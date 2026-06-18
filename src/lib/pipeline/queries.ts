import { createClient } from "@/lib/supabase/server";
import type { Customer, StageId } from "@/lib/pipeline/data";

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
  return (data as CustomerRow[]).map(rowToCustomer);
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
