// Bild-Fundament für E-Mails (PROJ-15). Reine, testbare Helfer – ohne Server-/
// Browser-Abhängigkeiten. Genutzt beim Anzeigen (App-Route) und beim Einbetten
// (cid) im Versand.

/** Login-geschützte App-Route, über die eigene Bilder angezeigt werden. */
export const EMAIL_IMAGE_ROUTE = "/api/email/image/";

/** Erlaubte Bild-Formate (kein SVG – Skript-Gefahr). */
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif"];

/** Grenzen: max. Breite beim Verkleinern, max. Dateigröße pro Bild (nach Optimierung). */
export const MAX_IMAGE_WIDTH = 1000;
export const MAX_IMAGE_BYTES = 2 * 1024 * 1024; // ~2 MB

// Findet Bild-Verweise auf die eigene Route – relativ ODER als vollständige
// Adresse (manche Editoren speichern src als absolute URL). Gruppe 1 = Pfad.
const IMG_SRC_RE = /(?:https?:\/\/[^/"'\s>]+)?\/api\/email\/image\/([^"'\s)>]+)/g;

/** App-Adresse für ein im privaten Bucket liegendes Bild (Pfad wird kodiert). */
export function imageUrl(storagePath: string): string {
  return EMAIL_IMAGE_ROUTE + encodeURIComponent(storagePath);
}

/** Alle in einem HTML referenzierten eigenen Bild-Speicherpfade (ohne Duplikate). */
export function extractImagePaths(html: string): string[] {
  const set = new Set<string>();
  for (const m of (html ?? "").matchAll(IMG_SRC_RE)) {
    try {
      set.add(decodeURIComponent(m[1]));
    } catch {
      set.add(m[1]);
    }
  }
  return [...set];
}

/**
 * Ersetzt die App-Bildadressen durch Mail-interne Verweise (`cid:…`) für den
 * Versand. Pfade ohne Eintrag in der Zuordnung bleiben unverändert.
 */
export function rewriteImagesToCid(
  html: string,
  cidByPath: Map<string, string>,
): string {
  return (html ?? "").replace(IMG_SRC_RE, (whole, enc: string) => {
    let path: string;
    try {
      path = decodeURIComponent(enc);
    } catch {
      path = enc;
    }
    const cid = cidByPath.get(path);
    return cid ? `cid:${cid}` : whole;
  });
}

/** Zielmaße beim Verkleinern: Breite auf maxW begrenzen, Seitenverhältnis wahren. */
export function fitWidth(
  width: number,
  height: number,
  maxW: number = MAX_IMAGE_WIDTH,
): { width: number; height: number } {
  if (width <= maxW || width <= 0) return { width, height };
  const ratio = maxW / width;
  return { width: maxW, height: Math.round(height * ratio) };
}
