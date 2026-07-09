import { createClient } from "@/lib/supabase/server";
import type { Signature } from "@/lib/signature/data";

/** Signatur des angemeldeten Nutzers laden (leer, wenn noch keine angelegt). */
export async function getSignature(): Promise<Signature> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { bodyHtml: "" };

  const { data } = await supabase
    .from("user_signatures")
    .select("body_html")
    .eq("user_id", user.id)
    .maybeSingle();

  return { bodyHtml: (data as { body_html: string } | null)?.body_html ?? "" };
}
