// Typen + reine Metadaten für das Feedback/Ticket-System (PROJ-14).

export type TicketKind = "fehler" | "idee" | "frage";
export type TicketStatus = "neu" | "in_arbeit" | "erledigt";

export interface Ticket {
  id: string;
  kind: TicketKind;
  message: string;
  pageUrl?: string;
  status: TicketStatus;
  authorName?: string;
  createdAt: string;
}

export const KIND_LABELS: Record<TicketKind, string> = {
  fehler: "Fehler",
  idee: "Idee",
  frage: "Frage",
};

export const STATUS_LABELS: Record<TicketStatus, string> = {
  neu: "Neu",
  in_arbeit: "In Arbeit",
  erledigt: "Erledigt",
};

export const KIND_OPTIONS: TicketKind[] = ["fehler", "idee", "frage"];
export const STATUS_OPTIONS: TicketStatus[] = ["neu", "in_arbeit", "erledigt"];

export function kindLabel(kind: string): string {
  return KIND_LABELS[kind as TicketKind] ?? kind;
}

export function statusLabel(status: string): string {
  return STATUS_LABELS[status as TicketStatus] ?? status;
}
