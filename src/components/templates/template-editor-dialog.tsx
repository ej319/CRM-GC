"use client";

import { useEffect, useRef, useState } from "react";
import { Paperclip, X, Loader2, Braces } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  RichTextEditor,
  type RichTextEditorHandle,
} from "@/components/detail/rich-text-editor";
import { EditorImageButton } from "@/components/detail/editor-image-button";
import { createClient } from "@/lib/supabase/client";
import {
  TEMPLATE_PLACEHOLDERS,
  type EmailTemplate,
} from "@/lib/templates/data";
import { createTemplate, updateTemplate } from "@/lib/templates/actions";
import type { TemplateAttachmentRef } from "@/lib/templates/schema";

const TEMPLATE_BUCKET = "template-attachments";
const MAX_ATTACH_TOTAL = 18 * 1024 * 1024;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Vorhandene Vorlage zum Bearbeiten, oder null zum Neuanlegen. */
  initial: EmailTemplate | null;
  onSaved: (tpl: EmailTemplate) => void;
}

/** Findet die im Text tatsächlich genutzten Platzhalter-Token (für die Ersatztext-Felder). */
function usedTokens(text: string): Set<string> {
  const found = new Set<string>();
  const re = /\{([A-Za-zÄÖÜäöüß]+)\}/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) found.add(m[1]);
  return found;
}

