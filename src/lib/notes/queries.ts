import { createClient } from "@/lib/supabase/server";
import type { Note } from "@/lib/notes/data";

export const NOTE_SELECT =
  "id, body, created_at, updated_at, author:profiles(full_name, email)";

interface NoteRow {
  id: string;
  body: string;
  created_at: string;
  updated_at: string | null;
  author: { full_name: string | null; email: string | null } | null;
}

export function rowToNote(row: NoteRow): Note {
  const author = row.author;
  const authorName =
    (author?.full_name && author.full_name.trim()) || author?.email || "Unbekannt";
  return {
    id: row.id,
    body: row.body,
    authorName,
    createdAt: row.created_at,
    updatedAt:
      row.updated_at && row.updated_at !== row.created_at
        ? row.updated_at
        : undefined,
  };
}

/** Notizen eines Kunden laden (neueste zuerst). */
export async function getNotes(customerId: string): Promise<Note[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("notes")
    .select(NOTE_SELECT)
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return (data as unknown as NoteRow[]).map(rowToNote);
}
