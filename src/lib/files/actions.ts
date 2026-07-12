"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { fileInputSchema, type FileInput } from "@/lib/files/schema";
import { FILE_SELECT, rowToFile } from "@/lib/files/queries";
import type { CustomerFile } from "@/lib/files/data";

type Result<T> = { ok: true; data: T } | { ok: false; error: string };

const FILES_BUCKET = "customer-files";
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

/** Datei-Eintrag anlegen (Datei liegt bereits im Bucket „customer-files"). */
export async function addCustomerFile(
  customerId: string,
  input: FileInput,
): Promise<Result<CustomerFile>> {
  const parsed = fileInputSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Ungültige Eingabe" };
  }
  const { path, name, size, contentType, description } = parsed.data;

  const { supabase, user } = await requireUser();
  if (!user) return { ok: false, error: "Nicht angemeldet" };

  const { data, error } = await supabase
    .from("customer_files")
    .insert({
      customer_id: customerId,
      file_name: name,
      description: description || null,
      file_size: size,
      content_type: contentType ?? null,
      storage_path: path,
      uploaded_by: user.id,
    })
    .select(FILE_SELECT)
    .single();
  if (error || !data) {
    return { ok: false, error: error?.message ?? "Speichern fehlgeschlagen" };
  }
  revalidatePath(`/kunde/${customerId}`);
  return { ok: true, data: rowToFile(data as never) };
}

/** Beschreibung einer eigenen Datei ändern. */
export async function updateFileDescription(
  id: string,
  description: string,
): Promise<Result<CustomerFile>> {
  const { supabase, user } = await requireUser();
  if (!user) return { ok: false, error: "Nicht angemeldet" };

  const { data, error } = await supabase
    .from("customer_files")
    .update({ description: description.trim() || null })
    .eq("id", id)
    .select(FILE_SELECT)
    .single();
  if (error || !data) {
    return { ok: false, error: error?.message ?? "Speichern fehlgeschlagen" };
  }
  return { ok: true, data: rowToFile(data as never) };
}

/** Eigene Datei löschen (inkl. Datei im Bucket). */
export async function deleteCustomerFile(
  id: string,
  storagePath: string,
): Promise<Result<null>> {
  const { supabase, user } = await requireUser();
  if (!user) return { ok: false, error: "Nicht angemeldet" };

  await supabase.storage.from(FILES_BUCKET).remove([storagePath]);
  const { error } = await supabase.from("customer_files").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  return { ok: true, data: null };
}

/**
 * Eine abgelegte Kundendatei als E-Mail-Anhang übernehmen: in den
 * „email-attachments"-Bucket kopieren (eigene, unabhängige Kopie).
 */
export async function attachFileToEmail(
  storagePath: string,
  fileName: string,
  contentType?: string,
): Promise<Result<EmailAttachmentRef>> {
  const { supabase, user } = await requireUser();
  if (!user) return { ok: false, error: "Nicht angemeldet" };

  const { data: blob, error: dlErr } = await supabase.storage
    .from(FILES_BUCKET)
    .download(storagePath);
  if (dlErr || !blob) {
    return { ok: false, error: `„${fileName}" konnte nicht geladen werden.` };
  }
  const newPath = `${randomUUID()}/${fileName}`;
  const { error: upErr } = await supabase.storage
    .from(EMAIL_BUCKET)
    .upload(newPath, blob, { contentType: contentType || undefined });
  if (upErr) {
    return { ok: false, error: `„${fileName}" konnte nicht übernommen werden.` };
  }
  return {
    ok: true,
    data: {
      path: newPath,
      name: fileName,
      size: blob.size,
      contentType: contentType || undefined,
    },
  };
}
