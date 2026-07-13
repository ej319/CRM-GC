// Typen, Regel-Metadaten und reine Helfer für die Pipeline-Automatik (PROJ-10).

export type RuleKey = "angebot_sent_to_nachfassen" | "inbound_email_to_lead";

export interface RuleMeta {
  key: RuleKey;
  title: string;
  description: string;
  /** false = geplant/noch nicht wirksam (z. B. eingehende Mails, Phase 2). */
  active: boolean;
}

/** Beschreibung der eingebauten Automatik-Regeln (für die Automatik-Seite). */
export const RULES: RuleMeta[] = [
  {
    key: "angebot_sent_to_nachfassen",
    title: "Angebot verschickt → Nachfassen",
    description:
      "Wird eine E-Mail mit der Vorlage 'Angebot' gesendet, wandert der Kunde automatisch in die Phase 'Nachfassen' und es wird eine Aktivität 'Nachfassen' 2 Werktage später angelegt.",
    active: true,
  },
  {
    key: "inbound_email_to_lead",
    title: "Eingehende Anfrage-Mail → neuer Lead (geplant)",
    description:
      "Kommt eine E-Mail mit passendem Label/Betreff, wird automatisch ein Kunde in 'Anfrage' angelegt und eine Aktivität 'Anruf' für denselben Tag erstellt. Braucht Gmail-Lesezugriff + regelmäßigen Prüf-Dienst (nächste Phase).",
    active: false,
  },
];

/** Erkennt die Angebot-Vorlage anhand des Namens (unabhängig von Groß/Klein). */
export function isAngebotTemplate(name?: string): boolean {
  return (name ?? "").trim().toLowerCase() === "angebot";
}

/**
 * Addiert n Werktage (Mo–Fr) zu einem Datum "YYYY-MM-DD" und gibt "YYYY-MM-DD"
 * zurück. Feiertage werden nicht berücksichtigt (MVP). Reine Funktion.
 */
export function addWorkingDays(dateStr: string, n: number): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  let added = 0;
  while (added < n) {
    dt.setUTCDate(dt.getUTCDate() + 1);
    const dow = dt.getUTCDay(); // 0 = So, 6 = Sa
    if (dow !== 0 && dow !== 6) added++;
  }
  const yy = dt.getUTCFullYear();
  const mm = String(dt.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(dt.getUTCDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}
