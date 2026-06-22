"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, Info, Trash2 } from "lucide-react";
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CustomerSummary } from "@/components/detail/customer-summary";
import { DetailComposer } from "@/components/detail/detail-composer";
import { Verlauf } from "@/components/detail/verlauf";
import { ActivityItem } from "@/components/detail/activity-item";
import { PlanNextDialog } from "@/components/detail/plan-next-dialog";
import type { ActivityFormValues } from "@/components/detail/activity-form";
import { deleteCustomer } from "@/lib/pipeline/actions";
import { createNote, deleteNote, updateNote } from "@/lib/notes/actions";
import { focusActivity, type Activity } from "@/lib/activities/data";
import type { Customer } from "@/lib/pipeline/data";
import type { Note } from "@/lib/notes/data";

function plusDays(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

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
  // Aktivitäten laufen vorerst im Browser (Vorschau); echtes Speichern folgt im Backend.
  const [activities, setActivities] = useState<Activity[]>([]);
  const [planNextOpen, setPlanNextOpen] = useState(false);

  // --- Notizen (echt, aus PROJ-4) ---
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

  // --- Aktivitäten (Vorschau) ---
  async function addActivity(values: ActivityFormValues): Promise<boolean> {
    setActivities((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        customerId: customer.id,
        type: values.type,
        dueDate: values.dueDate,
        dueTime: values.dueTime || undefined,
        note: values.note || undefined,
        completedAt: null,
      },
    ]);
    return true;
  }
  function completeActivity(id: string) {
    setActivities((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, completedAt: new Date().toISOString() } : a,
      ),
    );
    setPlanNextOpen(true);
  }
  async function editActivity(
    id: string,
    values: ActivityFormValues,
  ): Promise<boolean> {
    setActivities((prev) =>
      prev.map((a) =>
        a.id === id
          ? {
              ...a,
              type: values.type,
              dueDate: values.dueDate,
              dueTime: values.dueTime || undefined,
              note: values.note || undefined,
            }
          : a,
      ),
    );
    return true;
  }
  function deleteActivity(id: string) {
    setActivities((prev) => prev.filter((a) => a.id !== id));
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

  const focus = focusActivity(activities);

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
                Notizen und Aktivitäten. Das lässt sich nicht rückgängig machen.
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
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Vorschau-Modus (Aktivitäten)</AlertTitle>
            <AlertDescription>
              Aktivitäten kannst du hier schon planen, abhaken und bearbeiten –
              sie werden aber noch nicht dauerhaft gespeichert (kommt im
              nächsten Schritt). Notizen werden bereits echt gespeichert.
            </AlertDescription>
          </Alert>

          <DetailComposer onAddNote={addNote} onAddActivity={addActivity} />

          <Card className={focus ? undefined : "border-dashed"}>
            <CardHeader>
              <CardTitle className="text-base">Fokus</CardTitle>
            </CardHeader>
            <CardContent>
              {focus ? (
                <ActivityItem
                  activity={focus}
                  onComplete={completeActivity}
                  onEdit={editActivity}
                  onDelete={deleteActivity}
                />
              ) : (
                <p className="text-sm text-muted-foreground">
                  Keine offene Aktivität geplant. Plane oben eine Aktivität.
                </p>
              )}
            </CardContent>
          </Card>

          <Verlauf
            notes={notes}
            onEditNote={editNote}
            onDeleteNote={removeNote}
            activities={activities}
            onCompleteActivity={completeActivity}
            onEditActivity={editActivity}
            onDeleteActivity={deleteActivity}
          />
        </div>
      </div>

      <PlanNextDialog
        open={planNextOpen}
        onOpenChange={setPlanNextOpen}
        customerName={customer.name}
        defaultDate={plusDays(7)}
        onPlan={addActivity}
      />
    </div>
  );
}
