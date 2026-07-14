import "server-only";

import { google } from "googleapis";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { buildRawMessage, type RawAttachment, type InlineImage } from "@/lib/email/mime";
import type { GmailStatus } from "@/lib/email/data";

// Senden + verbundene Adresse + LESEN (für Automatik 1: eingehende Anfragen).
// gmail.readonly ist nötig, um Nachrichten mit dem Anfrage-Label zu erkennen.
const SCOPES = [
  "https://www.googleapis.com/auth/gmail.send",
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/userinfo.email",
];

/** Spezialfehler: Verbindung fehlt oder ist abgelaufen → Nutzer muss neu verbinden. */
export class GmailReconnectError extends Error {
  constructor(message = "RECONNECT") {
    super(message);
    this.name = "GmailReconnectError";
  }
}

/** Sind die Google-OAuth-Zugangsdaten als Umgebungs-Variablen hinterlegt? */
export function gmailConfigured(): boolean {
  return Boolean(process.env.GMAIL_CLIENT_ID && process.env.GMAIL_CLIENT_SECRET);
}

function getOAuthClient(redirectUri?: string) {
  return new google.auth.OAuth2(
    process.env.GMAIL_CLIENT_ID,
    process.env.GMAIL_CLIENT_SECRET,
    redirectUri,
  );
}

/** Google-Zustimmungs-URL (mit Sende-Berechtigung + offline-Zugriff für den Refresh-Token). */
export function buildAuthUrl(redirectUri: string, state: string): string {
  return getOAuthClient(redirectUri).generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: SCOPES,
    state,
    include_granted_scopes: true,
  });
}

interface ConnectionRow {
  id: string;
  email: string;
  access_token: string | null;
  refresh_token: string;
  token_expiry: string | null;
}

/** Nach Google-Rückkehr: Code gegen Tokens tauschen und Verbindung des Nutzers speichern. */
export async function connectFromCode(
  code: string,
  redirectUri: string,
  userId: string,
): Promise<string> {
  const client = getOAuthClient(redirectUri);
  const { tokens } = await client.getToken(code);
  client.setCredentials(tokens);

  const userinfo = await google.oauth2({ version: "v2", auth: client }).userinfo.get();
  const email = userinfo.data.email;
  if (!email) throw new Error("E-Mail-Adresse konnte nicht ermittelt werden.");

  const admin = createAdminClient();

  // Fehlt der Refresh-Token (Google liefert ihn nur bei erneuter Zustimmung),
  // den bestehenden Token dieses Nutzers behalten, falls vorhanden.
  let refreshToken = tokens.refresh_token ?? null;
  if (!refreshToken) {
    const { data: existing } = await admin
      .from("gmail_accounts")
      .select("refresh_token")
      .eq("user_id", userId)
      .maybeSingle();
    refreshToken = (existing as { refresh_token: string } | null)?.refresh_token ?? null;
  }
  if (!refreshToken) {
    throw new Error(
      "Kein Refresh-Token erhalten. Bitte den Zugriff in deinem Google-Konto entfernen und erneut verbinden.",
    );
  }

  // Pro Nutzer genau eine Verbindung – bestehende ersetzen (jeder sendet aus seinem Postfach).
  const { error } = await admin.from("gmail_accounts").upsert(
    {
      user_id: userId,
      email,
      access_token: tokens.access_token ?? null,
      refresh_token: refreshToken,
      token_expiry: tokens.expiry_date ? new Date(tokens.expiry_date).toISOString() : null,
    },
    { onConflict: "user_id" },
  );
  if (error) throw new Error(error.message);
  return email;
}

async function getConnection(userId: string): Promise<ConnectionRow | null> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("gmail_accounts")
    .select("id, email, access_token, refresh_token, token_expiry")
    .eq("user_id", userId)
    .maybeSingle();
  return (data as ConnectionRow | null) ?? null;
}

/** Verbindungsstatus des angemeldeten Nutzers – greift NIE die Tokens nach außen durch. */
export async function getStatus(): Promise<GmailStatus> {
  if (!gmailConfigured()) return { connected: false };
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { connected: false };
    const conn = await getConnection(user.id);
    return conn ? { connected: true, email: conn.email } : { connected: false };
  } catch {
    // Service-Role-Key noch nicht eingerichtet o.Ä. → als „nicht verbunden" behandeln.
    return { connected: false };
  }
}

/** Verbindung des Nutzers trennen (Tokens löschen). */
export async function disconnect(userId: string): Promise<void> {
  const admin = createAdminClient();
  await admin.from("gmail_accounts").delete().eq("user_id", userId);
}

interface SendOptions {
  to: string;
  cc?: string;
  subject: string;
  html: string;
  attachments?: RawAttachment[];
  inlineImages?: InlineImage[];
}

