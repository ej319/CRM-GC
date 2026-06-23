"use client";

import { useState } from "react";
import { Paperclip, X } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export interface EmailDraft {
  to: string;
  subject: string;
  body: string;
  attachments: string[];
}

interface EmailComposerProps {
  customerEmail?: string;
  /** Sendet den Entwurf. Gibt true bei Erfolg zurück (dann werden die Felder geleert). */
  onSend: (draft: EmailDraft) => Promise<boolean>;
}

/** E-Mail-Schreibfenster in der Kundenakte (Empfänger vorbelegt). */
export function EmailComposer({ customerEmail, onSend }: EmailComposerProps) {
  const [to, setTo] = useState(customerEmail ?? "");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [attachments, setAttachments] = useState<string[]>([]);
  const [sending, setSending] = useState(false);

  function addFiles(files: FileList | null) {
    if (!files) return;
    setAttachments((prev) => [...prev, ...Array.from(files).map((f) => f.name)]);
  }

  async function handleSend() {
    if (!to.trim()) return;
    setSending(true);
    const ok = await onSend({ to, subject, body, attachments });
    setSending(false);
    if (ok) {
      setSubject("");
      setBody("");
      setAttachments([]);
    }
  }

  return (
    <div className="space-y-3">
      <Alert>
        <AlertTitle>Vorschau</AlertTitle>
        <AlertDescription>
          Das Schreibfenster steht. „Gmail verbinden" und der echte Versand
          werden mit der Gmail-Anbindung (Backend) aktiviert; Formatierung folgt
          ebenfalls dort.
        </AlertDescription>
      </Alert>

      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Von</Label>
        <p className="text-sm">dein verbundenes Gmail-Postfach</p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="email-to">An</Label>
        <Input
          id="email-to"
          type="email"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          placeholder="empfaenger@example.de"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="email-subject">Betreff</Label>
        <Input
          id="email-subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="email-body">Text</Label>
        <Textarea
          id="email-body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="min-h-40"
          placeholder="Nachricht schreiben …"
        />
      </div>

      {attachments.length > 0 ? (
        <ul className="flex flex-wrap gap-2">
          {attachments.map((name, i) => (
            <li
              key={`${name}-${i}`}
              className="flex items-center gap-1 rounded-full border bg-muted px-2 py-1 text-xs"
            >
              <Paperclip className="h-3 w-3" />
              {name}
              <button
                type="button"
                onClick={() =>
                  setAttachments((prev) => prev.filter((_, idx) => idx !== i))
                }
                aria-label={`${name} entfernen`}
                className="text-muted-foreground hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <div className="flex items-center justify-between">
        <Button asChild variant="outline" size="sm">
          <label className="cursor-pointer">
            <Paperclip className="mr-1.5 h-4 w-4" /> Anhang
            <input
              type="file"
              multiple
              className="hidden"
              onChange={(e) => addFiles(e.target.files)}
            />
          </label>
        </Button>
        <Button onClick={handleSend} disabled={!to.trim() || sending}>
          {sending ? "Senden …" : "Senden"}
        </Button>
      </div>
    </div>
  );
}
