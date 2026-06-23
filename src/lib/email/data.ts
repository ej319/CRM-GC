// Typen + reine Hilfsfunktionen für gesendete E-Mails (PROJ-7).

export interface EmailAttachment {
  id: string;
  fileName: string;
  fileSize: number;
  contentType?: string;
  storagePath: string;
}

export interface Email {
  id: string;
  to: string;
  cc?: string;
  subject: string;
  bodyHtml: string;
  from: string;
  sentAt: string; // ISO-Zeitstempel (created_at)
  openedAt?: string;
  attachments: EmailAttachment[];
}

export interface GmailStatus {
  connected: boolean;
  email?: string;
}

/** HTML-Sonderzeichen maskieren, damit Nutzertext sicher in eine HTML-Mail kommt. */
export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Reinen Text in eine einfache HTML-Mail umwandeln (Zeilenumbrüche bleiben erhalten). */
export function textToHtml(text: string): string {
  const body = escapeHtml(text).replace(/\r\n|\r|\n/g, "<br>\n");
  return (
    `<!DOCTYPE html><html><body style="font-family:Arial,Helvetica,sans-serif;` +
    `font-size:14px;color:#1f2937;line-height:1.5">${body}</body></html>`
  );
}

/** HTML grob in lesbaren Text zurückwandeln (für die Verlauf-Vorschau). */
export function stripHtml(html: string): string {
  return html
    .replace(/<\s*br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .trim();
}

/** Prüft eine einzelne E-Mail-Adresse grob auf Gültigkeit. */
export function isValidEmail(addr: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(addr.trim());
}

/** Mehrere kommagetrennte Adressen normalisieren; gibt null zurück, wenn eine ungültig ist. */
export function normalizeRecipients(raw: string): string | null {
  const parts = raw
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);
  if (parts.length === 0) return null;
  if (!parts.every(isValidEmail)) return null;
  return parts.join(", ");
}
