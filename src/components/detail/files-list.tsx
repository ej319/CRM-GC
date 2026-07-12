"use client";

import { useState } from "react";
import { FileText, Download, Trash2, Mail } from "lucide-react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { formatDateTime } from "@/lib/notes/data";
import { formatFileSize, type FileEntry } from "@/lib/files/data";

export function FilesList({
  entries,
  onDelete,
}: {
  entries: FileEntry[];
  onDelete: (entry: FileEntry) => void;
}) {
  const [toDelete, setToDelete] = useState<FileEntry | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function download(entry: FileEntry) {
    const supabase = createClient();
    const { data, error } = await supabase.storage
      .from(entry.bucket)
      .createSignedUrl(entry.storagePath, 60, { download: entry.fileName });
    if (error || !data) {
      toast.error("Download nicht möglich.");
      return;
    }
    window.open(data.signedUrl, "_blank");
  }

  async function confirmDelete() {
    if (!toDelete) return;
    setDeleting(true);
    await onDelete(toDelete);
    setDeleting(false);
    setToDelete(null);
  }

  if (entries.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-muted-foreground">
        Noch keine Dateien. Lade oben im Reiter „Datei" ein Angebot oder ein
        Dokument hoch.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {entries.map((entry) => (
        <div
          key={entry.key}
          className="flex items-center gap-3 rounded-lg border bg-card p-3 text-sm"
        >
          <FileText className="h-5 w-5 shrink-0 text-muted-foreground" />
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium">{entry.fileName}</p>
            <p className="truncate text-xs text-muted-foreground">
              {entry.description ? `${entry.description} · ` : ""}
              {formatFileSize(entry.fileSize)} · {formatDateTime(entry.createdAt)}
              {entry.origin === "email" ? (
                <span className="ml-1 inline-flex items-center gap-0.5 text-muted-foreground">
                  · <Mail className="h-3 w-3" /> aus E-Mail
                  {entry.emailSubject ? `: ${entry.emailSubject}` : ""}
                </span>
              ) : null}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => download(entry)}
            aria-label={`${entry.fileName} herunterladen`}
          >
            <Download className="h-4 w-4" />
          </Button>
          {entry.canDelete ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setToDelete(entry)}
              aria-label={`${entry.fileName} löschen`}
              className="text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          ) : null}
        </div>
      ))}

      <AlertDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Datei löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              „{toDelete?.fileName}" wird endgültig gelöscht.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} disabled={deleting}>
              {deleting ? "Löschen …" : "Löschen"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
