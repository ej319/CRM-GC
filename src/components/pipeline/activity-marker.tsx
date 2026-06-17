import { TriangleAlert } from "lucide-react";

import type { ActivityStatus } from "@/lib/pipeline/data";

const DOT: Record<
  Exclude<ActivityStatus, "none">,
  { color: string; label: string }
> = {
  today: { color: "bg-green-500", label: "Heute fällige Aktivität" },
  future: { color: "bg-slate-400", label: "Zukünftige Aktivität geplant" },
  overdue: { color: "bg-red-500", label: "Verpasste Aktivität" },
};

/**
 * Aktivitäts-Marker auf der Kundenkarte.
 * Echte Datenquelle (Aktivitäten) kommt in PROJ-5; bis dahin meist "none".
 */
export function ActivityMarker({ status }: { status: ActivityStatus }) {
  if (status === "none") {
    return (
      <TriangleAlert
        className="h-4 w-4 text-amber-500"
        aria-label="Keine Aktivität geplant"
      />
    );
  }
  const dot = DOT[status];
  return (
    <span
      className={`inline-block h-2.5 w-2.5 rounded-full ${dot.color}`}
      title={dot.label}
      aria-label={dot.label}
    />
  );
}
