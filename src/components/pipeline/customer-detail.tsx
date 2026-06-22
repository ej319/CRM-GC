"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, Trash2 } from "lucide-react";
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CustomerSummary } from "@/components/detail/customer-summary";
import { DetailComposer } from "@/components/detail/detail-composer";
import { Verlauf } from "@/components/detail/verlauf";
import { deleteCustomer } from "@/lib/pipeline/actions";
import { createNote, deleteNote, updateNote } from "@/lib/notes/actions";
import type { Customer } from "@/lib/pipeline/data";
import type { Note } from "@/lib/notes/data";

export function CustomerDetail({
  customer,
  initialNotes,
}: {
  customer: Customer | null;
  initialNotes: Note[];
}) {
  if (!customer) {
    return (
      <div className="mx-auto max-w-md py-12 text-center">
        <p className="text-muted-foreground">
          Dieser Kunde wurde nicht gefunden (vielleicht wurde er gelöscht).
        </p>
        <Button asChild variant="outline" className="mt-4">
          <Link href="/">Zurück zum Board</Link>
        </Button>
      </div>
    );
  }
  return <CustomerDetailView customer={customer} initialNotes={initialNotes} />;
}

function CustomerDetailView({
  customer,
  initialNotes,
}: {
  customer: Customer;
  initialNotes: Note[];
}) {
  const [deleting, setDeleting] = useState(false);
  const [notes, setNotes] = useState<Note[]>(initialNotes);

  async function addNote(body: string): Promise<boolean> {
    const res = await createNote(customer.id, body);
    if (!res.ok) {
      toast.error(res.error);
      return false;
    }
    setNotes((prev) => [res.data, ...prev]);
    return true;
  }

  async function editNote(id: string, body: string): Promise<boolean> {
    const res = await updateNote(id, body);
    if (!res.ok) {
      toast.error(res.error);
      return false;
    }
    setNotes((prev) => prev.map((n) => (n.id === id ? res.data : n)));
    return true;
  }

  async function removeNote(id: string) {
    const res = await deleteNote(id);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    setNotes((prev) => prev.filter((n) => n.id !== id));
  }

  async function handleDelete() {
    setDeleting(true);
    const res = await deleteCustomer(customer.id);
    if (res.ok) {
      toast.success("Kunde gelöscht");
      window.location.href = "/";
    } else {
      setDeleting(false);
      toast.error(res.error);
    }
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-4 flex items-center justify-between">
        <Button asChild variant="ghost" size="sm">
          <Link href="/">
            <ArrowLeft className="mr-1 h-4 w-4" /> Board
          </Link>
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm" disabled={deleting}>
              <Trash2 className="mr-1 h-4 w-4" /> Löschen
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Kunde löschen?</AlertDialogTitle>
              <AlertDialogDescription>
                „{customer.name}" wird endgültig gelöscht – inklusive aller
                Notizen. Das lässt sich nicht rückgängig machen.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Abbrechen</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete}>
                Löschen
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <CustomerSummary customer={customer} />
        </div>

        <div className="space-y-4 lg:col-span-2">
          <DetailComposer onAddNote={addNote} />

          <Card className="border-dashed">
            <CardHeader>
              <CardTitle className="text-base">Fokus</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Geplante Aktivitäten (z.B. „Anruf am …") erscheinen hier – kommt
                mit PROJ-5.
              </p>
            </CardContent>
          </Card>

          <Verlauf notes={notes} onEdit={editNote} onDelete={removeNote} />
        </div>
      </div>
    </div>
  );
}
