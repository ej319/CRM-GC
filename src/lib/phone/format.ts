// Telefonnummer-Aufbereitung für den Wähl-Link (PROJ-8).

/**
 * Bereinigt eine Telefonnummer für den Anruf-Link: führendes „+" (falls vorhanden)
 * plus alle Ziffern. Gibt null zurück, wenn keine Ziffer übrig bleibt
 * (dann ist die Nummer nicht wählbar).
 */
export function toDialNumber(raw: string | undefined | null): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const plus = trimmed.startsWith("+") ? "+" : "";
  const digits = trimmed.replace(/\D/g, "");
  if (!digits) return null;
  return plus + digits;
}
