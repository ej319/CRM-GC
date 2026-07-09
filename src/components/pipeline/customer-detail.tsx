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
import { ActivityItem } from "@/components/detail/activity-item";
import { PlanNextDialog } from "@/components/detail/plan-next-dialog";
import type { ActivityFormValues } from "@/components/detail/activity-form";
import { deleteCustomer } from "@/lib/pipeline/actions";
import { createNote, deleteNote, updateNote } from "@/lib/notes/actions";
import {
  createActivity as createActivityAction,
  completeActivity as completeActivityAction,
  updateActivity as updateActivityAction,
  deleteActivity as deleteActivityAction,
} from "@/lib/activities/actions";
import { focusActivity, type Activity } from "@/lib/activities/data";
import { sendEmail } from "@/lib/email/actions";
import type { Email } from "@/lib/email/data";
import type { EmailDraft } from "@/components/detail/email-composer";
import type { Customer } from "@/lib/pipeline/data";
import type { Note } from "@/lib/notes/data";
import type { EmailTemplate, TemplateCustomerFields } from "@/lib/templates/data";

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
  initialActivities,
  initialEmails,
  gmailConnected,
  gmailEmail,
  templates,
  signatureHtml,
}: {
  customer: Customer | null;
  initialNotes: Note[];
  initialActivities: Activity[];
  initialEmails: Email[];
  gmailConnected: boolean;
  gmailEmail?: string;
  templates: EmailTemplate[];
  signatureHtml: string;
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
  return (
    <CustomerDetailView
      customer={customer}
      initialNotes={initialNotes}
      initialActivities={initialActivities}
      initialEmails={initialEmails}
      gmailConnected={gmailConnected}
      gmailEmail={gmailEmail}
      templates={templates}
      signatureHtml={signatureHtml}
    />
  );
}

function CustomerDetailView({
  customer,
  initialNotes,
  initialActivities,
  initialEmails,
  gmailConnected,
  gmailEmail,
  templates,
  signatureHtml,
}: {
  customer: Customer;
  initialNotes: Note[];
  initialActivities: Activity[];
  initialEmails: Email[];
  gmailConnected: boolean;
  gmailEmail?: string;
  templates: EmailTemplate[];
  signatureHtml: string;
}) {
  const [deleting, setDeleting] = useState(false);
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [activities, setActivities] = useState<Activity[]>(initialActivities);
  const [emails, setEmails] = useState<Email[]>(initialEmails);
  const [planNextOpen, setPlanNextOpen] = useState(false);

  // --- Notizen ---
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

  // --- Aktivitäten ---
  async function addActivity(values: ActivityFormValues): Promise<boolean> {
    const res = await createActivityAction(customer.id, values);
    if (!res.ok) {
      toast.error(res.error);
      return false;
    }
    setActivities((prev) => [...prev, res.data]);
    return true;
  }
  async function completeActivity(id: string) {
    const res = await completeActivityAction(id);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    setActivities((prev) => prev.map((a) => (a.id === id ? res.data : a)));
    setPlanNextOpen(true);
  }
  async function editActivity(
    id: string,
    values: ActivityFormValues,
  ): Promise<boolean> {
    const res = await updateActivityAction(id, values);
    if (!res.ok) {
      toast.error(res.error);
      return false;
    }
    setActivities((prev) => prev.map((a) => (a.id === id ? res.data : a)));
    return true;
  }
  async function deleteActivity(id: string) {
    const res = await deleteActivityAction(id);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    setActivities((prev) => prev.filter((a) => a.id !== id));
  }

  async function handleSendEmail(draft: EmailDraft): Promise<boolean> {
    const res = await sendEmail(customer.id, draft);
    if (!res.ok) {
      toast.error(res.error);
      return false;
    }
    setEmails((prev) => [res.data, ...prev]);
    toast.success("E-Mail gesendet.");
    return true;
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

  const customerFields: TemplateCustomerFields = {
    name: customer.name,
    contactName: customer.contactName,
    address: customer.address,
    plz: customer.plz,
    city: customer.city,
    category: customer.category,
  };

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
          <DetailComposer
            onAddNote={addNote}
            onAddActivity={addActivity}
            customerId={customer.id}
            customerEmail={customer.email}
            gmailConnected={gmailConnected}
            gmailEmail={gmailEmail}
            onSendEmail={handleSendEmail}
            templates={templates}
            customerFields={customerFields}
            signatureHtml={signatureHtml}
          />

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
            emails={emails}
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
