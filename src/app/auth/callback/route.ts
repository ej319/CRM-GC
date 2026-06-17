import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

/**
 * Rückkehr-Adresse nach der Google-Anmeldung.
 * Tauscht den Anmelde-Code gegen eine Sitzung und prüft die Allowlist.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=auth`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(`${origin}/login?error=auth`);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Allowlist-Prüfung: nur freigeschaltete Adressen dürfen rein.
  if (user) {
    const { data: allowed } = await supabase
      .from("allowed_emails")
      .select("email")
      .ilike("email", user.email ?? "")
      .maybeSingle();

    if (!allowed) {
      await supabase.auth.signOut();
      return NextResponse.redirect(`${origin}/login?error=not_allowed`);
    }
  }

  return NextResponse.redirect(`${origin}/`);
}
