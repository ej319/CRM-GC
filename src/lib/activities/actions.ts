"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import type { Activity } from "@/lib/activities/data";
import { ACTIVITY_SELECT, rowToActivity } from "@/lib/activities/queries";

type Result<T> = { ok: true; data: T } | { ok: false; error: string };

interface ActivityInput {
  type: string;
  dueDate: string;
  dueTime?: string;
  note?: string;
}

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

function toRow(input: ActivityInput) {
  return {
    type: input.type.trim(),
    due_date: input.dueDate,
    due_time: input.dueTime ? input.dueTime : null,
    note: (input.note ?? "").trim(),
  };
}

function validate(input: ActivityInput): string | null {
  if (!input.type?.trim()) return "Bitte einen Typ wählen.";
  if (!input.dueDate) return "Bitte ein Datum wählen.";
  return null;
}

function revalidate() {
  revalidatePath("/");
  revalidatePath("/aktivitaeten");
}

/** Neue Aktivität an einem Kunden anlegen. */
export async function createActivity(
  customerId: string,
  input: ActivityInput,
): Promise<Result<Activity>> {
  const err = validate(input);
  if (err) return { ok: false, error: err };
  const { supabase, user } = await requireUser();
  if (!user) return { ok: false, error: "Nicht angemeldet" };

  const { data, error } = await supabase
    .from("activities")
    .insert({ customer_id: customerId, ...toRow(input), created_by: user.id })
    .select(ACTIVITY_SELECT)
    .single();
  if (error || !data) {
    return { ok: false, error: error?.message ?? "Speichern fehlgeschlagen" };
  }
  revalidate();
  return { ok: true, data: rowToActivity(data as never) };
}

/** Aktivität abhaken (als erledigt markieren – bleibt erhalten). */
export async function completeActivity(id: string): Promise<Result<Activity>> {
  const { supabase, user } = await requireUser();
  if (!user) return { ok: false, error: "Nicht angemeldet" };

  const { data, error } = await supabase
    .from("activities")
    .update({ completed_at: new Date().toISOString() })
    .eq("id", id)
    .select(ACTIVITY_SELECT)
    .single();
  if (error || !data) {
    return { ok: false, error: error?.message ?? "Abhaken fehlgeschlagen" };
  }
  revalidate();
  return { ok: true, data: rowToActivity(data as never) };
}

/** Erledigte Aktivität wieder als offen markieren (Häkchen zurücknehmen). */
export async function reopenActivity(id: string): Promise<Result<Activity>> {
  const { supabase, user } = await requireUser();
  if (!user) return { ok: false, error: "Nicht angemeldet" };

  const { data, error } = await supabase
    .from("activities")
    .update({ completed_at: null })
    .eq("id", id)
    .select(ACTIVITY_SELECT)
    .single();
  if (error || !data) {
    return { ok: false, error: error?.message ?? "Zurücknehmen fehlgeschlagen" };
  }
  revalidate();
  return { ok: true, data: rowToActivity(data as never) };
}

/** Aktivität bearbeiten. */
export async function updateActivity(
  id: string,
  input: ActivityInput,
): Promise<Result<Activity>> {
  const err = validate(input);
  if (err) return { ok: false, error: err };
  const { supabase, user } = await requireUser();
  if (!user) return { ok: false, error: "Nicht angemeldet" };

  const { data, error } = await supabase
    .from("activities")
    .update(toRow(input))
    .eq("id", id)
    .select(ACTIVITY_SELECT)
    .single();
  if (error || !data) {
    return { ok: false, error: error?.message ?? "Speichern fehlgeschlagen" };
  }
  revalidate();
  return { ok: true, data: rowToActivity(data as never) };
}

/** Aktivität löschen. */
export async function deleteActivity(id: string): Promise<Result<null>> {
  const { supabase, user } = await requireUser();
  if (!user) return { ok: false, error: "Nicht angemeldet" };

  const { error } = await supabase.from("activities").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidate();
  return { ok: true, data: null };
}
