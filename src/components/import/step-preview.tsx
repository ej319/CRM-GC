"use client";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { ImportSummary, PreparedRow } from "@/lib/import/mapping";

const PREVIEW_LIMIT = 15;

interface StatProps {
  label: string;
  value: number;
  tone?: "primary" | "destructive" | "warning";
}

function Stat({ label, value, tone }: StatProps) {
  return (
    <div className="rounded-lg border bg-background p-3">
      <p
        className={cn(
          "text-2xl font-semibold",
          tone === "primary" && "text-primary",
          tone === "destructive" && value > 0 && "text-destructive",
          tone === "warning" && value > 0 && "text-amber-600",
        )}
      >
        {value}
      </p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

interface StepPreviewProps {
  summary: ImportSummary;
  importRows: PreparedRow[];
}

/** Schritt 4: Zusammenfassung + Vorschau der ersten Zeilen. */
export function StepPreview({ summary, importRows }: StepPreviewProps) {
  const preview = importRows.slice(0, PREVIEW_LIMIT);
  const rest = importRows.length - preview.length;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Werden importiert" value={summary.toImport} tone="primary" />
        <Stat label="Dubletten (übersprungen)" value={summary.dupesInFile} />
        <Stat
          label="Ohne Firmenname (übersprungen)"
          value={summary.errors}
          tone="destructive"
        />
        <Stat label="Mit Warnung" value={summary.warnings} tone="warning" />
      </div>

      <p className="text-sm text-muted-foreground">
        Alle importierten Kunden landen in der Phase{" "}
        <Badge variant="secondary">Kalter Kontakt</Badge>. Gespeichert wird
        erst, wenn du unten auf „Importieren" klickst.
      </p>

      {preview.length > 0 ? (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Firmenname</TableHead>
                <TableHead>Ort</TableHead>
                <TableHead>Kategorie</TableHead>
                <TableHead className="text-right">Monatswert</TableHead>
                <TableHead>Hinweis</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {preview.map((row) => (
                <TableRow key={row.line}>
                  <TableCell className="font-medium">{row.input.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {row.input.city || "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {row.input.category || "—"}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {row.input.monthlyValue != null
                      ? `${row.input.monthlyValue.toLocaleString("de-DE")} €`
                      : "—"}
                  </TableCell>
                  <TableCell>
                    {row.warnings.length > 0 ? (
                      <span className="text-xs text-amber-600">
                        {row.warnings.join("; ")}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          Keine importierbaren Zeilen gefunden.
        </p>
      )}

      {rest > 0 ? (
        <p className="text-xs text-muted-foreground">
          … und {rest} weitere werden importiert.
        </p>
      ) : null}
    </div>
  );
}
