import "server-only";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Service-Role-Client: umgeht RLS und darf NUR im Servercode verwendet werden
 * (Gmail-Tokens lesen/schreiben, Tracking-Pixel ohne Login).
 *
 * Erfordert die Umgebungs-Variable SUPABASE_SERVICE_ROLE_KEY (geheim, nie im Browser).
 * Wirft bewusst, wenn sie fehlt – Aufrufer fangen das ab und behandeln es als
 * „Gmail nicht verbunden", damit Seiten ohne eingerichtete Variable nicht abstürzen.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY fehlt – Gmail-Funktion nicht eingerichtet.");
  }
  return createSupabaseClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
