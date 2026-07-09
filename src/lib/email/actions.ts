"use server";

import { randomUUID } from "crypto";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendMail, disconnect as gmailDisconnect, GmailReconnectError } from "@/lib/email/gmail";
import type { RawAttachment, InlineImage } from "@/lib/email/mime";
import { normalizeRecipients, wrapHtmlDocument, type Email } from "@/lib/email/data";
import { sanitizeEmailHtml } from "@/lib/email/sanitize";
import { extractImagePaths, rewriteImagesToCid } from "@/lib/email/images";

type Result<T> = { ok: true; data: T } | { ok: false; error: string };

const MAX_ATTACH_TOTAL = 18 * 1024 * 1024; // ~18 MB roh → unter Gmails 25-MB-Grenze nach Kodierung
const MAX_MAIL_TOTAL = 22 * 1024 * 1024; // Anhänge + eingebettete Bilder zusammen

const EMAIL_IMAGE_BUCKET = "email-images";

function guessImageType(name: string): string {
  const ext = name.split(".").pop()?.toLowerCase();
  if (ext === "png") return "image/png";
  if (ext === "gif") return "image/gif";
  if (ext === "jpg" || ext === "jpeg") return "image/jpeg";
  return "application/octet-stream";
}

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

  // CR/LF aus dem Betreff entfernen → keine Header-Injection (QA-Finding L1).
  const subject = input.subject.replace(/[\r\n]+/g, " ").trim();

  // Tracking-Pixel (immer an – B2B-Entscheidung des Nutzers, DSGVO-Vorbehalt dokumentiert).
  const trackingId = randomUUID();
  const pixel = `<img src="${await baseUrl()}/api/email/track/${trackingId}" width="1" height="1" alt="" style="display:none">`;
  // Der Editor liefert HTML → sicher bereinigen (XSS), dann ins Mail-Grundgerüst packen.
  const safeBody = sanitizeEmailHtml(input.body);
  const html = wrapHtmlDocument(safeBody).replace("</body>", `${pixel}</body>`);

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

  // Eigene Bilder aus dem Text laden und fest in die Mail einbetten (inline/cid),
  // damit sie beim Empfänger zuverlässig angezeigt werden (auch Outlook).
  // Der im Verlauf gespeicherte Text (html) bleibt unverändert (App-Bild-Adressen);
  // nur die zu sendende Fassung (htmlToSend) verweist auf die eingebetteten Bilder.
  let htmlToSend = html;
  const inlineImages: InlineImage[] = [];
  const imagePaths = extractImagePaths(html);
  if (imagePaths.length > 0) {
    let admin;
    try {
      admin = createAdminClient();
    } catch {
      return { ok: false, error: "Bilder sind noch nicht eingerichtet (Service-Schlüssel fehlt)." };
    }
    const cidByPath = new Map<string, string>();
    let imageBytes = 0;
    for (const path of imagePaths) {
      const { data: blob, error } = await admin.storage
        .from(EMAIL_IMAGE_BUCKET)
        .download(path);
      if (error || !blob) {
        return { ok: false, error: "Ein Bild aus der Nachricht konnte nicht geladen werden." };
      }
      const bytes = Buffer.from(await blob.arrayBuffer());
      imageBytes += bytes.length;
      const fileName = path.split("/").pop() || "bild";
      const cid = `${randomUUID()}@crm`;
      cidByPath.set(path, cid);
      inlineImages.push({
        fileName,
        contentType: blob.type || guessImageType(fileName),
        base64: bytes.toString("base64"),
        cid,
      });
    }
    const attachBytes = rawAttachments.reduce(
      (s, a) => s + Buffer.byteLength(a.base64, "base64"),
      0,
    );
    if (attachBytes + imageBytes > MAX_MAIL_TOTAL) {
      return {
        ok: false,
        error: "Die Mail ist mit Bildern und Anhängen zu groß. Bitte Bilder verkleinern oder weglassen.",
      };
    }
    htmlToSend = rewriteImagesToCid(html, cidByPath);
  }

  // Senden.
  let messageId = "";
  let from = "";
  try {
    const res = await sendMail(user.id, {
      to,
      cc,
      subject,
      html: htmlToSend,
      attachments: rawAttachments,
      inlineImages,
    });
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
    await gmailDisconnect(user.id);
  } catch {
    return { ok: false, error: "Trennen fehlgeschlagen." };
  }
  return { ok: true, data: null };
}
