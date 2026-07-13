"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import {
  isAngebotTemplate,
  addWorkingDays,
  type RuleKey,
} from "@/lib/automation/data";
import { isRuleEnabled } from "@/lib/automation/queries";
import { ACTIVITY_SELECT, rowToActivity } from "@/lib/activities/queries";
import { todayInBerlin, type Activity } from "@/lib/activities/data";

type Result<T> = { ok: true; data: T } | { ok: false; error: string };

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

/** Regel an-/ausschalten (Automatik-Seite). */
export async function setRuleEnabled(
  key: RuleKey,
  enabled: boolean,
): Promise<Result<null>> {
  const { supabase, user } = await requireUser();
  if (!user) return { ok: false, error: "Nicht angemeldet" };

  const { error } = await supabase
    .from("automation_rules")
    .upsert({ key, enabled }, { onConflict: "key" });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/automatik");
  return { ok: true, data: null };
}

export interface EmailAutomationResult {
  movedToStage: string | null;
  activity: Activity | null;
}

/**
 * Automatik 2: Wird eine Mail mit der Vorlage „Angebot" gesendet und die Regel
 * ist aktiv, wandert der Kunde in „Nachfassen" und es entsteht eine Aktivität
 * „Nachfassen" 2 Werktage später. Sonst passiert nichts.
 * Wird nach erfolgreichem Versand aufgerufen.
 */
export async function onEmailSent(
  customerId: string,
  appliedTemplateName?: string,
): Promise<Result<EmailAutomationResult>> {
  const none: EmailAutomationResult = { movedToStage: null, activity: null };
  if (!isAngebotTemplate(appliedTemplateName)) return { ok: true, data: none };

  const { supabase, user } = await requireUser();
  if (!user) return { ok: true, data: none };

  if (!(await isRuleEnabled("angebot_sent_to_nachfassen"))) {
    return { ok: true, data: none };
  }

  // Kunde in „Nachfassen" verschieben.
  await supabase.from("customers").update({ stage_id: "nachfassen" }).eq("id", customerId);

  // Aktivität „Nachfassen" 2 Werktage später anlegen.
  const dueDate = addWorkingDays(todayInBerlin(), 2);
  const { data: actRow } = await supabase
    .from("activities")
    .insert({
      customer_id: customerId,
      type: "Nachfassen",
      due_date: dueDate,
      note: "Automatisch nach Angebot-Versand",
      created_by: user.id,
    })
    .select(ACTIVITY_SELECT)
    .single();

  revalidatePath(`/kunde/${customerId}`);
  revalidatePath("/");

  return {
    ok: true,
    data: {
      movedToStage: "nachfassen",
      activity: actRow ? rowToActivity(actRow as never) : null,
    },
  };
}
