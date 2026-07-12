import { createClient } from "@/lib/supabase/server";
import type { CustomerFile } from "@/lib/files/data";

export const FILE_SELECT =
  "id, file_name, description, file_size, content_type, storage_path, created_at, " +
  "uploader:profiles(full_name, email)";

interface FileRow {
  id: string;
  file_name: string;
  description: string | null;
  file_size: number;
  content_type: string | null;
  storage_path: string;
  created_at: string;
  uploader: { full_name: string | null; email: string | null } | null;
}

export function rowToFile(row: FileRow): CustomerFile {
  const up = row.uploader;
  const uploadedByName =
    (up?.full_name && up.full_name.trim()) || up?.email || undefined;
  return {
    id: row.id,
    fileName: row.file_name,
    description: row.description ?? undefined,
    fileSize: row.file_size,
    contentType: row.content_type ?? undefined,
    storagePath: row.storage_path,
    uploadedByName,
    createdAt: row.created_at,
  };
}

/** Selbst hochgeladene Dateien eines Kunden (neueste zuerst). */
export async function getCustomerFiles(customerId: string): Promise<CustomerFile[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("customer_files")
    .select(FILE_SELECT)
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false })
    .limit(500);
  if (error || !data) return [];
  return (data as unknown as FileRow[]).map(rowToFile);
}
