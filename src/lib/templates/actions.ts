"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { sanitizeEmailHtml } from "@/lib/email/sanitize";
import { templateInputSchema, type TemplateInput } from "@/lib/templates/schema";
import { TEMPLATE_SELECT, rowToTemplate } from "@/lib/templates/queries";
import type { EmailTemplate } from "@/lib/templates/data";

type Result<T> = { ok: true; data: T } | { ok: false; error: string };

const TEMPLATE_BUCKET = "template-attachments";
const EMAIL_BUCKET = "email-attachments";

/** Anhang-Verweis, wie ihn das E-Mail-Schreibfenster erwartet. */
export interface EmailAttachmentRef {
  path: string;
  name: string;
  size: number;
  contentType?: string;
}

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

/** Neue Vorlage anlegen (Anhänge liegen bereits im Bucket). */
export async function createTemplate(
  input: TemplateInput,
): Promise<Result<EmailTemplate>> {
  const parsed = templateInputSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Ungültige Eingabe" };
  }
  const { name, subject, bodyHtml, placeholderDefaults, attachments } = parsed.data;

  const { supabase, user } = await requireUser();
  if (!user) return { ok: false, error: "Nicht angemeldet" };

  const { data: tpl, error } = await supabase
    .from("email_templates")
    .insert({
      name,
      subject: subject || null,
      body_html: sanitizeEmailHtml(bodyHtml),
      placeholder_defaults: placeholderDefaults,
      created_by: user.id,
    })
    .select("id")
    .single();
  if (error || !tpl) {
    return { ok: false, error: error?.message ?? "Speichern fehlgeschlagen" };
  }

  const templateId = (tpl as { id: string }).id;
  if (attachments.length > 0) {
    const { error: attErr } = await supabase.from("email_template_attachments").insert(
      attachments.map((a) => ({
        template_id: templateId,
        file_name: a.name,
        file_size: a.size,
        content_type: a.contentType ?? null,
        storage_path: a.path,
      })),
    );
    if (attErr) return { ok: false, error: "Anhänge konnten nicht gespeichert werden." };
  }

  return await reloadTemplate(supabase, templateId);
}

/** Vorlage bearbeiten (inkl. Anhang-Abgleich: entfernte Dateien werden gelöscht). */
export async function updateTemplate(
  id: string,
  input: TemplateInput,
): Promise<Result<EmailTemplate>> {
  const parsed = templateInputSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Ungültige Eingabe" };
  }
  const { name, subject, bodyHtml, placeholderDefaults, attachments } = parsed.data;

  const { supabase, user } = await requireUser();
  if (!user) return { ok: false, error: "Nicht angemeldet" };

  const { error: updErr } = await supabase
    .from("email_templates")
    .update({
      name,
      subject: subject || null,
      body_html: sanitizeEmailHtml(bodyHtml),
      placeholder_defaults: placeholderDefaults,
    })
    .eq("id", id);
  if (updErr) return { ok: false, error: updErr.message };

  // Anhang-Abgleich.
  const { data: existingRows } = await supabase
    .from("email_template_attachments")
    .select("id, storage_path")
    .eq("template_id", id);
  const existing = (existingRows ?? []) as Array<{ id: string; storage_path: string }>;
  const incomingPaths = new Set(attachments.map((a) => a.path));

  // Entfernte Anhänge: Datei aus dem Bucket + Zeile löschen.
  const removed = existing.filter((e) => !incomingPaths.has(e.storage_path));
  if (removed.length > 0) {
    await supabase.storage.from(TEMPLATE_BUCKET).remove(removed.map((r) => r.storage_path));
    await supabase
      .from("email_template_attachments")
      .delete()
      .in(
        "id",
        removed.map((r) => r.id),
      );
  }

  // Neue Anhänge: Zeilen anlegen.
  const existingPaths = new Set(existing.map((e) => e.storage_path));
  const added = attachments.filter((a) => !existingPaths.has(a.path));
  if (added.length > 0) {
    const { error: addErr } = await supabase.from("email_template_attachments").insert(
      added.map((a) => ({
        template_id: id,
        file_name: a.name,
        file_size: a.size,
        content_type: a.contentType ?? null,
        storage_path: a.path,
      })),
    );
    if (addErr) return { ok: false, error: "Anhänge konnten nicht gespeichert werden." };
  }

  return await reloadTemplate(supabase, id);
}

/** Vorlage löschen (inkl. Anhang-Dateien im Bucket). */
export async function deleteTemplate(id: string): Promise<Result<null>> {
  const { supabase, user } = await requireUser();
  if (!user) return { ok: false, error: "Nicht angemeldet" };

  const { data: attRows } = await supabase
    .from("email_template_attachments")
    .select("storage_path")
    .eq("template_id", id);
  const paths = ((attRows ?? []) as Array<{ storage_path: string }>).map((r) => r.storage_path);
  if (paths.length > 0) {
    await supabase.storage.from(TEMPLATE_BUCKET).remove(paths);
  }

  const { error } = await supabase.from("email_templates").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/vorlagen");
  return { ok: true, data: null };
}

/**
 * Beim Einfügen einer Vorlage: die Vorlagen-Anhänge in den E-Mail-Anhang-Bucket
 * kopieren, damit die Mail unabhängige eigene Kopien bekommt (löschbare Vorlage
 * beeinflusst die geschriebene/gesendete Mail nie).
 */
export async function instantiateTemplateAttachments(
  templateId: string,
): Promise<Result<EmailAttachmentRef[]>> {
  const { supabase, user } = await requireUser();
  if (!user) return { ok: false, error: "Nicht angemeldet" };

  const { data: attRows } = await supabase
    .from("email_template_attachments")
    .select("file_name, file_size, content_type, storage_path")
    .eq("template_id", templateId);
  const rows = (attRows ?? []) as Array<{
    file_name: string;
    file_size: number;
    content_type: string | null;
    storage_path: string;
  }>;
  if (rows.length === 0) return { ok: true, data: [] };

  const refs: EmailAttachmentRef[] = [];
  for (const r of rows) {
    const { data: blob, error: dlErr } = await supabase.storage
      .from(TEMPLATE_BUCKET)
      .download(r.storage_path);
    if (dlErr || !blob) {
      return { ok: false, error: `Anhang „${r.file_name}" konnte nicht geladen werden.` };
    }
    const newPath = `${randomUUID()}/${r.file_name}`;
    const { error: upErr } = await supabase.storage
      .from(EMAIL_BUCKET)
      .upload(newPath, blob, { contentType: r.content_type ?? undefined });
    if (upErr) {
      return { ok: false, error: `Anhang „${r.file_name}" konnte nicht übernommen werden.` };
    }
    refs.push({
      path: newPath,
      name: r.file_name,
      size: r.file_size,
      contentType: r.content_type ?? undefined,
    });
  }
  return { ok: true, data: refs };
}

// Hilfsfunktion: Vorlage frisch laden und zurückgeben.
async function reloadTemplate(
  supabase: Awaited<ReturnType<typeof createClient>>,
  id: string,
): Promise<Result<EmailTemplate>> {
  const { data, error } = await supabase
    .from("email_templates")
    .select(TEMPLATE_SELECT)
    .eq("id", id)
    .single();
  if (error || !data) {
    return { ok: false, error: "Vorlage konnte nicht geladen werden." };
  }
  revalidatePath("/vorlagen");
  return { ok: true, data: rowToTemplate(data as never) };
}
