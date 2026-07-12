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
import { uploadForEditor } from "@/components/detail/editor-image";
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
          (pro Mail abschaltbar).
        </p>
        <RichTextEditor
          ref={editorRef}
          value={body}
          onChange={setBody}
          placeholder="Name, Firma, Kontakt …"
          uploadImage={uploadForEditor}
          toolbarExtra={
            <EditorImageButton
              onInsert={(url) =>
                editorRef.current?.insertHtml(`<img src="${url}" alt="" />`)
              }
            />
          }
        />
        <div className="flex flex-wrap items-center justify-between gap-2">
          <EditorImageButton
            label="Logo / Bild einfügen"
            onInsert={(url) =>
              editorRef.current?.insertHtml(`<img src="${url}" alt="" />`)
            }
          />
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Speichern …" : "Speichern"}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Tipp: Wähle dein Logo als Bilddatei (JPG oder PNG) vom Computer. Es wird
          automatisch übernommen und beim Empfänger zuverlässig angezeigt.
        </p>
      </CardContent>
    </Card>
  );
}
