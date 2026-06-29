import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";

import { createClient } from "@/lib/supabase/server";
import { buildAuthUrl, gmailConfigured } from "@/lib/email/gmail";
import { safeNextPath } from "@/lib/email/url";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Startet den Gmail-Verbinden-Ablauf: leitet zur Google-Zustimmungsseite weiter. */
export async function GET(req: NextRequest) {
  const origin = new URL(req.url).origin;
  const next = safeNextPath(req.nextUrl.searchParams.get("next"));

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL("/login", origin));

  if (!gmailConfigured()) {
    const u = new URL(next, origin);
    u.searchParams.set("gmail", "not_configured");
    return NextResponse.redirect(u);
  }

  const state = randomUUID();
  const redirectUri = `${origin}/api/gmail/callback`;
  const res = NextResponse.redirect(buildAuthUrl(redirectUri, state));

  const secure = origin.startsWith("https");
  const cookieOpts = { httpOnly: true, secure, sameSite: "lax" as const, path: "/", maxAge: 600 };
  res.cookies.set("gmail_oauth_state", state, cookieOpts);
  res.cookies.set("gmail_oauth_next", next, cookieOpts);
  return res;
}