/** Versendet eine E-Mail über die Gmail-API im Namen des Postfachs des Nutzers. */
export async function sendMail(
  userId: string,
  opts: SendOptions,
): Promise<{ messageId: string; from: string }> {
  if (!gmailConfigured()) throw new GmailReconnectError("NOT_CONFIGURED");
  const conn = await getConnection(userId);
  if (!conn) throw new GmailReconnectError("NOT_CONNECTED");

  const client = getOAuthClient();
  client.setCredentials({
    refresh_token: conn.refresh_token,
    access_token: conn.access_token ?? undefined,
    expiry_date: conn.token_expiry ? new Date(conn.token_expiry).getTime() : undefined,
  });

  const raw = buildRawMessage({
    from: conn.email,
    to: opts.to,
    cc: opts.cc,
    subject: opts.subject,
    html: opts.html,
    attachments: opts.attachments,
    inlineImages: opts.inlineImages,
  });

  try {
    const gmail = google.gmail({ version: "v1", auth: client });
    const res = await gmail.users.messages.send({
      userId: "me",
      requestBody: { raw },
    });

    // Ggf. erneuerten Zugriffs-Token serverseitig speichern.
    const creds = client.credentials;
    if (creds.access_token && creds.access_token !== conn.access_token) {
      const admin = createAdminClient();
      await admin
        .from("gmail_accounts")
        .update({
          access_token: creds.access_token,
          token_expiry: creds.expiry_date
            ? new Date(creds.expiry_date).toISOString()
            : null,
        })
        .eq("id", conn.id);
    }

    return { messageId: res.data.id ?? "", from: conn.email };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (/invalid_grant|invalid_token|unauthorized|401/i.test(msg)) {
      throw new GmailReconnectError("RECONNECT");
    }
    throw err;
  }
}

// ── Lesen: eingehende Anfrage-Mails (Automatik 1) ────────────────────────

export interface InboundMessage {
  id: string;
  fromName?: string;
  fromEmail?: string;
  subject?: string;
  bodyText?: string;
}

interface GmailPart {
  mimeType?: string | null;
  body?: { data?: string | null } | null;
  parts?: GmailPart[] | null;
}

function headerVal(
  headers: { name?: string | null; value?: string | null }[] | undefined,
  name: string,
): string | undefined {
  return (
    headers?.find((h) => (h.name ?? "").toLowerCase() === name.toLowerCase())?.value ??
    undefined
  );
}

/** „Max Muster" <max@x.de> → { name, email } */
function parseFromHeader(value?: string): { name?: string; email?: string } {
  if (!value) return {};
  const m = value.match(/^\s*"?([^"<]*?)"?\s*<([^>]+)>\s*$/);
  if (m) return { name: m[1].trim() || undefined, email: m[2].trim() };
  return { email: value.match(/[^\s<>]+@[^\s<>]+/)?.[0] };
}

function decodeB64(data?: string | null): string {
  if (!data) return "";
  try {
    return Buffer.from(data, "base64url").toString("utf8");
  } catch {
    return "";
  }
}

function htmlToText(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|tr|li)>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function findPart(part: GmailPart | undefined, mime: string): string | undefined {
  if (!part) return undefined;
  if (part.mimeType === mime && part.body?.data) return part.body.data;
  for (const p of part.parts ?? []) {
    const found = findPart(p, mime);
    if (found) return found;
  }
  return undefined;
}

function extractBody(payload?: GmailPart): string {
  const plain = findPart(payload, "text/plain");
  if (plain) return decodeB64(plain);
  const html = findPart(payload, "text/html");
  if (html) return htmlToText(decodeB64(html));
  return "";
}

/**
 * Liest die Nachrichten mit dem angegebenen Gmail-Label (z. B. „CRM-Anfrage").
 * Wirft GmailReconnectError("RECONNECT_READ"), wenn die Lese-Berechtigung fehlt
 * (Nutzer muss Gmail einmal neu verbinden).
 */
export async function listInquiries(
  userId: string,
  label: string,
  max = 25,
): Promise<InboundMessage[]> {
  if (!gmailConfigured()) throw new GmailReconnectError("NOT_CONFIGURED");
  const conn = await getConnection(userId);
  if (!conn) throw new GmailReconnectError("NOT_CONNECTED");

  const client = getOAuthClient();
  client.setCredentials({
    refresh_token: conn.refresh_token,
    access_token: conn.access_token ?? undefined,
    expiry_date: conn.token_expiry ? new Date(conn.token_expiry).getTime() : undefined,
  });
  const gmail = google.gmail({ version: "v1", auth: client });

  try {
    const list = await gmail.users.messages.list({
      userId: "me",
      q: `label:"${label}"`,
      maxResults: max,
    });
    const ids = (list.data.messages ?? [])
      .map((m) => m.id)
      .filter((id): id is string => Boolean(id));

    const out: InboundMessage[] = [];
    for (const id of ids) {
      const msg = await gmail.users.messages.get({ userId: "me", id, format: "full" });
      const headers = msg.data.payload?.headers ?? undefined;
      const from = parseFromHeader(headerVal(headers, "From"));
      out.push({
        id,
        fromName: from.name,
        fromEmail: from.email,
        subject: headerVal(headers, "Subject") ?? undefined,
        bodyText: extractBody(msg.data.payload as GmailPart | undefined),
      });
    }
    return out;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (/insufficient|forbidden|403|scope|ACCESS_TOKEN_SCOPE/i.test(msg)) {
      throw new GmailReconnectError("RECONNECT_READ");
    }
    if (/invalid_grant|invalid_token|unauthorized|401/i.test(msg)) {
      throw new GmailReconnectError("RECONNECT");
    }
    throw err;
  }
}
