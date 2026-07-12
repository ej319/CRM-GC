// Typen + reine Helfer für Kundendateien (PROJ-13).

export interface CustomerFile {
  id: string;
  fileName: string;
  description?: string;
  fileSize: number;
  contentType?: string;
  storagePath: string;
  uploadedByName?: string;
  createdAt: string;
}

/** Herkunft eines Eintrags in der Datei-Gesamtübersicht. */
export type FileOrigin = "upload" | "email";

/** Ein Eintrag der Datei-Übersicht (eigene Datei ODER E-Mail-Anhang). */
export interface FileEntry {
  key: string;
  fileName: string;
  fileSize: number;
  contentType?: string;
  storagePath: string;
  bucket: "customer-files" | "email-attachments";
  origin: FileOrigin;
  description?: string;
  /** Bei origin==="email": Betreff der Mail als Herkunftshinweis. */
  emailSubject?: string;
  createdAt: string;
  /** Nur eigene Uploads sind hier löschbar. */
  canDelete: boolean;
}

/** Minimal benötigte E-Mail-Form für die Zusammenführung (aus PROJ-7). */
export interface EmailWithAttachments {
  subject: string;
  sentAt: string;
  attachments: {
    id: string;
    fileName: string;
    fileSize: number;
    contentType?: string;
    storagePath: string;
  }[];
}

/**
 * Führt eigene Kundendateien und die Anhänge gesendeter E-Mails zu einer
 * gemeinsamen Liste zusammen (neueste zuerst). Reine Funktion (testbar).
 */
export function buildFileEntries(
  files: CustomerFile[],
  emails: EmailWithAttachments[],
): FileEntry[] {
  const entries: FileEntry[] = [];

  for (const f of files) {
    entries.push({
      key: `file:${f.id}`,
      fileName: f.fileName,
      fileSize: f.fileSize,
      contentType: f.contentType,
      storagePath: f.storagePath,
      bucket: "customer-files",
      origin: "upload",
      description: f.description,
      createdAt: f.createdAt,
      canDelete: true,
    });
  }

  for (const mail of emails) {
    for (const att of mail.attachments) {
      entries.push({
        key: `email:${att.id}`,
        fileName: att.fileName,
        fileSize: att.fileSize,
        contentType: att.contentType,
        storagePath: att.storagePath,
        bucket: "email-attachments",
        origin: "email",
        emailSubject: mail.subject,
        createdAt: mail.sentAt,
        canDelete: false,
      });
    }
  }

  return entries.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

/** Dateigröße menschlich lesbar, z. B. „1,2 MB". */
export function formatFileSize(bytes: number): string {
  if (!bytes || bytes < 0) return "0 KB";
  const kb = bytes / 1024;
  if (kb < 1024) return `${Math.max(1, Math.round(kb))} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(1).replace(".", ",")} MB`;
}
