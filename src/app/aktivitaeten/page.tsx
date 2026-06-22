import { Info } from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  ActivityList,
  type ActivityRow,
} from "@/components/activities/activity-list";

function offsetDate(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// Vorschau-Beispieldaten; im Backend-Schritt durch echte Aktivitäten ersetzt.
const SAMPLE: ActivityRow[] = [
  {
    id: "s1",
    customerId: "00000000-0000-0000-0000-000000000001",
    customerName: "Beispiel Müller GmbH",
    type: "Anruf",
    dueDate: offsetDate(-2),
    dueTime: "10:15",
    note: "030440320 anrufen, Angebot nachfassen",
    completedAt: null,
  },
  {
    id: "s2",
    customerId: "00000000-0000-0000-0000-000000000002",
    customerName: "Beispiel Schmidt KG",
    type: "Termin vor Ort",
    dueDate: offsetDate(0),
    dueTime: "14:00",
    completedAt: null,
  },
  {
    id: "s3",
    customerId: "00000000-0000-0000-0000-000000000003",
    customerName: "Beispiel Restaurant Adler",
    type: "Nachfassen",
    dueDate: offsetDate(3),
    completedAt: null,
  },
];

export default function AktivitaetenPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-foreground">Aktivitäten</h1>
          <p className="text-sm text-muted-foreground">
            Alle offenen Aktivitäten nach Fälligkeit – überfällig zuerst.
          </p>
        </div>

        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Vorschau-Modus</AlertTitle>
          <AlertDescription>
            Hier siehst du Beispiel-Aktivitäten. Im nächsten Schritt (Backend)
            werden die echten Aktivitäten geladen und die Board-Marker
            aktiviert.
          </AlertDescription>
        </Alert>

        <ActivityList initialRows={SAMPLE} />
      </div>
    </AppShell>
  );
}
