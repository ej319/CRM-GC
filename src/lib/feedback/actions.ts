"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { createTicketSchema, statusSchema, type CreateTicketInput } from "@/lib/feedback/schema";
import { TICKET_SELECT, rowToTicket } from "@/lib/feedback/queries";
import type { Ticket, TicketStatus } from "@/lib/feedback/data";

type Result<T> = { ok: true; data: T } | { ok: false; error: string };

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

/** Neues Ticket anlegen. */
export async function createTicket(input: CreateTicketInput): Promise<Result<Ticket>> {
  const parsed = createTicketSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Ungültige Eingabe" };
  }
  const { kind, message, pageUrl } = parsed.data;

  const { supabase, user } = await requireUser();
  if (!user) return { ok: false, error: "Nicht angemeldet" };

  const { data, error } = await supabase
    .from("feedback_tickets")
    .insert({
      kind,
      message,
      page_url: pageUrl || null,
      created_by: user.id,
    })
    .select(TICKET_SELECT)
    .single();
  if (error || !data) {
    return { ok: false, error: error?.message ?? "Speichern fehlgeschlagen" };
  }
  revalidatePath("/feedback");
  return { ok: true, data: rowToTicket(data as never) };
}

/** Status eines Tickets ändern. */
export async function updateTicketStatus(
  id: string,
  status: TicketStatus,
): Promise<Result<Ticket>> {
  const parsed = statusSchema.safeParse(status);
  if (!parsed.success) return { ok: false, error: "Ungültiger Status" };

  const { supabase, user } = await requireUser();
  if (!user) return { ok: false, error: "Nicht angemeldet" };

  const { data, error } = await supabase
    .from("feedback_tickets")
    .update({ status: parsed.data })
    .eq("id", id)
    .select(TICKET_SELECT)
    .single();
  if (error || !data) {
    return { ok: false, error: error?.message ?? "Speichern fehlgeschlagen" };
  }
  return { ok: true, data: rowToTicket(data as never) };
}

/** Ticket löschen. */
export async function deleteTicket(id: string): Promise<Result<null>> {
  const { supabase, user } = await requireUser();
  if (!user) return { ok: false, error: "Nicht angemeldet" };

  const { error } = await supabase.from("feedback_tickets").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  return { ok: true, data: null };
}
