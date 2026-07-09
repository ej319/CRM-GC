// Clientseitige Bild-Optimierung (Browser). Verkleinert zu große Bilder vor dem
// Hochladen und prüft das Format. GIFs bleiben unangetastet (Animation erhalten).
import {
  fitWidth,
  ALLOWED_IMAGE_TYPES,
  MAX_IMAGE_BYTES,
  MAX_IMAGE_WIDTH,
} from "@/lib/email/images";

/** Prüft das Format; gibt eine Fehlermeldung zurück oder null (ok). */
export function validateImageType(file: File): string | null {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return "Nur JPG-, PNG- oder GIF-Bilder sind erlaubt.";
  }
  return null;
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Bild konnte nicht geladen werden."));
    };
    img.src = url;
  });
}

/** Verkleinert JPG/PNG auf die Maximalbreite; GIF bleibt unverändert. */
export async function optimizeImage(file: File): Promise<Blob> {
  if (file.type === "image/gif") return file;

  const img = await loadImage(file);
  const { width, height } = fitWidth(img.width, img.height, MAX_IMAGE_WIDTH);
  const alreadySmall =
    width === img.width && height === img.height && file.size <= MAX_IMAGE_BYTES;
  if (alreadySmall) return file;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return file;
  ctx.drawImage(img, 0, 0, width, height);

  // PNG behält Transparenz (Logos); sonst JPEG mit guter Qualität.
  const type = file.type === "image/png" ? "image/png" : "image/jpeg";
  const quality = type === "image/jpeg" ? 0.85 : undefined;
  const blob = await new Promise<Blob | null>((res) =>
    canvas.toBlob(res, type, quality),
  );
  return blob ?? file;
}
