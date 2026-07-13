"use client";

import { useState } from "react";
import { Trash2, Bug, Lightbulb, HelpCircle, MessageSquarePlus } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FeedbackDialog } from "@/components/feedback/feedback-dialog";
import { updateTicketStatus, deleteTicket } from "@/lib/feedback/actions";
import { formatDateTime } from "@/lib/notes/data";
import {
  STATUS_OPTIONS,
  statusLabel,
  type Ticket,
  type TicketKind,
  type TicketStatus,
} from "@/lib/feedback/data";

const KIND_ICON: Record<TicketKind, typeof Bug> = {
  fehler: Bug,
  idee: Lightbulb,
  frage: HelpCircle,
};

export function FeedbackPage({ initial }: { initial: Ticket[] }) {
  const [tickets, setTickets] = useState<Ticket[]>(initial);
  const [toDelete, setToDelete] = useState<Ticket | null>(null);
  const [deleting, setDeleting] = useState(false);

  function handleCreated(ticket: Ticket) {
    setTickets((prev) => [ticket, ...prev]);
  }

  async function changeStatus(ticket: Ticket, status: TicketStatus) {
    const res = await updateTicketStatus(ticket.id, status);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    setTickets((prev) => prev.map((t) => (t.id === ticket.id ? res.data : t)));
  }

  async function confirmDelete() {
    if (!toDelete) return;
    setDeleting(true);
    const res = await deleteTicket(toDelete.id);
    setDeleting(false);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    setTickets((prev) => prev.filter((t) => t.id !== toDelete.id));
    setToDelete(null);
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-foreground">Hilfe & Feedback</h1>
          <p className="text-sm text-muted-foreground">
            Melde Fehler, Ideen oder Fragen direkt aus der App. Jede Meldung landet
            hier als Ticket und kann nachverfolgt werden.
          </p>
        </div>
        <FeedbackDialog
          onCreated={handleCreated}
          trigger={
            <Button>
              <MessageSquarePlus className="mr-1.5 h-4 w-4" /> Feedback geben
            </Button>
          }
        />
      </div>

      <Card className="bg-muted/40">
        <CardContent className="space-y-1 py-4 text-sm text-muted-foreground">
          <p className="font-medium text-foreground">So funktioniert&apos;s</p>
          <p>
            Beschreibe möglichst konkret, was passiert ist oder was du dir wünschst.
            Die Seite, auf der du gerade bist, wird automatisch mitgespeichert – das
            hilft, Fehler schnell zu finden. Den Bearbeitungsstand kannst du hier
            jederzeit auf „In Arbeit" oder „Erledigt" setzen.
          </p>
        </CardContent>
      </Card>

      {tickets.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <MessageSquarePlus className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Noch keine Meldungen. Über „Feedback geben" legst du die erste an.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {tickets.map((t) => {
            const Icon = KIND_ICON[t.kind] ?? HelpCircle;
            return (
              <Card key={t.id}>
                <CardContent className="space-y-2 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <Badge variant="secondary">{statusLabel(t.status)}</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Select
                        value={t.status}
                        onValueChange={(v) => changeStatus(t, v as TicketStatus)}
                      >
                        <SelectTrigger className="h-8 w-36 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {STATUS_OPTIONS.map((s) => (
                            <SelectItem key={s} value={s}>
                              {statusLabel(s)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setToDelete(t)}
                        aria-label="Ticket löschen"
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <p className="whitespace-pre-wrap text-sm">{t.message}</p>
                  <p className="text-xs text-muted-foreground">
                    {t.authorName ? `${t.authorName} · ` : ""}
                    {formatDateTime(t.createdAt)}
                    {t.pageUrl ? ` · Seite: ${t.pageUrl}` : ""}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <AlertDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ticket löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Die Meldung wird endgültig entfernt.
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