export function TemplateEditorDialog({ open, onOpenChange, initial, onSaved }: Props) {
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [defaults, setDefaults] = useState<Record<string, string>>({});
  const [attachments, setAttachments] = useState<TemplateAttachmentRef[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const editorRef = useRef<RichTextEditorHandle>(null);
  const subjectRef = useRef<HTMLInputElement>(null);
  const lastFocus = useRef<"subject" | "body">("body");

  // Felder bei jedem Öffnen aus der Vorlage (oder leer) übernehmen.
  useEffect(() => {
    if (!open) return;
    setName(initial?.name ?? "");
    setSubject(initial?.subject ?? "");
    setBody(initial?.bodyHtml ?? "");
    setDefaults(initial?.placeholderDefaults ?? {});
    setAttachments(
      (initial?.attachments ?? []).map((a) => ({
        path: a.storagePath,
        name: a.fileName,
        size: a.fileSize,
        contentType: a.contentType,
      })),
    );
    lastFocus.current = "body";
  }, [open, initial]);

  function insertPlaceholder(token: string) {
    const ins = `{${token}}`;
    if (lastFocus.current === "subject") {
      const el = subjectRef.current;
      if (!el) {
        setSubject((s) => s + ins);
        return;
      }
      const start = el.selectionStart ?? subject.length;
      const end = el.selectionEnd ?? subject.length;
      const next = subject.slice(0, start) + ins + subject.slice(end);
      setSubject(next);
      requestAnimationFrame(() => {
        el.focus();
        const pos = start + ins.length;
        el.setSelectionRange(pos, pos);
      });
    } else {
      editorRef.current?.insertText(ins);
    }
  }

  async function addFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const supabase = createClient();
    setUploading(true);
    let total = attachments.reduce((sum, a) => sum + a.size, 0);
    for (const file of Array.from(files)) {
      if (total + file.size > MAX_ATTACH_TOTAL) {
        toast.error(`„${file.name}" überschreitet das Limit (max. ca. 18 MB gesamt).`);
        continue;
      }
      const path = `${crypto.randomUUID()}/${file.name}`;
      const { error } = await supabase.storage
        .from(TEMPLATE_BUCKET)
        .upload(path, file, { contentType: file.type || undefined });
      if (error) {
        toast.error(`Anhang „${file.name}" konnte nicht hochgeladen werden.`);
      } else {
        total += file.size;
        setAttachments((prev) => [
          ...prev,
          { path, name: file.name, size: file.size, contentType: file.type || undefined },
        ]);
      }
    }
    setUploading(false);
  }

  async function handleSave() {
    if (!name.trim()) {
      toast.error("Bitte einen Namen für die Vorlage eingeben.");
      return;
    }
    setSaving(true);
    const input = {
      name,
      subject,
      bodyHtml: body,
      placeholderDefaults: defaults,
      attachments,
    };
    const res = initial
      ? await updateTemplate(initial.id, input)
      : await createTemplate(input);
    setSaving(false);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    toast.success(initial ? "Vorlage gespeichert." : "Vorlage angelegt.");
    onSaved(res.data);
    onOpenChange(false);
  }

  const tokensInUse = usedTokens(`${subject} ${body}`);
  const defaultFields = TEMPLATE_PLACEHOLDERS.filter(
    (p) => p.hasDefault && tokensInUse.has(p.token),
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{initial ? "Vorlage bearbeiten" : "Neue Vorlage"}</DialogTitle>
          <DialogDescription>
            Platzhalter wie {"{Anrede}"} oder {"{Firma}"} werden beim Einfügen in eine
            E-Mail automatisch mit den Daten des Kunden gefüllt.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="tpl-name">Name der Vorlage</Label>
            <Input
              id="tpl-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="z. B. Erstansprache"
            />
          </div>

          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-medium">Inhalt</span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button type="button" variant="outline" size="sm">
                  <Braces className="mr-1.5 h-4 w-4" /> Platzhalter einfügen
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {TEMPLATE_PLACEHOLDERS.map((p) => (
                  <DropdownMenuItem
                    key={p.token}
                    onSelect={() => insertPlaceholder(p.token)}
                  >
                    <span className="font-mono text-xs">{`{${p.token}}`}</span>
                    <span className="ml-2 text-muted-foreground">{p.label}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="tpl-subject">Betreff</Label>
            <Input
              id="tpl-subject"
              ref={subjectRef}
              value={subject}
              onFocus={() => (lastFocus.current = "subject")}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Betreff (optional)"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Text</Label>
            <RichTextEditor
              ref={editorRef}
              value={body}
              onChange={setBody}
              onFocus={() => (lastFocus.current = "body")}
              placeholder="Vorlagentext schreiben …"
              toolbarExtra={
                <EditorImageButton
                  onInsert={(url) =>
                    editorRef.current?.insertHtml(`<img src="${url}" alt="" />`)
                  }
                />
              }
            />
          </div>

          {defaultFields.length > 0 ? (
            <div className="space-y-2 rounded-md border bg-muted/40 p-3">
              <p className="text-sm font-medium">Ersatztexte für leere Felder</p>
              <p className="text-xs text-muted-foreground">
                Wird beim Kunden das jeweilige Feld nicht gefunden, setzt die Vorlage
                diesen Text ein. Leer lassen = die Stelle bleibt leer.
              </p>
              {defaultFields.map((p) => (
                <div key={p.token} className="grid grid-cols-3 items-center gap-2">
                  <Label htmlFor={`def-${p.token}`} className="text-sm">
                    {p.label}
                  </Label>
                  <Input
                    id={`def-${p.token}`}
                    className="col-span-2"
                    value={defaults[p.token] ?? ""}
                    onChange={(e) =>
                      setDefaults((prev) => ({ ...prev, [p.token]: e.target.value }))
                    }
                    placeholder={`z. B. ${p.token === "Firma" ? "unser Kunde" : "…"}`}
                  />
                </div>
              ))}
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

          <Button asChild variant="outline" size="sm" disabled={uploading}>
            <label className="cursor-pointer">
              {uploading ? (
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
              ) : (
                <Paperclip className="mr-1.5 h-4 w-4" />
              )}
              Anhang hinzufügen
              <input
                type="file"
                multiple
                className="hidden"
                onChange={(e) => addFiles(e.target.files)}
              />
            </label>
          </Button>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Abbrechen
          </Button>
          <Button onClick={handleSave} disabled={saving || uploading || !name.trim()}>
            {saving ? "Speichern …" : "Speichern"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
