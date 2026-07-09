"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { sanitizeEmailHtml } from "@/lib/email/sanitize";
import type { Signature } from "@/lib/signature/data";

type Result<T> = { ok: true; data: T } | { ok: false; error: string };

/** Signatur des angemeldeten Nutzers speichern (anlegen oder ändern). */
export async function saveSignature(bodyHtml: string): Promise<Result<Signature>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Nicht angemeldet" };

  // Signatur enthält evtl. eigene Bilder → mit demselben Filter wie Mails bereinigen.
  const clean = sanitizeEmailHtml(bodyHtml);

  const { error } = await supabase
    .from("user_signatures")
    .upsert({ user_id: user.id, body_html: clean }, { onConflict: "user_id" });
  if (error) return { ok: false, error: error.message };

  revalidatePath("/einstellungen");
  return { ok: true, data: { bodyHtml: clean } };
}
