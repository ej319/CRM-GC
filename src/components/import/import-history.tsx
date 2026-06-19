"use client";

import { Undo2 } from "lucide-react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export interface ImportRun {
  id: string;
  createdAt: string;
  fileName: string;
  imported: number;
  skipped: number;
  warnings: number;
  status: "completed" | "undone";
}

interface ImportHistoryProps {
  runs: ImportRun[];
}

/**
 * Liste der bisherigen Importe mit „Rückgängig machen".
 * Das tatsächliche Rückgängigmachen wird mit dem Backend angebunden.
 */
export function ImportHistory({ runs }: ImportHistoryProps) {
  function handleUndo() {
    toast.info("Rückgängig machen wird mit dem Backend angebunden.");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Import-Verlauf</CardTitle>
        <CardDescription>
          Bisherige Importe. Ein Import lässt sich jederzeit rückgängig machen –
          dabei werden genau die in diesem Import angelegten Kunden entfernt.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {runs.length === 0 ? (
          <p className="text-sm text-muted-foreground">Noch keine Importe.</p>
        ) : (
          <ul className="divide-y">
            {runs.map((run) => (
              <li
                key={run.id}
                className="flex flex-wrap items-center justify-between gap-2 py-3"
              >
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">{run.fileName}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(run.createdAt).toLocaleString("de-DE")} ·{" "}
                    {run.imported} importiert · {run.skipped} übersprungen
                    {run.status === "undone" ? " · rückgängig gemacht" : ""}
                  </p>
                </div>
                {run.status === "completed" ? (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Undo2 className="mr-2 h-4 w-4" />
                        Rückgängig machen
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Import rückgängig machen?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          Es werden genau die {run.imported} in diesem Import
                          angelegten Kunden entfernt – auch wenn sie inzwischen
                          bearbeitet oder verschoben wurden. Dieser Schritt kann
                          nicht widerrufen werden.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                        <AlertDialogAction onClick={handleUndo}>
                          Rückgängig machen
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                ) : (
                  <span className="text-xs text-muted-foreground">
                    rückgängig gemacht
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
