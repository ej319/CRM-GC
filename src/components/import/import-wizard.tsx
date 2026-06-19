"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { parseSpreadsheet, type ParsedFile } from "@/lib/import/parse";
import {
  autoSuggestMapping,
  getDistinctValues,
  localGuessCategory,
  prepareRows,
  type MappingTarget,
  type PrepareResult,
} from "@/lib/import/mapping";
import { StepFile } from "./step-file";
import { StepColumns } from "./step-columns";
import { StepValues } from "./step-values";
import { StepPreview } from "./step-preview";
import { StepRun } from "./step-run";

type Step = "file" | "columns" | "values" | "preview" | "run";

const STEP_LABELS: { key: Step; label: string }[] = [
  { key: "file", label: "Datei" },
  { key: "columns", label: "Spalten" },
  { key: "values", label: "Werte" },
  { key: "preview", label: "Vorschau" },
  { key: "run", label: "Import" },
];

function Stepper({ current }: { current: Step }) {
  const activeIndex = STEP_LABELS.findIndex((s) => s.key === current);
  return (
    <div className="flex items-center gap-2 overflow-x-auto">
      {STEP_LABELS.map((step, index) => (
        <div key={step.key} className="flex items-center gap-2">
          <div
            className={cn(
              "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-medium",
              index <= activeIndex
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground",
            )}
          >
            {index + 1}
          </div>
          <span
            className={cn(
              "whitespace-nowrap text-sm",
              index === activeIndex
                ? "font-semibold text-foreground"
                : "text-muted-foreground",
            )}
          >
            {step.label}
          </span>
          {index < STEP_LABELS.length - 1 ? (
            <div className="h-px w-6 bg-border" />
          ) : null}
        </div>
      ))}
    </div>
  );
}

