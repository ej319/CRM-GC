"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { customerInputSchema, type CustomerInput } from "@/lib/pipeline/schema";
import { rowToCustomer } from "@/lib/pipeline/queries";
import { STAGE_IDS, type Customer, type StageId } from "@/lib/pipeline/data";

type Result<T> = { ok: true; data: T } | { ok: false; error: string };

function inputToRow(input: CustomerInput) {
  const s = (v?: string) => (v ?? "").trim();
  return {
    name: input.name.trim(),
    contact_name: s(input.contactName),
    phone: s(input.phone),
    email: s(input.email),
    address: s(input.address),
    plz: s(input.plz),
    city: s(input.city),
    category: s(input.category),
    source: s(input.source),
    monthly_value:
      typeof input.monthlyValue === "number" ? input.monthlyValue : null,
  };
}

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

export async function createCustomer(
  input: CustomerInput,
): Promise<Result<Customer>> {
  const parsed = customerInputSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Ungültige Eingabe" };
  }
  const { supabase, user } = await requireUser();
  if (!user) return { ok: false, error: "Nicht angemeldet" };

  const { data, error } = await supabase
    .from("customers")
    .insert({ ...inputToRow(parsed.data), created_by: user.id })
    .select("*")
    .single();
  if (error || !data) {
    return { ok: false, error: error?.message ?? "Speichern fehlgeschlagen" };
  }
  revalidatePath("/");
  return { ok: true, data: rowToCustomer(data) };
}

export async function updateCustomer(
  id: string,
  input: CustomerInput,
): Promise<Result<Customer>> {
  const parsed = customerInputSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Ungültige Eingabe" };
  }
  const { supabase, user } = await requireUser();
  if (!user) return { ok: false, error: "Nicht angemeldet" };

  const { data, error } = await supabase
    .from("customers")
    .update(inputToRow(parsed.data))
    .eq("id", id)
    .select("*")
    .single();
  if (error || !data) {
    return { ok: false, error: error?.message ?? "Speichern fehlgeschlagen" };
  }
  revalidatePath("/");
  revalidatePath(`/kunde/${id}`);
  return { ok: true, data: rowToCustomer(data) };
}

export async function updateCustomerStage(
  id: string,
  stageId: StageId,
): Promise<Result<null>> {
  if (!STAGE_IDS.includes(stageId)) {
    return { ok: false, error: "Unbekannte Phase" };
  }
  const { supabase, user } = await requireUser();
  if (!user) return { ok: false, error: "Nicht angemeldet" };

  const { error } = await supabase
    .from("customers")
    .update({ stage_id: stageId })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/");
  return { ok: true, data: null };
}

export async function deleteCustomer(id: string): Promise<Result<null>> {
  const { supabase, user } = await requireUser();
  if (!user) return { ok: false, error: "Nicht angemeldet" };

  const { error } = await supabase.from("customers").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/");
  return { ok: true, data: null };
}
