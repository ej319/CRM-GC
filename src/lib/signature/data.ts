// Typen für die persönliche E-Mail-Signatur (PROJ-15). Eine Signatur pro Nutzer.

export interface Signature {
  /** Formatierter Signaturtext als HTML (kann eingebettete eigene Bilder enthalten). */
  bodyHtml: string;
}

export const EMPTY_SIGNATURE: Signature = { bodyHtml: "" };
