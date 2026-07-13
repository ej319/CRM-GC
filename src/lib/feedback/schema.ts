import { z } from "zod";

export const createTicketSchema = z.object({
  kind: z.enum(["fehler", "idee", "frage"]),
  message: z.string().trim().min(1, "Bitte eine Beschreibung eingeben").max(5000),
  pageUrl: z.string().max(500).optional().default(""),
});

export const statusSchema = z.enum(["neu", "in_arbeit", "erledigt"]);

export type CreateTicketInput = z.input<typeof createTicketSchema>;
