"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { listInquiries, GmailReconnectError } from "@/lib/email/gmail";
import { isRuleEnabled } from "@/lib/automation/queries";
import { getInboundLabel, getInboundLastCheck } from "@/lib/inbound/queries";
import { parseInquiry } from "@/lib/inbound/parse";
import { todayInBerlin } from "@/lib/activities/data";

type Result<T> = { ok: true; data: T } | { ok: false; error: string };

export interface InboundCheckResult {
  created: number;
  /** true = Gmail muss einmal neu verbunden werden (Lese-Erlaubnis fehlt). */
  needsReconnect: boolean;
}

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

/** Anfrage-Label speichern (Automatik-Seite). */
export async function setInboundLabel(label: string): Promise<Result<null>> {
  const clean = label.trim();
  if (!clean) return { ok: false, error: "Bitte ein Label angeben." };

  const { supabase, user } = await requireUser();
  if (!user) return { ok: false, error: "Nicht angemeldet" };

  const { error } = await supabase
    .from("automation_settings")
    .upsert({ key: "inbound_label", value: clean }, { onConflict: "key" });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/automatik");
  return { ok: true, data: null };
}

/**
 * Automatik 1: Neue Mails mit dem Anfrage-Label auslesen und je Mail
 * einen Kunden in „Anfrage" + Notiz + Aktivität „Anruf" (heute) anlegen.
 * Bereits verarbeitete Mails werden übersprungen (Dedup).
 */
export async function checkInboundEmails(
  force = false,
): Promise<Result<InboundCheckResult>> {
  const { supabase, user } = await requireUser();
  if (!user) return { ok: false, error: "Nicht angemeldet" };

  if (!(await isRuleEnabled("inbound_email_to_lead"))) {
    return { ok: true, data: { created: 0, needsReconnect: false } };
  }

  // Drossel: automatische Prüfung höchstens alle 5 Minuten (Knopf erzwingt).
  if (!force) {
    const last = await getInboundLastCheck();
    if (last && Date.now() - new Date(last).getTime() < 5 * 60 * 1000) {
      return { ok: true, data: { created: 0, needsReconnect: false } };
    }
  }

  const label = await getInboundLabel();

  let messages;
  try {
    messages = await listInquiries(user.id, label, 25);
  } catch (err) {
    if (err instanceof GmailReconnectError) {
      if (err.message === "RECONNECT_READ") {
        return { ok: true, data: { created: 0, needsReconnect: true } };
      }
      if (err.message === "NOT_CONNECTED" || err.message === "NOT_CONFIGURED") {
        return { ok: true, data: { created: 0, needsReconnect: true } };
      }
      return { ok: true, data: { created: 0, needsReconnect: true } };
    }
    const msg = err instanceof Error ? err.message : "Postfach konnte nicht gelesen werden.";
    return { ok: false, error: msg };
  }

  let created = 0;
  for (const msg of messages) {
    // Schon verarbeitet? → überspringen.
    const { data: seen } = await supabase
      .from("inbound_processed")
      .select("gmail_message_id")
      .eq("gmail_message_id", msg.id)
      .maybeSingle();
    if (seen) continue;

    const parsed = parseInquiry(msg);

    const { data: customer, error: custErr } = await supabase
      .from("customers")
      .insert({
        name: parsed.name,
        email: parsed.email ?? "",
        phone: parsed.phone ?? "",
        contact_name: parsed.contactName ?? "",
        address: "",
        plz: "",
        city: "",
        category: "",
        source: "Sonstige",
        stage_id: "anfrage",
        created_by: user.id,
      })
      .select("id")
      .single();
    if (custErr || !customer) continue;

    const customerId = (customer as { id: string }).id;

    // Mail-Inhalt als Notiz sichern.
    await supabase.from("notes").insert({
      customer_id: customerId,
      body: parsed.note,
      author_id: user.id,
    });

    // Aktivität „Anruf" für heute.
    await supabase.from("activities").insert({
      customer_id: customerId,
      type: "Anruf",
      due_date: todayInBerlin(),
      note: "Automatisch aus eingehender Anfrage",
      created_by: user.id,
    });

    await supabase
      .from("inbound_processed")
      .insert({ gmail_message_id: msg.id, customer_id: customerId });

    created++;
  }

  await supabase
    .from("automation_settings")
    .upsert(
      { key: "inbound_last_check", value: new Date().toISOString() },
      { onConflict: "key" },
    );

  if (created > 0) {
    revalidatePath("/");
    revalidatePath("/aktivitaeten");
  }
  revalidatePath("/automatik");

  return { ok: true, data: { created, needsReconnect: false } };
}
