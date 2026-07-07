import { createClient } from "@/lib/supabase/server";
import type { EmailTemplate, TemplateAttachment } from "@/lib/templates/data";

export const TEMPLATE_SELECT =
  "id, name, subject, body_html, placeholder_defaults, created_at, updated_at, " +
  "attachments:email_template_attachments(id, file_name, file_size, content_type, storage_path)";

interface AttachmentRow {
  id: string;
  file_name: string;
  file_size: number;
  content_type: string | null;
  storage_path: string;
}

interface TemplateRow {
  id: string;
  name: string;
  subject: string | null;
  body_html: string | null;
  placeholder_defaults: Record<string, string> | null;
  created_at: string;
  updated_at: string;
  attachments: AttachmentRow[] | null;
}

function rowToAttachment(a: AttachmentRow): TemplateAttachment {
  return {
    id: a.id,
    fileName: a.file_name,
    fileSize: a.file_size,
    contentType: a.content_type ?? undefined,
    storagePath: a.storage_path,
  };
}

export function rowToTemplate(row: TemplateRow): EmailTemplate {
  return {
    id: row.id,
    name: row.name,
    subject: row.subject ?? "",
    bodyHtml: row.body_html ?? "",
    placeholderDefaults: row.placeholder_defaults ?? {},
    attachments: (row.attachments ?? []).map(rowToAttachment),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/** Alle Vorlagen laden (alphabetisch, mit Anhängen). Team-weit sichtbar. */
export async function getTemplates(): Promise<EmailTemplate[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("email_templates")
    .select(TEMPLATE_SELECT)
    .order("name", { ascending: true })
    .limit(500);
  if (error || !data) return [];
  return (data as unknown as TemplateRow[]).map(rowToTemplate);
}
