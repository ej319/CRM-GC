"use client";

import { useState } from "react";
import { Paperclip, X, Loader2, Mail } from "lucide-react";
import { toast } from "sonner";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";

export interface EmailAttachmentRef {
  path: string;
  name: string;
  size: number;
  contentType?: string;
}

export interface EmailDraft {
  to: string;
  cc?: string;
  subject: string;
  body: string;
  attachments: EmailAttachmentRef[];
}

interface EmailComposerProps {
  customerId: string;
  customerEmail?: string;
  connected: boolean;
  senderEmail?: string;
  /** Sendet den Entwurf. Gibt true bei Erfolg zurück (dann werden die Felder geleert). */
  onSend: (draft: EmailDraft) => Promise<boolean>;
}

/** E-Mail-Schreibfenster in der Kundenakte (Empfänger vorbelegt, Versand über Gmail). */
export function EmailComposer({
  customerId,
  customerEmail,
  connected,
  senderEmail,
  onSend,
}: EmailComposerProps) {
  const [to, setTo] = useState(customerEmail ?? "");
  const [cc, setCc] = useState("");
  const [showCc, setShowCc] = useState(false);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [attachments, setAttachments] = useState<EmailAttachmentRef[]>([]);
  const [uploading, setUploading] = useState(false);
  const [sending, setSending] = useState(false);

  // Noch kein Gmail verbunden → Aufforderung statt Schreibfenster.
  if (!connected) {
    return (
      <Alert>
        <Mail className="h-4 w-4" />
        <AlertTitle>Gmail verbinden</AlertTitle>
        <AlertDescription className="space-y-3">
          <p>
            Verbinde einmal dein Gmail-Postfach, danach kannst du E-Mails direkt
            aus der Kundenakte senden.
          </p>
          <Button asChild size="sm">
            <a href={`/api/gmail/connect?next=/kunde/${customerId}`}>
              <Mail className="mr-1.5 h-4 w-4" /> Gmail verbinden
            </a>
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  async function addFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const supabase = createClient();
    setUploading(true);
    for (const file of Array.from(files)) {
      const path = `${crypto.randomUUID()}/${file.name}`;
      const { error } = await supabase.storage
        .from("email-attachments")
        .upload(path, file, { contentType: file.type || undefined });
      if (error) {
        toast.error(`Anhang „${file.name}" konnte nicht hochgeladen werden.`);
      } else {
        setAttachments((prev) => [
          ...prev,
          { path, name: file.name, size: file.size, contentType: file.type || undefined },
        ]);
      }
    }
    setUploading(false);
  }

  async function handleSend() {
    if (!to.trim()) return;
    setSending(true);
    const ok = await onSend({
      to,
      cc: showCc && cc.trim() ? cc : undefined,
      subject,
      body,
      attachments,
    });
    setSending(false);
    if (ok) {
      setSubject("");
      setBody("");
      setCc("");
      setShowCc(false);
      setAttachments([]);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label className="text-xs text-muted-foreground">Von</Label>
          <p className="text-sm">{senderEmail ?? "dein verbundenes Gmail-Postfach"}</p>
        </div>
        {!showCc ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowCc(true)}
          >
            + CC
          </Button>
        ) : null}
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

      {showCc ? (
        <div className="space-y-1.5">
          <Label htmlFor="email-cc">CC</Label>
          <Input
            id="email-cc"
            type="email"
            value={cc}
            onChange={(e) => setCc(e.target.value)}
            placeholder="kopie@example.de"
          />
        </div>
      ) : null}

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
          {attachments.map((att, i) => (
            <li
              key={att.path}
              className="flex items-center gap-1 rounded-full border bg-muted px-2 py-1 text-xs"
            >
              <Paperclip className="h-3 w-3" />
              {att.name}
              <button
                type="button"
                onClick={() =>
                  setAttachments((prev) => prev.filter((_, idx) => idx !== i))
                }
                aria-label={`${att.name} entfernen`}
                className="text-muted-foreground hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <div className="flex items-center justify-between">
        <Button asChild variant="outline" size="sm" disabled={uploading}>
          <label className="cursor-pointer">
            {uploading ? (
              <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
            ) : (
              <Paperclip className="mr-1.5 h-4 w-4" />
            )}
            Anhang
            <input
              type="file"
              multiple
              className="hidden"
              onChange={(e) => addFiles(e.target.files)}
            />
          </label>
        </Button>
        <Button onClick={handleSend} disabled={!to.trim() || sending || uploading}>
          {sending ? "Senden …" : "Senden"}
        </Button>
      </div>
    </div>
  );
}
