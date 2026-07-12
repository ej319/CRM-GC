"use client";

import { useState } from "react";
import { Paperclip, X, Loader2, Mail, FileText, ChevronDown } from "lucide-react";
import { toast } from "sonner";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RichTextEditor } from "@/components/detail/rich-text-editor";
import { uploadForEditor } from "@/components/detail/editor-image";
import { createClient } from "@/lib/supabase/client";
import {
  fillPlaceholders,
  type EmailTemplate,
  type TemplateCustomerFields,
} from "@/lib/templates/data";
import { instantiateTemplateAttachments } from "@/lib/templates/actions";
import { attachFileToEmail } from "@/lib/files/actions";
import type { CustomerFile } from "@/lib/files/data";

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
  /** Nachrichtentext als HTML (formatiert). Wird serverseitig bereinigt. */
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
  templates: EmailTemplate[];
  customerFields: TemplateCustomerFields;
  /** Persönliche Signatur (HTML, bereits bereinigt) – leer, wenn keine angelegt. */
  signatureHtml: string;
  /** Beim Kunden abgelegte Dateien (zum direkten Anhängen). */
  customerFiles: CustomerFile[];
}

/** Prüft, ob der HTML-Text inhaltlich leer ist. */
function isEmptyHtml(html: string): boolean {
  return (
    html
      .replace(/<br\s*\/?>/gi, "")
      .replace(/<[^>]+>/g, "")
      .replace(/&nbsp;/g, "")
      .trim().length === 0
  );
}

