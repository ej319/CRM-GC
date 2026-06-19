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
import {
  createImportRun,
  finalizeImportRun,
  importCustomersBatch,
  suggestValueMappings,
} from "@/lib/import/actions";
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

const CHUNK_SIZE = 300;

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
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggesting, setSuggesting] = useState(false);
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
      setFileName(file.name);
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

  async function prepareSuggestions() {
    // KI-Vorschlag pro unterschiedlichem Wert; lokaler Vorschlag als Fallback.
    const [catRes, srcRes] = await Promise.all([
      categoryValues.length > 0
        ? suggestValueMappings(categoryValues, "category")
        : Promise.resolve({ ok: true as const, data: {} }),
      sourceValues.length > 0
        ? suggestValueMappings(sourceValues, "source")
        : Promise.resolve({ ok: true as const, data: {} }),
    ]);
    const aiCategory: Record<string, string> = catRes.ok ? catRes.data : {};
    const aiSource: Record<string, string> = srcRes.ok ? srcRes.data : {};

    setCategoryMap((prev) => {
      const next = { ...prev };
      for (const value of categoryValues) {
        if (!(value in next)) {
          next[value] = aiCategory[value] || localGuessCategory(value) || value;
        }
      }
      return next;
    });
    setSourceMap((prev) => {
      const next = { ...prev };
      for (const value of sourceValues) {
        if (!(value in next)) next[value] = aiSource[value] || value;
      }
      return next;
    });
  }

  async function handleNext() {
    if (step === "columns") {
      if (!nameMapped) {
        toast.error("Bitte ordne eine Spalte dem Firmennamen zu.");
        return;
      }
      if (hasValueStep) {
        setSuggesting(true);
        try {
          await prepareSuggestions();
        } finally {
          setSuggesting(false);
        }
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

  async function startImport() {
    if (!prepared) return;
    setRunning(true);
    setProgress(0);
    setResult(null);
    setStep("run");

    const importable = prepared.rows
      .filter((r) => r.status === "import")
      .map((r) => r.input);

    const run = await createImportRun(fileName);
    if (!run.ok) {
      toast.error(run.error);
      setRunning(false);
      setStep("preview");
      return;
    }
    const runId = run.data.runId;

    let inserted = 0;
    let dbSkipped = 0;
    let failed = false;

    for (let i = 0; i < importable.length; i += CHUNK_SIZE) {
      const batch = importable.slice(i, i + CHUNK_SIZE);
      const res = await importCustomersBatch(runId, batch);
      if (!res.ok) {
        toast.error(`Import unterbrochen: ${res.error}`);
        failed = true;
        break;
      }
      inserted += res.data.inserted;
      dbSkipped += res.data.skipped;
      setProgress(
        Math.round(
          (Math.min(i + batch.length, importable.length) / importable.length) *
            100,
        ),
      );
    }

    if (importable.length === 0) setProgress(100);

    const skipped =
      prepared.summary.dupesInFile + prepared.summary.errors + dbSkipped;
    await finalizeImportRun(runId, {
      imported: inserted,
      skipped,
      warnings: prepared.summary.warnings,
    });

    setResult({ imported: inserted, skipped, warnings: prepared.summary.warnings });
    setRunning(false);
    if (!failed && inserted > 0) {
      toast.success(`${inserted} Kunden importiert.`);
    }
  }

  function reset() {
    setStep("file");
    setParsed(null);
    setFileName("");
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
            <Button variant="outline" onClick={handleBack} disabled={suggesting}>
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
              <Button
                onClick={handleNext}
                disabled={(step === "columns" && !nameMapped) || suggesting}
              >
                {suggesting ? "Vorschläge werden geladen …" : "Weiter"}
              </Button>
            )}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
