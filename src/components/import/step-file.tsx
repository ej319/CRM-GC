"use client";

import { useRef, useState } from "react";
import { Upload, FileSpreadsheet, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

interface StepFileProps {
  onFile: (file: File) => void;
  loading: boolean;
  error?: string;
}

/** Schritt 1: Datei auswählen oder per Drag-and-Drop ablegen. */
export function StepFile({ onFile, loading, error }: StepFileProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  function handleFiles(files: FileList | null) {
    const file = files?.[0];
    if (file) onFile(file);
  }

  return (
    <div className="space-y-4">
      <div
        role="button"
        tabIndex={0}
        aria-label="Datei auswählen oder hierher ziehen"
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFiles(e.dataTransfer.files);
        }}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-10 text-center transition-colors",
          dragOver
            ? "border-primary bg-primary/5"
            : "border-border bg-muted/30 hover:bg-muted/50",
        )}
      >
        {loading ? (
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        ) : (
          <Upload className="h-10 w-10 text-muted-foreground" />
        )}
        <div className="space-y-1">
          <p className="font-medium">
            {loading
              ? "Datei wird gelesen …"
              : "Datei hierher ziehen oder klicken zum Auswählen"}
          </p>
          <p className="text-sm text-muted-foreground">Excel (.xlsx) oder CSV</p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xls,.csv,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <FileSpreadsheet className="h-3.5 w-3.5" />
        Deine Datei wird nur im Browser gelesen und nicht hochgeladen.
      </p>
    </div>
  );
}
