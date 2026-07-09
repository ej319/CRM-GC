"use client";

import { useRef, useState } from "react";
import { Image as ImageIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { uploadEmailImage } from "@/lib/email/upload-image";

/**
 * Werkzeugleisten-Knopf zum Einfügen eines eigenen Bildes: lädt die Datei
 * (verkleinert + geprüft) hoch und meldet die App-Bildadresse über onInsert.
 */
export function EditorImageButton({ onInsert }: { onInsert: (url: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function handle(files: FileList | null) {
    const file = files?.[0];
    if (inputRef.current) inputRef.current.value = ""; // gleiche Datei erneut wählbar
    if (!file) return;
    setBusy(true);
    const res = await uploadEmailImage(file);
    setBusy(false);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    onInsert(res.url);
  }

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
        disabled={busy}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => inputRef.current?.click()}
        aria-label="Bild einfügen"
        title="Bild einfügen"
      >
        {busy ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <ImageIcon className="h-4 w-4" />
        )}
      </Button>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/gif"
        className="hidden"
        onChange={(e) => handle(e.target.files)}
      />
    </>
  );
}
