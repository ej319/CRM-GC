"use client";

import { Sparkles } from "lucide-react";

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
import { CATEGORY_OPTIONS, SOURCE_OPTIONS } from "@/lib/pipeline/data";

const EMPTY_VALUE = "__empty__";

interface ValueTableProps {
  title: string;
  values: string[];
  options: readonly string[];
  map: Record<string, string>;
  onChange: (raw: string, value: string) => void;
}

function ValueTable({ title, values, options, map, onChange }: ValueTableProps) {
  if (values.length === 0) return null;

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold">{title}</h3>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Wert aus deiner Datei</TableHead>
              <TableHead className="w-[260px]">CRM-Wert</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {values.map((raw) => {
              const current = raw in map ? map[raw] : raw;
              const selectValue = current === "" ? EMPTY_VALUE : current;
              return (
                <TableRow key={raw}>
                  <TableCell className="font-medium">{raw}</TableCell>
                  <TableCell>
                    <Select
                      value={selectValue}
                      onValueChange={(v) =>
                        onChange(raw, v === EMPTY_VALUE ? "" : v)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {options.map((opt) => (
                          <SelectItem key={opt} value={opt}>
                            {opt}
                          </SelectItem>
                        ))}
                        {!options.includes(raw) ? (
                          <SelectItem value={raw}>
                            „{raw}" übernehmen
                          </SelectItem>
                        ) : null}
                        <SelectItem value={EMPTY_VALUE}>Leer lassen</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

interface StepValuesProps {
  categoryValues: string[];
  sourceValues: string[];
  categoryMap: Record<string, string>;
  sourceMap: Record<string, string>;
  onChangeCategory: (raw: string, value: string) => void;
  onChangeSource: (raw: string, value: string) => void;
}

/** Schritt 3: Kategorie-/Quelle-Werte den CRM-Werten zuordnen (mit Vorschlag). */
export function StepValues({
  categoryValues,
  sourceValues,
  categoryMap,
  sourceMap,
  onChangeCategory,
  onChangeSource,
}: StepValuesProps) {
  return (
    <div className="space-y-5">
      <p className="flex items-start gap-1.5 text-sm text-muted-foreground">
        <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        <span>
          Für jeden unterschiedlichen Wert ist ein Vorschlag vorausgewählt.
          Prüfe oder ändere ihn — oder übernimm den Wert unverändert. (Der
          intelligente KI-Vorschlag wird mit dem Backend aktiviert; bis dahin
          ein einfacher Vorschlag.)
        </span>
      </p>

      <ValueTable
        title="Kategorie"
        values={categoryValues}
        options={CATEGORY_OPTIONS}
        map={categoryMap}
        onChange={onChangeCategory}
      />
      <ValueTable
        title="Quelle"
        values={sourceValues}
        options={SOURCE_OPTIONS}
        map={sourceMap}
        onChange={onChangeSource}
      />
    </div>
  );
}
