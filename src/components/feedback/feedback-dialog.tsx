"use client";

import { useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { MessageSquarePlus } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createTicket } from "@/lib/feedback/actions";
import { KIND_OPTIONS, kindLabel, type Ticket, type TicketKind } from "@/lib/feedback/data";

export function FeedbackDialog({
  trigger,
  onCreated,
}: {
  trigger?: ReactNode;
  onCreated?: (ticket: Ticket) => void;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState<TicketKind>("fehler");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit() {
    if (!message.trim()) {
      toast.error("Bitte eine Beschreibung eingeben.");
      return;
    }
    setSaving(true);
    const res = await createTicket({ kind, message, pageUrl: pathname });
    setSaving(false);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    toast.success("Danke! Deine Meldung wurde gespeichert.");
    onCreated?.(res.data);
    setKind("fehler");
    setMessage("");
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="outline" size="sm">
            <MessageSquarePlus className="mr-1.5 h-4 w-4" /> Feedback
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Feedback geben</DialogTitle>
          <DialogDescription>
            Melde einen Fehler, eine Idee oder eine Frage. Die aktuelle Seite wird
            automatisch mitgespeichert.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="fb-kind">Art</Label>
            <Select value={kind} onValueChange={(v) => setKind(v as TicketKind)}>
              <SelectTrigger id="fb-kind">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {KIND_OPTIONS.map((k) => (
                  <SelectItem key={k} value={k}>
                    {kindLabel(k)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="fb-message">Beschreibung</Label>
            <Textarea
              id="fb-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Was ist passiert bzw. was wünschst du dir?"
              className="min-h-28"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>
            Abbrechen
          </Button>
          <Button onClick={handleSubmit} disabled={saving || !message.trim()}>
            {saving ? "Senden …" : "Absenden"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
