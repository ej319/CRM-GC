"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  RichTextEditor,
  type RichTextEditorHandle,
} from "@/components/detail/rich-text-editor";
import { EditorImageButton } from "@/components/detail/editor-image-button";
import { saveSignature } from "@/lib/signature/actions";

export function SignatureEditor({ initialHtml }: { initialHtml: string }) {
  const [body, setBody] = useState(initialHtml);
  const [saving, setSaving] = useState(false);
  const editorRef = useRef<RichTextEditorHandle>(null);

  async function handleSave() {
    setSaving(true);
    const res = await saveSignature(body);
    setSaving(false);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    setBody(res.data.bodyHtml);
    toast.success("Signatur gespeichert.");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">E-Mail-Signatur</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Diese Signatur wird beim Schreiben automatisch unter deine E-Mails gesetzt
          (pro Mail abschaltbar). Über das Bild-Symbol kannst du dein Logo einfügen.
        </p>
        <RichTextEditor
          ref={editorRef}
          value={body}
          onChange={setBody}
          placeholder="Name, Firma, Kontakt … – und über das Bild-Symbol dein Logo"
          toolbarExtra={
            <EditorImageButton
              onInsert={(url) =>
                editorRef.current?.insertHtml(`<img src="${url}" alt="" />`)
              }
            />
          }
        />
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Speichern …" : "Speichern"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