/** E-Mail-Schreibfenster in der Kundenakte (Empfänger vorbelegt, Versand über Gmail). */
export function EmailComposer({
  customerId,
  customerEmail,
  connected,
  senderEmail,
  onSend,
  templates,
  customerFields,
  signatureHtml,
  customerFiles,
}: EmailComposerProps) {
  const [to, setTo] = useState(customerEmail ?? "");
  const [cc, setCc] = useState("");
  const [showCc, setShowCc] = useState(false);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [attachments, setAttachments] = useState<EmailAttachmentRef[]>([]);
  const [uploading, setUploading] = useState(false);
  const [sending, setSending] = useState(false);
  // Vorlage, für die noch die „Ersetzen?"-Rückfrage offen ist.
  const [pendingTemplate, setPendingTemplate] = useState<EmailTemplate | null>(null);
  const [applyingTemplate, setApplyingTemplate] = useState(false);
  const [attachingFile, setAttachingFile] = useState(false);
  // Signatur standardmäßig anhängen, wenn eine hinterlegt ist.
  const [signatureOn, setSignatureOn] = useState(Boolean(signatureHtml));

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

  // Vorlage gewählt: bei bereits vorhandenem Betreff/Text erst nachfragen.
  function chooseTemplate(tpl: EmailTemplate) {
    const hasContent = subject.trim().length > 0 || !isEmptyHtml(body);
    if (hasContent) {
      setPendingTemplate(tpl);
    } else {
      void applyTemplate(tpl);
    }
  }

  async function applyTemplate(tpl: EmailTemplate) {
    // Betreff nur ersetzen, wenn die Vorlage einen hat (sonst vorhandenen behalten).
    if (tpl.subject) {
      setSubject(
        fillPlaceholders(tpl.subject, customerFields, tpl.placeholderDefaults, {
          html: false,
        }),
      );
    }
    setBody(
      fillPlaceholders(tpl.bodyHtml, customerFields, tpl.placeholderDefaults, {
        html: true,
      }),
    );

    // Anhänge der Vorlage als eigene Kopien übernehmen (unabhängig von der Vorlage).
    if (tpl.attachments.length > 0) {
      setApplyingTemplate(true);
      const res = await instantiateTemplateAttachments(tpl.id);
      setApplyingTemplate(false);
      if (!res.ok) {
        toast.error(res.error);
      } else if (res.data.length > 0) {
        setAttachments((prev) => [...prev, ...res.data]);
      }
    }
  }

  // Abgelegte Kundendatei als Anhang übernehmen (eigene Kopie).
  async function chooseStoredFile(file: CustomerFile) {
    setAttachingFile(true);
    const res = await attachFileToEmail(file.storagePath, file.fileName, file.contentType);
    setAttachingFile(false);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    setAttachments((prev) => [...prev, res.data]);
  }

  async function handleSend() {
    if (!to.trim()) return;
    // Signatur ans Ende setzen (falls aktiviert und vorhanden).
    const finalBody =
      signatureOn && signatureHtml ? `${body}<br><br>${signatureHtml}` : body;
    setSending(true);
    const ok = await onSend({
      to,
      cc: showCc && cc.trim() ? cc : undefined,
      subject,
      body: finalBody,
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
      <div className="flex items-center justify-between gap-2">
        <div className="space-y-0.5">
          <Label className="text-xs text-muted-foreground">Von</Label>
          <p className="text-sm">{senderEmail ?? "dein verbundenes Gmail-Postfach"}</p>
        </div>
        <div className="flex items-center gap-1">
          {templates.length > 0 ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button type="button" variant="outline" size="sm" disabled={applyingTemplate}>
                  {applyingTemplate ? (
                    <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                  ) : (
                    <FileText className="mr-1.5 h-4 w-4" />
                  )}
                  Vorlage
                  <ChevronDown className="ml-1 h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="max-h-72 overflow-y-auto">
                {templates.map((tpl) => (
                  <DropdownMenuItem key={tpl.id} onSelect={() => chooseTemplate(tpl)}>
                    <FileText className="mr-2 h-4 w-4 text-muted-foreground" />
                    {tpl.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}
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
        <Label>Text</Label>
        <RichTextEditor
          value={body}
          onChange={setBody}
          placeholder="Nachricht schreiben …"
          uploadImage={uploadForEditor}
        />
      </div>

      {signatureHtml ? (
        <div className="space-y-2 rounded-md border bg-muted/30 p-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="sig-toggle" className="text-sm">
              Signatur anhängen
            </Label>
            <Switch
              id="sig-toggle"
              checked={signatureOn}
              onCheckedChange={setSignatureOn}
            />
          </div>
          {signatureOn ? (
            <div
              className="border-t pt-2 text-sm text-muted-foreground [&_img]:my-1 [&_img]:max-w-full"
              // Signatur wurde beim Speichern serverseitig bereinigt (sanitizeEmailHtml).
              dangerouslySetInnerHTML={{ __html: signatureHtml }}
            />
          ) : null}
        </div>
      ) : null}

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
        <div className="flex items-center gap-1">
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
          {customerFiles.length > 0 ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button type="button" variant="outline" size="sm" disabled={attachingFile}>
                  {attachingFile ? (
                    <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                  ) : (
                    <FileText className="mr-1.5 h-4 w-4" />
                  )}
                  Aus Dateien
                  <ChevronDown className="ml-1 h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="max-h-72 overflow-y-auto">
                {customerFiles.map((f) => (
                  <DropdownMenuItem key={f.id} onSelect={() => chooseStoredFile(f)}>
                    <Paperclip className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span className="truncate">{f.fileName}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}
        </div>
        <Button onClick={handleSend} disabled={!to.trim() || sending || uploading}>
          {sending ? "Senden …" : "Senden"}
        </Button>
      </div>

      <AlertDialog
        open={!!pendingTemplate}
        onOpenChange={(o) => !o && setPendingTemplate(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Vorhandenen Text ersetzen?</AlertDialogTitle>
            <AlertDialogDescription>
              Im Schreibfenster steht bereits etwas. Die Vorlage „{pendingTemplate?.name}"
              ersetzt den aktuellen Text{pendingTemplate?.subject ? " und Betreff" : ""}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                const tpl = pendingTemplate;
                setPendingTemplate(null);
                if (tpl) void applyTemplate(tpl);
              }}
            >
              Ersetzen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
