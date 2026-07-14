import { createClient } from "@/lib/supabase/server";

export const DEFAULT_INBOUND_LABEL = "CRM-Anfrage";

async function getSetting(key: string): Promise<string | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("automation_settings")
    .select("value")
    .eq("key", key)
    .maybeSingle();
  return (data as { value: string | null } | null)?.value ?? null;
}

/** Gmail-Label, das eine Anfrage kennzeichnet. */
export async function getInboundLabel(): Promise<string> {
  return (await getSetting("inbound_label")) || DEFAULT_INBOUND_LABEL;
}

/** Zeitpunkt der letzten Prüfung (ISO) oder null. */
export async function getInboundLastCheck(): Promise<string | null> {
  return getSetting("inbound_last_check");
}
