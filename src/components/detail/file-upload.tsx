"use client";

import { useRef, useState } from "react";
import { Paperclip, X, Loader2, Upload } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { addCustomerFile } from "@/lib/files/actions";
import { formatFileSize, type CustomerFile } from "@/lib/files/data";

const FILES_BUCKET = "customer-files";
const MAX_FILE_SIZE = 20 * 1024 * 1024; // ~20 MB pro Datei

export function FileUpload({
  customerId,
  onFileAdded,
}: {
  customerId: string;
  onFileAdded: (file: CustomerFile) => void;
}) {
  const [selected, setSelected] = useState<File[]>([]);
  const [description, setDescription] = useState("");
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function addSelected(list: FileList | null) {
    if (!list) return;
    const next: File[] = [];
    for (const f of Array.from(list)) {
      if (f.size > MAX_FILE_SIZE) {
        toast.error(`„${f.name}" ist zu groß (max. ~20 MB).`);
        continue;
      }
      next.push(f);
    }
    setSelected((prev) => [...prev, ...next]);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function handleUpload() {
    if (selected.length === 0) return;
    setUploading(true);
    const supabase = createClient();
    let anyOk = false;
    for (const file of selected) {
      const path = `${crypto.randomUUID()}/${file.name}`;
      const { error } = await supabase.storage
        .from(FILES_BUCKET)
        .upload(path, file, { contentType: file.type || undefined });
      if (error) {
        toast.error(`„${file.name}" konnte nicht hochgeladen werden.`);
        continue;
      }
      const res = await addCustomerFile(customerId, {
        path,
        name: file.name,
        size: file.size,
        contentType: file.type || undefined,
        description,
      });
      if (!res.ok) {
        toast.error(res.error);
        continue;
      }
      onFileAdded(res.data);
      anyOk = true;
    }
    setUploading(false);
    if (anyOk) {
      toast.success("Datei(en) hochgeladen.");
      setSelected([]);
      setDescription("");
    }
  }

  return (
    <div className="space-y-3">
      {selected.length > 0 ? (
        <ul className="flex flex-wrap gap-2">
          {selected.map((f, i) => (
            <li
              key={`${f.name}-${i}`}
              className="flex items-center gap-1 rounded-full border bg-muted px-2 py-1 text-xs"
            >
              <Paperclip className="h-3 w-3" />
              {f.name} · {formatFileSize(f.size)}
              <button
                type="button"
                onClick={() => setSelected((prev) => prev.filter((_, idx) => idx !== i))}
                aria-label={`${f.name} entfernen`}
                className="text-muted-foreground hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <div className="space-y-1.5">
        <Label htmlFor="file-desc">Beschreibung (optional)</Label>
        <Input
          id="file-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="z. B. Angebot Fensterreinigung, Stand März"
        />
      </div>

      <div className="flex items-center justify-between">
        <Button asChild variant="outline" size="sm" disabled={uploading}>
          <label className="cursor-pointer">
            <Paperclip className="mr-1.5 h-4 w-4" />
            Datei(en) wählen
            <input
              ref={inputRef}
              type="file"
              multiple
              className="hidden"
              onChange={(e) => addSelected(e.target.files)}
            />
          </label>
        </Button>
        <Button onClick={handleUpload} disabled={selected.length === 0 || uploading}>
          {uploading ? (
            <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
          ) : (
            <Upload className="mr-1.5 h-4 w-4" />
          )}
          {uploading ? "Hochladen …" : "Hochladen"}
        </Button>
      </div>
    </div>
  );
}
