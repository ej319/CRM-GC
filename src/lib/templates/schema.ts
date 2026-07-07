import { z } from "zod";

/** Ein Anhang-Verweis (Datei liegt bereits im Storage-Bucket „template-attachments"). */
export const templateAttachmentRefSchema = z.object({
  path: z.string().min(1),
  name: z.string().min(1),
  size: z.number().nonnegative(),
  contentType: z.string().optional(),
});

/** Eingabe-Validierung für eine Vorlage (Anlegen/Bearbeiten). */
export const templateInputSchema = z.object({
  name: z.string().trim().min(1, "Name ist erforderlich"),
  subject: z.string().trim().optional().default(""),
  bodyHtml: z.string().optional().default(""),
  // Ersatztexte je Platzhalter-Token; leere Werte sind erlaubt.
  placeholderDefaults: z.record(z.string(), z.string()).optional().default({}),
  attachments: z.array(templateAttachmentRefSchema).optional().default([]),
});

export type TemplateInput = z.input<typeof templateInputSchema>;
export type TemplateAttachmentRef = z.infer<typeof templateAttachmentRefSchema>;
