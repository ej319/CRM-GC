"use server";

import { randomUUID } from "crypto";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendMail, disconnect as gmailDisconnect, GmailReconnectError } from "@/lib/email/gmail";
import type { RawAttachment } from "@/lib/email/mime";
import { normalizeRecipients, textToHtml, type Email } from "@/lib/email/data";

type Result<T> = { ok: true; data: T } | { ok: false; error: string };

const MAX_ATTACH_TOTAL = 18 * 1024 * 1024; // ~18 MB roh → unter Gmails 25-MB-Grenze nach Kodierung

interface AttachmentInput {
  path: string;
  name: string;
  size: number;
  contentType?: string;
}

interface SendInput {
  to: string;
  cc?: string;
  subject: string;
  body: string;
  attachments: AttachmentInput[];
}

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

async function baseUrl(): Promise<string> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

/** E-Mail über Gmail senden, im Verlauf speichern und Tracking-Pixel einbetten. */
export async function sendEmail(
  customerId: string,
  input: SendInput,
): Promise<Result<Email>> {
  const { supabase, user } = await requireUser();
  if (!user) return { ok: false, error: "Nicht angemeldet" };

  const to = normalizeRecipients(input.to);
  if (!to) return { ok: false, error: "Bitte eine gültige Empfängeradresse eintragen." };

  let cc: string | undefined;
  if (input.cc && input.cc.trim()) {
    const normCc = normalizeRecipients(input.cc);
    if (!normCc) return { ok: false, error: "Die CC-Adresse ist ungültig." };
    cc = normCc;
  }

  const subject = input.subject.trim();

  // Tracking-Pixel (immer an – B2B-Entscheidung des Nutzers, DSGVO-Vorbehalt dokumentiert).
  const trackingId = randomUUID();
  const pixel = `<img src="${await baseUrl()}/api/email/track/${trackingId}" width="1" height="1" alt="" style="display:none">`;
  const html = textToHtml(input.body).replace("</body>", `${pixel}</body>`);

  // Anhänge aus dem Storage laden (Service-Role, unabhängig von der Session).
  const rawAttachments: RawAttachment[] = [];
  if (input.attachments.length > 0) {
    const total = input.attachments.reduce((sum, a) => sum + (a.size || 0), 0);
    if (total > MAX_ATTACH_TOTAL) {
      return { ok: false, error: "Die Anhänge sind zu groß (max. ca. 18 MB insgesamt)." };
    }
    let admin;
    try {
      admin = createAdminClient();
    } catch {
      return { ok: false, error: "Anhänge sind noch nicht eingerichtet (Service-Schlüssel fehlt)." };
    }
    for (const att of input.attachments) {
      const { data: blob, error } = await admin.storage
        .from("email-attachments")
        .download(att.path);
      if (error || !blob) {
        return { ok: false, error: `Anhang „${att.name}" konnte nicht geladen werden.` };
      }
      const bytes = Buffer.from(await blob.arrayBuffer());
      rawAttachments.push({
        fileName: att.name,
        contentType: att.contentType || "application/octet-stream",
        base64: bytes.toString("base64"),
      });
    }
  }

  // Senden.
  let messageId = "";
  let from = "";
  try {
    const res = await sendMail({ to, cc, subject, html, attachments: rawAttachments });
    messageId = res.messageId;
    from = res.from;
  } catch (err) {
    if (err instanceof GmailReconnectError) {
      const map: Record<string, string> = {
        NOT_CONFIGURED: "Gmail ist noch nicht eingerichtet.",
        NOT_CONNECTED: "Kein Gmail verbunden. Bitte zuerst Gmail verbinden.",
        RECONNECT: "Die Gmail-Verbindung ist abgelaufen. Bitte neu verbinden.",
      };
      return { ok: false, error: map[err.message] ?? "Bitte Gmail neu verbinden." };
    }
    const msg = err instanceof Error ? err.message : "Senden fehlgeschlagen.";
    return { ok: false, error: `Senden fehlgeschlagen: ${msg}` };
  }

  // Im Verlauf speichern.
  const { data: emailRow, error: insErr } = await supabase
    .from("emails")
    .insert({
      customer_id: customerId,
      to_addr: to,
      cc: cc ?? null,
      subject,
      body_html: html,
      from_addr: from,
      gmail_message_id: messageId,
      tracking_id: trackingId,
      sent_by: user.id,
    })
    .select("id, created_at")
    .single();

  if (insErr || !emailRow) {
    // Gesendet, aber nicht gespeichert – ehrliche Rückmeldung.
    return {
      ok: false,
      error: "E-Mail wurde gesendet, konnte aber nicht im Verlauf gespeichert werden.",
    };
  }

  const row = emailRow as { id: string; created_at: string };
  const savedAttachments: Email["attachments"] = [];
  if (input.attachments.length > 0) {
    const { data: attRows } = await supabase
      .from("email_attachments")
      .insert(
        input.attachments.map((a) => ({
          email_id: row.id,
          file_name: a.name,
          file_size: a.size,
          content_type: a.contentType ?? null,
          storage_path: a.path,
        })),
      )
      .select("id, file_name, file_size, content_type, storage_path");
    for (const a of (attRows ?? []) as Array<{
      id: string;
      file_name: string;
      file_size: number;
      content_type: string | null;
      storage_path: string;
    }>) {
      savedAttachments.push({
        id: a.id,
        fileName: a.file_name,
        fileSize: a.file_size,
        contentType: a.content_type ?? undefined,
        storagePath: a.storage_path,
      });
    }
  }

  revalidatePath(`/kunde/${customerId}`);

  const email: Email = {
    id: row.id,
    to,
    cc,
    subject,
    bodyHtml: html,
    from,
    sentAt: row.created_at,
    attachments: savedAttachments,
  };
  return { ok: true, data: email };
}

/** Gmail-Verbindung trennen. */
export async function disconnectGmail(): Promise<Result<null>> {
  const { user } = await requireUser();
  if (!user) return { ok: false, error: "Nicht angemeldet" };
  try {
    await gmailDisconnect();
  } catch {
    return { ok: false, error: "Trennen fehlgeschlagen." };
  }
  return { ok: true, data: null };
}
