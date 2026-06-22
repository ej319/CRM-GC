"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NoteItem } from "./note-item";
import { VERLAUF_FILTERS, type Note } from "@/lib/notes/data";

interface VerlaufProps {
  notes: Note[];
  onEdit: (id: string, body: string) => void;
  onDelete: (id: string) => void;
}

function NotesList({
  notes,
  onEdit,
  onDelete,
}: VerlaufProps) {
  if (notes.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-muted-foreground">
        Noch keine Einträge.
      </p>
    );
  }
  return (
    <div className="space-y-4">
      {notes.map((note) => (
        <NoteItem
          key={note.id}
          note={note}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

function ComingSoon({ label }: { label: string }) {
  return (
    <p className="py-6 text-center text-sm text-muted-foreground">
      {label} – kommt bald.
    </p>
  );
}

/** Verlauf-Zeitleiste mit Filter-Reitern. Aktuell nur Notizen; weitere Typen klinken sich später ein. */
export function Verlauf({ notes, onEdit, onDelete }: VerlaufProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Verlauf</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all">
          <TabsList className="flex-wrap">
            {VERLAUF_FILTERS.map((f) => (
              <TabsTrigger key={f.key} value={f.key}>
                {f.label}
                {f.key === "notes" && notes.length > 0 ? ` (${notes.length})` : ""}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="all" className="mt-4">
            <NotesList notes={notes} onEdit={onEdit} onDelete={onDelete} />
          </TabsContent>
          <TabsContent value="notes" className="mt-4">
            <NotesList notes={notes} onEdit={onEdit} onDelete={onDelete} />
          </TabsContent>
          <TabsContent value="activities">
            <ComingSoon label="Aktivitäten (PROJ-5)" />
          </TabsContent>
          <TabsContent value="emails">
            <ComingSoon label="E-Mails (PROJ-7)" />
          </TabsContent>
          <TabsContent value="files">
            <ComingSoon label="Dateien (PROJ-13)" />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
