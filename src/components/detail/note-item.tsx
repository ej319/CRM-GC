"use client";

import { useState } from "react";
import { StickyNote, Pencil, Trash2 } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatDateTime, type Note } from "@/lib/notes/data";

interface NoteItemProps {
  note: Note;
  onEdit: (id: string, body: string) => void;
  onDelete: (id: string) => void;
}

/** Ein Notiz-Eintrag im Verlauf (gelb), mit Verfasser, Zeit, Bearbeiten und Löschen. */
export function NoteItem({ note, onEdit, onDelete }: NoteItemProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(note.body);

  function save() {
    const text = draft.trim();
    if (!text) return;
    onEdit(note.id, text);
    setEditing(false);
  }

  return (
    <div className="flex gap-3">
      <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700">
        <StickyNote className="h-4 w-4" />
      </div>
      <div className="flex-1 rounded-md border bg-amber-50 p-3">
        <div className="mb-1 flex items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground">
            {formatDateTime(note.createdAt)} · {note.authorName}
            {note.updatedAt ? " · bearbeitet" : ""}
          </p>
          {!editing ? (
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2"
                onClick={() => {
                  setDraft(note.body);
                  setEditing(true);
                }}
                aria-label="Notiz bearbeiten"
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-destructive"
                    aria-label="Notiz löschen"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Notiz löschen?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Diese Notiz wird entfernt. Das lässt sich nicht rückgängig
                      machen.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                    <AlertDialogAction onClick={() => onDelete(note.id)}>
                      Löschen
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          ) : null}
        </div>

        {editing ? (
          <div className="space-y-2">
            <Textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              className="min-h-20 bg-white"
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditing(false)}
              >
                Abbrechen
              </Button>
              <Button size="sm" onClick={save} disabled={!draft.trim()}>
                Speichern
              </Button>
            </div>
          </div>
        ) : (
          <p className="whitespace-pre-wrap text-sm">{note.body}</p>
        )}
      </div>
    </div>
  );
}
