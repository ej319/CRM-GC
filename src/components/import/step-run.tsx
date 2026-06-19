"use client";

import { CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface ImportResult {
  imported: number;
  skipped: number;
  warnings: number;
}

interface StepRunProps {
  progress: number;
  done: boolean;
  result: ImportResult | null;
  onGoBoard: () => void;
  onReset: () => void;
}

/** Schritt 5: Fortschritt und Ergebnis des Imports. */
export function StepRun({
  progress,
  done,
  result,
  onGoBoard,
  onReset,
}: StepRunProps) {
  if (!done || !result) {
    return (
      <div className="space-y-3 py-8 text-center">
        <p className="text-sm text-muted-foreground">
          Import läuft … {progress}%
        </p>
        <Progress value={progress} />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <CheckCircle2 className="h-5 w-5 text-primary" />
        <p className="font-medium">Import abgeschlossen</p>
      </div>

      <ul className="space-y-1 text-sm">
        <li>
          <span className="font-semibold text-primary">{result.imported}</span>{" "}
          Kunden importiert (Phase „Kalter Kontakt")
        </li>
        <li>
          <span className="font-semibold">{result.skipped}</span> übersprungen
          (Dubletten / ohne Firmenname)
        </li>
        <li>
          <span className="font-semibold">{result.warnings}</span> mit Warnung
          (Feld leer gelassen)
        </li>
      </ul>

      <div className="flex flex-wrap gap-2">
        <Button onClick={onGoBoard}>Zum Board</Button>
        <Button variant="outline" onClick={onReset}>
          Weitere Datei importieren
        </Button>
      </div>
    </div>
  );
}
