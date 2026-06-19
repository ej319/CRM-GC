"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CRM_FIELDS, IGNORE, type MappingTarget } from "@/lib/import/mapping";

const IGNORE_VALUE = "__ignore__";

interface StepColumnsProps {
  headers: string[];
  sampleRows: Record<string, string>[];
  mapping: Record<string, MappingTarget>;
  onChange: (header: string, target: MappingTarget) => void;
  nameMapped: boolean;
}

/** Schritt 2: Jede Datei-Spalte einem CRM-Feld zuordnen. */
export function StepColumns({
  headers,
  sampleRows,
  mapping,
  onChange,
  nameMapped,
}: StepColumnsProps) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Ordne jede Spalte deiner Datei einem CRM-Feld zu. Passende Spalten sind
        bereits vorgeschlagen.{" "}
        <span className="font-medium text-foreground">Firmenname</span> ist
        Pflicht.
      </p>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Spalte in deiner Datei</TableHead>
              <TableHead>Beispiel</TableHead>
              <TableHead className="w-[230px]">CRM-Feld</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {headers.map((header) => {
              const sample =
                sampleRows.map((r) => r[header]).find((v) => v && v.trim()) ||
                "—";
              return (
                <TableRow key={header}>
                  <TableCell className="font-medium">{header}</TableCell>
                  <TableCell className="max-w-[220px] truncate text-muted-foreground">
                    {sample}
                  </TableCell>
                  <TableCell>
                    <Select
                      value={mapping[header] ? mapping[header] : IGNORE_VALUE}
                      onValueChange={(v) =>
                        onChange(
                          header,
                          v === IGNORE_VALUE ? IGNORE : (v as MappingTarget),
                        )
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={IGNORE_VALUE}>
                          — nicht importieren —
                        </SelectItem>
                        {CRM_FIELDS.map((field) => (
                          <SelectItem key={field.key} value={field.key}>
                            {field.label}
                            {field.required ? " *" : ""}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {!nameMapped ? (
        <p className="text-sm text-destructive">
          Bitte ordne eine Spalte dem Pflichtfeld „Firmenname" zu, um
          fortzufahren.
        </p>
      ) : null}
    </div>
  );
}
