import { toast } from "sonner";

import { uploadEmailImage } from "@/lib/email/upload-image";

/**
 * Lädt eine Bilddatei als eigenes Bild hoch und gibt die App-Bildadresse zurück
 * (oder null bei Fehler, mit Hinweis-Toast). Wird vom Bild-Knopf und vom
 * automatischen Einfügen (Strg+V) im Editor genutzt.
 */
export async function uploadForEditor(file: File): Promise<string | null> {
  const res = await uploadEmailImage(file);
  if (!res.ok) {
    toast.error(res.error);
    return null;
  }
  return res.url;
}
