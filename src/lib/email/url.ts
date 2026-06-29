// Reine Hilfsfunktion zum Schutz vor Open Redirect (PROJ-7, QA-Finding L2).

/**
 * Gibt nur echte interne Pfade zurück. Erlaubt sind Pfade, die mit "/" beginnen –
 * aber NICHT "//" (protokoll-relativ) oder "/\" (Backslash-Trick), die ein Browser
 * als fremde Domain interpretieren würde. Alles andere fällt auf "/" zurück.
 */
export function safeNextPath(input: string | null | undefined): string {
  if (!input || !input.startsWith("/")) return "/";
  if (input.startsWith("//") || input.startsWith("/\\")) return "/";
  return input;
}
