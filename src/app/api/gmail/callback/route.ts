import { NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { connectFromCode } from "@/lib/email/gmail";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Rückkehr von Google: Code gegen Tokens tauschen und Verbindung speichern. */
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const origin = url.origin;
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const oauthError = url.searchParams.get("error");

  const savedState = req.cookies.get("gmail_oauth_state")?.value;
  const nextCookie = req.cookies.get("gmail_oauth_next")?.value || "/";
  const next = nextCookie.startsWith("/") ? nextCookie : "/";

  function back(flag: string) {
    const u = new URL(next, origin);
    u.searchParams.set("gmail", flag);
    const res = NextResponse.redirect(u);
    res.cookies.delete("gmail_oauth_state");
    res.cookies.delete("gmail_oauth_next");
    return res;
  }

  if (oauthError) return back("denied");
  if (!code || !state || !savedState || state !== savedState) return back("error");

  // Verbinden darf nur ein angemeldeter Nutzer.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL("/login", origin));

  try {
    await connectFromCode(code, `${origin}/api/gmail/callback`, user.id);
    return back("connected");
  } catch {
    return back("error");
  }
}
