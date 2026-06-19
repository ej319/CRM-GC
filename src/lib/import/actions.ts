"use server";

import Anthropic from "@anthropic-ai/sdk";
import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { customerInputSchema, type CustomerInput } from "@/lib/pipeline/schema";
import { CATEGORY_OPTIONS, SOURCE_OPTIONS } from "@/lib/pipeline/data";
import { parseSuggestionMap } from "@/lib/import/mapping";

type Result<T> = { ok: true; data: T } | { ok: false; error: string };

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

function inputToRow(input: CustomerInput) {
  const s = (v?: string) => (v ?? "").trim();
  return {
    name: input.name.trim(),
    contact_name: s(input.contactName),
    phone: s(input.phone),
    email: s(input.email),
    address: s(input.address),
    plz: s(input.plz),
    city: s(input.city),
    category: s(input.category),
    source: s(input.source),
    monthly_value:
      typeof input.monthlyValue === "number" ? input.monthlyValue : null,
  };
}

type InsertRow = ReturnType<typeof inputToRow> & {
  import_run_id: string;
  created_by: string;
  stage_id: string;
};

/** Legt einen neuen Import-Vorgang an und gibt dessen ID zurück. */
export async function createImportRun(
  fileName: string,
): Promise<Result<{ runId: string }>> {
  const { supabase, user } = await requireUser();
  if (!user) return { ok: false, error: "Nicht angemeldet" };

  const { data, error } = await supabase
    .from("import_runs")
    .insert({ file_name: (fileName ?? "").slice(0, 255), created_by: user.id })
    .select("id")
    .single();
  if (error || !data) {
    return {
      ok: false,
      error: error?.message ?? "Import konnte nicht gestartet werden",
    };
  }
  return { ok: true, data: { runId: data.id } };
}

/**
 * Speichert einen Block geprüfter Kunden. Dubletten (gleicher Firmenname,
 * Groß-/Kleinschreibung egal) gegen den vorhandenen Bestand werden übersprungen.
 */
export async function importCustomersBatch(
  runId: string,
  inputs: CustomerInput[],
): Promise<Result<{ inserted: number; skipped: number }>> {
  const { supabase, user } = await requireUser();
  if (!user) return { ok: false, error: "Nicht angemeldet" };
  if (!Array.isArray(inputs) || inputs.length === 0) {
    return { ok: true, data: { inserted: 0, skipped: 0 } };
  }

  // Vorhandene Firmennamen laden (Dubletten-Prüfung gegen den Bestand).
  const { data: existing, error: exErr } = await supabase
    .from("customers")
    .select("name");
  if (exErr) return { ok: false, error: exErr.message };

  const seen = new Set(
    (existing ?? []).map((r: { name: string }) => r.name.trim().toLowerCase()),
  );

  const rows: InsertRow[] = [];
  let skipped = 0;
  for (const raw of inputs) {
    const parsed = customerInputSchema.safeParse(raw);
    if (!parsed.success) {
      skipped++;
      continue;
    }
    const key = parsed.data.name.trim().toLowerCase();
    if (!key || seen.has(key)) {
      skipped++;
      continue;
    }
    seen.add(key);
    rows.push({
      ...inputToRow(parsed.data),
      import_run_id: runId,
      created_by: user.id,
      stage_id: "kalter_kontakt",
    });
  }

  if (rows.length > 0) {
    const { error } = await supabase.from("customers").insert(rows);
    if (error) return { ok: false, error: error.message };
  }
  return { ok: true, data: { inserted: rows.length, skipped } };
}

/** Schreibt die End-Zahlen des Import-Vorgangs fest. */
export async function finalizeImportRun(
  runId: string,
  counts: { imported: number; skipped: number; warnings: number },
): Promise<Result<null>> {
  const { supabase, user } = await requireUser();
  if (!user) return { ok: false, error: "Nicht angemeldet" };

  const { error } = await supabase
    .from("import_runs")
    .update({
      imported: counts.imported,
      skipped: counts.skipped,
      warnings: counts.warnings,
    })
    .eq("id", runId);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/");
  revalidatePath("/import");
  return { ok: true, data: null };
}

/** Macht einen Import rückgängig: entfernt genau die in diesem Import angelegten Kunden. */
export async function undoImport(
  runId: string,
): Promise<Result<{ deleted: number }>> {
  const { supabase, user } = await requireUser();
  if (!user) return { ok: false, error: "Nicht angemeldet" };

  const { data: deleted, error } = await supabase
    .from("customers")
    .delete()
    .eq("import_run_id", runId)
    .select("id");
  if (error) return { ok: false, error: error.message };

  const { error: upErr } = await supabase
    .from("import_runs")
    .update({ status: "undone" })
    .eq("id", runId);
  if (upErr) return { ok: false, error: upErr.message };

  revalidatePath("/");
  revalidatePath("/import");
  return { ok: true, data: { deleted: deleted?.length ?? 0 } };
}

function extractJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    // Fallback: das erste {...} aus der Antwort herauslösen.
  }
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start !== -1 && end > start) {
    try {
      return JSON.parse(text.slice(start, end + 1));
    } catch {
      return null;
    }
  }
  return null;
}

/**
 * Schlägt per Claude (Haiku) für jeden unterschiedlichen Wert die am besten
 * passende CRM-Kategorie/Quelle vor. Ohne ANTHROPIC_API_KEY oder bei Fehlern
 * wird ein leeres Ergebnis geliefert; das Frontend nutzt dann den lokalen Vorschlag.
 */
export async function suggestValueMappings(
  values: string[],
  kind: "category" | "source",
): Promise<Result<Record<string, string>>> {
  const { user } = await requireUser();
  if (!user) return { ok: false, error: "Nicht angemeldet" };

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return { ok: true, data: {} };

  const options = kind === "category" ? CATEGORY_OPTIONS : SOURCE_OPTIONS;
  const unique = Array.from(
    new Set((values ?? []).map((v) => v.trim()).filter(Boolean)),
  );
  if (unique.length === 0) return { ok: true, data: {} };

  try {
    const client = new Anthropic({ apiKey });
    const response = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 1024,
      system:
        `Du ordnest Geschäfts-/Quellenbezeichnungen einer festen Liste von CRM-Werten zu. ` +
        `Erlaubte Werte: ${options.join(", ")}. ` +
        `Antworte ausschließlich mit einem JSON-Objekt, das jeden Eingabewert exakt einem erlaubten Wert zuordnet. ` +
        `Wenn keiner passt, nutze einen leeren String "". Keine Erklärungen, nur das JSON-Objekt.`,
      messages: [{ role: "user", content: JSON.stringify(unique) }],
    });

    let text = "";
    for (const block of response.content) {
      if (block.type === "text") text += block.text;
    }
    return { ok: true, data: parseSuggestionMap(extractJson(text), unique, options) };
  } catch {
    // KI-Fehler ist nicht kritisch – lokaler Vorschlag übernimmt im Frontend.
    return { ok: true, data: {} };
  }
}
