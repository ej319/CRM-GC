"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Mail, Paperclip } from "lucide-react";
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
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TemplateEditorDialog } from "@/components/templates/template-editor-dialog";
import { deleteTemplate } from "@/lib/templates/actions";
import { formatDateTime } from "@/lib/notes/data";
import type { EmailTemplate } from "@/lib/templates/data";

/** Reiner Vorschautext (HTML-Tags entfernt), gekürzt. */
function preview(html: string, max = 80): string {
  const text = html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

export function TemplatesPage({ initial }: { initial: EmailTemplate[] }) {
  const [templates, setTemplates] = useState<EmailTemplate[]>(initial);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<EmailTemplate | null>(null);
  const [toDelete, setToDelete] = useState<EmailTemplate | null>(null);
  const [deleting, setDeleting] = useState(false);

  function openNew() {
    setEditing(null);
    setEditorOpen(true);
  }
  function openEdit(tpl: EmailTemplate) {
    setEditing(tpl);
    setEditorOpen(true);
  }

  function handleSaved(tpl: EmailTemplate) {
    setTemplates((prev) => {
      const exists = prev.some((t) => t.id === tpl.id);
      const next = exists ? prev.map((t) => (t.id === tpl.id ? tpl : t)) : [...prev, tpl];
      return next.sort((a, b) => a.name.localeCompare(b.name, "de"));
    });
  }

  async function confirmDelete() {
    if (!toDelete) return;
    setDeleting(true);
    const res = await deleteTemplate(toDelete.id);
    setDeleting(false);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    setTemplates((prev) => prev.filter((t) => t.id !== toDelete.id));
    toast.success("Vorlage gelöscht.");
    setToDelete(null);
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-foreground">E-Mail-Vorlagen</h1>
          <p className="text-sm text-muted-foreground">
            Wiederkehrende E-Mails einmal anlegen und beim Schreiben mit einem Klick
            einfügen. Für alle im Team sichtbar.
          </p>
        </div>
        <Button onClick={openNew}>
          <Plus className="mr-1.5 h-4 w-4" /> Neue Vorlage
        </Button>
      </div>

      {templates.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <Mail className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Noch keine Vorlagen. Lege deine erste Vorlage an – z. B. eine
              Erstansprache oder eine Angebots-Nachfass-Mail.
            </p>
            <Button onClick={openNew}>
              <Plus className="mr-1.5 h-4 w-4" /> Erste Vorlage anlegen
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden sm:table-cell">Betreff</TableHead>
                  <TableHead className="hidden md:table-cell">Zuletzt geändert</TableHead>
                  <TableHead className="text-right">Aktionen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {templates.map((tpl) => (
                  <TableRow key={tpl.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-1.5">
                        {tpl.name}
                        {tpl.attachments.length > 0 ? (
                          <Paperclip
                            className="h-3.5 w-3.5 text-muted-foreground"
                            aria-label={`${tpl.attachments.length} Anhang/Anhänge`}
                          />
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground sm:table-cell">
                      {tpl.subject || preview(tpl.bodyHtml) || "—"}
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground md:table-cell">
                      {formatDateTime(tpl.updatedAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEdit(tpl)}
                          aria-label={`${tpl.name} bearbeiten`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setToDelete(tpl)}
                          aria-label={`${tpl.name} löschen`}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <TemplateEditorDialog
        open={editorOpen}
        onOpenChange={setEditorOpen}
        initial={editing}
        onSaved={handleSaved}
      />

      <AlertDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Vorlage löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              „{toDelete?.name}" wird endgültig gelöscht – inklusive hinterlegter
              Anhänge. Bereits geschriebene oder gesendete E-Mails bleiben unberührt.
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
