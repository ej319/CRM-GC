import { z } from "zod";

/** Eingabe-Validierung für einen Kunden (Anlegen/Bearbeiten). */
export const customerInputSchema = z.object({
  name: z.string().trim().min(1, "Firmenname ist erforderlich"),
  contactName: z.string().trim().optional(),
  phone: z.string().trim().optional(),
  email: z
    .union([z.string().trim().email("Ungültige E-Mail"), z.literal("")])
    .optional(),
  address: z.string().trim().optional(),
  plz: z.string().trim().optional(),
  city: z.string().trim().optional(),
  category: z.string().trim().optional(),
  source: z.string().trim().optional(),
  monthlyValue: z.number().nonnegative("Darf nicht negativ sein").optional(),
});

export type CustomerInput = z.infer<typeof customerInputSchema>;
