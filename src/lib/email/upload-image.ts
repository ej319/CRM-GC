// Clientseitiger Upload eines eigenen Bildes in den privaten Bucket "email-images".
// Optimiert zuerst (verkleinern/prüfen) und gibt die login-geschützte App-Adresse zurück.
import { createClient } from "@/lib/supabase/client";
import { imageUrl, MAX_IMAGE_BYTES } from "@/lib/email/images";
import { optimizeImage, validateImageType } from "@/lib/email/optimize-image";

const BUCKET = "email-images";

type UploadResult = { ok: true; url: string } | { ok: false; error: string };

export async function uploadEmailImage(file: File): Promise<UploadResult> {
  const typeErr = validateImageType(file);
  if (typeErr) return { ok: false, error: typeErr };

  let blob: Blob;
  try {
    blob = await optimizeImage(file);
  } catch {
    return { ok: false, error: "Bild konnte nicht verarbeitet werden." };
  }
  if (blob.size > MAX_IMAGE_BYTES) {
    return { ok: false, error: "Das Bild ist auch nach dem Verkleinern zu groß (max. ~2 MB)." };
  }

  const ext =
    blob.type === "image/png" ? "png" : blob.type === "image/gif" ? "gif" : "jpg";
  const base =
    file.name.replace(/\.[^.]+$/, "").replace(/[^\w-]+/g, "_").slice(0, 40) || "bild";
  const path = `${crypto.randomUUID()}/${base}.${ext}`;

  const supabase = createClient();
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, blob, { contentType: blob.type || file.type });
  if (error) return { ok: false, error: "Bild konnte nicht hochgeladen werden." };

  return { ok: true, url: imageUrl(path) };
}
