import { createClient } from "@/lib/supabase/server";
import type { RuleKey } from "@/lib/automation/data";

/** An/Aus-Zustand aller Automatik-Regeln als Map { key: enabled }. */
export async function getAutomationRules(): Promise<Record<string, boolean>> {
  const supabase = await createClient();
  const { data } = await supabase.from("automation_rules").select("key, enabled");
  const map: Record<string, boolean> = {};
  for (const r of (data ?? []) as { key: string; enabled: boolean }[]) {
    map[r.key] = r.enabled;
  }
  return map;
}

/** Ist eine bestimmte Regel aktiv? (false, wenn nicht vorhanden). */
export async function isRuleEnabled(key: RuleKey): Promise<boolean> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("automation_rules")
    .select("enabled")
    .eq("key", key)
    .maybeSingle();
  return (data as { enabled: boolean } | null)?.enabled ?? false;
}
