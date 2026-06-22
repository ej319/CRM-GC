"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import type { Note } from "@/lib/notes/data";
import { NOTE_SELECT, rowToNote } from "@/lib/notes/queries";

type Result<T> = { ok: true; data: T } | { ok: false; error: string };

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

/** Neue Notiz an einem Kunden anlegen. */
export async function createNote(
  customerId: string,
  body: string,
): Promise<Result<Note>> {
  const text = body.trim();
  if (!text) return { ok: false, error: "Notiz darf nicht leer sein" };

  const { supabase, user } = await requireUser();
  if (!user) return { ok: false, error: "Nicht angemeldet" };

  const { data, error } = await supabase
    .from("notes")
    .insert({ customer_id: customerId, body: text, author_id: user.id })
    .select(NOTE_SELECT)
    .single();
  if (error || !data) {
    return { ok: false, error: error?.message ?? "Speichern fehlgeschlagen" };
  }
  revalidatePath(`/kunde/${customerId}`);
  return { ok: true, data: rowToNote(data as never) };
}

/** Bestehende Notiz bearbeiten. */
export async function updateNote(
  id: string,
  body: string,
): Promise<Result<Note>> {
  const text = body.trim();
  if (!text) return { ok: false, error: "Notiz darf nicht leer sein" };

  const { supabase, user } = await requireUser();
  if (!user) return { ok: false, error: "Nicht angemeldet" };

  const { data, error } = await supabase
    .from("notes")
    .update({ body: text })
    .eq("id", id)
    .select(NOTE_SELECT)
    .single();
  if (error || !data) {
    return { ok: false, error: error?.message ?? "Speichern fehlgeschlagen" };
  }
  return { ok: true, data: rowToNote(data as never) };
}

/** Notiz löschen. */
export async function deleteNote(id: string): Promise<Result<null>> {
  const { supabase, user } = await requireUser();
  if (!user) return { ok: false, error: "Nicht angemeldet" };

  const { error } = await supabase.from("notes").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  return { ok: true, data: null };
}