export function ImportWizard() {
  const [step, setStep] = useState<Step>("file");
  const [parsed, setParsed] = useState<ParsedFile | null>(null);
  const [loading, setLoading] = useState(false);
  const [fileError, setFileError] = useState<string>();
  const [mapping, setMapping] = useState<Record<string, MappingTarget>>({});
  const [categoryMap, setCategoryMap] = useState<Record<string, string>>({});
  const [sourceMap, setSourceMap] = useState<Record<string, string>>({});
  const [progress, setProgress] = useState(0);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<{
    imported: number;
    skipped: number;
    warnings: number;
  } | null>(null);

  const nameMapped = useMemo(
    () => Object.values(mapping).includes("name"),
    [mapping],
  );
  const hasValueStep = useMemo(() => {
    const targets = Object.values(mapping);
    return targets.includes("category") || targets.includes("source");
  }, [mapping]);

  const categoryValues = useMemo(
    () => (parsed ? getDistinctValues(parsed.rows, mapping, "category") : []),
    [parsed, mapping],
  );
  const sourceValues = useMemo(
    () => (parsed ? getDistinctValues(parsed.rows, mapping, "source") : []),
    [parsed, mapping],
  );

  const prepared: PrepareResult | null = useMemo(
    () =>
      parsed ? prepareRows(parsed.rows, mapping, categoryMap, sourceMap) : null,
    [parsed, mapping, categoryMap, sourceMap],
  );

  async function handleFile(file: File) {
    setLoading(true);
    setFileError(undefined);
    try {
      const data = await parseSpreadsheet(file);
      setParsed(data);
      setMapping(autoSuggestMapping(data.headers));
      setCategoryMap({});
      setSourceMap({});
      setStep("columns");
    } catch (e) {
      setFileError(
        e instanceof Error ? e.message : "Die Datei konnte nicht gelesen werden.",
      );
    } finally {
      setLoading(false);
    }
  }

  function handleNext() {
    if (step === "columns") {
      if (!nameMapped) {
        toast.error("Bitte ordne eine Spalte dem Firmennamen zu.");
        return;
      }
      if (hasValueStep) {
        // Vorschläge vorbereiten (lokaler Fallback; KI folgt mit dem Backend).
        setCategoryMap((prev) => {
          const next = { ...prev };
          for (const value of categoryValues) {
            if (!(value in next)) next[value] = localGuessCategory(value) || value;
          }
          return next;
        });
        setSourceMap((prev) => {
          const next = { ...prev };
          for (const value of sourceValues) {
            if (!(value in next)) next[value] = value;
          }
          return next;
        });
        setStep("values");
      } else {
        setStep("preview");
      }
      return;
    }
    if (step === "values") {
      setStep("preview");
    }
  }

  function handleBack() {
    if (step === "columns") setStep("file");
    else if (step === "values") setStep("columns");
    else if (step === "preview") setStep(hasValueStep ? "values" : "columns");
  }

  function startImport() {
    if (!prepared) return;
    setRunning(true);
    setProgress(0);
    setStep("run");

    // Vorschau-Modus: simulierter Fortschritt. Die echte, blockweise
    // Speicherung in die Datenbank wird mit dem Backend angebunden.
    const total = prepared.summary.toImport;
    let done = 0;
    const tick = () => {
      done = Math.min(total, done + Math.max(1, Math.ceil(total / 20)));
      setProgress(total === 0 ? 100 : Math.round((done / total) * 100));
      if (done >= total) {
        setRunning(false);
        setResult({
          imported: prepared.summary.toImport,
          skipped: prepared.summary.dupesInFile + prepared.summary.errors,
          warnings: prepared.summary.warnings,
        });
      } else {
        setTimeout(tick, 60);
      }
    };
    setTimeout(tick, 200);
  }

  function reset() {
    setStep("file");
    setParsed(null);
    setFileError(undefined);
    setMapping({});
    setCategoryMap({});
    setSourceMap({});
    setProgress(0);
    setRunning(false);
    setResult(null);
  }

  return (
    <Card>
      <CardHeader>
        <Stepper current={step} />
      </CardHeader>
      <CardContent className="space-y-6">
        {step === "file" ? (
          <StepFile onFile={handleFile} loading={loading} error={fileError} />
        ) : null}

        {step === "columns" && parsed ? (
          <StepColumns
            headers={parsed.headers}
            sampleRows={parsed.rows.slice(0, 3)}
            mapping={mapping}
            onChange={(header, target) =>
              setMapping((m) => ({ ...m, [header]: target }))
            }
            nameMapped={nameMapped}
          />
        ) : null}

        {step === "values" ? (
          <StepValues
            categoryValues={categoryValues}
            sourceValues={sourceValues}
            categoryMap={categoryMap}
            sourceMap={sourceMap}
            onChangeCategory={(raw, value) =>
              setCategoryMap((m) => ({ ...m, [raw]: value }))
            }
            onChangeSource={(raw, value) =>
              setSourceMap((m) => ({ ...m, [raw]: value }))
            }
          />
        ) : null}

        {step === "preview" && prepared ? (
          <StepPreview
            summary={prepared.summary}
            importRows={prepared.rows.filter((r) => r.status === "import")}
          />
        ) : null}

        {step === "run" ? (
          <StepRun
            progress={progress}
            done={!running && result !== null}
            result={result}
            onGoBoard={() => {
              window.location.href = "/";
            }}
            onReset={reset}
          />
        ) : null}

        {step !== "file" && step !== "run" ? (
          <div className="flex items-center justify-between border-t pt-4">
            <Button variant="outline" onClick={handleBack}>
              Zurück
            </Button>
            {step === "preview" ? (
              <Button
                onClick={startImport}
                disabled={!prepared || prepared.summary.toImport === 0}
              >
                Importieren ({prepared?.summary.toImport ?? 0})
              </Button>
            ) : (
              <Button onClick={handleNext} disabled={step === "columns" && !nameMapped}>
                Weiter
              </Button>
            )}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
