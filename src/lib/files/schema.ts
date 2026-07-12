import { z } from "zod";

/** Eingabe beim Anlegen eines Datei-Eintrags (Datei liegt bereits im Bucket). */
export const fileInputSchema = z.object({
  path: z.string().min(1),
  name: z.string().min(1),
  size: z.number().nonnegative(),
  contentType: z.string().optional(),
  description: z.string().trim().max(500).optional().default(""),
});

export type FileInput = z.input<typeof fileInputSchema>;
