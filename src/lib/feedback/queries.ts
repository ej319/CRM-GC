import { createClient } from "@/lib/supabase/server";
import type { Ticket, TicketKind, TicketStatus } from "@/lib/feedback/data";

export const TICKET_SELECT =
  "id, kind, message, page_url, status, created_at, author:profiles(full_name, email)";

interface TicketRow {
  id: string;
  kind: string;
  message: string;
  page_url: string | null;
  status: string;
  created_at: string;
  author: { full_name: string | null; email: string | null } | null;
}

export function rowToTicket(row: TicketRow): Ticket {
  const a = row.author;
  const authorName = (a?.full_name && a.full_name.trim()) || a?.email || undefined;
  return {
    id: row.id,
    kind: row.kind as TicketKind,
    message: row.message,
    pageUrl: row.page_url ?? undefined,
    status: row.status as TicketStatus,
    authorName,
    createdAt: row.created_at,
  };
}

/** Alle Tickets (neueste zuerst). Team-weit. */
export async function getTickets(): Promise<Ticket[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("feedback_tickets")
    .select(TICKET_SELECT)
    .order("created_at", { ascending: false })
    .limit(500);
  if (error || !data) return [];
  return (data as unknown as TicketRow[]).map(rowToTicket);
}
