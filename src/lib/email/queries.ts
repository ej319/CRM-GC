import { createClient } from "@/lib/supabase/server";
import type { Email, EmailAttachment } from "@/lib/email/data";

export const EMAIL_SELECT =
  "id, to_addr, cc, subject, body_html, from_addr, opened_at, created_at, " +
  "email_attachments ( id, file_name, file_size, content_type, storage_path )";

interface AttachmentRow {
  id: string;
  file_name: string;
  file_size: number;
  content_type: string | null;
  storage_path: string;
}

interface EmailRow {
  id: string;
  to_addr: string;
  cc: string | null;
  subject: string;
  body_html: string;
  from_addr: string;
  opened_at: string | null;
  created_at: string;
  email_attachments: AttachmentRow[] | null;
}

function rowToAttachment(row: AttachmentRow): EmailAttachment {
  return {
    id: row.id,
    fileName: row.file_name,
    fileSize: row.file_size,
    contentType: row.content_type ?? undefined,
    storagePath: row.storage_path,
  };
}

export function rowToEmail(row: EmailRow): Email {
  return {
    id: row.id,
    to: row.to_addr,
    cc: row.cc ?? undefined,
    subject: row.subject,
    bodyHtml: row.body_html,
    from: row.from_addr,
    sentAt: row.created_at,
    openedAt: row.opened_at ?? undefined,
    attachments: (row.email_attachments ?? []).map(rowToAttachment),
  };
}

/** Gesendete E-Mails eines Kunden laden (neueste zuerst). */
export async function getEmails(customerId: string): Promise<Email[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("emails")
    .select(EMAIL_SELECT)
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false })
    .limit(200);
  if (error || !data) return [];
  return (data as unknown as EmailRow[]).map(rowToEmail);
}
